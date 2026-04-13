interface MatchScoreBadgeProps {
  score: number;
}

export function MatchScoreBadge({ score }: MatchScoreBadgeProps) {
  const rounded = Math.round(score);

  let colorClass: string;
  let label: string;

  if (rounded >= 80) {
    colorClass = 'bg-green-100 text-green-800';
    label = 'Excellent';
  } else if (rounded >= 60) {
    colorClass = 'bg-amber-100 text-amber-800';
    label = 'Good';
  } else if (rounded >= 40) {
    colorClass = 'bg-orange-100 text-orange-800';
    label = 'Fair';
  } else {
    colorClass = 'bg-gray-100 text-gray-600';
    label = 'Low';
  }

  return (
    <div className="flex items-center gap-2">
      <span
        className={`px-2.5 py-1 rounded-full text-sm font-semibold ${colorClass}`}
      >
        {rounded}%
      </span>
      <span className="text-xs text-gray-500">{label} match</span>
    </div>
  );
}
