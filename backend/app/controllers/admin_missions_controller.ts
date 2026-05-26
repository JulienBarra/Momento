import type { HttpContext } from '@adonisjs/core/http'
import Mission from '#models/mission'
import Table from '#models/table'
import Guest from '#models/guest'
import Photo from '#models/photo'

function serialize(m: Mission, totalGuests: number) {
  return {
    id: m.id,
    title: m.title,
    isGlobal: m.isGlobal,
    tableId: m.tableId,
    table: m.table ? { id: m.table.id, name: m.table.name } : null,
    completedCount: Number(m.$extras.photos_count ?? 0),
    // Cible : une mission globale vise tous les invités, une mission de table = 1 photo
    target: m.isGlobal ? Math.max(totalGuests, 1) : 1,
    createdAt: m.createdAt,
    updatedAt: m.updatedAt,
  }
}

export default class AdminMissionsController {
  // GET /admin/missions
  async index({ response }: HttpContext) {
    const missions = await Mission.query()
      .preload('table')
      .withCount('photos')
      .orderBy('is_global', 'desc')
      .orderBy('id', 'asc')

    const totalGuestsRes = await Guest.query().count('* as total')
    const totalGuests = Number(totalGuestsRes[0].$extras.total)

    return response.ok(missions.map((m) => serialize(m, totalGuests)))
  }

  // POST /admin/missions  { title, isGlobal, tableId?, applyToAllTables? }
  async store({ request, response }: HttpContext) {
    const title = request.input('title')?.trim()
    const isGlobal = Boolean(request.input('isGlobal'))
    const applyToAllTables = Boolean(request.input('applyToAllTables'))

    if (!title) {
      return response.badRequest({ error: 'L’intitulé de la mission est obligatoire' })
    }

    if (isGlobal) {
      const mission = await Mission.create({ title, isGlobal: true, tableId: null })
      return response.created(await this.one(mission.id))
    }

    // Mission de table : soit toutes les tables, soit une seule
    if (applyToAllTables) {
      const tables = await Table.all()
      if (tables.length === 0) {
        return response.badRequest({ error: 'Aucune table à laquelle appliquer la mission' })
      }
      const created = await Mission.createMany(
        tables.map((t) => ({ title, isGlobal: false, tableId: t.id }))
      )
      const ids = created.map((m) => m.id)
      const all = await Mission.query().whereIn('id', ids).preload('table').withCount('photos')
      return response.created(all.map((m) => serialize(m, 1)))
    }

    const tableId = Number(request.input('tableId'))
    const table = await Table.find(tableId)
    if (!table) {
      return response.badRequest({ error: 'Table introuvable pour cette mission' })
    }
    const mission = await Mission.create({ title, isGlobal: false, tableId })
    return response.created(await this.one(mission.id))
  }

  // PATCH /admin/missions/:id  { title?, isGlobal?, tableId? }
  async update({ params, request, response }: HttpContext) {
    const mission = await Mission.find(params.id)
    if (!mission) {
      return response.notFound({ error: 'Mission introuvable' })
    }

    const title = request.input('title')
    if (title !== undefined) {
      const trimmed = String(title).trim()
      if (!trimmed) return response.badRequest({ error: 'L’intitulé ne peut pas être vide' })
      mission.title = trimmed
    }

    if (request.input('isGlobal') !== undefined) {
      const isGlobal = Boolean(request.input('isGlobal'))
      mission.isGlobal = isGlobal
      if (isGlobal) {
        mission.tableId = null
      } else {
        const tableId = Number(request.input('tableId') ?? mission.tableId)
        const table = await Table.find(tableId)
        if (!table) return response.badRequest({ error: 'Table introuvable pour cette mission' })
        mission.tableId = tableId
      }
    } else if (request.input('tableId') !== undefined && !mission.isGlobal) {
      const tableId = Number(request.input('tableId'))
      const table = await Table.find(tableId)
      if (!table) return response.badRequest({ error: 'Table introuvable pour cette mission' })
      mission.tableId = tableId
    }

    await mission.save()
    return response.ok(await this.one(mission.id))
  }

  // DELETE /admin/missions/:id
  async destroy({ params, response }: HttpContext) {
    const mission = await Mission.find(params.id)
    if (!mission) {
      return response.notFound({ error: 'Mission introuvable' })
    }

    // Les photos rattachées perdent leur mission (pas de contrainte FK, on nettoie)
    await Photo.query().where('mission_id', mission.id).update({ mission_id: null })
    await mission.delete()
    return response.noContent()
  }

  private async one(id: number) {
    const m = await Mission.query().where('id', id).preload('table').withCount('photos').firstOrFail()
    const totalGuestsRes = await Guest.query().count('* as total')
    return serialize(m, Number(totalGuestsRes[0].$extras.total))
  }
}
