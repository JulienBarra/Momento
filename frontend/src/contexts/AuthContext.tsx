import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { authService } from "../services/api";
import type { Guest } from "../services/api";

interface AuthContextType {
  guest: Guest | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (tableId: number, signature: string, nickname: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [guest, setGuest] = useState<Guest | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Au chargement initial, récupérer les données du localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem("auth_token");
    const storedGuest = localStorage.getItem("guest");

    if (storedToken && storedGuest) {
      setToken(storedToken);
      setGuest(JSON.parse(storedGuest));
    }

    setIsLoading(false);
  }, []);

  const login = async (tableId: number, signature: string, nickname: string) => {
    try {
      const response = await authService.login(tableId, signature, nickname);

      // Stocker le token et les infos invité
      localStorage.setItem("auth_token", response.token);
      localStorage.setItem("guest", JSON.stringify(response.guest));

      setToken(response.token);
      setGuest(response.guest);
    } catch (error) {
      console.error("Erreur lors de la connexion:", error);
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setToken(null);
    setGuest(null);
  };

  const value: AuthContextType = {
    guest,
    token,
    isAuthenticated: !!token,
    login,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook personnalisé pour utiliser le contexte
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
