// Our bunny, shared: one row in `pet` that both of our phones read (every few seconds)
// and change through small actions. Each action is a single UPDATE, so a hug from one
// phone and a treat from the other at the same moment both count.
import { query } from "./db";
import { ValidationError } from "./resources";

export const OUTFITS = ["none", "princess", "carrot", "tartan"] as const;
export const SEASONS = ["auto", "spring", "summer", "autumn", "winter"] as const;
export const TREATS: Record<string, { food: number; love: number }> = {
  carrot: { food: 26, love: 3 },
  strawberry: { food: 18, love: 8 },
  matcha: { food: 22, love: 6 },
};
const TREAT_KEYS = Object.keys(TREATS);
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const CLIENT_RE = /^[A-Za-z0-9_-]{1,40}$/;

// Hours since `t` (at most 60 days), and food / love brought up to now:
// about a day from full to empty, the same rate the page uses.
const HOURS = "least(1440, greatest(0, extract(epoch from (now() - t)) / 3600))";
const FOOD_NOW = `greatest(0, food - ${HOURS} * 4)`;
const LOVE_NOW = `greatest(0, love - ${HOURS} * 3)`;

const SELECT = `name, food, love, (extract(epoch from t) * 1000)::float8 as t_ms, hugs, treats, next_treat, outfit, season,
  to_char(since, 'YYYY-MM-DD') as since, to_char(ann_date, 'YYYY-MM-DD') as ann_date, ann_monthly,
  last_hug_by, (extract(epoch from last_hug_at) * 1000)::float8 as last_hug_ms,
  last_feed_by, (extract(epoch from last_feed_at) * 1000)::float8 as last_feed_ms, last_feed_kind,
  rev::text as rev, last_action, last_kind, last_by, last_client`;

type Row = {
  name: string; food: number; love: number; t_ms: number; hugs: number; treats: number; next_treat: number;
  outfit: string; season: string; since: string; ann_date: string | null; ann_monthly: boolean;
  last_hug_by: string | null; last_hug_ms: number | null; last_feed_by: string | null; last_feed_ms: number | null;
  last_feed_kind: string | null; rev: string; last_action: string; last_kind: string; last_by: string | null; last_client: string;
};

/** The shape the page keeps in `petState` (plus rev and what happened last). */
export function toState(r: Row) {
  return {
    name: r.name, food: Number(r.food), love: Number(r.love), t: Math.round(r.t_ms), hugs: r.hugs, treats: r.treats,
    nextTreat: r.next_treat, outfit: r.outfit, season: r.season, since: r.since,
    anniversary: r.ann_date ? { date: r.ann_date, monthly: r.ann_monthly } : null,
    lastHug: r.last_hug_ms ? { by: r.last_hug_by || "", at: Math.round(r.last_hug_ms) } : null,
    lastFeed: r.last_feed_ms ? { by: r.last_feed_by || "", at: Math.round(r.last_feed_ms), kind: r.last_feed_kind || "carrot" } : null,
    rev: Number(r.rev), last: { action: r.last_action, kind: r.last_kind, by: r.last_by || "", client: r.last_client },
  };
}

export async function getPet() {
  let [row] = await query<Row>(`select ${SELECT} from pet where id = 1`);
  if (!row) {
    await query("insert into pet (id) values (1) on conflict (id) do nothing");
    [row] = await query<Row>(`select ${SELECT} from pet where id = 1`);
  }
  return toState(row);
}

const num = (v: unknown, name: string, lo: number, hi: number) => {
  const n = Number(v);
  if (typeof v !== "number" || !Number.isFinite(n) || n < lo || n > hi) throw new ValidationError(`${name} is not valid`);
  return n;
};

/**
 * Apply one action and return the new state. `full: true` means she was too full for a treat.
 * Actions: hug, pat, feed {kind}, wear {outfit}, rename {name}, season {season},
 * anniversary {date, monthly}, and seed {state} (copies a phone's saved bunny into a brand-new row).
 */
