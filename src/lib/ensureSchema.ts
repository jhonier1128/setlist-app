import { sql } from "drizzle-orm";
import { db } from "@/db";

/**
 * Crea el esquema de forma idempotente. Así un despliegue nuevo (Vercel + Neon,
 * Railway, Render, etc.) funciona en el primer intento aunque no se haya corrido
 * `npx drizzle-kit push` contra la base de datos de producción.
 */
const STATEMENTS = [
  // El nombre de la restricción debe coincidir con el que genera Drizzle
  // para que `npx drizzle-kit push` no intente recrearla.
  `CREATE TABLE IF NOT EXISTS users (
    id serial PRIMARY KEY,
    name text NOT NULL,
    email text NOT NULL,
    password_hash text NOT NULL,
    role text NOT NULL DEFAULT 'pianista',
    created_at timestamp NOT NULL DEFAULT now(),
    CONSTRAINT users_email_unique UNIQUE (email)
  )`,
  `CREATE TABLE IF NOT EXISTS sessions (
    token text PRIMARY KEY,
    user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at timestamp NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS password_reset_tokens (
    token text PRIMARY KEY,
    user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at timestamp NOT NULL,
    used_at timestamp,
    created_at timestamp NOT NULL DEFAULT now()
  )`,
  `CREATE INDEX IF NOT EXISTS password_reset_tokens_user_idx ON password_reset_tokens (user_id)`,
  `CREATE TABLE IF NOT EXISTS songs (
    id serial PRIMARY KEY,
    user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title text NOT NULL,
    artist text NOT NULL DEFAULT '',
    key_male text NOT NULL,
    key_female text NOT NULL,
    rhythm text NOT NULL DEFAULT 'Medio',
    bpm integer,
    notes text NOT NULL DEFAULT '',
    created_at timestamp NOT NULL DEFAULT now()
  )`,
  `CREATE INDEX IF NOT EXISTS songs_user_idx ON songs (user_id)`,
  `CREATE TABLE IF NOT EXISTS medleys (
    id serial PRIMARY KEY,
    user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name text NOT NULL,
    description text NOT NULL DEFAULT '',
    voice text NOT NULL DEFAULT 'male',
    base_key text NOT NULL,
    transpose integer NOT NULL DEFAULT 0,
    created_at timestamp NOT NULL DEFAULT now()
  )`,
  `CREATE INDEX IF NOT EXISTS medleys_user_idx ON medleys (user_id)`,
  `CREATE TABLE IF NOT EXISTS medley_songs (
    medley_id integer NOT NULL REFERENCES medleys(id) ON DELETE CASCADE,
    song_id integer NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
    position integer NOT NULL DEFAULT 0,
    CONSTRAINT medley_songs_medley_id_song_id_pk PRIMARY KEY (medley_id, song_id)
  )`,
];

const globalForSchema = globalThis as typeof globalThis & {
  __alabanzaSchemaReady?: Promise<void>;
};

export function ensureSchema(): Promise<void> {
  if (!globalForSchema.__alabanzaSchemaReady) {
    globalForSchema.__alabanzaSchemaReady = (async () => {
      for (const statement of STATEMENTS) {
        await db.execute(sql.raw(statement));
      }
    })().catch((err) => {
      // Permite reintentar en la siguiente petición si la BD estuvo ausente.
      globalForSchema.__alabanzaSchemaReady = undefined;
      throw err;
    });
  }
  return globalForSchema.__alabanzaSchemaReady;
}

type DbError = { code?: string; message?: string; cause?: unknown };

/**
 * Drizzle envuelve el error original de Postgres en `DrizzleQueryError` y el
 * código real queda en la cadena de `cause`. Hay que desanidarlo para poder
 * detectar, por ejemplo, un correo duplicado (23505).
 */
export function pgCode(err: unknown): string | undefined {
  let cur: unknown = err;
  for (let i = 0; i < 6 && cur && typeof cur === "object"; i++) {
    const code = (cur as DbError).code;
    if (code) return code;
    cur = (cur as DbError).cause;
  }
  return undefined;
}

/** Mensaje del error original, sin detalles internos como los parámetros SQL. */
function rootMessage(err: unknown): string {
  let cur: unknown = err;
  let msg = "";
  for (let i = 0; i < 6 && cur && typeof cur === "object"; i++) {
    const m = (cur as DbError).message;
    if (m) msg = m;
    cur = (cur as DbError).cause;
  }
  return msg.split("\nparams:")[0].trim();
}

/** Convierte un error de Postgres en un mensaje que el usuario puede corregir. */
export function friendlyDbError(err: unknown): string {
  const code = pgCode(err);
  const message = rootMessage(err);
  const e = { code, message } as DbError;
  switch (e.code) {
    case "42P01":
      return "La base de datos todavía no tiene las tablas creadas. Ejecuta “npx drizzle-kit push” o recarga en unos segundos.";
    case "28P01":
      return "Usuario o contraseña de la base de datos incorrectos (revisa DATABASE_URL).";
    case "3D000":
      return "La base de datos indicada en DATABASE_URL no existe.";
    case "ECONNREFUSED":
      return "No se pudo conectar a la base de datos. Verifica que esté encendida y que DATABASE_URL sea correcta.";
    case "ENOTFOUND":
      return "No se encontró el servidor de la base de datos. Revisa el host en DATABASE_URL.";
    case "53300":
      return "La base de datos alcanzó su límite de conexiones. Espera un momento e intenta de nuevo.";
    case "42710":
      return "La base de datos ya tiene esa estructura. No necesitas crear nada más.";
    default:
      if (e?.message?.includes("DATABASE_URL")) return "Falta la variable de entorno DATABASE_URL.";
      if (e?.message?.includes("password authentication") || e?.message?.includes("28P01"))
        return "Usuario o contraseña de la base de datos incorrectos. Revisa DATABASE_URL.";
      if (/SSL|ssl|TLS/.test(e.message ?? ""))
        return "La base de datos exige conexión segura: agrega ?sslmode=require al final de DATABASE_URL.";
      if (/too many connections|too many clients/i.test(e.message ?? ""))
        return "La base de datos alcanzó su límite de conexiones. Espera un momento e intenta de nuevo.";
      if (/fetch failed|ENOTFOUND|getaddrinfo/i.test(e.message ?? ""))
        return "No se encontró el servidor de la base de datos. Revisa el host en DATABASE_URL.";
      return `Error de base de datos: ${e.message || "desconocido"}`;
  }
}
