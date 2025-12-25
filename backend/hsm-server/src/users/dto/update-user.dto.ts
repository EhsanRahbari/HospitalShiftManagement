import {
  IsString,
  IsEnum,
  MinLength,
  IsBoolean,
  IsOptional,
} from 'class-validator';
import { Role } from '../../../generated/client';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  username?: string;

  @IsString()
  @MinLength(6)
  @IsOptional()
  password?: string;

  @IsEnum(Role)
  @IsOptional()
  role?: Role;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  // ✅ ADD THESE
  @IsString()
  @IsOptional()
  department?: string;

  @IsString()
  @IsOptional()
  section?: string;
}
