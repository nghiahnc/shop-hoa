import { Pool } from "pg";
import { attachDatabasePool } from "@vercel/functions";

declare global {
  // eslint-disable-next-line no-var
  var shopPool: Pool | undefined;
}

export function getPool(): Pool {
  if (!process.env.DATABASE_URL) throw new Error("Thiếu DATABASE_URL trong .env.local");
  if (!global.shopPool) {
    global.shopPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: process.env.VERCEL ? 5 : 10,
      idleTimeoutMillis: process.env.VERCEL ? 5000 : 30000,
      connectionTimeoutMillis: 20000,
    });
    global.shopPool.on('error', error => console.error('Postgres connection error', error.message));
    if (process.env.VERCEL) attachDatabasePool(global.shopPool);
  }
  return global.shopPool;
}
