import { Role, User } from "./auth";

export interface CreateUserRequest {
  username: string;
  password: string;
  role: Role;
  isActive?: boolean;
}

export interface UpdateUserRequest {
  username?: string;
  password?: string;
  role?: Role;
  isActive?: boolean;
}

export interface UsersResponse {
  data: User[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  byRole: {
    admin: number;
    doctor: number;
    nurse: number;
  };
}
