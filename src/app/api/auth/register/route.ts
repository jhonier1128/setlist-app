import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { createSession } from "@/lib/auth";
import { seedUserData } from "@/lib/seed";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const name = String(body?.name ?? "").trim();
  const email = String(body?.email ?? "").trim().toLowerCase();
  const password = String(body?.password ?? "");
  const role = ["pianista", "vocalista", "director"].includes(body?.role) ? body.role : "pianista";
  const withDemo = body?.withDemo !== false;

  if (name.length < 2) return Response.json({ error: "Escribe tu nombre" }, { status: 400 });
  if (!/^\S+@\S+\.\S+$/.test(email)) return Response.json({ error: "Correo no válido" }, { status: 400 });
  if (password.length < 6)
    return Response.json({ error: "La contraseña debe tener al menos 6 caracteres" }, { status: 400 });

  const exists = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (exists[0]) return Response.json({ error: "Ese correo ya está registrado" }, { status: 409 });

  const passwordHash = await bcrypt.hash(password, 10);
  const [u] = await db.insert(users).values({ name, email, passwordHash, role }).returning();
  if (withDemo) await seedUserData(u.id);
  await createSession(u.id);
  return Response.json({ ok: true });
}
