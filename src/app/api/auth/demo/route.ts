import { createSession } from "@/lib/auth";
import { dbError } from "@/lib/errors";
import { ensureDemoUser } from "@/lib/seed";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const id = await ensureDemoUser();
    await createSession(id);
    return Response.json({ ok: true });
  } catch (error) {
    const e = dbError(error);
    return Response.json({ error: e.error }, { status: e.status });
  }
}
