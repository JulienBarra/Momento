import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Table from '#models/table'
import Photo from '#models/photo'

export default class Mission extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare title: string

  @column()
  declare description: string | null

  @column()
  declare isGlobal: boolean

  @column()
  declare tableId: number | null

  @belongsTo(() => Table)
  declare table: BelongsTo<typeof Table>

  @hasMany(() => Photo, { foreignKey: 'mission_id' })
  declare photos: HasMany<typeof Photo>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
