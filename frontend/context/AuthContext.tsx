"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { apiClient } from "../lib/api";

export type AuthUser = {
  id: string;
  email: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadCurrentUser() {
      try {
        const response = await apiClient.get<AuthUser>("/auth/me");
        setUser(response.data);
        setIsAuthenticated(true);
      } catch (_error) {
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    }

    void loadCurrentUser();
  }, []);

  async function login(email: string, password: string) {
    await apiClient.post("/auth/login", { email, password });
    const response = await apiClient.get<AuthUser>("/auth/me");
    setUser(response.data);
    setIsAuthenticated(true);
  }

  async function register(email: string, password: string) {
    await apiClient.post("/auth/register", { email, password });
    setUser(null);
    setIsAuthenticated(false);
  }

  async function logout() {
    await apiClient.post("/auth/logout");
    setUser(null);
    setIsAuthenticated(false);
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
