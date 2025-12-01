import Photo from '#models/photo'

export default class PhotosController {
  public async store({ request, response }) {
    const photo = request.file('photo', {
      size: '5mb', // 1. Restriction de TAILLE (pas plus de 5 Mo)
      extnames: ['jpg', 'png', 'jpeg', 'webp'], // 2. Restriction de FORMAT
    })

    if (!photo.isValid) {
      return response.status(400).json({
        errors: photo.errors,
      })
    }

    await photo.moveToDisk('uploads', {
      name: `${new Date().getTime()}_${photo.clientName}`,
    })

    const fileName = photo.fileName

    // 3. On enregistre en base de données
    const photoRecord = await Photo.create({
      file_path: `uploads/${fileName}`,
      table_id: request.input('table_id'),
      mission_id: request.input('mission_id'),
      guest_name: 'Invité Mystère',
    })

    return response.created(photoRecord)
  }
}
