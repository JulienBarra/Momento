import { useRef, useEffect } from "react";
import { useCamera } from "../contexts/CameraContext";

export function useCameraStream() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { stream, hasPermission, facingMode, toggleCamera, retryCamera } =
    useCamera();

  // Attacher le stream partagé au <video> element
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return { videoRef, hasPermission, facingMode, toggleCamera, retryCamera };
}
