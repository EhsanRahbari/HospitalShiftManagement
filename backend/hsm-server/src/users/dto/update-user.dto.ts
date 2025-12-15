import {
  IsString,
  IsOptional,
  MinLength,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { Role } from '../../types/role.type';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  username?: string;

  @IsString()
  @IsOptional()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password?: string;

  @IsEnum(['ADMIN', 'DOCTOR', 'NURSE'])
  @IsOptional()
  role?: Role;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
