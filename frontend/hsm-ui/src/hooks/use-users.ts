"use client";

import { create } from "zustand";
import { useAuthStore } from "@/store/auth-store";
import { User } from "@/types/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

interface UserStats {
  total: number;
  active: number;
  inactive: number;
  byRole: {
    admin: number;
    doctor: number;
    nurse: number;
  };
}

interface PaginatedUsers {
  data: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface UsersState {
  users: User[];
  stats: UserStats | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } | null;
  isLoading: boolean;
  error: string | null;
  fetchUsers: (page?: number, limit?: number) => Promise<void>;
  fetchStats: () => Promise<void>;
  createUser: (userData: Partial<User>) => Promise<void>;
  updateUser: (id: string, userData: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
}

export const useUsers = create<UsersState>((set, get) => ({
  users: [],
  stats: null,
  pagination: null,
  isLoading: false,
  error: null,

  fetchUsers: async (page = 1, limit = 10) => {
    try {
      set({ isLoading: true, error: null });

      const { token } = useAuthStore.getState();

      if (!token) {
        console.log("❌ No token available");
        set({ isLoading: false, error: "No authentication token" });
        return;
      }

      console.log("🔵 Fetching users - page:", page, "limit:", limit);

      const url = `${API_URL}/users?page=${page}&limit=${limit}`;
      console.log("🔵 Fetch URL:", url);

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("🔵 Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch users");
      }

      const data: PaginatedUsers = await response.json();
      console.log("✅ Users data:", data);

      set({
        users: data.data,
        pagination: {
          total: data.total,
          page: data.page,
          limit: data.limit,
          totalPages: data.totalPages,
        },
        isLoading: false,
      });
    } catch (error: any) {
      console.error("❌ Error fetching users:", error);
      set({ error: error.message, isLoading: false });
    }
  },

  fetchStats: async () => {
    try {
      set({ isLoading: true, error: null });

      const { token } = useAuthStore.getState();

      if (!token) {
        console.log("❌ No token available for stats");
        set({ isLoading: false, error: "No authentication token" });
        return;
      }

      console.log("🔵 Fetching stats with token");

      const response = await fetch(`${API_URL}/users/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("🔵 Stats response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ Stats error:", errorData);
        throw new Error(errorData.message || "Failed to fetch stats");
      }

      const data: UserStats = await response.json();
      console.log("✅ Stats data:", data);

      set({ stats: data, isLoading: false });
    } catch (error: any) {
      console.error("❌ Error fetching stats:", error);
      set({ error: error.message, isLoading: false, stats: null });
    }
  },

  createUser: async (userData) => {
    try {
      const { token } = useAuthStore.getState();
      if (!token) throw new Error("No authentication token");

      const response = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create user");
      }

      await get().fetchUsers();
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  updateUser: async (id, userData) => {
    try {
      const { token } = useAuthStore.getState();
      if (!token) throw new Error("No authentication token");

      const response = await fetch(`${API_URL}/users/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update user");
      }

      await get().fetchUsers();
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  deleteUser: async (id) => {
    try {
      const { token } = useAuthStore.getState();
      if (!token) throw new Error("No authentication token");

      const response = await fetch(`${API_URL}/users/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete user");
      }

      await get().fetchUsers();
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },
}));
