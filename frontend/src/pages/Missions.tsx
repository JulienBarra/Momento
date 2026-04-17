import { useNavigate } from "react-router-dom";
import { Camera, Globe, Users, Heart, ChevronRight } from "lucide-react";
import { mockMissions, mockTables } from "../data/mockData";
import { useAuth } from "../contexts/AuthContext";

export default function Missions() {
  const navigate = useNavigate();
  const { guest } = useAuth();
  const missions = mockMissions;

  const handleMissionClick = (mission: Mission) => {
    localStorage.setItem("selected_mission", JSON.stringify(mission));
    navigate("/camera");
  };

  const handleSpontaneous = () => {
    localStorage.removeItem("selected_mission");
    navigate("/camera");
  };

  // Aucune mission
  if (missions.length === 0) {
    return (
      <div className="p-4 pb-20 animate-fade-in">
        <h1 className="text-3xl font-bold text-black mb-6">Missions</h1>
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Camera size={28} className="text-gray-400" />
          </div>
          <p className="text-gray-500 text-lg mb-2">Aucune mission disponible</p>
          <p className="text-gray-400 text-sm mb-6">
            Les défis photo apparaîtront ici bientôt !
          </p>
          <button
            onClick={handleSpontaneous}
            className="bg-momento text-white px-6 py-3 rounded-full font-semibold active:scale-95 transition-transform"
          >
            Prendre une photo spontanée
          </button>
        </div>
      </div>
    );
  }

  const globalMissions = missions.filter((m) => m.isGlobal);
  const tableMissions = missions.filter(
    (m) => !m.isGlobal && m.tableId === guest?.tableId
  );

  return (
    <div className="p-4 pb-20 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-black">Missions</h1>
        <p className="text-gray-500 text-sm mt-1">
          {globalMissions.length + tableMissions.length} défi
          {globalMissions.length + tableMissions.length > 1 ? "s" : ""}{" "}
          disponible
          {globalMissions.length + tableMissions.length > 1 ? "s" : ""}
        </p>
      </div>

      {/* Photo spontanée */}
      <button
        onClick={handleSpontaneous}
        className="w-full text-left bg-white rounded-xl p-4 shadow-md border-2 border-gray-200 hover:border-red-400 active:scale-98 transition-all mb-6"
        style={{ animationDelay: "0ms" }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
            <Heart size={18} className="text-white" fill="white" />
          </div>
          <div className="flex-1">
            <p className="text-black font-semibold">Photo spontanée</p>
            <p className="text-sm text-gray-500">
              Capturez un moment sans mission
            </p>
          </div>
          <ChevronRight size={20} className="text-gray-400 flex-shrink-0" />
        </div>
      </button>

      {/* Missions globales */}
      {globalMissions.length > 0 && (
        <div className="mb-6">
          <div className="pb-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Missions pour tous
            </p>
          </div>
          <div className="space-y-3">
            {globalMissions.map((mission, index) => (
              <button
                key={mission.id}
                onClick={() => handleMissionClick(mission)}
                className="w-full text-left bg-white rounded-xl p-4 shadow-md border-2 border-gray-200 hover:border-momento active:scale-98 transition-all animate-fade-in"
                style={{ animationDelay: `${(index + 1) * 60}ms` }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-momento flex items-center justify-center flex-shrink-0">
                    <Globe size={18} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-black font-semibold">{mission.title}</p>
                    <span className="inline-flex items-center gap-1 text-xs text-momento mt-1">
                      <Globe size={10} />
                      Tout le monde
                    </span>
                  </div>
                  <ChevronRight
                    size={20}
                    className="text-gray-400 flex-shrink-0"
                  />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Missions de table */}
      {tableMissions.length > 0 && (
        <div>
          <div className="pb-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              {mockTables.find((t) => t.id === guest?.tableId)?.name ??
                "Votre table"}
            </p>
          </div>
          <div className="space-y-3">
            {tableMissions.map((mission, index) => (
              <button
                key={mission.id}
                onClick={() => handleMissionClick(mission)}
                className="w-full text-left bg-white rounded-xl p-4 shadow-md border-2 border-gray-200 hover:border-purple-500 active:scale-98 transition-all animate-fade-in"
                style={{
                  animationDelay: `${(globalMissions.length + index + 1) * 60}ms`,
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
                    <Users size={18} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-black font-semibold">{mission.title}</p>
                    <span className="inline-flex items-center gap-1 text-xs text-purple-600 mt-1">
                      <Users size={10} />
                      {mockTables.find((t) => t.id === mission.tableId)?.name ??
                        `Table ${mission.tableId}`}
                    </span>
                  </div>
                  <ChevronRight
                    size={20}
                    className="text-gray-400 flex-shrink-0"
                  />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
