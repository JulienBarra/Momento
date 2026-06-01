import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import Photo from '#models/photo'
import Guest from '#models/guest'
import Table from '#models/table'
import Mission from '#models/mission'

export default class AdminDashboardController {
  // GET /admin/stats — agrégats pour le tableau de bord
  async stats({ response }: HttpContext) {
    const oneHourAgo = DateTime.now().minus({ hours: 1 }).toJSDate()

    const totalPhotos = Number((await Photo.query().count('* as total'))[0].$extras.total)
    const lastHour = Number(
      (await Photo.query().where('created_at', '>', oneHourAgo).count('* as total'))[0].$extras.total
    )
    const missionPhotos = Number(
      (await Photo.query().whereNotNull('mission_id').count('* as total'))[0].$extras.total
    )
    const totalGuests = Number((await Guest.query().count('* as total'))[0].$extras.total)
    const totalTables = Number((await Table.query().count('* as total'))[0].$extras.total)

    // Classement des tables par nombre de photos
    const tables = await Table.query().withCount('photos').orderBy('id', 'asc')
    const leaderboard = tables
      .map((t) => ({ id: t.id, name: t.name, count: Number(t.$extras.photos_count ?? 0) }))
      .sort((a, b) => b.count - a.count)
    const activeTables = leaderboard.filter((t) => t.count > 0).length

    // Flux récent
    const recentPhotos = await Photo.query()
      .preload('guest')
      .preload('table')
      .preload('mission')
      .orderBy('created_at', 'desc')
      .limit(8)
    const recent = recentPhotos.map((p) => ({
      id: p.id,
      filePath: p.file_path,
      guestNickname: p.guest?.nickname ?? '—',
      tableId: p.table_id,
      tableName: p.table?.name ?? null,
      mission: p.mission ? { title: p.mission.title, isGlobal: p.mission.isGlobal } : null,
      createdAt: p.createdAt,
    }))

    // Progression des missions globales
    const globalMissionsRows = await Mission.query()
      .where('is_global', true)
      .withCount('photos')
      .orderBy('id', 'asc')
    const globalMissions = globalMissionsRows.map((m) => ({
      id: m.id,
      title: m.title,
      completedCount: Number(m.$extras.photos_count ?? 0),
      target: Math.max(totalGuests, 1),
    }))

    // Buckets d'activité par tranches de 30 min
    const buckets = await this.activityBuckets()

    return response.ok({
      photos: { total: totalPhotos, lastHour },
      guests: { connected: totalGuests },
      missions: { accomplishedPhotos: missionPhotos, globalCount: globalMissions.length },
      tables: { total: totalTables, active: activeTables },
      leaderboard,
      recent,
      globalMissions,
      buckets,
    })
  }

  private async activityBuckets() {
    const rows = await Photo.query().select('created_at').orderBy('created_at', 'asc')
    if (rows.length === 0) return [] as { key: string; count: number }[]

    const slotKey = (dt: DateTime) => `${dt.hour}h${dt.minute < 30 ? '00' : '30'}`
    const slotFloor = (dt: DateTime) =>
      dt.set({ minute: dt.minute < 30 ? 0 : 30, second: 0, millisecond: 0 })

    const counts = new Map<string, number>()
    let first: DateTime | null = null
    let last: DateTime | null = null
    for (const r of rows) {
      const dt = slotFloor(r.createdAt)
      if (!first) first = dt
      last = dt
      const k = slotKey(dt)
      counts.set(k, (counts.get(k) ?? 0) + 1)
    }

    // Génère des slots contigus de 30 min entre la première et la dernière photo
    const out: { key: string; count: number }[] = []
    let cursor = first!
    let guard = 0
    while (cursor <= last! && guard < 200) {
      const k = slotKey(cursor)
      out.push({ key: k, count: counts.get(k) ?? 0 })
      cursor = cursor.plus({ minutes: 30 })
      guard++
    }
    return out
  }
}
