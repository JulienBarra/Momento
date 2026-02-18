import type { HttpContext } from '@adonisjs/core/http'
import router from '@adonisjs/core/services/router'
import Guest from '#models/guest'

export default class AuthController {
  // Lorsque le frontend sera créer et hébergera le QR Code
  // il faudra remplacer l'URL de base par celle du frontend
  // (ex: https://app.momento.com/tables/3/login?signature=...)

  //  1.(ADMIN) : Générer le lien à mettre dans le QR Code
  //  Fabrique le ticket d'entrée crypté
  async generateQrLink({ params, response }: HttpContext) {
    const tableId = params.id

    // Génère une URL signée valide pour la route 'guest.login'
    const signedUrl = router.makeSignedUrl('guest.login', { id: tableId })

    // En local, ça va donner un truc genre : /tables/3/login?signature=...
    return response.ok({
      message: 'Voici le lien sécurisé à encoder dans le QR Code de cette table',
      url: signedUrl,
    })
  }

  //  2. (INVITÉ) : scan QR Code et création Token
  //  Le frontend enverra le pseudo de l'invité vers cette URL signée.
  async login({ request, response, params }: HttpContext) {
    // A. Vérification signature
    if (!request.hasValidSignature()) {
      return response.unauthorized({ error: 'Ce QR Code est invalide ou a été modifié.' })
    }

    const tableId = params.id
    const nickname = request.input('nickname')

    if (!nickname) {
      return response.badRequest({ error: 'Le pseudo est obligatoire' })
    }

    // B. Trouve ou créer l'invité
    const guest = await Guest.firstOrCreate(
      { nickname: nickname, tableId: tableId },
      { nickname: nickname, tableId: tableId }
    )

    // C. Génère Access Token pour l'invité
    const token = await Guest.accessTokens.create(guest)

    // D. Renvoie au front
    return response.ok({
      message: 'Connexion réussie !',
      guest: guest,
      token: token.value!.release(),
    })
  }
}
