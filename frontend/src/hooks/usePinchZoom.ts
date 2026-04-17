import { useState, useRef, useEffect, useCallback } from "react";
import { MIN_ZOOM, MAX_ZOOM } from "../constants/camera";

export function usePinchZoom(active: boolean) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [zoomLevel, setZoomLevel] = useState(MIN_ZOOM);
  const zoomLevelRef = useRef(MIN_ZOOM);

  useEffect(() => {
    if (!active || !imgRef.current) return;

    const element = imgRef.current;
    let initialDistance = 0;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const [t1, t2] = [e.touches[0], e.touches[1]];
        initialDistance = Math.hypot(
          t2.clientX - t1.clientX,
          t2.clientY - t1.clientY
        );
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const [t1, t2] = [e.touches[0], e.touches[1]];
        const currentDistance = Math.hypot(
          t2.clientX - t1.clientX,
          t2.clientY - t1.clientY
        );

        const scale = currentDistance / initialDistance;
        const newZoom = Math.min(Math.max(MIN_ZOOM, zoomLevelRef.current * scale), MAX_ZOOM);
        zoomLevelRef.current = newZoom;
        setZoomLevel(newZoom);
        initialDistance = currentDistance;
      }
    };

    const handleTouchEnd = () => {
      initialDistance = 0;
    };

    element.addEventListener("touchstart", handleTouchStart);
    element.addEventListener("touchmove", handleTouchMove, { passive: false });
    element.addEventListener("touchend", handleTouchEnd);

    return () => {
      element.removeEventListener("touchstart", handleTouchStart);
      element.removeEventListener("touchmove", handleTouchMove);
      element.removeEventListener("touchend", handleTouchEnd);
    };
  }, [active]);

  const resetZoom = useCallback(() => {
    zoomLevelRef.current = MIN_ZOOM;
    setZoomLevel(MIN_ZOOM);
  }, []);

  return { zoomLevel, imgRef, resetZoom };
}
