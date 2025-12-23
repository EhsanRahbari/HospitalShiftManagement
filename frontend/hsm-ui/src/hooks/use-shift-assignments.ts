import { create } from "zustand";
import { useAuthStore } from "@/store/auth-store";
import {
  ShiftAssignment,
  CreateShiftAssignmentData,
  GetShiftAssignmentsParams,
  BulkCreateResult,
} from "@/types/shift-assignment";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

interface ShiftAssignmentsState {
  assignments: ShiftAssignment[];
  isLoading: boolean;
  error: string | null;

  fetchAssignments: (params?: GetShiftAssignmentsParams) => Promise<void>;
  fetchMonthlyAssignments: (
    year: number,
    month: number,
    userId?: string
  ) => Promise<void>;
  createAssignment: (
    data: CreateShiftAssignmentData
  ) => Promise<ShiftAssignment>;
  bulkCreateAssignments: (
    assignments: CreateShiftAssignmentData[]
  ) => Promise<BulkCreateResult>;
  deleteAssignment: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useShiftAssignments = create<ShiftAssignmentsState>((set) => ({
  assignments: [],
  isLoading: false,
  error: null,

  fetchAssignments: async (params?: GetShiftAssignmentsParams) => {
    set({ isLoading: true, error: null });
    try {
      const { token } = useAuthStore.getState();
      if (!token) throw new Error("No authentication token");

      const queryParams = new URLSearchParams();
      if (params?.startDate) queryParams.append("startDate", params.startDate);
      if (params?.endDate) queryParams.append("endDate", params.endDate);
      if (params?.userId) queryParams.append("userId", params.userId);

      const url = `${API_URL}/shift-assignments${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch assignments");
      }

      const data = await response.json();
      set({ assignments: data, isLoading: false });
    } catch (error: any) {
      console.error("Fetch assignments error:", error);
      set({ error: error.message, isLoading: false, assignments: [] });
    }
  },

  fetchMonthlyAssignments: async (
    year: number,
    month: number,
    userId?: string
  ) => {
    set({ isLoading: true, error: null });
    try {
      const { token } = useAuthStore.getState();
      if (!token) {
        throw new Error("No authentication token");
      }

      const url = `${API_URL}/shift-assignments/monthly/${year}/${month}${
        userId ? `?userId=${userId}` : ""
      }`;

      console.log("Fetching monthly assignments:", url);

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch monthly assignments");
      }

      const data = await response.json();
      console.log("here's the data", { data });
      console.log("Monthly assignments received:", data.length);
      set({ assignments: data, isLoading: false });
    } catch (error: any) {
      console.error("Fetch monthly assignments error:", error);
      set({ error: error.message, isLoading: false, assignments: [] });
    }
  },

  createAssignment: async (data: CreateShiftAssignmentData) => {
    set({ isLoading: true, error: null });
    try {
      const { token } = useAuthStore.getState();
      if (!token) throw new Error("No authentication token");

      const response = await fetch(`${API_URL}/shift-assignments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create shift assignment");
      }

      const assignment = await response.json();
      set((state) => ({
        assignments: [...state.assignments, assignment],
        isLoading: false,
      }));

      return assignment;
    } catch (error: any) {
      console.error("Create assignment error:", error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  bulkCreateAssignments: async (assignments: CreateShiftAssignmentData[]) => {
    set({ isLoading: true, error: null });
    try {
      const { token } = useAuthStore.getState();
      if (!token) throw new Error("No authentication token");

      const response = await fetch(`${API_URL}/shift-assignments/bulk`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ assignments }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to bulk create assignments");
      }

      const result: BulkCreateResult = await response.json();

      if (result.successful.length > 0) {
        set((state) => ({
          assignments: [...state.assignments, ...result.successful],
        }));
      }

      set({ isLoading: false });
      return result;
    } catch (error: any) {
      console.error("Bulk create error:", error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  deleteAssignment: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const { token } = useAuthStore.getState();
      if (!token) throw new Error("No authentication token");

      const response = await fetch(`${API_URL}/shift-assignments/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete assignment");
      }

      set((state) => ({
        assignments: state.assignments.filter((a) => a.id !== id),
        isLoading: false,
      }));
    } catch (error: any) {
      console.error("Delete assignment error:", error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
