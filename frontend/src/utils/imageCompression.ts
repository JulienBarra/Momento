import {
  MAX_PHOTO_WIDTH,
  MAX_PHOTO_HEIGHT,
  PHOTO_QUALITY,
  PHOTO_FORMAT,
} from "../constants/camera";

/**
 * Compresse un canvas en le redimensionnant si nécessaire
 * et retourne un data URL en WebP.
 */
export function compressCanvas(canvas: HTMLCanvasElement): string {
  if (canvas.width <= MAX_PHOTO_WIDTH && canvas.height <= MAX_PHOTO_HEIGHT) {
    return canvas.toDataURL(PHOTO_FORMAT, PHOTO_QUALITY);
  }

  const ratio = Math.min(
    MAX_PHOTO_WIDTH / canvas.width,
    MAX_PHOTO_HEIGHT / canvas.height
  );
  const newWidth = Math.floor(canvas.width * ratio);
  const newHeight = Math.floor(canvas.height * ratio);

  const resizedCanvas = document.createElement("canvas");
  resizedCanvas.width = newWidth;
  resizedCanvas.height = newHeight;

  const ctx = resizedCanvas.getContext("2d");
  if (ctx) {
    ctx.drawImage(canvas, 0, 0, newWidth, newHeight);
  }

  return resizedCanvas.toDataURL(PHOTO_FORMAT, PHOTO_QUALITY);
}
