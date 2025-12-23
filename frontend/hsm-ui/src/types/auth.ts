export type Role = "ADMIN" | "DOCTOR" | "NURSE";

export enum Roles {
  ADMIN = "ADMIN",
  DOCTOR = "DOCTOR",
  NURSE = "NURSE",
}

export interface User {
  id: string;
  username: string;
  role: Role;
  isActive: boolean;
  department?: string | null; // ✅ ADD THIS
  section?: string | null; // ✅ ADD THIS
  createdAt: string;
  updatedAt: string;
  createdBy?: {
    id: string;
    username: string;
  };
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}
