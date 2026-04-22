import { useEffect } from "react";
import {
  X,
  Share,
  PlusSquare,
  Check,
  Download,
  MoreVertical,
  Smartphone,
} from "lucide-react";
import { useInstallPrompt } from "../hooks/useInstallPrompt";

interface InstallPromptSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InstallPromptSheet({
  isOpen,
  onClose,
}: InstallPromptSheetProps) {
  const { platform, canPromptInstall, promptInstall } = useInstallPrompt();

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleAndroidInstall = async () => {
    const outcome = await promptInstall();
    if (outcome === "accepted") onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="install-sheet-title"
      >
        <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-momento/10 flex items-center justify-center">
              <Smartphone size={20} className="text-momento" />
            </div>
            <h2
              id="install-sheet-title"
              className="text-lg font-bold text-black"
            >
              Installer Momento
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors active:scale-95"
            aria-label="Fermer"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        <div className="p-6">
          {platform === "ios" && <IosInstructions />}
          {platform === "android" && (
            <AndroidInstructions
              canPromptInstall={canPromptInstall}
              onInstall={handleAndroidInstall}
            />
          )}
          {(platform === "desktop" || platform === "other") && (
            <DesktopInstructions />
          )}

          <button
            onClick={onClose}
            className="w-full mt-6 text-sm text-gray-500 hover:text-gray-700 transition-colors py-2"
          >
            Peut-être plus tard
          </button>
        </div>
      </div>
    </div>
  );
}

function IosInstructions() {
  const steps = [
    {
      icon: Share,
      title: "Ouvrez le menu Partager",
      description: "Appuyez sur l'icône Partager en bas de Safari.",
    },
    {
      icon: PlusSquare,
      title: "Sur l'écran d'accueil",
      description: "Faites défiler et choisissez « Sur l'écran d'accueil ».",
    },
    {
      icon: Check,
      title: "Ajouter",
      description:
        "Appuyez sur « Ajouter » en haut à droite. Momento apparaît sur votre écran d'accueil !",
    },
  ];
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 mb-4">
        Pour installer Momento sur votre iPhone, suivez ces 3 étapes :
      </p>
      {steps.map((step, index) => (
        <div key={step.title} className="flex gap-4 items-start">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-momento text-white font-bold text-sm flex items-center justify-center">
            {index + 1}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <step.icon size={18} className="text-momento" />
              <p className="font-semibold text-black text-sm">{step.title}</p>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              {step.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function AndroidInstructions({
  canPromptInstall,
  onInstall,
}: {
  canPromptInstall: boolean;
  onInstall: () => void;
}) {
  if (canPromptInstall) {
    return (
      <div>
        <p className="text-sm text-gray-600 mb-6">
          Installez Momento sur votre téléphone pour retrouver l'app sur votre
          écran d'accueil et profiter du mode plein écran.
        </p>
        <button
          onClick={onInstall}
          className="w-full bg-momento text-white font-bold rounded-lg p-4 active:scale-95 transition-transform flex items-center justify-center gap-2"
        >
          <Download size={20} />
          Installer maintenant
        </button>
      </div>
    );
  }

  const steps = [
    {
      icon: MoreVertical,
      title: "Ouvrez le menu",
      description: "Appuyez sur les trois points en haut à droite du navigateur.",
    },
    {
      icon: Download,
      title: "Installer l'application",
      description:
        "Choisissez « Installer l'application » ou « Ajouter à l'écran d'accueil ».",
    },
    {
      icon: Check,
      title: "Confirmer",
      description:
        "Validez l'installation. Momento apparaît sur votre écran d'accueil !",
    },
  ];
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 mb-4">
        Pour installer Momento sur votre téléphone :
      </p>
      {steps.map((step, index) => (
        <div key={step.title} className="flex gap-4 items-start">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-momento text-white font-bold text-sm flex items-center justify-center">
            {index + 1}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <step.icon size={18} className="text-momento" />
              <p className="font-semibold text-black text-sm">{step.title}</p>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              {step.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function DesktopInstructions() {
  return (
    <div className="text-center py-4">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-momento/10 flex items-center justify-center">
        <Smartphone size={28} className="text-momento" />
      </div>
      <p className="text-sm text-gray-600 leading-relaxed">
        Momento est une app mobile. Scannez le QR Code sur votre table depuis
        votre téléphone pour l'installer et profiter pleinement de la
        fonctionnalité photo.
      </p>
    </div>
  );
}
