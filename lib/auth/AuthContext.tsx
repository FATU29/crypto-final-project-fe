"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "./utils";
import { authService } from "@/lib/api";
import type { LoginCredentials, RegisterData, AuthState } from "@/types";
import { config } from "@/config";

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });
  const router = useRouter();

  useEffect(() => {
    // Initialize auth state
    const initAuth = async () => {
      const token = auth.getToken();
      const user = auth.getUser();

      if (token && user) {
        try {
          // Verify token is still valid
          const currentUser = await authService.getCurrentUser();
          setState({
            user: currentUser,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch {
          // Token invalid, clear auth
          auth.clearAuth();
          setState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      } else {
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      }
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      const response = await authService.login(credentials);

      auth.setTokens(response.tokens);
      auth.setUser(response.user);

      setState({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      router.push(config.routes.authRedirect);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed";
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      const response = await authService.register(data);

      auth.setTokens(response.tokens);
      auth.setUser(response.user);

      setState({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      router.push(config.routes.authRedirect);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Registration failed";
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      auth.clearAuth();
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
      router.push(config.routes.loginRedirect);
    }
  };

  const refreshUser = async () => {
    try {
      const user = await authService.getCurrentUser();
      auth.setUser(user);
      setState((prev) => ({ ...prev, user }));
    } catch (error) {
      console.error("Failed to refresh user:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
