import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Table from '#models/table'
import Photo from '#models/photo'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'

export default class Guest extends BaseModel {
  static accessTokens = DbAccessTokensProvider.forModel(Guest)

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare nickname: string

  @column()
  declare tableId: number

  @column({ serializeAs: null })
  declare deviceSecret: string | null

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
