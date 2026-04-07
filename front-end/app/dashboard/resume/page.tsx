'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { api } from '@/lib/api';
import { ResumeUpload } from '@/components/resume/resume-upload';
import { ResumePreview } from '@/components/resume/resume-preview';

interface ResumeData {
  id: string;
  file_name: string;
  file_type: string;
  parsed_text: string | null;
  uploaded_at: string;
}

export default function ResumePage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [resume, setResume] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    if (!authLoading && user?.role !== 'job_seeker') {
      router.push('/dashboard');
      return;
    }
    if (!authLoading && user) {
      api
        .get<ResumeData>('/resumes/me')
        .then(setResume)
        .catch(() => setResume(null))
        .finally(() => setLoading(false));
    }
  }, [authLoading, user, router]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  async function handleDelete() {
    if (!confirm('Delete your resume?')) return;
    try {
      await api.delete('/resumes/me');
      setResume(null);
      setShowUpload(false);
    } catch {
      alert('Failed to delete resume');
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">My Resume</h1>
          <button
            onClick={() => router.push('/dashboard')}
            className="text-sm text-blue-600 hover:underline"
          >
            Back to Dashboard
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {resume && !showUpload ? (
          <ResumePreview
            fileName={resume.file_name}
            fileType={resume.file_type}
            parsedText={resume.parsed_text}
            uploadedAt={resume.uploaded_at}
            onDelete={handleDelete}
            onReplace={() => setShowUpload(true)}
          />
        ) : (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {resume ? 'Replace Your Resume' : 'Upload Your Resume'}
            </h2>
            <p className="text-sm text-gray-600">
              Upload your resume in PDF or DOCX format. We&apos;ll extract the
              text to match you with the best jobs.
            </p>
            <ResumeUpload
              onUploadComplete={(data) => {
                setResume(data);
                setShowUpload(false);
              }}
            />
            {resume && (
              <button
                onClick={() => setShowUpload(false)}
                className="text-sm text-gray-500 hover:underline"
              >
                Cancel
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
