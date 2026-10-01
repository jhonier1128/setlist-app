import { randomBytes } from "crypto";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { passwordResets, users } from "@/db/schema";
import { dbError } from "@/lib/errors";
import { mailStatus, sendPasswordResetEmail } from "@/lib/mailer";
import { hashToken, RESET_EXPIRES_MS } from "@/lib/reset";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const email = String(body?.email ?? "").trim().toLowerCase();

    if (!/^\S+@\S+\.\S+$/.test(email))
      return Response.json({ error: "Escribe un correo válido" }, { status: 400 });

    const rows = await db.select().from(users).where(eq(users.email, email)).limit(1);
    const user = rows[0];

    // Respuesta idéntica exista o no la cuenta, para no revelar quién está registrado.
    const generic = {
      ok: true,
      message:
        "Si el correo está registrado, recibirás un mensaje con el enlace para restablecer tu contraseña.",
      mail: mailStatus(),
    };

    if (!user) return Response.json(generic);

    // Invalida solicitudes anteriores pendientes de este usuario.
    await db
      .update(passwordResets)
      .set({ usedAt: new Date() })
      .where(and(eq(passwordResets.userId, user.id), isNull(passwordResets.usedAt)));

    const token = randomBytes(32).toString("hex");
    await db.insert(passwordResets).values({
      tokenHash: hashToken(token),
      userId: user.id,
      expiresAt: new Date(Date.now() + RESET_EXPIRES_MS),
    });

    const result = await sendPasswordResetEmail(user.email, user.name, token);

    // Solo en desarrollo se devuelve el enlace para poder probarlo sin SMTP.
    if (!result.sent && process.env.NODE_ENV !== "production") {
      return Response.json({ ...generic, previewLink: result.url });
    }
    return Response.json(generic);
  } catch (error) {
    const e = dbError(error);
    return Response.json({ error: e.error }, { status: e.status });
  }
}
