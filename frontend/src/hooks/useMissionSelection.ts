import { useState, useCallback } from "react";
import type { Mission } from "../services/api";
import { mockMissions } from "../data/mockData";

function getInitialMission(): { id: number; title: string } | null {
  const stored = localStorage.getItem("selected_mission");
  if (stored) {
    const mission = JSON.parse(stored);
    return { id: mission.id, title: mission.title };
  }
  return null;
}

export function useMissionSelection() {
  // TODO: remplacer par un fetch API quand le backend sera prêt
  const [missions] = useState<Mission[]>(mockMissions);
  const [selectedMission, setSelectedMission] = useState<{
    id: number;
    title: string;
  } | null>(getInitialMission);
  const [showMissionModal, setShowMissionModal] = useState(false);

  const handleMissionSelect = useCallback((mission: Mission | null) => {
    if (mission) {
      setSelectedMission({ id: mission.id, title: mission.title });
      localStorage.setItem("selected_mission", JSON.stringify(mission));
    } else {
      setSelectedMission(null);
      localStorage.removeItem("selected_mission");
    }
    setShowMissionModal(false);
  }, []);

  const clearMission = useCallback(() => {
    setSelectedMission(null);
    localStorage.removeItem("selected_mission");
  }, []);

  return {
    missions,
    selectedMission,
    showMissionModal,
    setShowMissionModal,
    handleMissionSelect,
    clearMission,
  };
}
