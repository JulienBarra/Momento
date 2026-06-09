import { X, Star, Download, Trash2, Globe, Users, Heart } from "lucide-react";
import type { AdminPhoto } from "../adminApi";
import { Btn, Pill, formatTime } from "../ui";
import { getPhotoUrl, downloadPhoto } from "../../services/api";

export default function PhotoDetail({
  photo,
  color,
  onClose,
  onToggleStar,
  onDelete,
}: {
  photo: AdminPhoto;
  color: string;
  onClose: () => void;
  onToggleStar?: () => void;
  onDelete?: () => void;
}) {
  const m = photo.mission;
  const url = getPhotoUrl(photo.filePath);
  return (
    <div
      className="fixed inset-0 bg-ink/70 backdrop-blur-sm z-50 flex items-center justify-center p-8"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] grid grid-cols-[1fr_360px] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-ink flex items-center justify-center">
          <img src={url} alt="" className="max-h-[90vh] max-w-full object-contain" />
        </div>
        <div className="flex flex-col">
          <div className="p-5 border-b border-line flex items-start justify-between">
            <div>
              <p className="font-semibold text-ink">{photo.guest?.nickname ?? "—"}</p>
              <p className="text-xs text-muted font-mono">
                Photo #{photo.id} · {formatTime(photo.createdAt)}
              </p>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-[color:var(--bg)] rounded-md">
              <X size={18} />
            </button>
          </div>
          <div className="p-5 space-y-4 flex-1 overflow-y-auto">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted font-medium mb-1.5">Table</p>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ background: color }} />
                <span className="text-sm font-medium">{photo.table?.name ?? "—"}</span>
              </div>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted font-medium mb-1.5">Mission</p>
              {m ? (
                <div
                  className={`rounded-lg border-2 p-3 ${
                    m.isGlobal ? "border-[color:var(--momento)] bg-momento-50" : "border-purple-300 bg-purple-50"
                  }`}
                >
                  <p className="text-sm font-semibold text-ink">{m.title}</p>
                  <Pill tone={m.isGlobal ? "green" : "purple"} className="mt-2">
                    {m.isGlobal ? (
                      <>
                        <Globe size={10} /> Globale
                      </>
                    ) : (
                      <>
                        <Users size={10} /> Par table
                      </>
                    )}
                  </Pill>
                </div>
              ) : (
                <Pill tone="red">
                  <Heart size={10} /> Photo spontanée
                </Pill>
              )}
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted font-medium mb-1.5">Date</p>
              <p className="text-sm text-ink">
                {new Date(photo.createdAt).toLocaleString("fr-FR", {
                  dateStyle: "full",
                  timeStyle: "short",
                })}
              </p>
            </div>
          </div>
          <div className="p-4 border-t border-line grid grid-cols-2 gap-2">
            {onToggleStar && (
              <Btn variant="outline" onClick={onToggleStar}>
                <Star size={14} fill={photo.starred ? "currentColor" : "none"} />
                {photo.starred ? "Retirer le favori" : "Favori"}
              </Btn>
            )}
            <Btn variant="outline" onClick={() => downloadPhoto(photo.filePath)}>
              <Download size={14} /> Télécharger
            </Btn>
            {onDelete && (
              <Btn variant="danger" className="col-span-2 justify-center" onClick={onDelete}>
                <Trash2 size={14} /> Supprimer
              </Btn>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
