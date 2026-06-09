import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'album_photos'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.integer('album_id').unsigned().references('albums.id').onDelete('CASCADE')
      table.integer('photo_id').unsigned().references('photos.id').onDelete('CASCADE')
      // Une même photo n'apparaît qu'une fois dans un album donné.
      table.unique(['album_id', 'photo_id'])

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
