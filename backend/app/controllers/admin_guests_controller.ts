import type { HttpContext } from '@adonisjs/core/http'
import drive from '@adonisjs/drive/services/main'
import Guest from '#models/guest'
import Table from '#models/table'
import Photo from '#models/photo'

function serialize(g: Guest) {
  return {
    id: g.id,
    nickname: g.nickname,
    tableId: g.tableId,
    table: g.table ? { id: g.table.id, name: g.table.name } : null,
    photoCount: Number(g.$extras.photos_count ?? 0),
    createdAt: g.createdAt,
    updatedAt: g.updatedAt,
  }
}

// Détecte une violation de contrainte d'unicité (nickname) selon le driver SQL.
function isUniqueViolation(err: unknown): boolean {
  const code = (err as { code?: string })?.code
  return code === '23505' || code === 'SQLITE_CONSTRAINT' || code === 'ER_DUP_ENTRY'
}

export default class AdminGuestsController {
  // GET /admin/guests — liste des invités avec leur table et leur nombre de photos
  async index({ response }: HttpContext) {
    const guests = await Guest.query()
      .preload('table')
      .withCount('photos')
      .orderBy('id', 'asc')

    return response.ok(guests.map(serialize))
  }

  // POST /admin/guests — créer un invité manuellement
  async store({ request, response }: HttpContext) {
    const nickname = request.input('nickname')?.trim()
    const tableId = request.input('tableId')

    if (!nickname) {
      return response.badRequest({ error: 'Le pseudo est obligatoire' })
    }
    if (!tableId) {
      return response.badRequest({ error: 'La table est obligatoire' })
    }

    const table = await Table.find(tableId)
    if (!table) {
      return response.badRequest({ error: 'Table introuvable' })
    }

    try {
      const guest = await Guest.create({ nickname, tableId: table.id })
      await guest.load('table')
      return response.created(serialize(guest))
    } catch (err) {
      if (isUniqueViolation(err)) {
        return response.conflict({ error: 'Ce pseudo est déjà utilisé' })
      }
      throw err
    }
  }

  // PATCH /admin/guests/:id — modifier le pseudo et/ou la table d'un invité
  async update({ params, request, response }: HttpContext) {
    const guest = await Guest.find(params.id)
    if (!guest) {
      return response.notFound({ error: 'Invité introuvable' })
    }

    const nickname = request.input('nickname')
    const tableId = request.input('tableId')

    if (nickname !== undefined) {
      const trimmed = nickname?.trim()
      if (!trimmed) {
        return response.badRequest({ error: 'Le pseudo est obligatoire' })
      }
      guest.nickname = trimmed
    }

    if (tableId !== undefined) {
      const table = await Table.find(tableId)
      if (!table) {
        return response.badRequest({ error: 'Table introuvable' })
      }
      guest.tableId = table.id
    }

    try {
      await guest.save()
    } catch (err) {
      if (isUniqueViolation(err)) {
        return response.conflict({ error: 'Ce pseudo est déjà utilisé' })
      }
      throw err
    }

    await guest.load('table')
    await guest.loadCount('photos')
    return response.ok(serialize(guest))
  }

  // DELETE /admin/guests/:id — supprimer un invité (ses photos sont supprimées en cascade)
  async destroy({ params, response }: HttpContext) {
    const guest = await Guest.find(params.id)
    if (!guest) {
      return response.notFound({ error: 'Invité introuvable' })
    }

    // Supprime les fichiers des photos sur le disque avant la cascade SQL (best-effort)
    const photos = await Photo.query().where('guest_id', guest.id)
    for (const photo of photos) {
      try {
        await drive.use().delete(photo.file_path)
      } catch {
        // fichier déjà absent : on continue
      }
    }

    await guest.delete()
    return response.noContent()
  }
}
