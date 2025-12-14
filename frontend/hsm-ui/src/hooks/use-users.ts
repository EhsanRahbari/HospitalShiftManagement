"use client";

import { useState } from "react";
import { usersApi } from "@/lib/api/users";
import { User } from "@/types/auth";
import {
  UsersResponse,
  UserStats,
  CreateUserRequest,
  UpdateUserRequest,
} from "@/types/user";
import { toast } from "sonner"; // ✅ Correct

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  const fetchUsers = async (params?: {
    page?: number;
    limit?: number;
    role?: string;
    isActive?: boolean;
    search?: string;
  }) => {
    setIsLoading(true);
    try {
      const response = await usersApi.getAll(params);
      setUsers(response.data);
      setMeta(response.meta);
    } catch (error: any) {
      toast.error("Failed to fetch users"); // ✅ Sonner toast
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await usersApi.getStats();
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const createUser = async (userData: CreateUserRequest) => {
    try {
      await usersApi.create(userData);
      toast.success("User created successfully"); // ✅ Sonner toast
      await fetchUsers();
      await fetchStats();
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to create user";
      toast.error(message); // ✅ Sonner toast
      throw error;
    }
  };

  const updateUser = async (id: string, userData: UpdateUserRequest) => {
    try {
      await usersApi.update(id, userData);
      toast.success("User updated successfully"); // ✅ Sonner toast
      await fetchUsers();
      await fetchStats();
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to update user";
      toast.error(message); // ✅ Sonner toast
      throw error;
    }
  };

  const deleteUser = async (id: string) => {
    try {
      await usersApi.delete(id);
      toast.success("User deactivated successfully"); // ✅ Sonner toast
      await fetchUsers();
      await fetchStats();
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to delete user";
      toast.error(message); // ✅ Sonner toast
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
