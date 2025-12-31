import { apiClient } from "./client";
import { API_ENDPOINTS } from "@/config";
import type {
  LoginCredentials,
  RegisterData,
  AuthResponse,
  User,
  ApiResponse,
  BackendAuthResponse,
} from "@/types";

// Transform backend auth response to frontend format
const transformAuthResponse = (
  backendResponse: ApiResponse<BackendAuthResponse>
): AuthResponse => {
  if (!backendResponse.success || !backendResponse.data) {
    throw new Error(backendResponse.message || "Authentication failed");
  }

  const { data } = backendResponse;
  const { user: backendUser, accessToken, refreshToken, tokenType, expiresIn } = data;

  return {
    user: {
      id: backendUser.id,
      email: backendUser.email,
      firstName: backendUser.firstName,
      lastName: backendUser.lastName,
    },
    tokens: {
      accessToken,
      refreshToken,
      tokenType,
      expiresIn,
    },
  };
};

// Transform backend user profile to frontend User format
const transformUserProfile = (
  backendResponse: ApiResponse<User>
): User => {
  if (!backendResponse.success || !backendResponse.data) {
    throw new Error(backendResponse.message || "Failed to get user profile");
  }

  return backendResponse.data;
};

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<BackendAuthResponse>>(
      API_ENDPOINTS.auth.login,
      credentials
    );
    return transformAuthResponse(response);
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<BackendAuthResponse>>(
      API_ENDPOINTS.auth.register,
      data
    );
    return transformAuthResponse(response);
  },

  async logout(): Promise<void> {
    await apiClient.post<ApiResponse<void>>(API_ENDPOINTS.auth.logout);
  },

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>(
      API_ENDPOINTS.auth.me
    );
    return transformUserProfile(response);
  },

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<BackendAuthResponse>>(
      API_ENDPOINTS.auth.refresh,
      { refreshToken }
    );
    return transformAuthResponse(response);
  },

  async changePassword(data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<void> {
    await apiClient.post<ApiResponse<void>>(
      API_ENDPOINTS.auth.changePassword,
      data
    );
  },
};
