import { IsOptional, IsDateString, IsString } from 'class-validator';

export class GetShiftAssignmentsDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  userId?: string;
}
