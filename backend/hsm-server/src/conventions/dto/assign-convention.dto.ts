import { IsString, IsNotEmpty, IsArray, ArrayMinSize } from 'class-validator';

export class AssignConventionDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  conventionIds: string[];
}

export class RemoveConventionDto {
  @IsString()
  @IsNotEmpty()
  conventionId: string;
}
