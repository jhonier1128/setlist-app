import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Setlist } from '@/types'

interface SetlistsState {
  setlists: Setlist[]
  setSetlists: (setlists: Setlist[]) => void
  addSetlist: (setlist: Setlist) => void
  updateSetlist: (id: string, data: Partial<Setlist>) => void
  deleteSetlist: (id: string) => void
  reorderSongs: (setlistId: string, songOrder: string[]) => void
}

export const useSetlistsStore = create<SetlistsState>()(
  persist(
    (set) => ({
      setlists: [],
      setSetlists: (setlists) => set({ setlists }),
      addSetlist: (setlist) => set((state) => ({ setlists: [setlist, ...state.setlists] })),
      updateSetlist: (id, data) =>
        set((state) => ({
          setlists: state.setlists.map((s) => (s.id === id ? { ...s, ...data, updatedAt: new Date() } : s)),
        })),
      deleteSetlist: (id) => set((state) => ({ setlists: state.setlists.filter((s) => s.id !== id) })),
      reorderSongs: (setlistId, songOrder) =>
        set((state) => ({
          setlists: state.setlists.map((s) =>
            s.id === setlistId ? { ...s, songOrder, updatedAt: new Date() } : s
          ),
        })),
    }),
    { name: 'setlists-store' }
  )
)