import {
  IsString,
  IsOptional,
  IsInt,
  IsEnum,
  IsArray,
  Min,
} from 'class-validator';
import { ExperienceLevel } from '../../common/enums/experience-level.enum';

export class CreateJobPostingDto {
  @IsString()
  title: string;

  @IsString()
  company: string;

  @IsString()
  location: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  salary_min?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  salary_max?: number;

  @IsEnum(ExperienceLevel)
  experience_level: ExperienceLevel;

  @IsString()
  description: string;

  @IsArray()
  @IsString({ each: true })
  requirements: string[];
}
