"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, KeyRound, Mail, MailCheck } from "lucide-react";
import { api, Button, Field, inputCls } from "./ui";

type Result = { ok: boolean; delivered?: boolean; resetUrl?: string; message?: string; provider?: string };

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api<Result>("/api/auth/forgot", "POST", { email });
      setResult(res);
    } catch (err) {
      setError((err as Error).message);
    }
    setLoading(false);
  }

  return (
    <div className="grid min-h-screen place-items-center bg-slate-50 px-6 py-12">
      <div className="w-full max-w-md">
        <Link
          href="/login"
          className="mb-5 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="h-4 w-4" /> Volver a ingresar
        </Link>

        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-indigo-50 text-indigo-600">
            <KeyRound className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-2xl font-semibold text-slate-900">Olvidé mi contraseña</h1>
          <p className="mt-1 text-sm text-slate-500">
            Escribe el correo con el que te registraste y te enviaremos un enlace para crear una nueva.
          </p>

          {!result ? (
            <form onSubmit={submit} className="mt-6 space-y-4">
              <Field label="Correo electrónico">
                <input
                  type="email"
                  required
                  autoFocus
                  className={inputCls}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                />
              </Field>
              {error && (
                <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-rose-200">{error}</p>
              )}
              <Button type="submit" loading={loading} className="w-full">
                <Mail className="h-4 w-4" /> Enviar enlace de recuperación
              </Button>
            </form>
          ) : (
            <div className="mt-6 space-y-4">
              <div className="flex gap-3 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-900 ring-1 ring-emerald-200">
                <MailCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                <span>{result.message}</span>
              </div>

              {result.resetUrl && (
                <div className="rounded-2xl bg-amber-50 p-4 ring-1 ring-amber-200">
                  <p className="text-sm font-medium text-amber-900">Tu enlace de recuperación</p>
                  <a
                    href={result.resetUrl}
                    className="mt-2 block break-all text-sm font-medium text-indigo-600 underline"
                  >
                    {result.resetUrl}
                  </a>
                  <p className="mt-2 text-xs text-amber-800">
                    Vence en 60 minutos y solo se puede usar una vez.
                  </p>
                </div>
              )}

              <Button variant="secondary" className="w-full" onClick={() => setResult(null)}>
                Enviar a otro correo
              </Button>
            </div>
          )}

          <p className="mt-6 text-center text-sm text-slate-500">
            ¿Ya recordaste tu contraseña?{" "}
            <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              Ingresa
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
