import { LayoutDashboard } from "lucide-react";
import { Topbar, Placeholder } from "../ui";
import { EVENT } from "../config";

export default function DashboardView() {
  return (
    <div>
      <Topbar
        title="Tableau de bord"
        subtitle={`${EVENT.couple} · ${EVENT.dateLong} · ${EVENT.venue}`}
      />
      <Placeholder
        title="Statistiques en direct"
        phase="Phase 3"
        icon={<LayoutDashboard size={28} />}
      />
    </div>
  );
}
