import Photo from '#models/photo'
import { cuid } from '@adonisjs/core/helpers'
import type { HttpContext } from '@adonisjs/core/http'

export default class PhotosController {
  public async store({ request, response, auth }: HttpContext) {
    const guest = await auth.authenticate()

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
    await image.moveToDisk(key)

    // 3. Enregistrement de la Photo liée à l'invité authentifié
    const missionId = request.input('mission_id')

    const photoRecord = await Photo.create({
      file_path: key,
      table_id: guest.tableId,
      mission_id: missionId,
      guestId: guest.id,
    })

    return response.created(photoRecord)
  }

  public async index({ response }: HttpContext) {
    const photos = await Photo.query()
      .preload('guest')
      .preload('mission')
      .preload('table')
      .orderBy('createdAt', 'desc')

    return response.ok(photos)
  }
}
