import { Role } from '../../../generated/client';

export class AuthResponseDto {
  accessToken!: string;
  user!: {
    id: string;
    username: string;
    role: Role;
    isActive: boolean;
  };
}
