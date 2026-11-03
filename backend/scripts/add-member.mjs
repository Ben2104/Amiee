// Creates (or links) one of our two logins and allow-lists it for the API.
//
//   MEMBER_PASSWORD='…' npm run db:add-member -- --name Ben  --email ben@example.com
//   MEMBER_PASSWORD='…' npm run db:add-member -- --name Amie --email amie@example.com
//
// If the email already has a Neon Auth account it is linked as-is (no password needed).
// Otherwise a new account is created through Neon Auth's sign-up endpoint, which only
// works while sign-up is enabled; see our-little-world/README.md for the exact steps.
import { parseArgs } from "node:util";
import { sqlClient } from "./lib.mjs";

const { values } = parseArgs({ options: { name: { type: "string" }, email: { type: "string" } } });
const name = values.name, email = (values.email || "").trim().toLowerCase();
if (!["Ben", "Amie"].includes(name) || !email.includes("@")) {
  console.error("Usage: npm run db:add-member -- --name Ben|Amie --email you@example.com");
  process.exit(2);
}
const sql = sqlClient();

let [user] = await sql.query(`select id from neon_auth."user" where lower(email) = $1`, [email]);
if (!user) {
  const password = process.env.MEMBER_PASSWORD;
  if (!password || password.length < 8) {
    console.error("No account yet for that email. Set MEMBER_PASSWORD (8+ characters) to create one.");
    process.exit(2);
  }
  const res = await fetch(`${process.env.NEON_AUTH_BASE_URL}/sign-up/email`, {
    method: "POST",
    headers: { "content-type": "application/json", origin: "http://localhost" },
    body: JSON.stringify({ email, password, name }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error(`Sign-up failed (${res.status}): ${body.message || JSON.stringify(body)}`);
    console.error("If sign-up is disabled, enable it for a minute:");
    console.error("  npx neonctl neon-auth config email-password update --disable-sign-up false");
    process.exit(1);
  }
  user = body.user;
  console.log(`Created Neon Auth account for ${email}`);
}

await sql.query(
  `insert into members (user_id, display_name) values ($1, $2)
   on conflict (display_name) do update set user_id = excluded.user_id`,
  [user.id, name],
);
console.log(`${name} can now sign in as ${email}.`);
