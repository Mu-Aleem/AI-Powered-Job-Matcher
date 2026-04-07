'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { api } from '@/lib/api';
import { JobPostingForm } from '@/components/jobs/job-posting-form';
import { useEffect } from 'react';

export default function NewJobPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user?.role !== 'employer') {
      router.push('/dashboard');
    }
  }, [isLoading, user, router]);

  if (isLoading) {
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
          <h1 className="text-xl font-bold text-gray-900">Post a New Job</h1>
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
          submitLabel="Post Job"
          onSubmit={async (data) => {
            await api.post('/job-postings', data);
            router.push('/dashboard/jobs');
          }}
        />
      </main>
    </div>
  );
}
