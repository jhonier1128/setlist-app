import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SettingsState {
  theme: 'light' | 'dark' | 'system'
  defaultFontSize: 'small' | 'medium' | 'large'
  defaultAutoScrollSpeed: number
  defaultMetronomeBpm: number
  defaultMetronomeTimeSignature: string
  enableHaptics: boolean
  autoTransposeCapo: boolean
  showChordDiagrams: boolean
  backupEnabled: boolean
  backupFrequency: 'daily' | 'weekly' | 'manual'

  setTheme: (theme: 'light' | 'dark' | 'system') => void
  setDefaultFontSize: (size: 'small' | 'medium' | 'large') => void
  setDefaultAutoScrollSpeed: (speed: number) => void
  setDefaultMetronomeBpm: (bpm: number) => void
  setDefaultMetronomeTimeSignature: (sig: string) => void
  setEnableHaptics: (enabled: boolean) => void
  setAutoTransposeCapo: (enabled: boolean) => void
  setShowChordDiagrams: (show: boolean) => void
  setBackupEnabled: (enabled: boolean) => void
  setBackupFrequency: (freq: 'daily' | 'weekly' | 'manual') => void
  resetSettings: () => void
}

const DEFAULT_SETTINGS = {
  theme: 'system' as const,
  defaultFontSize: 'medium' as const,
  defaultAutoScrollSpeed: 1,
  defaultMetronomeBpm: 120,
  defaultMetronomeTimeSignature: '4/4',
  enableHaptics: true,
  autoTransposeCapo: true,
  showChordDiagrams: false,
  backupEnabled: true,
  backupFrequency: 'weekly' as const,
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,
      setTheme: (theme) => set({ theme }),
      setDefaultFontSize: (size) => set({ defaultFontSize: size }),
      setDefaultAutoScrollSpeed: (speed) => set({ defaultAutoScrollSpeed: speed }),
      setDefaultMetronomeBpm: (bpm) => set({ defaultMetronomeBpm: bpm }),
      setDefaultMetronomeTimeSignature: (sig) => set({ defaultMetronomeTimeSignature: sig }),
      setEnableHaptics: (enabled) => set({ enableHaptics: enabled }),
      setAutoTransposeCapo: (enabled) => set({ autoTransposeCapo: enabled }),
      setShowChordDiagrams: (show) => set({ showChordDiagrams: show }),
      setBackupEnabled: (enabled) => set({ backupEnabled: enabled }),
      setBackupFrequency: (freq) => set({ backupFrequency: freq }),
      resetSettings: () => set(DEFAULT_SETTINGS),
    }),
    { name: 'settings-store' }
  )
)