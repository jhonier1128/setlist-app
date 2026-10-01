"use client";

import { useMemo, useState } from "react";
import {
  ArrowDownAZ,
  ChevronDown,
  ChevronUp,
  ListMusic,
  Pencil,
  Plus,
  Search,
  Trash2,
  Loader2,
} from "lucide-react";
import {
  keyOrder,
  NOTES,
  RHYTHM_META,
  RHYTHMS,
  sameKey,
  transposeKey,
  type Voice,
} from "@/lib/music";
import type { SongDTO } from "@/lib/types";
import { api, Button, EmptyState, Field, inputCls, KeyBadge, Modal, useToast } from "./ui";

type View = "list" | "key" | "rhythm";
type SongInput = {
  title: string;
  artist: string;
  keyMale: string;
  keyFemale: string;
  rhythm: string;
  bpm: string;
  notes: string;
};

const emptyForm: SongInput = {
  title: "",
  artist: "",
  keyMale: "G",
  keyFemale: "C",
  rhythm: "Lento",
  bpm: "",
  notes: "",
};

function KeySelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <select className={inputCls} value={value} onChange={(e) => onChange(e.target.value)}>
      <optgroup label="Mayores">
        {NOTES.map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </optgroup>
      <optgroup label="Menores">
        {NOTES.map((n) => (
          <option key={n + "m"} value={n + "m"}>
            {n}m
          </option>
        ))}
      </optgroup>
    </select>
  );
}

