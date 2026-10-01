import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { createSession } from "@/lib/auth";
import { DEMO_EMAIL, ensureDemoUser } from "@/lib/seed";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const email = String(body?.email ?? "").trim().toLowerCase();
  const password = String(body?.password ?? "");
  if (email === DEMO_EMAIL) await ensureDemoUser();
  const rows = await db.select().from(users).where(eq(users.email, email)).limit(1);
  const u = rows[0];
  if (!u || !(await bcrypt.compare(password, u.passwordHash)))
    return Response.json({ error: "Correo o contraseña incorrectos" }, { status: 401 });
  await createSession(u.id);
  return Response.json({ ok: true });
}
