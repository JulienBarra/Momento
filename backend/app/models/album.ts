import { DateTime } from 'luxon'
import { BaseModel, column, manyToMany } from '@adonisjs/lucid/orm'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'
import Photo from '#models/photo'

export default class Album extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare title: string

  @column()
  declare description: string | null

  // Jeton encodé dans le lien public ({FRONTEND_URL}/album/<shareToken>)
  @column()
  declare shareToken: string

  // false = lien désactivé (album conservé mais plus accessible publiquement)
  @column()
  declare isPublic: boolean

  @manyToMany(() => Photo, {
    pivotTable: 'album_photos',
    pivotForeignKey: 'album_id',
    pivotRelatedForeignKey: 'photo_id',
    pivotTimestamps: true,
  })
  declare photos: ManyToMany<typeof Photo>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
