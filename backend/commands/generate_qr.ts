import { BaseCommand, flags } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import app from '@adonisjs/core/services/app'

export default class GenerateQr extends BaseCommand {
  static commandName = 'generate:qr'
  static description = 'Génère un QR Code PNG par table (lien signé vers le frontend /join)'

  static options: CommandOptions = {
    startApp: true, // Nécessaire pour la BDD, le router signé et l'env
  }

  @flags.number({ description: 'Générer le QR d’une seule table (par id)' })
  declare table: number

  async run() {
    const { default: Table } = await import('#models/table')
    const { default: router } = await import('@adonisjs/core/services/router')
    const env = await import('#start/env').then((m) => m.default)
    const QRCode = (await import('qrcode')).default

    const frontendUrl = env.get('FRONTEND_URL').replace(/\/+$/, '')

    const tables = this.table
      ? await Table.query().where('id', this.table)
      : await Table.query().orderBy('id', 'asc')

    if (tables.length === 0) {
      this.logger.error(
        this.table ? `Aucune table avec l'id ${this.table}.` : 'Aucune table en base.'
      )
      return
    }

    const outputDir = app.makePath('storage/qrcodes')
    await mkdir(outputDir, { recursive: true })

    for (const table of tables) {
      // URL signée AdonisJS pour la route guest.login (= /tables/:id/login?signature=...)
      const signedPath = router.makeSignedUrl('guest.login', { id: table.id })
      const signature = new URL(signedPath, frontendUrl).searchParams.get('signature')

      // URL réellement scannée par l'invité : le frontend /join lit tableId + signature
      const joinUrl = `${frontendUrl}/join?tableId=${table.id}&signature=${signature}`

      const safeName = table.name.replace(/[^a-z0-9]+/gi, '-').toLowerCase()
      const fileName = `table-${table.id}-${safeName}.png`
      const filePath = join(outputDir, fileName)

      await QRCode.toFile(filePath, joinUrl, {
        width: 800,
        margin: 2,
        errorCorrectionLevel: 'M',
      })

      this.logger.success(`Table "${table.name}" (#${table.id}) → ${fileName}`)
    }

    this.logger.info(`${tables.length} QR Code(s) générés dans ${outputDir}`)
  }
}
