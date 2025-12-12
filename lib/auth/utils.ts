import { config } from "@/config";
import type { User, AuthTokens } from "@/types";

export const auth = {
  setTokens(tokens: AuthTokens): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(config.auth.tokenKey, tokens.accessToken);
    localStorage.setItem(config.auth.refreshTokenKey, tokens.refreshToken);
  },

  getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(config.auth.tokenKey);
  },

  getRefreshToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(config.auth.refreshTokenKey);
  },

  setUser(user: User): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(config.auth.userKey, JSON.stringify(user));
  },

  getUser(): User | null {
    if (typeof window === "undefined") return null;
    const userData = localStorage.getItem(config.auth.userKey);
    if (!userData) return null;
    try {
      return JSON.parse(userData);
    } catch {
      return null;
    }
  },

  clearAuth(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(config.auth.tokenKey);
    localStorage.removeItem(config.auth.refreshTokenKey);
    localStorage.removeItem(config.auth.userKey);
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};
