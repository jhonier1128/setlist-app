import type { songs } from "@/db/schema";
import { isValidKey, RHYTHMS } from "./music";

export function parseSongBody(body: Record<string, unknown> | null, partial = false) {
  const out: Partial<typeof songs.$inferInsert> = {};
  const err = (m: string) => ({ error: m as string | null, data: out });
  if (!body) return err("Datos inválidos");
  if (!partial || body.title !== undefined) {
    const t = String(body.title ?? "").trim();
    if (!t) return err("El título es obligatorio");
    out.title = t.slice(0, 120);
  }
  if (body.artist !== undefined) out.artist = String(body.artist).trim().slice(0, 120);
  if (!partial || body.keyMale !== undefined) {
    const k = String(body.keyMale ?? "");
    if (!isValidKey(k)) return err("Tonalidad de hombre no válida");
    out.keyMale = k;
  }
  if (!partial || body.keyFemale !== undefined) {
    const k = String(body.keyFemale ?? "");
    if (!isValidKey(k)) return err("Tonalidad de mujer no válida");
    out.keyFemale = k;
  }
  if (body.rhythm !== undefined) {
    if (!(RHYTHMS as readonly string[]).includes(String(body.rhythm))) return err("Ritmo no válido");
    out.rhythm = String(body.rhythm);
  }
  if (body.bpm !== undefined) {
    if (body.bpm === null || body.bpm === "") out.bpm = null;
    else {
      const n = Number(body.bpm);
      if (!Number.isFinite(n) || n < 30 || n > 260) return err("BPM entre 30 y 260");
      out.bpm = Math.round(n);
    }
  }
  if (body.notes !== undefined) out.notes = String(body.notes).slice(0, 1000);
  return { error: null as string | null, data: out };
}
