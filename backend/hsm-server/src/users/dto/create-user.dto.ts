import {
  IsString,
  IsNotEmpty,
  MinLength,
  IsEnum,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { Role } from '../../types/role.type';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  username!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password!: string;

  @IsEnum(['ADMIN', 'DOCTOR', 'NURSE'])
  @IsNotEmpty()
  role!: Role;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
