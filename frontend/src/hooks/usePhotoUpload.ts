import { useState, useCallback } from "react";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import {
  MAX_UPLOAD_RETRIES,
  UPLOAD_RETRY_DELAY_MS,
  UPLOAD_TOAST_ID,
} from "../constants/camera";
import { photoService, authService } from "../services/api";

interface UsePhotoUploadOptions {
  onSuccess: () => void;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Un échec est « définitif » (inutile de réessayer) quand le serveur a répondu
// par une erreur client 4xx : photo refusée (trop lourde, mauvais format) ou
// token expiré. À l'inverse, une panne réseau (aucune réponse) ou une erreur
// serveur 5xx est transitoire — typique d'un WiFi de salle capricieux — et
// vaut le coup d'être retentée.
function isRetryable(error: unknown): boolean {
  if (isAxiosError(error)) {
    const status = error.response?.status;
    if (status === undefined) return true; // pas de réponse → problème réseau
    return status >= 500;
  }
  return false;
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
        // Préparation du fichier (une seule fois, hors de la boucle de retry)
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

        // Boucle d'envoi : 1 tentative initiale puis jusqu'à
        // MAX_UPLOAD_RETRIES nouvelles tentatives en cas d'échec transitoire,
        // avec un délai croissant entre chaque pour ne pas marteler le serveur.
        for (let attempt = 0; ; attempt++) {
          try {
            await photoService.upload(file, guest.tableId, missionId);
            break; // succès → on sort de la boucle
          } catch (error) {
            if (attempt >= MAX_UPLOAD_RETRIES || !isRetryable(error)) {
              throw error; // plus de tentatives, ou échec définitif
            }
            const nextAttempt = attempt + 1;
            setUploadRetryCount(nextAttempt);
            toast.loading(
              `Connexion instable, nouvelle tentative... (${nextAttempt}/${MAX_UPLOAD_RETRIES})`,
              { id: UPLOAD_TOAST_ID }
            );
            // Back-off croissant : 2s, 4s, 6s...
            await sleep(UPLOAD_RETRY_DELAY_MS * nextAttempt);
          }
        }

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
        toast.error("Erreur lors de l'envoi", {
          description: "Vérifiez votre connexion et réessayez",
          duration: 4000,
        });
      } finally {
        setIsUploading(false);
        setUploadRetryCount(0);
      }
    },
    [onSuccess]
  );

  return { isUploading, uploadRetryCount, sendPhoto };
}
