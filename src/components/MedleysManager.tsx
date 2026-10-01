"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Layers, Loader2, Music, Plus, Trash2 } from "lucide-react";
import { NOTES, sameKey, transposeKey, type Voice } from "@/lib/music";
import type { MedleyDTO, SongDTO } from "@/lib/types";
import { api, Button, EmptyState, Field, inputCls, KeyBadge, Modal, useToast } from "./ui";

export default function MedleysManager({
  initialMedleys,
  songs,
}: {
  initialMedleys: MedleyDTO[];
  songs: SongDTO[];
}) {
  const toast = useToast();
  const [medleys, setMedleys] = useState(initialMedleys);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<MedleyDTO | null>(null);
  const [form, setForm] = useState({ name: "", description: "", voice: "male" as Voice, baseKey: "G" });

  const fitting = songs.filter((s) =>
    sameKey(form.voice === "male" ? s.keyMale : s.keyFemale, form.baseKey),
  ).length;

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const created = await api<MedleyDTO>("/api/medleys", "POST", form);
      setMedleys((m) => [...m, created].sort((a, b) => a.name.localeCompare(b.name, "es")));
      setCreating(false);
      setForm({ name: "", description: "", voice: "male", baseKey: "G" });
      toast("Popurrí creado. Ábrelo para agregar canciones.");
    } catch (err) {
      toast((err as Error).message, "err");
    }
    setSaving(false);
  }

  async function remove(m: MedleyDTO) {
    const prev = medleys;
    setMedleys((x) => x.filter((y) => y.id !== m.id));
    setDeleting(null);
    try {
      await api(`/api/medleys/${m.id}`, "DELETE");
      toast(`Popurrí “${m.name}” eliminado`);
    } catch (err) {
      setMedleys(prev);
      toast((err as Error).message, "err");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Popurrís</h1>
          <p className="text-sm text-slate-500">Bloques de canciones que fluyen en la misma tonalidad.</p>
        </div>
        <Button onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4" /> Nuevo popurrí
        </Button>
      </div>

      {medleys.length === 0 ? (
        <EmptyState
          icon={<Layers className="h-6 w-6" />}
          title="Todavía no tienes popurrís"
          text="Crea un popurrí, elige su tonalidad y agrega canciones que compartan el mismo tono."
          action={
            <Button onClick={() => setCreating(true)}>
              <Plus className="h-4 w-4" /> Crear popurrí
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {medleys.map((m) => {
            const eff = transposeKey(m.baseKey, m.transpose);
            const pending = m.id < 0;
            return (
              <div
                key={m.id}
                className={`animate-pop flex flex-col rounded-3xl border border-slate-200 bg-white p-5 transition hover:border-indigo-200 hover:shadow-md ${
                  pending ? "opacity-60" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div
                    className={`grid h-12 min-w-12 place-items-center rounded-2xl px-2 text-lg font-bold text-white ${
                      m.voice === "male"
                        ? "bg-gradient-to-br from-indigo-600 to-violet-600"
                        : "bg-gradient-to-br from-rose-500 to-pink-600"
                    }`}
                  >
                    {eff}
                  </div>
                  <button
                    onClick={() => setDeleting(m)}
                    title="Eliminar"
                    className="rounded-lg p-2 text-rose-500 hover:bg-rose-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <h3 className="mt-4 font-semibold text-slate-900">{m.name}</h3>
                <p className="mt-1 line-clamp-2 min-h-10 text-sm text-slate-500">
                  {m.description || "Sin descripción"}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <KeyBadge
                    value={m.voice === "male" ? "Hombre" : "Mujer"}
                    tone={m.voice === "male" ? "indigo" : "rose"}
                  />
                  <KeyBadge value={`${m.songs.length} canciones`} tone="slate" />
                  {m.transpose !== 0 && <KeyBadge value={`${m.baseKey} → ${eff}`} tone="slate" label="Transp." />}
                </div>
                <ol className="mt-4 space-y-1 border-t border-slate-100 pt-4 text-sm text-slate-600">
                  {m.songs.slice(0, 4).map((s, i) => (
                    <li key={s.id} className="flex gap-2">
                      <span className="w-4 text-slate-400">{i + 1}.</span>
                      <span className="truncate">{s.title}</span>
                    </li>
                  ))}
                  {m.songs.length === 0 && (
                    <li className="flex items-center gap-2 text-slate-400">
                      <Music className="h-4 w-4" /> Aún sin canciones
                    </li>
                  )}
                  {m.songs.length > 4 && <li className="pl-6 text-slate-400">+{m.songs.length - 4} más…</li>}
                </ol>
                <Link
                  href={`/dashboard/popurris/${m.id}`}
                  className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-50 px-4 py-2.5 text-sm font-medium text-indigo-700 ring-1 ring-slate-200 hover:bg-indigo-50"
                >
                  Abrir popurrí {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                </Link>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={creating} onClose={() => setCreating(false)} title="Nuevo popurrí">
        <form onSubmit={create} className="space-y-4">
          <Field label="Nombre">
            <input
              className={inputCls}
              required
              autoFocus
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ej. Adoración en Re"
            />
          </Field>
          <Field label="Descripción (opcional)">
            <input
              className={inputCls}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="¿Para qué momento del servicio?"
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Voz">
              <select
                className={inputCls}
                value={form.voice}
                onChange={(e) => setForm({ ...form, voice: e.target.value as Voice })}
              >
                <option value="male">♂ Hombre</option>
                <option value="female">♀ Mujer</option>
              </select>
            </Field>
            <Field label="Tonalidad">
              <select
                className={inputCls}
                value={form.baseKey}
                onChange={(e) => setForm({ ...form, baseKey: e.target.value })}
              >
                {NOTES.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
                {NOTES.map((n) => (
                  <option key={n + "m"} value={n + "m"}>
                    {n}m
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <p className="rounded-xl bg-indigo-50 px-3 py-2 text-sm text-indigo-700">
            {fitting > 0
              ? `Tienes ${fitting} ${fitting === 1 ? "canción" : "canciones"} en ${form.baseKey} para ${form.voice === "male" ? "hombre" : "mujer"}.`
              : `No tienes canciones en ${form.baseKey} para ${form.voice === "male" ? "hombre" : "mujer"} todavía. Puedes transponer canciones desde “Canciones”.`}
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setCreating(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={saving}>
              Crear popurrí
            </Button>
          </div>
        </form>
      </Modal>

      <Modal open={deleting !== null} onClose={() => setDeleting(null)} title="Eliminar popurrí">
        <p className="text-sm text-slate-600">
          ¿Eliminar <b>{deleting?.name}</b>? Las canciones seguirán en tu repertorio.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setDeleting(null)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={() => deleting && remove(deleting)}>
            Eliminar
          </Button>
        </div>
      </Modal>
    </div>
  );
}
