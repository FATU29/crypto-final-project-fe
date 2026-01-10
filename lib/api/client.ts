import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from "axios";
import { config } from "@/config";
import { getHttpErrorMessage } from "@/lib/utils/error-handler";

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: config.api.baseUrl,
      timeout: config.api.timeout,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & {
          _retry?: boolean;
        };

        // Handle 401 errors - token refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = this.getRefreshToken();
            if (refreshToken) {
              // Call refresh token endpoint directly (avoids circular dependency)
              // Following integration guide pattern
              const { data } = await axios.post<{
                success: boolean;
                message?: string;
                data: {
                  accessToken: string;
                  refreshToken: string;
                  tokenType: string;
                  expiresIn: number;
                };
              }>(
                `${config.api.baseUrl}/api/v1/auth/refresh-token`,
                { refreshToken },
                {
                  headers: {
                    "Content-Type": "application/json",
                  },
                }
              );

              if (data.success && data.data) {
                // Update tokens
                this.setToken(data.data.accessToken);
                if (typeof window !== "undefined") {
                  localStorage.setItem(
                    config.auth.refreshTokenKey,
                    data.data.refreshToken
                  );
                }

                // Retry original request with new token
                if (originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
                }
                return this.client(originalRequest);
              }
            }
          } catch (refreshError) {
            // Refresh failed, clear auth and redirect to login
            this.clearAuth();
            if (typeof window !== "undefined") {
              window.location.href = config.routes.loginRedirect;
            }
            return Promise.reject(refreshError);
          }
        }

        // Handle other error status codes according to integration guide
        // 400: Bad Request, 403: Forbidden, 404: Not Found, 503: Service Unavailable
        if (error.response) {
          const status = error.response.status;
          const errorData = error.response.data as {
            message?: string;
            error?: string;
            detail?: string;
          };

          // Build user-friendly error message in English
          let errorMessage: string;

          // Special handling for authentication errors
          if (status === 401) {
            const originalMessage =
              errorData?.message || errorData?.detail || errorData?.error || "";

            if (
              originalMessage.includes("Missing") &&
              originalMessage.includes("Authorization")
            ) {
              errorMessage = "Please log in to access this feature";
            } else if (
              originalMessage.includes("invalid") &&
              originalMessage.includes("token")
            ) {
              errorMessage = "Your session has expired. Please log in again";
            } else if (originalMessage.includes("expired")) {
              errorMessage = "Your session has expired. Please log in again";
            } else {
              errorMessage =
                originalMessage ||
                "Authentication required. Please log in to continue";
            }
          } else if (errorData?.message) {
            errorMessage = errorData.message;
          } else if (errorData?.detail) {
            errorMessage = errorData.detail;
          } else if (errorData?.error) {
            errorMessage = errorData.error;
          } else {
            // Use utility function to get standard error message
            errorMessage = getHttpErrorMessage(
              status,
              error.response.statusText
            );
          }

          // Override error message with user-friendly version
          error.message = errorMessage;
        } else if (error.request) {
          // Network error
          error.message =
            "Network error: Unable to connect to server. Please check your internet connection";
        }

        return Promise.reject(error);
      }
    );
  }

  private getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(config.auth.tokenKey);
  }

  private getRefreshToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(config.auth.refreshTokenKey);
  }

  private setToken(token: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(config.auth.tokenKey, token);
    }
  }

  private clearAuth(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(config.auth.tokenKey);
      localStorage.removeItem(config.auth.refreshTokenKey);
      localStorage.removeItem(config.auth.userKey);
    }
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async patch<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }
}

export const apiClient = new ApiClient();
