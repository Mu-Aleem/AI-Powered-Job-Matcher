'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { api } from '@/lib/api';
import { MatchedJobCard } from '@/components/matching/matched-job-card';
import {
  MatchFilters,
  type MatchFiltersValue,
} from '@/components/matching/match-filters';

interface MatchedJob {
  job_posting_id: string;
  title: string;
  company: string;
  location: string;
  salary_min: number | null;
  salary_max: number | null;
  experience_level: string;
  description: string;
  requirements: string[];
  created_at: string;
  match_score: number;
  explanation?: string;
}

const EMPTY_FILTERS: MatchFiltersValue = {
  experience_levels: [],
  location: '',
  salary_min: '',
  title: '',
};

export default function MatchesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [matches, setMatches] = useState<MatchedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState<MatchFiltersValue>(EMPTY_FILTERS);

  const fetchMatches = useCallback(
    (f: MatchFiltersValue) => {
      setLoading(true);
      setError('');
      const qs = new URLSearchParams();
      if (f.experience_levels.length)
        qs.set('experience_levels', f.experience_levels.join(','));
      if (f.location.trim()) qs.set('location', f.location.trim());
      if (f.salary_min.trim()) qs.set('salary_min', f.salary_min.trim());
      if (f.title.trim()) qs.set('title', f.title.trim());
      const url = `/matching/jobs${qs.toString() ? `?${qs}` : ''}`;
      api
        .get<MatchedJob[]>(url)
        .then(setMatches)
        .catch((err) => setError(err.message || 'Failed to load matches'))
        .finally(() => setLoading(false));
    },
    [],
  );

  useEffect(() => {
    if (!authLoading && user?.role !== 'job_seeker') {
      router.push('/dashboard');
      return;
    }
    if (!authLoading && user) {
      fetchMatches(EMPTY_FILTERS);
    }
  }, [authLoading, user, router, fetchMatches]);

  const handleApply = () => fetchMatches(filters);
  const handleReset = () => {
    setFilters(EMPTY_FILTERS);
    fetchMatches(EMPTY_FILTERS);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Job Matches</h1>
          <button
            onClick={() => router.push('/dashboard')}
            className="text-sm text-blue-600 hover:underline"
          >
            Dashboard
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6">
        <MatchFilters
          value={filters}
          onChange={setFilters}
          onApply={handleApply}
          onReset={handleReset}
        />

        <div>
          {loading ? (
            <div className="bg-white rounded-xl border p-8 text-center">
              <p className="text-gray-500">
                Analyzing your resume against jobs...
              </p>
              <p className="text-xs text-gray-400 mt-2">
                This may take a few seconds
              </p>
            </div>
          ) : error ? (
            <div className="bg-white rounded-xl border p-8 text-center">
              <p className="text-gray-600">{error}</p>
              <button
                onClick={() => router.push('/dashboard/resume')}
                className="text-blue-600 hover:underline text-sm mt-2"
              >
                Upload your resume first
              </button>
            </div>
          ) : matches.length === 0 ? (
            <div className="bg-white rounded-xl border p-8 text-center">
              <p className="text-gray-600">
                No matches found. Try adjusting your filters.
              </p>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-4">
                {matches.length} job{matches.length !== 1 ? 's' : ''} matched to
                your resume
              </p>
              <div className="space-y-3">
                {matches.map((job) => (
                  <MatchedJobCard key={job.job_posting_id} {...job} />
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