export async function petAction(body: Record<string, unknown>, by: string) {
  const type = body.type;
  const client = typeof body.client === "string" && CLIENT_RE.test(body.client) ? body.client : "";
  // Every action bumps rev and records who did what, so the other phone can play it.
  const stamp = (kind: string) => ({ sql: "rev = rev + 1, last_action = $1, last_kind = $2, last_by = $3, last_client = $4, updated_at = now()", params: [type, kind, by, client] });
  const run = async (sets: string, params: unknown[], kind = "", where = "") => {
    const s = stamp(kind);
    const rows = await query<Row>(
      `update pet set ${sets ? sets + ", " : ""}${s.sql} where id = 1${where} returning ${SELECT}`,
      [...s.params, ...params],
    );
    return rows[0] ? toState(rows[0]) : null;
  };
  await query("insert into pet (id) values (1) on conflict (id) do nothing");

  switch (type) {
    case "hug":
      return { state: await run(`love = least(100, ${LOVE_NOW} + 18), food = ${FOOD_NOW}, t = now(), hugs = hugs + 1, last_hug_by = $3, last_hug_at = now()`, []) };
    case "pat":
      return { state: await run(`love = least(100, ${LOVE_NOW} + 2), food = ${FOOD_NOW}, t = now()`, []) };
    case "feed": {
      const kind = String(body.kind);
      const tr = TREATS[kind];
      if (!tr) throw new ValidationError("That treat isn't on the menu");
      const state = await run(
        `food = least(100, ${FOOD_NOW} + $5), love = least(100, ${LOVE_NOW} + $6), t = now(), treats = treats + 1,
         last_feed_by = $3, last_feed_at = now(), last_feed_kind = $2, next_treat = $7`,
        [tr.food, tr.love, (TREAT_KEYS.indexOf(kind) + 1) % TREAT_KEYS.length], kind, ` and ${FOOD_NOW} < 95`,
      );
      return state ? { state } : { state: await getPet(), full: true };
    }
    case "wear": {
      const outfit = String(body.outfit);
      if (!(OUTFITS as readonly string[]).includes(outfit)) throw new ValidationError("That outfit isn't in the wardrobe");
      return { state: await run("outfit = $5", [outfit], outfit) };
    }
    case "rename": {
      const name = typeof body.name === "string" ? body.name.trim() : "";
      if (!name || name.length > 24) throw new ValidationError("Her name needs 1 to 24 characters");
      return { state: await run("name = $5", [name]) };
    }
    case "season": {
      const season = String(body.season);
      if (!(SEASONS as readonly string[]).includes(season)) throw new ValidationError("That isn't a season");
      return { state: await run("season = $5", [season], season) };
    }
    case "anniversary": {
      const date = String(body.date);
      if (!DATE_RE.test(date)) throw new ValidationError("Pick the day we started");
      return { state: await run("ann_date = $5::date, ann_monthly = $6", [date, body.monthly !== false]) };
    }
    case "seed": {
      // Only for a row nobody has touched yet (rev 0): keep the bunny one of us already raised.
      const s = (body.state && typeof body.state === "object" ? body.state : {}) as Record<string, unknown>;
      const outfit = (OUTFITS as readonly string[]).includes(String(s.outfit)) ? String(s.outfit) : "none";
      const name = typeof s.name === "string" ? s.name.trim().slice(0, 24) : "";
      const since = typeof s.since === "string" && DATE_RE.test(s.since) ? s.since : null;
      const state = await run(
        "name = $5, food = $6, love = $7, hugs = $8, treats = $9, outfit = $10, since = coalesce($11::date, since), t = now()",
        [name, num(s.food ?? 72, "food", 0, 100), num(s.love ?? 72, "love", 0, 100),
          Math.floor(num(s.hugs ?? 0, "hugs", 0, 1e7)), Math.floor(num(s.treats ?? 0, "treats", 0, 1e7)), outfit, since],
        "", " and rev = 0",
      );
      return { state: state || (await getPet()) };
    }
    default:
      throw new ValidationError("Unknown action");
  }
}
