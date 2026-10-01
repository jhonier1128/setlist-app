import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Song } from '@/types'

interface SongsState {
  songs: Song[]
  searchQuery: string
  filterKey: string | null
  filterArtist: string | null
  setSongs: (songs: Song[]) => void
  addSong: (song: Song) => void
  updateSong: (id: string, data: Partial<Song>) => void
  deleteSong: (id: string) => void
  setSearchQuery: (query: string) => void
  setFilterKey: (key: string | null) => void
  setFilterArtist: (artist: string | null) => void
  getFilteredSongs: () => Song[]
}

export const useSongsStore = create<SongsState>()(
  persist(
    (set, get) => ({
      songs: [],
      searchQuery: '',
      filterKey: null,
      filterArtist: null,

      setSongs: (songs) => set({ songs }),
      addSong: (song) => set((state) => ({ songs: [song, ...state.songs] })),
      updateSong: (id, data) =>
        set((state) => ({
          songs: state.songs.map((s) => (s.id === id ? { ...s, ...data, updatedAt: new Date() } : s)),
        })),
      deleteSong: (id) => set((state) => ({ songs: state.songs.filter((s) => s.id !== id) })),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setFilterKey: (key) => set({ filterKey: key }),
      setFilterArtist: (artist) => set({ filterArtist: artist }),

      getFilteredSongs: () => {
        const { songs, searchQuery, filterKey, filterArtist } = get()
        return songs.filter((song) => {
          const matchesSearch =
            song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            song.artist?.toLowerCase().includes(searchQuery.toLowerCase())
          const matchesKey = filterKey ? song.key === filterKey : true
          const matchesArtist = filterArtist ? song.artist === filterArtist : true
          return matchesSearch && matchesKey && matchesArtist
        })
      },
    }),
    { name: 'songs-store', partialize: (state) => ({ searchQuery: state.searchQuery, filterKey: state.filterKey, filterArtist: state.filterArtist }) }
  )
)