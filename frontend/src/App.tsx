import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { CameraProvider } from "./contexts/CameraContext";
import ProtectedRoute from "./components/ProtectedRoute";
import WelcomeCard from "./components/WelcomeCard";
import MobileLayout from "./components/MobileLayout";
import Gallery from "./pages/Gallery";
import CameraPage from "./pages/CameraPage";
import Missions from "./pages/Missions";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
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
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
