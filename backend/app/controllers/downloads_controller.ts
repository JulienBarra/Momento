import type { HttpContext } from '@adonisjs/core/http'
import drive from '@adonisjs/drive/services/main'
import { ZipArchive } from 'archiver'

// Téléchargements servis par le backend avec un en-tête Content-Disposition :
// le navigateur enregistre vraiment le fichier (fiable iOS/Android/PC), sans
// dépendre d'un fetch cross-origin. Les fichiers d'upload sont déjà publics
// (servis à /uploads/<cuid> via Drive), donc ces routes le sont aussi.
//
// Le nom de fichier est un cuid + extension (ex. "abc123.webp"). On valide
// strictement le format pour empêcher toute traversée de répertoire.
const FILE_RE = /^[a-z0-9]+\.[a-z0-9]+$/i

export default class DownloadsController {
  // GET /photos/dl/:file — télécharge une photo
  async photo({ params, response }: HttpContext) {
    const file = String(params.file)
    if (!FILE_RE.test(file)) {
      return response.badRequest({ error: 'Nom de fichier invalide' })
    }

    const disk = drive.use()
    if (!(await disk.exists(file))) {
      return response.notFound({ error: 'Photo introuvable' })
    }

    response.header('Content-Type', 'image/webp')
    response.header('Content-Disposition', `attachment; filename="${file}"`)
    return response.stream(await disk.getStream(file))
  }

  // POST /photos/zip  { name?, files: JSON string d'un tableau de noms de fichiers }
  // Empaquète plusieurs photos dans un .zip streamé. Appelé via un formulaire
  // (POST navigable) pour gérer de longues listes sans limite d'URL.
  async zip({ request, response }: HttpContext) {
    let files: unknown
    try {
      files = JSON.parse(String(request.input('files') ?? '[]'))
    } catch {
      files = []
    }
    const list = Array.isArray(files)
      ? (files as unknown[]).filter((f): f is string => typeof f === 'string' && FILE_RE.test(f))
      : []

    const name = String(request.input('name') ?? 'photos').replace(/[^\w.-]+/g, '-') || 'photos'
    response.header('Content-Type', 'application/zip')
    response.header('Content-Disposition', `attachment; filename="${name}.zip"`)

    const archive = new ZipArchive({ zlib: { level: 5 } })
    const disk = drive.use()
    const used = new Set<string>()

    for (const file of list) {
      let entry = file
      if (used.has(entry)) entry = `${used.size}-${entry}`
      used.add(entry)
      try {
        archive.append(await disk.getStream(file), { name: entry })
      } catch {
        // Fichier absent : on l'ignore et on poursuit l'archive.
      }
    }

    archive.finalize()
    return response.stream(archive)
  }
}
