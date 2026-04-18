-- ============================================================
-- GigNav Full Database Schema
-- Run this in your Supabase SQL Editor to ensure everything works
-- ============================================================

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id           TEXT PRIMARY KEY,
  role         TEXT CHECK (role IN ('worker', 'employer')),
  name         TEXT NOT NULL,
  email        TEXT UNIQUE,
  password     TEXT,
  phone        TEXT,
  company      TEXT,
  city         TEXT,
  locality     TEXT,
  bio          TEXT,
  skills       JSONB, -- Array of strings
  "hourlyRate" NUMERIC,
  experience   TEXT,
  "jobType"    JSONB, -- Array of strings
  availability TEXT DEFAULT 'available',
  "jobsDone"   INTEGER DEFAULT 0,
  portfolio    JSONB,
  "dailyRate"  NUMERIC,
  "availableSlots" JSONB DEFAULT '[]' -- Array of objects: {id, day, from, to}
);

-- 2. Jobs Table (Handles applications, hires, and attendance)
CREATE TABLE IF NOT EXISTS jobs (
  id           TEXT PRIMARY KEY,
  "employerId" TEXT REFERENCES users(id),
  "workerId"   TEXT REFERENCES users(id),
  "workerName" TEXT,
  "employerName" TEXT,
  status       TEXT, -- 'open', 'applied', 'accepted_XXXX', 'verified', 'completed', 'rejected'
  createdAt    TIMESTAMPTZ DEFAULT NOW(),
  "verifyCode" TEXT -- Optional matching code
);

-- 3. Released Jobs (Jobs posted by employers for anyone to see)
CREATE TABLE IF NOT EXISTS released_jobs (
  id           TEXT PRIMARY KEY,
  "employerId" TEXT REFERENCES users(id),
  "employerName" TEXT,
  title        TEXT,
  "typeOfWork" TEXT,
  duration     TEXT,
  rate         NUMERIC,
  description  TEXT,
  location     TEXT,
  skills       JSONB,
  createdAt    TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
  id           TEXT PRIMARY KEY,
  "workerId"   TEXT REFERENCES users(id),
  "employerId" TEXT REFERENCES users(id),
  "employerName" TEXT,
  rating       INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment      TEXT,
  date         DATE DEFAULT CURRENT_DATE
);

-- 5. Schedules Table (Booking requests)
CREATE TABLE IF NOT EXISTS schedules (
  id           TEXT PRIMARY KEY,
  "workerId"   TEXT REFERENCES users(id),
  "workerName" TEXT,
  "employerId" TEXT REFERENCES users(id),
  "employerName" TEXT,
  day          TEXT,
  "from"       TEXT,
  "to"         TEXT,
  note         TEXT,
  status       TEXT DEFAULT 'pending', -- 'pending', 'confirmed', 'declined'
  createdAt    TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Hiring Details (Historical backup)
CREATE TABLE IF NOT EXISTS hiring_details (
  id           TEXT PRIMARY KEY,
  "employerId" TEXT REFERENCES users(id),
  "workerId"   TEXT REFERENCES users(id),
  "workerName" TEXT,
  "type"       TEXT,
  status       TEXT,
  createdAt    TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) - Basic Enablement
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE released_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE hiring_details ENABLE ROW LEVEL SECURITY;

-- Note: Add specific policies for auth.uid() if production deployment is needed.
