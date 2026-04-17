import { X, Globe, Check, Heart } from "lucide-react";
import type { Mission } from "../services/api";

interface MissionSelectCardProps {
  missions: Mission[];
  selectedMission: { id: number; title: string } | null;
  guestTableId: number | undefined;
  onSelect: (mission: Mission | null) => void;
  onClose: () => void;
}

export default function MissionSelectCard({
  missions,
  selectedMission,
  guestTableId,
  onSelect,
  onClose,
}: MissionSelectCardProps) {
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      {/* Card principale */}
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl animate-fade-in">
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-black">Choisir une mission</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors active:scale-95"
            aria-label="Fermer"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        {/* Contenu scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {/* Option : Photo spontanée */}
          <button
            onClick={() => onSelect(null)}
            className={`w-full text-left bg-white rounded-lg p-4 shadow-md border-2 transition-all active:scale-98 ${
              !selectedMission
                ? "border-red-500 bg-red-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                <Heart size={16} className="text-white" fill="white" />
              </div>
              <p className="text-black font-semibold">Photo spontanée</p>
            </div>
            <p className="text-sm text-gray-500 ml-11">
              Capturez un moment sans mission spécifique
            </p>
          </button>

          {/* Missions globales */}
          {missions.filter((m) => m.isGlobal).length > 0 && (
            <>
              <div className="pt-4 pb-2">
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  Missions globales
                </p>
              </div>
              {missions
                .filter((m) => m.isGlobal)
                .map((mission) => (
                  <button
                    key={mission.id}
                    onClick={() => onSelect(mission)}
                    className={`w-full text-left bg-white rounded-lg p-4 shadow-md border-2 transition-all active:scale-98 ${
                      selectedMission?.id === mission.id
                        ? "border-momento bg-momento/10"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-momento flex items-center justify-center flex-shrink-0">
                        <Globe size={16} className="text-white" />
                      </div>
                      <p className="text-black font-semibold">{mission.title}</p>
                    </div>
                  </button>
                ))}
            </>
          )}

          {/* Missions de table */}
          {missions.filter((m) => !m.isGlobal && m.tableId === guestTableId)
            .length > 0 && (
            <>
              <div className="pt-4 pb-2">
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  Missions de votre table
                </p>
              </div>
              {missions
                .filter((m) => !m.isGlobal && m.tableId === guestTableId)
                .map((mission) => (
                  <button
                    key={mission.id}
                    onClick={() => onSelect(mission)}
                    className={`w-full text-left bg-white rounded-lg p-4 shadow-md border-2 transition-all active:scale-98 ${
                      selectedMission?.id === mission.id
                        ? "border-purple-600 bg-purple-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
                        <Check size={16} className="text-white" />
                      </div>
                      <p className="text-black font-semibold">{mission.title}</p>
                    </div>
                  </button>
                ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
