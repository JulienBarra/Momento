import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'guests'

  async up() {
    // Dedup des nicknames existants : suffixe avec _<id> pour garantir l'unicité
    this.defer(async (db) => {
      const duplicates = await db.rawQuery(
        `SELECT nickname FROM guests GROUP BY nickname HAVING COUNT(*) > 1`
      )
      const rows = duplicates.rows ?? []
      for (const row of rows) {
        const guests = await db.from('guests').where('nickname', row.nickname).orderBy('id', 'asc')
        for (let i = 1; i < guests.length; i++) {
          await db
            .from('guests')
            .where('id', guests[i].id)
            .update({ nickname: `${guests[i].nickname}_${guests[i].id}` })
        }
      }
    })

    this.schema.alterTable(this.tableName, (table) => {
      table.string('device_secret').nullable()
      table.unique(['nickname'])
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropUnique(['nickname'])
      table.dropColumn('device_secret')
    })
  }
}
