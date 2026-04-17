import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Camera, Target, Images } from "lucide-react";

export default function WelcomeCard() {
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, isAuthenticated } = useAuth();

  // Si déjà authentifié, rediriger vers la galerie
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) return;

    // Récupérer tableId et signature depuis l'URL
    const tableIdParam = searchParams.get("tableId");
    const signature = searchParams.get("signature");

    if (!tableIdParam || !signature) {
      setError(
        "Lien invalide. Veuillez scanner le QR Code présent sur votre table.",
      );
      return;
    }

    const tableId = parseInt(tableIdParam, 10);
    if (isNaN(tableId)) {
      setError("ID de table invalide.");
      return;
    }

    setIsLoading(true);

    try {
      await login(tableId, signature, name.trim());
    } catch (err) {
      console.error("Erreur de connexion:", err);
      setError(
        "Impossible de se connecter. Vérifiez que le QR Code est valide.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const steps = [
    { icon: Camera, label: "Prenez des photos" },
    { icon: Target, label: "Relevez des défis" },
    { icon: Images, label: "Partagez vos souvenirs" },
  ];

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center animate-fade-in"
    >
      {/* Branding */}
      <p className="text-sm font-medium text-momento uppercase tracking-widest mb-2">
        Momento
      </p>

      {/* Noms des mariés */}
      <h1 className="font-title text-5xl text-black mb-1">Fleur & Anthony</h1>
      <p className="text-gray-500 text-sm mb-6">Bienvenue à notre mariage !</p>

      <div className="w-16 h-px bg-gray-200 mx-auto mb-6" />

      {/* Onboarding — 3 étapes */}
      <div className="flex justify-center gap-6 mb-8">
        {steps.map((step) => (
          <div key={step.label} className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-momento/10 flex items-center justify-center">
              <step.icon size={20} className="text-momento" />
            </div>
            <p className="text-xs text-gray-600 leading-tight max-w-[80px]">
              {step.label}
            </p>
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      <input
        type="text"
        placeholder="Votre prénom ou surnom"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full border-2 border-gray-200 rounded-lg p-4 mb-4 focus:border-momento focus:outline-none transition-colors"
        required
      />

      <button
        type="submit"
        disabled={isLoading || !name.trim()}
        className="w-full bg-momento text-white font-bold rounded-lg p-4 active:scale-95 transition-transform disabled:opacity-50"
      >
        {isLoading ? "Connexion..." : "Rejoindre la fête"}
      </button>
    </form>
  );
}
