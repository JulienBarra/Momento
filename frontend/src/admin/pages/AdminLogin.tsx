import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Lock } from "lucide-react";
import { adminApi, adminAuth } from "../adminApi";
import { Btn } from "../ui";

export default function AdminLogin() {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) return;
    setLoading(true);
    setError(null);

    // On valide le token en l'utilisant sur un endpoint admin.
    adminAuth.setToken(token.trim());
    try {
      await adminApi.get("/admin/tables");
      navigate("/admin/dashboard", { replace: true });
    } catch (err: unknown) {
      adminAuth.clear();
      const status =
        typeof err === "object" && err && "response" in err
          ? (err as { response?: { status?: number } }).response?.status
          : undefined;
      setError(status === 401 ? "Token admin invalide." : "Connexion impossible au serveur.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-root min-h-screen flex items-center justify-center p-4">
      <form
        onSubmit={submit}
        className="bg-white border border-line rounded-xl pad-card w-full max-w-sm"
      >
        <div className="flex items-center gap-2 mb-6">
          <div className="w-9 h-9 rounded-full bg-momento flex items-center justify-center">
            <Camera size={18} className="text-white" />
          </div>
          <div className="leading-tight">
            <div className="font-semibold text-ink tracking-tight">Momento</div>
            <div className="text-[11px] text-muted uppercase tracking-widest">Backoffice</div>
          </div>
        </div>

        <h1 className="text-lg font-bold text-ink mb-1">Accès administrateur</h1>
        <p className="text-sm text-muted mb-5">
          Entrez le token admin pour gérer l'événement.
        </p>

        <label className="text-[11px] uppercase tracking-wider text-muted font-medium block mb-1.5">
          Token admin
        </label>
        <div className="relative mb-4">
          <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="••••••••••••••••"
            autoFocus
            className="w-full pl-9 pr-3 py-2.5 text-sm border border-line rounded-lg font-mono focus:outline-none focus:border-[color:var(--momento)]"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">
            {error}
          </p>
        )}

        <Btn
          type="submit"
          variant="primary"
          size="lg"
          className="w-full justify-center"
          disabled={loading || !token.trim()}
        >
          {loading ? "Vérification…" : "Se connecter"}
        </Btn>
      </form>
    </div>
  );
}
