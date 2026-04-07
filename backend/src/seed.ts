import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as bcrypt from 'bcryptjs';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!,
);

async function seed() {
  console.log('Seeding database...\n');

  // 1. Create an employer account
  const passwordHash = await bcrypt.hash('password123', 10);

  const { data: employer, error: empError } = await supabase
    .from('users')
    .upsert(
      {
        email: 'employer@demo.com',
        password_hash: passwordHash,
        full_name: 'Demo Employer',
        role: 'employer',
      },
      { onConflict: 'email' },
    )
    .select()
    .single();

  if (empError) {
    console.error('Failed to create employer:', empError.message);
    return;
  }
  console.log('Employer created:', employer.email);

  // 2. Create a job seeker account
  const { data: seeker, error: seekError } = await supabase
    .from('users')
    .upsert(
      {
        email: 'seeker@demo.com',
        password_hash: passwordHash,
        full_name: 'Demo Job Seeker',
        role: 'job_seeker',
      },
      { onConflict: 'email' },
    )
    .select()
    .single();

  if (seekError) {
    console.error('Failed to create seeker:', seekError.message);
    return;
  }
  console.log('Job Seeker created:', seeker.email);

  // 3. Seed job postings
  const jobs = [
    {
      employer_id: employer.id,
      title: 'Senior Frontend Developer',
      company: 'TechFlow Inc.',
      location: 'Remote',
      salary_min: 120000,
      salary_max: 160000,
      experience_level: 'senior',
      description:
        'We are looking for a Senior Frontend Developer to lead our web application development. You will work with React, TypeScript, and Next.js to build performant, accessible user interfaces. You will mentor junior developers and collaborate closely with our design and backend teams.',
      requirements: [
        '5+ years of experience with React and TypeScript',
        'Experience with Next.js and server-side rendering',
        'Strong understanding of web accessibility (WCAG)',
        'Experience with state management (Redux, Zustand, or similar)',
        'Familiarity with CI/CD pipelines',
      ],
    },
    {
      employer_id: employer.id,
      title: 'Backend Engineer',
      company: 'DataSync Corp.',
      location: 'New York, NY',
      salary_min: 130000,
      salary_max: 170000,
      experience_level: 'mid',
      description:
        'Join our backend team to build scalable APIs and microservices. You will design and implement RESTful services using Node.js and NestJS, work with PostgreSQL and Redis, and ensure our systems handle millions of requests per day with low latency.',
      requirements: [
        '3+ years of backend development with Node.js',
        'Experience with NestJS or Express',
        'Strong SQL skills (PostgreSQL preferred)',
        'Experience with message queues (RabbitMQ, Kafka)',
        'Understanding of microservices architecture',
      ],
    },
    {
      employer_id: employer.id,
      title: 'Full Stack Developer',
      company: 'GreenLeaf Startup',
      location: 'San Francisco, CA',
      salary_min: 100000,
      salary_max: 140000,
      experience_level: 'mid',
      description:
        'We are an early-stage climate tech startup looking for a Full Stack Developer to build our core product from the ground up. You will own features end-to-end, from database design to frontend polish. We use React, Node.js, and PostgreSQL.',
      requirements: [
        '2+ years of full stack development experience',
        'Proficiency in React and Node.js',
        'Experience with PostgreSQL or similar relational databases',
        'Comfortable working in a fast-paced startup environment',
        'Strong problem-solving skills',
      ],
    },
    {
      employer_id: employer.id,
      title: 'DevOps Engineer',
      company: 'CloudNine Systems',
      location: 'Remote',
      salary_min: 140000,
      salary_max: 180000,
      experience_level: 'senior',
      description:
        'We need a DevOps Engineer to manage our cloud infrastructure on AWS. You will automate deployments, improve monitoring and alerting, manage Kubernetes clusters, and work with development teams to optimize CI/CD pipelines.',
      requirements: [
        '5+ years of DevOps or SRE experience',
        'Strong AWS experience (EC2, ECS, Lambda, RDS)',
        'Experience with Kubernetes and Docker',
        'Proficiency with Terraform or CloudFormation',
        'Experience with monitoring tools (Datadog, Prometheus, Grafana)',
      ],
    },
    {
      employer_id: employer.id,
      title: 'Junior Data Analyst',
      company: 'InsightHub Analytics',
      location: 'Chicago, IL',
      salary_min: 60000,
      salary_max: 80000,
      experience_level: 'entry',
      description:
        'Great opportunity for recent graduates! Join our analytics team to help transform raw data into actionable business insights. You will write SQL queries, build dashboards, and present findings to stakeholders.',
      requirements: [
        'Bachelor\'s degree in Statistics, Math, CS, or related field',
        'Proficiency in SQL',
        'Experience with Python or R for data analysis',
        'Familiarity with visualization tools (Tableau, Power BI, or Looker)',
        'Strong communication skills',
      ],
    },
    {
      employer_id: employer.id,
      title: 'Machine Learning Engineer',
      company: 'AI Dynamics',
      location: 'Boston, MA',
      salary_min: 150000,
      salary_max: 200000,
      experience_level: 'senior',
      description:
        'Build and deploy machine learning models that power our recommendation engine. You will work with large datasets, design model training pipelines, and optimize model inference for production. Experience with NLP and transformer models is a plus.',
      requirements: [
        '4+ years of ML engineering experience',
        'Strong Python skills (PyTorch or TensorFlow)',
        'Experience deploying models to production',
        'Knowledge of NLP and transformer architectures',
        'Experience with MLOps tools (MLflow, Kubeflow, or similar)',
        'MS or PhD in Computer Science, ML, or related field preferred',
      ],
    },
    {
      employer_id: employer.id,
      title: 'Product Designer',
      company: 'PixelCraft Studios',
      location: 'Austin, TX',
      salary_min: 90000,
      salary_max: 130000,
      experience_level: 'mid',
      description:
        'We are looking for a Product Designer who can own the end-to-end design process. You will conduct user research, create wireframes and prototypes, and collaborate with engineers to ship polished features. Our design system is built in Figma.',
      requirements: [
        '3+ years of product design experience',
        'Expert-level Figma skills',
        'Experience with user research and usability testing',
        'Strong portfolio demonstrating UX problem-solving',
        'Experience working with design systems',
      ],
    },
    {
      employer_id: employer.id,
      title: 'Mobile Developer (React Native)',
      company: 'AppWave Technologies',
      location: 'Remote',
      salary_min: 110000,
      salary_max: 150000,
      experience_level: 'mid',
      description:
        'Build cross-platform mobile applications using React Native. You will work on our consumer-facing app used by millions of users, implement new features, fix performance issues, and ensure a smooth user experience on both iOS and Android.',
      requirements: [
        '3+ years of React Native development',
        'Published apps on App Store and Google Play',
        'Experience with native modules and bridging',
        'Understanding of mobile performance optimization',
        'Experience with TypeScript',
      ],
    },
    {
      employer_id: employer.id,
      title: 'Engineering Manager',
      company: 'ScaleUp Corp.',
      location: 'Seattle, WA',
      salary_min: 180000,
      salary_max: 240000,
      experience_level: 'lead',
      description:
        'Lead a team of 8-10 engineers building our core platform. You will be responsible for technical direction, team growth, project delivery, and cross-functional collaboration. We value managers who stay close to the code while empowering their teams.',
      requirements: [
        '7+ years of software engineering experience',
        '2+ years of engineering management experience',
        'Track record of delivering complex projects on time',
        'Experience with agile methodologies',
        'Strong mentorship and coaching skills',
        'Technical background in distributed systems',
      ],
    },
    {
      employer_id: employer.id,
      title: 'QA Automation Engineer',
      company: 'QualityFirst Software',
      location: 'Denver, CO',
      salary_min: 85000,
      salary_max: 115000,
      experience_level: 'mid',
      description:
        'Design and implement automated testing frameworks for our web and API products. You will write end-to-end tests, integration tests, and performance tests to ensure product quality. Work closely with developers to shift testing left.',
      requirements: [
        '3+ years of QA automation experience',
        'Proficiency with Playwright, Cypress, or Selenium',
        'Experience with API testing (Postman, REST Assured)',
        'Knowledge of CI/CD integration for test suites',
        'Experience with JavaScript or TypeScript',
      ],
    },
  ];

  const { data: inserted, error: jobsError } = await supabase
    .from('job_postings')
    .insert(jobs)
    .select('id, title');

  if (jobsError) {
    console.error('Failed to seed jobs:', jobsError.message);
    return;
  }

  console.log(`\nSeeded ${inserted.length} job postings:`);
  inserted.forEach((j) => console.log(`  - ${j.title}`));

  console.log('\n--- Demo Accounts ---');
  console.log('Employer:   employer@demo.com / password123');
  console.log('Job Seeker: seeker@demo.com / password123');
  console.log('\nDone!');
}

seed().catch(console.error);
