import { useState, useEffect, useRef, useMemo } from "react";
import type { Photo } from "../services/api";
import { mockPhotos, mockMissions, mockTables } from "../data/mockData";
import { useAuth } from "../contexts/AuthContext";
import PhotoGrid from "../components/PhotoGrid";
import PhotoModal from "../components/PhotoModal";

type FilterType =
  | "all"
  | "my-table"
  | "global-missions"
  | "table-missions"
  | "spontaneous";

export default function Gallery() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [displayCount, setDisplayCount] = useState(6);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const { guest } = useAuth();

  // Référence pour le détecteur de scroll infini
  const observerTarget = useRef<HTMLDivElement>(null);

  // Charger les photos fictives au montage du composant
  useEffect(() => {
    setTimeout(() => {
      setPhotos(mockPhotos);
      setIsLoading(false);
    }, 500);
  }, []);

  // Détecter le scroll pour afficher/masquer le bouton "Remonter"
  useEffect(() => {
    const handleScroll = () => {
      // Afficher le bouton si on a scrollé plus de 300px
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fonction pour vérifier si une photo correspond au filtre
  const isPhotoMatchingFilter = (photo: Photo, currentFilter: FilterType) => {
    if (currentFilter === "all") return true;
    if (currentFilter === "my-table") return photo.table_id === guest?.tableId;
    if (currentFilter === "global-missions") {
      if (!photo.mission_id) return false;
      const mission = mockMissions.find((m) => m.id === photo.mission_id);
      return mission?.isGlobal === true;
    }
    if (currentFilter === "table-missions") {
      if (!photo.mission_id) return false;
      const mission = mockMissions.find((m) => m.id === photo.mission_id);
      return mission?.isGlobal === false;
    }
    if (currentFilter === "spontaneous") return photo.mission_id === null;
    return true;
  };

  // Calculer les compteurs de filtres une seule fois (optimisation)
  const filterCounts = useMemo(() => {
    return {
      all: photos.length,
      "my-table": photos.filter((p) => p.table_id === guest?.tableId).length,
      "global-missions": photos.filter((p) => {
        if (!p.mission_id) return false;
        const mission = mockMissions.find((m) => m.id === p.mission_id);
        return mission?.isGlobal === true;
      }).length,
      "table-missions": photos.filter((p) => {
        if (!p.mission_id) return false;
        const mission = mockMissions.find((m) => m.id === p.mission_id);
        return mission?.isGlobal === false;
      }).length,
      spontaneous: photos.filter((p) => p.mission_id === null).length,
    };
  }, [photos, guest?.tableId]);

  // Filtrer les photos selon le filtre actuel
  const filteredPhotos = photos.filter((photo) =>
    isPhotoMatchingFilter(photo, filter)
  );

  // Limiter le nombre de photos affichées (pagination)
  const displayedPhotos = filteredPhotos.slice(0, displayCount);

  // Intersection Observer pour le scroll infini
  useEffect(() => {
    // Si on a déjà tout affiché, on arrête
    if (displayCount >= filteredPhotos.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setDisplayCount((prevCount) => prevCount + 6);
        }
      },
      { threshold: 0.1, rootMargin: "200px" }
    );

    // Capturer la référence actuelle AVANT le cleanup
    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    // Cleanup avec la référence capturée
    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
      observer.disconnect();
    };
  }, [displayCount, filteredPhotos.length]);

  // Fonctions utilitaires
  const getMissionTitle = (missionId: number | null) => {
    if (!missionId) return null;
    return mockMissions.find((m) => m.id === missionId)?.title || null;
  };

  const isMissionGlobal = (missionId: number | null) => {
    if (!missionId) return null;
    return mockMissions.find((m) => m.id === missionId)?.isGlobal ?? null;
  };

  const getTableName = (tableId: number | null) => {
    if (!tableId) return null;
    return mockTables.find((t) => t.id === tableId)?.name || null;
  };

  const handleFilterChange = (newFilter: FilterType) => {
    setFilter(newFilter);
    setDisplayCount(6);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getFilterCount = (filterType: FilterType): number => {
    return filterCounts[filterType];
  };

  // État de chargement
  if (isLoading) {
    return (
      <div className="p-4 flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-momento border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Chargement des photos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 pb-20">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-black">Galerie</h1>
      </div>

      {/* Filtres */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => handleFilterChange("all")}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${
            filter === "all"
              ? "bg-momento text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Toutes ({getFilterCount("all")})
        </button>
        <button
          onClick={() => handleFilterChange("my-table")}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${
            filter === "my-table"
              ? "bg-momento text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Ma table ({getFilterCount("my-table")})
        </button>
        <button
          onClick={() => handleFilterChange("global-missions")}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${
            filter === "global-missions"
              ? "bg-momento text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Missions globales ({getFilterCount("global-missions")})
        </button>
        <button
          onClick={() => handleFilterChange("table-missions")}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${
            filter === "table-missions"
              ? "bg-purple-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Missions de table ({getFilterCount("table-missions")})
        </button>
        <button
          onClick={() => handleFilterChange("spontaneous")}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${
            filter === "spontaneous"
              ? "bg-red-500 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Spontanées ({getFilterCount("spontaneous")})
        </button>
      </div>

      {filteredPhotos.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-2">
            Aucune photo pour ce filtre
          </p>
          <p className="text-gray-400 text-sm">
            Essayez un autre filtre ou capturez un moment ! 📸
          </p>
        </div>
      ) : (
        <>
          <PhotoGrid
            photos={displayedPhotos}
            onPhotoClick={setSelectedPhoto}
            getMissionTitle={getMissionTitle}
            isMissionGlobal={isMissionGlobal}
          />

          {/* Loader pour le scroll infini */}
          {displayCount < filteredPhotos.length && (
            <div
              ref={observerTarget}
              className="w-full h-10 mt-4 flex items-center justify-center"
            >
              <div className="w-6 h-6 border-2 border-momento border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </>
      )}

      {/* Bouton pour remonter en haut (visible uniquement après 300px de scroll) */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-20 right-4 z-50 p-3 bg-momento text-white rounded-full shadow-xl shadow-black/30 active:scale-90 transition-transform flex items-center justify-center"
          aria-label="Remonter en haut"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m18 15-6-6-6 6" />
          </svg>
        </button>
      )}

      {selectedPhoto && (
        <PhotoModal
          photo={selectedPhoto}
          onClose={() => setSelectedPhoto(null)}
          getMissionTitle={getMissionTitle}
          isMissionGlobal={isMissionGlobal}
          getTableName={getTableName}
        />
      )}
    </div>
  );
}
