import { BrowserRouter, Routes, Route } from "react-router-dom";
import WelcomeCard from "./components/WelcomeCard";
import MobileLayout from "./components/MobileLayout";
import Gallery from "./pages/Gallery";
import CameraPage from "./pages/CameraPage";
import Missions from "./pages/Missions";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* La route pour scanner le QR Code (hors de la navigation) */}
        <Route
          path="/join"
          element={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
              <WelcomeCard />
            </div>
          }
        />

        {/* Le groupe de routes de l'application (avec la barre de navigation en bas) */}
        <Route element={<MobileLayout />}>
          <Route path="/" element={<Gallery />} />
          <Route path="/camera" element={<CameraPage />} />
          <Route path="/missions" element={<Missions />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
