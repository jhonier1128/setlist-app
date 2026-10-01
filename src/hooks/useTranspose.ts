'use client'

import { useCallback, useMemo } from 'react'
import { transposeChord, transposeLine } from '@/utils/chordpro'
import { KEY_TO_SEMITONE, SEMITONE_TO_KEY_SHARP, SEMITONE_TO_KEY_FLAT } from '@/constants'

export function useTranspose() {
  const transposeChordFn = useCallback(
    (chord: string, semitones: number, preferFlats = false): string => {
      return transposeChord(chord, semitones, preferFlats)
    },
    []
  )

  const transposeKey = useCallback(
    (key: string, semitones: number, preferFlats = false): string => {
      const baseSemitone = KEY_TO_SEMITONE[key.toUpperCase() as keyof typeof KEY_TO_SEMITONE]
      if (baseSemitone === undefined) return key
      const newSemitone = (baseSemitone + semitones + 120) % 12
      return preferFlats ? SEMITONE_TO_KEY_FLAT[newSemitone] : SEMITONE_TO_KEY_SHARP[newSemitone]
    },
    []
  )

  const transposeText = useCallback(
    (text: string, semitones: number, preferFlats = false): string => {
      return transposeLine(text, semitones, preferFlats)
    },
    []
  )

  const getTransposeOptions = useMemo(
    () => Array.from({ length: 23 }, (_, i) => i - 11).map((semitones) => ({
      semitones,
      label: semitones === 0 ? 'Original' : semitones > 0 ? `+${semitones}` : `${semitones}`,
    })),
    []
  )

  return {
    transposeChord: transposeChordFn,
    transposeKey,
    transposeText,
    transposeOptions: getTransposeOptions,
  }
}