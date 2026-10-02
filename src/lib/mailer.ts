/**
 * Envío de correo para recuperar la contraseña.
 *
 * Soporta dos proveedores, configurados con variables de entorno:
 *  1. Resend  -> RESEND_API_KEY  (recomendado en Vercel, sin SMTP)
 *  2. SMTP    -> SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
 *             (atajo para Gmail: GMAIL_USER + GMAIL_APP_PASSWORD)
 *
 * MAIL_FROM define el remitente (ej. "Alabanza Manager <no@tudominio.com>").
 * Si no hay ninguno configurado, mailStatus() lo indica y la app muestra el
 * enlace de recuperación directamente en pantalla para no bloquear al usuario.
 */

type MailResult = { delivered: boolean; provider: string; error?: string };

export function mailStatus(): { configured: boolean; provider: string; from: string } {
  const from = process.env.MAIL_FROM || "Alabanza Manager <onboarding@resend.dev>";
  if (process.env.RESEND_API_KEY) return { configured: true, provider: "resend", from };
  if (process.env.SMTP_HOST && process.env.SMTP_USER) return { configured: true, provider: "smtp", from };
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD)
    return { configured: true, provider: "gmail", from: `Alabanza Manager <${process.env.GMAIL_USER}>` };
  return { configured: false, provider: "ninguno", from };
}

function template(link: string, minutes: number) {
  return `<!doctype html>
<html><body style="margin:0;padding:24px;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;color:#0f172a">
  <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:16px;padding:32px">
    <p style="margin:0;font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#6366f1">Alabanza Manager</p>
    <h1 style="margin:12px 0 8px;font-size:22px">Recupera tu contraseña</h1>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#475569">
      Recibimos una solicitud para restablecer tu contraseña. Pulsa el botón de abajo para crear una nueva.
    </p>
    <a href="${link}" style="display:inline-block;background:#4f46e5;color:#ffffff;text-decoration:none;padding:13px 22px;border-radius:10px;font-weight:bold;font-size:15px">
      Crear nueva contraseña
    </a>
    <p style="margin:22px 0 0;font-size:13px;line-height:1.6;color:#64748b">
      Si el botón no funciona, copia y pega este enlace en tu navegador:<br>
      <span style="word-break:break-all;color:#4f46e5">${link}</span>
    </p>
    <p style="margin:18px 0 0;font-size:13px;color:#64748b">
      Este enlace vence en ${minutes} minutos y solo se puede usar una vez. Si no fuiste tú, ignora este correo.
    </p>
  </div>
</body></html>`;
}

export async function sendResetEmail(to: string, link: string, minutes = 60): Promise<MailResult> {
  const status = mailStatus();
  const subject = "Recupera tu contraseña · Alabanza Manager";
  const html = template(link, minutes);

  try {
    if (status.provider === "resend") {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ from: status.from, to: [to], subject, html }),
      });
      if (!res.ok) {
        const body = await res.text();
        return { delivered: false, provider: "resend", error: `Resend respondió ${res.status}: ${body.slice(0, 200)}` };
      }
      return { delivered: true, provider: "resend" };
    }

    if (status.provider === "smtp" || status.provider === "gmail") {
      const nodemailer = await import("nodemailer");
      const host = status.provider === "gmail" ? "smtp.gmail.com" : process.env.SMTP_HOST!;
      const port = Number(process.env.SMTP_PORT || (status.provider === "gmail" ? 465 : 587));
      const user = status.provider === "gmail" ? process.env.GMAIL_USER! : process.env.SMTP_USER!;
      const pass = status.provider === "gmail" ? process.env.GMAIL_APP_PASSWORD! : process.env.SMTP_PASS!;
      const transport = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
      await transport.sendMail({ from: status.from, to, subject, html });
      return { delivered: true, provider: status.provider };
    }

    return { delivered: false, provider: "ninguno", error: "No hay proveedor de correo configurado" };
  } catch (err) {
    return { delivered: false, provider: status.provider, error: (err as Error).message };
  }
}
