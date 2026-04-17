import type { Photo, Mission } from "../services/api";
import { CheckCircle2, Heart, Globe } from "lucide-react";

interface PhotoGridProps {
  photos: Photo[];
  onPhotoClick: (photo: Photo) => void;
  getMissionTitle: (missionId: number | null) => string | null;
  isMissionGlobal: (missionId: number | null) => boolean | null;
}

export default function PhotoGrid({ photos, onPhotoClick, getMissionTitle, isMissionGlobal }: PhotoGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {photos.map((photo) => {
        const missionTitle = getMissionTitle(photo.mission_id);
        const isGlobal = isMissionGlobal(photo.mission_id);

        return (
          <button
            key={photo.id}
            onClick={() => onPhotoClick(photo)}
            className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 shadow-md active:scale-95 transition-transform"
          >
            {/* Image */}
            <img
              src={photo.file_path}
              alt={`Photo par ${photo.guest?.nickname || "Anonyme"}`}
              className="w-full h-full object-cover"
              loading="lazy"
            />

            {/* Badge en haut à droite */}
            {missionTitle ? (
              // Mission globale → Badge globe vert
              isGlobal ? (
                <div className="absolute top-2 right-2 bg-momento/90 backdrop-blur-sm text-white p-1.5 rounded-full shadow-lg">
                  <Globe size={16} />
                </div>
              ) : (
                // Mission de table → Badge coche violette
                <div className="absolute top-2 right-2 bg-purple-600/90 backdrop-blur-sm text-white p-1.5 rounded-full shadow-lg">
                  <CheckCircle2 size={16} />
                </div>
              )
            ) : (
              // Photo spontanée → Badge cœur rouge
              <div className="absolute top-2 right-2 bg-red-500/90 backdrop-blur-sm text-white p-1.5 rounded-full shadow-lg">
                <Heart size={16} fill="white" />
              </div>
            )}

            {/* Overlay avec info auteur */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
              <p className="text-white text-sm font-medium">
                {photo.guest?.nickname || "Anonyme"}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
