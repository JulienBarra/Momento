import { useEffect, useMemo, useState } from "react";
import { Star, Globe, Users, Heart, Download, Check, Share2 } from "lucide-react";
import { toast } from "sonner";
import {
  adminPhotoService,
  adminMissionService,
  adminTableService,
  tableColor,
  type AdminPhoto,
  type AdminMission,
  type AdminTable,
} from "../adminApi";
import { Btn, formatTime, openPhoto } from "../ui";
import { getPhotoUrl } from "../../services/api";
import { EVENT } from "../config";
import PhotoDetail from "../components/PhotoDetail";

type Filter = "all" | "global" | "table" | "spontaneous";
const MOSAIC_HEIGHTS = [280, 360, 240, 420, 320, 360, 260, 380];

export default function CoupleView() {
  const [photos, setPhotos] = useState<AdminPhoto[]>([]);
  const [tables, setTables] = useState<AdminTable[]>([]);
  const [missions, setMissions] = useState<AdminMission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const [tableFilter, setTableFilter] = useState("all");
  const [missionFilter, setMissionFilter] = useState("all");
  const [onlyFavs, setOnlyFavs] = useState(false);
  const [layout, setLayout] = useState<"mosaic" | "grid">("mosaic");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [detail, setDetail] = useState<AdminPhoto | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [ps, ts, ms] = await Promise.all([
        adminPhotoService.getAll(),
        adminTableService.getAll(),
        adminMissionService.getAll(),
      ]);
      setPhotos(ps);
      setTables(ts);
      setMissions(ms);
    } catch {
      toast.error("Impossible de charger la galerie");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const colorOf = useMemo(() => {
    const map: Record<number, string> = {};
    tables.forEach((t, i) => (map[t.id] = tableColor(i)));
    return map;
  }, [tables]);

  const filtered = useMemo(() => {
    return photos.filter((p) => {
      if (filter === "global" && !(p.mission && p.mission.isGlobal)) return false;
      if (filter === "table" && !(p.mission && !p.mission.isGlobal)) return false;
      if (filter === "spontaneous" && p.mission !== null) return false;
      if (tableFilter !== "all" && p.tableId !== Number(tableFilter)) return false;
      if (missionFilter !== "all" && p.missionId !== Number(missionFilter)) return false;
      if (onlyFavs && !p.starred) return false;
      return true;
    });
  }, [photos, filter, tableFilter, missionFilter, onlyFavs]);

  const toggle = (id: number) =>
    setSelected((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const toggleStar = async (p: AdminPhoto) => {
    try {
      const updated = await adminPhotoService.setStarred(p.id, !p.starred);
      setPhotos((list) => list.map((x) => (x.id === p.id ? { ...x, starred: updated.starred } : x)));
      if (detail?.id === p.id) setDetail({ ...detail, starred: updated.starred });
    } catch {
      toast.error("Action impossible");
    }
  };

  const downloadAll = () => filtered.forEach((p) => openPhoto(getPhotoUrl(p.filePath)));
  const downloadSelection = () =>
    photos.filter((p) => selected.has(p.id)).forEach((p) => openPhoto(getPhotoUrl(p.filePath)));
  const favSelection = async () => {
    try {
      await Promise.all(
        photos.filter((p) => selected.has(p.id)).map((p) => adminPhotoService.setStarred(p.id, true))
      );
      toast.success("Ajoutées aux favoris");
      setSelected(new Set());
      load();
    } catch {
      toast.error("Action impossible");
    }
  };

  const stats = {
    photos: photos.length,
    favs: photos.filter((p) => p.starred).length,
    photographers: new Set(photos.map((p) => p.guestId)).size,
    missions: photos.filter((p) => p.missionId).length,
    activeTables: new Set(photos.map((p) => p.tableId).filter(Boolean)).size,
  };
  const globalMissions = missions.filter((m) => m.isGlobal);

  return (
    <div>
      {/* Hero */}
      <div className="px-10 pt-10 pb-6 border-b border-line bg-white">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="text-[11px] uppercase tracking-[0.25em] text-momento font-semibold mb-2">
              Votre mariage · Album
            </p>
            <h1 className="font-title text-7xl text-ink leading-none">{EVENT.couple}</h1>
            <p className="text-sm text-muted mt-3">
              {EVENT.dateLong} · {EVENT.venue}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Btn variant="outline" onClick={() => setOnlyFavs(true)}>
              <Star size={16} /> Album best-of
            </Btn>
            <Btn variant="outline" onClick={downloadAll} disabled={filtered.length === 0}>
              <Download size={16} /> Tout ouvrir ({filtered.length})
            </Btn>
            <Btn
              variant="dark"
              onClick={() => {
                navigator.clipboard?.writeText(window.location.href);
                toast.success("Lien copié");
              }}
            >
              <Share2 size={16} /> Partager
            </Btn>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-5 gap-6">
          <HeroStat label="Photos" value={stats.photos} />
          <HeroStat label="Favoris" value={stats.favs} />
          <HeroStat label="Photographes" value={stats.photographers} />
          <HeroStat label="Missions capturées" value={stats.missions} />
          <HeroStat label="Tables actives" value={`${stats.activeTables}/${tables.length || 0}`} />
        </div>
      </div>

      {/* Filters */}
      <div className="sticky top-0 z-10 bg-[color:var(--bg)]/95 backdrop-blur border-b border-line px-10 py-3 flex flex-wrap items-center gap-2">
        <Chip active={filter === "all"} onClick={() => setFilter("all")} tone="ink">
          Toutes
        </Chip>
        <Chip active={filter === "global"} onClick={() => setFilter("global")} tone="green">
          <Globe size={10} /> Globales
        </Chip>
        <Chip active={filter === "table"} onClick={() => setFilter("table")} tone="purple">
          <Users size={10} /> Missions table
        </Chip>
        <Chip active={filter === "spontaneous"} onClick={() => setFilter("spontaneous")} tone="red">
          <Heart size={10} /> Spontanées
        </Chip>
        <span className="w-px h-5 bg-line mx-2" />
        <button
          onClick={() => setOnlyFavs(!onlyFavs)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition flex items-center gap-1.5 ${
            onlyFavs
              ? "bg-amber-100 border-amber-300 text-amber-800"
              : "border-line text-ink bg-white hover:bg-[color:var(--bg)]"
          }`}
        >
          <Star size={12} fill={onlyFavs ? "currentColor" : "none"} /> Favoris
        </button>

        <div className="ml-auto flex items-center gap-2">
          <select
            value={tableFilter}
            onChange={(e) => setTableFilter(e.target.value)}
            className="text-sm border border-line rounded-lg px-3 py-1.5 bg-white"
          >
            <option value="all">Toutes les tables</option>
            {tables.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <select
            value={missionFilter}
            onChange={(e) => setMissionFilter(e.target.value)}
            className="text-sm border border-line rounded-lg px-3 py-1.5 bg-white max-w-56"
          >
            <option value="all">Toutes les missions</option>
            {globalMissions.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title.slice(0, 40)}
              </option>
            ))}
          </select>
          <span className="w-px h-5 bg-line mx-1" />
          <div className="inline-flex bg-white border border-line rounded-md p-0.5">
            <button
              onClick={() => setLayout("mosaic")}
              className={`px-2 py-1 rounded-sm text-xs ${layout === "mosaic" ? "bg-[color:var(--bg)] text-ink" : "text-muted"}`}
            >
              Mosaïque
            </button>
            <button
              onClick={() => setLayout("grid")}
              className={`px-2 py-1 rounded-sm text-xs ${layout === "grid" ? "bg-[color:var(--bg)] text-ink" : "text-muted"}`}
            >
              Grille
            </button>
          </div>
        </div>
      </div>

      {selected.size > 0 && (
        <div className="mx-10 mt-4 bg-ink text-white rounded-lg px-4 py-2.5 flex items-center gap-3">
          <span className="text-sm font-medium tabular-nums">
            {selected.size} sélection{selected.size > 1 ? "s" : ""}
          </span>
          <div className="ml-auto flex items-center gap-1.5">
            <button
              className="text-xs px-2.5 py-1.5 rounded-md hover:bg-white/10 flex items-center gap-1.5"
              onClick={downloadSelection}
            >
              <Download size={14} /> Ouvrir
            </button>
            <button
              className="text-xs px-2.5 py-1.5 rounded-md hover:bg-white/10 flex items-center gap-1.5"
              onClick={favSelection}
            >
              <Star size={14} fill="currentColor" /> Favoris
            </button>
            <button
              className="text-xs px-2.5 py-1.5 rounded-md hover:bg-white/10"
              onClick={() => setSelected(new Set())}
            >
              <Check size={14} />
            </button>
          </div>
        </div>
      )}

      <div className="p-10">
        {loading ? (
          <p className="text-sm text-muted">Chargement de la galerie…</p>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-muted">
            <Heart size={32} className="mx-auto mb-3" />
            <p className="text-sm">Aucune photo pour ce filtre</p>
          </div>
        ) : layout === "grid" ? (
          <div className="grid grid-cols-5 gap-3">
            {filtered.map((p) => (
              <CouplePhoto
                key={p.id}
                p={p}
                selected={selected.has(p.id)}
                onToggle={() => toggle(p.id)}
                onOpen={() => setDetail(p)}
                onStar={() => toggleStar(p)}
              />
            ))}
          </div>
        ) : (
          <div className="columns-4 gap-3">
            {filtered.map((p, i) => (
              <div key={p.id} className="mb-3 break-inside-avoid">
                <CouplePhoto
                  p={p}
                  selected={selected.has(p.id)}
                  onToggle={() => toggle(p.id)}
                  onOpen={() => setDetail(p)}
                  onStar={() => toggleStar(p)}
                  height={MOSAIC_HEIGHTS[i % MOSAIC_HEIGHTS.length]}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {detail && (
        <PhotoDetail
          photo={detail}
          color={detail.tableId ? colorOf[detail.tableId] ?? "#9ca3af" : "#9ca3af"}
          onClose={() => setDetail(null)}
          onToggleStar={() => toggleStar(detail)}
        />
      )}
    </div>
  );
}

function HeroStat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-muted font-medium">{label}</p>
      <p className="text-2xl font-bold text-ink tabular-nums">{value}</p>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
  tone,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  tone: "green" | "purple" | "red" | "ink";
}) {
  const toneActive = {
    green: "bg-momento text-white border-transparent",
    purple: "bg-purple-600 text-white border-transparent",
    red: "bg-red-500 text-white border-transparent",
    ink: "bg-ink text-white border-transparent",
  }[tone];
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition inline-flex items-center gap-1.5 ${
        active ? toneActive : "border-line text-ink bg-white hover:bg-[color:var(--bg)]"
      }`}
    >
      {children}
    </button>
  );
}

function CouplePhoto({
  p,
  selected,
  onToggle,
  onOpen,
  onStar,
  height,
}: {
  p: AdminPhoto;
  selected: boolean;
  onToggle: () => void;
  onOpen: () => void;
  onStar: () => void;
  height?: number;
}) {
  const m = p.mission;
  return (
    <div
      className={`gallery-item group relative rounded-lg overflow-hidden border transition ${
        selected ? "border-momento ring-2 ring-[color:var(--momento-50)]" : "border-line"
      }`}
    >
      <div
        className={height ? "bg-[color:var(--bg)] overflow-hidden" : "aspect-square bg-[color:var(--bg)] overflow-hidden"}
        style={height ? { height: `${height}px` } : {}}
      >
        <button onClick={onOpen} className="w-full h-full">
          <img src={getPhotoUrl(p.filePath)} className="w-full h-full object-cover" loading="lazy" alt="" />
        </button>
      </div>
      <button
        onClick={onToggle}
        className={`absolute top-2 left-2 w-5 h-5 rounded border-2 flex items-center justify-center transition ${
          selected
            ? "bg-momento border-momento"
            : "bg-white/80 border-white opacity-0 group-hover:opacity-100"
        }`}
      >
        {selected && <Check size={12} className="text-white" />}
      </button>
      <button
        onClick={onStar}
        className={`absolute top-2 right-2 p-1.5 rounded-full transition ${
          p.starred ? "bg-amber-400 text-white" : "bg-white/80 text-ink opacity-0 group-hover:opacity-100"
        }`}
      >
        <Star size={12} fill={p.starred ? "white" : "none"} />
      </button>
      {m && (
        <div className="absolute bottom-2 left-2">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-medium border border-transparent rounded-full bg-white/95 backdrop-blur text-ink">
            {m.isGlobal ? <Globe size={10} /> : <Users size={10} />}
            <span className="truncate max-w-[140px]">{m.title.slice(0, 24)}</span>
          </span>
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 pt-8 opacity-0 group-hover:opacity-100 transition">
        <div className="flex items-center justify-between">
          <p className="text-white text-xs font-medium">{p.guest?.nickname ?? "—"}</p>
          <p className="text-white/80 text-[10px] font-mono">{formatTime(p.createdAt)}</p>
        </div>
      </div>
    </div>
  );
}
