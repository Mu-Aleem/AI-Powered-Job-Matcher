'use client';

import { useState, type FormEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface JobFormData {
  title: string;
  company: string;
  location: string;
  salary_min?: number;
  salary_max?: number;
  experience_level: string;
  description: string;
  requirements: string[];
}

interface JobPostingFormProps {
  initialData?: JobFormData;
  onSubmit: (data: JobFormData) => Promise<void>;
  submitLabel: string;
}

const experienceOptions = [
  { value: 'entry', label: 'Entry Level' },
  { value: 'mid', label: 'Mid Level' },
  { value: 'senior', label: 'Senior' },
  { value: 'lead', label: 'Lead' },
  { value: 'executive', label: 'Executive' },
];

export function JobPostingForm({
  initialData,
  onSubmit,
  submitLabel,
}: JobPostingFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [company, setCompany] = useState(initialData?.company || '');
  const [location, setLocation] = useState(initialData?.location || '');
  const [salaryMin, setSalaryMin] = useState(
    initialData?.salary_min?.toString() || '',
  );
  const [salaryMax, setSalaryMax] = useState(
    initialData?.salary_max?.toString() || '',
  );
  const [experienceLevel, setExperienceLevel] = useState(
    initialData?.experience_level || 'entry',
  );
  const [description, setDescription] = useState(
    initialData?.description || '',
  );
  const [requirements, setRequirements] = useState<string[]>(
    initialData?.requirements || [''],
  );
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  function addRequirement() {
    setRequirements([...requirements, '']);
  }

  function removeRequirement(index: number) {
    setRequirements(requirements.filter((_, i) => i !== index));
  }

  function updateRequirement(index: number, value: string) {
    const updated = [...requirements];
    updated[index] = value;
    setRequirements(updated);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await onSubmit({
        title,
        company,
        location,
        salary_min: salaryMin ? parseInt(salaryMin) : undefined,
        salary_max: salaryMax ? parseInt(salaryMax) : undefined,
        experience_level: experienceLevel,
        description,
        requirements: requirements.filter((r) => r.trim() !== ''),
      });
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">
          {error}
        </div>
      )}

      <Input
        label="Job Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="e.g. Senior Frontend Developer"
        required
      />

      <Input
        label="Company"
        value={company}
        onChange={(e) => setCompany(e.target.value)}
        placeholder="e.g. Acme Inc."
        required
      />

      <Input
        label="Location"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        placeholder="e.g. Remote, New York, NY"
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Min Salary (USD)"
          type="number"
          value={salaryMin}
          onChange={(e) => setSalaryMin(e.target.value)}
          placeholder="e.g. 80000"
        />
        <Input
          label="Max Salary (USD)"
          type="number"
          value={salaryMax}
          onChange={(e) => setSalaryMax(e.target.value)}
          placeholder="e.g. 120000"
        />
      </div>

      <Select
        label="Experience Level"
        value={experienceLevel}
        onChange={(e) => setExperienceLevel(e.target.value)}
        options={experienceOptions}
      />

      <Textarea
        label="Job Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Describe the role, responsibilities, and what the team looks like..."
        required
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Requirements
        </label>
        {requirements.map((req, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <Input
              value={req}
              onChange={(e) => updateRequirement(i, e.target.value)}
              placeholder={`Requirement ${i + 1}`}
            />
            {requirements.length > 1 && (
              <button
                type="button"
                onClick={() => removeRequirement(i)}
                className="text-red-500 text-sm px-2 hover:text-red-700"
              >
                Remove
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addRequirement}
          className="text-sm text-blue-600 hover:underline"
        >
          + Add Requirement
        </button>
      </div>

      <Button type="submit" isLoading={isLoading}>
        {submitLabel}
      </Button>
    </form>
  );
}
