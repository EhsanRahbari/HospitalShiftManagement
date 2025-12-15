import { Role } from '../../types/role.type';

export class UserResponseDto {
  id!: string;
  username!: string;
  role!: Role;
  isActive!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
  createdBy?: {
    id: string;
    username: string;
  };
}
