import { createSession } from "@/lib/auth";
import { ensureDemoUser } from "@/lib/seed";
import { ensureSchema, friendlyDbError } from "@/lib/ensureSchema";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    await ensureSchema();
    const id = await ensureDemoUser();
    await createSession(id);
    return Response.json({ ok: true });
  } catch (err) {
    return Response.json({ error: friendlyDbError(err) }, { status: 500 });
  }
}
