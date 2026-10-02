import bcrypt from "bcryptjs";
import { and, eq, gt, isNull } from "drizzle-orm";
import { db } from "@/db";
import { passwordResetTokens, sessions, users } from "@/db/schema";
import { ensureSchema, friendlyDbError } from "@/lib/ensureSchema";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    await ensureSchema();
  } catch (err) {
    console.error("[reset/ensureSchema]", err);
    return Response.json({ error: friendlyDbError(err) }, { status: 500 });
  }

  const body = await req.json().catch(() => null);
  const token = String(body?.token ?? "").trim();
  const password = String(body?.password ?? "");

  if (!token) return Response.json({ error: "Enlace inválido" }, { status: 400 });
  if (password.length < 6)
    return Response.json({ error: "La contraseña debe tener al menos 6 caracteres" }, { status: 400 });

  try {
    const rows = await db
      .select()
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.token, token),
          isNull(passwordResetTokens.usedAt),
          gt(passwordResetTokens.expiresAt, new Date()),
        ),
      )
      .limit(1);
    const record = rows[0];
    if (!record)
      return Response.json(
        { error: "El enlace no es válido o ya venció. Solicita uno nuevo." },
        { status: 400 },
      );

    const passwordHash = await bcrypt.hash(password, 10);
    await db.update(users).set({ passwordHash }).where(eq(users.id, record.userId));
    await db.update(passwordResetTokens).set({ usedAt: new Date() }).where(eq(passwordResetTokens.token, token));
    // Cierra todas las sesiones activas de ese usuario por seguridad.
    await db.delete(sessions).where(eq(sessions.userId, record.userId));

    return Response.json({ ok: true, message: "Contraseña actualizada. Ya puedes ingresar." });
  } catch (err) {
    console.error("[reset]", err);
    return Response.json({ error: friendlyDbError(err) }, { status: 500 });
  }
}
