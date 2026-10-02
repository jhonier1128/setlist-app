import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { songs } from "@/db/schema";
import { getCurrentUser, unauthorized } from "@/lib/auth";
import { ensureSchema, friendlyDbError } from "@/lib/ensureSchema";
import { transposeKey } from "@/lib/music";
import { toSongDTO } from "@/lib/queries";
import { parseSongBody } from "@/lib/songInput";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, ctx: Ctx) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  const id = Number((await ctx.params).id);
  try {
    await ensureSchema();
  } catch (err) {
    console.error("[api/ensureSchema]", err);
    return Response.json({ error: friendlyDbError(err) }, { status: 500 });
  }
  const body = await req.json().catch(() => null);

  const found = await db
    .select()
    .from(songs)
    .where(and(eq(songs.id, id), eq(songs.userId, user.id)))
    .limit(1);
  if (!found[0]) return Response.json({ error: "No encontrada" }, { status: 404 });

  // Transpose both keys by N semitones
  if (body && typeof body.transpose === "number") {
    const n = Math.round(body.transpose);
    const [row] = await db
      .update(songs)
      .set({ keyMale: transposeKey(found[0].keyMale, n), keyFemale: transposeKey(found[0].keyFemale, n) })
      .where(eq(songs.id, id))
      .returning();
    return Response.json(toSongDTO(row));
  }

  const { error, data } = parseSongBody(body, true);
  if (error) return Response.json({ error }, { status: 400 });
  if (Object.keys(data).length === 0) return Response.json(toSongDTO(found[0]));
  const [row] = await db.update(songs).set(data).where(eq(songs.id, id)).returning();
  return Response.json(toSongDTO(row));
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
  await db.delete(songs).where(and(eq(songs.id, id), eq(songs.userId, user.id)));
  return Response.json({ ok: true });
}
