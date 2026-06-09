import type { HttpContext } from '@adonisjs/core/http'
import { cuid } from '@adonisjs/core/helpers'
import Album from '#models/album'

// Album sérialisé pour le backoffice : on expose le jeton de partage (les mariés
// en ont besoin pour copier le lien) et la liste des ids de photos rattachées.
async function serialize(id: number) {
  const album = await Album.query()
    .where('id', id)
    .preload('photos', (q) => q.orderBy('photos.created_at', 'desc'))
    .firstOrFail()

  return {
    id: album.id,
    title: album.title,
    description: album.description,
    shareToken: album.shareToken,
    isPublic: album.isPublic,
    photoCount: album.photos.length,
    coverPath: album.photos[0]?.file_path ?? null,
    photoIds: album.photos.map((p) => p.id),
    createdAt: album.createdAt,
    updatedAt: album.updatedAt,
  }
}

export default class AdminAlbumsController {
  // GET /admin/albums
  async index({ response }: HttpContext) {
    const albums = await Album.query()
      .preload('photos', (q) => q.orderBy('photos.created_at', 'desc'))
      .orderBy('id', 'desc')

    return response.ok(
      albums.map((album) => ({
        id: album.id,
        title: album.title,
        description: album.description,
        shareToken: album.shareToken,
        isPublic: album.isPublic,
        photoCount: album.photos.length,
        coverPath: album.photos[0]?.file_path ?? null,
        photoIds: album.photos.map((p) => p.id),
        createdAt: album.createdAt,
        updatedAt: album.updatedAt,
      }))
    )
  }

  // GET /admin/albums/:id
  async show({ params, response }: HttpContext) {
    const album = await Album.find(params.id)
    if (!album) {
      return response.notFound({ error: 'Album introuvable' })
    }
    return response.ok(await serialize(album.id))
  }

  // POST /admin/albums  { title, description? }
  async store({ request, response }: HttpContext) {
    const title = request.input('title')?.trim()
    if (!title) {
      return response.badRequest({ error: 'Le titre de l’album est obligatoire' })
    }
    const description = request.input('description')?.trim() || null

    const album = await Album.create({
      title,
      description,
      shareToken: cuid(),
      isPublic: true,
    })
    return response.created(await serialize(album.id))
  }

  // PATCH /admin/albums/:id  { title?, description?, isPublic? }
  async update({ params, request, response }: HttpContext) {
    const album = await Album.find(params.id)
    if (!album) {
      return response.notFound({ error: 'Album introuvable' })
    }

    if (request.input('title') !== undefined) {
      const title = String(request.input('title')).trim()
      if (!title) return response.badRequest({ error: 'Le titre ne peut pas être vide' })
      album.title = title
    }
    if (request.input('description') !== undefined) {
      album.description = String(request.input('description')).trim() || null
    }
    if (request.input('isPublic') !== undefined) {
      album.isPublic = Boolean(request.input('isPublic'))
    }

    await album.save()
    return response.ok(await serialize(album.id))
  }

  // PUT /admin/albums/:id/photos  { photoIds: number[] }
  // Remplace l'intégralité de la sélection de photos de l'album.
  async setPhotos({ params, request, response }: HttpContext) {
    const album = await Album.find(params.id)
    if (!album) {
      return response.notFound({ error: 'Album introuvable' })
    }

    const raw = request.input('photoIds')
    if (!Array.isArray(raw)) {
      return response.badRequest({ error: 'photoIds doit être un tableau' })
    }
    const photoIds = [...new Set(raw.map(Number).filter((n) => Number.isInteger(n)))]

    await album.related('photos').sync(photoIds)
    return response.ok(await serialize(album.id))
  }

  // DELETE /admin/albums/:id  (les liaisons de la table pivot sont supprimées en cascade)
  async destroy({ params, response }: HttpContext) {
    const album = await Album.find(params.id)
    if (!album) {
      return response.notFound({ error: 'Album introuvable' })
    }
    await album.delete()
    return response.noContent()
  }
}
