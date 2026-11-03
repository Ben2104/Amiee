// Applies backend/db/migrations/*.sql in order, once each.
// Usage (repo root):  npm run db:migrate
import { readdirSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { sqlClient } from "./lib.mjs";

const dir = join(dirname(fileURLToPath(import.meta.url)), "..", "db", "migrations");
const sql = sqlClient();

await sql.query(`create table if not exists schema_migrations (
  version text primary key, applied_at timestamptz not null default now())`);
const done = new Set((await sql.query("select version from schema_migrations")).map(r => r.version));

for (const file of readdirSync(dir).filter(f => f.endsWith(".sql")).sort()) {
  if (done.has(file)) { console.log(`= ${file} (already applied)`); continue; }
  const body = readFileSync(join(dir, file), "utf8");
  // One transaction per migration: the statements and the bookkeeping row commit together.
  const statements = body.split(/;\s*(?:\n|$)/).map(s => s.replace(/^\s*--.*$/gm, "").trim()).filter(Boolean);
  await sql.transaction([
    ...statements.map(s => sql.query(s)),
    sql.query("insert into schema_migrations (version) values ($1)", [file]),
  ]);
  console.log(`+ ${file} (${statements.length} statements)`);
}
console.log("Migrations up to date.");
