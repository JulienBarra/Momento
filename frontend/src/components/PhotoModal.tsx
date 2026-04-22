import type { Photo } from "../services/api";
import { CheckCircle2, X, Heart } from "lucide-react";

interface PhotoModalProps {
  photo: Photo;
  onClose: () => void;
  getMissionTitle: (missionId: number | null) => string | null;
  isMissionGlobal: (missionId: number | null) => boolean | null;
  getTableName: (tableId: number | null) => string | null;
}

export default function PhotoModal({ photo, onClose, getMissionTitle, isMissionGlobal, getTableName }: PhotoModalProps) {
  const missionTitle = getMissionTitle(photo.missionId);
  const isGlobal = isMissionGlobal(photo.missionId);
  const tableName = getTableName(photo.tableId);

  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Card contenant photo + infos */}
      <div
        className="bg-white rounded-2xl overflow-hidden max-w-lg w-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Bouton fermer */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-10 bg-black/50 backdrop-blur-sm text-white p-2 rounded-full hover:bg-black/70 transition-colors"
        >
          <X size={20} />
        </button>

        {/* Image */}
        <div className="relative aspect-square bg-gray-100">
          <img
            src={photo.filePath}
            alt={`Photo par ${photo.guest?.nickname || "Anonyme"}`}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Infos */}
        <div className="p-6">
          <div className="mb-3">
            <p className="text-black text-xl font-bold">
              {photo.guest?.nickname || "Anonyme"}
            </p>
            {tableName && (
              <p className="text-gray-500 text-sm italic mt-1">
                de la table <span className="font-bold text-black not-italic">{tableName}</span>
              </p>
            )}
          </div>

          {missionTitle ? (
            // Mission globale → Bloc vert
            isGlobal ? (
              <div className="flex items-start gap-3 bg-momento/10 rounded-lg p-4">
                <CheckCircle2 size={20} className="text-momento flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-momento/70 uppercase tracking-wide mb-1">
                    Mission globale accomplie
                  </p>
                  <p className="text-black font-medium">{missionTitle}</p>
                </div>
              </div>
            ) : (
              // Mission de table → Bloc violet
              <div className="flex items-start gap-3 bg-purple-50 rounded-lg p-4">
                <CheckCircle2 size={20} className="text-purple-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-purple-600/70 uppercase tracking-wide mb-1">
                    Mission de table accomplie
                  </p>
                  <p className="text-black font-medium">{missionTitle}</p>
                </div>
              </div>
            )
          ) : (
            // Photo spontanée → Bloc rouge
            <div className="flex items-start gap-3 bg-red-50 rounded-lg p-4">
              <Heart size={20} className="text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" />
              <div className="flex-1">
                <p className="text-xs font-medium text-red-500/70 uppercase tracking-wide mb-1">
                  Photo spontanée
                </p>
                <p className="text-black font-medium">Photo capturée pour le plaisir</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
