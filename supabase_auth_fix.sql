-- ============================================================
-- GigNav Supabase Auth + RLS Fix
-- Run this in the Supabase SQL Editor for the current project
-- ============================================================

-- Make sure RLS is enabled.
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.released_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hiring_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;

-- Clean up old policies if you rerun this script.
DROP POLICY IF EXISTS "users_select_all" ON public.users;
DROP POLICY IF EXISTS "users_insert_own_profile" ON public.users;
DROP POLICY IF EXISTS "users_update_own_profile" ON public.users;

DROP POLICY IF EXISTS "jobs_select_participants" ON public.jobs;
DROP POLICY IF EXISTS "jobs_insert_participants" ON public.jobs;
DROP POLICY IF EXISTS "jobs_update_participants" ON public.jobs;
DROP POLICY IF EXISTS "jobs_delete_participants" ON public.jobs;

DROP POLICY IF EXISTS "released_jobs_select_all" ON public.released_jobs;
DROP POLICY IF EXISTS "released_jobs_insert_employer" ON public.released_jobs;
DROP POLICY IF EXISTS "released_jobs_update_employer" ON public.released_jobs;
DROP POLICY IF EXISTS "released_jobs_delete_employer" ON public.released_jobs;

DROP POLICY IF EXISTS "reviews_select_all" ON public.reviews;
DROP POLICY IF EXISTS "reviews_insert_employer" ON public.reviews;

DROP POLICY IF EXISTS "hiring_details_select_participants" ON public.hiring_details;
DROP POLICY IF EXISTS "hiring_details_insert_participants" ON public.hiring_details;

DROP POLICY IF EXISTS "schedules_select_participants" ON public.schedules;
DROP POLICY IF EXISTS "schedules_insert_employer" ON public.schedules;
DROP POLICY IF EXISTS "schedules_update_participants" ON public.schedules;

-- Public profile browsing is required for the employer -> worker search flow.
CREATE POLICY "users_select_all" ON public.users
  FOR SELECT
  USING (true);

CREATE POLICY "users_insert_own_profile" ON public.users
  FOR INSERT
  WITH CHECK (auth.uid()::text = id);

CREATE POLICY "users_update_own_profile" ON public.users
  FOR UPDATE
  USING (auth.uid()::text = id)
  WITH CHECK (auth.uid()::text = id);

CREATE POLICY "jobs_select_participants" ON public.jobs
  FOR SELECT
  USING (
    auth.uid()::text = "workerId" OR
    auth.uid()::text = "employerId"
  );

CREATE POLICY "jobs_insert_participants" ON public.jobs
  FOR INSERT
  WITH CHECK (
    auth.uid()::text = "workerId" OR
    auth.uid()::text = "employerId"
  );

CREATE POLICY "jobs_update_participants" ON public.jobs
  FOR UPDATE
  USING (
    auth.uid()::text = "workerId" OR
    auth.uid()::text = "employerId"
  )
  WITH CHECK (
    auth.uid()::text = "workerId" OR
    auth.uid()::text = "employerId"
  );

CREATE POLICY "jobs_delete_participants" ON public.jobs
  FOR DELETE
  USING (
    auth.uid()::text = "workerId" OR
    auth.uid()::text = "employerId"
  );

CREATE POLICY "released_jobs_select_all" ON public.released_jobs
  FOR SELECT
  USING (true);

CREATE POLICY "released_jobs_insert_employer" ON public.released_jobs
  FOR INSERT
  WITH CHECK (auth.uid()::text = "employerId");

CREATE POLICY "released_jobs_update_employer" ON public.released_jobs
  FOR UPDATE
  USING (auth.uid()::text = "employerId")
  WITH CHECK (auth.uid()::text = "employerId");

CREATE POLICY "released_jobs_delete_employer" ON public.released_jobs
  FOR DELETE
  USING (auth.uid()::text = "employerId");

CREATE POLICY "reviews_select_all" ON public.reviews
  FOR SELECT
  USING (true);

CREATE POLICY "reviews_insert_employer" ON public.reviews
  FOR INSERT
  WITH CHECK (auth.uid()::text = "employerId");

CREATE POLICY "hiring_details_select_participants" ON public.hiring_details
  FOR SELECT
  USING (
    auth.uid()::text = "workerId" OR
    auth.uid()::text = "employerId"
  );

CREATE POLICY "hiring_details_insert_participants" ON public.hiring_details
  FOR INSERT
  WITH CHECK (
    auth.uid()::text = "workerId" OR
    auth.uid()::text = "employerId"
  );

CREATE POLICY "schedules_select_participants" ON public.schedules
  FOR SELECT
  USING (
    auth.uid()::text = "workerId" OR
    auth.uid()::text = "employerId"
  );

CREATE POLICY "schedules_insert_employer" ON public.schedules
  FOR INSERT
  WITH CHECK (auth.uid()::text = "employerId");

CREATE POLICY "schedules_update_participants" ON public.schedules
  FOR UPDATE
  USING (
    auth.uid()::text = "workerId" OR
    auth.uid()::text = "employerId"
  )
  WITH CHECK (
    auth.uid()::text = "workerId" OR
    auth.uid()::text = "employerId"
  );
