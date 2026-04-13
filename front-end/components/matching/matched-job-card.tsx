'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { MatchScoreBadge } from './match-score-badge';

interface MatchedJobCardProps {
  job_posting_id: string;
  title: string;
  company: string;
  location: string;
  salary_min: number | null;
  salary_max: number | null;
  experience_level: string;
  match_score: number;
  created_at: string;
  explanation?: string;
}

const experienceLabels: Record<string, string> = {
  entry: 'Entry Level',
  mid: 'Mid Level',
  senior: 'Senior',
  lead: 'Lead',
  executive: 'Executive',
};

function formatSalary(min: number | null, max: number | null): string {
  if (!min && !max) return 'Not specified';
  if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
  if (min) return `From $${min.toLocaleString()}`;
  return `Up to $${max!.toLocaleString()}`;
}

export function MatchedJobCard({
  job_posting_id,
  title,
  company,
  location,
  salary_min,
  salary_max,
  experience_level,
  match_score,
  created_at,
  explanation,
}: MatchedJobCardProps) {
  const [open, setOpen] = useState(false);
  const [lazyExpl, setLazyExpl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const finalExplanation = explanation || lazyExpl;

  const handleClick = async () => {
    setOpen((v) => !v);
    if (finalExplanation || busy) return;
    setBusy(true);
    setErr(null);
    try {
      const res = await api.get<{ explanation: string }>(
        `/matching/explain/${job_posting_id}`,
      );
      setLazyExpl(res.explanation);
    } catch (e: any) {
      setErr(e.message || 'Failed to generate explanation');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600 mt-1">{company}</p>
        </div>
        <MatchScoreBadge score={match_score} />
      </div>
      <div className="flex flex-wrap gap-2 mt-3">
        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
          {location}
        </span>
        <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded">
          {experienceLabels[experience_level] || experience_level}
        </span>
        <span className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded">
          {formatSalary(salary_min, salary_max)}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <p className="text-xs text-gray-400">
          Posted {new Date(created_at).toLocaleDateString()}
        </p>
        <button
          onClick={handleClick}
          className="text-xs text-blue-600 hover:underline font-medium"
        >
          {open ? 'Hide explanation' : 'Why this match?'}
        </button>
      </div>

      {open && (
        <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded text-sm text-gray-800">
          {busy
            ? 'Generating explanation...'
            : err
              ? err
              : finalExplanation || 'No explanation available.'}
        </div>
      )}
    </div>
  );
}
