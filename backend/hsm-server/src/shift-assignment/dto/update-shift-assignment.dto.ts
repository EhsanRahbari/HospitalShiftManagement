import { IsOptional, IsDateString } from 'class-validator';

export class UpdateShiftAssignmentDto {
  @IsOptional()
  @IsDateString()
  date?: string;
}
