import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Download, X, ImageOff, Loader2, CheckCircle2, Heart } from "lucide-react";
import {
  albumShareService,
  getPhotoUrl,
  type SharedAlbum,
  type SharedPhoto,
} from "../services/api";

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
        {album.photos.length > 0 && (
          <a
            href={albumShareService.albumDownloadUrl(token ?? "")}
            className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-momento text-white text-sm font-medium hover:opacity-90"
          >
            <Download size={15} /> Télécharger l'album
          </a>
        )}
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
                <a
                  href={albumShareService.photoDownloadUrl(token ?? "", p.id)}
                  className="absolute bottom-2 right-2 p-2 rounded-full bg-white/90 text-gray-800 shadow-sm opacity-0 group-hover:opacity-100 transition hover:bg-white"
                  aria-label="Télécharger"
                >
                  <Download size={15} />
                </a>
              </div>
            ))}
          </div>
        )}
      </main>

      {lightbox && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setLightbox(null)}
        >
          {/* Card photo + infos, dans l'esprit de la modale de l'app */}
          <div
            className="bg-white rounded-2xl overflow-hidden max-w-lg w-full shadow-2xl my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setLightbox(null)}
              className="absolute top-6 right-6 z-10 bg-black/50 backdrop-blur-sm text-white p-2 rounded-full hover:bg-black/70 transition-colors"
              aria-label="Fermer"
            >
              <X size={20} />
            </button>

            {/* Image */}
            <div className="relative aspect-square bg-gray-100">
              <img
                src={getPhotoUrl(lightbox.filePath)}
                className="w-full h-full object-cover"
                alt={`Photo par ${lightbox.guest?.nickname || "Anonyme"}`}
              />
            </div>

            {/* Infos */}
            <div className="p-6">
              <div className="mb-3">
                <p className="text-black text-xl font-bold">
                  {lightbox.guest?.nickname || "Anonyme"}
                </p>
                {lightbox.table && (
                  <p className="text-gray-500 text-sm italic mt-1">
                    de la table{" "}
                    <span className="font-bold text-black not-italic">{lightbox.table.name}</span>
                  </p>
                )}
              </div>

              {lightbox.mission ? (
                lightbox.mission.isGlobal ? (
                  // Mission globale → Bloc vert
                  <div className="flex items-start gap-3 bg-momento/10 rounded-lg p-4">
                    <CheckCircle2 size={20} className="text-momento flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-momento/70 uppercase tracking-wide mb-1">
                        Mission globale accomplie
                      </p>
                      <p className="text-black font-medium">{lightbox.mission.title}</p>
                      {lightbox.mission.description && (
                        <p className="text-gray-500 text-sm italic mt-1">
                          {lightbox.mission.description}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  // Mission de table → Bloc violet
                  <div className="flex items-start gap-3 bg-purple-50 rounded-lg p-4">
                    <CheckCircle2 size={20} className="text-purple-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-purple-600/70 uppercase tracking-wide mb-1">
                        Mission de table accomplie
                      </p>
                      <p className="text-black font-medium">{lightbox.mission.title}</p>
                      {lightbox.mission.description && (
                        <p className="text-gray-500 text-sm italic mt-1">
                          {lightbox.mission.description}
                        </p>
                      )}
                    </div>
                  </div>
                )
              ) : (
                // Photo spontanée → Bloc rouge
                <div className="flex items-start gap-3 bg-red-50 rounded-lg p-4">
                  <Heart size={20} className="text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-red-500/70 uppercase tracking-wide mb-1">
                      Photo spontanée
                    </p>
                    <p className="text-black font-medium">Photo capturée pour le plaisir</p>
                  </div>
                </div>
              )}

              <a
                href={albumShareService.photoDownloadUrl(token ?? "", lightbox.id)}
                className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-momento text-white text-sm font-medium hover:opacity-90"
              >
                <Download size={15} /> Télécharger
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
