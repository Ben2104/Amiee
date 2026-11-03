// End-to-end check against the deployed API (real Neon Auth, Postgres and Object Storage).
//   E2E_USERNAME=… E2E_PASSWORD=… npm run test:e2e
// Uses the shared login twice: once signed in as Ben, once as Amie.
// Every row and photo it creates is deleted again before it exits.
import { deflateSync } from "node:zlib";
import { loadEnv } from "./lib.mjs";

loadEnv();
const API = (process.env.API_URL || process.env.NEON_FUNCTION_API_BASE_URL || "").replace(/\/$/, "");
if (!API) throw new Error("Set API_URL or NEON_FUNCTION_API_BASE_URL");
let passed = 0;
const created = []; // [path, token] to clean up if a check fails part-way
function ok(cond, msg) {
  if (!cond) { console.error(`✗ ${msg}`); throw new Error(msg); }
  passed++; console.log(`✓ ${msg}`);
}
process.on("uncaughtException", async (err) => {
  for (const [path, token] of created) await call("DELETE", path, { token }).catch(() => {});
  if (created.length) console.error(`(cleaned up ${created.length} test rows)`);
  console.error(err.message);
  process.exit(1);
});
// token is a JWT string, or { t, who } for a session signed in as Ben or Amie.
// (Two sign-ins of the same login in the same second get the identical JWT.)
async function call(method, path, { token, body, raw, type, author } = {}) {
  const headers = {};
  const jwt = token && typeof token === "object" ? token.t : token;
  if (jwt) headers.authorization = `Bearer ${jwt}`;
  const who = author === undefined ? token && token.who : author;
  if (who) headers["x-author"] = who;
  if (body !== undefined) headers["content-type"] = "application/json";
  if (raw) headers["content-type"] = type;
  const res = await fetch(API + path, { method, headers, body: raw ?? (body !== undefined ? JSON.stringify(body) : undefined) });
  const ct = res.headers.get("content-type") || "";
  const data = res.status === 204 ? null : ct.includes("json") ? await res.json() : new Uint8Array(await res.arrayBuffer());
  return { status: res.status, data, type: ct };
}
function png(w, h, rgb) { // a real, tiny PNG
  const crcT = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
  const crc = b => { let c = ~0; for (const x of b) c = crcT[(c ^ x) & 255] ^ (c >>> 8); return (~c) >>> 0; };
  const chunk = (t, d) => { const b = Buffer.alloc(12 + d.length); b.writeUInt32BE(d.length); b.write(t, 4); d.copy(b, 8); b.writeUInt32BE(crc(b.subarray(4, 8 + d.length)), 8 + d.length); return b; };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 2;
  const rows = Buffer.concat(Array.from({ length: h }, () => Buffer.from([0, ...Array(w).fill(rgb).flat()])));
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", ihdr), chunk("IDAT", deflateSync(rows)), chunk("IEND", Buffer.alloc(0))]);
}

const need = k => { if (!process.env[k]) throw new Error(`Set ${k}`); return process.env[k]; };

// ── signed out ──
for (const p of ["/content", "/letters", "/milestones", "/notes", "/events", "/photos/00000000-0000-0000-0000-000000000000.jpg"]) {
  const r = await call("GET", p);
  ok(r.status === 401, `signed-out GET ${p} is refused (401)`);
}
ok((await call("POST", "/letters", { body: { title: "x", body: "y" } })).status === 401, "signed-out POST /letters is refused (401)");
ok((await call("GET", "/letters", { token: "not-a-jwt" })).status === 401, "a forged token is refused (401)");
const USER = need("E2E_USERNAME"), PASS = need("E2E_PASSWORD");
ok((await call("POST", "/auth/sign-in", { body: { username: USER, password: "wrong-password-123", as: "Ben" } })).status === 401, "wrong password is refused (401)");
ok((await call("POST", "/auth/sign-in", { body: { username: "nobody-here", password: PASS, as: "Ben" } })).status === 401, "unknown username is refused (401)");
ok((await call("POST", "/auth/sign-in", { body: { username: USER, password: PASS } })).status === 400, "the shared login must say who is signing in (400)");
ok((await call("POST", "/auth/sign-in", { body: { username: USER, password: PASS, as: "Stranger" } })).status === 400, "only Ben or Amie can be chosen (400)");

// ── sign in as both of us ──
const ben = await call("POST", "/auth/sign-in", { body: { username: USER.toUpperCase(), password: PASS, as: "Ben" } });
ok(ben.status === 200 && ben.data.member.name === "Ben" && ben.data.accessToken, "Ben signs in with the username (case-insensitive)");
const amie = await call("POST", "/auth/sign-in", { body: { username: USER, password: PASS, as: "Amie" } });
ok(amie.status === 200 && amie.data.member.name === "Amie", "Amie signs in with the same username");
const B = { t: ben.data.accessToken, who: "Ben" }, A = { t: amie.data.accessToken, who: "Amie" };
ok((await call("GET", "/me", { token: B })).data.name === "Ben", "GET /me knows who is signed in");
ok((await call("POST", "/notes", { token: B, author: null, body: { text: "x" } })).status === 400, "a write without saying who wrote it is rejected (400)");
ok((await call("POST", "/notes", { token: B, author: "Stranger", body: { text: "x" } })).status === 400, "a write as anyone but Ben or Amie is rejected (400)");

