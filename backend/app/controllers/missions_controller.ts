import type { HttpContext } from '@adonisjs/core/http'
import Mission from '#models/mission'

export default class MissionsController {
  async index({ auth }: HttpContext) {
    const guest = await auth.authenticate()

    const missions = await Mission.query()
      .where('is_global', true)
      .orWhere('table_id', guest.tableId)
      .preload('table')
      .orderBy('created_at', 'desc')

    return missions
  }
}
