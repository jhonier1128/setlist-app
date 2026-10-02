import { randomBytes } from "crypto";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { passwordResetTokens, users } from "@/db/schema";
import { ensureSchema, friendlyDbError } from "@/lib/ensureSchema";
import { mailStatus, sendResetEmail } from "@/lib/mailer";

export const dynamic = "force-dynamic";

const MINUTES = 60;

function baseUrl(req: Request): string {
  const envUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL;
  if (envUrl) return envUrl.replace(/\/$/, "");
  const proto = req.headers.get("x-forwarded-proto") ?? "http";
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  if (host) return `${proto}://${host}`;
  return new URL(req.url).origin;
}

export async function POST(req: Request) {
  try {
    await ensureSchema();
  } catch (err) {
    console.error("[forgot/ensureSchema]", err);
    return Response.json({ error: friendlyDbError(err) }, { status: 500 });
  }

  const body = await req.json().catch(() => null);
  const email = String(body?.email ?? "").trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(email))
    return Response.json({ error: "Escribe un correo válido" }, { status: 400 });

  const status = mailStatus();

  try {
    const rows = await db.select().from(users).where(eq(users.email, email)).limit(1);
    const user = rows[0];

    // No revelamos si el correo existe o no (evita enumerar cuentas).
    if (!user) {
      return Response.json({
        ok: true,
        delivered: false,
        provider: status.provider,
        message:
          "Si ese correo está registrado, te enviamos un enlace para crear una nueva contraseña. Revisa también tu carpeta de spam.",
      });
    }

    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + MINUTES * 60 * 1000);
    await db.insert(passwordResetTokens).values({ token, userId: user.id, expiresAt });

    const link = `${baseUrl(req)}/restablecer?token=${token}`;
    const mail = await sendResetEmail(email, link, MINUTES);

    if (mail.delivered) {
      return Response.json({
        ok: true,
        delivered: true,
        provider: mail.provider,
        message: `Enviamos un enlace a ${email} para crear una nueva contraseña. Revisa tu bandeja y la carpeta de spam.`,
      });
    }

    // Sin proveedor de correo (o falló el envío): mostramos el enlace en pantalla.
    console.error("[forgot/mail]", mail.error);
    return Response.json({
      ok: true,
      delivered: false,
      provider: mail.provider,
      resetUrl: link,
      message:
        mail.provider === "ninguno"
          ? "El correo no está configurado en el servidor, así que abre tu enlace de recuperación aquí:"
          : "No pudimos enviar el correo, así que abre tu enlace de recuperación aquí:",
    });
  } catch (err) {
    console.error("[forgot]", err);
    return Response.json({ error: friendlyDbError(err) }, { status: 500 });
  }
}
