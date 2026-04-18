-- ============================================================
-- GigNav Scheduling Feature - Run this in Supabase SQL Editor
-- ============================================================

-- 1. Add availableSlots column to users table
--    Stores worker's available time slots as a JSON array
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS "availableSlots" JSONB DEFAULT NULL;

-- 2. Create schedules table for booking requests
CREATE TABLE IF NOT EXISTS schedules (
  id          TEXT        PRIMARY KEY,
  "workerId"  TEXT        NOT NULL,
  "workerName" TEXT,
  "employerId" TEXT       NOT NULL,
  "employerName" TEXT,
  day         TEXT        NOT NULL,    -- e.g. 'Monday'
  "from"      TEXT        NOT NULL,    -- e.g. '09:00'
  "to"        TEXT        NOT NULL,    -- e.g. '17:00'
  note        TEXT,
  status      TEXT        NOT NULL DEFAULT 'pending',  -- pending | confirmed | declined
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Enable Row Level Security (optional but recommended)
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read schedules where they are worker or employer
CREATE POLICY "schedules_select" ON schedules
  FOR SELECT USING (
    auth.uid()::text = "workerId" OR auth.uid()::text = "employerId"
  );

-- Allow authenticated users to insert their own schedule requests
CREATE POLICY "schedules_insert" ON schedules
  FOR INSERT WITH CHECK (auth.uid()::text = "employerId");

-- Allow worker or employer to update status
CREATE POLICY "schedules_update" ON schedules
  FOR UPDATE USING (
    auth.uid()::text = "workerId" OR auth.uid()::text = "employerId"
  );
