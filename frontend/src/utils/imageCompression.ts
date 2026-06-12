import {
  MAX_PHOTO_LONG_EDGE,
  MAX_PHOTO_SHORT_EDGE,
  PHOTO_QUALITY,
  PHOTO_FORMAT,
} from "../constants/camera";

/**
 * Compresse un canvas en le redimensionnant si nécessaire
 * et retourne un data URL en WebP.
 *
 * Les limites s'appliquent au grand et au petit côté pour rester valables
 * quelle que soit l'orientation (portrait ou paysage).
 */
export function compressCanvas(canvas: HTMLCanvasElement): string {
  const longEdge = Math.max(canvas.width, canvas.height);
  const shortEdge = Math.min(canvas.width, canvas.height);

  const ratio = Math.min(
    1,
    MAX_PHOTO_LONG_EDGE / longEdge,
    MAX_PHOTO_SHORT_EDGE / shortEdge
  );

  // Déjà sous les limites : on encode sans redimensionner
  if (ratio >= 1) {
    return canvas.toDataURL(PHOTO_FORMAT, PHOTO_QUALITY);
  }

  const newWidth = Math.round(canvas.width * ratio);
  const newHeight = Math.round(canvas.height * ratio);

  const resizedCanvas = document.createElement("canvas");
  resizedCanvas.width = newWidth;
  resizedCanvas.height = newHeight;

  const ctx = resizedCanvas.getContext("2d");
  if (ctx) {
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(canvas, 0, 0, newWidth, newHeight);
  }

  return resizedCanvas.toDataURL(PHOTO_FORMAT, PHOTO_QUALITY);
}
