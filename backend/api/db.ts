import pg from "pg";
import { attachDatabasePool } from "@neon/functions";

// Return DATE and TIME columns as plain strings ("2026-07-11", "19:30:00"),
// so calendar days never shift with the server's time zone.
pg.types.setTypeParser(1082, (v) => v);
pg.types.setTypeParser(1083, (v) => v);

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not set");

// One small pool per isolate, reused across requests (Neon Functions guidance).
export const pool = new pg.Pool({ connectionString, max: 5 });
attachDatabasePool(pool);

export async function query<T = Record<string, unknown>>(text: string, params: unknown[] = []): Promise<T[]> {
  const res = await pool.query(text, params);
  return res.rows as T[];
}
