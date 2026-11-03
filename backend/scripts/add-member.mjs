// Creates (or links) a username login and allow-lists it for the API.
//
//   Shared login (whoever signs in picks Ben or Amie):
//     MEMBER_PASSWORD='…' npm run db:add-member -- --username ourname
//   Personal login (always writes as that person):
//     MEMBER_PASSWORD='…' npm run db:add-member -- --username ben123 --name Ben
//
// An existing account is linked as-is (no password needed). A new one is created
// through Neon Auth's sign-up endpoint, which only works while sign-up is enabled;
// see our-little-world/README.md for the exact steps.
import { parseArgs } from "node:util";
import { sqlClient } from "./lib.mjs";

const USERNAME_RE = /^[a-z0-9][a-z0-9._-]{2,31}$/;
const LOGIN_DOMAIN = "login.our-little-world.invalid"; // keep in sync with backend/api/auth.ts

const { values } = parseArgs({ options: { username: { type: "string" }, name: { type: "string" } } });
const username = (values.username || "").trim().toLowerCase(), name = values.name || null;
if (!USERNAME_RE.test(username) || (name && !["Ben", "Amie"].includes(name))) {
  console.error("Usage: npm run db:add-member -- --username <3-32 chars: a-z 0-9 . _ -> [--name Ben|Amie]");
  process.exit(2);
}
const email = `${username}@${LOGIN_DOMAIN}`;
const sql = sqlClient();

let [user] = await sql.query(`select id from neon_auth."user" where lower(email) = $1`, [email]);
if (!user) {
  const password = process.env.MEMBER_PASSWORD;
  if (!password || password.length < 8) {
    console.error("No account with that username yet. Set MEMBER_PASSWORD (8+ characters) to create one.");
    process.exit(2);
  }
  const res = await fetch(`${process.env.NEON_AUTH_BASE_URL}/sign-up/email`, {
    method: "POST",
    headers: { "content-type": "application/json", origin: "http://localhost" },
    body: JSON.stringify({ email, password, name: name || username }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error(`Sign-up failed (${res.status}): ${body.message || JSON.stringify(body)}`);
    console.error("If sign-up is disabled, enable it for a minute:");
    console.error("  npx neonctl neon-auth config email-password update --disable-sign-up false");
    process.exit(1);
  }
  user = body.user;
  console.log(`Created login "${username}"`);
}

await sql.query(
  `insert into members (user_id, display_name) values ($1, $2)
   on conflict (user_id) do update set display_name = excluded.display_name`,
  [user.id, name],
);
console.log(name ? `"${username}" signs in as ${name}.` : `"${username}" is a shared login: whoever signs in picks Ben or Amie.`);
