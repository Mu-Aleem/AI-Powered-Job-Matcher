'use client';

import { Input } from '@/components/ui/input';

export interface MatchFiltersValue {
  experience_levels: string[];
  location: string;
  salary_min: string;
  title: string;
}

const LEVELS: Array<{ value: string; label: string }> = [
  { value: 'entry', label: 'Entry' },
  { value: 'mid', label: 'Mid' },
  { value: 'senior', label: 'Senior' },
  { value: 'lead', label: 'Lead' },
  { value: 'executive', label: 'Executive' },
];

interface Props {
  value: MatchFiltersValue;
  onChange: (v: MatchFiltersValue) => void;
  onApply: () => void;
  onReset: () => void;
}

export function MatchFilters({ value, onChange, onApply, onReset }: Props) {
  const toggleLevel = (lvl: string) => {
    const next = value.experience_levels.includes(lvl)
      ? value.experience_levels.filter((l) => l !== lvl)
      : [...value.experience_levels, lvl];
    onChange({ ...value, experience_levels: next });
  };

  return (
    <aside className="bg-white border border-gray-200 rounded-lg p-4 space-y-4 sticky top-4">
      <h2 className="text-sm font-semibold text-gray-900">Filters</h2>

      <div>
        <label className="text-xs font-medium text-gray-700 block mb-2">
          Experience Level
        </label>
        <div className="flex flex-wrap gap-2">
          {LEVELS.map((l) => {
            const active = value.experience_levels.includes(l.value);
            return (
              <button
                key={l.value}
                type="button"
                onClick={() => toggleLevel(l.value)}
                className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                  active
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                }`}
              >
                {l.label}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-gray-700 block mb-1">
          Location
        </label>
        <Input
          placeholder="e.g. Remote, New York"
          value={value.location}
          onChange={(e) => onChange({ ...value, location: e.target.value })}
        />
      </div>

      <div>
        <label className="text-xs font-medium text-gray-700 block mb-1">
          Min Salary (USD)
        </label>
        <Input
          type="number"
          placeholder="e.g. 80000"
          value={value.salary_min}
          onChange={(e) => onChange({ ...value, salary_min: e.target.value })}
        />
      </div>

      <div>
        <label className="text-xs font-medium text-gray-700 block mb-1">
          Title Keyword
        </label>
        <Input
          placeholder="e.g. engineer"
          value={value.title}
          onChange={(e) => onChange({ ...value, title: e.target.value })}
        />
      </div>

      <div className="flex gap-2 pt-2">
        <button
          onClick={onApply}
          className="flex-1 text-sm bg-blue-600 text-white rounded py-2 hover:bg-blue-700 transition-colors"
        >
          Apply
        </button>
        <button
          onClick={onReset}
          className="text-sm text-gray-600 px-3 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
        >
          Reset
        </button>
      </div>
    </aside>
  );
}
