import { Hono, type Context } from "hono";
import { cors } from "hono/cors";
import { randomUUID } from "node:crypto";
import { query } from "./db";
import { AuthError, requireMember, signIn, refresh, signOut, type Member } from "./auth";
import { RESOURCES, ValidationError, parseBody, selectList, type Resource } from "./resources";
import { PHOTO_TYPES, PHOTO_KEY_RE, sniffMatches, putPhoto, getPhoto, deletePhoto, photoExists } from "./storage";

type Env = { Variables: { member: Member } };
const app = new Hono<Env>();

// ── CORS: only our own page origins (comma list; "*" wildcards allowed, e.g. http://localhost:*) ──
const allowed = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean)
  .map((p) => new RegExp("^" + p.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, "[^/]*") + "$"));
app.use(
  "*",
  cors({
    origin: (origin) => (origin && allowed.some((re) => re.test(origin)) ? origin : null),
    allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Authorization", "Content-Type"],
    maxAge: 600,
  }),
);
app.use("*", async (c, next) => {
  await next();
  c.header("Cache-Control", c.res.headers.get("Cache-Control") || "no-store");
  c.header("X-Content-Type-Options", "nosniff");
});

const clientIp = (c: Context) => c.req.header("x-forwarded-for")?.split(",")[0].trim();
const fail = (c: Context, status: number, error: string) => c.json({ error }, status as 400);

app.onError((err, c) => {
  if (err instanceof AuthError) return fail(c, err.status, err.message);
  if (err instanceof ValidationError) return fail(c, 400, err.message);
  // Postgres check / format violations are bad input, not server errors.
  const code = (err as { code?: string }).code;
  if (code === "23514" || code === "22P02" || code === "22007" || code === "22008") return fail(c, 400, "Some of those values aren't valid");
  console.error(err);
  return fail(c, 500, "Something went wrong on our side");
});

const VERSION = "2026-11-03.1";
app.get("/", (c) => c.json({ ok: true, service: "our-little-world-api", version: VERSION }));

// ── auth relay (see auth.ts for why) ──
// A tiny per-isolate brake on password guessing, on top of Neon Auth's own rate limit.
const attempts = new Map<string, number[]>();
function brake(ip: string) {
  const now = Date.now(), recent = (attempts.get(ip) || []).filter((t) => now - t < 10 * 60_000);
  if (recent.length >= 10) throw new AuthError(429, "Too many tries. Wait a few minutes and try again.");
  recent.push(now);
  attempts.set(ip, recent);
}
async function json(c: Context): Promise<Record<string, unknown>> {
  try {
    const body = await c.req.json();
    if (body && typeof body === "object" && !Array.isArray(body)) return body;
  } catch { /* fall through */ }
  throw new ValidationError("Expected a JSON object");
}
const str = (v: unknown, name: string, max = 600) => {
  if (typeof v !== "string" || !v || v.length > max) throw new ValidationError(`${name} is required`);
  return v;
};

app.post("/auth/sign-in", async (c) => {
  const ip = clientIp(c);
  brake(ip || "unknown");
  const body = await json(c);
  const out = await signIn(str(body.email, "email", 320).trim(), str(body.password, "password", 200), ip);
  return c.json({ accessToken: out.accessToken, refreshToken: out.refreshToken, member: { name: out.member.name } });
});
app.post("/auth/refresh", async (c) => {
  const body = await json(c);
  const out = await refresh(str(body.refreshToken, "refreshToken"), clientIp(c));
  return c.json({ accessToken: out.accessToken, refreshToken: out.refreshToken, member: { name: out.member.name } });
});
app.post("/auth/sign-out", async (c) => {
  const body = await json(c);
  if (typeof body.refreshToken === "string") await signOut(body.refreshToken, clientIp(c)).catch(() => {});
  return c.body(null, 204);
});

// ── everything below needs one of our two accounts ──
const needMember = async (c: Context<Env>, next: () => Promise<void>) => {
  c.set("member", await requireMember(c.req.header("authorization")));
  await next();
};
app.use("/me", needMember);
app.use("/content", needMember);
app.use("/photos/*", needMember);
app.use("/photos", needMember);
for (const name of Object.keys(RESOURCES)) {
  app.use(`/${name}`, needMember);
  app.use(`/${name}/*`, needMember);
}

app.get("/me", (c) => c.json({ name: c.get("member").name }));

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const listSql = (r: Resource) =>
  `select ${selectList(r)} from ${r.table} t join members m on m.user_id = t.author_id order by ${r.order}`;
const oneSql = (r: Resource) =>
  `select ${selectList(r)} from ${r.table} t join members m on m.user_id = t.author_id where t.id = $1`;

