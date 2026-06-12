// Contraintes vidéo pour la caméra
export const VIDEO_CONSTRAINTS = {
  width: { ideal: 3840 },
  height: { ideal: 2160 },
  aspectRatio: { ideal: 16 / 9 },
} as const;

// Compression de l'image capturée — limites sur le grand et le petit côté
// (indépendant de l'orientation portrait/paysage)
export const MAX_PHOTO_LONG_EDGE = 1920;
export const MAX_PHOTO_SHORT_EDGE = 1080;
export const PHOTO_QUALITY = 0.92;
export const PHOTO_FORMAT = "image/webp";

// Upload
export const MAX_UPLOAD_RETRIES = 3;
export const UPLOAD_RETRY_DELAY_MS = 2000;
export const UPLOAD_TOAST_ID = "photo-upload";

// Zoom
export const MIN_ZOOM = 1;
export const MAX_ZOOM = 3;
