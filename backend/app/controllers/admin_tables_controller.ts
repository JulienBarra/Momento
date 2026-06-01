import type { HttpContext } from '@adonisjs/core/http'
import Table from '#models/table'
import Guest from '#models/guest'
import Photo from '#models/photo'
import Mission from '#models/mission'

export default class AdminTablesController {
  // GET /admin/tables — liste des tables avec le nombre d'invités et de photos
  async index({ response }: HttpContext) {
    const tables = await Table.query()
      .withCount('guests')
      .withCount('photos')
      .orderBy('id', 'asc')

    // Les $extras de withCount ne sont pas sérialisés par défaut → on les expose explicitement
    return response.ok(
      tables.map((t) => ({
        id: t.id,
        name: t.name,
        guestCount: Number(t.$extras.guests_count ?? 0),
        photoCount: Number(t.$extras.photos_count ?? 0),
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
      }))
    )
  }

  // POST /admin/tables — créer une table
  async store({ request, response }: HttpContext) {
    const name = request.input('name')?.trim()
    if (!name) {
      return response.badRequest({ error: 'Le nom de la table est obligatoire' })
    }

    const table = await Table.create({ name })
    return response.created(table)
  }

  // PATCH /admin/tables/:id — renommer une table
  async update({ params, request, response }: HttpContext) {
    const table = await Table.find(params.id)
    if (!table) {
      return response.notFound({ error: 'Table introuvable' })
    }

    const name = request.input('name')?.trim()
    if (!name) {
      return response.badRequest({ error: 'Le nom de la table est obligatoire' })
    }

    table.name = name
    await table.save()
    return response.ok(table)
  }

  // DELETE /admin/tables/:id — supprimer une table (refusée si elle contient des invités ou photos)
  async destroy({ params, response }: HttpContext) {
    const table = await Table.find(params.id)
    if (!table) {
      return response.notFound({ error: 'Table introuvable' })
    }

    const guestCount = await Guest.query().where('table_id', table.id).count('* as total')
    const photoCount = await Photo.query().where('table_id', table.id).count('* as total')
    const missionCount = await Mission.query().where('table_id', table.id).count('* as total')

    if (
      Number(guestCount[0].$extras.total) > 0 ||
      Number(photoCount[0].$extras.total) > 0 ||
      Number(missionCount[0].$extras.total) > 0
    ) {
      return response.conflict({
        error: 'Impossible de supprimer une table qui contient des invités, des photos ou des missions.',
      })
    }

    await table.delete()
    return response.noContent()
  }
}
