"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  AlertTriangle,
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Minus,
  Music,
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
  X,
} from "lucide-react";
import { NOTES, parseKey, sameKey, semitoneDiff, transposeKey } from "@/lib/music";
import type { MedleyDTO, SongDTO } from "@/lib/types";
import { api, Button, EmptyState, Field, inputCls, KeyBadge, Modal, useToast } from "./ui";
import { RhythmPill } from "./SongsManager";

export default function MedleyDetail({
  initialMedley,
  allSongs,
}: {
  initialMedley: MedleyDTO;
  allSongs: SongDTO[];
}) {
  const toast = useToast();
  const router = useRouter();
  const [m, setM] = useState(initialMedley);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: m.name, description: m.description });
  const [deleting, setDeleting] = useState(false);

  const male = m.voice === "male";
  const eff = transposeKey(m.baseKey, m.transpose);
  const minor = parseKey(m.baseKey)?.minor ?? false;
  const songKey = (s: SongDTO) => (male ? s.keyMale : s.keyFemale);

  const inMedley = new Set(m.songs.map((s) => s.id));
  const candidates = allSongs.filter((s) => !inMedley.has(s.id) && sameKey(songKey(s), m.baseKey));
  const otherCount = allSongs.filter((s) => !inMedley.has(s.id) && !sameKey(songKey(s), m.baseKey)).length;

  async function run<T>(optimistic: () => void, rollback: () => void, call: () => Promise<T>, okMsg?: string) {
    optimistic();
    try {
      await call();
      if (okMsg) toast(okMsg);
    } catch (e) {
      rollback();
      toast((e as Error).message, "err");
    }
  }

  function setTranspose(n: number) {
    const t = ((n % 12) + 12) % 12;
    const prev = m.transpose;
    run(
      () => setM((x) => ({ ...x, transpose: t })),
      () => setM((x) => ({ ...x, transpose: prev })),
      () => api(`/api/medleys/${m.id}`, "PATCH", { transpose: t }),
    );
  }

  function addSong(s: SongDTO) {
    const prev = m.songs;
    run(
      () => setM((x) => ({ ...x, songs: [...x.songs, s] })),
      () => setM((x) => ({ ...x, songs: prev })),
      () => api(`/api/medleys/${m.id}`, "PATCH", { addSongId: s.id }),
    );
  }

  function removeSong(s: SongDTO) {
    const prev = m.songs;
    run(
      () => setM((x) => ({ ...x, songs: x.songs.filter((y) => y.id !== s.id) })),
      () => setM((x) => ({ ...x, songs: prev })),
      () => api(`/api/medleys/${m.id}`, "PATCH", { removeSongId: s.id }),
    );
  }

  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= m.songs.length) return;
    const prev = m.songs;
    const next = [...prev];
    [next[i], next[j]] = [next[j], next[i]];
    run(
      () => setM((x) => ({ ...x, songs: next })),
      () => setM((x) => ({ ...x, songs: prev })),
      () => api(`/api/medleys/${m.id}`, "PATCH", { order: next.map((s) => s.id) }),
    );
  }

  async function saveMeta(e: React.FormEvent) {
    e.preventDefault();
    const prev = { name: m.name, description: m.description };
    const next = { name: editForm.name.trim(), description: editForm.description.trim() };
    if (!next.name) return;
    setEditing(false);
    run(
      () => setM((x) => ({ ...x, ...next })),
      () => setM((x) => ({ ...x, ...prev })),
      () => api(`/api/medleys/${m.id}`, "PATCH", next),
      "Popurrí actualizado",
    );
  }

  async function deleteMedley() {
    setDeleting(false);
    try {
      await api(`/api/medleys/${m.id}`, "DELETE");
      router.push("/dashboard/popurris");
      router.refresh();
    } catch (e) {
      toast((e as Error).message, "err");
    }
  }

  const targetOptions = NOTES.map((n) => n + (minor ? "m" : ""));

  return (
    <div className="space-y-6">
      <Link href="/dashboard/popurris" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800">
        <ArrowLeft className="h-4 w-4" /> Todos los popurrís
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold text-slate-900">{m.name}</h1>
            <KeyBadge value={male ? "♂ Hombre" : "♀ Mujer"} tone={male ? "indigo" : "rose"} />
          </div>
          <p className="mt-1 text-sm text-slate-500">{m.description || "Sin descripción"}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => {
              setEditForm({ name: m.name, description: m.description });
              setEditing(true);
            }}
          >
            <Pencil className="h-4 w-4" /> Editar
          </Button>
          <Button variant="secondary" onClick={() => setDeleting(true)} className="!text-rose-600">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* transposer */}
      <div
        className={`overflow-hidden rounded-3xl p-6 text-white shadow-lg ${
          male ? "bg-gradient-to-br from-indigo-700 to-violet-700" : "bg-gradient-to-br from-rose-600 to-pink-600"
        }`}
      >
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-5">
            <div className="grid h-20 min-w-20 place-items-center rounded-3xl bg-white/15 px-3 text-4xl font-bold ring-1 ring-white/30">
              {eff}
            </div>
            <div>
              <p className="text-sm text-white/70">Tocando en</p>
              <p className="text-xl font-semibold">
                {m.transpose === 0 ? "Tonalidad original" : `${m.transpose > 6 ? m.transpose - 12 : m.transpose > 0 ? "+" + m.transpose : m.transpose} semitonos`}
              </p>
              <p className="text-sm text-white/70">Original: {m.baseKey}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setTranspose(m.transpose - 1)}
              className="grid h-11 w-11 place-items-center rounded-xl bg-white/15 ring-1 ring-white/25 hover:bg-white/25"
              title="Bajar medio tono"
            >
              <Minus className="h-5 w-5" />
            </button>
            <button
              onClick={() => setTranspose(m.transpose + 1)}
              className="grid h-11 w-11 place-items-center rounded-xl bg-white/15 ring-1 ring-white/25 hover:bg-white/25"
              title="Subir medio tono"
            >
              <Plus className="h-5 w-5" />
            </button>
            <select
              aria-label="Cambiar a tonalidad"
              className="h-11 rounded-xl bg-white/15 px-3 text-sm font-medium text-white outline-none ring-1 ring-white/25 [&>option]:text-slate-900"
              value={eff}
              onChange={(e) => setTranspose(semitoneDiff(m.baseKey, e.target.value))}
            >
              {targetOptions.map((k) => (
                <option key={k} value={k}>
                  Ir a {k}
                </option>
              ))}
            </select>
            {m.transpose !== 0 && (
              <button
                onClick={() => setTranspose(0)}
                className="flex h-11 items-center gap-2 rounded-xl px-3 text-sm hover:bg-white/15"
              >
                <RotateCcw className="h-4 w-4" /> Original
              </button>
            )}
          </div>
        </div>
        <p className="mt-4 text-xs text-white/70">
          Cambiar la tonalidad del popurrí no modifica tus canciones; solo muestra cada tono transpuesto.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* songs in medley */}
        <div className="lg:col-span-3">
          <h2 className="mb-3 font-semibold text-slate-900">Orden del popurrí ({m.songs.length})</h2>
          {m.songs.length === 0 ? (
            <EmptyState
              icon={<Music className="h-6 w-6" />}
              title="Popurrí vacío"
              text={`Agrega canciones en ${m.baseKey} desde la lista de la derecha.`}
            />
          ) : (
            <ol className="space-y-2">
              {m.songs.map((s, i) => {
                const mismatch = !sameKey(songKey(s), m.baseKey);
                return (
                  <li
                    key={s.id}
                    className="animate-pop flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3"
                  >
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-slate-100 text-sm font-semibold text-slate-600">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-slate-900">{s.title}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <RhythmPill rhythm={s.rhythm} />
                        {mismatch && (
                          <span className="inline-flex items-center gap-1 text-xs text-amber-600">
                            <AlertTriangle className="h-3.5 w-3.5" /> Ahora está en {songKey(s)} (otro tono)
                          </span>
                        )}
                      </div>
                    </div>
                    <KeyBadge
                      value={transposeKey(songKey(s), m.transpose)}
                      tone={male ? "indigo" : "rose"}
                      label={male ? "♂" : "♀"}
                    />
                    <div className="flex items-center">
                      <button
                        onClick={() => move(i, -1)}
                        disabled={i === 0}
                        aria-label="Subir"
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-30"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => move(i, 1)}
                        disabled={i === m.songs.length - 1}
                        aria-label="Bajar"
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-30"
                      >
                        <ArrowDown className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => removeSong(s)}
                        aria-label="Quitar"
                        className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </div>

        {/* candidates */}
        <div className="lg:col-span-2">
          <h2 className="mb-1 font-semibold text-slate-900">Canciones en {m.baseKey}</h2>
          <p className="mb-3 text-xs text-slate-500">
            Solo se muestran canciones que coinciden con la tonalidad {m.baseKey} ({male ? "hombre" : "mujer"}).
          </p>
          {candidates.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-6 text-center text-sm text-slate-500">
              No hay más canciones disponibles en este tono.
              {otherCount > 0 && (
                <>
                  {" "}
                  Tienes {otherCount} en otros tonos; transpónlas desde{" "}
                  <Link href="/dashboard/canciones" className="font-medium text-indigo-600">
                    Canciones
                  </Link>
                  .
                </>
              )}
            </div>
          ) : (
            <ul className="space-y-2">
              {candidates.map((s) => (
                <li key={s.id} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">{s.title}</p>
                    <p className="truncate text-xs text-slate-500">{s.artist}</p>
                  </div>
                  <RhythmPill rhythm={s.rhythm} />
                  <button
                    onClick={() => addSong(s)}
                    aria-label={`Agregar ${s.title}`}
                    className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-600 text-white hover:bg-indigo-500"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <Modal open={editing} onClose={() => setEditing(false)} title="Editar popurrí">
        <form onSubmit={saveMeta} className="space-y-4">
          <Field label="Nombre">
            <input
              className={inputCls}
              required
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            />
          </Field>
          <Field label="Descripción">
            <textarea
              rows={3}
              className={inputCls}
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
            />
          </Field>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setEditing(false)}>
              Cancelar
            </Button>
            <Button type="submit">Guardar</Button>
          </div>
        </form>
      </Modal>

      <Modal open={deleting} onClose={() => setDeleting(false)} title="Eliminar popurrí">
        <p className="text-sm text-slate-600">
          ¿Eliminar <b>{m.name}</b>? Las canciones seguirán en tu repertorio.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setDeleting(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={deleteMedley}>
            Eliminar
          </Button>
        </div>
      </Modal>
    </div>
  );
}
