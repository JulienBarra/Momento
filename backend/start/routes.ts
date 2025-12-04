import router from '@adonisjs/core/services/router'

const PhotosController = () => import('#controllers/photos_controller')

router.get('/', async () => {
  return {
    hello: 'world',
  }
})

router.get('/photos', [PhotosController, 'index'])
router.post('/photos', [PhotosController, 'store'])
