import type { HttpContext } from '@adonisjs/core/http'
import drive from '@adonisjs/drive/services/main'
import Photo from '#models/photo'

function serialize(p: Photo) {
  return {
    id: p.id,
    filePath: p.file_path,
    tableId: p.table_id,
    missionId: p.mission_id,
    guestId: p.guestId,
    starred: p.starred,
    createdAt: p.createdAt,
    guest: p.guest ? { id: p.guest.id, nickname: p.guest.nickname } : null,
    table: p.table ? { id: p.table.id, name: p.table.name } : null,
    mission: p.mission ? { id: p.mission.id, title: p.mission.title, isGlobal: p.mission.isGlobal } : null,
  }
}

export default class AdminPhotosController {
  // GET /admin/photos
  async index({ response }: HttpContext) {
    const photos = await Photo.query()
      .preload('guest')
      .preload('table')
      .preload('mission')
      .orderBy('created_at', 'desc')

    return response.ok(photos.map(serialize))
  }

  // PATCH /admin/photos/:id  { starred }
  async update({ params, request, response }: HttpContext) {
    const photo = await Photo.find(params.id)
    if (!photo) {
      return response.notFound({ error: 'Photo introuvable' })
    }
    if (request.input('starred') !== undefined) {
      photo.starred = Boolean(request.input('starred'))
      await photo.save()
    }
    await photo.load('guest')
    await photo.load('table')
    await photo.load('mission')
    return response.ok(serialize(photo))
  }

  // DELETE /admin/photos/:id
  async destroy({ params, response }: HttpContext) {
    const photo = await Photo.find(params.id)
    if (!photo) {
      return response.notFound({ error: 'Photo introuvable' })
    }
    // Supprime le fichier sur le disque (best-effort) puis l'enregistrement
    try {
      await drive.use().delete(photo.file_path)
    } catch {
      // fichier déjà absent : on supprime quand même la ligne
    }
    await photo.delete()
    return response.noContent()
  }
}
