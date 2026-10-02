import { db } from "@/db";
import { songs } from "@/db/schema";
import { getCurrentUser, unauthorized } from "@/lib/auth";
import { getSongs, toSongDTO } from "@/lib/queries";
import { ensureSchema, friendlyDbError } from "@/lib/ensureSchema";
import { parseSongBody } from "@/lib/songInput";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  return Response.json(await getSongs(user.id));
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  try {
    await ensureSchema();
  } catch (err) {
    console.error("[api/ensureSchema]", err);
    return Response.json({ error: friendlyDbError(err) }, { status: 500 });
  }
  const body = await req.json().catch(() => null);
  const { error, data } = parseSongBody(body);
  if (error) return Response.json({ error }, { status: 400 });
  const [row] = await db
    .insert(songs)
    .values({ ...(data as typeof songs.$inferInsert), userId: user.id })
    .returning();
  return Response.json(toSongDTO(row), { status: 201 });
}
