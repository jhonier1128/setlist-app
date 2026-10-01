export interface Song {
  id: string
  title: string
  artist?: string
  key: string
  originalKey?: string
  bpm?: number
  timeSignature?: string
  duration?: number
  capo?: number
  tuning?: string
  lyricChordPro?: string
  notes?: string
  sections?: string
  audioRef?: string
  youtubeUrl?: string
  spotifyUrl?: string
  createdAt: Date
  updatedAt: Date
}

export interface Setlist {
  id: string
  name: string
  description?: string
  songOrder: string[]
  estimatedDuration?: number
  createdAt: Date
  updatedAt: Date
}

export interface SetlistSong {
  id: string
  setlistId: string
  songId: string
  position: number
  customKey?: string
  notes?: string
}

export interface RehearsalSession {
  id: string
  setlistId: string
  date: Date
  duration?: number
  notes?: string
  songsPlayed?: string[]
}

export interface ChordLine {
  chords: string[]
  lyrics: string
}

export interface SongSection {
  name: string
  lines: ChordLine[]
}

export interface ParsedSong {
  title: string
  artist?: string
  key: string
  tempo?: number
  timeSignature?: string
  capo?: number
  sections: SongSection[]
  metadata: Record<string, string>
}

export type KeyType =
  | 'C'
  | 'C#'
  | 'Db'
  | 'D'
  | 'D#'
  | 'Eb'
  | 'E'
  | 'F'
  | 'F#'
  | 'Gb'
  | 'G'
  | 'G#'
  | 'Ab'
  | 'A'
  | 'A#'
  | 'Bb'
  | 'B'

export const KEYS: KeyType[] = [
  'C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B'
]

export const KEY_ALIASES: Record<string, KeyType> = {
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