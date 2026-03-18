import { Pool } from "pg";
import type { QueryResultRow } from "pg";

let pool: Pool | null = null;

export function getDbPool() {
  if (pool) {
    return pool;
  }

  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured.");
  }

  pool = new Pool({ connectionString });
  return pool;
}

export async function dbQuery<T extends QueryResultRow>(
  queryText: string,
  values: unknown[] = [],
) {
  const currentPool = getDbPool();
  return currentPool.query<T>(queryText, values);
}
