import Link from "next/link";
import { ArrowRight, Layers, ListMusic, Music2, Piano, Mic2, Repeat, Gauge, Check } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const features = [
  {
    icon: Mic2,
    title: "Tonalidad para hombre y mujer",
    text: "Guarda dos tonos por canción y cambia la vista con un clic según quién dirija la alabanza.",
  },
  {
    icon: Gauge,
    title: "Organiza por ritmo",
    text: "Lento, medio, rápido o 6/8. Arma tu set list balanceando adoración y celebración.",
  },
  {
    icon: Layers,
    title: "Popurrís en el mismo tono",
    text: "Solo te sugerimos canciones que encajan en la misma tonalidad para que las transiciones fluyan.",
  },
  {
    icon: Repeat,
    title: "Transpón cuando lo necesites",
    text: "Sube o baja medio tono, o lleva un popurrí completo a otra tonalidad sin perder el original.",
  },
];

export default async function Home() {
  const user = await getCurrentUser();
  return (
    <div className="min-h-screen bg-white">
      <header className="absolute inset-x-0 top-0 z-20">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link href="/" className="flex items-center gap-2 font-semibold text-white">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 ring-1 ring-white/20">
              <Music2 className="h-5 w-5 text-amber-300" />
            </span>
            Alabanza Manager
          </Link>
          <nav className="flex items-center gap-2 text-sm">
            {user ? (
              <Link href="/dashboard" className="rounded-xl bg-white px-4 py-2 font-medium text-indigo-900">
                Ir a mi panel
              </Link>
            ) : (
              <>
                <Link href="/login" className="rounded-xl px-4 py-2 font-medium text-white/90 hover:bg-white/10">
                  Ingresar
                </Link>
                <Link href="/registro" className="rounded-xl bg-white px-4 py-2 font-medium text-indigo-900">
                  Crear cuenta
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-950 via-indigo-900 to-violet-900 pb-24 pt-32 text-white">
        <div className="absolute -right-20 top-10 h-96 w-96 rounded-full bg-amber-400/20 blur-3xl" />
        <div className="absolute -left-20 bottom-0 h-96 w-96 rounded-full bg-fuchsia-500/20 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-6 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-amber-200 ring-1 ring-white/20">
              <Piano className="h-3.5 w-3.5" /> Para pianistas y vocalistas del ministerio
            </span>
            <h1 className="mt-5 text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
              Tu repertorio de alabanza, <span className="text-amber-300">afinado y en orden.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-indigo-100">
              Registra tus canciones con su tonalidad para hombre y mujer, organízalas por tono o ritmo y arma popurrís
              que fluyen en la misma tonalidad.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={user ? "/dashboard" : "/registro"}
                className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-6 py-3 font-semibold text-indigo-950 shadow-lg shadow-amber-500/20 transition hover:bg-amber-300"
              >
                {user ? "Abrir mi panel" : "Empezar gratis"} <ArrowRight className="h-4 w-4" />
              </Link>
              {!user && (
                <Link
                  href="/login"
                  className="rounded-xl bg-white/10 px-6 py-3 font-medium ring-1 ring-white/25 hover:bg-white/15"
                >
                  Probar la demo
                </Link>
              )}
            </div>
          </div>

          <div className="animate-float relative mx-auto w-full max-w-md">
            <div className="rounded-3xl bg-white p-5 text-slate-900 shadow-2xl">
              <div className="mb-3 flex items-center justify-between">
                <p className="font-semibold">Adoración en Re</p>
                <span className="rounded-lg bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-700">Hombre · D</span>
              </div>
              {[
                ["Renuévame", "D", "G", "Lento"],
                ["Océanos", "D", "G", "Lento"],
                ["Sobre Todo", "D", "G", "Lento"],
                ["Yo Me Rindo", "D", "G", "Lento"],
              ].map(([t, m, f, r], i) => (
                <div key={t} className="mb-2 flex items-center gap-3 rounded-2xl bg-slate-50 px-3 py-2.5">
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-indigo-600 text-xs font-semibold text-white">
                    {i + 1}
                  </span>
                  <span className="flex-1 text-sm font-medium">{t}</span>
                  <span className="rounded-md bg-indigo-50 px-1.5 py-0.5 text-xs font-semibold text-indigo-700">♂ {m}</span>
                  <span className="rounded-md bg-rose-50 px-1.5 py-0.5 text-xs font-semibold text-rose-700">♀ {f}</span>
                  <span className="hidden text-xs text-slate-400 sm:inline">{r}</span>
                </div>
              ))}
              <div className="mt-3 flex items-center gap-2 rounded-2xl bg-amber-50 px-3 py-2 text-xs text-amber-800">
                <Repeat className="h-4 w-4" /> Transponer popurrí: <b>D → E</b> (+2)
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold text-slate-900">Todo lo que necesita tu equipo de alabanza</h2>
          <p className="mt-3 text-slate-500">Menos tiempo buscando tonos, más tiempo ministrando.</p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div key={f.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-indigo-50 text-indigo-600">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-semibold text-slate-900">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-slate-50 py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-semibold text-slate-900">Del ensayo al servicio, sin sorpresas</h2>
            <ul className="mt-6 space-y-3 text-slate-600">
              {[
                "Registra cada canción con tono de hombre, tono de mujer, ritmo y BPM.",
                "Filtra tu repertorio por tonalidad o por ritmo en segundos.",
                "Crea popurrís con canciones que comparten tonalidad.",
                "Cambia la tonalidad de una canción o de un popurrí completo.",
              ].map((t) => (
                <li key={t} className="flex gap-3">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-600">
                    <Check className="h-3 w-3" />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { i: ListMusic, n: "Repertorio", t: "Todas tus canciones en un solo lugar" },
              { i: Layers, n: "Popurrís", t: "Bloques continuos en la misma tonalidad" },
            ].map((c) => (
              <div key={c.n} className="rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-600 p-6 text-white shadow-lg">
                <c.i className="h-7 w-7 text-amber-300" />
                <p className="mt-6 text-lg font-semibold">{c.n}</p>
                <p className="mt-1 text-sm text-indigo-100">{c.t}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 py-8 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} Alabanza Manager · Hecho con ♥ para el ministerio de alabanza
      </footer>
    </div>
  );
}
