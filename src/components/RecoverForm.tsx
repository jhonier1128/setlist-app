"use client";

import Link from "next/link";
import { useState } from "react";
import { CheckCircle2, KeyRound, Mail, Music2, Send } from "lucide-react";
import { api, Button, Field, inputCls, PasswordField } from "./ui";

export default function RecoverForm({ token }: { token: string | null }) {
  const [mode, setMode] = useState<"request" | "reset">(token ? "reset" : "request");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [previewLink, setPreviewLink] = useState("");

  async function requestLink(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setNotice("");
    setLoading(true);
    try {
      const res = await api<{ message: string; mail: string; previewLink?: string }>(
        "/api/auth/forgot",
        "POST",
        { email },
      );
      setDone(true);
      setNotice(res.message);
      setPreviewLink(res.previewLink ?? "");
    } catch (err) {
      setError((err as Error).message);
    }
    setLoading(false);
  }

  async function resetPassword(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Las contraseñas no coinciden");
      return;
    }
    setLoading(true);
    try {
      const res = await api<{ message: string }>("/api/auth/reset", "POST", { token, password });
      setDone(true);
      setNotice(res.message);
    } catch (err) {
      setError((err as Error).message);
    }
    setLoading(false);
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-indigo-950 via-indigo-900 to-violet-900 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-amber-400/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-16 h-80 w-80 rounded-full bg-fuchsia-500/20 blur-3xl" />
        <Link href="/" className="relative flex items-center gap-2 text-lg font-semibold">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 ring-1 ring-white/20">
            <Music2 className="h-5 w-5 text-amber-300" />
          </span>
          Alabanza Manager
        </Link>
        <div className="relative">
          <p className="text-3xl font-semibold leading-snug">
            “Sanaste a los quebrantados de corazón, y vendaste sus dolores.”
          </p>
          <p className="mt-3 text-indigo-200">Salmo 147:3</p>
        </div>
        <p className="relative text-sm text-indigo-200">
          Recupera el acceso a tu repertorio en unos pocos pasos.
        </p>
      </div>

      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <Link href="/" className="mb-8 flex items-center gap-2 font-semibold text-slate-900 lg:hidden">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-600 text-white">
              <Music2 className="h-5 w-5" />
            </span>
            Alabanza Manager
          </Link>

          {done ? (
            <div className="animate-pop">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h1 className="mt-4 text-2xl font-semibold text-slate-900">
                {mode === "request" ? "Revisa tu correo" : "Contraseña actualizada"}
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{notice}</p>

              {previewLink && (
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                  <p className="font-medium">Modo de prueba: el correo no está configurado.</p>
                  <a href={previewLink} className="mt-1 block break-all font-medium underline">
                    {previewLink}
                  </a>
                </div>
              )}

              <div className="mt-6 space-y-2">
                {mode === "request" ? (
                  <>
                    <Button
                      variant="secondary"
                      className="w-full"
                      onClick={() => {
                        setDone(false);
                        setNotice("");
                        setPreviewLink("");
                      }}
                    >
                      Usar otro correo
                    </Button>
                    <Link href="/login" className="block text-center text-sm text-slate-500 hover:text-slate-800">
                      Volver al inicio de sesión
                    </Link>
                  </>
                ) : (
                  <Link
                    href="/login"
                    className="block rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-center text-sm font-medium text-white"
                  >
                    Ir a iniciar sesión
                  </Link>
                )}
              </div>
            </div>
          ) : mode === "request" ? (
            <>
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-indigo-50 text-indigo-600">
                <Mail className="h-6 w-6" />
              </div>
              <h1 className="mt-4 text-2xl font-semibold text-slate-900">¿Olvidaste tu contraseña?</h1>
              <p className="mt-1 text-sm text-slate-500">
                Escribe el correo con el que te registraste y te enviaremos un enlace para crear una nueva.
              </p>

              <form onSubmit={requestLink} className="mt-6 space-y-4">
                <Field label="Correo electrónico">
                  <input
                    type="email"
                    className={inputCls}
                    required
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@correo.com"
                  />
                </Field>
                {error && (
                  <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-rose-200">{error}</p>
                )}
                <Button type="submit" loading={loading} className="w-full">
                  <Send className="h-4 w-4" /> Enviar enlace
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-slate-500">
                ¿Ya la recordaste?{" "}
                <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                  Inicia sesión
                </Link>
              </p>
            </>
          ) : (
            <>
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-indigo-50 text-indigo-600">
                <KeyRound className="h-6 w-6" />
              </div>
              <h1 className="mt-4 text-2xl font-semibold text-slate-900">Crea una contraseña nueva</h1>
              <p className="mt-1 text-sm text-slate-500">Elige una contraseña de al menos 6 caracteres.</p>

              <form onSubmit={resetPassword} className="mt-6 space-y-4">
                <PasswordField
                  label="Nueva contraseña"
                  required
                  minLength={6}
                  autoFocus
                  autoComplete="new-password"
                  value={password}
                  onChange={setPassword}
                />
                <PasswordField
                  label="Repite la contraseña"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  value={confirm}
                  onChange={setConfirm}
                />
                {error && (
                  <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-rose-200">{error}</p>
                )}
                <Button type="submit" loading={loading} className="w-full">
                  Guardar contraseña
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-slate-500">
                <Link href="/recuperar" className="font-medium text-indigo-600 hover:text-indigo-500">
                  Solicitar otro enlace
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
