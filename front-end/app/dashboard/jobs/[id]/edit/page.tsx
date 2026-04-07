'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { api } from '@/lib/api';
import { JobPostingForm } from '@/components/jobs/job-posting-form';

interface JobPosting {
  id: string;
  title: string;
  company: string;
  location: string;
  salary_min: number | null;
  salary_max: number | null;
  experience_level: string;
  description: string;
  requirements: string[];
}

export default function EditJobPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [job, setJob] = useState<JobPosting | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && user?.role !== 'employer') {
      router.push('/dashboard');
      return;
    }
    if (!authLoading && user && params.id) {
      api
        .get<JobPosting>(`/job-postings/${params.id}`)
        .then(setJob)
        .catch(() => router.push('/dashboard/jobs'))
        .finally(() => setLoading(false));
    }
  }, [authLoading, user, params.id, router]);

  if (authLoading || loading || !job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Edit Job Posting</h1>
          <button
            onClick={() => router.push('/dashboard/jobs')}
            className="text-sm text-blue-600 hover:underline"
          >
            Back to My Jobs
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <JobPostingForm
          initialData={{
            title: job.title,
            company: job.company,
            location: job.location,
            salary_min: job.salary_min ?? undefined,
            salary_max: job.salary_max ?? undefined,
            experience_level: job.experience_level,
            description: job.description,
            requirements: job.requirements,
          }}
          submitLabel="Update Job"
          onSubmit={async (data) => {
            await api.patch(`/job-postings/${params.id}`, data);
            router.push('/dashboard/jobs');
          }}
        />
      </main>
    </div>
  );
}
