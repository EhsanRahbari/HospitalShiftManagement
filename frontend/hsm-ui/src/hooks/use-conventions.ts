"use client";

import { create } from "zustand";
import { useAuthStore } from "@/store/auth-store";
import {
  Convention,
  ConventionStats,
  CreateConventionData,
  UpdateConventionData,
  AssignConventionData,
  UserConvention,
} from "@/types/convention";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

interface PaginatedConventions {
  data: Convention[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface ConventionsState {
  conventions: Convention[];
  stats: ConventionStats | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } | null;
  isLoading: boolean;
  error: string | null;
  fetchConventions: (
    page?: number,
    limit?: number,
    filters?: any
  ) => Promise<void>;
  fetchStats: () => Promise<void>;
  createConvention: (data: CreateConventionData) => Promise<void>;
  updateConvention: (id: string, data: UpdateConventionData) => Promise<void>;
  deleteConvention: (id: string) => Promise<void>;
  assignConventionsToUser: (
    userId: string,
    data: AssignConventionData
  ) => Promise<void>;
  removeConventionFromUser: (
    userId: string,
    conventionId: string
  ) => Promise<void>;
  getUserConventions: (userId: string) => Promise<UserConvention[]>;
}

export const useConventions = create<ConventionsState>((set, get) => ({
  conventions: [],
  stats: null,
  pagination: null,
  isLoading: false,
  error: null,

  fetchConventions: async (page = 1, limit = 10, filters = {}) => {
    try {
      set({ isLoading: true, error: null });

      const { token } = useAuthStore.getState();

      if (!token) {
        console.log("❌ No token available");
        set({ isLoading: false, error: "No authentication token" });
        return;
      }

      console.log("🔵 Fetching conventions - Page:", page, "Limit:", limit);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...filters,
      });

      const url = `${API_URL}/conventions?${params.toString()}`;
      console.log("🔵 Fetch URL:", url);

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("🔵 Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch conventions");
      }

      const data: PaginatedConventions = await response.json();
      console.log("✅ Conventions data:", data);

      set({
        conventions: data.data || [],
        pagination: data.meta || {
          total: data.data?.length || 0,
          page: page,
          limit: limit,
          totalPages: Math.ceil((data.data?.length || 0) / limit),
        },
        isLoading: false,
      });
    } catch (error: any) {
      console.error("❌ Error fetching conventions:", error);
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

      console.log("🔵 Fetching convention stats");

      const response = await fetch(`${API_URL}/conventions/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("🔵 Stats response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch stats");
      }

      const data: ConventionStats = await response.json();
      console.log("✅ Stats data:", data);

      set({ stats: data, isLoading: false });
    } catch (error: any) {
      console.error("❌ Error fetching stats:", error);
      set({ error: error.message, isLoading: false, stats: null });
    }
  },

  createConvention: async (conventionData: CreateConventionData) => {
    try {
      const { token } = useAuthStore.getState();
      if (!token) throw new Error("No authentication token");

      console.log("🔵 Creating convention:", conventionData);

      const response = await fetch(`${API_URL}/conventions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(conventionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create convention");
      }

      console.log("✅ Convention created successfully");

      // Refresh conventions list
      const { pagination } = get();
      await get().fetchConventions(pagination?.page || 1);
    } catch (error: any) {
      console.error("❌ Error creating convention:", error);
      set({ error: error.message });
      throw error;
    }
  },

  updateConvention: async (
    id: string,
    conventionData: UpdateConventionData
  ) => {
    try {
      const { token } = useAuthStore.getState();
      if (!token) throw new Error("No authentication token");

      console.log("🔵 Updating convention:", id, conventionData);

      const response = await fetch(`${API_URL}/conventions/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(conventionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update convention");
      }

      console.log("✅ Convention updated successfully");

      // Refresh conventions list
      const { pagination } = get();
      await get().fetchConventions(pagination?.page || 1);
    } catch (error: any) {
      console.error("❌ Error updating convention:", error);
      set({ error: error.message });
      throw error;
    }
  },

  deleteConvention: async (id: string) => {
    try {
      const { token } = useAuthStore.getState();
      if (!token) throw new Error("No authentication token");

      console.log("🔵 Deleting convention:", id);

      const response = await fetch(`${API_URL}/conventions/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete convention");
      }

      console.log("✅ Convention deleted successfully");

      // Refresh conventions list
      const { pagination } = get();
      await get().fetchConventions(pagination?.page || 1);
    } catch (error: any) {
      console.error("❌ Error deleting convention:", error);
      set({ error: error.message });
      throw error;
    }
  },

  assignConventionsToUser: async (
    userId: string,
    data: AssignConventionData
  ) => {
    try {
      const { token } = useAuthStore.getState();
      if (!token) throw new Error("No authentication token");

      console.log("🔵 Assigning conventions to user:", userId, data);

      const response = await fetch(
        `${API_URL}/conventions/users/${userId}/assign`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to assign conventions");
      }

      console.log("✅ Conventions assigned successfully");
    } catch (error: any) {
      console.error("❌ Error assigning conventions:", error);
      set({ error: error.message });
      throw error;
    }
  },

  removeConventionFromUser: async (userId: string, conventionId: string) => {
    try {
      const { token } = useAuthStore.getState();
      if (!token) throw new Error("No authentication token");

      console.log("🔵 Removing convention from user:", userId, conventionId);

      const response = await fetch(
        `${API_URL}/conventions/users/${userId}/remove/${conventionId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to remove convention");
      }

      console.log("✅ Convention removed successfully");
    } catch (error: any) {
      console.error("❌ Error removing convention:", error);
      set({ error: error.message });
      throw error;
    }
  },

  getUserConventions: async (userId: string): Promise<UserConvention[]> => {
    try {
      const { token } = useAuthStore.getState();
      if (!token) throw new Error("No authentication token");

      console.log("🔵 Fetching conventions for user:", userId);

      const response = await fetch(`${API_URL}/conventions/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to fetch user conventions"
        );
      }

      const data: UserConvention[] = await response.json();
      console.log("✅ User conventions fetched:", data);

      return data;
    } catch (error: any) {
      console.error("❌ Error fetching user conventions:", error);
      throw error;
    }
  },
}));
