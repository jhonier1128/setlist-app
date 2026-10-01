import nodemailer from "nodemailer";

/**
 * Envío de correos por SMTP.
 *
 * Variables de entorno necesarias para que funcione en producción:
 *   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM
 * y opcionalmente APP_URL (dominio público) para armar los enlaces.
 *
 * Si no hay SMTP configurado, el correo no se envía y el enlace se registra
 * en la consola del servidor, para poder probarlo igualmente.
 */
function isConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

export function mailStatus() {
  return isConfigured() ? "smtp" : "console";
}

function appUrl() {
  return (process.env.APP_URL || "http://localhost:3000").replace(/\/$/, "");
}

export async function sendPasswordResetEmail(to: string, name: string, token: string) {
  const url = `${appUrl()}/recuperar?token=${token}`;
  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto;padding:32px;background:#ffffff">
      <div style="text-align:center;margin-bottom:24px">
        <div style="display:inline-block;background:#4f46e5;color:#fff;border-radius:12px;padding:10px 16px;font-weight:bold">
          Alabanza Manager
        </div>
      </div>
      <h1 style="font-size:20px;color:#0f172a;margin:0 0 12px">Restablece tu contraseña</h1>
      <p style="font-size:15px;line-height:1.6;color:#334155;margin:0 0 8px">Hola ${name},</p>
      <p style="font-size:15px;line-height:1.6;color:#334155;margin:0 0 20px">
        Recibimos una solicitud para restablecer la contraseña de tu cuenta.
        El enlace es válido por <b>60 minutos</b> y solo puede usarse una vez.
      </p>
      <p style="text-align:center;margin:28px 0">
        <a href="${url}" style="background:#4f46e5;color:#ffffff;text-decoration:none;padding:14px 26px;border-radius:10px;font-weight:bold;font-size:15px;display:inline-block">
          Restablecer contraseña
        </a>
      </p>
      <p style="font-size:13px;line-height:1.6;color:#64748b;margin:0 0 16px">
        Si el botón no funciona, copia y pega este enlace en tu navegador:<br/>
        <span style="word-break:break-all;color:#4f46e5">${url}</span>
      </p>
      <p style="font-size:13px;line-height:1.6;color:#94a3b8;margin:0">
        Si no solicitaste este cambio, puedes ignorar este mensaje. Tu contraseña seguirá siendo la misma.
      </p>
    </div>`;

  const text = `Hola ${name}. Restablece tu contraseña de Alabanza Manager usando este enlace (válido 60 minutos): ${url}`;

  if (!isConfigured()) {
    console.log(
      `[mailer] SMTP no configurado. Correo para ${to} no enviado. Enlace de recuperación: ${url}`,
    );
    return { sent: false as const, url };
  }

  const port = Number(process.env.SMTP_PORT || 587);
  const secure = port === 465;
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  await transporter.sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to,
    subject: "Restablece tu contraseña · Alabanza Manager",
    text,
    html,
  });

  return { sent: true as const, url };
}
