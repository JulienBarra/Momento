import router from '@adonisjs/core/services/router'

const PhotosController = () => import('#controllers/photos_controller')

router.get('/', async () => {
  return {
    hello: 'world',
  }
})

router.post('/photos', [PhotosController, 'store'])
