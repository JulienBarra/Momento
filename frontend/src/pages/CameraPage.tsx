import { X } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useCameraStream } from "../hooks/useCameraStream";
import { usePhotoCapture } from "../hooks/usePhotoCapture";
import { usePhotoUpload } from "../hooks/usePhotoUpload";
import { useMissionSelection } from "../hooks/useMissionSelection";
import { usePinchZoom } from "../hooks/usePinchZoom";
import CameraControls from "../components/camera/CameraControls";
import PhotoPreview from "../components/camera/PhotoPreview";
import PhotoActions from "../components/camera/PhotoActions";
import MissionSelectCard from "../components/MissionSelectCard";

export default function CameraPage() {
  const { guest } = useAuth();

  // --- Hooks ---
  const { videoRef, hasPermission, facingMode, toggleCamera, retryCamera } =
    useCameraStream();
  const { photo, canvasRef, showFlash, takePhoto, clearPhoto, clearFlash } =
    usePhotoCapture(videoRef, facingMode);
  const {
    missions,
    selectedMission,
    showMissionModal,
    setShowMissionModal,
    handleMissionSelect,
    clearMission,
  } = useMissionSelection();
  const { zoomLevel, imgRef, resetZoom } = usePinchZoom(!!photo);
  const { isUploading, uploadRetryCount, sendPhoto } = usePhotoUpload({
    onSuccess: () => {
      clearPhoto();
      clearMission();
      resetZoom();
    },
  });

  // --- Handlers ---
  const handleRetake = () => {
    clearPhoto();
    resetZoom();
  };

  const handleSend = () => {
    if (!photo) return;
    sendPhoto(photo, selectedMission?.id, selectedMission?.title);
  };

  // --- Rendu ---

  return (
    <div className="fixed inset-0 bg-black">
      {/* Flux vidéo — toujours monté pour que le ref s'attache */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className={`w-full h-full object-cover ${photo || hasPermission !== true ? "hidden" : ""} ${facingMode === "user" ? "scale-x-[-1]" : ""}`}
      />

      {/* Chargement de la caméra */}
      {hasPermission === null && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white/70 text-sm">Chargement de la caméra...</p>
          </div>
        </div>
      )}

      {/* Accès refusé */}
      {hasPermission === false && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
          <X size={48} className="text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Caméra inaccessible</h2>
          <p className="text-gray-400">
            Veuillez autoriser l'accès à la caméra dans les paramètres de votre
            navigateur.
          </p>
          <button
            onClick={retryCamera}
            className="mt-6 bg-momento text-white px-6 py-2 rounded-full font-bold"
          >
            Réessayer
          </button>
        </div>
      )}

      {/* Aperçu de la photo capturée */}
      {photo && (
        <PhotoPreview
          photo={photo}
          zoomLevel={zoomLevel}
          imgRef={imgRef}
          selectedMission={selectedMission}
          missions={missions}
          onMissionClick={() => setShowMissionModal(true)}
        />
      )}

      {/* Contrôles en mode caméra */}
      {!photo && (
        <CameraControls
          selectedMission={selectedMission}
          missions={missions}
          onMissionClick={() => setShowMissionModal(true)}
          onToggleCamera={toggleCamera}
          onTakePhoto={takePhoto}
        />
      )}

      {/* Actions après capture */}
      {photo && (
        <PhotoActions
          isUploading={isUploading}
          uploadRetryCount={uploadRetryCount}
          onRetake={handleRetake}
          onSend={handleSend}
        />
      )}

      {/* Canvas caché pour la capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Flash */}
      {showFlash && (
        <div
          className="fixed inset-0 bg-white z-50 pointer-events-none animate-flash"
          onAnimationEnd={clearFlash}
        />
      )}

      {/* Modal sélection de mission */}
      {showMissionModal && (
        <MissionSelectCard
          missions={missions}
          selectedMission={selectedMission}
          guestTableId={guest?.tableId}
          onSelect={handleMissionSelect}
          onClose={() => setShowMissionModal(false)}
        />
      )}
    </div>
  );
}
