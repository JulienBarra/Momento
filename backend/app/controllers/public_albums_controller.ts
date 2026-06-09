import type { HttpContext } from '@adonisjs/core/http'
import drive from '@adonisjs/drive/services/main'
import { ZipArchive } from 'archiver'
import Album from '#models/album'

// Nom de fichier sûr pour un en-tête Content-Disposition.
function safeName(value: string, fallback: string) {
  const cleaned = value.replace(/[^\w\-. ]+/g, '-').trim()
  return cleaned || fallback
}

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

  // GET /albums/shared/:token/download
  // Renvoie l'album complet en .zip streamé. Le Content-Disposition fait que le
  // navigateur le traite comme un vrai téléchargement (fiable sur iOS aussi).
  async download({ params, response }: HttpContext) {
    const album = await Album.query()
      .where('share_token', params.token)
      .where('is_public', true)
      .preload('photos', (q) => q.orderBy('photos.created_at', 'desc'))
      .first()

    if (!album) {
      return response.notFound({ error: 'Cet album est introuvable ou n’est plus partagé.' })
    }

    const fileName = `${safeName(album.title, 'album')}.zip`
    response.header('Content-Type', 'application/zip')
    response.header('Content-Disposition', `attachment; filename="${fileName}"`)

    const archive = new ZipArchive({ zlib: { level: 5 } })
    const disk = drive.use()
    const used = new Set<string>()

    for (const p of album.photos) {
      let entry = p.file_path.split('/').pop() || `photo-${p.id}.webp`
      if (used.has(entry)) entry = `${p.id}-${entry}`
      used.add(entry)
      try {
        archive.append(await disk.getStream(p.file_path), { name: entry })
      } catch {
        // Fichier absent sur le disque : on l'ignore et on continue l'archive.
      }
    }

    archive.finalize()
    return response.stream(archive)
  }

  // GET /albums/shared/:token/photos/:photoId/download
  // Téléchargement direct d'une photo (en-tête attachment → enregistrement fiable).
  async downloadPhoto({ params, response }: HttpContext) {
    const album = await Album.query()
      .where('share_token', params.token)
      .where('is_public', true)
      .first()

    if (!album) {
      return response.notFound({ error: 'Cet album est introuvable ou n’est plus partagé.' })
    }

    const photo = await album
      .related('photos')
      .query()
      .where('photos.id', params.photoId)
      .first()

    if (!photo) {
      return response.notFound({ error: 'Photo introuvable dans cet album.' })
    }

    const fileName = photo.file_path.split('/').pop() || `photo-${photo.id}.webp`
    response.header('Content-Type', 'image/webp')
    response.header('Content-Disposition', `attachment; filename="${fileName}"`)
    return response.stream(await drive.use().getStream(photo.file_path))
  }
}
