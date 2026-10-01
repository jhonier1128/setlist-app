'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { database, DatabaseType, Song, Setlist, SetlistSong, RehearsalSession } from '@/db/database'

interface DatabaseContextType {
  database: DatabaseType
  Song: typeof Song
  Setlist: typeof Setlist
  SetlistSong: typeof SetlistSong
  RehearsalSession: typeof RehearsalSession
  isReady: boolean
}

const DatabaseContext = createContext<DatabaseContextType | null>(null)

export function DatabaseProvider({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const setup = async () => {
      try {
        // @ts-ignore - jsi is available in WatermelonDB SQLite adapter
        await database.adapter.jsi?.execute('PRAGMA journal_mode = WAL;')
        setIsReady(true)
      } catch (e) {
        console.error('DB setup error:', e)
        setIsReady(true)
      }
    }
    setup()
  }, [])

  return (
    <DatabaseContext.Provider
      value={{
        database,
        Song,
        Setlist,
        SetlistSong,
        RehearsalSession,
        isReady,
      }}
    >
      {children}
    </DatabaseContext.Provider>
  )
}

export function useDatabase() {
  const context = useContext(DatabaseContext)
  if (!context) {
    throw new Error('useDatabase must be used within a DatabaseProvider')
  }
  return context
}

export function useCollections() {
  const { database, Song, Setlist, SetlistSong, RehearsalSession, isReady } = useDatabase()
  const [collections, setCollections] = useState<{
    songs: ReturnType<DatabaseType['get']> | null
    setlists: ReturnType<DatabaseType['get']> | null
    setlistSongs: ReturnType<DatabaseType['get']> | null
    rehearsalSessions: ReturnType<DatabaseType['get']> | null
    songsCollection: ReturnType<DatabaseType['get']> | null
    setlistsCollection: ReturnType<DatabaseType['get']> | null
    setlistSongsCollection: ReturnType<DatabaseType['get']> | null
    rehearsalSessionsCollection: ReturnType<DatabaseType['get']> | null
  }>({
    songs: null,
    setlists: null,
    setlistSongs: null,
    rehearsalSessions: null,
    songsCollection: null,
    setlistsCollection: null,
    setlistSongsCollection: null,
    rehearsalSessionsCollection: null,
  })

  useEffect(() => {
    if (isReady) {
      const songsCol = database.get(Song.table)
      const setlistsCol = database.get(Setlist.table)
      const setlistSongsCol = database.get(SetlistSong.table)
      const rehearsalSessionsCol = database.get(RehearsalSession.table)
      setCollections({
        songs: songsCol,
        setlists: setlistsCol,
        setlistSongs: setlistSongsCol,
        rehearsalSessions: rehearsalSessionsCol,
        songsCollection: songsCol,
        setlistsCollection: setlistsCol,
        setlistSongsCollection: setlistSongsCol,
        rehearsalSessionsCollection: rehearsalSessionsCol,
      })
    }
  }, [database, isReady])

  return { ...collections, isReady }
}