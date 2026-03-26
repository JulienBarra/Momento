import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

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
        "Lien invalide. Veuillez scanner le QR Code présent sur votre table."
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
      // Redirection automatique vers la galerie via useEffect
    } catch (err) {
      console.error("Erreur de connexion:", err);
      setError(
        "Impossible de se connecter. Vérifiez que le QR Code est valide."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center"
    >
      <h1 className="text-3xl font-bold text-black mb-2">Momento</h1>
      <p className="text-black/70 mb-8">
        Entrez votre prénom pour rejoindre la galerie.
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      <input
        type="text"
        placeholder="Ex: Tonton Gégé"
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
        {isLoading ? "Connexion..." : "Rejoindre la table"}
      </button>
    </form>
  );
}
