import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Camera,
  LayoutDashboard,
  LayoutGrid,
  Users,
  Image as ImageIcon,
  Images,
  Target,
  QrCode,
  Heart,
  type LucideIcon,
} from "lucide-react";
import { EVENT } from "./config";

interface Section {
  id: string;
  label: string;
  to: string;
  icon: LucideIcon;
}

const SECTIONS_ADMIN: Section[] = [
  { id: "dashboard", label: "Tableau de bord", to: "/admin/dashboard", icon: LayoutDashboard },
  { id: "tables", label: "Tables", to: "/admin/tables", icon: LayoutGrid },
  { id: "guests", label: "Invités", to: "/admin/guests", icon: Users },
  { id: "photos", label: "Photos", to: "/admin/photos", icon: ImageIcon },
  { id: "missions", label: "Missions", to: "/admin/missions", icon: Target },
  { id: "qr", label: "QR codes", to: "/admin/qr", icon: QrCode },
];
const SECTIONS_COUPLE: Section[] = [
  { id: "couple", label: "Galerie", to: "/admin/couple", icon: Heart },
  { id: "albums", label: "Albums", to: "/admin/albums", icon: Images },
];

// Préfixes appartenant à l'espace « Mariés »
const COUPLE_PREFIXES = ["/admin/couple", "/admin/albums"];

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const space: "admin" | "couple" = COUPLE_PREFIXES.some((p) =>
    location.pathname.startsWith(p)
  )
    ? "couple"
    : "admin";
  const sections = space === "admin" ? SECTIONS_ADMIN : SECTIONS_COUPLE;

  return (
    <aside className="w-[248px] shrink-0 bg-white border-r border-line flex flex-col h-screen sticky top-0">
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-momento flex items-center justify-center">
            <Camera size={16} className="text-white" />
          </div>
          <div className="leading-tight">
            <div className="font-semibold text-ink tracking-tight">Momento</div>
            <div className="text-[11px] text-muted uppercase tracking-widest">Backoffice</div>
          </div>
        </div>
      </div>

      {/* Space switcher */}
      <div className="px-4 pb-4">
        <div className="bg-[color:var(--bg)] border border-line rounded-lg p-1 flex">
          <button
            onClick={() => navigate("/admin/dashboard")}
            className={`flex-1 text-xs font-medium py-1.5 rounded-md transition ${
              space === "admin" ? "bg-white shadow-sm text-ink" : "text-muted hover:text-ink"
            }`}
          >
            Admin
          </button>
          <button
            onClick={() => navigate("/admin/couple")}
            className={`flex-1 text-xs font-medium py-1.5 rounded-md transition ${
              space === "couple" ? "bg-white shadow-sm text-ink" : "text-muted hover:text-ink"
            }`}
          >
            Mariés
          </button>
        </div>
      </div>

      <nav className="px-3 flex-1">
        {sections.map((s) => {
          const Icon = s.icon;
          return (
            <NavLink
              key={s.id}
              to={s.to}
              className={({ isActive }) =>
                `w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm mb-1 transition ${
                  isActive
                    ? "bg-momento-50 text-ink font-semibold"
                    : "text-muted hover:text-ink hover:bg-[color:var(--bg)]"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} className={isActive ? "text-momento" : ""} />
                  <span>{s.label}</span>
                  {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-momento" />}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Wedding card */}
      <div className="p-4 border-t border-line">
        <div className="rounded-lg bg-[color:var(--bg)] border border-line pad-card">
          <p className="font-title text-3xl text-ink leading-none mb-1">{EVENT.couple}</p>
          <p className="text-xs text-muted">{EVENT.dateShort}</p>
          <div className="flex items-center gap-2 mt-3">
            <span className="w-2 h-2 rounded-full bg-momento pulse-dot" />
            <span className="text-xs text-ink font-medium">Live · J-jour</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default function AdminLayout() {
  return (
    <div className="admin-root flex min-h-screen">
      <Sidebar />
      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}
