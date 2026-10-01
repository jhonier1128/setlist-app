export const NOTES = ["C", "Db", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"] as const;

const ALIASES: Record<string, number> = {
  C: 0, "B#": 0,
  "C#": 1, Db: 1,
  D: 2,
  "D#": 3, Eb: 3,
  E: 4, Fb: 4,
  F: 5, "E#": 5,
  "F#": 6, Gb: 6,
  G: 7,
  "G#": 8, Ab: 8,
  A: 9,
  "A#": 10, Bb: 10,
  B: 11, Cb: 11,
};

export const ALL_KEYS: string[] = [...NOTES, ...NOTES.map((n) => n + "m")];

export const RHYTHMS = ["Lento", "Medio", "Rápido", "6/8"] as const;
export type Rhythm = (typeof RHYTHMS)[number];

export const RHYTHM_META: Record<string, { label: string; hint: string; color: string; dot: string }> = {
  Lento: { label: "Lento", hint: "Adoración íntima", color: "bg-sky-50 text-sky-700 ring-sky-200", dot: "bg-sky-500" },
  Medio: { label: "Medio", hint: "Medio tiempo", color: "bg-violet-50 text-violet-700 ring-violet-200", dot: "bg-violet-500" },
  "Rápido": { label: "Rápido", hint: "Celebración", color: "bg-amber-50 text-amber-700 ring-amber-200", dot: "bg-amber-500" },
  "6/8": { label: "6/8", hint: "Compás ternario", color: "bg-emerald-50 text-emerald-700 ring-emerald-200", dot: "bg-emerald-500" },
};

export function parseKey(key: string): { root: number; minor: boolean } | null {
  const m = /^([A-G][#b]?)(m?)$/.exec(key.trim());
  if (!m) return null;
  const root = ALIASES[m[1]];
  if (root === undefined) return null;
  return { root, minor: m[2] === "m" };
}

export function isValidKey(key: string): boolean {
  return parseKey(key) !== null;
}

export function transposeKey(key: string, semitones: number): string {
  const p = parseKey(key);
  if (!p) return key;
  const idx = (((p.root + semitones) % 12) + 12) % 12;
  return NOTES[idx] + (p.minor ? "m" : "");
}

/** Semitone distance (0..11) going up from `from` to `to`. */
export function semitoneDiff(from: string, to: string): number {
  const a = parseKey(from);
  const b = parseKey(to);
  if (!a || !b) return 0;
  return (((b.root - a.root) % 12) + 12) % 12;
}

/** Normalizes enharmonic spellings (C# -> Db) so same keys compare equal. */
export function normalizeKey(key: string): string {
  const p = parseKey(key);
  if (!p) return key;
  return NOTES[p.root] + (p.minor ? "m" : "");
}

export function sameKey(a: string, b: string): boolean {
  return normalizeKey(a) === normalizeKey(b);
}

/** Sort order index of a key (C major ... B major, then minors). */
export function keyOrder(key: string): number {
  const p = parseKey(key);
  if (!p) return 99;
  return p.root + (p.minor ? 12 : 0);
}

export type Voice = "male" | "female";
export const VOICE_LABEL: Record<Voice, string> = { male: "Hombre", female: "Mujer" };
