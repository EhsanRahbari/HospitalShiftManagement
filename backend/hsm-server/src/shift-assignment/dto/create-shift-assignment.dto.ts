import { IsNotEmpty, IsString, IsDateString } from 'class-validator';

export class CreateShiftAssignmentDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsString()
  shiftId: string;

  @IsNotEmpty()
  @IsDateString()
  date: string;
}
