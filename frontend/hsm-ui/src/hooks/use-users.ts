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
  getUser: (id: string) => Promise<User>;
  createUser: (userData: Partial<User>) => Promise<void>;
  updateUser: (id: string, userData: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;

  // New methods for shift assignments
  getAllUsers: () => Promise<User[]>;
  clearError: () => void;
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
      set({ error: error.message, isLoading: false, users: [] });
    }
  },

  // New: Get all users without pagination (for dropdowns/selects)
  getAllUsers: async () => {
    try {
      const { token } = useAuthStore.getState();

      if (!token) {
        console.log("❌ No token available for getAllUsers");
        throw new Error("No authentication token");
      }

      console.log("🔵 Fetching all users");

      // Fetch with high limit to get all users
      const response = await fetch(`${API_URL}/users?page=1&limit=1000`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("🔵 Get all users response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch users");
      }

      const data: PaginatedUsers = await response.json();
      console.log("✅ All users fetched:", data.data.length);

      // Update users in state but don't override pagination
      set((state) => ({
        users: data.data,
      }));

      return data.data;
    } catch (error: any) {
      console.error("❌ Error fetching all users:", error);
      throw error;
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

  getUser: async (id: string) => {
    try {
      const { token } = useAuthStore.getState();

      if (!token) {
        console.log("❌ No token available for getUser");
        throw new Error("No authentication token");
      }

      console.log("🔵 Fetching single user:", id);

      const response = await fetch(`${API_URL}/users/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("🔵 Get user response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ Get user error:", errorData);
        throw new Error(errorData.message || "Failed to fetch user");
      }

      const user: User = await response.json();
      console.log("✅ User data:", user);

      return user;
    } catch (error: any) {
      console.error("❌ Error fetching user:", error);
      throw error;
    }
  },

  createUser: async (userData) => {
    try {
      set({ isLoading: true, error: null });

      const { token } = useAuthStore.getState();
      if (!token) throw new Error("No authentication token");

      console.log("🔵 Creating user:", userData);

      const response = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      });

      console.log("🔵 Create user response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ Create user error:", errorData);
        throw new Error(errorData.message || "Failed to create user");
      }

      console.log("✅ User created successfully");

      const { pagination } = get();
      await get().fetchUsers(pagination?.page || 1);

      set({ isLoading: false });
    } catch (error: any) {
      console.error("❌ Error creating user:", error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  updateUser: async (id, userData) => {
    try {
      set({ isLoading: true, error: null });

      const { token } = useAuthStore.getState();
      if (!token) throw new Error("No authentication token");

      console.log("🔵 Updating user:", id, userData);

      const response = await fetch(`${API_URL}/users/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      });

      console.log("🔵 Update user response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ Update user error:", errorData);
        throw new Error(errorData.message || "Failed to update user");
      }

      console.log("✅ User updated successfully");

      const { pagination } = get();
      await get().fetchUsers(pagination?.page || 1);

      set({ isLoading: false });
    } catch (error: any) {
      console.error("❌ Error updating user:", error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  deleteUser: async (id) => {
    try {
      set({ isLoading: true, error: null });

      const { token } = useAuthStore.getState();
      if (!token) throw new Error("No authentication token");

      console.log("🔵 Deleting user:", id);

      const response = await fetch(`${API_URL}/users/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("🔵 Delete user response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ Delete user error:", errorData);
        throw new Error(errorData.message || "Failed to delete user");
      }

      console.log("✅ User deleted successfully");

      const { pagination } = get();
      await get().fetchUsers(pagination?.page || 1);

      set({ isLoading: false });
    } catch (error: any) {
      console.error("❌ Error deleting user:", error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
