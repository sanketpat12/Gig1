import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext(null);

const DEFAULT_WORKERS = [
  {
    id: 'w1', role: 'worker', name: 'Rajesh Kumar', email: 'rajesh@example.com', password: 'pass123',
    city: 'Mumbai', locality: 'Andheri West', phone: '9876543210',
    skills: ['Plumbing', 'Electrical', 'Carpentry'],
    bio: 'Expert plumber and electrician with 8 years of experience.',
    hourlyRate: 350, availability: 'available', avatar: null,
    jobType: ['home', 'business'], experience: '8 years', jobsDone: 42,
  },
  {
    id: 'w2', role: 'worker', name: 'Priya Sharma', email: 'priya@example.com', password: 'pass123',
    city: 'Mumbai', locality: 'Bandra East', phone: '9123456780',
    skills: ['Cooking', 'Cleaning', 'Babysitting'],
    bio: 'Professional home helper with expertise in cooking and childcare.',
    hourlyRate: 250, availability: 'available', avatar: null,
    jobType: ['home'], experience: '5 years', jobsDone: 68,
  },
  {
    id: 'w3', role: 'worker', name: 'Suresh Patel', email: 'suresh@example.com', password: 'pass123',
    city: 'Mumbai', locality: 'Andheri West', phone: '9988776655',
    skills: ['Painting', 'Tiling', 'Masonry'],
    bio: 'Skilled mason and painter for home renovation projects.',
    hourlyRate: 400, availability: 'available', avatar: null,
    jobType: ['home', 'business'], experience: '10 years', jobsDone: 89,
  },
  {
    id: 'w4', role: 'worker', name: 'Kavita Raut', email: 'kavita@example.com', password: 'pass123',
    city: 'Pune', locality: 'Kothrud', phone: '9876512345',
    skills: ['Data Entry', 'Office Cleaning', 'Reception'],
    bio: 'Office support specialist available for business or personal tasks.',
    hourlyRate: 300, availability: 'busy', avatar: null,
    jobType: ['business'], experience: '4 years', jobsDone: 31,
  },
  {
    id: 'w5', role: 'worker', name: 'Amir Khan', email: 'amir@example.com', password: 'pass123',
    city: 'Delhi', locality: 'Dwarka Sector 10', phone: '9012345678',
    skills: ['Driving', 'Delivery', 'Logistics'],
    bio: 'Professional driver and delivery expert across Delhi NCR.',
    hourlyRate: 500, availability: 'available', avatar: null,
    jobType: ['home', 'business'], experience: '6 years', jobsDone: 120,
  },
];

const DEFAULT_EMPLOYER = {
  id: 'e-demo', role: 'employer', name: 'Demo Employer', email: 'employer@demo.com', password: 'demo123',
  phone: '9000000001', company: 'Demo Corp',
};

const DEFAULT_REVIEWS = [
  { id: 'r1', workerId: 'w1', employerId: 'e-demo', employerName: 'Demo Employer', rating: 5, comment: 'Rajesh fixed our kitchen sink perfectly! Very professional.', date: '2024-03-10' },
  { id: 'r2', workerId: 'w1', employerId: 'e-demo2', employerName: 'Anita Mehta', rating: 4, comment: 'Good work on electrical wiring. Timely and neat.', date: '2024-02-18' },
  { id: 'r3', workerId: 'w2', employerId: 'e-demo', employerName: 'Demo Employer', rating: 5, comment: 'Priya is amazing at cooking! Food was delicious.', date: '2024-03-05' },
  { id: 'r4', workerId: 'w3', employerId: 'e-demo3', employerName: 'Nikhil Shah', rating: 5, comment: 'Excellent painting work. Very clean and on time.', date: '2024-01-22' },
  { id: 'r5', workerId: 'w5', employerId: 'e-demo', employerName: 'Demo Employer', rating: 4, comment: 'Reliable driver, always on time. Recommended!', date: '2024-03-15' },
];

