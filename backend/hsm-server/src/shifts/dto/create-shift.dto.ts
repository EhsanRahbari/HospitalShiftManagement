import {
  IsString,
  IsDateString,
  IsEnum,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { ShiftType, ShiftStatus } from '../../../generated/client';

export class CreateShiftDto {
  @IsUUID()
  userId: string;

  @IsString()
  title: string;

  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(ShiftType)
  shiftType?: ShiftType;

  @IsOptional()
  @IsEnum(ShiftStatus)
  status?: ShiftStatus;
}
