import { Target } from "lucide-react";
import { Topbar, Placeholder } from "../ui";

export default function MissionsView() {
  return (
    <div>
      <Topbar title="Missions" subtitle="Défis photo proposés aux invités" />
      <Placeholder title="Gestion des missions" phase="Phase 2" icon={<Target size={28} />} />
    </div>
  );
}