// Helper: build db payload matching schema columns only
const buildDbPayload = (userData) => ({
  id: userData.id,
  role: userData.role,
  name: userData.name,
  email: userData.email,
  password: userData.password,
  phone: userData.phone || '',
  company: userData.company || null,
  city: userData.city || null,
  locality: userData.locality || null,
  bio: userData.bio || null,
  skills: userData.skills || null,
  hourlyRate: userData.hourlyRate || 0,
  experience: userData.experience || null,
  jobType: userData.jobType || null,
  availability: userData.availability || 'available',
  jobsDone: userData.jobsDone || 0,
  portfolio: userData.portfolio || null
});

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([...DEFAULT_WORKERS, DEFAULT_EMPLOYER]);
  const [reviews, setReviews] = useState(DEFAULT_REVIEWS);
  const [jobs, setJobs] = useState([]);
  const [releasedJobs, setReleasedJobs] = useState([]);
  const [hiringDetails, setHiringDetails] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load ALL data from Supabase on mount
  useEffect(() => {
    async function loadData() {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        const [{ data: dbUsers }, { data: dbReviews }, { data: dbJobs }, { data: dbHirings }, { data: dbReleasedJobs }] = await Promise.all([
          supabase.from('users').select('*'),
          supabase.from('reviews').select('*'),
          supabase.from('jobs').select('*'),
          supabase.from('hiring_details').select('*'),
          supabase.from('released_jobs').select('*')
        ]);

        // Merge DB users with defaults (defaults act as demo/seed data)
        if (dbUsers && dbUsers.length > 0) {
          const defaultIds = [...DEFAULT_WORKERS, DEFAULT_EMPLOYER].map(u => u.id);
          const nonDefaultDbUsers = dbUsers.filter(u => !defaultIds.includes(u.id));
          setUsers([...DEFAULT_WORKERS, DEFAULT_EMPLOYER, ...nonDefaultDbUsers]);

          if (session?.user) {
            const activeProfile = dbUsers.find(u => u.id === session.user.id);
            if (activeProfile) setCurrentUser(activeProfile);
          }
        }
        if (dbReviews && dbReviews.length > 0) setReviews(dbReviews);
        if (dbJobs && dbJobs.length > 0) setJobs(dbJobs);
        if (dbHirings && dbHirings.length > 0) setHiringDetails(dbHirings);
        if (dbReleasedJobs && dbReleasedJobs.length > 0) setReleasedJobs(dbReleasedJobs);
      } catch (err) {
        console.warn('Failed to load from Supabase:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Listen for auth state changes (handles email confirmation callback ONLY)
  useEffect(() => {
    let isLoggingOut = false;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event);

      // Only handle email confirmation callback (when pending registration data exists)
      if (event === 'SIGNED_IN' && session?.user && !isLoggingOut) {
        const pendingRaw = sessionStorage.getItem('gig_pending_registration');
        if (pendingRaw) {
          // This is an email confirmation callback
          const { data: existingProfile } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (existingProfile) {
            setCurrentUser(existingProfile);
            setUsers(prev => {
              if (prev.find(u => u.id === existingProfile.id)) return prev;
              return [...prev, existingProfile];
            });
            sessionStorage.removeItem('gig_pending_registration');
          } else {
            // Profile not in DB yet, create it from pending data
            try {
              const pendingData = JSON.parse(pendingRaw);
              const newUser = { ...pendingData, id: session.user.id, jobsDone: 0 };
              const dbPayload = buildDbPayload(newUser);

              const { error: insertError } = await supabase.from('users').insert(dbPayload);
              if (!insertError) {
                setUsers(prev => [...prev, newUser]);
                setCurrentUser(newUser);
                sessionStorage.removeItem('gig_pending_registration');
              } else {
                console.warn('Failed to insert confirmed user profile:', insertError);
              }
            } catch (e) {
              console.warn('Error processing pending registration:', e);
            }
          }
        }
      }

      if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        isLoggingOut = false;
      }
    });

    // Expose the logging out flag via a custom method on window for the logout function
    window.__gigSetLoggingOut = () => { isLoggingOut = true; };

    return () => {
      subscription.unsubscribe();
      delete window.__gigSetLoggingOut;
    };
  }, []);

  const login = async (email, password, role) => {
    // Demo accounts (not in Supabase Auth)
    const demoUsers = [...DEFAULT_WORKERS, DEFAULT_EMPLOYER];
    const demoMatch = demoUsers.find(u => u.email === email && u.password === password && u.role === role);
    if (demoMatch) {
      setCurrentUser(demoMatch);
      return { success: true, user: demoMatch };
    }

    // Supabase Auth login
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) {
        return { success: false, message: authError.message };
      }
      if (authData?.user) {
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', authData.user.id)
          .single();

        if (profileError) {
          // Attempt to repair the missing profile
          const pendingRaw = sessionStorage.getItem('gig_pending_registration');
          let newUser = null;
          
          if (pendingRaw) {
             const pendingData = JSON.parse(pendingRaw);
             newUser = { ...pendingData, id: authData.user.id, jobsDone: 0 };
          } else {
             // Absolute fallback if no pending data: recreate a basic profile based on their Auth email + chosen login role
             newUser = {
               id: authData.user.id,
               role: role,
               name: email.split('@')[0], 
               email: email,
               password: password,
               phone: '1234567890', 
               jobsDone: 0
             };
          }
          
          const dbPayload = buildDbPayload(newUser);
          const { error: insertError } = await supabase.from('users').insert(dbPayload);
          
          if (!insertError) {
             setCurrentUser(newUser);
             setUsers(prev => [...prev, newUser]);
             if (pendingRaw) sessionStorage.removeItem('gig_pending_registration');
             return { success: true, user: newUser };
          }
          
          await supabase.auth.signOut();
          return { success: false, message: 'User profile not found. Please register again.' };
        }
        if (profile.role !== role) {
          await supabase.auth.signOut();
          return { success: false, message: `Account is registered as ${profile.role}.` };
        }
        setCurrentUser(profile);
        setUsers(prev => {
          if (prev.find(u => u.id === profile.id)) return prev;
          return [...prev, profile];
        });
        return { success: true, user: profile };
      }
    } catch (e) {
      return { success: false, message: 'Authentication error: ' + e.message };
    }

    return { success: false, message: 'Login failed. Please check your credentials.' };
  };

  const register = async (data) => {
    // Step 1: Try Supabase Auth signUp (email confirmation will be sent)
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });

      if (authError) {
        // If user already exists in Auth, try signing in
        if (authError.message.includes('already registered') || authError.message.includes('already been registered')) {
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: data.email,
            password: data.password,
          });

          if (signInError) {
            return { success: false, message: 'An account with this email already exists. Try logging in or use a different email.' };
          }

          const userId = signInData.user?.id;

          // Check if profile exists in DB
          const { data: existingProfile } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

          if (existingProfile) {
            setCurrentUser(existingProfile);
            setUsers(prev => {
              if (prev.find(u => u.id === existingProfile.id)) return prev;
              return [...prev, existingProfile];
            });
            return { success: true, user: existingProfile };
          }

          // Profile missing, create it now (user already confirmed)
          const { password, ...publicData } = data;
          const newUser = { ...publicData, password, id: userId, jobsDone: 0 };
          const dbPayload = buildDbPayload(newUser);

          const { error: insertError } = await supabase.from('users').insert(dbPayload);
          if (insertError) {
            return { success: false, message: 'Profile creation failed: ' + insertError.message };
          }
          setUsers(prev => [...prev, newUser]);
          setCurrentUser(newUser);
          return { success: true, user: newUser };
        }

        return { success: false, message: authError.message };
      }

      // Check if email confirmation is required
      // When confirm email is ON, identities may be empty or user won't have a confirmed session
      const needsConfirmation = authData.user && !authData.session;

      if (needsConfirmation) {
        // Store registration data in sessionStorage for after confirmation
        const { password, ...publicData } = data;
        sessionStorage.setItem('gig_pending_registration', JSON.stringify({ ...publicData, password }));

        return {
          success: false,
          confirmEmail: true,
          message: `We've sent a confirmation link to ${data.email}. Please check your inbox and click the link to complete registration.`
        };
      }

      // If no confirmation needed (confirm email is OFF), proceed directly
      const userId = authData.user?.id;
      if (!userId) {
        return { success: false, message: 'Failed to create account. Please try again.' };
      }

      const { password, ...publicData } = data;
      const newUser = { ...publicData, password, id: userId, jobsDone: 0 };
      const dbPayload = buildDbPayload(newUser);

      const { error: insertError } = await supabase.from('users').insert(dbPayload);
      if (insertError) {
        return { success: false, message: 'Profile creation failed: ' + insertError.message };
      }

      setUsers(prev => [...prev, newUser]);
      setCurrentUser(newUser);
      return { success: true, user: newUser };

    } catch (e) {
      return { success: false, message: e.message || 'Registration failed.' };
    }
  };

  const logout = async () => {
    // Signal the auth listener to ignore the next SIGNED_IN event
    if (window.__gigSetLoggingOut) window.__gigSetLoggingOut();
    setCurrentUser(null);
    sessionStorage.removeItem('gig_pending_registration');
    try { await supabase.auth.signOut(); } catch (e) {}
  };

  const updateUser = async (updated) => {
    try {
      const dbPayload = buildDbPayload(updated);
      await supabase.from('users').update(dbPayload).eq('id', updated.id);
    } catch (e) { console.warn('Supabase error on update', e); }

    setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
    setCurrentUser(updated);
  };

  const getWorkers = (filters = {}) => {
    let list = users.filter(u => u.role === 'worker');
    if (filters.city) list = list.filter(w => w.city?.toLowerCase() === filters.city.toLowerCase());
    if (filters.locality) list = list.filter(w => w.locality?.toLowerCase().includes(filters.locality.toLowerCase()));
    if (filters.jobType) list = list.filter(w => w.jobType?.includes(filters.jobType));
    if (filters.skill) list = list.filter(w => w.skills?.some(s => s.toLowerCase().includes(filters.skill.toLowerCase())));
    if (filters.availability) list = list.filter(w => w.availability === filters.availability);
    return list;
  };

  const getWorkerById = (id) => users.find(u => u.id === id);
  const getUserById = (id) => users.find(u => u.id === id);

  const getReviewsForWorker = (workerId) => reviews.filter(r => r.workerId === workerId);

  const getAvgRating = (workerId) => {
    const wReviews = getReviewsForWorker(workerId);
    if (!wReviews.length) return 0;
    return (wReviews.reduce((sum, r) => sum + r.rating, 0) / wReviews.length).toFixed(1);
  };

  const addReview = async (review) => {
    const newReview = { ...review, id: `rev_${Date.now()}`, date: new Date().toISOString().split('T')[0] };
    try {
      await supabase.from('reviews').insert(newReview);
      const worker = users.find(u => u.id === review.workerId);
      if (worker) {
        await supabase.from('users').update({ jobsDone: (worker.jobsDone || 0) + 1 }).eq('id', worker.id);
      }
    } catch (e) { console.warn('Supabase error on addReview', e); }

    setReviews(prev => [...prev, newReview]);
    setUsers(prev => prev.map(u => u.id === review.workerId ? { ...u, jobsDone: (u.jobsDone || 0) + 1 } : u));
    return newReview;
  };

  const postJob = async (jobData) => {
    const newJob = { ...jobData, id: `job_${Date.now()}`, status: jobData.status || 'open', createdAt: new Date().toISOString() };
    try {
      await supabase.from('jobs').insert(newJob);
    } catch (e) { console.warn('Supabase error on postJob', e); }

    setJobs(prev => [...prev, newJob]);
    return newJob;
  };

  const applyForJob = async (jobData) => {
    // Links a worker to an employer's open job with status 'applied'
    // We encode the rjobId in the jobs id so we can reference it when hiring
    const rjobIdPart = jobData.rjobId ? `_rjob_${jobData.rjobId}` : '';
    const newJob = { 
      ...jobData, 
      id: `job_${Date.now()}${rjobIdPart}`, 
      status: 'applied', 
      createdAt: new Date().toISOString() 
    };
    
    // Remove rjobId from payload since it's not a real DB column in jobs table
    delete newJob.rjobId;

    try {
      await supabase.from('jobs').insert(newJob);
    } catch (e) { console.warn('Supabase error on applyForJob', e); }

    setJobs(prev => [...prev, newJob]);
    return newJob;
  };

  const releaseJob = async (jobData) => {
    const newJob = { ...jobData, id: `rjob_${Date.now()}`, status: 'open', createdAt: new Date().toISOString() };
    try {
      await supabase.from('released_jobs').insert(newJob);
    } catch (e) { console.warn('Supabase error on releaseJob', e); }

    setReleasedJobs(prev => [newJob, ...prev]);
    return newJob;
  };

  const removeReleasedJob = async (rjobId) => {
    try {
      await supabase.from('released_jobs').delete().eq('id', rjobId);
    } catch (e) { console.warn('Supabase error on removeReleasedJob', e); }
    
    setReleasedJobs(prev => prev.filter(j => j.id !== rjobId));
  };

  const getJobsForEmployer = (employerId) => jobs.filter(j => j.employerId === employerId);
  const getJobsForWorker = (workerId) => jobs.filter(j => j.workerId === workerId);

  const updateJobStatus = async (jobId, status, extra = {}) => {
    try {
      await supabase.from('jobs').update({ status, ...extra }).eq('id', jobId);
    } catch (e) { console.warn('Supabase error on updateJobStatus', e); }
    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status, ...extra } : j));
  };

  // Worker accepts a hire request → generates a consistent 4-digit code based on jobId
  const acceptJob = async (jobId) => {
    // Generate deterministic code based on numeric part of jobId so employer and worker ALWAYS calculate the same code
    const numericPart = parseInt(jobId.replace(/\D/g, '') || '12345', 10);
    const code = String((numericPart * 37) % 9000 + 1000); // 4 digit code
    const statusWithCode = `accepted_${code}`;
    
    // Try to update Supabase. If this fails (e.g. testing with demo users), local state handles it.
    try {
      const { error } = await supabase.from('jobs').update({ status: statusWithCode }).eq('id', jobId);
      if (error) console.warn('Supabase error on acceptJob:', error.message);
    } catch (e) { console.warn('Supabase error on acceptJob', e); }
    
    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: statusWithCode, verifyCode: code } : j));
    return code;
  };

  // Employer enters the code worker tells them → marks attendance
  const verifyAttendanceCode = async (jobId, enteredCode) => {
    let correctCode = null;
    
    // 1. Try reading live status from Supabase
    try {
      const { data, error } = await supabase.from('jobs').select('status').eq('id', jobId).single();
      if (!error && data && data.status && data.status.startsWith('accepted_')) {
        correctCode = data.status.split('_')[1];
      }
    } catch (e) { console.warn('Supabase error reading code', e); }
    
    // 2. Fallback to local state
    if (!correctCode) {
      const job = jobs.find(j => j.id === jobId);
      if (job?.status?.startsWith('accepted_')) correctCode = job.status.split('_')[1];
      else if (job?.verifyCode) correctCode = job.verifyCode;
    }

    // 3. ULTIMATE FALLBACK: Calculate the deterministic code directly
    if (!correctCode) {
       const numericPart = parseInt(jobId.replace(/\D/g, '') || '12345', 10);
       correctCode = String((numericPart * 37) % 9000 + 1000);
    }
    
    // DEV BYPASS: Allow '0000' to succeed immediately for testing purposes
    if (enteredCode === '0000') {
      correctCode = '0000';
    }
    
    if (correctCode === enteredCode) {
      try {
        await supabase.from('jobs').update({ status: 'verified' }).eq('id', jobId);
      } catch (e) { console.warn('Supabase error on verifyAttendanceCode', e); }
      setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: 'verified' } : j));
      return { success: true, message: 'Attendance verified! Code matched.' };
    }
    return { success: false, message: `Incorrect code. (Expected: ${correctCode}). Please enter the correct code shown on the worker's screen.` };
  };

  const getCities = () => [...new Set(users.filter(u => u.role === 'worker' && u.city).map(u => u.city))];
  const getLocalities = (city) => [...new Set(users.filter(u => u.role === 'worker' && u.city?.toLowerCase() === city?.toLowerCase() && u.locality).map(u => u.locality))];

  const addHiringDetail = async (hiringData) => {
    const newDetail = { ...hiringData, id: `hire_${Date.now()}`, createdAt: new Date().toISOString() };
    try {
      await supabase.from('hiring_details').insert(newDetail);
    } catch (e) { console.warn('Supabase error on addHiringDetail', e); }
    setHiringDetails(prev => [...prev, newDetail]);
    return newDetail;
  };

  const getHiringDetailsForWorker = (workerId) => hiringDetails.filter(h => h.workerId === workerId);
  const getHiringDetailsForEmployer = (employerId) => hiringDetails.filter(h => h.employerId === employerId);

  return (
    <AuthContext.Provider value={{
      currentUser, users, reviews, jobs, releasedJobs, hiringDetails, loading,
      login, register, logout, updateUser,
      getWorkers, getWorkerById, getUserById,
      getReviewsForWorker, getAvgRating, addReview,
      postJob, releaseJob, removeReleasedJob, applyForJob, getJobsForEmployer, getJobsForWorker, updateJobStatus,
      acceptJob, verifyAttendanceCode,
      addHiringDetail, getHiringDetailsForWorker, getHiringDetailsForEmployer,
      getCities, getLocalities,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
