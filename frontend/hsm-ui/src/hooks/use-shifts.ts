"use client";

import { create } from "zustand";
import { useAuthStore } from "@/store/auth-store";
import {
  Shift,
  ShiftStats,
  CreateShiftData,
  UpdateShiftData,
} from "@/types/shift";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

interface PaginatedShifts {
  data: Shift[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface ShiftsState {
  shifts: Shift[];
  stats: ShiftStats | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } | null;
  isLoading: boolean;
  error: string | null;

  // Existing methods
  fetchShifts: (page?: number, limit?: number, filters?: any) => Promise<void>;
  fetchStats: (userId?: string) => Promise<void>;
  createShift: (shiftData: CreateShiftData) => Promise<void>;
  updateShift: (id: string, shiftData: UpdateShiftData) => Promise<void>;
  deleteShift: (id: string) => Promise<void>;

  // New methods for shift assignments
  getAllShifts: () => Promise<Shift[]>;
  clearError: () => void;
}

export const useShifts = create<ShiftsState>((set, get) => ({
  shifts: [],
  stats: null,
  pagination: null,
  isLoading: false,
  error: null,

  fetchShifts: async (page = 1, limit = 10, filters = {}) => {
    try {
      set({ isLoading: true, error: null });

      const { token } = useAuthStore.getState();

      if (!token) {
        console.log("❌ No token available");
        set({ isLoading: false, error: "No authentication token" });
        return;
      }

      console.log("🔵 Fetching shifts - Page:", page, "Limit:", limit);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...filters,
      });

      const url = `${API_URL}/shifts?${params.toString()}`;
      console.log("🔵 Fetch URL:", url);

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("🔵 Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch shifts");
      }

      const data: PaginatedShifts = await response.json();
      console.log("✅ Shifts data:", data);

      set({
        shifts: data.data || [],
        pagination: data.meta || {
          total: data.data?.length || 0,
          page: page,
          limit: limit,
          totalPages: Math.ceil((data.data?.length || 0) / limit),
        },
        isLoading: false,
      });
    } catch (error: any) {
      console.error("❌ Error fetching shifts:", error);
      set({ error: error.message, isLoading: false, shifts: [] });
    }
  },

  // New: Get all shifts without pagination (for dropdowns/selects)
  getAllShifts: async () => {
    try {
      const { token } = useAuthStore.getState();

      if (!token) {
        console.log("❌ No token available for getAllShifts");
        throw new Error("No authentication token");
      }

      console.log("🔵 Fetching all shifts");

      // Fetch with high limit to get all shifts
      const response = await fetch(`${API_URL}/shifts?page=1&limit=1000`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("🔵 Get all shifts response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch shifts");
      }

      const data: PaginatedShifts = await response.json();
      console.log("✅ All shifts fetched:", data.data.length);

      // Update shifts in state but don't override pagination
      set((state) => ({
        shifts: data.data || [],
      }));

      return data.data || [];
    } catch (error: any) {
      console.error("❌ Error fetching all shifts:", error);
      throw error;
    }
  },

  fetchStats: async (userId?: string) => {
    try {
      set({ isLoading: true, error: null });

      const { token } = useAuthStore.getState();

      if (!token) {
        console.log("❌ No token available for stats");
        set({ isLoading: false, error: "No authentication token" });
        return;
      }

      console.log("🔵 Fetching shift stats");

      const url = userId
        ? `${API_URL}/shifts/stats?userId=${userId}`
        : `${API_URL}/shifts/stats`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("🔵 Stats response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch stats");
      }

      const data: ShiftStats = await response.json();
      console.log("✅ Stats data:", data);

      set({ stats: data, isLoading: false });
    } catch (error: any) {
      console.error("❌ Error fetching stats:", error);
      set({ error: error.message, isLoading: false, stats: null });
    }
  },

  createShift: async (shiftData: CreateShiftData) => {
    try {
      set({ isLoading: true, error: null });

      const { token } = useAuthStore.getState();
      if (!token) throw new Error("No authentication token");

      console.log("🔵 Creating shift:", shiftData);

      const response = await fetch(`${API_URL}/shifts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(shiftData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create shift");
      }

      console.log("✅ Shift created successfully");

      // Refresh shifts list
      const { pagination } = get();
      await get().fetchShifts(pagination?.page || 1);

      set({ isLoading: false });
    } catch (error: any) {
      console.error("❌ Error creating shift:", error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  updateShift: async (id: string, shiftData: UpdateShiftData) => {
    try {
      set({ isLoading: true, error: null });

      const { token } = useAuthStore.getState();
      if (!token) throw new Error("No authentication token");

      console.log("🔵 Updating shift:", id, shiftData);

      const response = await fetch(`${API_URL}/shifts/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(shiftData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update shift");
      }

      console.log("✅ Shift updated successfully");

      // Refresh shifts list
      const { pagination } = get();
      await get().fetchShifts(pagination?.page || 1);

      set({ isLoading: false });
    } catch (error: any) {
      console.error("❌ Error updating shift:", error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  deleteShift: async (id: string) => {
    try {
      set({ isLoading: true, error: null });

      const { token } = useAuthStore.getState();
      if (!token) throw new Error("No authentication token");

      console.log("🔵 Deleting shift:", id);

      const response = await fetch(`${API_URL}/shifts/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete shift");
      }

      console.log("✅ Shift deleted successfully");

      // Refresh shifts list
      const { pagination } = get();
      await get().fetchShifts(pagination?.page || 1);

      set({ isLoading: false });
    } catch (error: any) {
      console.error("❌ Error deleting shift:", error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
