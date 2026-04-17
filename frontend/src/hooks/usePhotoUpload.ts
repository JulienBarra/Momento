import { useState, useCallback } from "react";
import { toast } from "sonner";
import { UPLOAD_TOAST_ID } from "../constants/camera";

interface UsePhotoUploadOptions {
  onSuccess: () => void;
}

export function usePhotoUpload({ onSuccess }: UsePhotoUploadOptions) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadRetryCount] = useState(0);

  // TODO: remplacer par un vrai upload via photoService.upload() quand le backend sera prêt
  const sendPhoto = useCallback(
    async (_photo: string, missionId?: number, missionTitle?: string) => {
      setIsUploading(true);
      toast.loading("Envoi de votre photo...", { id: UPLOAD_TOAST_ID });

      // Simule un délai réseau
      await new Promise((resolve) => setTimeout(resolve, 800));

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

      setIsUploading(false);
      onSuccess();
    },
    [onSuccess]
  );

  return { isUploading, uploadRetryCount, sendPhoto };
}
