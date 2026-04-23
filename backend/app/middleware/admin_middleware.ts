import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { timingSafeEqual } from 'node:crypto'
import env from '#start/env'

export default class AdminMiddleware {
  async handle({ request, response }: HttpContext, next: NextFn) {
    const header = request.header('authorization')
    const expected = env.get('ADMIN_TOKEN')

    if (!header || !header.startsWith('Bearer ')) {
      return response.unauthorized({ error: 'Accès admin requis' })
    }

    const provided = header.slice('Bearer '.length).trim()
    const a = Buffer.from(provided)
    const b = Buffer.from(expected)

    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      return response.unauthorized({ error: 'Token admin invalide' })
    }

    return next()
  }
}
