import {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
import type { ReactNode } from "react";
import { VIDEO_CONSTRAINTS } from "../constants/camera";

interface CameraContextType {
  stream: MediaStream | null;
  hasPermission: boolean | null;
  facingMode: "environment" | "user";
  toggleCamera: () => void;
  retryCamera: () => void;
}

const CameraContext = createContext<CameraContextType | undefined>(undefined);

export function CameraProvider({ children }: { children: ReactNode }) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">(
    "environment"
  );
  const [retryCount, setRetryCount] = useState(0);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    let isMounted = true;

    // Couper l'ancien stream si on change de caméra
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    const initCamera = async () => {
      try {
        const newStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode,
            ...VIDEO_CONSTRAINTS,
          },
          audio: false,
        });

        if (isMounted) {
          streamRef.current = newStream;
          setStream(newStream);
          setHasPermission(true);
        } else {
          newStream.getTracks().forEach((track) => track.stop());
        }
      } catch (err) {
        console.error("Erreur d'accès à la caméra:", err);
        if (isMounted) {
          setHasPermission(false);
        }
      }
    };

    initCamera();

    return () => {
      isMounted = false;
    };
  }, [retryCount, facingMode]);

  // Cleanup global quand le provider se démonte
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const toggleCamera = useCallback(() => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  }, []);

  const retryCamera = useCallback(() => {
    setRetryCount((c) => c + 1);
  }, []);

  return (
    <CameraContext.Provider
      value={{ stream, hasPermission, facingMode, toggleCamera, retryCamera }}
    >
      {children}
    </CameraContext.Provider>
  );
}

export function useCamera() {
  const context = useContext(CameraContext);
  if (context === undefined) {
    throw new Error("useCamera must be used within a CameraProvider");
  }
  return context;
}
