'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { FileDropZone } from '@/components/ui/file-drop-zone';

interface ResumeData {
  id: string;
  file_name: string;
  file_type: string;
  parsed_text: string | null;
  uploaded_at: string;
}

interface ResumeUploadProps {
  onUploadComplete: (resume: ResumeData) => void;
}

export function ResumeUpload({ onUploadComplete }: ResumeUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  async function handleFileSelect(file: File) {
    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!validTypes.includes(file.type)) {
      setError('Please upload a PDF or DOCX file.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File must be under 5MB.');
      return;
    }

    setError('');
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      const result = await api.upload<ResumeData>(
        '/resumes/upload',
        formData,
      );
      onUploadComplete(result);
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div>
      <FileDropZone
        accept=".pdf,.docx"
        onFileSelect={handleFileSelect}
        disabled={isUploading}
      />
      {isUploading && (
        <p className="text-sm text-blue-600 mt-3 text-center">
          Uploading and parsing your resume...
        </p>
      )}
      {error && (
        <p className="text-sm text-red-600 mt-3 text-center">{error}</p>
      )}
    </div>
  );
}
