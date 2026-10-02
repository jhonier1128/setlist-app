import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { medleySongs, medleys, songs } from "@/db/schema";
import { getCurrentUser, unauthorized } from "@/lib/auth";
import { ensureSchema, friendlyDbError } from "@/lib/ensureSchema";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

async function owned(userId: number, id: number) {
  const r = await db
    .select()
    .from(medleys)
    .where(and(eq(medleys.id, id), eq(medleys.userId, userId)))
    .limit(1);
  return r[0] ?? null;
}

/**
 * PATCH body options:
 *  - { name?, description?, transpose? }   update metadata / transposition offset
 *  - { addSongId }                          append a song
 *  - { removeSongId }                       remove a song
 *  - { order: number[] }                    reorder songs
 */
export async function PATCH(req: Request, ctx: Ctx) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  const id = Number((await ctx.params).id);
  const m = await owned(user.id, id);
  if (!m) return Response.json({ error: "No encontrado" }, { status: 404 });
  const body = await req.json().catch(() => null);
  if (!body) return Response.json({ error: "Datos inválidos" }, { status: 400 });

  if (typeof body.addSongId === "number") {
    const s = await db
      .select({ id: songs.id })
      .from(songs)
      .where(and(eq(songs.id, body.addSongId), eq(songs.userId, user.id)))
      .limit(1);
    if (!s[0]) return Response.json({ error: "Canción no encontrada" }, { status: 404 });
    const current = await db.select().from(medleySongs).where(eq(medleySongs.medleyId, id));
    if (!current.some((c) => c.songId === body.addSongId)) {
      await db.insert(medleySongs).values({
        medleyId: id,
        songId: body.addSongId,
        position: current.length ? Math.max(...current.map((c) => c.position)) + 1 : 0,
      });
    }
    return Response.json({ ok: true });
  }

  if (typeof body.removeSongId === "number") {
    await db
      .delete(medleySongs)
      .where(and(eq(medleySongs.medleyId, id), eq(medleySongs.songId, body.removeSongId)));
    return Response.json({ ok: true });
  }

  if (Array.isArray(body.order)) {
    const order: number[] = body.order.map(Number).filter(Number.isFinite);
    await db.transaction(async (tx) => {
      for (let i = 0; i < order.length; i++) {
        await tx
          .update(medleySongs)
          .set({ position: i })
          .where(and(eq(medleySongs.medleyId, id), eq(medleySongs.songId, order[i])));
      }
    });
    return Response.json({ ok: true });
  }

  const patch: Partial<typeof medleys.$inferInsert> = {};
  if (body.name !== undefined) {
    const n = String(body.name).trim();
    if (!n) return Response.json({ error: "El nombre es obligatorio" }, { status: 400 });
    patch.name = n.slice(0, 120);
  }
  if (body.description !== undefined) patch.description = String(body.description).slice(0, 500);
  if (typeof body.transpose === "number") patch.transpose = ((Math.round(body.transpose) % 12) + 12) % 12;
  if (Object.keys(patch).length) await db.update(medleys).set(patch).where(eq(medleys.id, id));
  return Response.json({ ok: true });
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  const id = Number((await ctx.params).id);
  try {
    await ensureSchema();
  } catch (err) {
    console.error("[api/ensureSchema]", err);
    return Response.json({ error: friendlyDbError(err) }, { status: 500 });
  }
  await db.delete(medleys).where(and(eq(medleys.id, id), eq(medleys.userId, user.id)));
  return Response.json({ ok: true });
}
