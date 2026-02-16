import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations' // <--- Il manquait cet import
import Guest from '#models/guest'

export default class Photo extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare file_path: string

  @column()
  declare table_id: number

  @column()
  declare mission_id: number

  @column()
  declare guestId: number

  @belongsTo(() => Guest)
  declare guest: BelongsTo<typeof Guest>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
