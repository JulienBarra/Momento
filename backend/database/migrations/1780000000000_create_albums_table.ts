import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'albums'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.string('title').notNullable()
      table.text('description').nullable()
      // Jeton aléatoire encodé dans le lien public ; unique pour le retrouver.
      table.string('share_token').notNullable().unique()
      // Permet de révoquer un lien sans supprimer l'album.
      table.boolean('is_public').notNullable().defaultTo(true)

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
