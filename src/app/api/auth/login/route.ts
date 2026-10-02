import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { createSession } from "@/lib/auth";
import { DEMO_EMAIL, ensureDemoUser } from "@/lib/seed";
import { ensureSchema, friendlyDbError } from "@/lib/ensureSchema";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    await ensureSchema();
  } catch (err) {
    console.error("[login/ensureSchema]", err);
    return Response.json({ error: friendlyDbError(err) }, { status: 500 });
  }

  const body = await req.json().catch(() => null);
  const email = String(body?.email ?? "").trim().toLowerCase();
  const password = String(body?.password ?? "");

  try {
    if (email === DEMO_EMAIL) await ensureDemoUser();
    const rows = await db.select().from(users).where(eq(users.email, email)).limit(1);
    const u = rows[0];
    if (!u) return Response.json({ error: "Ese correo no está registrado" }, { status: 401 });
    const ok = await bcrypt.compare(password, u.passwordHash);
    if (!ok) return Response.json({ error: "Correo o contraseña incorrectos" }, { status: 401 });
    await createSession(u.id);
    return Response.json({ ok: true });
  } catch (err) {
    console.error("[login]", err);
    return Response.json({ error: friendlyDbError(err) }, { status: 500 });
  }
}
