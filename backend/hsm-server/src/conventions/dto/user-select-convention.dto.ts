import { IsArray, ArrayMinSize, IsString } from 'class-validator';

export class UserSelectConventionDto {
  @IsArray()
  @ArrayMinSize(1, {
    message: 'Please select at least one convention',
  })
  @IsString({ each: true })
  conventionIds: string[];
}
