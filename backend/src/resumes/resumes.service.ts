import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { Resume } from './entities/resume.entity';
import pdfParse from 'pdf-parse';
import * as mammoth from 'mammoth';

@Injectable()
export class ResumesService {
  constructor(private supabaseService: SupabaseService) {}

  async uploadAndParse(
    userId: string,
    file: Express.Multer.File,
  ): Promise<Resume> {
    const fileType = this.getFileType(file.mimetype);
    if (!fileType) {
      throw new BadRequestException(
        'Invalid file type. Only PDF and DOCX are accepted.',
      );
    }

    // Parse text from file
    const parsedText = await this.extractText(file.buffer, fileType);

    // Upload to Supabase Storage
    const storagePath = `${userId}/${Date.now()}-${file.originalname}`;
    const { error: uploadError } = await this.supabaseService
      .getClient()
      .storage.from('resumes')
      .upload(storagePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (uploadError) throw new Error(uploadError.message);

    // Delete old resume file if exists
    const existing = await this.getResume(userId);
    if (existing) {
      await this.supabaseService
        .getClient()
        .storage.from('resumes')
        .remove([existing.storage_path]);
    }

    // Upsert resume record
    const { data, error } = await this.supabaseService
      .getClient()
      .from('resumes')
      .upsert(
        {
          user_id: userId,
          file_name: file.originalname,
          file_type: fileType,
          storage_path: storagePath,
          parsed_text: parsedText,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' },
      )
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as Resume;
  }

  async getResume(userId: string): Promise<Resume | null> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('resumes')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !data) return null;
    return data as Resume;
  }

  async deleteResume(userId: string): Promise<void> {
    const resume = await this.getResume(userId);
    if (!resume) throw new NotFoundException('No resume found');

    // Delete from storage
    await this.supabaseService
      .getClient()
      .storage.from('resumes')
      .remove([resume.storage_path]);

    // Delete from database
    const { error } = await this.supabaseService
      .getClient()
      .from('resumes')
      .delete()
      .eq('user_id', userId);

    if (error) throw new Error(error.message);
  }

  private getFileType(mimetype: string): 'pdf' | 'docx' | null {
    if (mimetype === 'application/pdf') return 'pdf';
    if (
      mimetype ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    )
      return 'docx';
    return null;
  }

  private async extractText(
    buffer: Buffer,
    fileType: 'pdf' | 'docx',
  ): Promise<string> {
    if (fileType === 'pdf') {
      const result = await pdfParse(buffer);
      return result.text;
    }

    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }
}
