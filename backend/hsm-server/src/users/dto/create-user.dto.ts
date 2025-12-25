import {
  IsString,
  IsNotEmpty,
  IsEnum,
  MinLength,
  IsBoolean,
  IsOptional,
  ValidateIf,
} from 'class-validator';
import { Role } from '../../../generated/client';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsEnum(Role)
  role: Role;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  // ✅ ADD DEPARTMENT - Required for DOCTOR and NURSE
  @ValidateIf((o) => o.role !== 'ADMIN')
  @IsString()
  @IsNotEmpty({ message: 'Department is required for non-admin users' })
  department?: string;

  // ✅ ADD SECTION - Required for DOCTOR and NURSE
  @ValidateIf((o) => o.role !== 'ADMIN')
  @IsString()
  @IsNotEmpty({ message: 'Section is required for non-admin users' })
  section?: string;
}
