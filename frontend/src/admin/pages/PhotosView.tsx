import { Image as ImageIcon } from "lucide-react";
import { Topbar, Placeholder } from "../ui";

export default function PhotosView() {
  return (
    <div>
      <Topbar title="Photos" subtitle="Modération, favoris et export des photos" />
      <Placeholder title="Gestion des photos" phase="Phase 4" icon={<ImageIcon size={28} />} />
    </div>
  );
}
