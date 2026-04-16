import { RefreshCw, Send } from "lucide-react";

interface PhotoActionsProps {
  isUploading: boolean;
  uploadRetryCount: number;
  onRetake: () => void;
  onSend: () => void;
}

export default function PhotoActions({
  isUploading,
  uploadRetryCount,
  onRetake,
  onSend,
}: PhotoActionsProps) {
  return (
    <div className="absolute bottom-20 left-0 w-full flex justify-around px-8 pb-safe">
      <button
        onClick={onRetake}
        className="bg-gray-800/80 backdrop-blur text-white px-6 py-3 rounded-full flex items-center gap-2 font-medium shadow-xl"
      >
        <RefreshCw size={20} /> Refaire
      </button>
      <button
        onClick={onSend}
        disabled={isUploading}
        className="bg-momento text-white px-6 py-3 rounded-full flex items-center gap-2 font-bold shadow-xl shadow-momento/40 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isUploading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            {uploadRetryCount > 0
              ? `Tentative ${uploadRetryCount}/3...`
              : "Envoi..."}
          </>
        ) : (
          <>
            <Send size={20} /> Envoyer
          </>
        )}
      </button>
    </div>
  );
}