// ── CRUD for every content type ──
const cases = {
  letters: { create: { title: "E2E letter", body: "Dear Amie,\nhello.", date: "2026-11-03" }, update: { title: "E2E letter (edited)", date: null }, bad: { title: "" } },
  milestones: { create: { date: "2026-07-11", title: "E2E milestone", caption: "first" }, update: { caption: "edited caption" }, bad: { date: "2026-02-30", title: "x" } },
  notes: { create: { text: "E2E: your laugh" }, update: { text: "E2E: your laugh, edited" }, bad: { text: "x".repeat(501) } },
  events: { create: { title: "E2E picnic", date: "2026-12-24", time: "18:30", location: "the park", kind: "food" }, update: { done: true, kind: "celebration" }, bad: { title: "t", kind: "party" } },
};
for (const [name, c] of Object.entries(cases)) {
  const made = await call("POST", `/${name}`, { token: B, body: c.create });
  ok(made.status === 201 && made.data.author === "Ben", `${name}: Ben creates one (author shown as Ben)`);
  const id = made.data.id;
  created.push([`/${name}/${id}`, B]);
  for (const [k, v] of Object.entries(c.create)) ok(made.data[k] === v, `${name}: ${k} saved as ${JSON.stringify(v)}`);
  const list = await call("GET", `/${name}`, { token: A });
  ok(list.data.some(r => r.id === id), `${name}: Amie reads it in the list`);
  const upd = await call("PATCH", `/${name}/${id}`, { token: A, body: c.update });
  ok(upd.status === 200 && Object.entries(c.update).every(([k, v]) => upd.data[k] === v), `${name}: Amie edits it`);
  ok((await call("POST", `/${name}`, { token: B, body: c.bad })).status === 400, `${name}: invalid input is rejected (400)`);
  ok((await call("PATCH", `/${name}/${id}`, { body: c.update })).status === 401, `${name}: signed-out edit is refused`);
  ok((await call("DELETE", `/${name}/${id}`)).status === 401, `${name}: signed-out delete is refused`);
  ok((await call("DELETE", `/${name}/${id}`, { token: B })).status === 204, `${name}: Ben deletes it`);
  ok(!(await call("GET", `/${name}`, { token: B })).data.some(r => r.id === id), `${name}: it is gone`);
  ok((await call("DELETE", `/${name}/${id}`, { token: B })).status === 404, `${name}: deleting again is 404`);
}
const someday = await call("POST", "/events", { token: A, body: { title: "E2E someday trip", kind: "trip" } });
created.push([`/events/${someday.data.id}`, A]);
ok(someday.status === 201 && someday.data.date === null, "events: an undated idea is saved as someday");
ok((await call("POST", "/events", { token: A, body: { title: "x", time: "10:00" } })).status === 400, "events: a time without a date is rejected (400)");
await call("DELETE", `/events/${someday.data.id}`, { token: A });

// ── photos ──
const img = png(48, 32, [242, 167, 184]);
const fake = await call("POST", "/photos", { token: B, raw: Buffer.from("not an image at all"), type: "image/jpeg" });
ok(fake.status === 415, "photos: a non-image is rejected (415)");
ok((await call("POST", "/photos", { raw: img, type: "image/png" })).status === 401, "photos: signed-out upload is refused");
const up = await call("POST", "/photos", { token: B, raw: img, type: "image/png" });
ok(up.status === 201 && /^photos\/.+\.png$/.test(up.data.key), "photos: upload to the private bucket");
const file = up.data.key.slice("photos/".length);
const down = await call("GET", `/photos/${file}`, { token: A });
ok(down.status === 200 && down.type === "image/png" && Buffer.compare(Buffer.from(down.data), img) === 0, "photos: download returns the same bytes");
ok((await call("GET", `/photos/${file}`)).status === 401, "photos: signed-out download is refused");
const pubUrl = `${process.env.AWS_ENDPOINT_URL_S3}/photos/${up.data.key}`;
if (process.env.AWS_ENDPOINT_URL_S3) ok((await fetch(pubUrl)).status >= 400, "photos: the bucket itself is not publicly readable");
const ms = await call("POST", "/milestones", { token: B, body: { date: "2026-08-01", title: "E2E with photo", photoKey: up.data.key, photoAlt: "pink square" } });
created.push([`/milestones/${ms.data.id}`, B]);
ok(ms.status === 201 && ms.data.photoKey === up.data.key, "milestones: a milestone keeps its photo");
ok((await call("POST", "/milestones", { token: B, body: { date: "2026-08-01", title: "x", photoKey: "photos/00000000-0000-0000-0000-000000000000.jpg" } })).status === 400, "milestones: a photo that was never uploaded is rejected");
ok((await call("DELETE", `/photos/${file}`, { token: B })).status === 409, "photos: an in-use photo cannot be deleted directly");
ok((await call("DELETE", `/milestones/${ms.data.id}`, { token: B })).status === 204, "milestones: deleting it ...");
ok((await call("GET", `/photos/${file}`, { token: B })).status === 404, "... also deletes its photo from the bucket");

// ── content bundle, refresh and sign-out ──
const all = await call("GET", "/content", { token: A });
ok(all.status === 200 && ["letters", "milestones", "notes", "events"].every(k => Array.isArray(all.data[k])) && all.data.me.name === "Amie", "GET /content returns everything for the page");
const ref = await call("POST", "/auth/refresh", { body: { refreshToken: ben.data.refreshToken, as: "Ben" } });
ok(ref.status === 200 && ref.data.accessToken && ref.data.member.name === "Ben", "refresh mints a new access token");
ok((await call("POST", "/auth/sign-out", { body: { refreshToken: ref.data.refreshToken } })).status === 204, "Ben signs out");
ok((await call("POST", "/auth/refresh", { body: { refreshToken: ref.data.refreshToken } })).status === 401, "after sign-out the session cannot be refreshed");
await call("POST", "/auth/sign-out", { body: { refreshToken: amie.data.refreshToken } });
ok((await call("POST", "/auth/refresh", { body: { refreshToken: amie.data.refreshToken } })).status === 401, "Amie signs out too");

console.log(`\nAll ${passed} checks passed against ${API}`);
