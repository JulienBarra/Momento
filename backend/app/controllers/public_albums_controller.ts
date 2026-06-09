import type { HttpContext } from '@adonisjs/core/http'
import Album from '#models/album'

// Vue publique : accessible à toute personne disposant du lien (aucun token).
// On ne renvoie que l'album partagé (is_public = true) et le strict minimum.
export default class PublicAlbumsController {
  // GET /albums/shared/:token
  async show({ params, response }: HttpContext) {
    const album = await Album.query()
      .where('share_token', params.token)
      .where('is_public', true)
      .preload('photos', (q) => q.preload('guest').orderBy('photos.created_at', 'desc'))
      .first()

    if (!album) {
      return response.notFound({
        error: 'Cet album est introuvable ou n’est plus partagé.',
      })
    }

    return response.ok({
      title: album.title,
      description: album.description,
      photos: album.photos.map((p) => ({
        id: p.id,
        filePath: p.file_path,
        createdAt: p.createdAt,
        guest: p.guest ? { nickname: p.guest.nickname } : null,
      })),
    })
  }
}
