import Photo from '#models/photo'
import Guest from '#models/guest'
import { cuid } from '@adonisjs/core/helpers'
import type { HttpContext } from '@adonisjs/core/http'

export default class PhotosController {
  public async store({ request, response }: HttpContext) {
    // 1. Validation de l'image
    const image = request.file('photo', {
      size: '5mb',
      extnames: ['jpg', 'png', 'jpeg', 'webp'],
    })

    if (!image || !image.isValid) {
      return response.badRequest({ errors: image?.errors || 'No image provided' })
    }

    // 2. Déplacement du fichier
    const key = `uploads/${cuid()}.${image.extname}`
    await image.moveToDisk(key) // Assure-toi que tu as configuré un 'disk' ou utilise move() simple si en local

    // 3. RECUPERATION DES INFOS INVITE
    const nickname = request.input('nickname') // Le pseudo envoyé par le front
    const tableId = request.input('table_id')
    const missionId = request.input('mission_id')

    // 4. Trouver ou Créer l'invité
    // On cherche un invité qui a CE pseudo ET à CETTE table.
    const guest = await Guest.firstOrCreate(
      { nickname: nickname, tableId: tableId }, // Critères de recherche
      { nickname: nickname, tableId: tableId } // Valeurs de création si pas trouvé
    )

    // 5. Enregistrement de la Photo liée à l'invité
    const photoRecord = await Photo.create({
      file_path: key,
      table_id: tableId,
      mission_id: missionId,
      guestId: guest.id,
    })

    return response.created(photoRecord)
  }

  public async index({ response }: HttpContext) {
    // On récupère les photos ET on charge les infos de l'invité associé (.preload)
    const photos = await Photo.query().preload('guest').orderBy('createdAt', 'desc')

    return response.ok(photos)
  }
}