export function RhythmPill({ rhythm }: { rhythm: string }) {
  const m = RHYTHM_META[rhythm] ?? RHYTHM_META.Medio;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium ring-1 ring-inset ${m.color}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${m.dot}`} />
      {m.label}
    </span>
  );
}

function SongForm({
  initial,
  onSubmit,
  onCancel,
  saving,
}: {
  initial: SongInput;
  onSubmit: (v: SongInput) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [f, setF] = useState(initial);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(f);
      }}
      className="space-y-4"
    >
      <Field label="Título">
        <input
          className={inputCls}
          required
          autoFocus
          value={f.title}
          onChange={(e) => setF({ ...f, title: e.target.value })}
          placeholder="Ej. Cuán Grande es Él"
        />
      </Field>
      <Field label="Artista / Ministerio">
        <input
          className={inputCls}
          value={f.artist}
          onChange={(e) => setF({ ...f, artist: e.target.value })}
          placeholder="Ej. Hillsong"
        />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="♂ Tono para hombre">
          <KeySelect value={f.keyMale} onChange={(v) => setF({ ...f, keyMale: v })} />
        </Field>
        <Field label="♀ Tono para mujer">
          <KeySelect value={f.keyFemale} onChange={(v) => setF({ ...f, keyFemale: v })} />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Ritmo">
          <select className={inputCls} value={f.rhythm} onChange={(e) => setF({ ...f, rhythm: e.target.value })}>
            {RHYTHMS.map((r) => (
              <option key={r} value={r}>
                {r} — {RHYTHM_META[r].hint}
              </option>
            ))}
          </select>
        </Field>
        <Field label="BPM (opcional)">
          <input
            type="number"
            min={30}
            max={260}
            className={inputCls}
            value={f.bpm}
            onChange={(e) => setF({ ...f, bpm: e.target.value })}
            placeholder="72"
          />
        </Field>
      </div>
      <Field label="Notas (opcional)">
        <textarea
          rows={3}
          className={inputCls}
          value={f.notes}
          onChange={(e) => setF({ ...f, notes: e.target.value })}
          placeholder="Intro, dinámicas, acordes especiales…"
        />
      </Field>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" loading={saving}>
          Guardar canción
        </Button>
      </div>
    </form>
  );
}

function SongRow({
  song,
  voice,
  onEdit,
  onDelete,
  onTranspose,
}: {
  song: SongDTO;
  voice: Voice;
  onEdit: () => void;
  onDelete: () => void;
  onTranspose: (n: number) => void;
}) {
  const pending = song.id < 0;
  return (
    <div
      className={`group flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-indigo-200 hover:shadow-sm sm:flex-row sm:items-center ${
        pending ? "opacity-60" : ""
      }`}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate font-medium text-slate-900">{song.title}</p>
          {pending && <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" />}
        </div>
        <p className="truncate text-sm text-slate-500">
          {song.artist || "Sin artista"}
          {song.bpm ? ` · ${song.bpm} BPM` : ""}
        </p>
        {song.notes && <p className="mt-1 line-clamp-1 text-xs text-slate-400">{song.notes}</p>}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <KeyBadge value={song.keyMale} label="♂" tone={voice === "male" ? "indigo" : "slate"} />
        <KeyBadge value={song.keyFemale} label="♀" tone={voice === "female" ? "rose" : "slate"} />
        <RhythmPill rhythm={song.rhythm} />
      </div>
      <div className="flex items-center gap-1 sm:opacity-60 sm:transition sm:group-hover:opacity-100">
        <button
          onClick={() => onTranspose(-1)}
          disabled={pending}
          title="Bajar medio tono"
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-40"
        >
          <ChevronDown className="h-4 w-4" />
        </button>
        <button
          onClick={() => onTranspose(1)}
          disabled={pending}
          title="Subir medio tono"
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-40"
        >
          <ChevronUp className="h-4 w-4" />
        </button>
        <button
          onClick={onEdit}
          disabled={pending}
          title="Editar"
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-40"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          onClick={onDelete}
          disabled={pending}
          title="Eliminar"
          className="rounded-lg p-2 text-rose-500 hover:bg-rose-50 disabled:opacity-40"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default function SongsManager({ initialSongs }: { initialSongs: SongDTO[] }) {
  const toast = useToast();
  const [songs, setSongs] = useState(initialSongs);
  const [view, setView] = useState<View>("key");
  const [voice, setVoice] = useState<Voice>("male");
  const [query, setQuery] = useState("");
  const [rhythmFilter, setRhythmFilter] = useState<string>("all");
  const [keyFilter, setKeyFilter] = useState<string>("all");
  const [sort, setSort] = useState<"title" | "key" | "bpm">("title");
  const [editing, setEditing] = useState<SongDTO | "new" | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<SongDTO | null>(null);

  const keyOf = (s: SongDTO) => (voice === "male" ? s.keyMale : s.keyFemale);

  const availableKeys = useMemo(
    () => Array.from(new Set(songs.map((s) => (voice === "male" ? s.keyMale : s.keyFemale)))).sort((a, b) => keyOrder(a) - keyOrder(b)),
    [songs, voice],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return songs.filter((s) => {
      if (q && !(s.title + " " + s.artist).toLowerCase().includes(q)) return false;
      if (rhythmFilter !== "all" && s.rhythm !== rhythmFilter) return false;
      if (keyFilter !== "all" && !sameKey(keyOf(s), keyFilter)) return false;
      return true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [songs, query, rhythmFilter, keyFilter, voice]);

  const groups = useMemo(() => {
    const byTitle = (a: SongDTO, b: SongDTO) => a.title.localeCompare(b.title, "es");
    if (view === "key") {
      const map = new Map<string, SongDTO[]>();
      filtered.forEach((s) => {
        const k = keyOf(s);
        map.set(k, [...(map.get(k) ?? []), s]);
      });
      return [...map.entries()]
        .sort((a, b) => keyOrder(a[0]) - keyOrder(b[0]))
        .map(([k, list]) => ({ id: k, title: `Tonalidad ${k}`, badge: k, list: list.sort(byTitle) }));
    }
    if (view === "rhythm") {
      return RHYTHMS.map((r) => ({
        id: r,
        title: `${r} · ${RHYTHM_META[r].hint}`,
        badge: r,
        list: filtered
          .filter((s) => s.rhythm === r)
          .sort((a, b) => keyOrder(keyOf(a)) - keyOrder(keyOf(b)) || byTitle(a, b)),
      })).filter((g) => g.list.length);
    }
    const sorted = [...filtered].sort((a, b) =>
      sort === "key"
        ? keyOrder(keyOf(a)) - keyOrder(keyOf(b)) || byTitle(a, b)
        : sort === "bpm"
          ? (a.bpm ?? 999) - (b.bpm ?? 999)
          : byTitle(a, b),
    );
    return [{ id: "all", title: "", badge: "", list: sorted }];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered, view, voice, sort]);

  /* ---------- mutations (optimistic) ---------- */
  async function save(v: SongInput) {
    const payload = {
      title: v.title.trim(),
      artist: v.artist.trim(),
      keyMale: v.keyMale,
      keyFemale: v.keyFemale,
      rhythm: v.rhythm,
      bpm: v.bpm === "" ? null : Number(v.bpm),
      notes: v.notes.trim(),
    };
    const target = editing;
    setSaving(true);
    if (target === "new") {
      const tempId = -Date.now();
      setSongs((s) => [...s, { id: tempId, ...payload }]);
      setEditing(null);
      try {
        const created = await api<SongDTO>("/api/songs", "POST", payload);
        setSongs((s) => s.map((x) => (x.id === tempId ? created : x)));
        toast("Canción agregada");
      } catch (e) {
        setSongs((s) => s.filter((x) => x.id !== tempId));
        toast((e as Error).message, "err");
      }
    } else if (target) {
      const prev = songs;
      setSongs((s) => s.map((x) => (x.id === target.id ? { ...x, ...payload } : x)));
      setEditing(null);
      try {
        const updated = await api<SongDTO>(`/api/songs/${target.id}`, "PATCH", payload);
        setSongs((s) => s.map((x) => (x.id === target.id ? updated : x)));
        toast("Canción actualizada");
      } catch (e) {
        setSongs(prev);
        toast((e as Error).message, "err");
      }
    }
    setSaving(false);
  }

  async function remove(song: SongDTO) {
    const prev = songs;
    setSongs((s) => s.filter((x) => x.id !== song.id));
    setDeleting(null);
    try {
      await api(`/api/songs/${song.id}`, "DELETE");
      toast(`“${song.title}” eliminada`);
    } catch (e) {
      setSongs(prev);
      toast((e as Error).message, "err");
    }
  }

  async function transpose(song: SongDTO, n: number) {
    const prev = songs;
    setSongs((s) =>
      s.map((x) =>
        x.id === song.id
          ? { ...x, keyMale: transposeKey(x.keyMale, n), keyFemale: transposeKey(x.keyFemale, n) }
          : x,
      ),
    );
    try {
      await api(`/api/songs/${song.id}`, "PATCH", { transpose: n });
    } catch (e) {
      setSongs(prev);
      toast((e as Error).message, "err");
    }
  }

  const tabs: { id: View; label: string }[] = [
    { id: "key", label: "Por tonalidad" },
    { id: "rhythm", label: "Por ritmo" },
    { id: "list", label: "Lista" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Mis canciones</h1>
          <p className="text-sm text-slate-500">
            {songs.length} {songs.length === 1 ? "canción" : "canciones"} en tu repertorio
          </p>
        </div>
        <Button onClick={() => setEditing("new")}>
          <Plus className="h-4 w-4" /> Nueva canción
        </Button>
      </div>

      {/* controls */}
      <div className="space-y-3 rounded-3xl border border-slate-200 bg-white p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              className={inputCls + " pl-10"}
              placeholder="Buscar por título o artista…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="flex rounded-xl bg-slate-100 p-1 text-sm">
            {(["male", "female"] as Voice[]).map((v) => (
              <button
                key={v}
                onClick={() => {
                  setVoice(v);
                  setKeyFilter("all");
                }}
                className={`flex-1 rounded-lg px-4 py-1.5 font-medium transition ${
                  voice === v
                    ? v === "male"
                      ? "bg-white text-indigo-700 shadow-sm"
                      : "bg-white text-rose-700 shadow-sm"
                    : "text-slate-500"
                }`}
              >
                {v === "male" ? "♂ Hombre" : "♀ Mujer"}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex rounded-xl bg-slate-100 p-1 text-sm">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setView(t.id)}
                className={`flex-1 rounded-lg px-4 py-1.5 font-medium transition lg:flex-none ${
                  view === t.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              className={inputCls + " !w-auto !py-2"}
              value={keyFilter}
              onChange={(e) => setKeyFilter(e.target.value)}
              aria-label="Filtrar por tonalidad"
            >
              <option value="all">Todos los tonos</option>
              {availableKeys.map((k) => (
                <option key={k} value={k}>
                  Tono {k}
                </option>
              ))}
            </select>
            <select
              className={inputCls + " !w-auto !py-2"}
              value={rhythmFilter}
              onChange={(e) => setRhythmFilter(e.target.value)}
              aria-label="Filtrar por ritmo"
            >
              <option value="all">Todos los ritmos</option>
              {RHYTHMS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            {view === "list" && (
              <div className="relative">
                <ArrowDownAZ className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <select
                  className={inputCls + " !w-auto !py-2 !pl-9"}
                  value={sort}
                  onChange={(e) => setSort(e.target.value as "title" | "key" | "bpm")}
                  aria-label="Ordenar"
                >
                  <option value="title">Título</option>
                  <option value="key">Tonalidad</option>
                  <option value="bpm">BPM</option>
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* content */}
      {songs.length === 0 ? (
        <EmptyState
          icon={<ListMusic className="h-6 w-6" />}
          title="Aún no tienes canciones"
          text="Agrega tu primera canción con su tonalidad para hombre y para mujer."
          action={
            <Button onClick={() => setEditing("new")}>
              <Plus className="h-4 w-4" /> Agregar canción
            </Button>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Search className="h-6 w-6" />}
          title="Sin resultados"
          text="Prueba con otra búsqueda o quita los filtros."
          action={
            <Button
              variant="secondary"
              onClick={() => {
                setQuery("");
                setRhythmFilter("all");
                setKeyFilter("all");
              }}
            >
              Limpiar filtros
            </Button>
          }
        />
      ) : (
        <div className="space-y-8">
          {groups.map((g) => (
            <section key={g.id} className="animate-pop">
              {g.title && (
                <div className="mb-3 flex items-center gap-3">
                  <span
                    className={`grid h-10 min-w-10 place-items-center rounded-xl px-2 text-sm font-bold text-white ${
                      view === "key"
                        ? voice === "male"
                          ? "bg-gradient-to-br from-indigo-600 to-violet-600"
                          : "bg-gradient-to-br from-rose-500 to-pink-600"
                        : "bg-gradient-to-br from-slate-700 to-slate-900"
                    }`}
                  >
                    {g.badge}
                  </span>
                  <div>
                    <h2 className="font-semibold text-slate-900">{g.title}</h2>
                    <p className="text-xs text-slate-500">
                      {g.list.length} {g.list.length === 1 ? "canción" : "canciones"}
                    </p>
                  </div>
                </div>
              )}
              <div className="space-y-2">
                {g.list.map((s) => (
                  <SongRow
                    key={s.id}
                    song={s}
                    voice={voice}
                    onEdit={() => setEditing(s)}
                    onDelete={() => setDeleting(s)}
                    onTranspose={(n) => transpose(s, n)}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing === "new" ? "Nueva canción" : "Editar canción"}
      >
        {editing !== null && (
          <SongForm
            key={editing === "new" ? "new" : editing.id}
            initial={
              editing === "new"
                ? emptyForm
                : {
                    title: editing.title,
                    artist: editing.artist,
                    keyMale: editing.keyMale,
                    keyFemale: editing.keyFemale,
                    rhythm: editing.rhythm,
                    bpm: editing.bpm?.toString() ?? "",
                    notes: editing.notes,
                  }
            }
            onSubmit={save}
            onCancel={() => setEditing(null)}
            saving={saving}
          />
        )}
      </Modal>

      <Modal open={deleting !== null} onClose={() => setDeleting(null)} title="Eliminar canción">
        <p className="text-sm text-slate-600">
          ¿Seguro que quieres eliminar <b>{deleting?.title}</b>? También se quitará de los popurrís donde esté.
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

