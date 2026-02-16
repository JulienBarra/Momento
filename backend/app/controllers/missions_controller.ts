import type { HttpContext } from '@adonisjs/core/http'
import Mission from '#models/mission'

export default class MissionsController {
  async index({ request }: HttpContext) {
    // On imagine temporairement que l'utilisateur est à la table 3
    // (On rendra ça dynamique plus tard quand le frontend enverra l'info)
    const userTableId = 3

    const missions = await Mission.query()
      .where('is_global', true) // Les missions pour tout le monde
      .orWhere('table_id', userTableId) // OU les missions de MA table
      .orderBy('created_at', 'desc') // Triées par date

    return missions
  }
}
