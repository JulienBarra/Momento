import { useState, useCallback } from "react";
import { toast } from "sonner";
import { UPLOAD_TOAST_ID } from "../constants/camera";
import { photoService, authService } from "../services/api";

interface UsePhotoUploadOptions {
  onSuccess: () => void;
}

export function usePhotoUpload({ onSuccess }: UsePhotoUploadOptions) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadRetryCount, setUploadRetryCount] = useState(0);

  const sendPhoto = useCallback(
    async (photo: string, missionId?: number, missionTitle?: string) => {
      setIsUploading(true);
      setUploadRetryCount(0);
      toast.loading("Envoi de votre photo...", { id: UPLOAD_TOAST_ID });

      try {
        // Convertir le base64 data URL en File
        const response = await fetch(photo);
        const blob = await response.blob();
        const file = new File([blob], `photo-${Date.now()}.webp`, {
          type: blob.type || "image/webp",
        });

        // Récupérer le tableId du guest authentifié
        const guest = authService.getCurrentGuest();
        if (!guest) {
          throw new Error("Non authentifié");
        }

        // Upload réel via l'API
        await photoService.upload(file, guest.tableId, missionId);

        toast.dismiss(UPLOAD_TOAST_ID);

        if (missionId && missionTitle) {
          toast.success(`Mission "${missionTitle}" accomplie !`, {
            description: "Votre photo a été envoyée avec succès",
            duration: 3000,
          });
        } else {
          toast.success("Photo envoyée avec succès !", {
            description: "Votre photo est maintenant dans la galerie",
            duration: 3000,
          });
        }

        onSuccess();
      } catch {
        toast.dismiss(UPLOAD_TOAST_ID);
        setUploadRetryCount((prev) => prev + 1);
        toast.error("Erreur lors de l'envoi", {
          description: "Vérifiez votre connexion et réessayez",
          duration: 4000,
        });
      } finally {
        setIsUploading(false);
      }
    },
    [onSuccess]
  );

  return { isUploading, uploadRetryCount, sendPhoto };
}
