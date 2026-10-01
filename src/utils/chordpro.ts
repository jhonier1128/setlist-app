import type { ParsedSong, SongSection, ChordLine } from '@/types'
import { KEYS, KEY_TO_SEMITONE, SEMITONE_TO_KEY_SHARP, SEMITONE_TO_KEY_FLAT, COMMON_CHORD_PATTERN } from '@/constants'

const CHORDPRO_DIRECTIVES = /^\s*{(title|artist|key|tempo|time|capo|meta|comment|start_of_chorus|end_of_chorus|start_of_verse|end_of_verse|start_of_bridge|end_of_bridge|start_of_tab|end_of_tab|soc|eoc|sov|eov|sob|eob|sot|eot):?\s*(.*?)}\s*$/i
const CHORD_INLINE = /\[([^\]]+)\]/g

function normalizeKey(key: string): string {
  const upper = key.trim().toUpperCase()
  return KEYS.includes(upper as any) ? upper : 'C'
}

export function transposeChord(chord: string, semitones: number, preferFlats = false): string {
  const match = chord.match(/^([A-Ga-g][#b]?)(.*)$/)
  if (!match) return chord

  const [, root, quality] = match
  const rootUpper = root.toUpperCase()
  const baseSemitone = KEY_TO_SEMITONE[rootUpper as keyof typeof KEY_TO_SEMITONE]
  if (baseSemitone === undefined) return chord

  const newSemitone = (baseSemitone + semitones + 120) % 12
  const newRoot = preferFlats ? SEMITONE_TO_KEY_FLAT[newSemitone] : SEMITONE_TO_KEY_SHARP[newSemitone]

  return `${newRoot}${quality}`
}

export function transposeLine(line: string, semitones: number, preferFlats = false): string {
  return line.replace(COMMON_CHORD_PATTERN, (match) => transposeChord(match, semitones, preferFlats))
}

export function parseChordPro(text: string): ParsedSong {
  const lines = text.split('\n')
  const metadata: Record<string, string> = {}
  const sections: SongSection[] = []
  let currentSection: SongSection = { name: 'Intro', lines: [] }
  let inTab = false

  for (const rawLine of lines) {
    const line = rawLine.trimEnd()

    if (inTab) {
      if (/{end_of_tab}|{eot}/i.test(line)) {
        inTab = false
      }
      currentSection.lines.push({ chords: [], lyrics: line })
      continue
    }

    const directiveMatch = line.match(CHORDPRO_DIRECTIVES)
    if (directiveMatch) {
      const [, directive, value] = directiveMatch
      const dir = directive.toLowerCase()

      if (['title', 't', 'artist', 'a', 'key', 'k', 'tempo', 'time', 'capo'].includes(dir)) {
        metadata[dir] = value.trim()
      }

      if (['start_of_chorus', 'soc', 'start_of_verse', 'sov', 'start_of_bridge', 'sob'].includes(dir)) {
        if (currentSection.lines.length > 0 || currentSection.name !== 'Intro') {
          sections.push(currentSection)
        }
        currentSection = { name: value.trim() || directive.replace('start_of_', '').replace('_', ' '), lines: [] }
      } else if (['end_of_chorus', 'eoc', 'end_of_verse', 'eov', 'end_of_bridge', 'eob'].includes(dir)) {
        if (currentSection.lines.length > 0) {
          sections.push(currentSection)
        }
        currentSection = { name: 'Outro', lines: [] }
      } else if (['start_of_tab', 'sot'].includes(dir)) {
        inTab = true
      }
      continue
    }

    if (!line && currentSection.lines.length === 0) continue

    const chordLines: string[] = []
    let lyricsLine = line
    let match: RegExpExecArray | null

    while ((match = CHORD_INLINE.exec(line)) !== null) {
      chordLines.push(match[1])
    }

    if (chordLines.length > 0) {
      lyricsLine = line.replace(CHORD_INLINE, '').trim()
    }

    const chordMatches = line.match(COMMON_CHORD_PATTERN) || []

    currentSection.lines.push({
      chords: chordMatches,
      lyrics: lyricsLine,
    })
  }

  if (currentSection.lines.length > 0) {
    sections.push(currentSection)
  }

  return {
    title: metadata.title || metadata.t || 'Sin título',
    artist: metadata.artist || metadata.a,
    key: normalizeKey(metadata.key || metadata.k || 'C'),
    tempo: metadata.tempo ? parseInt(metadata.tempo, 10) : undefined,
    timeSignature: metadata.time,
    capo: metadata.capo ? parseInt(metadata.capo, 10) : undefined,
    sections,
    metadata,
  }
}

export function transposeSong(parsed: ParsedSong, semitones: number, preferFlats = false): ParsedSong {
  const newKeySemitone = (KEY_TO_SEMITONE[parsed.key as keyof typeof KEY_TO_SEMITONE] + semitones + 120) % 12
  const newKey = preferFlats ? SEMITONE_TO_KEY_FLAT[newKeySemitone] : SEMITONE_TO_KEY_SHARP[newKeySemitone]

  return {
    ...parsed,
    key: newKey,
    sections: parsed.sections.map((section) => ({
      ...section,
      lines: section.lines.map((line) => ({
        ...line,
        chords: line.chords.map((c) => transposeChord(c, semitones, preferFlats)),
        lyrics: transposeLine(line.lyrics, semitones, preferFlats),
      })),
    })),
  }
}

export function renderChordPro(parsed: ParsedSong): string {
  let output = `{title: ${parsed.title}}\n`
  if (parsed.artist) output += `{artist: ${parsed.artist}}\n`
  output += `{key: ${parsed.key}}\n`
  if (parsed.tempo) output += `{tempo: ${parsed.tempo}}\n`
  if (parsed.timeSignature) output += `{time: ${parsed.timeSignature}}\n`
  if (parsed.capo) output += `{capo: ${parsed.capo}}\n`
  output += '\n'

  for (const section of parsed.sections) {
    output += `{comment: ${section.name}}\n`
    for (const line of section.lines) {
      if (line.chords.length > 0 && line.lyrics) {
        let result = line.lyrics
        let chordIndex = 0
        result = result.replace(/(\S+)/g, () => {
          if (chordIndex < line.chords.length) {
            return `[${line.chords[chordIndex++]}]`
          }
          return ''
        })
        output += result + '\n'
      } else if (line.chords.length > 0) {
        output += line.chords.map((c) => `[${c}]`).join(' ') + '\n'
      } else {
        output += line.lyrics + '\n'
      }
    }
    output += '\n'
  }

  return output.trim()
}

export function chordsFromText(text: string): string[] {
  const matches = text.match(COMMON_CHORD_PATTERN)
  return matches || []
}

export function detectKeyFromChords(chords: string[]): string {
  const counts: Record<string, number> = {}
  for (const chord of chords) {
    const match = chord.match(/^([A-Ga-g][#b]?)/)
    if (match) {
      const root = match[1].toUpperCase()
      counts[root] = (counts[root] || 0) + 1
    }
  }
  let maxKey = 'C'
  let maxCount = 0
  for (const [key, count] of Object.entries(counts)) {
    if (count > maxCount) {
      maxCount = count
      maxKey = key
    }
  }
  return maxKey
}