app.get("/content", async (c) => {
  const entries = await Promise.all(Object.entries(RESOURCES).map(async ([k, r]) => [k, await query(listSql(r))] as const));
  return c.json({ me: { name: c.get("member").name }, ...Object.fromEntries(entries) });
});

async function checkPhoto(values: Record<string, unknown>) {
  const key = values.photo_key;
  if (typeof key === "string" && !(await photoExists(key))) throw new ValidationError("That photo upload was not found");
}

for (const [name, r] of Object.entries(RESOURCES)) {
  app.get(`/${name}`, async (c) => c.json(await query(listSql(r))));

  app.post(`/${name}`, async (c) => {
    const values = parseBody(r, await json(c), "create");
    await checkPhoto(values);
    const cols = ["author_id", ...Object.keys(values)];
    const params = [c.get("member").userId, ...Object.values(values)];
    const [{ id }] = await query<{ id: string }>(
      `insert into ${r.table} (${cols.join(", ")}) values (${cols.map((_, i) => `$${i + 1}`).join(", ")}) returning id`,
      params,
    );
    const [row] = await query(oneSql(r), [id]);
    return c.json(row, 201);
  });

  app.patch(`/${name}/:id`, async (c) => {
    const id = c.req.param("id");
    if (!UUID_RE.test(id)) return fail(c, 404, "Not found");
    const values = parseBody(r, await json(c), "update");
    await checkPhoto(values);
    const old = "photo_key" in values
      ? (await query<{ photo_key: string | null }>(`select photo_key from ${r.table} where id = $1`, [id]))[0]
      : undefined;
    const sets = Object.keys(values).map((col, i) => `${col} = $${i + 2}`);
    const done = await query(
      `update ${r.table} set ${sets.join(", ")}, updated_at = now() where id = $1 returning id`,
      [id, ...Object.values(values)],
    );
    if (!done.length) return fail(c, 404, "Not found");
    if (old?.photo_key && old.photo_key !== values.photo_key) await deletePhoto(old.photo_key).catch(() => {});
    const [row] = await query(oneSql(r), [id]);
    return c.json(row);
  });

  app.delete(`/${name}/:id`, async (c) => {
    const id = c.req.param("id");
    if (!UUID_RE.test(id)) return fail(c, 404, "Not found");
    const hasPhoto = "photoKey" in r.fields;
    const rows = await query<{ photo_key?: string | null }>(
      `delete from ${r.table} where id = $1 returning ${hasPhoto ? "photo_key" : "id"}`,
      [id],
    );
    if (!rows.length) return fail(c, 404, "Not found");
    if (rows[0].photo_key) await deletePhoto(rows[0].photo_key).catch(() => {});
    return c.body(null, 204);
  });
}

// ── photos: private bucket, only served through this authenticated API ──
const MAX_PHOTO = 4 * 1024 * 1024;
app.post("/photos", async (c) => {
  const type = (c.req.header("content-type") || "").split(";")[0].trim().toLowerCase();
  const ext = PHOTO_TYPES[type];
  if (!ext) return fail(c, 415, "Photos must be JPEG, PNG or WebP");
  const declared = Number(c.req.header("content-length") || 0);
  if (declared > MAX_PHOTO) return fail(c, 413, "That photo is too large (max 4 MB)");
  const bytes = new Uint8Array(await c.req.arrayBuffer());
  if (!bytes.length) return fail(c, 400, "The photo was empty");
  if (bytes.length > MAX_PHOTO) return fail(c, 413, "That photo is too large (max 4 MB)");
  if (!sniffMatches(type, bytes)) return fail(c, 415, "That file is not the image type it claims to be");
  const key = `photos/${randomUUID()}.${ext}`;
  await putPhoto(key, bytes, type);
  return c.json({ key, size: bytes.length }, 201);
});

app.get("/photos/:file", async (c) => {
  const key = `photos/${c.req.param("file")}`;
  if (!PHOTO_KEY_RE.test(key)) return fail(c, 404, "Not found");
  const photo = await getPhoto(key);
  if (!photo) return fail(c, 404, "Not found");
  return c.body(photo.bytes as unknown as ArrayBuffer, 200, {
    "Content-Type": photo.type,
    // Keys are never reused, so a signed-in browser may keep its copy.
    "Cache-Control": "private, max-age=31536000, immutable",
  });
});

app.delete("/photos/:file", async (c) => {
  const key = `photos/${c.req.param("file")}`;
  if (!PHOTO_KEY_RE.test(key)) return fail(c, 404, "Not found");
  const [used] = await query("select 1 from milestones where photo_key = $1", [key]);
  if (used) return fail(c, 409, "That photo is still on a milestone");
  await deletePhoto(key);
  return c.body(null, 204);
});

app.notFound((c) => fail(c, 404, "Not found"));

export default app;
