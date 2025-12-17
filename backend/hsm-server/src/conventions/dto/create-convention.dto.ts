import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { ConventionType } from '../../../generated/client';

export class CreateConventionDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(ConventionType)
  @IsNotEmpty()
  type: ConventionType;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
