import { and, eq, isNull } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { passwordResets, sessions, users } from "@/db/schema";
import { dbError } from "@/lib/errors";
import { hashToken } from "@/lib/reset";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const token = String(body?.token ?? "").trim();
    const password = String(body?.password ?? "");

    if (!token) return Response.json({ error: "Falta el enlace de recuperación" }, { status: 400 });
    if (password.length < 6)
      return Response.json({ error: "La contraseña debe tener al menos 6 caracteres" }, { status: 400 });

    const rows = await db
      .select()
      .from(passwordResets)
      .where(and(eq(passwordResets.tokenHash, hashToken(token)), isNull(passwordResets.usedAt)))
      .limit(1);
    const reset = rows[0];

    if (!reset || reset.expiresAt.getTime() < Date.now())
      return Response.json(
        { error: "El enlace ya no es válido o expiró. Solicita uno nuevo." },
        { status: 400 },
      );

    const passwordHash = await bcrypt.hash(password, 10);
    await db.update(users).set({ passwordHash }).where(eq(users.id, reset.userId));
    await db.update(passwordResets).set({ usedAt: new Date() }).where(eq(passwordResets.tokenHash, reset.tokenHash));
    // Cierra todas las sesiones abiertas de ese usuario por seguridad.
    await db.delete(sessions).where(eq(sessions.userId, reset.userId));

    return Response.json({ ok: true, message: "Contraseña actualizada. Ya puedes iniciar sesión." });
  } catch (error) {
    const e = dbError(error);
    return Response.json({ error: e.error }, { status: e.status });
  }
}
