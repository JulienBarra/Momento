import { RefreshCw } from "lucide-react";
import type { Mission } from "../../services/api";
import MissionBadge from "./MissionBadge";

interface CameraControlsProps {
  selectedMission: { id: number; title: string } | null;
  missions: Mission[];
  onMissionClick: () => void;
  onToggleCamera: () => void;
  onTakePhoto: () => void;
}

export default function CameraControls({
  selectedMission,
  missions,
  onMissionClick,
  onToggleCamera,
  onTakePhoto,
}: CameraControlsProps) {
  return (
    <>
      {/* Badge mission + bouton retourner caméra */}
      <div className="absolute top-6 left-6 right-6 flex items-start gap-3">
        <MissionBadge
          selectedMission={selectedMission}
          missions={missions}
          onClick={onMissionClick}
          className="flex-1"
          truncateTitle
        />

        <button
          onClick={onToggleCamera}
          className="w-12 h-12 bg-white/20 backdrop-blur-md text-white rounded-full flex items-center justify-center active:scale-95 transition-transform shadow-lg flex-shrink-0"
        >
          <RefreshCw size={24} />
        </button>
      </div>

      {/* Bouton déclencheur */}
      <div className="absolute bottom-20 left-0 w-full flex justify-center pb-safe">
        <button
          onClick={onTakePhoto}
          className="w-16 h-16 bg-white rounded-full border-4 border-gray-300 flex items-center justify-center active:scale-95 transition-transform shadow-2xl"
        >
          <div className="w-12 h-12 bg-white rounded-full border-2 border-gray-100 shadow-inner" />
        </button>
      </div>
    </>
  );
}
