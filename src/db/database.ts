import { Database } from '@nozbe/watermelondb'
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite'
import { schema } from './schema'
import Song from './models/Song'
import Setlist from './models/Setlist'
import SetlistSong from './models/SetlistSong'
import RehearsalSession from './models/RehearsalSession'

const adapter = new SQLiteAdapter({
  schema,
  jsi: true,
  onSetUpError: (error) => {
    console.error('WatermelonDB setup error:', error)
  },
})

export const database = new Database({
  adapter,
  modelClasses: [Song, Setlist, SetlistSong, RehearsalSession],
})

export type DatabaseType = typeof database
export { Song, Setlist, SetlistSong, RehearsalSession }