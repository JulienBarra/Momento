import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Download, X, ImageOff, Loader2 } from "lucide-react";
import {
  albumShareService,
  getPhotoUrl,
  type SharedAlbum,
  type SharedPhoto,
} from "../services/api";

// Force le téléchargement d'une photo (récupère le binaire puis crée un lien).
async function downloadPhoto(photo: SharedPhoto) {
  const url = getPhotoUrl(photo.filePath);
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = photo.filePath.split("/").pop() || `photo-${photo.id}.webp`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(objectUrl);
  } catch {
    // Repli : ouvre dans un onglet si le téléchargement direct échoue
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

export default function AlbumShareView() {
  const { token } = useParams<{ token: string }>();
  const [album, setAlbum] = useState<SharedAlbum | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [lightbox, setLightbox] = useState<SharedPhoto | null>(null);

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        setAlbum(await albumShareService.get(token));
        setStatus("ready");
      } catch {
        setStatus("error");
      }
    })();
  }, [token]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        <Loader2 className="animate-spin" size={28} />
      </div>
    );
  }

  if (status === "error" || !album) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 text-gray-500">
        <ImageOff size={36} className="mb-4" />
        <h1 className="text-lg font-semibold text-gray-800">Album indisponible</h1>
        <p className="text-sm mt-1 max-w-sm">
          Ce lien est invalide ou l'album n'est plus partagé par les mariés.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="px-6 py-10 text-center border-b border-gray-200 bg-white">
        <p className="text-[11px] uppercase tracking-[0.25em] text-momento font-semibold mb-2">
          Album partagé
        </p>
        <h1 className="text-3xl font-bold text-gray-900">{album.title}</h1>
        {album.description && (
          <p className="text-sm text-gray-500 mt-2 max-w-xl mx-auto">{album.description}</p>
        )}
        <p className="text-xs text-gray-400 mt-3">
          {album.photos.length} photo{album.photos.length > 1 ? "s" : ""}
        </p>
      </header>

      <main className="max-w-5xl mx-auto p-4 sm:p-6">
        {album.photos.length === 0 ? (
          <p className="text-center text-gray-400 py-20 text-sm">
            Cet album ne contient pas encore de photos.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
            {album.photos.map((p) => (
              <div
                key={p.id}
                className="group relative aspect-square rounded-lg overflow-hidden bg-gray-100"
              >
                <button onClick={() => setLightbox(p)} className="w-full h-full">
                  <img
                    src={getPhotoUrl(p.filePath)}
                    className="w-full h-full object-cover transition group-hover:scale-105"
                    loading="lazy"
                    alt=""
                  />
                </button>
                <button
                  onClick={() => downloadPhoto(p)}
                  className="absolute bottom-2 right-2 p-2 rounded-full bg-white/90 text-gray-800 shadow-sm opacity-0 group-hover:opacity-100 transition hover:bg-white"
                  aria-label="Télécharger"
                >
                  <Download size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {lightbox && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white"
            onClick={() => setLightbox(null)}
          >
            <X size={24} />
          </button>
          <img
            src={getPhotoUrl(lightbox.filePath)}
            className="max-h-[85vh] max-w-full object-contain rounded"
            alt=""
            onClick={(e) => e.stopPropagation()}
          />
          <div
            className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            {lightbox.guest && (
              <span className="text-white/80 text-sm">Par {lightbox.guest.nickname}</span>
            )}
            <button
              onClick={() => downloadPhoto(lightbox)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-gray-900 text-sm font-medium hover:bg-gray-100"
            >
              <Download size={15} /> Télécharger
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
