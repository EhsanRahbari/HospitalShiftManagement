import { IsString, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { ConventionType } from '../../../generated/client';

export class UpdateConventionDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(ConventionType)
  @IsOptional()
  type?: ConventionType;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
