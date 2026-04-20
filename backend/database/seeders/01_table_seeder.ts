import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Table from '#models/table'

export default class extends BaseSeeder {
  async run() {
    await Table.createMany([
      { name: 'Table des mariés' },
      { name: 'Cascade de Langevin' },
      { name: 'Cap Méchant' },
      { name: 'Maido' },
      { name: 'Piton de la Fournaise' },
      { name: 'Anse des Cascades' },
      { name: "L'Hermitage" },
    ])
  }
}
