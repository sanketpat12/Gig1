-- ============================================================
-- GigNav RLS Policies
-- Run this in your Supabase SQL Editor to allow database operations
-- ============================================================

-- Alternatively, you can completely disable RLS for testing:
-- ALTER TABLE users DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE jobs DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE released_jobs DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE schedules DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE hiring_details DISABLE ROW LEVEL SECURITY;

-- If you prefer to keep RLS active but allow all operations for authenticated users, run this:

CREATE POLICY "Allow authenticated users to read users" ON users FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to insert users" ON users FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow users to update own profile" ON users FOR UPDATE USING (auth.uid()::text = id);

CREATE POLICY "Allow authenticated users to manage jobs" ON jobs FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to manage released_jobs" ON released_jobs FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to manage reviews" ON reviews FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to manage schedules" ON schedules FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to manage hiring_details" ON hiring_details FOR ALL USING (auth.role() = 'authenticated');

-- For public/anonymous access testing you can also run:
CREATE POLICY "Allow public read jobs" ON jobs FOR SELECT USING (true);
CREATE POLICY "Allow public insert jobs" ON jobs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update jobs" ON jobs FOR UPDATE USING (true);
