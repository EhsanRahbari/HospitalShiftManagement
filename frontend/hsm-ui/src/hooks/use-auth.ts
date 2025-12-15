"use client";

import { useAuthStore } from "@/store/auth-store";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function useAuth() {
  const router = useRouter();
  const { setAuth, clearAuth } = useAuthStore();

  const login = async (username: string, password: string) => {
    try {
      console.log("🔵 Attempting login...");

      const response = await fetch("http://localhost:3001/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      console.log("🔵 Response status:", response.status);

      const data = await response.json();
      console.log("🔵 Response data:", data);

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Backend returns 'accessToken' not 'token'
      if (!data.user || !data.accessToken) {
        throw new Error("No user or token received from server");
      }

      console.log("🔵 Setting auth with user and token");
      setAuth(data.user, data.accessToken); // Use accessToken here

      toast.success("Login successful!");

      setTimeout(() => {
        router.push("/dashboard");
      }, 100);

      return data;
    } catch (error: any) {
      console.error("🔴 Login error:", error);
      toast.error(error.message || "Login failed");
      throw error;
    }
  };

  const logout = async () => {
    try {
      clearAuth();
      toast.success("Logged out successfully");
      router.push("/auth/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed");
    }
  };

  return {
    login,
    logout,
  };
}
