import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Table from '#models/table'
import Photo from '#models/photo'

export default class Guest extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare nickname: string

  @column()
  declare tableId: number

  @belongsTo(() => Table)
  declare table: BelongsTo<typeof Table>

  // Un invité peut avoir pris plusieurs photos
  @hasMany(() => Photo)
  declare photos: HasMany<typeof Photo>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
