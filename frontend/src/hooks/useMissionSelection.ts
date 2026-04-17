import { useState, useCallback, useEffect } from "react";
import type { Mission } from "../services/api";
import { missionService } from "../services/api";

function getInitialMission(): { id: number; title: string } | null {
  const stored = localStorage.getItem("selected_mission");
  if (stored) {
    const mission = JSON.parse(stored);
    return { id: mission.id, title: mission.title };
  }
  return null;
}

export function useMissionSelection() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [isLoadingMissions, setIsLoadingMissions] = useState(true);
  const [missionsError, setMissionsError] = useState<string | null>(null);
  const [selectedMission, setSelectedMission] = useState<{
    id: number;
    title: string;
  } | null>(getInitialMission);
  const [showMissionModal, setShowMissionModal] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchMissions() {
      try {
        setIsLoadingMissions(true);
        setMissionsError(null);
        const data = await missionService.getAll();
        if (!cancelled) {
          setMissions(data);
        }
      } catch {
        if (!cancelled) {
          setMissionsError("Impossible de charger les missions");
        }
      } finally {
        if (!cancelled) {
          setIsLoadingMissions(false);
        }
      }
    }

    fetchMissions();
    return () => { cancelled = true; };
  }, []);

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
    isLoadingMissions,
    missionsError,
    selectedMission,
    showMissionModal,
    setShowMissionModal,
    handleMissionSelect,
    clearMission,
  };
}
