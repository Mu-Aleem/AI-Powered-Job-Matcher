import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { LlmService } from '../embeddings/llm.service';
import { MatchedJobDto } from './dto/matched-job.dto';
import { MatchedCandidateDto } from './dto/matched-candidate.dto';
import { MatchFilterDto } from './dto/match-filter.dto';

@Injectable()
export class MatchingService {
  constructor(
    private supabaseService: SupabaseService,
    private llmService: LlmService,
  ) {}

  async findJobsForResume(
    userId: string,
    filter: MatchFilterDto = {},
  ): Promise<MatchedJobDto[]> {
    // 1. Get the user's resume
    const { data: resume, error: resumeError } = await this.supabaseService
      .getClient()
      .from('resumes')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (resumeError || !resume) {
      throw new NotFoundException(
        'No resume found. Please upload a resume first.',
      );
    }

    // 2. Check if embeddings exist
    const { count } = await this.supabaseService
      .getClient()
      .from('resume_embeddings')
      .select('id', { count: 'exact', head: true })
      .eq('resume_id', resume.id);

    if (!count || count === 0) {
      throw new NotFoundException(
        'Resume embeddings are still being generated. Please try again in a moment.',
      );
    }

    // 3. Vector search via RPC (fast, no LLM)
    const { data, error } = await this.supabaseService
      .getClient()
      .rpc('match_jobs_for_resume', {
        target_resume_id: resume.id,
        match_threshold: 0.62,
        match_count: filter.limit ?? 20,
        filter_experience_levels: filter.experience_levels?.length
          ? filter.experience_levels
          : null,
        filter_location: filter.location?.trim() || null,
        filter_salary_min: filter.salary_min ?? null,
        filter_title_keyword: filter.title?.trim() || null,
      });

    if (error) throw new Error(error.message);
    return (data || []) as MatchedJobDto[];
  }

  async explainMatch(
    userId: string,
    jobId: string,
  ): Promise<{ explanation: string }> {
    const sb = this.supabaseService.getClient();

    // Get user's resume
    const { data: resume, error: rErr } = await sb
      .from('resumes')
      .select('parsed_text')
      .eq('user_id', userId)
      .single();
    if (rErr || !resume?.parsed_text) {
      throw new NotFoundException(
        'No resume found. Please upload a resume first.',
      );
    }

    // Get the job
    const { data: job, error: jErr } = await sb
      .from('job_postings')
      .select('title, description, requirements')
      .eq('id', jobId)
      .single();
    if (jErr || !job) {
      throw new NotFoundException('Job posting not found');
    }

    const explanation = await this.llmService.explainJobMatch({
      resumeText: resume.parsed_text,
      jobTitle: job.title,
      jobDescription: job.description,
      jobRequirements: job.requirements || [],
    });

    return { explanation };
  }

  async findCandidatesForJob(
    jobId: string,
    employerId: string,
    limit: number = 20,
  ): Promise<MatchedCandidateDto[]> {
    // 1. Verify the job belongs to this employer
    const { data: job, error: jobError } = await this.supabaseService
      .getClient()
      .from('job_postings')
      .select('id')
      .eq('id', jobId)
      .eq('employer_id', employerId)
      .single();

    if (jobError || !job) {
      throw new NotFoundException(
        'Job posting not found or not owned by you',
      );
    }

    // 2. Check if job embedding exists
    const { count } = await this.supabaseService
      .getClient()
      .from('job_embeddings')
      .select('id', { count: 'exact', head: true })
      .eq('job_posting_id', jobId);

    if (!count || count === 0) {
      throw new NotFoundException(
        'Job embedding is still being generated. Please try again in a moment.',
      );
    }

    // 3. Call RPC function for similarity search (threshold 0.60 = 60% minimum match)
    const { data, error } = await this.supabaseService
      .getClient()
      .rpc('match_candidates_for_job', {
        target_job_id: jobId,
        match_threshold: 0.6,
        match_count: limit,
      });

    if (error) throw new Error(error.message);
    return (data || []) as MatchedCandidateDto[];
  }
}
