import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { RehearsalSession } from '@/types'

interface RehearsalState {
  sessions: RehearsalSession[]
  currentSession: RehearsalSession | null
  autoScrollSpeed: number
  fontSize: 'small' | 'medium' | 'large'
  transpose: number
  showMetronome: boolean
  metronomeBpm: number
  metronomeTimeSignature: string
  keepScreenOn: boolean
  lockRotation: boolean
  darkMode: boolean

  setSessions: (sessions: RehearsalSession[]) => void
  addSession: (session: RehearsalSession) => void
  setCurrentSession: (session: RehearsalSession | null) => void
  updateCurrentSession: (data: Partial<RehearsalSession>) => void
  setAutoScrollSpeed: (speed: number) => void
  setFontSize: (size: 'small' | 'medium' | 'large') => void
  setTranspose: (semitones: number) => void
  setShowMetronome: (show: boolean) => void
  setMetronomeBpm: (bpm: number) => void
  setMetronomeTimeSignature: (sig: string) => void
  setKeepScreenOn: (on: boolean) => void
  setLockRotation: (lock: boolean) => void
  setDarkMode: (dark: boolean) => void
  resetRehearsalSettings: () => void
}

export const useRehearsalStore = create<RehearsalState>()(
  persist(
    (set) => ({
      sessions: [],
      currentSession: null,
      autoScrollSpeed: 1,
      fontSize: 'medium',
      transpose: 0,
      showMetronome: false,
      metronomeBpm: 120,
      metronomeTimeSignature: '4/4',
      keepScreenOn: true,
      lockRotation: true,
      darkMode: true,

      setSessions: (sessions) => set({ sessions }),
      addSession: (session) => set((state) => ({ sessions: [session, ...state.sessions] })),
      setCurrentSession: (session) => set({ currentSession: session }),
      updateCurrentSession: (data) =>
        set((state) => ({
          currentSession: state.currentSession ? { ...state.currentSession, ...data } : null,
        })),
      setAutoScrollSpeed: (speed) => set({ autoScrollSpeed: speed }),
      setFontSize: (size) => set({ fontSize: size }),
      setTranspose: (semitones) => set({ transpose: semitones }),
      setShowMetronome: (show) => set({ showMetronome: show }),
      setMetronomeBpm: (bpm) => set({ metronomeBpm: bpm }),
      setMetronomeTimeSignature: (sig) => set({ metronomeTimeSignature: sig }),
      setKeepScreenOn: (on) => set({ keepScreenOn: on }),
      setLockRotation: (lock) => set({ lockRotation: lock }),
      setDarkMode: (dark) => set({ darkMode: dark }),
      resetRehearsalSettings: () =>
        set({
          autoScrollSpeed: 1,
          fontSize: 'medium',
          transpose: 0,
          showMetronome: false,
          metronomeBpm: 120,
          metronomeTimeSignature: '4/4',
        }),
    }),
    { name: 'rehearsal-store' }
  )
)