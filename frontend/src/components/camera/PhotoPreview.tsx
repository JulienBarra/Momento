import { ZoomIn } from "lucide-react";
import type { Mission } from "../../services/api";
import MissionBadge from "./MissionBadge";

interface PhotoPreviewProps {
  photo: string;
  zoomLevel: number;
  imgRef: React.RefObject<HTMLImageElement | null>;
  selectedMission: { id: number; title: string } | null;
  missions: Mission[];
  onMissionClick: () => void;
}

export default function PhotoPreview({
  photo,
  zoomLevel,
  imgRef,
  selectedMission,
  missions,
  onMissionClick,
}: PhotoPreviewProps) {
  return (
    <div className="w-full h-full overflow-hidden relative animate-fade-in">
      <img
        ref={imgRef}
        src={photo}
        alt="Aperçu"
        className="w-full h-full object-cover transition-transform"
        style={{ transform: `scale(${zoomLevel})` }}
      />

      {/* Badge mission en haut */}
      <MissionBadge
        selectedMission={selectedMission}
        missions={missions}
        onClick={onMissionClick}
        className="absolute top-6 left-6 right-6"
        truncateTitle
      />

      {/* Indicateur de zoom */}
      {zoomLevel > 1 && (
        <div className="absolute top-24 right-6 bg-black/50 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1">
          <ZoomIn size={16} />
          {Math.round(zoomLevel * 100)}%
        </div>
      )}
    </div>
  );
}
