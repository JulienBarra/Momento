import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  // Pendant le chargement initial (vérification du token dans localStorage)
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-momento border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Vérification...</p>
        </div>
      </div>
    );
  }

  // Si pas authentifié, rediriger vers /join
  if (!isAuthenticated) {
    return <Navigate to="/join" replace />;
  }

  // Si authentifié, afficher les routes enfants
  return <Outlet />;
}
