import {
  IsString,
  IsNotEmpty,
  IsArray,
  ArrayMinSize,
  MaxLength,
} from 'class-validator';

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsArray()
  @ArrayMinSize(1, { message: 'At least one department must be selected' })
  @IsString({ each: true })
  targetDepartments: string[];

  @IsArray()
  @IsString({ each: true })
  targetSections: string[];
}
