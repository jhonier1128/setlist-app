"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Music2, Sparkles } from "lucide-react";
import { api, Button, Field, inputCls, PasswordField } from "./ui";

export default function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "pianista", withDemo: true });
  const isLogin = mode === "login";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api(isLogin ? "/api/auth/login" : "/api/auth/register", "POST", form);
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  }

  async function demo() {
    setError("");
    setDemoLoading(true);
    try {
      await api("/api/auth/demo", "POST");
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
      setDemoLoading(false);
    }
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
            “Cantad a Jehová cántico nuevo; cantad bien, con júbilo.”
          </p>
          <p className="mt-3 text-indigo-200">Salmo 33:3</p>
          <div className="mt-10 grid grid-cols-3 gap-3 text-center text-sm">
            {["Tonalidades", "Ritmos", "Popurrís"].map((t) => (
              <div key={t} className="rounded-2xl bg-white/10 px-3 py-4 ring-1 ring-white/10">
                {t}
              </div>
            ))}
          </div>
        </div>
        <p className="relative text-sm text-indigo-200">Hecho para pianistas y vocalistas del ministerio.</p>
      </div>

      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <Link href="/" className="mb-8 flex items-center gap-2 font-semibold text-slate-900 lg:hidden">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-600 text-white">
              <Music2 className="h-5 w-5" />
            </span>
            Alabanza Manager
          </Link>
          <h1 className="text-2xl font-semibold text-slate-900">{isLogin ? "Bienvenido de nuevo" : "Crea tu cuenta"}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {isLogin ? "Ingresa para ver tu repertorio." : "Empieza a organizar tus canciones hoy."}
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            {!isLogin && (
              <>
                <Field label="Nombre">
                  <input
                    className={inputCls}
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Tu nombre"
                  />
                </Field>
                <Field label="Tu rol en el ministerio">
                  <select
                    className={inputCls}
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                  >
                    <option value="pianista">Pianista</option>
                    <option value="vocalista">Vocalista</option>
                    <option value="director">Director de alabanza</option>
                  </select>
                </Field>
              </>
            )}
            <Field label="Correo electrónico">
              <input
                type="email"
                className={inputCls}
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="tu@correo.com"
              />
            </Field>
            <PasswordField
              label="Contraseña"
              hint={isLogin ? undefined : "Mínimo 6 caracteres"}
              required
              minLength={isLogin ? undefined : 6}
              autoComplete={isLogin ? "current-password" : "new-password"}
              value={form.password}
              onChange={(v) => setForm({ ...form, password: v })}
            />

            {isLogin && (
              <div className="text-right">
                <Link
                  href="/recuperar"
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
            )}
            {!isLogin && (
              <label className="flex items-start gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600"
                  checked={form.withDemo}
                  onChange={(e) => setForm({ ...form, withDemo: e.target.checked })}
                />
                Cargar canciones y popurrís de ejemplo para empezar
              </label>
            )}
            {error && (
              <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-rose-200">{error}</p>
            )}
            <Button type="submit" loading={loading} className="w-full">
              {isLogin ? "Ingresar" : "Crear cuenta"}
            </Button>
          </form>

          {isLogin && (
            <>
              <div className="my-5 flex items-center gap-3 text-xs text-slate-400">
                <span className="h-px flex-1 bg-slate-200" /> o <span className="h-px flex-1 bg-slate-200" />
              </div>
              <Button variant="secondary" onClick={demo} loading={demoLoading} className="w-full">
                <Sparkles className="h-4 w-4 text-amber-500" /> Entrar con cuenta demo
              </Button>
              <p className="mt-2 text-center text-xs text-slate-400">demo@alabanza.app · alabanza123</p>
            </>
          )}

          <p className="mt-6 text-center text-sm text-slate-500">
            {isLogin ? "¿Aún no tienes cuenta?" : "¿Ya tienes cuenta?"}{" "}
            <Link
              href={isLogin ? "/registro" : "/login"}
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              {isLogin ? "Regístrate" : "Ingresa"}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
