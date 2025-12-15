import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@/types/auth";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user, token) => {
        console.log("🔐 setAuth called:", { 
          username: user.username, 
          role: user.role,
          hasToken: !!token 
        });
        
        set({ 
          user, 
          token, 
          isAuthenticated: true 
        });
      },

      clearAuth: () => {
        console.log("🚪 Clearing auth");
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    {
      name: "auth-storage",
    }
  )
);