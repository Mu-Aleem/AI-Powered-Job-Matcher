'use client';

interface JobPostingCardProps {
  id: string;
  title: string;
  company: string;
  location: string;
  salary_min: number | null;
  salary_max: number | null;
  experience_level: string;
  created_at: string;
  showActions?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onFindCandidates?: () => void;
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

export function JobPostingCard({
  title,
  company,
  location,
  salary_min,
  salary_max,
  experience_level,
  created_at,
  showActions = false,
  onEdit,
  onDelete,
  onFindCandidates,
}: JobPostingCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600 mt-1">{company}</p>
        </div>
        {showActions && (
          <div className="flex gap-2">
            {onFindCandidates && (
              <button
                onClick={onFindCandidates}
                className="text-sm text-green-600 hover:underline"
              >
                Find Candidates
              </button>
            )}
            <button
              onClick={onEdit}
              className="text-sm text-blue-600 hover:underline"
            >
              Edit
            </button>
            <button
              onClick={onDelete}
              className="text-sm text-red-600 hover:underline"
            >
              Delete
            </button>
          </div>
        )}
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
      <p className="text-xs text-gray-400 mt-3">
        Posted {new Date(created_at).toLocaleDateString()}
      </p>
    </div>
  );
}
