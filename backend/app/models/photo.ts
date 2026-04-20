import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Guest from '#models/guest'
import Mission from '#models/mission'
import Table from '#models/table'

export default class Photo extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare file_path: string

  @column()
  declare table_id: number

  @column()
  declare mission_id: number | null

  @column()
  declare guestId: number

  @belongsTo(() => Guest)
  declare guest: BelongsTo<typeof Guest>

  @belongsTo(() => Mission, { foreignKey: 'mission_id' })
  declare mission: BelongsTo<typeof Mission>

  @belongsTo(() => Table, { foreignKey: 'table_id' })
  declare table: BelongsTo<typeof Table>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
