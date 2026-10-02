import Link from "next/link";
import { AlertTriangle, CheckCircle2, Database, Mail, Loader2 } from "lucide-react";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import { ensureSchema, friendlyDbError } from "@/lib/ensureSchema";
import { mailStatus } from "@/lib/mailer";

export const dynamic = "force-dynamic";

type Health = { ok: boolean; db?: string; tables?: string; error?: string };

const PROVIDER: Record<string, string> = {
  resend: "Resend (RESEND_API_KEY)",
  smtp: "SMTP (SMTP_HOST, SMTP_USER, SMTP_PASS)",
  gmail: "Gmail (GMAIL_USER, GMAIL_APP_PASSWORD)",
  ninguno: "No configurado",
};

export default async function DiagnosticoPage() {
  let health: Health;
  try {
    await ensureSchema();
    await db.execute(sql`select 1`);
    health = { ok: true };
  } catch (err) {
    health = { ok: false, error: friendlyDbError(err) };
  }

  const hasUrl = Boolean(process.env.DATABASE_URL);
  const mail = mailStatus();

  return (
    <div className="grid min-h-screen place-items-center bg-slate-50 px-6 py-12">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
            <Database className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Diagnóstico</h1>
            <p className="text-sm text-slate-500">Base de datos y correo</p>
          </div>
        </div>

        <ul className="mt-6 space-y-3 text-sm">
          <li className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
            {hasUrl ? (
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
            ) : (
              <AlertTriangle className="h-5 w-5 shrink-0 text-rose-600" />
            )}
            <span className={hasUrl ? "text-slate-700" : "font-medium text-rose-700"}>
              {hasUrl ? "DATABASE_URL está configurada" : "Falta la variable DATABASE_URL"}
            </span>
          </li>
          <li className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
            {health.ok ? (
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
            ) : (
              <AlertTriangle className="h-5 w-5 shrink-0 text-rose-600" />
            )}
            <span className={health.ok ? "text-slate-700" : "font-medium text-rose-700"}>
              {health.ok ? "Conexión y tablas correctas" : (health.error ?? "Error")}
            </span>
          </li>
          <li className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
            {mail.configured ? (
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
            ) : (
              <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
            )}
            <span className={mail.configured ? "text-slate-700" : "font-medium text-amber-800"}>
              <Mail className="mr-1.5 inline h-4 w-4" />
              Recuperación por correo: {PROVIDER[mail.provider]}
            </span>
          </li>
        </ul>

        {!health.ok && (
          <div className="mt-6 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900 ring-1 ring-amber-200">
            <p className="font-semibold">Cómo solucionarlo</p>
            <ol className="mt-2 list-decimal space-y-1 pl-5">
              <li>Revisa que DATABASE_URL apunte a tu base de datos en la nube.</li>
              <li>
                Ejecuta <code className="rounded bg-amber-100 px-1">npx drizzle-kit push</code> con esa URL.
              </li>
              <li>Recarga esta página para confirmar.</li>
            </ol>
          </div>
        )}

        {!mail.configured && (
          <div className="mt-4 rounded-2xl bg-sky-50 p-4 text-sm text-sky-900 ring-1 ring-sky-200">
            Los enlaces de recuperación se mostrarán en pantalla. Para enviarlos por correo define{" "}
            <code className="rounded bg-sky-100 px-1">RESEND_API_KEY</code> o{" "}
            <code className="rounded bg-sky-100 px-1">GMAIL_USER</code> +{" "}
            <code className="rounded bg-sky-100 px-1">GMAIL_APP_PASSWORD</code>.
          </div>
        )}

        <div className="mt-6 flex gap-2">
          <Link
            href="/login"
            className="flex-1 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-center text-sm font-medium text-white"
          >
            Ir a ingresar
          </Link>
          <Link
            href="/olvide-contrasena"
            className="rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-slate-700 ring-1 ring-slate-200"
          >
            Recuperar contraseña
          </Link>
        </div>
        <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-slate-400">
          <Loader2 className="h-3 w-3" /> Recarga la página para repetir la verificación
        </p>
      </div>
    </div>
  );
}
