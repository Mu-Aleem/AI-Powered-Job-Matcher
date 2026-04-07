import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { SupabaseService } from '../supabase/supabase.service';
import { ChunkingService } from './chunking.service';
import { ResumeChunk } from './entities/resume-chunk.entity';

@Injectable()
export class EmbeddingService {
  private ollama: OpenAI;
  private model: string;
  private readonly logger = new Logger(EmbeddingService.name);

  constructor(
    private supabaseService: SupabaseService,
    private configService: ConfigService,
    private chunkingService: ChunkingService,
  ) {
    this.ollama = new OpenAI({
      baseURL: this.configService.get<string>('OLLAMA_URL') || 'http://localhost:11434/v1',
      apiKey: 'ollama', // Ollama doesn't need a real key
    });
    this.model = this.configService.get<string>('EMBEDDING_MODEL') || 'nomic-embed-text';
  }

  async generateResumeEmbeddings(
    resumeId: string,
    parsedText: string,
  ): Promise<void> {
    // 1. Delete existing chunks (cascade deletes embeddings)
    await this.supabaseService
      .getClient()
      .from('resume_chunks')
      .delete()
      .eq('resume_id', resumeId);

    // 2. Chunk the resume text
    const chunks = this.chunkingService.chunkResume(parsedText);
    if (chunks.length === 0) return;

    // 3. Insert chunks into DB
    const chunkRows = chunks.map((chunk, index) => ({
      resume_id: resumeId,
      section_type: chunk.section_type,
      content: chunk.content,
      chunk_index: index,
    }));

    const { data: insertedChunks, error: chunkError } =
      await this.supabaseService
        .getClient()
        .from('resume_chunks')
        .insert(chunkRows)
        .select();

    if (chunkError || !insertedChunks) {
      this.logger.error('Failed to insert resume chunks:', chunkError?.message);
      return;
    }

    // 4. Generate embeddings for each chunk
    const typedChunks = insertedChunks as ResumeChunk[];
    const embeddings = await this.getEmbeddings(typedChunks.map((c) => c.content));
    if (!embeddings) return;

    // 5. Store embeddings
    const embeddingRows = typedChunks.map((chunk, i) => ({
      chunk_id: chunk.id,
      resume_id: resumeId,
      embedding: JSON.stringify(embeddings[i]),
    }));

    const { error: embError } = await this.supabaseService
      .getClient()
      .from('resume_embeddings')
      .insert(embeddingRows);

    if (embError) {
      this.logger.error(
        'Failed to insert resume embeddings:',
        embError.message,
      );
    } else {
      this.logger.log(
        `Generated ${embeddings.length} embeddings for resume ${resumeId}`,
      );
    }
  }

  async generateJobEmbedding(
    jobPostingId: string,
    title: string,
    description: string,
    requirements: string[],
  ): Promise<void> {
    // 1. Delete existing embedding
    await this.supabaseService
      .getClient()
      .from('job_embeddings')
      .delete()
      .eq('job_posting_id', jobPostingId);

    // 2. Combine job fields into a single text
    const combinedText = [
      `Title: ${title}`,
      `Description: ${description}`,
      `Requirements: ${requirements.join(', ')}`,
    ].join('\n');

    // 3. Generate embedding
    const embeddings = await this.getEmbeddings([combinedText]);
    if (!embeddings) return;

    // 4. Store embedding
    const { error } = await this.supabaseService
      .getClient()
      .from('job_embeddings')
      .insert({
        job_posting_id: jobPostingId,
        embedding: JSON.stringify(embeddings[0]),
      });

    if (error) {
      this.logger.error('Failed to insert job embedding:', error.message);
    } else {
      this.logger.log(`Generated embedding for job ${jobPostingId}`);
    }
  }

  async deleteResumeEmbeddings(resumeId: string): Promise<void> {
    await this.supabaseService
      .getClient()
      .from('resume_chunks')
      .delete()
      .eq('resume_id', resumeId);
  }

  async deleteJobEmbedding(jobPostingId: string): Promise<void> {
    await this.supabaseService
      .getClient()
      .from('job_embeddings')
      .delete()
      .eq('job_posting_id', jobPostingId);
  }

  private async getEmbeddings(texts: string[]): Promise<number[][] | null> {
    try {
      const response = await this.ollama.embeddings.create({
        model: this.model,
        input: texts,
      });
      return response.data.map((d) => d.embedding);
    } catch (err) {
      this.logger.error('Ollama embedding call failed:', err);
      return null;
    }
  }
}
