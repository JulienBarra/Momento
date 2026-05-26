import { Heart } from "lucide-react";
import { Topbar, Placeholder } from "../ui";
import { EVENT } from "../config";

export default function CoupleView() {
  return (
    <div>
      <Topbar title="Galerie des mariés" subtitle={`${EVENT.couple} · ${EVENT.dateLong}`} />
      <Placeholder title="Espace Mariés" phase="Phase 5" icon={<Heart size={28} />} />
    </div>
  );
}
