import { Role } from '../../../generated/client';

export class AuthResponseDto {
  access_token!: string;
  user!: {
    id: string;
    username: string;
    role: Role;
    isActive: boolean;
  };
}
