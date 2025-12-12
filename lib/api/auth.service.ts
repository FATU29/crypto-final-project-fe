import { apiClient } from "./client";
import { API_ENDPOINTS } from "@/config";
import type {
  LoginCredentials,
  RegisterData,
  AuthResponse,
  User,
} from "@/types";

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>(API_ENDPOINTS.auth.login, credentials);
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>(API_ENDPOINTS.auth.register, data);
  },

  async logout(): Promise<void> {
    return apiClient.post<void>(API_ENDPOINTS.auth.logout);
  },

  async getCurrentUser(): Promise<User> {
    return apiClient.get<User>(API_ENDPOINTS.auth.me);
  },

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>(API_ENDPOINTS.auth.refresh, {
      refreshToken,
    });
  },
};
