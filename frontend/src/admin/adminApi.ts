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

export interface AdminGuest {
  id: number;
  nickname: string;
  tableId: number;
  table: { id: number; name: string } | null;
  photoCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface GuestPayload {
  nickname?: string;
  tableId?: number;
}

export interface QrLinkResponse {
  message: string;
  url: string;
  signature: string;
}

export interface AdminMission {
  id: number;
  title: string;
  isGlobal: boolean;
  tableId: number | null;
  table: { id: number; name: string } | null;
  completedCount: number;
  target: number;
  createdAt: string;
  updatedAt: string;
}

export interface MissionPayload {
  title: string;
  isGlobal: boolean;
  tableId?: number | null;
  applyToAllTables?: boolean;
}

export interface AdminPhoto {
  id: number;
  filePath: string;
  tableId: number | null;
  missionId: number | null;
  guestId: number;
  starred: boolean;
  createdAt: string;
  guest: { id: number; nickname: string } | null;
  table: { id: number; name: string } | null;
  mission: { id: number; title: string; isGlobal: boolean } | null;
}

export interface DashboardStats {
  photos: { total: number; lastHour: number };
  guests: { connected: number };
  missions: { accomplishedPhotos: number; globalCount: number };
  tables: { total: number; active: number };
  leaderboard: { id: number; name: string; count: number }[];
  recent: {
    id: number;
    filePath: string;
    guestNickname: string;
    tableId: number | null;
    tableName: string | null;
    mission: { title: string; isGlobal: boolean } | null;
    createdAt: string;
  }[];
  globalMissions: { id: number; title: string; completedCount: number; target: number }[];
  buckets: { key: string; count: number }[];
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

export const adminGuestService = {
  getAll: async (): Promise<AdminGuest[]> => {
    const { data } = await adminApi.get<AdminGuest[]>("/admin/guests");
    return data;
  },
  create: async (payload: { nickname: string; tableId: number }): Promise<AdminGuest> => {
    const { data } = await adminApi.post<AdminGuest>("/admin/guests", payload);
    return data;
  },
  update: async (id: number, payload: GuestPayload): Promise<AdminGuest> => {
    const { data } = await adminApi.patch<AdminGuest>(`/admin/guests/${id}`, payload);
    return data;
  },
  remove: async (id: number): Promise<void> => {
    await adminApi.delete(`/admin/guests/${id}`);
  },
};

export const adminMissionService = {
  getAll: async (): Promise<AdminMission[]> => {
    const { data } = await adminApi.get<AdminMission[]>("/admin/missions");
    return data;
  },
  create: async (payload: MissionPayload): Promise<AdminMission | AdminMission[]> => {
    const { data } = await adminApi.post("/admin/missions", payload);
    return data;
  },
  update: async (id: number, payload: Partial<MissionPayload>): Promise<AdminMission> => {
    const { data } = await adminApi.patch<AdminMission>(`/admin/missions/${id}`, payload);
    return data;
  },
  remove: async (id: number): Promise<void> => {
    await adminApi.delete(`/admin/missions/${id}`);
  },
};

export const adminStatsService = {
  get: async (): Promise<DashboardStats> => {
    const { data } = await adminApi.get<DashboardStats>("/admin/stats");
    return data;
  },
};

export const adminPhotoService = {
  getAll: async (): Promise<AdminPhoto[]> => {
    const { data } = await adminApi.get<AdminPhoto[]>("/admin/photos");
    return data;
  },
  setStarred: async (id: number, starred: boolean): Promise<AdminPhoto> => {
    const { data } = await adminApi.patch<AdminPhoto>(`/admin/photos/${id}`, { starred });
    return data;
  },
  remove: async (id: number): Promise<void> => {
    await adminApi.delete(`/admin/photos/${id}`);
  },
};
