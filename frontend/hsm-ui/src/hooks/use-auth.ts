// src/hooks/use-auth.ts

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import { authApi } from "@/lib/api/auth";
import { LoginRequest } from "@/types/auth";
import { toast } from "sonner";

export function useAuth() {
  const router = useRouter();
  const { user, token, isAuthenticated, setAuth, clearAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const login = async (credentials: LoginRequest) => {
    setIsLoading(true);
    try {
      const response = await authApi.login(credentials);
      setAuth(response.user, response.accessToken);
      toast.success("Login successful!");
      router.push("/dashboard");
      return response;
    } catch (error: any) {
      const message = error.message || "Invalid credentials";
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    clearAuth();
    router.push("/login");
    toast.success("Logged out successfully");
  };

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout,
  };
}
