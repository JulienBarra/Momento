import { useEffect, useMemo, useState } from "react";
import { Search, Download, Star, Trash2, X, Check, Globe, Users, Heart, Eye, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import {
  adminPhotoService,
  adminTableService,
  tableColor,
  type AdminPhoto,
  type AdminTable,
} from "../adminApi";
import { Topbar, formatTime, openPhoto } from "../ui";
import { getPhotoUrl } from "../../services/api";
import PhotoDetail from "../components/PhotoDetail";

type Filter = "all" | "global" | "table" | "spontaneous";

export default function PhotosView() {
  const [photos, setPhotos] = useState<AdminPhoto[]>([]);
  const [tables, setTables] = useState<AdminTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const [tableFilter, setTableFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [detail, setDetail] = useState<AdminPhoto | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [ps, ts] = await Promise.all([adminPhotoService.getAll(), adminTableService.getAll()]);
      setPhotos(ps);
      setTables(ts);
    } catch {
      toast.error("Impossible de charger les photos");
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
      if (search && !(p.guest?.nickname ?? "").toLowerCase().includes(search.toLowerCase()))
        return false;
      return true;
    });
  }, [photos, filter, tableFilter, search]);

  const toggle = (id: number) =>
    setSelected((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  const clearSel = () => setSelected(new Set());
  const selectAll = () => setSelected(new Set(filtered.map((p) => p.id)));

  const selectedPhotos = () => photos.filter((p) => selected.has(p.id));

  const starSelection = async () => {
    const items = selectedPhotos();
    try {
      await Promise.all(items.map((p) => adminPhotoService.setStarred(p.id, true)));
      toast.success("Ajoutées aux favoris");
      clearSel();
      load();
    } catch {
      toast.error("Action impossible");
    }
  };

  const deleteSelection = async () => {
    const items = selectedPhotos();
    if (!window.confirm(`Supprimer ${items.length} photo(s) ? Action irréversible.`)) return;
    try {
      await Promise.all(items.map((p) => adminPhotoService.remove(p.id)));
      toast.success("Photo(s) supprimée(s)");
      clearSel();
      load();
    } catch {
      toast.error("Suppression impossible");
    }
  };

  const downloadSelection = () => selectedPhotos().forEach((p) => openPhoto(getPhotoUrl(p.filePath)));

  const toggleStar = async (p: AdminPhoto) => {
    try {
      const updated = await adminPhotoService.setStarred(p.id, !p.starred);
      setPhotos((list) => list.map((x) => (x.id === p.id ? { ...x, starred: updated.starred } : x)));
      if (detail?.id === p.id) setDetail({ ...detail, starred: updated.starred });
    } catch {
      toast.error("Action impossible");
    }
  };

  const removeOne = async (p: AdminPhoto) => {
    if (!window.confirm("Supprimer cette photo ? Action irréversible.")) return;
    try {
      await adminPhotoService.remove(p.id);
      toast.success("Photo supprimée");
      setDetail(null);
      setPhotos((list) => list.filter((x) => x.id !== p.id));
    } catch {
      toast.error("Suppression impossible");
    }
  };

  const starredCount = photos.filter((p) => p.starred).length;

  return (
    <div>
      <Topbar
        title="Photos"
        subtitle={
          loading ? "Chargement…" : `${photos.length} photos · ${starredCount} favori(s)`
        }
      />

      <div className="px-10 pt-6 pb-4 flex flex-wrap items-center gap-2 border-b border-line">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un invité…"
            className="pl-8 pr-3 py-2 text-sm border border-line rounded-lg bg-white w-56 focus:outline-none focus:border-[color:var(--momento)]"
          />
        </div>

        <span className="w-px h-5 bg-line mx-2" />

        <Chip active={filter === "all"} onClick={() => setFilter("all")} tone="ink">
          Toutes · {photos.length}
        </Chip>
        <Chip active={filter === "global"} onClick={() => setFilter("global")} tone="green">
          Missions globales
        </Chip>
        <Chip active={filter === "table"} onClick={() => setFilter("table")} tone="purple">
          Missions de table
        </Chip>
        <Chip active={filter === "spontaneous"} onClick={() => setFilter("spontaneous")} tone="red">
          Spontanées
        </Chip>

        <div className="ml-auto">
          <select
            value={tableFilter}
            onChange={(e) => setTableFilter(e.target.value)}
            className="text-sm border border-line rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-[color:var(--momento)]"
          >
            <option value="all">Toutes les tables</option>
            {tables.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selected.size > 0 && (
        <div className="mx-10 mt-4 bg-ink text-white rounded-lg px-4 py-2.5 flex items-center gap-3">
          <span className="text-sm font-medium tabular-nums">
            {selected.size} photo{selected.size > 1 ? "s" : ""} sélectionnée{selected.size > 1 ? "s" : ""}
          </span>
          <span className="w-px h-4 bg-white/30" />
          <button className="text-xs hover:underline" onClick={selectAll}>
            Tout sélectionner ({filtered.length})
          </button>
          <div className="ml-auto flex items-center gap-1.5">
            <button
              className="text-xs px-2.5 py-1.5 rounded-md hover:bg-white/10 flex items-center gap-1.5"
              onClick={downloadSelection}
            >
              <Download size={14} /> Ouvrir
            </button>
            <button
              className="text-xs px-2.5 py-1.5 rounded-md hover:bg-white/10 flex items-center gap-1.5"
              onClick={starSelection}
            >
              <Star size={14} /> Favori
            </button>
            <button
              className="text-xs px-2.5 py-1.5 rounded-md hover:bg-red-500/30 text-red-300 flex items-center gap-1.5"
              onClick={deleteSelection}
            >
              <Trash2 size={14} /> Supprimer
            </button>
            <button className="text-xs px-2.5 py-1.5 rounded-md hover:bg-white/10" onClick={clearSel}>
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      <div className="p-10">
        {loading ? (
          <p className="text-sm text-muted">Chargement des photos…</p>
        ) : (
          <>
            <div className="grid grid-cols-6 gap-3">
              {filtered.map((p) => (
                <PhotoCard
                  key={p.id}
                  photo={p}
                  selected={selected.has(p.id)}
                  onToggle={() => toggle(p.id)}
                  onOpen={() => setDetail(p)}
                />
              ))}
            </div>
            {filtered.length === 0 && (
              <div className="text-center py-20 text-muted">
                <ImageIcon size={32} className="mx-auto mb-3" />
                <p className="text-sm">Aucune photo pour ce filtre</p>
              </div>
            )}
          </>
        )}
      </div>

      {detail && (
        <PhotoDetail
          photo={detail}
          color={detail.tableId ? colorOf[detail.tableId] ?? "#9ca3af" : "#9ca3af"}
          onClose={() => setDetail(null)}
          onToggleStar={() => toggleStar(detail)}
          onDelete={() => removeOne(detail)}
        />
      )}
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
      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
        active ? toneActive : "border-line text-ink bg-white hover:bg-[color:var(--bg)]"
      }`}
    >
      {children}
    </button>
  );
}

function PhotoCard({
  photo,
  selected,
  onToggle,
  onOpen,
}: {
  photo: AdminPhoto;
  selected: boolean;
  onToggle: () => void;
  onOpen: () => void;
}) {
  const m = photo.mission;
  return (
    <div
      className={`gallery-item group relative rounded-lg overflow-hidden border transition ${
        selected ? "border-momento ring-2 ring-[color:var(--momento-50)]" : "border-line"
      }`}
    >
      <div className="aspect-square bg-[color:var(--bg)] overflow-hidden">
        <img src={getPhotoUrl(photo.filePath)} className="w-full h-full object-cover" loading="lazy" alt="" />
      </div>
      <button
        onClick={onToggle}
        className={`absolute top-2 left-2 w-5 h-5 rounded border-2 flex items-center justify-center transition ${
          selected ? "bg-momento border-momento" : "bg-white/90 border-white"
        }`}
      >
        {selected && <Check size={12} className="text-white" />}
      </button>
      <div className="absolute top-2 right-2 flex items-center gap-1">
        {photo.starred && (
          <div className="bg-amber-400 text-white p-1 rounded-full">
            <Star size={12} fill="white" />
          </div>
        )}
        {m ? (
          m.isGlobal ? (
            <div className="bg-[color:var(--momento)]/90 backdrop-blur text-white p-1 rounded-full">
              <Globe size={12} />
            </div>
          ) : (
            <div className="bg-purple-600/90 backdrop-blur text-white p-1 rounded-full">
              <Users size={12} />
            </div>
          )
        ) : (
          <div className="bg-red-500/90 backdrop-blur text-white p-1 rounded-full">
            <Heart size={12} fill="white" />
          </div>
        )}
      </div>
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-2">
        <div className="flex items-end justify-between gap-2">
          <div className="min-w-0">
            <p className="text-white text-xs font-medium truncate">{photo.guest?.nickname ?? "—"}</p>
            <p className="text-white/70 text-[10px] font-mono">
              {formatTime(photo.createdAt)}
              {photo.table ? ` · ${photo.table.name}` : ""}
            </p>
          </div>
          <button
            onClick={onOpen}
            className="opacity-0 group-hover:opacity-100 bg-white text-ink rounded-full p-1.5 transition"
          >
            <Eye size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}
