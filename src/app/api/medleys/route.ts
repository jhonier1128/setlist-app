import { db } from "@/db";
import { medleys } from "@/db/schema";
import { getCurrentUser, unauthorized } from "@/lib/auth";
import { isValidKey } from "@/lib/music";
import { getMedleys } from "@/lib/queries";
import { ensureSchema, friendlyDbError } from "@/lib/ensureSchema";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  return Response.json(await getMedleys(user.id));
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
  const name = String(body?.name ?? "").trim();
  const voice = body?.voice === "female" ? "female" : "male";
  const baseKey = String(body?.baseKey ?? "");
  if (!name) return Response.json({ error: "El nombre es obligatorio" }, { status: 400 });
  if (!isValidKey(baseKey)) return Response.json({ error: "Tonalidad no válida" }, { status: 400 });
  const [row] = await db
    .insert(medleys)
    .values({
      userId: user.id,
      name: name.slice(0, 120),
      description: String(body?.description ?? "").slice(0, 500),
      voice,
      baseKey,
    })
    .returning();
  return Response.json(
    { id: row.id, name: row.name, description: row.description, voice, baseKey, transpose: 0, songs: [] },
    { status: 201 },
  );
}
