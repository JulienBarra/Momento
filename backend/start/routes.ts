import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const PhotosController = () => import('#controllers/photos_controller')
const MissionsController = () => import('#controllers/missions_controller')
const AuthController = () => import('#controllers/auth_controller')
const AdminTablesController = () => import('#controllers/admin_tables_controller')
const AdminMissionsController = () => import('#controllers/admin_missions_controller')
const AdminDashboardController = () => import('#controllers/admin_dashboard_controller')
const AdminPhotosController = () => import('#controllers/admin_photos_controller')

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
    // -- Tables (CRUD) --
    router.get('/tables', [AdminTablesController, 'index'])
    router.post('/tables', [AdminTablesController, 'store'])
    router.patch('/tables/:id', [AdminTablesController, 'update'])
    router.delete('/tables/:id', [AdminTablesController, 'destroy'])

    // -- QR code signé d'une table --
    router.get('/tables/:id/qr', [AuthController, 'generateQrLink'])

    // -- Missions (CRUD) --
    router.get('/missions', [AdminMissionsController, 'index'])
    router.post('/missions', [AdminMissionsController, 'store'])
    router.patch('/missions/:id', [AdminMissionsController, 'update'])
    router.delete('/missions/:id', [AdminMissionsController, 'destroy'])

    // -- Photos (admin : favori + suppression) --
    router.get('/photos', [AdminPhotosController, 'index'])
    router.patch('/photos/:id', [AdminPhotosController, 'update'])
    router.delete('/photos/:id', [AdminPhotosController, 'destroy'])

    // -- Tableau de bord --
    router.get('/stats', [AdminDashboardController, 'stats'])
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
