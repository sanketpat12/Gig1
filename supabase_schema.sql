-- Create users table
CREATE TABLE public.users (
    id text PRIMARY KEY,
    role text NOT NULL,
    name text NOT NULL,
    email text UNIQUE NOT NULL,
    password text NOT NULL,
    phone text NOT NULL,
    company text,
    city text,
    locality text,
    bio text,
    skills jsonb,
    "hourlyRate" numeric DEFAULT 0,
    experience text,
    "jobType" jsonb,
    availability text DEFAULT 'available',
    "jobsDone" integer DEFAULT 0,
    portfolio jsonb
);

-- Create reviews table
CREATE TABLE public.reviews (
    id text PRIMARY KEY,
    "workerId" text REFERENCES public.users(id) ON DELETE CASCADE,
    "employerId" text REFERENCES public.users(id) ON DELETE CASCADE,
    "employerName" text,
    rating integer NOT NULL,
    comment text NOT NULL,
    date text NOT NULL
);

-- Create jobs table
CREATE TABLE public.jobs (
    id text PRIMARY KEY,
    "employerId" text REFERENCES public.users(id) ON DELETE CASCADE,
    "workerId" text REFERENCES public.users(id) ON DELETE CASCADE,
    "employerName" text,
    "workerName" text,
    status text DEFAULT 'open',
    "createdAt" text NOT NULL
);

-- Create hiring_details table
CREATE TABLE public.hiring_details (
    id text PRIMARY KEY,
    "jobId" text REFERENCES public.jobs(id) ON DELETE CASCADE,
    "workerId" text REFERENCES public.users(id) ON DELETE CASCADE,
    "employerId" text REFERENCES public.users(id) ON DELETE CASCADE,
    "startDate" text NOT NULL,
    "endDate" text,
    "paymentAmount" numeric,
    notes text,
    status text DEFAULT 'active',
    "createdAt" text NOT NULL
);
