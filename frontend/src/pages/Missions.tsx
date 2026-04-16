import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { Mission } from "../services/api";
import { Camera, Globe, Users } from "lucide-react";
import { mockMissions } from "../data/mockData";

export default function Missions() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Charger les missions fictives au montage
  useEffect(() => {
    // Simuler un délai de chargement
    setTimeout(() => {
      setMissions(mockMissions);
      setIsLoading(false);
    }, 500);
  }, []);

  const handleMissionClick = (mission: Mission) => {
    // Stocker la mission sélectionnée dans localStorage pour la CameraPage
    localStorage.setItem("selected_mission", JSON.stringify(mission));
    // Rediriger vers la caméra
    navigate("/camera");
  };

  // État de chargement
  if (isLoading) {
    return (
      <div className="p-4 flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-momento border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Chargement des missions...</p>
        </div>
      </div>
    );
  }

  // Aucune mission
  if (missions.length === 0) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold text-black mb-4">Missions 🎯</h1>
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-2">Aucune mission disponible</p>
          <p className="text-gray-400 text-sm">
            Les défis photo apparaîtront ici ! 📸
          </p>
        </div>
      </div>
    );
  }

  // Séparer missions globales et missions de table
  const globalMissions = missions.filter((m) => m.isGlobal);
  const tableMissions = missions.filter((m) => !m.isGlobal);

  return (
    <div className="p-4 pb-20">
      <h1 className="text-2xl font-bold text-black mb-2">Missions 🎯</h1>
      <p className="text-gray-500 mb-6 text-sm">
        Relevez les défis et capturez des moments uniques !
      </p>

      {/* Missions globales */}
      {globalMissions.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-black mb-3 flex items-center gap-2">
            <Globe size={20} className="text-momento" />
            Missions pour tous
          </h2>
          <div className="space-y-3">
            {globalMissions.map((mission) => (
              <button
                key={mission.id}
                onClick={() => handleMissionClick(mission)}
                className="w-full text-left bg-white rounded-lg p-4 shadow-md border-2 border-transparent hover:border-momento active:scale-98 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-black font-medium mb-1">{mission.title}</p>
                    <span className="inline-flex items-center gap-1 text-xs text-momento bg-momento/10 px-2 py-1 rounded-full">
                      <Globe size={12} />
                      Globale
                    </span>
                  </div>
                  <Camera size={20} className="text-gray-400 flex-shrink-0" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Missions de table */}
      {tableMissions.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-black mb-3 flex items-center gap-2">
            <Users size={20} className="text-momento" />
            Missions de votre table
          </h2>
          <div className="space-y-3">
            {tableMissions.map((mission) => (
              <button
                key={mission.id}
                onClick={() => handleMissionClick(mission)}
                className="w-full text-left bg-white rounded-lg p-4 shadow-md border-2 border-transparent hover:border-momento active:scale-98 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-black font-medium mb-1">{mission.title}</p>
                    <span className="inline-flex items-center gap-1 text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                      <Users size={12} />
                      Table {mission.tableId}
                    </span>
                  </div>
                  <Camera size={20} className="text-gray-400 flex-shrink-0" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
