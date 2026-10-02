"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { CheckCircle2, KeyRound, ShieldAlert } from "lucide-react";
import { api, Button, Field } from "./ui";
import PasswordInput from "./PasswordInput";

function ResetInner() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api("/api/auth/reset", "POST", { token, password });
      setDone(true);
      setTimeout(() => router.push("/login"), 2500);
    } catch (err) {
      setError((err as Error).message);
    }
    setLoading(false);
  }

  return (
    <div className="grid min-h-screen place-items-center bg-slate-50 px-6 py-12">
      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-indigo-50 text-indigo-600">
            <KeyRound className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-2xl font-semibold text-slate-900">Crear nueva contraseña</h1>
          <p className="mt-1 text-sm text-slate-500">Elige una contraseña de al menos 6 caracteres.</p>

          {!token ? (
            <div className="mt-6 flex gap-3 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900 ring-1 ring-amber-200">
              <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
              <span>
                Falta el enlace de recuperación. Solicita uno nuevo desde{" "}
                <Link href="/olvide-contrasena" className="font-medium underline">
                  Olvidé mi contraseña
                </Link>
                .
              </span>
            </div>
          ) : done ? (
            <div className="mt-6 flex gap-3 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-900 ring-1 ring-emerald-200">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
              <span>
                Contraseña actualizada. Te llevamos a ingresar en unos segundos… o{" "}
                <Link href="/login" className="font-medium underline">
                  entra aquí
                </Link>
                .
              </span>
            </div>
          ) : (
            <form onSubmit={submit} className="mt-6 space-y-4">
              <Field label="Nueva contraseña">
                <PasswordInput
                  value={password}
                  onChange={setPassword}
                  required
                  minLength={6}
                  autoFocus
                  autoComplete="new-password"
                />
              </Field>
              {error && (
                <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-rose-200">{error}</p>
              )}
              <Button type="submit" loading={loading} className="w-full">
                Guardar contraseña
              </Button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-slate-500">
            <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              Volver a ingresar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordForm() {
  return (
    <Suspense fallback={<div className="grid min-h-screen place-items-center bg-slate-50" />}>
      <ResetInner />
    </Suspense>
  );
}
