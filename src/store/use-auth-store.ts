import { create } from "zustand";
import { UserProfile } from "@/types/user";
import { STORAGE_KEYS, ROLES, PermissionCode } from "@/constants";

interface AuthState {
  user: UserProfile | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: UserProfile, token: string, refreshToken: string) => void;
  initializeSession: (user: UserProfile | null, token?: string | null) => void;
  logout: () => void;
  updateUser: (user: Partial<UserProfile>) => void;
  hasPermission: (permissionCode: PermissionCode | string) => boolean;
  hasAnyPermission: (permissionCodes: (PermissionCode | string)[]) => boolean;
  hasRole: (roleName: string) => boolean;
}

function setCookie(name: string, value: string, days = 7) {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function removeCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,

  initializeSession: (user, token) => {
    set({
      user,
      accessToken: token ?? get().accessToken,
      isAuthenticated: !!(user || token),
    });
  },

  setAuth: (user, token, refreshToken) => {
    // Atomically persist in cookies for Next.js SSR & edge proxy
    setCookie(STORAGE_KEYS.ACCESS_TOKEN, token);
    setCookie(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    setCookie(STORAGE_KEYS.USER, JSON.stringify(user));

    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    }

    set({
      user,
      accessToken: token,
      refreshToken,
      isAuthenticated: true,
    });
  },

  logout: () => {
    removeCookie(STORAGE_KEYS.ACCESS_TOKEN);
    removeCookie(STORAGE_KEYS.REFRESH_TOKEN);
    removeCookie(STORAGE_KEYS.USER);

    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
    }

    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    });
  },

  updateUser: (updatedFields) => {
    const updated = get().user ? { ...get().user!, ...updatedFields } : null;
    if (updated) {
      setCookie(STORAGE_KEYS.USER, JSON.stringify(updated));
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated));
      }
    }
    set({ user: updated });
  },

  hasPermission: (permissionCode) => {
    const { user } = get();
    if (!user || !user.role) return false;
    if (user.role.name === ROLES.SUPER_ADMIN) return true;
    return user.role.permissions?.some((p) => p.code === permissionCode) ?? false;
  },

  hasAnyPermission: (permissionCodes) => {
    const { user } = get();
    if (!user || !user.role) return false;
    if (user.role.name === ROLES.SUPER_ADMIN) return true;
    return user.role.permissions?.some((p) => permissionCodes.includes(p.code)) ?? false;
  },

  hasRole: (roleName) => {
    const { user } = get();
    if (!user || !user.role) return false;
    return user.role.name === roleName;
  },
}));
