// Shared helpers for the one-off setup scripts.
// Scripts talk to Postgres over Neon's HTTPS SQL endpoint (@neondatabase/serverless),
// which also works from networks that block outbound port 5432.
// The deployed Function itself uses a pooled pg connection instead.
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { neon } from "@neondatabase/serverless";

export function loadEnv(file = ".env.local") {
  const path = resolve(process.cwd(), file);
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
    if (!m || process.env[m[1]] !== undefined) continue;
    process.env[m[1]] = m[2].replace(/^(['"])(.*)\1$/, "$2");
  }
}

export function sqlClient() {
  loadEnv();
  const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is missing: run `npx neonctl env pull` first");
  return neon(url);
}
