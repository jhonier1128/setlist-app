import { describe, it, expect } from 'vitest'
import { parseChordPro, transposeSong, renderChordPro, transposeChord } from '@/utils/chordpro'
import { KEYS, KEY_TO_SEMITONE } from '@/constants'

describe('chordpro utils', () => {
  const sampleChordPro = `{title: Test Song}
{artist: Test Artist}
{key: C}
{tempo: 120}
{time: 4/4}

{start_of_verse}
[C]This is the [F]first [G]verse
With [C]chords in [F]line
{end_of_verse}

{start_of_chorus}
[C]This is the [G]chorus [Am]that [F]sounds
[C]Very [G]well [F]together
{end_of_chorus}`

  describe('parseChordPro', () => {
    it('parses title, artist, key', () => {
      const parsed = parseChordPro(sampleChordPro)
      expect(parsed.title).toBe('Test Song')
      expect(parsed.artist).toBe('Test Artist')
      expect(parsed.key).toBe('C')
    })

    it('parses tempo and time signature', () => {
      const parsed = parseChordPro(sampleChordPro)
      expect(parsed.tempo).toBe(120)
      expect(parsed.timeSignature).toBe('4/4')
    })

    it('parses sections with chords and lyrics', () => {
      const parsed = parseChordPro(sampleChordPro)
      expect(parsed.sections.length).toBeGreaterThan(0)
      const verse = parsed.sections.find(s => s.name.toLowerCase().includes('verse'))
      expect(verse).toBeDefined()
      expect(verse!.lines.length).toBeGreaterThan(0)
    })
  })

  describe('transposeChord', () => {
    it('transposes major chords up', () => {
      expect(transposeChord('C', 2)).toBe('D')
      expect(transposeChord('G', 5)).toBe('C')
    })

    it('transposes minor chords', () => {
      expect(transposeChord('Am', 2)).toBe('Bm')
      expect(transposeChord('Em', -2)).toBe('Dm')
    })

    it('transposes chords with extensions', () => {
      expect(transposeChord('Cmaj7', 2)).toBe('Dmaj7')
      expect(transposeChord('G7', 5)).toBe('C7')
      expect(transposeChord('F#m7b5', 1)).toBe('Gm7b5')
    })

    it('handles flats correctly', () => {
      expect(transposeChord('Bb', 2)).toBe('C')
      expect(transposeChord('Eb', -1)).toBe('D')
    })

    it('wraps around octave', () => {
      expect(transposeChord('B', 1)).toBe('C')
      expect(transposeChord('C', -1)).toBe('B')
    })
  })

  describe('transposeSong', () => {
    it('transposes song key correctly', () => {
      const parsed = parseChordPro(sampleChordPro)
      const transposed = transposeSong(parsed, 2)
      expect(transposed.key).toBe('D')
    })

    it('transposes all chords in sections', () => {
      const parsed = parseChordPro(sampleChordPro)
      const transposed = transposeSong(parsed, 2)
      for (const section of transposed.sections) {
        for (const line of section.lines) {
          for (const chord of line.chords) {
            expect(KEYS).toContain(chord.replace(/[^A-G#b].*/, ''))
          }
        }
      }
    })

    it('preserves lyrics', () => {
      const parsed = parseChordPro(sampleChordPro)
      const transposed = transposeSong(parsed, 3)
      expect(transposed.sections[0].lines[0].lyrics).toBe(parsed.sections[0].lines[0].lyrics)
    })
  })

  describe('renderChordPro', () => {
    it('outputs valid ChordPro format', () => {
      const parsed = parseChordPro(sampleChordPro)
      const rendered = renderChordPro(parsed)
      expect(rendered).toContain('{title: Test Song}')
      expect(rendered).toContain('{artist: Test Artist}')
      expect(rendered).toContain('{key: C}')
    })

    it('includes chords in brackets', () => {
      const parsed = parseChordPro(sampleChordPro)
      const rendered = renderChordPro(parsed)
      expect(rendered).toContain('[C]')
      expect(rendered).toContain('[F]')
      expect(rendered).toContain('[G]')
    })
  })

  describe('KEYS constants', () => {
    it('contains all 12 chromatic keys with enharmonics', () => {
      expect(KEYS.length).toBe(17)
      expect(KEYS).toContain('C')
      expect(KEYS).toContain('C#')
      expect(KEYS).toContain('Db')
      expect(KEYS).toContain('F#')
      expect(KEYS).toContain('Gb')
    })

    it('KEY_TO_SEMITONE maps correctly', () => {
      expect(KEY_TO_SEMITONE.C).toBe(0)
      expect(KEY_TO_SEMITONE['C#']).toBe(1)
      expect(KEY_TO_SEMITONE.Db).toBe(1)
      expect(KEY_TO_SEMITONE.F).toBe(5)
      expect(KEY_TO_SEMITONE.B).toBe(11)
    })
  })
})