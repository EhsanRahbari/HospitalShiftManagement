"use client";

import { useState } from "react";
import { User } from "@/types/auth";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth-store";

interface UserFilters {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  isActive?: boolean;
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

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

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [meta, setMeta] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useAuthStore();

  const getHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  });

  const fetchUsers = async (filters: UserFilters = {}) => {
    setIsLoading(true);
    try {
      console.log(
        "🔵 Fetching users with token:",
        token ? "Token exists" : "No token"
      );

      const params = new URLSearchParams();
      if (filters.page) params.append("page", filters.page.toString());
      if (filters.limit) params.append("limit", filters.limit.toString());
      if (filters.search) params.append("search", filters.search);
      if (filters.role) params.append("role", filters.role);
      if (filters.isActive !== undefined)
        params.append("isActive", filters.isActive.toString());

      const url = `http://localhost:3001/api/users?${params.toString()}`;
      console.log("🔵 Fetch URL:", url);

      const response = await fetch(url, {
        method: "GET",
        headers: getHeaders(),
      });

      console.log("🔵 Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("🔴 Error response:", errorData);
        throw new Error(errorData.message || "Failed to fetch users");
      }

      const data = await response.json();
      console.log("🔵 Users data received:", data);

      setUsers(data.data || data);
      if (data.meta) {
        setMeta(data.meta);
      }

      return data;
    } catch (error: any) {
      console.error("🔴 Fetch users error:", error);
      toast.error(error.message || "Failed to fetch users");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      console.log("🔵 Fetching stats...");

      const response = await fetch("http://localhost:3001/api/users/stats", {
        method: "GET",
        headers: getHeaders(),
      });

      console.log("🔵 Stats response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("🔴 Stats error response:", errorData);
        throw new Error(errorData.message || "Failed to fetch stats");
      }

      const data = await response.json();
      console.log("🔵 Stats data received:", data);

      setStats(data);
      return data;
    } catch (error: any) {
      console.error("🔴 Fetch stats error:", error);
      toast.error(error.message || "Failed to fetch statistics");
      throw error;
    }
  };

  const createUser = async (userData: {
    username: string;
    password: string;
    role: string;
    isActive: boolean;
  }) => {
    try {
      console.log("🔵 Creating user:", userData);

      const response = await fetch("http://localhost:3001/api/users", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(userData),
      });

      console.log("🔵 Create user response status:", response.status);

      if (!response.ok) {
        const error = await response.json();
        console.error("🔴 Create user error:", error);
        throw new Error(error.message || "Failed to create user");
      }

      const data = await response.json();
      console.log("🔵 User created:", data);

      toast.success("User created successfully");
      return data;
    } catch (error: any) {
      console.error("🔴 Create user error:", error);
      toast.error(error.message || "Failed to create user");
      throw error;
    }
  };

  const updateUser = async (
    id: string,
    userData: {
      username?: string;
      password?: string;
      role?: string;
      isActive?: boolean;
    }
  ) => {
    try {
      console.log("🔵 Updating user:", id, userData);

      const response = await fetch(`http://localhost:3001/api/users/${id}`, {
        method: "PATCH",
        headers: getHeaders(),
        body: JSON.stringify(userData),
      });

      console.log("🔵 Update user response status:", response.status);

      if (!response.ok) {
        const error = await response.json();
        console.error("🔴 Update user error:", error);
        throw new Error(error.message || "Failed to update user");
      }

      const data = await response.json();
      console.log("🔵 User updated:", data);

      toast.success("User updated successfully");
      return data;
    } catch (error: any) {
      console.error("🔴 Update user error:", error);
      toast.error(error.message || "Failed to update user");
      throw error;
    }
  };

  const deleteUser = async (id: string) => {
    try {
      console.log("🔵 Deleting user:", id);

      const response = await fetch(`http://localhost:3001/api/users/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });

      console.log("🔵 Delete user response status:", response.status);

      if (!response.ok) {
        const error = await response.json();
        console.error("🔴 Delete user error:", error);
        throw new Error(error.message || "Failed to delete user");
      }

      toast.success("User deleted successfully");
    } catch (error: any) {
      console.error("🔴 Delete user error:", error);
      toast.error(error.message || "Failed to delete user");
      throw error;
    }
  };

  return {
    users,
    stats,
    meta,
    isLoading,
    fetchUsers,
    fetchStats,
    createUser,
    updateUser,
    deleteUser,
  };
}
