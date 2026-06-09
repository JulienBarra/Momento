import { useEffect, useState } from "react";
import {
  Plus,
  Link2,
  Trash2,
  Images,
  Eye,
  EyeOff,
  X,
  Pencil,
} from "lucide-react";
import { toast } from "sonner";
import {
  adminAlbumService,
  type AdminAlbum,
  type AlbumPhotoLite,
} from "../adminApi";
import { Btn, Card, Pill, Topbar } from "../ui";
import { getPhotoUrl } from "../../services/api";

export default function AlbumsView() {
  const [albums, setAlbums] = useState<AdminAlbum[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  // Album ouvert en consultation (null = aucun). On y voit uniquement ses photos.
  const [editing, setEditing] = useState<AdminAlbum | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      setAlbums(await adminAlbumService.getAll());
    } catch {
      toast.error("Impossible de charger les albums");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    const title = newTitle.trim();
    if (!title) return;
    try {
      const album = await adminAlbumService.create({ title });
      setAlbums((a) => [album, ...a]);
      setNewTitle("");
      setCreating(false);
      toast.success("Album créé — ajoute des photos depuis la galerie");
    } catch {
      toast.error("Création impossible");
    }
  };

  const togglePublic = async (album: AdminAlbum) => {
    try {
      const updated = await adminAlbumService.update(album.id, { isPublic: !album.isPublic });
      setAlbums((a) => a.map((x) => (x.id === album.id ? updated : x)));
      toast.success(updated.isPublic ? "Lien réactivé" : "Lien désactivé");
    } catch {
      toast.error("Action impossible");
    }
  };

  const rename = async (album: AdminAlbum) => {
    const title = window.prompt("Nouveau titre de l'album", album.title)?.trim();
    if (!title || title === album.title) return;
    try {
      const updated = await adminAlbumService.update(album.id, { title });
      setAlbums((a) => a.map((x) => (x.id === album.id ? updated : x)));
    } catch {
      toast.error("Renommage impossible");
    }
  };

  const remove = async (album: AdminAlbum) => {
    if (!window.confirm(`Supprimer l'album « ${album.title} » ?`)) return;
    try {
      await adminAlbumService.remove(album.id);
      setAlbums((a) => a.filter((x) => x.id !== album.id));
      toast.success("Album supprimé");
    } catch {
      toast.error("Suppression impossible");
    }
  };

  const copyLink = (album: AdminAlbum) => {
    const url = adminAlbumService.shareUrl(album.shareToken);
    navigator.clipboard?.writeText(url);
    toast.success("Lien de partage copié");
  };

  return (
    <div>
      <Topbar
        title="Albums"
        subtitle="Regroupez des photos et partagez-les via un lien."
        right={
          <Btn variant="primary" onClick={() => setCreating(true)}>
            <Plus size={16} /> Nouvel album
          </Btn>
        }
      />

      <div className="p-10">
        {creating && (
          <Card className="mb-6">
            <p className="text-sm font-semibold text-ink mb-2">Créer un album</p>
            <div className="flex items-center gap-2">
              <input
                autoFocus
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && create()}
                placeholder="Ex. Cérémonie, Soirée, Best-of…"
                className="flex-1 text-sm border border-line rounded-lg px-3 py-2"
              />
              <Btn variant="primary" onClick={create} disabled={!newTitle.trim()}>
                Créer
              </Btn>
              <Btn
                variant="ghost"
                onClick={() => {
                  setCreating(false);
                  setNewTitle("");
                }}
              >
                Annuler
              </Btn>
            </div>
          </Card>
        )}

        {loading ? (
          <p className="text-sm text-muted">Chargement des albums…</p>
        ) : albums.length === 0 ? (
          <div className="text-center py-20 text-muted">
            <Images size={32} className="mx-auto mb-3" />
            <p className="text-sm">Aucun album pour l'instant</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-5">
            {albums.map((album) => (
              <AlbumCard
                key={album.id}
                album={album}
                onManage={() => setEditing(album)}
                onCopy={() => copyLink(album)}
                onTogglePublic={() => togglePublic(album)}
                onRename={() => rename(album)}
                onDelete={() => remove(album)}
              />
            ))}
          </div>
        )}
      </div>

      {editing && (
        <AlbumDetail
          album={editing}
          onClose={() => setEditing(null)}
          onChanged={(updated) =>
            setAlbums((a) => a.map((x) => (x.id === updated.id ? updated : x)))
          }
        />
      )}
    </div>
  );
}

