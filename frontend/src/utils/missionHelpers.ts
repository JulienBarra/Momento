import type { Mission } from "../services/api";

export type MissionType = "spontaneous" | "global" | "table";

export function getMissionType(
  selectedMission: { id: number } | null,
  missions: Mission[]
): MissionType {
  if (!selectedMission) return "spontaneous";
  const mission = missions.find((m) => m.id === selectedMission.id);
  return mission?.isGlobal ? "global" : "table";
}

export function getMissionColor(type: MissionType): string {
  switch (type) {
    case "spontaneous":
      return "bg-red-500/90";
    case "global":
      return "bg-momento/90";
    case "table":
      return "bg-purple-600/90";
  }
}

export function getMissionIconBg(type: MissionType): string {
  switch (type) {
    case "spontaneous":
      return "bg-red-500";
    case "global":
      return "bg-momento";
    case "table":
      return "bg-purple-600";
  }
}
