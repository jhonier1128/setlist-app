export const KEYS = [
  'C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B'
] as const

export type Key = typeof KEYS[number]

export const KEY_ALIASES: Record<string, Key> = {
  'C': 'C',
  'C#': 'C#', 'Db': 'Db',
  'D': 'D',
  'D#': 'D#', 'Eb': 'Eb',
  'E': 'E',
  'F': 'F',
  'F#': 'F#', 'Gb': 'Gb',
  'G': 'G',
  'G#': 'G#', 'Ab': 'Ab',
  'A': 'A',
  'A#': 'A#', 'Bb': 'Bb',
  'B': 'B',
  'Cb': 'B',
  'E#': 'F',
  'B#': 'C',
}

export const KEY_TO_SEMITONE: Record<Key, number> = {
  'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
  'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8, 'Ab': 8,
  'A': 9, 'A#': 10, 'Bb': 10, 'B': 11
}

export const SEMITONE_TO_KEY_SHARP: Record<number, Key> = {
  0: 'C', 1: 'C#', 2: 'D', 3: 'D#', 4: 'E', 5: 'F',
  6: 'F#', 7: 'G', 8: 'G#', 9: 'A', 10: 'A#', 11: 'B'
}

export const SEMITONE_TO_KEY_FLAT: Record<number, Key> = {
  0: 'C', 1: 'Db', 2: 'D', 3: 'Eb', 4: 'E', 5: 'F',
  6: 'Gb', 7: 'G', 8: 'Ab', 9: 'A', 10: 'Bb', 11: 'B'
}

export const CHORD_QUALITIES = [
  '', 'm', '7', 'm7', 'maj7', '6', 'm6', '9', 'm9', '13',
  'sus2', 'sus4', 'dim', 'dim7', 'aug', '7sus4', 'add9'
] as const

export const COMMON_CHORD_PATTERN =
  /([A-Ga-g][#b]?)(m?)(maj7|7|6|9|13|sus2|sus4|dim7|dim|aug|add9|m7|m6|m9)?(\/[A-Ga-g][#b]?)?/g

export const TIME_SIGNATURES = ['4/4', '3/4', '6/8', '2/4', '12/8', '5/4', '7/8'] as const

export const DEFAULT_TEMPO = 120
export const MIN_TEMPO = 40
export const MAX_TEMPO = 280

export const FONT_SIZES = {
  small: 'chord-text',
  medium: 'chord-text-lg',
  large: 'chord-text-xl',
} as const

export const AUTO_SCROLL_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2, 3] as const