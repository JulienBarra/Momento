import { useState, useEffect } from "react";
import { photoService, getPhotoUrl } from "../services/api";
import type { Photo } from "../services/api";

export default function Gallery() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les photos au montage du composant
  useEffect(() => {
    const loadPhotos = async () => {
      try {
        setIsLoading(true);
        const data = await photoService.getAll();
        setPhotos(data);
      } catch (err) {
        console.error("Erreur lors du chargement des photos:", err);
        setError("Impossible de charger les photos.");
      } finally {
        setIsLoading(false);
      }
    };

    loadPhotos();
  }, []);

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

  // État d'erreur
  if (error) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold text-black mb-4">Galerie 🖼️</h1>
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
          {error}
        </div>
      </div>
    );
  }

  // Aucune photo
  if (photos.length === 0) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold text-black mb-4">Galerie 🖼️</h1>
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-2">Aucune photo pour le moment</p>
          <p className="text-gray-400 text-sm">
            Soyez le premier à capturer un moment ! 📸
          </p>
        </div>
      </div>
    );
  }

  // Affichage de la galerie
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-black mb-4">
        Galerie 🖼️
        <span className="text-sm font-normal text-gray-500 ml-2">
          ({photos.length} {photos.length > 1 ? "photos" : "photo"})
        </span>
      </h1>

      {/* Grille de photos */}
      <div className="grid grid-cols-2 gap-3">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 shadow-md"
          >
            {/* Image */}
            <img
              src={getPhotoUrl(photo.file_path)}
              alt={`Photo par ${photo.guest?.nickname || "Anonyme"}`}
              className="w-full h-full object-cover"
              loading="lazy"
            />

            {/* Overlay avec info auteur */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
              <p className="text-white text-sm font-medium">
                {photo.guest?.nickname || "Anonyme"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
