import axios from "axios";

// URL de base de l'API backend
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3333";

// Instance Axios configurée
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Intercepteur pour ajouter automatiquement le token d'authentification
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs de réponse (ex: 401 Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token invalide ou expiré, on nettoie le localStorage
      localStorage.removeItem("auth_token");
      localStorage.removeItem("guest");
      // Redirection vers la page de login
      window.location.href = "/join";
    }
    return Promise.reject(error);
  }
);

// Types pour l'API
export interface Table {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Guest {
  id: number;
  nickname: string;
  tableId: number;
  table?: Table;
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponse {
  message: string;
  guest: Guest;
  token: string;
}

export interface Photo {
  id: number;
  filePath: string;
  tableId: number | null;
  missionId: number | null;
  guestId: number;
  createdAt: string;
  updatedAt: string;
  guest?: Guest;
  mission?: Mission | null;
  table?: Table | null;
}

export interface Mission {
  id: number;
  title: string;
  isGlobal: boolean;
  tableId: number | null;
  table?: Table | null;
  createdAt: string;
  updatedAt: string;
}

// Service d'authentification
export const authService = {
  // Login d'un invité via QR code
  login: async (tableId: number, signature: string, nickname: string): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>(`/tables/${tableId}/login?signature=${signature}`, {
      nickname,
    });
    return response.data;
  },

  // Déconnexion
  logout: () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("guest");
  },

  // Récupérer l'invité connecté
  getCurrentGuest: (): Guest | null => {
    const guestData = localStorage.getItem("guest");
    return guestData ? JSON.parse(guestData) : null;
  },

  // Vérifier si l'utilisateur est authentifié
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem("auth_token");
  },
};

// Service de gestion des photos
export const photoService = {
  // Récupérer toutes les photos
  getAll: async (): Promise<Photo[]> => {
    const response = await api.get<Photo[]>("/photos");
    return response.data;
  },

  // Upload une nouvelle photo
  upload: async (
    photoFile: File,
    tableId: number,
    missionId?: number
  ): Promise<Photo> => {
    const formData = new FormData();
    formData.append("photo", photoFile);
    formData.append("table_id", tableId.toString());
    if (missionId) {
      formData.append("mission_id", missionId.toString());
    }

    const response = await api.post<Photo>("/photos", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
};

// Service de gestion des missions
export const missionService = {
  // Récupérer toutes les missions (globales + missions de la table de l'invité)
  getAll: async (): Promise<Mission[]> => {
    const response = await api.get<Mission[]>("/missions");
    return response.data;
  },
};

export const getPhotoUrl = (filePath: string): string => {
  if (!filePath) return filePath;
  if (/^https?:\/\//i.test(filePath)) return filePath;
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3333";
  return `${apiUrl}/uploads/${filePath}`;
};

export default api;
