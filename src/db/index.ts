import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

// Neon, Supabase y otros proveedores administrados exigen TLS, pero sus
// certificados no están siempre en el almacén del runtime serverless.
const needsTls =
  /sslmode=require|sslmode=prefer/.test(databaseUrl) ||
  (/localhost|127\.0\.0\.1/.test(databaseUrl) ? false : true);

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
};

export const pool =
  globalForDb.__arenaNextJsPostgresqlPool ??
  new Pool({
    connectionString: databaseUrl,
    ssl: needsTls ? { rejectUnauthorized: false } : undefined,
    max: 5,
    connectionTimeoutMillis: 15000,
    idleTimeoutMillis: 30000,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__arenaNextJsPostgresqlPool = pool;
}

export const db = drizzle(pool);