function AlbumCard({
  album,
  onManage,
  onCopy,
  onTogglePublic,
  onRename,
  onDelete,
}: {
  album: AdminAlbum;
  onManage: () => void;
  onCopy: () => void;
  onTogglePublic: () => void;
  onRename: () => void;
  onDelete: () => void;
}) {
  return (
    <Card pad={false} className="overflow-hidden">
      <button
        onClick={onManage}
        className="block w-full aspect-[4/3] bg-[color:var(--bg)] overflow-hidden"
      >
        {album.coverPath ? (
          <img
            src={getPhotoUrl(album.coverPath)}
            className="w-full h-full object-cover"
            alt=""
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted">
            <Images size={28} />
          </div>
        )}
      </button>

      <div className="pad-card">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-semibold text-ink truncate flex items-center gap-1.5">
              {album.title}
              <button onClick={onRename} className="text-muted hover:text-ink shrink-0">
                <Pencil size={13} />
              </button>
            </p>
            <p className="text-xs text-muted mt-0.5">
              {album.photoCount} photo{album.photoCount > 1 ? "s" : ""}
            </p>
          </div>
          <Pill tone={album.isPublic ? "green" : "outline"}>
            {album.isPublic ? (
              <>
                <Eye size={10} /> Partagé
              </>
            ) : (
              <>
                <EyeOff size={10} /> Privé
              </>
            )}
          </Pill>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <Btn variant="outline" size="sm" onClick={onManage} className="justify-center">
            <Images size={14} /> Photos
          </Btn>
          <Btn
            variant="outline"
            size="sm"
            onClick={onCopy}
            disabled={!album.isPublic}
            className="justify-center"
          >
            <Link2 size={14} /> Copier le lien
          </Btn>
          <Btn variant="ghost" size="sm" onClick={onTogglePublic} className="justify-center">
            {album.isPublic ? <EyeOff size={14} /> : <Eye size={14} />}
            {album.isPublic ? "Désactiver" : "Activer"}
          </Btn>
          <Btn variant="danger" size="sm" onClick={onDelete} className="justify-center">
            <Trash2 size={14} /> Supprimer
          </Btn>
        </div>
      </div>
    </Card>
  );
}

// Vue détail : uniquement les photos qui composent l'album. Les ajouts se font
// depuis la galerie (bouton « Ajouter à un album ») ; ici on peut juste retirer.
function AlbumDetail({
  album,
  onClose,
  onChanged,
}: {
  album: AdminAlbum;
  onClose: () => void;
  onChanged: (album: AdminAlbum) => void;
}) {
  const [photos, setPhotos] = useState<AlbumPhotoLite[]>(album.photos ?? []);
  const [loading, setLoading] = useState(album.photos === undefined);

  useEffect(() => {
    if (album.photos !== undefined) {
      setPhotos(album.photos);
      return;
    }
    (async () => {
      try {
        const full = await adminAlbumService.get(album.id);
        setPhotos(full.photos ?? []);
      } catch {
        toast.error("Impossible de charger l'album");
      } finally {
        setLoading(false);
      }
    })();
  }, [album.id, album.photos]);

  const removePhoto = async (photoId: number) => {
    const remaining = photos.filter((p) => p.id !== photoId);
    try {
      const updated = await adminAlbumService.setPhotos(
        album.id,
        remaining.map((p) => p.id)
      );
      setPhotos(updated.photos ?? remaining);
      onChanged(updated);
      toast.success("Photo retirée de l'album");
    } catch {
      toast.error("Action impossible");
    }
  };

  const copyLink = () => {
    navigator.clipboard?.writeText(adminAlbumService.shareUrl(album.shareToken));
    toast.success("Lien de partage copié");
  };

  return (
    <div className="fixed inset-0 bg-ink/60 backdrop-blur-sm z-50 flex flex-col">
      <div className="bg-white border-b border-line px-8 py-4 flex items-center gap-4">
        <div className="min-w-0">
          <p className="font-semibold text-ink truncate">{album.title}</p>
          <p className="text-xs text-muted">
            {photos.length} photo{photos.length > 1 ? "s" : ""}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Btn variant="outline" onClick={copyLink} disabled={!album.isPublic}>
            <Link2 size={16} /> Copier le lien
          </Btn>
          <Btn variant="ghost" onClick={onClose}>
            <X size={16} /> Fermer
          </Btn>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-[color:var(--bg)] p-8">
        {loading ? (
          <p className="text-sm text-muted">Chargement de l'album…</p>
        ) : photos.length === 0 ? (
          <div className="text-center py-20 text-muted max-w-md mx-auto">
            <Images size={32} className="mx-auto mb-3" />
            <p className="text-sm">Cet album est vide.</p>
            <p className="text-xs mt-1.5">
              Pour ajouter des photos, ouvre la galerie, sélectionne-les puis
              utilise « Ajouter à un album ».
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-6 gap-3">
            {photos.map((p) => (
              <div
                key={p.id}
                className="group relative aspect-square rounded-lg overflow-hidden border border-line bg-[color:var(--bg)]"
              >
                <img
                  src={getPhotoUrl(p.filePath)}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  alt=""
                />
                <button
                  onClick={() => removePhoto(p.id)}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 text-red-600 shadow-sm opacity-0 group-hover:opacity-100 transition hover:bg-white"
                  aria-label="Retirer de l'album"
                  title="Retirer de l'album"
                >
                  <Trash2 size={14} />
                </button>
                {p.guest && (
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-2 pt-6 opacity-0 group-hover:opacity-100 transition">
                    <p className="text-[11px] text-white truncate">{p.guest.nickname}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
