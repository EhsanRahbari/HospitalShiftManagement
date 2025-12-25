import { Role } from '../../../generated/client';

export class UserResponseDto {
  id: string;
  username: string;
  role: Role;
  isActive: boolean;
  department?: string | null; // ✅ ADD THIS
  section?: string | null; // ✅ ADD THIS
  createdAt: Date;
  updatedAt: Date;
  createdBy?: {
    id: string;
    username: string;
  };
}
