import { MatchScoreBadge } from './match-score-badge';

interface MatchedCandidateCardProps {
  full_name: string;
  email: string;
  file_name: string;
  match_score: number;
}

export function MatchedCandidateCard({
  full_name,
  email,
  file_name,
  match_score,
}: MatchedCandidateCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">{full_name}</h3>
          <p className="text-sm text-gray-600 mt-1">{email}</p>
        </div>
        <MatchScoreBadge score={match_score} />
      </div>
      <div className="flex items-center gap-2 mt-3">
        <svg
          className="h-4 w-4 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <span className="text-xs text-gray-500">{file_name}</span>
      </div>
    </div>
  );
}
