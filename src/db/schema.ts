import { appSchema, tableSchema } from '@nozbe/watermelondb'

export const schema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'songs',
      columns: [
        { name: 'title', type: 'string' },
        { name: 'artist', type: 'string', isOptional: true },
        { name: 'key', type: 'string' },
        { name: 'original_key', type: 'string', isOptional: true },
        { name: 'bpm', type: 'number', isOptional: true },
        { name: 'time_signature', type: 'string', isOptional: true },
        { name: 'duration', type: 'number', isOptional: true },
        { name: 'capo', type: 'number', isOptional: true },
        { name: 'tuning', type: 'string', isOptional: true },
        { name: 'lyric_chordpro', type: 'string', isOptional: true },
        { name: 'notes', type: 'string', isOptional: true },
        { name: 'sections', type: 'string', isOptional: true },
        { name: 'audio_ref', type: 'string', isOptional: true },
        { name: 'youtube_url', type: 'string', isOptional: true },
        { name: 'spotify_url', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'setlists',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'description', type: 'string', isOptional: true },
        { name: 'song_order', type: 'string' },
        { name: 'estimated_duration', type: 'number', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'setlist_songs',
      columns: [
        { name: 'setlist_id', type: 'string', isIndexed: true },
        { name: 'song_id', type: 'string', isIndexed: true },
        { name: 'position', type: 'number' },
        { name: 'custom_key', type: 'string', isOptional: true },
        { name: 'notes', type: 'string', isOptional: true },
      ],
    }),
    tableSchema({
      name: 'rehearsal_sessions',
      columns: [
        { name: 'setlist_id', type: 'string', isIndexed: true },
        { name: 'date', type: 'number' },
        { name: 'duration', type: 'number', isOptional: true },
        { name: 'notes', type: 'string', isOptional: true },
        { name: 'songs_played', type: 'string', isOptional: true },
      ],
    }),
  ],
})