import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext(null);

const DEFAULT_EMPLOYER = {
  id: 'e-demo', role: 'employer', name: 'Demo Employer', email: 'employer@demo.com', password: 'demo123',
  phone: '9000000001', company: 'Demo Corp',
};

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

const DEFAULT_REVIEWS = [
  { id: 'r1', workerId: 'w1', employerId: 'e-demo', employerName: 'Demo Employer', rating: 5, comment: 'Rajesh fixed our kitchen sink perfectly! Very professional.', date: '2024-03-10' },
  { id: 'r2', workerId: 'w1', employerId: 'e-demo2', employerName: 'Anita Mehta', rating: 4, comment: 'Good work on electrical wiring. Timely and neat.', date: '2024-02-18' },
  { id: 'r3', workerId: 'w2', employerId: 'e-demo', employerName: 'Demo Employer', rating: 5, comment: 'Priya is amazing at cooking! Food was delicious.', date: '2024-03-05' },
  { id: 'r4', workerId: 'w3', employerId: 'e-demo3', employerName: 'Nikhil Shah', rating: 5, comment: 'Excellent painting work. Very clean and on time.', date: '2024-01-22' },
  { id: 'r5', workerId: 'w5', employerId: 'e-demo', employerName: 'Demo Employer', rating: 4, comment: 'Reliable driver, always on time. Recommended!', date: '2024-03-15' },
];

function getStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}
function setStorage(key, val) {
  localStorage.setItem(key, JSON.stringify(val));
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => getStorage('gig_user', null));
  const [users, setUsers] = useState(() => {
    const stored = getStorage('gig_users', null);
    const defaults = [...DEFAULT_WORKERS, DEFAULT_EMPLOYER];
    if (!stored || stored.length === 0) return defaults;
    // Ensure default workers and demo employer are always present
    const hasWorkers = stored.some(u => u.role === 'worker');
    const hasDemoEmployer = stored.some(u => u.id === 'e-demo');
    let list = stored;
    if (!hasWorkers) list = [...DEFAULT_WORKERS, ...list.filter(u => u.role !== 'worker')];
    if (!hasDemoEmployer) list = [DEFAULT_EMPLOYER, ...list.filter(u => u.id !== 'e-demo')];
    return list;
  });
  const [reviews, setReviews] = useState(() => getStorage('gig_reviews', DEFAULT_REVIEWS));
  const [jobs, setJobs] = useState(() => getStorage('gig_jobs', []));

  // Load from Supabase on mount
  useEffect(() => {
    async function loadData() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        const [{ data: dbUsers }, { data: dbReviews }, { data: dbJobs }] = await Promise.all([
          supabase.from('users').select('*'),
          supabase.from('reviews').select('*'),
          supabase.from('jobs').select('*')
        ]);
        
        if (dbUsers && dbUsers.length > 0) {
          setUsers(dbUsers);
          if (session?.user) {
            const activeProfile = dbUsers.find(u => u.id === session.user.id);
            if (activeProfile) setCurrentUser(activeProfile);
          }
        }
        if (dbReviews && dbReviews.length > 0) setReviews(dbReviews);
        if (dbJobs && dbJobs.length > 0) setJobs(dbJobs);
      } catch (err) {
        console.warn('Failed to load from Supabase:', err);
      }
    }
    loadData();
  }, []);

  useEffect(() => { setStorage('gig_users', users); }, [users]);
  useEffect(() => { setStorage('gig_reviews', reviews); }, [reviews]);
  useEffect(() => { setStorage('gig_jobs', jobs); }, [jobs]);
  useEffect(() => { setStorage('gig_user', currentUser); }, [currentUser]);

  const login = async (email, password, role) => {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (!authError && authData?.user) {
        const { data, error } = await supabase.from('users').select('*').eq('id', authData.user.id).single();
        if (data) {
          if (data.role !== role) {
            await supabase.auth.signOut();
            return { success: false, message: `Account is registered as ${data.role}.` };
          }
          setCurrentUser(data);
          return { success: true, user: data };
        }
      } else {
        console.warn('Supabase login error:', authError?.message);
      }
    } catch (e) {
      console.warn('Supabase error, trying local auth...', e);
    }
    
    // Fallback to local
    const user = users.find(u => u.email === email && u.password === password && u.role === role);
    if (!user) return { success: false, message: 'Invalid credentials or wrong role.' };
    setCurrentUser(user);
    return { success: true, user };
  };

  const register = async (data) => {
    let userId = `u_${Date.now()}`;
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });
      if (authError) {
        console.warn('Supabase auth signup failed:', authError.message);
      } else {
        userId = authData.user?.id || userId;
      }
    } catch (e) {
      console.warn('Supabase auth exception, proceeding locally...', e);
    }

    if (users.find(u => u.email === data.email)) {
      return { success: false, message: 'Email already registered.' };
    }

    const { password, ...publicData } = data;
    const newUser = { ...publicData, password, id: userId, jobsDone: 0 };
    
    try {
      await supabase.from('users').insert(newUser);
    } catch (e) { console.warn('Supabase schema insert failed', e); }
    
    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    return { success: true, user: newUser };
  };

  const logout = async () => {
    try { await supabase.auth.signOut(); } catch (e) {}
    setCurrentUser(null);
  };

  const updateUser = async (updated) => {
    try {
      await supabase.from('users').update(updated).eq('id', updated.id);
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
    // Increment jobsDone for worker
    setUsers(prev => prev.map(u => u.id === review.workerId ? { ...u, jobsDone: (u.jobsDone || 0) + 1 } : u));
    return newReview;
  };

  const postJob = async (jobData) => {
    const newJob = { ...jobData, id: `job_${Date.now()}`, status: 'open', createdAt: new Date().toISOString() };
    try {
      await supabase.from('jobs').insert(newJob);
    } catch (e) { console.warn('Supabase error on postJob', e); }
    
    setJobs(prev => [...prev, newJob]);
    return newJob;
  };

  const getJobsForEmployer = (employerId) => jobs.filter(j => j.employerId === employerId);
  const getJobsForWorker = (workerId) => jobs.filter(j => j.workerId === workerId);

  const updateJobStatus = async (jobId, status) => {
    try {
      await supabase.from('jobs').update({ status }).eq('id', jobId);
    } catch (e) { console.warn('Supabase error on updateJobStatus', e); }
    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status } : j));
  };

  const getCities = () => [...new Set(users.filter(u => u.role === 'worker' && u.city).map(u => u.city))];
  const getLocalities = (city) => [...new Set(users.filter(u => u.role === 'worker' && u.city?.toLowerCase() === city?.toLowerCase() && u.locality).map(u => u.locality))];

  return (
    <AuthContext.Provider value={{
      currentUser, users, reviews, jobs,
      login, register, logout, updateUser,
      getWorkers, getWorkerById,
      getReviewsForWorker, getAvgRating, addReview,
      postJob, getJobsForEmployer, getJobsForWorker, updateJobStatus,
      getCities, getLocalities,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
