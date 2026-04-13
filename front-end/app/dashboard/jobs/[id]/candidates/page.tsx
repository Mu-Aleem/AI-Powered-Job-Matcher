'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { api } from '@/lib/api';
import { MatchedCandidateCard } from '@/components/matching/matched-candidate-card';

interface MatchedCandidate {
  resume_id: string;
  user_id: string;
  full_name: string;
  email: string;
  file_name: string;
  match_score: number;
}

export default function CandidatesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [candidates, setCandidates] = useState<MatchedCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && user?.role !== 'employer') {
      router.push('/dashboard');
      return;
    }
    if (!authLoading && user && params.id) {
      api
        .get<MatchedCandidate[]>(`/matching/candidates/${params.id}`)
        .then(setCandidates)
        .catch((err) => setError(err.message || 'Failed to load candidates'))
        .finally(() => setLoading(false));
    }
  }, [authLoading, user, params.id, router]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Finding matching candidates...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">
            Matching Candidates
          </h1>
          <button
            onClick={() => router.push('/dashboard/jobs')}
            className="text-sm text-blue-600 hover:underline"
          >
            Back to My Jobs
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {error ? (
          <div className="bg-white rounded-xl border p-8 text-center">
            <p className="text-gray-600">{error}</p>
          </div>
        ) : candidates.length === 0 ? (
          <div className="bg-white rounded-xl border p-8 text-center">
            <p className="text-gray-600">
              No matching candidates found yet. Candidates will appear once job
              seekers upload their resumes.
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">
              {candidates.length} candidate{candidates.length !== 1 ? 's' : ''}{' '}
              matched
            </p>
            <div className="space-y-3">
              {candidates.map((c) => (
                <MatchedCandidateCard key={c.resume_id} {...c} />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
