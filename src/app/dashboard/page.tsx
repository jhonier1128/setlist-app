import Link from "next/link";
import { ArrowRight, Layers, ListMusic, Mic2, Music, Plus } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getMedleys, getSongs } from "@/lib/queries";
import { keyOrder, RHYTHM_META, RHYTHMS, transposeKey } from "@/lib/music";
import { EmptyState, KeyBadge } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function DashboardHome() {
  const user = (await getCurrentUser())!;
  const [songs, medleys] = await Promise.all([getSongs(user.id), getMedleys(user.id)]);

  const count = (arr: string[]) => {
    const m = new Map<string, number>();
    arr.forEach((a) => m.set(a, (m.get(a) ?? 0) + 1));
    return m;
  };
  const maleKeys = [...count(songs.map((s) => s.keyMale)).entries()].sort((a, b) => keyOrder(a[0]) - keyOrder(b[0]));
  const femaleKeys = [...count(songs.map((s) => s.keyFemale)).entries()].sort((a, b) => keyOrder(a[0]) - keyOrder(b[0]));
  const rhythms = count(songs.map((s) => s.rhythm));
  const maxMale = Math.max(1, ...maleKeys.map((k) => k[1]));
  const maxFemale = Math.max(1, ...femaleKeys.map((k) => k[1]));
  const top = maleKeys.length ? [...maleKeys].sort((a, b) => b[1] - a[1])[0][0] : "—";

  const stats = [
    { label: "Canciones", value: songs.length, icon: ListMusic, tone: "from-indigo-500 to-violet-500" },
    { label: "Popurrís", value: medleys.length, icon: Layers, tone: "from-fuchsia-500 to-pink-500" },
    { label: "Tono más usado (♂)", value: top, icon: Mic2, tone: "from-sky-500 to-cyan-500" },
    { label: "Ritmo rápido", value: rhythms.get("Rápido") ?? 0, icon: Music, tone: "from-amber-500 to-orange-500" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Hola, {user.name.split(" ")[0]} 👋</h1>
          <p className="text-sm text-slate-500">Este es el resumen de tu repertorio de alabanza.</p>
        </div>
        <Link
          href="/dashboard/canciones"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm"
        >
          <Plus className="h-4 w-4" /> Nueva canción
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-3xl border border-slate-200 bg-white p-5">
            <div className={`grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br text-white ${s.tone}`}>
              <s.icon className="h-5 w-5" />
            </div>
            <p className="mt-4 text-3xl font-semibold text-slate-900">{s.value}</p>
            <p className="text-sm text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      {songs.length === 0 ? (
        <EmptyState
          icon={<ListMusic className="h-6 w-6" />}
          title="Empieza tu repertorio"
          text="Agrega tus primeras canciones para ver estadísticas por tonalidad y ritmo."
          action={
            <Link href="/dashboard/canciones" className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white">
              Ir a canciones
            </Link>
          }
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 lg:col-span-2">
            <h2 className="font-semibold text-slate-900">Canciones por tonalidad</h2>
            <div className="mt-5 grid gap-6 sm:grid-cols-2">
              {[
                { title: "♂ Hombre", data: maleKeys, max: maxMale, bar: "bg-indigo-500" },
                { title: "♀ Mujer", data: femaleKeys, max: maxFemale, bar: "bg-rose-500" },
              ].map((col) => (
                <div key={col.title}>
                  <p className="mb-3 text-sm font-medium text-slate-600">{col.title}</p>
                  <div className="space-y-2">
                    {col.data.map(([k, n]) => (
                      <div key={k} className="flex items-center gap-3 text-sm">
                        <span className="w-8 font-semibold text-slate-700">{k}</span>
                        <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                          <div className={`h-full rounded-full ${col.bar}`} style={{ width: `${(n / col.max) * 100}%` }} />
                        </div>
                        <span className="w-5 text-right text-slate-500">{n}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            <h2 className="font-semibold text-slate-900">Por ritmo</h2>
            <div className="mt-5 space-y-3">
              {RHYTHMS.map((r) => {
                const n = rhythms.get(r) ?? 0;
                return (
                  <div key={r} className="flex items-center gap-3">
                    <span className={`h-2.5 w-2.5 rounded-full ${RHYTHM_META[r].dot}`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-800">{r}</p>
                      <p className="text-xs text-slate-500">{RHYTHM_META[r].hint}</p>
                    </div>
                    <span className="text-lg font-semibold text-slate-900">{n}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Tus popurrís</h2>
          <Link href="/dashboard/popurris" className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600">
            Ver todos <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {medleys.length === 0 ? (
          <EmptyState
            icon={<Layers className="h-6 w-6" />}
            title="Sin popurrís"
            text="Crea un popurrí con canciones de la misma tonalidad."
          />
        ) : (
          <div className="grid gap-3 md:grid-cols-3">
            {medleys.slice(0, 3).map((m) => (
              <Link
                key={m.id}
                href={`/dashboard/popurris/${m.id}`}
                className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-indigo-200 hover:shadow-sm"
              >
                <div
                  className={`grid h-12 min-w-12 place-items-center rounded-xl px-2 font-bold text-white ${
                    m.voice === "male" ? "bg-indigo-600" : "bg-rose-500"
                  }`}
                >
                  {transposeKey(m.baseKey, m.transpose)}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-900">{m.name}</p>
                  <p className="text-sm text-slate-500">{m.songs.length} canciones</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-3 font-semibold text-slate-900">Últimas canciones</h2>
        <div className="divide-y divide-slate-100 rounded-3xl border border-slate-200 bg-white">
          {[...songs]
            .sort((a, b) => b.id - a.id)
            .slice(0, 5)
            .map((s) => (
              <div key={s.id} className="flex items-center gap-3 px-5 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">{s.title}</p>
                  <p className="truncate text-xs text-slate-500">{s.artist}</p>
                </div>
                <KeyBadge value={s.keyMale} label="♂" />
                <KeyBadge value={s.keyFemale} label="♀" tone="rose" />
              </div>
            ))}
          {songs.length === 0 && <p className="px-5 py-6 text-sm text-slate-500">Aún no hay canciones.</p>}
        </div>
      </div>
    </div>
  );
}
