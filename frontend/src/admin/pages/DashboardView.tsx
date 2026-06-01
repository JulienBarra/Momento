import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Image as ImageIcon, Users, Target, Globe, Heart } from "lucide-react";
import { toast } from "sonner";
import {
  adminStatsService,
  adminTableService,
  tableColor,
  type DashboardStats,
  type AdminTable,
} from "../adminApi";
import { Topbar, Card, Pill, TableDot, formatTime } from "../ui";
import { EVENT } from "../config";
import { getPhotoUrl } from "../../services/api";

export default function DashboardView() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [tables, setTables] = useState<AdminTable[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [s, ts] = await Promise.all([adminStatsService.get(), adminTableService.getAll()]);
        setStats(s);
        setTables(ts);
      } catch {
        toast.error("Impossible de charger le tableau de bord");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const colorOf = useMemo(() => {
    const map: Record<number, string> = {};
    tables.forEach((t, i) => (map[t.id] = tableColor(i)));
    return map;
  }, [tables]);

  return (
    <div>
      <Topbar
        title="Tableau de bord"
        subtitle={`${EVENT.couple} · ${EVENT.dateLong} · ${EVENT.venue}`}
      />

      <div className="p-10 space-y-6">
        {loading || !stats ? (
          <p className="text-sm text-muted">Chargement des statistiques…</p>
        ) : (
          <>
            <div className="grid grid-cols-4 gap-4">
              <Stat
                label="Photos capturées"
                value={stats.photos.total}
                sub={`+${stats.photos.lastHour} dans la dernière heure`}
                accent={<ImageIcon size={16} className="text-muted" />}
              />
              <Stat
                label="Invités connectés"
                value={stats.guests.connected}
                sub="ont rejoint l'événement"
                accent={<Users size={16} className="text-muted" />}
              />
              <Stat
                label="Photos de mission"
                value={stats.missions.accomplishedPhotos}
                sub={`${stats.missions.globalCount} mission(s) globale(s)`}
                accent={<Target size={16} className="text-muted" />}
              />
              <Stat
                label="Tables actives"
                value={`${stats.tables.active}/${stats.tables.total}`}
                sub="ont au moins une photo"
                accent={<Globe size={16} className="text-muted" />}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <ActivityChart buckets={stats.buckets} />
              </div>
              <MissionProgress missions={stats.globalMissions} />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <RecentActivity recent={stats.recent} colorOf={colorOf} />
              </div>
              <TableLeaderboard leaderboard={stats.leaderboard} colorOf={colorOf} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: ReactNode;
  sub?: string;
  accent?: ReactNode;
}) {
  return (
    <Card className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <p className="text-[11px] text-muted uppercase tracking-wider font-medium">{label}</p>
        {accent}
      </div>
      <p className="text-3xl font-bold text-ink tracking-tight tabular-nums">{value}</p>
      {sub && <p className="text-xs text-muted">{sub}</p>}
    </Card>
  );
}

function ActivityChart({ buckets }: { buckets: DashboardStats["buckets"] }) {
  const max = Math.max(...buckets.map((b) => b.count), 1);
  return (
    <Card>
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="font-semibold text-ink">Activité photo</p>
          <p className="text-xs text-muted">Par tranches de 30 min</p>
        </div>
        <Pill tone="green">
          <span className="w-1.5 h-1.5 rounded-full bg-[color:var(--momento)] pulse-dot" /> En direct
        </Pill>
      </div>
      {buckets.length === 0 ? (
        <div className="h-44 flex items-center justify-center text-sm text-muted">
          Aucune activité pour l'instant
        </div>
      ) : (
        <div className="flex items-end gap-1.5 h-44">
          {buckets.map((b, i) => {
            const h = b.count ? Math.max(4, (b.count / max) * 100) : 2;
            return (
              <div key={`${b.key}-${i}`} className="flex-1 flex flex-col items-center gap-2 group">
                <div
                  className="relative w-full rounded-sm transition-all bg-momento"
                  style={{ height: `${h}%` }}
                >
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-7 left-1/2 -translate-x-1/2 bg-ink text-white text-[10px] px-1.5 py-0.5 rounded font-mono">
                    {b.count}
                  </div>
                </div>
                <div className="text-[10px] text-muted font-mono">{i % 2 === 0 ? b.key : " "}</div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

function MissionProgress({ missions }: { missions: DashboardStats["globalMissions"] }) {
  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <p className="font-semibold text-ink">Missions globales</p>
        <Pill tone="outline">{missions.length} défis</Pill>
      </div>
      {missions.length === 0 ? (
        <p className="text-sm text-muted">Aucune mission globale</p>
      ) : (
        <div className="space-y-3">
          {missions.map((m) => {
            const pct = Math.min(100, (m.completedCount / Math.max(m.target, 1)) * 100);
            return (
              <div key={m.id}>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-sm text-ink truncate pr-4">{m.title}</p>
                  <p className="text-xs text-muted font-mono tabular-nums flex-shrink-0">
                    {m.completedCount}/{m.target}
                  </p>
                </div>
                <div className="h-1.5 bg-[color:var(--bg)] rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-momento" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

function RecentActivity({
  recent,
  colorOf,
}: {
  recent: DashboardStats["recent"];
  colorOf: Record<number, string>;
}) {
  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <p className="font-semibold text-ink">Flux en direct</p>
      </div>
      {recent.length === 0 ? (
        <p className="text-sm text-muted">Aucune photo pour l'instant</p>
      ) : (
        <div className="space-y-0 divide-line">
          {recent.map((p) => (
            <div key={p.id} className="flex items-center gap-3 py-2.5">
              <div className="w-10 h-10 rounded-md img-ph overflow-hidden flex-shrink-0">
                <img src={getPhotoUrl(p.filePath)} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-ink truncate">
                  <span className="font-medium">{p.guestNickname}</span>{" "}
                  <span className="text-muted">a posté une photo</span>
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  {p.tableId && p.tableName && (
                    <TableDot name={p.tableName} color={colorOf[p.tableId] ?? "#9ca3af"} />
                  )}
                  {p.mission ? (
                    p.mission.isGlobal ? (
                      <Pill tone="green">
                        <Globe size={10} /> {truncate(p.mission.title, 24)}
                      </Pill>
                    ) : (
                      <Pill tone="purple">
                        <Users size={10} /> Mission table
                      </Pill>
                    )
                  ) : (
                    <Pill tone="red">
                      <Heart size={10} /> Spontanée
                    </Pill>
                  )}
                </div>
              </div>
              <p className="text-xs text-muted font-mono tabular-nums">{formatTime(p.createdAt)}</p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function TableLeaderboard({
  leaderboard,
  colorOf,
}: {
  leaderboard: DashboardStats["leaderboard"];
  colorOf: Record<number, string>;
}) {
  const max = leaderboard[0]?.count || 1;
  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <p className="font-semibold text-ink">Classement des tables</p>
        <Pill tone="outline">Photos</Pill>
      </div>
      {leaderboard.length === 0 ? (
        <p className="text-sm text-muted">Aucune table</p>
      ) : (
        <div className="space-y-3">
          {leaderboard.map((t, i) => (
            <div key={t.id} className="flex items-center gap-3">
              <div className="w-5 text-xs text-muted font-mono">{String(i + 1).padStart(2, "0")}</div>
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: colorOf[t.id] ?? "#9ca3af" }} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm text-ink font-medium truncate">{t.name}</p>
                  <p className="text-xs text-muted tabular-nums">{t.count}</p>
                </div>
                <div className="h-1.5 bg-[color:var(--bg)] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${(t.count / max) * 100}%`, background: colorOf[t.id] ?? "#9ca3af" }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function truncate(s: string, n: number): string {
  return s.length > n ? `${s.slice(0, n)}…` : s;
}
