export interface MatchedJobDto {
  job_posting_id: string;
  title: string;
  company: string;
  location: string;
  salary_min: number | null;
  salary_max: number | null;
  experience_level: string;
  description: string;
  requirements: string[];
  created_at: string;
  match_score: number;
  explanation?: string;
}
