import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3333";

const ADMIN_TOKEN_KEY = "admin_token";

export const adminAuth = {
  getToken: (): string | null => localStorage.getItem(ADMIN_TOKEN_KEY),
  setToken: (token: string) => localStorage.setItem(ADMIN_TOKEN_KEY, token),
  clear: () => localStorage.removeItem(ADMIN_TOKEN_KEY),
  isAuthenticated: (): boolean => !!localStorage.getItem(ADMIN_TOKEN_KEY),
};

// Instance Axios dédiée à l'admin (séparée de l'app invités).
export const adminApi = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json", Accept: "application/json" },
});

adminApi.interceptors.request.use((config) => {
  const token = adminAuth.getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      adminAuth.clear();
      // On évite une boucle si on est déjà sur la page de login
      if (!window.location.pathname.startsWith("/admin/login")) {
        window.location.href = "/admin/login";
      }
    }
    return Promise.reject(error);
  }
);

// Palette de couleurs assignée côté client par ordre de table (cf. design Backoffice).
const TABLE_PALETTE = [
  "#71a36d",
  "#7c3aed",
  "#d97706",
  "#0ea5e9",
  "#ef4444",
  "#059669",
  "#db2777",
  "#2563eb",
  "#ca8a04",
  "#9333ea",
];

export function tableColor(index: number): string {
  return TABLE_PALETTE[index % TABLE_PALETTE.length];
}

// ---- Types ----
export interface AdminTable {
  id: number;
  name: string;
  guestCount: number;
  photoCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface QrLinkResponse {
  message: string;
  url: string;
  signature: string;
}

// ---- Services ----
export const adminTableService = {
  getAll: async (): Promise<AdminTable[]> => {
    const { data } = await adminApi.get<AdminTable[]>("/admin/tables");
    return data;
  },
  create: async (name: string): Promise<AdminTable> => {
    const { data } = await adminApi.post<AdminTable>("/admin/tables", { name });
    return data;
  },
  rename: async (id: number, name: string): Promise<AdminTable> => {
    const { data } = await adminApi.patch<AdminTable>(`/admin/tables/${id}`, { name });
    return data;
  },
  remove: async (id: number): Promise<void> => {
    await adminApi.delete(`/admin/tables/${id}`);
  },
  qrLink: async (id: number): Promise<QrLinkResponse> => {
    const { data } = await adminApi.get<QrLinkResponse>(`/admin/tables/${id}/qr`);
    return data;
  },
};
