import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { CameraProvider } from "./contexts/CameraContext";
import ProtectedRoute from "./components/ProtectedRoute";
import WelcomeCard from "./components/WelcomeCard";
import MobileLayout from "./components/MobileLayout";
import Gallery from "./pages/Gallery";
import CameraPage from "./pages/CameraPage";
import Missions from "./pages/Missions";
import AdminProtectedRoute from "./admin/AdminProtectedRoute";
import AdminLayout from "./admin/AdminLayout";
import AdminLogin from "./admin/pages/AdminLogin";
import DashboardView from "./admin/pages/DashboardView";
import TablesView from "./admin/pages/TablesView";
import GuestsView from "./admin/pages/GuestsView";
import PhotosAdminView from "./admin/pages/PhotosView";
import MissionsAdminView from "./admin/pages/MissionsView";
import QRCodesView from "./admin/pages/QRCodesView";
import CoupleView from "./admin/pages/CoupleView";
import AlbumsView from "./admin/pages/AlbumsView";
import AlbumShareView from "./pages/AlbumShareView";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Vue publique d'un album partagé (accessible via le lien généré) */}
          <Route path="/album/:token" element={<AlbumShareView />} />

          {/* Route publique pour scanner le QR Code */}
          <Route
            path="/join"
            element={
              <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <WelcomeCard />
              </div>
            }
          />

          {/* Routes protégées - nécessitent une authentification */}
          <Route element={<ProtectedRoute />}>
            <Route
              element={
                <CameraProvider>
                  <MobileLayout />
                </CameraProvider>
              }
            >
              <Route path="/" element={<Gallery />} />
              <Route path="/camera" element={<CameraPage />} />
              <Route path="/missions" element={<Missions />} />
            </Route>
          </Route>

          {/* Backoffice admin (desktop) */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route element={<AdminProtectedRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardView />} />
              <Route path="tables" element={<TablesView />} />
              <Route path="guests" element={<GuestsView />} />
              <Route path="photos" element={<PhotosAdminView />} />
              <Route path="missions" element={<MissionsAdminView />} />
              <Route path="qr" element={<QRCodesView />} />
              <Route path="albums" element={<AlbumsView />} />
              <Route path="couple" element={<CoupleView />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
