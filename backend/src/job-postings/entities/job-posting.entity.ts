import { ExperienceLevel } from '../../common/enums/experience-level.enum';

export interface JobPosting {
  id: string;
  employer_id: string;
  title: string;
  company: string;
  location: string;
  salary_min: number | null;
  salary_max: number | null;
  experience_level: ExperienceLevel;
  description: string;
  requirements: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
