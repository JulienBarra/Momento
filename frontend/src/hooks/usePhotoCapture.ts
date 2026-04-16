import { useState, useRef, useCallback } from "react";
import { compressCanvas } from "../utils/imageCompression";

export function usePhotoCapture(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  facingMode: "environment" | "user"
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [showFlash, setShowFlash] = useState(false);

  const takePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");
    if (!context) return;

    // Miroir horizontal en mode selfie
    if (facingMode === "user") {
      context.translate(canvas.width, 0);
      context.scale(-1, 1);
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = compressCanvas(canvas);
    setPhoto(imageData);

    // Feedback haptique
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }

    // Flash visuel via React state
    setShowFlash(true);
  }, [videoRef, facingMode]);

  const clearPhoto = useCallback(() => {
    setPhoto(null);
  }, []);

  const clearFlash = useCallback(() => {
    setShowFlash(false);
  }, []);

  return { photo, canvasRef, showFlash, takePhoto, clearPhoto, clearFlash };
}
