'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';

interface NavCard {
  title: string;
  description: string;
  href: string;
}

export default function DashboardPage() {
  const { user, logout, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  const jobSeekerCards: NavCard[] = [
    {
      title: 'Upload Resume',
      description: 'Upload your PDF or DOCX resume to get matched with jobs.',
      href: '/dashboard/resume',
    },
    {
      title: 'Job Matches',
      description: 'View jobs matched to your resume using AI.',
      href: '/dashboard/matches',
    },
    {
      title: 'Browse Jobs',
      description: 'Explore all available job postings.',
      href: '/dashboard/browse',
    },
  ];

  const employerCards: NavCard[] = [
    {
      title: 'Post a Job',
      description: 'Create a new job posting to find the best candidates.',
      href: '/dashboard/jobs/new',
    },
    {
      title: 'My Job Postings',
      description: 'Manage your existing job postings.',
      href: '/dashboard/jobs',
    },
    {
      title: 'Browse Jobs',
      description: 'See all active job postings on the platform.',
      href: '/dashboard/browse',
    },
  ];

  const cards = user?.role === 'job_seeker' ? jobSeekerCards : employerCards;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">
            AI Job Matcher
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {user?.full_name}
              <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700">
                {user?.role === 'job_seeker' ? 'Job Seeker' : 'Employer'}
              </span>
            </span>
            <Button variant="secondary" onClick={logout} className="!w-auto">
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          Welcome, {user?.full_name}!
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold text-gray-900">{card.title}</h3>
              <p className="text-sm text-gray-600 mt-2">{card.description}</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
