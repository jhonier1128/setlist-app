import { Model } from '@nozbe/watermelondb'
import { field, text, date } from '@nozbe/watermelondb/decorators'

export default class RehearsalSession extends Model {
  static table = 'rehearsal_sessions'

  @text('setlist_id') setlistId!: string
  @date('date') date!: Date
  @field('duration') duration?: number
  @text('notes') notes?: string
  @text('songs_played') songsPlayed?: string
}