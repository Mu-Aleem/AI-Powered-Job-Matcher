'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { api } from '@/lib/api';
import { JobPostingCard } from '@/components/jobs/job-posting-card';
import { Button } from '@/components/ui/button';

interface JobPosting {
  id: string;
  title: string;
  company: string;
  location: string;
  salary_min: number | null;
  salary_max: number | null;
  experience_level: string;
  created_at: string;
}

export default function MyJobsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && user?.role !== 'employer') {
      router.push('/dashboard');
      return;
    }
    if (!authLoading && user) {
      api
        .get<JobPosting[]>('/job-postings/mine')
        .then(setJobs)
        .catch(() => setJobs([]))
        .finally(() => setLoading(false));
    }
  }, [authLoading, user, router]);

  async function handleDelete(id: string) {
    if (!confirm('Delete this job posting?')) return;
    try {
      await api.delete(`/job-postings/${id}`);
      setJobs(jobs.filter((j) => j.id !== id));
    } catch {
      alert('Failed to delete');
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">My Job Postings</h1>
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-sm text-blue-600 hover:underline"
            >
              Dashboard
            </button>
            <Button
              onClick={() => router.push('/dashboard/jobs/new')}
              className="!w-auto"
            >
              Post New Job
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {jobs.length === 0 ? (
          <div className="bg-white rounded-xl border p-8 text-center">
            <p className="text-gray-600">
              You haven&apos;t posted any jobs yet.
            </p>
            <button
              onClick={() => router.push('/dashboard/jobs/new')}
              className="text-blue-600 hover:underline text-sm mt-2"
            >
              Create your first job posting
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => (
              <JobPostingCard
                key={job.id}
                {...job}
                showActions
                onFindCandidates={() =>
                  router.push(`/dashboard/jobs/${job.id}/candidates`)
                }
                onEdit={() =>
                  router.push(`/dashboard/jobs/${job.id}/edit`)
                }
                onDelete={() => handleDelete(job.id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
