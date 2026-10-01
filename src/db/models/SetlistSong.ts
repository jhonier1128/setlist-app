import { Model } from '@nozbe/watermelondb'
import { field, text } from '@nozbe/watermelondb/decorators'

export default class SetlistSong extends Model {
  static table = 'setlist_songs'

  @text('setlist_id') setlistId!: string
  @text('song_id') songId!: string
  @field('position') position!: number
  @text('custom_key') customKey?: string
  @text('notes') notes?: string
}