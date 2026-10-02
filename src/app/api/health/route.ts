import { db } from "@/db";
import { sql } from "drizzle-orm";
import { ensureSchema, friendlyDbError } from "@/lib/ensureSchema";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await ensureSchema();
    await db.execute(sql`select 1`);
    return Response.json({ ok: true, db: "conectada", tables: "listas" });
  } catch (err) {
    console.error("[health]", err);
    return Response.json(
      { ok: false, error: friendlyDbError(err), detail: (err as Error)?.message ?? String(err) },
      { status: 500 },
    );
  }
}
