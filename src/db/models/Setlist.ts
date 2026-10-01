import { Model } from '@nozbe/watermelondb'
import { field, text, date } from '@nozbe/watermelondb/decorators'

export default class Setlist extends Model {
  static table = 'setlists'
  static associations = {
    setlistSongs: { type: 'has_many' as const, foreignKey: 'setlist_id' },
  }

  @text('name') name!: string
  @text('description') description?: string
  @text('song_order') songOrder!: string
  @field('estimated_duration') estimatedDuration?: number
  @date('created_at') createdAt!: Date
  @date('updated_at') updatedAt!: Date
}