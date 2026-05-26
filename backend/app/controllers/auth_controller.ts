import type { HttpContext } from '@adonisjs/core/http'
import router from '@adonisjs/core/services/router'
import env from '#start/env'
import Guest from '#models/guest'

export default class AuthController {
  //  1.(ADMIN) : Générer le lien à encoder dans le QR Code d'une table
  //  Renvoie l'URL frontend réellement scannée par l'invité :
  //  {FRONTEND_URL}/join?tableId=X&signature=...
  //  La signature est calculée pour la route 'guest.login' avec l'APP_KEY de
  //  ce serveur ; c'est donc bien ce serveur (= la prod) qui doit la générer.
  async generateQrLink({ params, response }: HttpContext) {
    const tableId = Number(params.id)
    if (!Number.isInteger(tableId)) {
      return response.badRequest({ error: 'Identifiant de table invalide' })
    }

    const frontendUrl = env.get('FRONTEND_URL').replace(/\/+$/, '')

    // URL signée AdonisJS pour la route 'guest.login' (= /tables/:id/login?signature=...)
    const signedPath = router.makeSignedUrl('guest.login', { id: tableId })
    const signature = new URL(signedPath, frontendUrl).searchParams.get('signature')

    const joinUrl = `${frontendUrl}/join?tableId=${tableId}&signature=${signature}`

    return response.ok({
      message: 'Lien sécurisé à encoder dans le QR Code de cette table',
      url: joinUrl,
      signature,
    })
  }

  //  2. (INVITÉ) : scan QR Code et création Token
  //  Le frontend enverra le pseudo de l'invité vers cette URL signée.
  async login({ request, response, params }: HttpContext) {
    if (!request.hasValidSignature()) {
      return response.unauthorized({ error: 'Ce QR Code est invalide ou a été modifié.' })
    }

    const tableId = Number(params.id)
    const nickname = request.input('nickname')?.trim()
    const deviceSecret = request.input('deviceSecret')

    if (!Number.isInteger(tableId)) {
      return response.badRequest({ error: 'Identifiant de table invalide' })
    }
    if (!nickname) {
      return response.badRequest({ error: 'Le pseudo est obligatoire' })
    }
    if (!deviceSecret || typeof deviceSecret !== 'string') {
      return response.badRequest({ error: 'Identifiant d’appareil manquant' })
    }

    let guest = await Guest.findBy('nickname', nickname)

    if (guest) {
      if (!guest.deviceSecret) {
        // Cas legacy : Guest sans device_secret → on le claim pour cet appareil
        guest.deviceSecret = deviceSecret
        guest.tableId = tableId
        await guest.save()
      } else if (guest.deviceSecret === deviceSecret) {
        // Reconnexion légitime
        if (guest.tableId !== tableId) {
          guest.tableId = tableId
          await guest.save()
        }
      } else {
        // Pseudo déjà pris par un autre appareil
        return response.conflict({
          error: 'Ce pseudo est déjà utilisé. Choisis un pseudo différent.',
          code: 'NICKNAME_TAKEN',
        })
      }
    } else {
      // Nouveau Guest. Try-catch pour la race condition (deux signups simultanés).
      try {
        guest = await Guest.create({ nickname, tableId, deviceSecret })
      } catch (err) {
        if (err.code === '23505') {
          return response.conflict({
            error: 'Ce pseudo vient d’être pris. Choisis-en un autre.',
            code: 'NICKNAME_TAKEN',
          })
        }
        throw err
      }
    }

    await guest.load('table')
    const token = await Guest.accessTokens.create(guest)

    return response.ok({
      message: 'Connexion réussie !',
      guest: guest,
      token: token.value!.release(),
    })
  }
}
