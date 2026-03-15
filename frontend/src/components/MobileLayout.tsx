import { Outlet, NavLink } from "react-router-dom";
import { ImageIcon, Camera, ListTodo } from "lucide-react";

export default function MobileLayout() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Zone de contenu principal */}
      <main className="flex flex-col flex-1 overflow-y-auto">
        <Outlet />
      </main>

      {/* Barre de navigation fixée en bas */}
      <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 flex justify-around items-center h-16 pb-safe">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center w-full h-full transition-colors ${isActive ? "text-momento" : "text-gray-400 hover:text-gray-600"}`
          }
        >
          <ImageIcon size={24} />
          <span className="text-xs mt-1 font-medium">Galerie</span>
        </NavLink>

        {/* 📸 LA CORRECTION EST ICI : on utilise la fonction fléchée pour l'enfant */}
        <NavLink
          to="/camera"
          className="flex flex-col items-center justify-center w-full h-full"
        >
          {({ isActive }) => (
            <div
              className={`p-3 rounded-full mb-4 shadow-lg transition-colors ${isActive ? "bg-momento text-white" : "bg-black text-white"}`}
            >
              <Camera size={28} />
            </div>
          )}
        </NavLink>

        <NavLink
          to="/missions"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center w-full h-full transition-colors ${isActive ? "text-momento" : "text-gray-400 hover:text-gray-600"}`
          }
        >
          <ListTodo size={24} />
          <span className="text-xs mt-1 font-medium">Missions</span>
        </NavLink>
      </nav>
    </div>
  );
}
