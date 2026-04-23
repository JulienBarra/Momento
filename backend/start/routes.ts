import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const PhotosController = () => import('#controllers/photos_controller')
const MissionsController = () => import('#controllers/missions_controller')
const AuthController = () => import('#controllers/auth_controller')

router.get('/', async () => {
  return {
    hello: 'world',
  }
})

// =======================================================
// 🟢 ROUTES PUBLIQUES (Pas besoin de badge pour y aller)
// =======================================================
// Route Invité pour se connecter (avec la signature)
router.post('/tables/:id/login', [AuthController, 'login']).as('guest.login')

// =======================================================
// 🛡️ ROUTES ADMIN (Bearer ADMIN_TOKEN)
// =======================================================
router
  .group(() => {
    router.get('/tables/:id/qr', [AuthController, 'generateQrLink'])
  })
  .prefix('/admin')
  .use(middleware.admin())

// =======================================================
// 🔴 ROUTES PROTÉGÉES (Middleware auth)
// =======================================================
router
  .group(() => {
    // -- Photos --
    router.get('/photos', [PhotosController, 'index'])
    router.post('/photos', [PhotosController, 'store'])

    // -- Missions --
    router.get('/missions', [MissionsController, 'index'])
  })
  .use(middleware.auth())
