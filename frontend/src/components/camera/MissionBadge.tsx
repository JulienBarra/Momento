import { Globe, Check, Heart } from "lucide-react";
import type { Mission } from "../../services/api";
import { getMissionType, getMissionColor } from "../../utils/missionHelpers";

interface MissionBadgeProps {
  selectedMission: { id: number; title: string } | null;
  missions: Mission[];
  onClick: () => void;
  className?: string;
  truncateTitle?: boolean;
}

const ICONS = {
  spontaneous: Heart,
  global: Globe,
  table: Check,
} as const;

export default function MissionBadge({
  selectedMission,
  missions,
  onClick,
  className = "",
  truncateTitle = false,
}: MissionBadgeProps) {
  const type = getMissionType(selectedMission, missions);
  const Icon = ICONS[type];

  return (
    <button
      onClick={onClick}
      className={`backdrop-blur-md rounded-xl px-4 py-3 shadow-lg active:scale-95 transition-transform min-w-0 ${getMissionColor(type)} ${className}`}
    >
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
          <Icon size={16} className="text-white" />
        </div>
        <div className="text-left flex-1 min-w-0">
          <p className={`text-white text-sm font-bold ${truncateTitle ? "truncate" : ""}`}>
            {selectedMission ? selectedMission.title : "Photo spontanée"}
          </p>
          <p className="text-white/80 text-xs">Appuyer pour changer</p>
        </div>
      </div>
    </button>
  );
}
