import { createContext, useContext, type ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { User } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

interface AuthContextType {
  user: User | null | undefined;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
  updateSettings: (settings: { startDate?: string; locationPreference?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  const { data: user, isLoading, isError, error } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (settings: { startDate?: string; locationPreference?: string }) => {
      return await apiRequest("PUT", "/api/user/settings", settings);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
  });

  const login = () => {
    // No-op for now - authentication is disabled
    console.log("Login not implemented - using demo user");
  };

  const logout = () => {
    // No-op for now - authentication is disabled
    console.log("Logout not implemented - using demo user");
  };

  const updateSettings = async (settings: { startDate?: string; locationPreference?: string }) => {
    await updateSettingsMutation.mutateAsync(settings);
  };

  // Check if the error is a 401 Unauthorized
  const is401Error = isError && error && isUnauthorizedError(error as Error);
  // Always treat as authenticated since we're using a demo user
  const isAuthenticated = true;

  const value: AuthContextType = {
    user: user ?? null,
    isLoading,
    isAuthenticated,
    login,
    logout,
    updateSettings,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
