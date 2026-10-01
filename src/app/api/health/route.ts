import { db } from "@/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

const REQUIRED_TABLES = ["users", "sessions", "songs", "medleys", "medley_songs"];

export async function GET() {
  try {
    await db.execute(sql`select 1`);
    const res = await db.execute(sql`
      select table_name from information_schema.tables
      where table_schema = 'public'
    `);
    const present = new Set(
      (res.rows as { table_name: string }[]).map((r) => r.table_name.toLowerCase()),
    );
    const missing = REQUIRED_TABLES.filter((t) => !present.has(t));
    return Response.json({
      ok: missing.length === 0,
      db: true,
      tables: { missing, expected: REQUIRED_TABLES },
    }, { status: missing.length === 0 ? 200 : 500 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown";
    return Response.json(
      {
        ok: false,
        db: false,
        detail: message,
        hint: "Revisa la variable DATABASE_URL en Vercel (producción) y que la base de Neon acepte conexiones.",
      },
      { status: 500 },
    );
  }
}
