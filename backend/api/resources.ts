// The four kinds of content, described once and served by generic CRUD routes.

type FieldType = "text" | "date" | "time" | "bool" | "enum" | "photo";
type Field = {
  col: string;
  type: FieldType;
  required?: boolean; // must be present and non-empty on create
  nullable?: boolean; // may be null / empty (stored as NULL)
  max?: number;
  values?: readonly string[];
};
export type Resource = { table: string; fields: Record<string, Field>; order: string };

export const EVENT_KINDS = ["date", "trip", "food", "home", "celebration", "other"] as const;

export const RESOURCES: Record<string, Resource> = {
  letters: {
    table: "letters",
    order: "t.letter_date desc nulls last, t.created_at desc",
    fields: {
      title: { col: "title", type: "text", required: true, max: 200 },
      body: { col: "body", type: "text", required: true, max: 20000 },
      date: { col: "letter_date", type: "date", nullable: true },
    },
  },
  milestones: {
    table: "milestones",
    order: "t.happened_on asc, t.created_at asc",
    fields: {
      date: { col: "happened_on", type: "date", required: true },
      title: { col: "title", type: "text", required: true, max: 200 },
      caption: { col: "caption", type: "text", max: 2000 },
      photoKey: { col: "photo_key", type: "photo", nullable: true },
      photoAlt: { col: "photo_alt", type: "text", max: 300 },
    },
  },
  notes: {
    table: "love_notes",
    order: "t.created_at asc",
    fields: { text: { col: "body", type: "text", required: true, max: 500 } },
  },
  events: {
    table: "events",
    order: "t.event_date asc nulls last, t.event_time asc nulls first, t.created_at asc",
    fields: {
      title: { col: "title", type: "text", required: true, max: 200 },
      date: { col: "event_date", type: "date", nullable: true },
      time: { col: "event_time", type: "time", nullable: true },
      location: { col: "location", type: "text", max: 200 },
      note: { col: "note", type: "text", max: 2000 },
      kind: { col: "kind", type: "enum", values: EVENT_KINDS },
      done: { col: "done", type: "bool" },
    },
  },
};

export class ValidationError extends Error {}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;
const PHOTO_RE = /^photos\/[0-9a-f-]{36}\.(jpg|png|webp)$/;

function realDate(s: string) {
  const [y, m, d] = s.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

function clean(name: string, f: Field, v: unknown): unknown {
  if (v === null || v === undefined || v === "") {
    if (f.type === "text" && !f.nullable && !f.required) return "";
    if (f.nullable) return null;
    throw new ValidationError(`${name} is required`);
  }
  switch (f.type) {
    case "text": {
      if (typeof v !== "string") throw new ValidationError(`${name} must be text`);
      const s = v.replace(/\r\n/g, "\n").trim();
      if (!s && f.required) throw new ValidationError(`${name} is required`);
      if (f.max && s.length > f.max) throw new ValidationError(`${name} is too long (max ${f.max})`);
      return s;
    }
    case "date":
      if (typeof v !== "string" || !DATE_RE.test(v) || !realDate(v)) throw new ValidationError(`${name} must be YYYY-MM-DD`);
      return v;
    case "time":
      if (typeof v !== "string" || !TIME_RE.test(v)) throw new ValidationError(`${name} must be HH:MM`);
      return v.slice(0, 5);
    case "bool":
      if (typeof v !== "boolean") throw new ValidationError(`${name} must be true or false`);
      return v;
    case "enum":
      if (typeof v !== "string" || !f.values!.includes(v)) throw new ValidationError(`${name} must be one of ${f.values!.join(", ")}`);
      return v;
    case "photo":
      if (typeof v !== "string" || !PHOTO_RE.test(v)) throw new ValidationError(`${name} is not a photo we uploaded`);
      return v;
  }
}

/** Validates a JSON body. On create every required field must be present; on update only given fields change. */
export function parseBody(r: Resource, body: unknown, mode: "create" | "update"): Record<string, unknown> {
  if (!body || typeof body !== "object" || Array.isArray(body)) throw new ValidationError("Expected a JSON object");
  const input = body as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(input)) if (!(key in r.fields)) throw new ValidationError(`Unknown field: ${key}`);
  for (const [name, f] of Object.entries(r.fields)) {
    if (!(name in input)) {
      if (mode === "create" && f.required) throw new ValidationError(`${name} is required`);
      continue;
    }
    out[f.col] = clean(name, f, input[name]);
  }
  if (mode === "update" && Object.keys(out).length === 0) throw new ValidationError("Nothing to update");
  return out;
}

/** select list that maps columns back to API field names, plus author and timestamps. */
export function selectList(r: Resource, alias = "t") {
  const cols = Object.entries(r.fields).map(([name, f]) =>
    f.type === "time" ? `to_char(${alias}.${f.col}, 'HH24:MI') as "${name}"` : `${alias}.${f.col} as "${name}"`,
  );
  return [`${alias}.id`, ...cols, `m.display_name as author`, `${alias}.created_at as "createdAt"`, `${alias}.updated_at as "updatedAt"`].join(", ");
}
