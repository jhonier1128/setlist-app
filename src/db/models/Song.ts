import { Model } from '@nozbe/watermelondb'
import { field, text, date, children } from '@nozbe/watermelondb/decorators'

export default class Song extends Model {
  static table = 'songs'
  static associations = {
    setlistSongs: { type: 'has_many' as const, foreignKey: 'song_id' },
  }

  @text('title') title!: string
  @text('artist') artist?: string
  @text('key') key!: string
  @text('original_key') originalKey?: string
  @field('bpm') bpm?: number
  @text('time_signature') timeSignature?: string
  @field('duration') duration?: number
  @field('capo') capo?: number
  @text('tuning') tuning?: string
  @text('lyric_chordpro') lyricChordPro?: string
  @text('notes') notes?: string
  @text('sections') sections?: string
  @text('audio_ref') audioRef?: string
  @text('youtube_url') youtubeUrl?: string
  @text('spotify_url') spotifyUrl?: string
  @date('created_at') createdAt!: Date
  @date('updated_at') updatedAt!: Date
}