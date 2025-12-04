import Photo from '#models/photo'
import { cuid } from '@adonisjs/core/helpers'
import type { HttpContext } from '@adonisjs/core/http'

export default class PhotosController {
  public async store({ request, response }) {
    const image = request.file('photo', {
      size: '5mb',
      extnames: ['jpg', 'png', 'jpeg', 'webp'],
    })

    if (!image.isValid) {
      return response.status(400).json({ errors: image.errors })
    }

    const key = `uploads/${cuid()}.${image.extname}`
    await image.moveToDisk(key)

    // Enregistrement en BDD
    const photoRecord = await Photo.create({
      file_path: key,
      table_id: request.input('table_id'),
      mission_id: request.input('mission_id'),
      guest_name: 'Invité Mystère',
    })

    return response.created(photoRecord)
  }

  public async index({ response }: HttpContext) {
    const photos = await Photo.query().orderBy('createdAt', 'desc')
    return response.ok(photos)
  }
}
