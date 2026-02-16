import router from '@adonisjs/core/services/router'

const PhotosController = () => import('#controllers/photos_controller')
const MissionsController = () => import('#controllers/missions_controller')

router.get('/', async () => {
  return {
    hello: 'world',
  }
})

// Routes pour les photos
router.get('/photos', [PhotosController, 'index'])
router.post('/photos', [PhotosController, 'store'])

// Routes pour les missions
router.get('/missions', [MissionsController, 'index'])
