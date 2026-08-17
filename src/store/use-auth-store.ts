import { create } from "zustand";
import { UserProfile } from "@/types/user";
import { STORAGE_KEYS, ROLES, PermissionCode } from "@/constants";

interface AuthState {
  user: UserProfile | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: UserProfile, token: string, refreshToken: string) => void;
  logout: () => void;
  updateUser: (user: Partial<UserProfile>) => void;
  hasPermission: (permissionCode: PermissionCode | string) => boolean;
  hasAnyPermission: (permissionCodes: (PermissionCode | string)[]) => boolean;
  hasRole: (roleName: string) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken:
    typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN) : null,
  refreshToken:
    typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN) : null,
  isAuthenticated:
    typeof window !== "undefined" ? !!localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN) : false,
  isLoading: false,

  setAuth: (user, token, refreshToken) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    }
    set({ user, accessToken: token, refreshToken, isAuthenticated: true, isLoading: false });
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    }
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  updateUser: (updatedFields) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...updatedFields } : null,
    })),

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
