import { useState, useRef, useEffect } from "react";
import { X, Send, RefreshCw } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { photoService } from "../services/api";

export default function CameraPage() {
  // --- ÉTATS (STATES) ---
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [photo, setPhoto] = useState<string | null>(null); // Stockera l'image capturée
  const [retryCount, setRetryCount] = useState(0); // Pour forcer le re-render
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment"); // Caméra arrière par défaut
  const [isUploading, setIsUploading] = useState(false); // État de l'upload

  // --- RÉFÉRENCES (REFS) ---
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // --- CONTEXTE AUTH ---
  const { guest } = useAuth();

  // --- 1. GÉRER LE CYCLE DE VIE & ALLUMER LA CAMÉRA ---
  useEffect(() => {
    let isMounted = true;

    const initCamera = async () => {
      try {
        // On demande la caméra en qualité maximale (4K)
        // Le mot-clé "ideal" permet un fallback automatique sur les appareils moins puissants
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: facingMode, // "environment" (arrière) ou "user" (frontale)
            width: { ideal: 3840 },  // 4K width
            height: { ideal: 2160 }, // 4K height
            aspectRatio: { ideal: 16 / 9 },
          },
          audio: false,
        });

        if (isMounted && videoRef.current) {
          videoRef.current.srcObject = stream;
          setHasPermission(true);
        }
      } catch (err) {
        console.error("Erreur d'accès à la caméra:", err);
        if (isMounted) {
          setHasPermission(false);
        }
      }
    };

    initCamera();

    // Fonction de nettoyage : s'exécute quand on quitte la page ou change de caméra
    return () => {
      isMounted = false;
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop()); // On coupe le flux !
      }
    };
  }, [retryCount, facingMode]); // Re-exécuter si on clique sur "Réessayer" ou change de caméra

  // --- 3. PRENDRE LA PHOTO ---
  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      // On met le canvas à la même taille que la vidéo
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // On "dessine" l'image de la vidéo sur le canvas
      const context = canvas.getContext("2d");
      if (context) {
        // Si on est en mode selfie (caméra frontale), on inverse l'image horizontalement
        if (facingMode === "user") {
          context.translate(canvas.width, 0);
          context.scale(-1, 1);
        }

        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // On transforme le dessin en vraie image (format WebP plus léger)
        const imageData = canvas.toDataURL("image/webp");
        setPhoto(imageData);
      }
    }
  };

  // --- 4. ENVOYER LA PHOTO ---
  const sendPhoto = async () => {
    if (!photo || !guest) return;

    setIsUploading(true);

    try {
      // Convertir le data URL (base64) en Blob
      const response = await fetch(photo);
      const blob = await response.blob();

      // Créer un fichier avec le bon nom et type
      const file = new File([blob], `photo-${Date.now()}.webp`, {
        type: "image/webp",
      });

      // Upload vers le backend
      await photoService.upload(file, guest.tableId);

      // Succès : on réinitialise pour la prochaine photo
      alert("Photo envoyée avec succès ! 📸");
      setPhoto(null);
    } catch (error) {
      console.error("Erreur lors de l'upload:", error);
      alert("Erreur lors de l'envoi de la photo. Réessayez.");
    } finally {
      setIsUploading(false);
    }
  };

  // --- AFFICHAGE ---

  // Cas 1 : Accès refusé ou pas de caméra
  if (hasPermission === false) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <X size={48} className="text-red-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">Caméra inaccessible</h2>
        <p className="text-gray-500">
          Veuillez autoriser l'accès à la caméra dans les paramètres de votre
          navigateur.
        </p>
        <button
          onClick={() => setRetryCount((c) => c + 1)}
          className="mt-6 bg-momento text-white px-6 py-2 rounded-full font-bold"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black">
      {/* Flux vidéo - toujours monté, juste caché quand on affiche la photo */}
      <video
        ref={videoRef}
        autoPlay
        playsInline // CRUCIAL pour iOS : empêche la vidéo de s'ouvrir en plein écran natif
        className={`w-full h-full object-cover ${photo ? "hidden" : ""} ${facingMode === "user" ? "scale-x-[-1]" : ""}`}
      />

      {/* Aperçu de la photo capturée */}
      {photo && (
        <img
          src={photo}
          alt="Aperçu"
          className="w-full h-full object-cover"
        />
      )}

      {/* Boutons en mode caméra */}
      {!photo && (
        <>
          {/* Bouton pour retourner la caméra (en haut à droite) */}
          <div className="absolute top-6 right-6">
            <button
              onClick={() => setFacingMode(facingMode === "environment" ? "user" : "environment")}
              className="w-12 h-12 bg-white/20 backdrop-blur-md text-white rounded-full flex items-center justify-center active:scale-95 transition-transform shadow-lg"
            >
              <RefreshCw size={24} />
            </button>
          </div>

          {/* Bouton pour prendre la photo */}
          <div className="absolute bottom-20 left-0 w-full flex justify-center pb-safe">
            <button
              onClick={takePhoto}
              className="w-16 h-16 bg-white rounded-full border-4 border-gray-300 flex items-center justify-center active:scale-95 transition-transform shadow-2xl"
            >
              <div className="w-12 h-12 bg-white rounded-full border-2 border-gray-100 shadow-inner"></div>
            </button>
          </div>
        </>
      )}

      {/* Boutons d'action après avoir pris la photo */}
      {photo && (
        <div className="absolute bottom-20 left-0 w-full flex justify-around px-8 pb-safe">
          <button
            onClick={() => setPhoto(null)} // On efface la photo pour recommencer
            className="bg-gray-800/80 backdrop-blur text-white px-6 py-3 rounded-full flex items-center gap-2 font-medium shadow-xl"
          >
            <RefreshCw size={20} /> Refaire
          </button>
          <button
            onClick={sendPhoto}
            disabled={isUploading}
            className="bg-momento text-white px-6 py-3 rounded-full flex items-center gap-2 font-bold shadow-xl shadow-momento/40 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Envoi...
              </>
            ) : (
              <>
                <Send size={20} /> Envoyer
              </>
            )}
          </button>
        </div>
      )}

      {/* Le canvas caché qui sert juste à faire la conversion vidéo -> image */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
