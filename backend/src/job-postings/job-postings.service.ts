import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateJobPostingDto } from './dto/create-job-posting.dto';
import { UpdateJobPostingDto } from './dto/update-job-posting.dto';
import { JobPosting } from './entities/job-posting.entity';

@Injectable()
export class JobPostingsService {
  constructor(private supabaseService: SupabaseService) {}

  async create(
    employerId: string,
    dto: CreateJobPostingDto,
  ): Promise<JobPosting> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('job_postings')
      .insert({ ...dto, employer_id: employerId })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as JobPosting;
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: JobPosting[]; total: number }> {
    const offset = (page - 1) * limit;

    const { data, error, count } = await this.supabaseService
      .getClient()
      .from('job_postings')
      .select('*', { count: 'exact' })
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw new Error(error.message);
    return { data: (data as JobPosting[]) || [], total: count || 0 };
  }

  async findOne(id: string): Promise<JobPosting> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('job_postings')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) throw new NotFoundException('Job posting not found');
    return data as JobPosting;
  }

  async findByEmployer(employerId: string): Promise<JobPosting[]> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('job_postings')
      .select('*')
      .eq('employer_id', employerId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data as JobPosting[]) || [];
  }

  async update(
    id: string,
    employerId: string,
    dto: UpdateJobPostingDto,
  ): Promise<JobPosting> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('job_postings')
      .update({ ...dto, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('employer_id', employerId)
      .select()
      .single();

    if (error || !data)
      throw new NotFoundException('Job posting not found or not owned by you');
    return data as JobPosting;
  }

  async remove(id: string, employerId: string): Promise<void> {
    const { error, count } = await this.supabaseService
      .getClient()
      .from('job_postings')
      .delete({ count: 'exact' })
      .eq('id', id)
      .eq('employer_id', employerId);

    if (error) throw new Error(error.message);
    if (count === 0)
      throw new NotFoundException('Job posting not found or not owned by you');
  }
}
