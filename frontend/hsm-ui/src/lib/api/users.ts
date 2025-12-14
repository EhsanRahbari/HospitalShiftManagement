import apiClient from "./client";
import {
  CreateUserRequest,
  UpdateUserRequest,
  UsersResponse,
  UserStats,
} from "@/types/user";
import { User } from "@/types/auth";

export const usersApi = {
  /**
   * Get all users with pagination and filters
   */
  getAll: async (params?: {
    page?: number;
    limit?: number;
    role?: string;
    isActive?: boolean;
    search?: string;
  }): Promise<UsersResponse> => {
    return apiClient.get<UsersResponse>("/users", { params });
  },

  /**
   * Get user by ID
   */
  getById: async (id: string): Promise<User> => {
    return apiClient.get<User>(`/users/${id}`);
  },

  /**
   * Create new user
   */
  create: async (userData: CreateUserRequest): Promise<User> => {
    return apiClient.post<User>("/users", userData);
  },

  /**
   * Update existing user
   */
  update: async (id: string, userData: UpdateUserRequest): Promise<User> => {
    return apiClient.patch<User>(`/users/${id}`, userData);
  },

  /**
   * Soft delete user (deactivate)
   */
  delete: async (id: string): Promise<{ message: string }> => {
    return apiClient.delete<{ message: string }>(`/users/${id}`);
  },

  /**
   * Hard delete user (permanent)
   */
  hardDelete: async (id: string): Promise<{ message: string }> => {
    return apiClient.delete<{ message: string }>(`/users/${id}/hard`);
  },

  /**
   * Get user statistics
   */
  getStats: async (): Promise<UserStats> => {
    return apiClient.get<UserStats>("/users/stats");
  },
};
