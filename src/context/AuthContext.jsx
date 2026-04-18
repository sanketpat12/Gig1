import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext(null);

const DEFAULT_WORKERS = [
  {
    id: 'w1', role: 'worker', name: 'Rajesh Kumar', email: 'rajesh@example.com', password: 'pass123',
    city: 'Mumbai', locality: 'Andheri West', phone: '9876543210',
    skills: ['Plumbing', 'Electrical', 'Carpentry'],
    bio: 'Expert plumber and electrician with 8 years of experience.',
    hourlyRate: 350, availability: 'available', avatar: null,
    jobType: ['home', 'home'], experience: '8 years', jobsDone: 42,
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
    jobType: ['home', 'home'], experience: '10 years', jobsDone: 89,
  },
  {
    id: 'w4', role: 'worker', name: 'Kavita Raut', email: 'kavita@example.com', password: 'pass123',
    city: 'Pune', locality: 'Kothrud', phone: '9876512345',
    skills: ['Data Entry', 'Office Cleaning', 'Reception'],
    bio: 'Office support specialist available for home or personal tasks.',
    hourlyRate: 300, availability: 'busy', avatar: null,
    jobType: ['home'], experience: '4 years', jobsDone: 31,
  },
  {
    id: 'w5', role: 'worker', name: 'Amir Khan', email: 'amir@example.com', password: 'pass123',
    city: 'Delhi', locality: 'Dwarka Sector 10', phone: '9012345678',
    skills: ['Driving', 'Delivery', 'Logistics'],
    bio: 'Professional driver and delivery expert across Delhi NCR.',
    hourlyRate: 500, availability: 'available', avatar: null,
    jobType: ['home', 'home'], experience: '6 years', jobsDone: 120,
  },
];

const DEFAULT_EMPLOYER = {
  id: 'e-demo', role: 'employer', name: 'Demo Employer', email: 'employer@demo.com', password: 'demo123',
  phone: '9000000001', company: 'Demo Corp',
};

const DEFAULT_USERS = [...DEFAULT_WORKERS, DEFAULT_EMPLOYER];
const DEFAULT_USER_IDS = new Set(DEFAULT_USERS.map((user) => user.id));
const DEMO_USER_STORAGE_KEY = 'gig_demo_user';
const AUTH_BOOTSTRAP_TIMEOUT_MS = 4000;
const AUTH_REQUEST_TIMEOUT_MS = 15000;

const JOB_MUTATION_GRACE_MS = 8000;

const DEFAULT_REVIEWS = [
  { id: 'r1', workerId: 'w1', employerId: 'e-demo', employerName: 'Demo Employer', rating: 5, comment: 'Rajesh fixed our kitchen sink perfectly! Very professional.', date: '2024-03-10' },
  { id: 'r2', workerId: 'w1', employerId: 'e-demo2', employerName: 'Anita Mehta', rating: 4, comment: 'Good work on electrical wiring. Timely and neat.', date: '2024-02-18' },
  { id: 'r3', workerId: 'w2', employerId: 'e-demo', employerName: 'Demo Employer', rating: 5, comment: 'Priya is amazing at cooking! Food was delicious.', date: '2024-03-05' },
  { id: 'r4', workerId: 'w3', employerId: 'e-demo3', employerName: 'Nikhil Shah', rating: 5, comment: 'Excellent painting work. Very clean and on time.', date: '2024-01-22' },
  { id: 'r5', workerId: 'w5', employerId: 'e-demo', employerName: 'Demo Employer', rating: 4, comment: 'Reliable driver, always on time. Recommended!', date: '2024-03-15' },
];

const isDemoUserId = (id) => DEFAULT_USER_IDS.has(id);

const mergeUsersById = (...groups) => {
  const merged = new Map();

  groups.forEach((group) => {
    if (!group) return;

    const users = Array.isArray(group) ? group : [group];
    users.forEach((user) => {
      if (user?.id) merged.set(user.id, user);
    });
  });

  return Array.from(merged.values());
};

const readStoredDemoUser = () => {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(DEMO_USER_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    return isDemoUserId(parsed?.id) ? parsed : null;
  } catch (error) {
    console.warn('Failed to restore demo user from storage:', error);
    return null;
  }
};

const persistDemoUser = (user) => {
  if (typeof window === 'undefined') return;

  if (user && isDemoUserId(user.id)) {
    window.localStorage.setItem(DEMO_USER_STORAGE_KEY, JSON.stringify(user));
    return;
  }

  window.localStorage.removeItem(DEMO_USER_STORAGE_KEY);
};

const withTimeout = async (promise, fallbackValue, label, timeoutMs = AUTH_BOOTSTRAP_TIMEOUT_MS) => {
  let timerId;

  try {
    return await Promise.race([
      promise,
      new Promise((resolve) => {
        timerId = globalThis.setTimeout(() => {
          console.warn(`${label} timed out after ${timeoutMs}ms`);
          resolve(fallbackValue);
        }, timeoutMs);
      }),
    ]);
  } finally {
    if (timerId) globalThis.clearTimeout(timerId);
  }
};

const safeSelectTable = async (table) => {
  try {
    const { data, error } = await supabase.from(table).select('*');
    if (error) {
      console.warn(`Failed to load ${table} from Supabase:`, error.message);
      return [];
    }

    return data ?? [];
  } catch (error) {
    console.warn(`Failed to load ${table} from Supabase:`, error);
    return [];
  }
};

const safeSelectTableSnapshot = async (table) => {
  try {
    const { data, error } = await supabase.from(table).select('*');
    if (error) {
      console.warn(`Failed to sync ${table} from Supabase:`, error.message);
      return null;
    }

    return data ?? [];
  } catch (error) {
    console.warn(`Failed to sync ${table} from Supabase:`, error);
    return null;
  }
};

const fetchUserProfile = async (userId) => {
  if (!userId) return null;

  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.warn('Failed to load user profile from Supabase:', error.message);
      return null;
    }

    return data ?? null;
  } catch (error) {
    console.warn('Failed to load user profile from Supabase:', error);
    return null;
  }
};

const buildFallbackUserFromSession = (sessionUser) => {
  const metadata = sessionUser?.user_metadata || {};
  const role = typeof metadata.role === 'string' ? metadata.role : '';

  if (!role) return null;

  return {
    id: sessionUser.id,
    role,
    name: metadata.name || sessionUser.email?.split('@')[0] || 'User',
    email: sessionUser.email || '',
    phone: metadata.phone || '',
    company: metadata.company || null,
    city: metadata.city || null,
    locality: metadata.locality || null,
    bio: metadata.bio || null,
    skills: Array.isArray(metadata.skills) ? metadata.skills : null,
    hourlyRate: Number(metadata.hourlyRate) || 0,
    experience: metadata.experience || null,
    jobType: Array.isArray(metadata.jobType) ? metadata.jobType : null,
    availability: metadata.availability || 'available',
    jobsDone: Number(metadata.jobsDone) || 0,
    portfolio: metadata.portfolio || null,
    availableSlots: Array.isArray(metadata.availableSlots) ? metadata.availableSlots : null,
  };
};

const isRlsError = (error) =>
  error?.code === '42501' || /row-level security/i.test(error?.message || '');

const getProfilePersistenceErrorMessage = (error, fallbackMessage) => {
  if (!error) return fallbackMessage;
  if (isRlsError(error)) {
    return 'Supabase Row Level Security is blocking profile creation. Run supabase_auth_fix.sql in the Supabase SQL Editor, then try again.';
  }

  return error.message || fallbackMessage;
};

const extractVerificationCode = (status) =>
  typeof status === 'string' && status.startsWith('accepted_')
    ? status.slice('accepted_'.length)
    : null;

const isAcceptedJobStatus = (status) =>
  status === 'accepted' || (
    typeof status === 'string' && status.startsWith('accepted_')
  );

const getStoredJobVerificationCode = (job) => {
  if (!job) return null;
  return job.verifyCode || extractVerificationCode(job.status) || null;
};

const normalizeJobRecord = (job) => {
  if (!job) return job;

  const legacyCode = extractVerificationCode(job.status);
  if (!legacyCode) return job;

  return {
    ...job,
    status: 'accepted',
    verifyCode: job.verifyCode || legacyCode,
  };
};

const normalizeJobs = (items = []) => items.map(normalizeJobRecord);

const generateVerificationCode = () =>
  String(Math.floor(1000 + Math.random() * 9000));

const getJobStatusPriority = (status) => {
  if (!status) return 0;
  if (status === 'applied') return 1;
  if (status === 'open') return 2;
  if (isAcceptedJobStatus(status)) return 3;
  if (status === 'verified') return 4;
  if (status === 'completed') return 5;
  if (status === 'rejected') return 6;
  return 0;
};

// Helper: keep the payload aligned with the columns the app actively depends on.
const buildDbPayload = (userData) => {
  const payload = {
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
    hourlyRate: Number(userData.hourlyRate) || 0,
    experience: userData.experience || null,
    jobType: userData.jobType || null,
    availability: userData.availability || 'available',
    jobsDone: Number(userData.jobsDone) || 0,
    portfolio: userData.portfolio || null,
  };

  if (Object.prototype.hasOwnProperty.call(userData, 'availableSlots')) {
    payload.availableSlots = Array.isArray(userData.availableSlots) ? userData.availableSlots : [];
  }

  return payload;
};

const buildReleasedJobPayload = (jobData) => ({
  employerId: jobData.employerId,
  employerName: jobData.employerName,
  title: jobData.title,
  typeOfWork: jobData.typeOfWork || 'home',
  duration: jobData.duration || '',
  budget: jobData.budget || '',
  location: jobData.location || '',
  skills: Array.isArray(jobData.skills) ? jobData.skills : [],
  status: jobData.status || 'open',
});

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState(DEFAULT_USERS);
  const [reviews, setReviews] = useState(DEFAULT_REVIEWS);
  const [jobs, setJobs] = useState([]);
  const [releasedJobs, setReleasedJobs] = useState([]);
  const [hiringDetails, setHiringDetails] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const recentJobMutationsRef = useRef(new Map());

  const syncCurrentUser = (user) => {
    setCurrentUser(user);
    persistDemoUser(user);
  };

  const rememberJobMutation = (jobId, patch = {}) => {
    if (!jobId) return;

    recentJobMutationsRef.current.set(jobId, {
      timestamp: Date.now(),
      patch,
    });
  };

  // Load ALL data from Supabase on mount
  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        const [
          { data: { session }, error: sessionError },
          dbUsers,
          dbReviews,
          dbJobs,
          dbHirings,
          dbReleasedJobs,
          dbSchedules,
        ] = await Promise.all([
          withTimeout(
            supabase.auth.getSession(),
            { data: { session: null }, error: null },
            'Supabase session restore'
          ),
          withTimeout(safeSelectTable('users'), [], 'Supabase users load'),
          withTimeout(safeSelectTable('reviews'), [], 'Supabase reviews load'),
          withTimeout(safeSelectTable('jobs'), [], 'Supabase jobs load'),
          withTimeout(safeSelectTable('hiring_details'), [], 'Supabase hiring details load'),
          withTimeout(safeSelectTable('released_jobs'), [], 'Supabase released jobs load'),
          withTimeout(safeSelectTable('schedules'), [], 'Supabase schedules load'),
        ]);

        if (sessionError) {
          console.warn('Failed to restore Supabase session:', sessionError.message);
        }

        if (cancelled) return;

        const mergedUsers = mergeUsersById(DEFAULT_USERS, dbUsers);
        let restoredUser = null;

        if (session?.user) {
          restoredUser =
            mergedUsers.find((user) => user.id === session.user.id) ||
            await withTimeout(fetchUserProfile(session.user.id), null, 'Supabase profile restore') ||
            buildFallbackUserFromSession(session.user);
        } else {
          restoredUser = readStoredDemoUser();
        }

        if (cancelled) return;

        setUsers(restoredUser ? mergeUsersById(mergedUsers, restoredUser) : mergedUsers);
        if (dbReviews.length > 0) setReviews(dbReviews);
        if (dbJobs.length > 0) setJobs(normalizeJobs(dbJobs));
        if (dbHirings.length > 0) setHiringDetails(dbHirings);
        if (dbReleasedJobs.length > 0) setReleasedJobs(dbReleasedJobs);
        if (dbSchedules.length > 0) setSchedules(dbSchedules);
        syncCurrentUser(restoredUser || null);
      } catch (err) {
        console.warn('Failed to load from Supabase:', err);
        if (!cancelled) {
          const storedDemoUser = readStoredDemoUser();
          if (storedDemoUser) {
            setUsers(mergeUsersById(DEFAULT_USERS, storedDemoUser));
          }
          syncCurrentUser(storedDemoUser || null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  // Keep auth state and local profile state in sync.
  useEffect(() => {
    let isLoggingOut = false;
    let cancelled = false;

    const handleAuthStateChange = async (event, session) => {
      if (cancelled) return;
      if (event === 'SIGNED_OUT') {
        syncCurrentUser(null);
        isLoggingOut = false;
        return;
      }

      if (!session?.user || isLoggingOut) {
        return;
      }

      const pendingRaw = sessionStorage.getItem('gig_pending_registration');
      if (pendingRaw) {
        const existingProfile = await fetchUserProfile(session.user.id);

        if (existingProfile) {
          setUsers(prev => mergeUsersById(prev, existingProfile));
          syncCurrentUser(existingProfile);
          sessionStorage.removeItem('gig_pending_registration');
          return;
        }

        try {
          const pendingData = JSON.parse(pendingRaw);
          const newUser = { ...pendingData, id: session.user.id, jobsDone: 0 };
          const dbPayload = buildDbPayload(newUser);

          const { error: insertError } = await supabase.from('users').insert(dbPayload);
          if (!insertError) {
            setUsers(prev => mergeUsersById(prev, newUser));
            syncCurrentUser(newUser);
            sessionStorage.removeItem('gig_pending_registration');
            return;
          }

          console.warn('Failed to insert confirmed user profile:', insertError);
        } catch (error) {
          console.warn('Error processing pending registration:', error);
        }
      }

      const restoredProfile = await fetchUserProfile(session.user.id);
      const sessionUser = restoredProfile || buildFallbackUserFromSession(session.user);

      if (sessionUser) {
        setUsers(prev => mergeUsersById(prev, sessionUser));
        syncCurrentUser(sessionUser);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth event:', event);

      globalThis.setTimeout(() => {
        void handleAuthStateChange(event, session);
      }, 0);
    });

    // Expose the logging out flag via a custom method on window for the logout function
    window.__gigSetLoggingOut = () => { isLoggingOut = true; };

    return () => {
      cancelled = true;
      subscription.unsubscribe();
      delete window.__gigSetLoggingOut;
    };
  }, []);

  useEffect(() => {
    if (!currentUser || isDemoUserId(currentUser.id) || typeof window === 'undefined') {
      return undefined;
    }

    let cancelled = false;

    const syncRemoteState = async () => {
      const [dbUsers, dbJobs, dbReleasedJobs, dbSchedules, dbReviews] = await Promise.all([
        withTimeout(safeSelectTableSnapshot('users'), null, 'Supabase users sync'),
        withTimeout(safeSelectTableSnapshot('jobs'), null, 'Supabase jobs sync'),
        withTimeout(safeSelectTableSnapshot('released_jobs'), null, 'Supabase released jobs sync'),
        withTimeout(safeSelectTableSnapshot('schedules'), null, 'Supabase schedules sync'),
        withTimeout(safeSelectTableSnapshot('reviews'), null, 'Supabase reviews sync'),
      ]);

      if (cancelled) return;

      if (dbUsers) {
        setUsers(mergeUsersById(DEFAULT_USERS, dbUsers, currentUser));
      }

      if (dbJobs) {
        const normalizedRemoteJobs = normalizeJobs(dbJobs);

        setJobs((prev) => {
          const now = Date.now();
          const localJobsById = new Map(prev.map((job) => [job.id, job]));
          const syncedJobs = normalizedRemoteJobs.map((remoteJob) => {
            const mutation = recentJobMutationsRef.current.get(remoteJob.id);
            if (!mutation) return remoteJob;

            if (now - mutation.timestamp > JOB_MUTATION_GRACE_MS) {
              recentJobMutationsRef.current.delete(remoteJob.id);
              return remoteJob;
            }

            const localJob = localJobsById.get(remoteJob.id);
            if (!localJob) return remoteJob;

            const localStatus = localJob.status;
            const remoteStatus = remoteJob.status;
            const keepLocalStatus =
              localStatus &&
              localStatus !== remoteStatus &&
              getJobStatusPriority(localStatus) > getJobStatusPriority(remoteStatus);

            if (!keepLocalStatus) return remoteJob;

            return {
              ...remoteJob,
              ...mutation.patch,
              status: localStatus,
              verifyCode: localJob.verifyCode ?? remoteJob.verifyCode,
              verifiedAt: localJob.verifiedAt ?? remoteJob.verifiedAt,
            };
          });

          const syncedJobIds = new Set(syncedJobs.map((job) => job.id));
          const pendingLocalJobs = prev.filter((localJob) => {
            if (syncedJobIds.has(localJob.id)) return false;

            const mutation = recentJobMutationsRef.current.get(localJob.id);
            if (!mutation) return false;

            if (now - mutation.timestamp > JOB_MUTATION_GRACE_MS) {
              recentJobMutationsRef.current.delete(localJob.id);
              return false;
            }

            return true;
          });

          return [...syncedJobs, ...pendingLocalJobs];
        });
      }

      if (dbReleasedJobs) setReleasedJobs(dbReleasedJobs);
      if (dbSchedules) setSchedules(dbSchedules);
      if (dbReviews) setReviews(dbReviews);
    };

    const triggerSync = () => {
      void syncRemoteState();
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) triggerSync();
    };

    triggerSync();

    window.addEventListener('focus', triggerSync);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    const realtimeChannel = supabase
      .channel(`gignav-live-sync-${currentUser.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'jobs' }, triggerSync)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'released_jobs' }, triggerSync)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'schedules' }, triggerSync)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, triggerSync)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reviews' }, triggerSync)
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') triggerSync();
      });

    return () => {
      cancelled = true;
      window.removeEventListener('focus', triggerSync);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      void supabase.removeChannel(realtimeChannel);
    };
  }, [currentUser?.id]);

  const login = async (email, password, role) => {
    // Demo accounts (not in Supabase Auth)
    const demoUsers = DEFAULT_USERS;
    const demoMatch = demoUsers.find(u => u.email === email && u.password === password && u.role === role);
    if (demoMatch) {
      setUsers(prev => mergeUsersById(prev, demoMatch));
      syncCurrentUser(demoMatch);
      return { success: true, user: demoMatch };
    }

    // Supabase Auth login
    try {
      const { data: authData, error: authError } = await withTimeout(
        supabase.auth.signInWithPassword({ email, password }),
        { data: null, error: { message: 'Login request timed out. Please try again.' } },
        'Supabase login',
        AUTH_REQUEST_TIMEOUT_MS
      );
      if (authError) {
        return { success: false, message: authError.message };
      }
      if (authData?.user) {
        const profile = await withTimeout(
          fetchUserProfile(authData.user.id),
          null,
          'Supabase login profile lookup',
          AUTH_REQUEST_TIMEOUT_MS
        );

        if (!profile) {
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
          const { error: insertError } = await withTimeout(
            supabase.from('users').insert(dbPayload),
            { error: { message: 'Profile creation timed out. Please try again.' } },
            'Supabase login profile insert',
            AUTH_REQUEST_TIMEOUT_MS
          );
          
          if (!insertError) {
             setUsers(prev => mergeUsersById(prev, newUser));
             syncCurrentUser(newUser);
             if (pendingRaw) sessionStorage.removeItem('gig_pending_registration');
             return { success: true, user: newUser };
          }
          
          await supabase.auth.signOut();
          return {
            success: false,
            message: getProfilePersistenceErrorMessage(insertError, 'User profile not found. Please register again.'),
          };
        }
        if (profile.role !== role) {
          await supabase.auth.signOut();
          return { success: false, message: `Account is registered as ${profile.role}.` };
        }
        setUsers(prev => mergeUsersById(prev, profile));
        syncCurrentUser(profile);
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
      const { data: authData, error: authError } = await withTimeout(
        supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: {
              role: data.role,
              name: data.name,
              phone: data.phone || '',
              company: data.company || null,
              city: data.city || null,
              locality: data.locality || null,
              experience: data.experience || null,
              jobType: data.jobType || null,
            },
          },
        }),
        { data: null, error: { message: 'Registration request timed out. Please try again.' } },
        'Supabase sign up',
        AUTH_REQUEST_TIMEOUT_MS
      );

      if (authError) {
        // If user already exists in Auth, try signing in
        if (authError.message.includes('already registered') || authError.message.includes('already been registered')) {
          const { data: signInData, error: signInError } = await withTimeout(
            supabase.auth.signInWithPassword({
              email: data.email,
              password: data.password,
            }),
            { data: null, error: { message: 'Login request timed out. Please try again.' } },
            'Supabase existing-user sign in',
            AUTH_REQUEST_TIMEOUT_MS
          );

          if (signInError) {
            return { success: false, message: 'An account with this email already exists. Try logging in or use a different email.' };
          }

          const userId = signInData.user?.id;

          // Check if profile exists in DB
          const existingProfile = await withTimeout(
            fetchUserProfile(userId),
            null,
            'Supabase existing-user profile lookup',
            AUTH_REQUEST_TIMEOUT_MS
          );

          if (existingProfile) {
            setUsers(prev => mergeUsersById(prev, existingProfile));
            syncCurrentUser(existingProfile);
            return { success: true, user: existingProfile };
          }

          // Profile missing, create it now (user already confirmed)
          const { password, ...publicData } = data;
          const newUser = { ...publicData, password, id: userId, jobsDone: 0 };
          const dbPayload = buildDbPayload(newUser);

          const { error: insertError } = await withTimeout(
            supabase.from('users').insert(dbPayload),
            { error: { message: 'Profile creation timed out. Please try again.' } },
            'Supabase existing-user profile insert',
            AUTH_REQUEST_TIMEOUT_MS
          );
          if (insertError) {
            return {
              success: false,
              message: getProfilePersistenceErrorMessage(insertError, 'Profile creation failed.'),
            };
          }
          setUsers(prev => mergeUsersById(prev, newUser));
          syncCurrentUser(newUser);
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

      const { error: insertError } = await withTimeout(
        supabase.from('users').insert(dbPayload),
        { error: { message: 'Profile creation timed out. Please try again.' } },
        'Supabase registration profile insert',
        AUTH_REQUEST_TIMEOUT_MS
      );
      if (insertError) {
        return {
          success: false,
          message: getProfilePersistenceErrorMessage(insertError, 'Profile creation failed.'),
        };
      }

      setUsers(prev => mergeUsersById(prev, newUser));
      syncCurrentUser(newUser);
      return { success: true, user: newUser };

    } catch (e) {
      return { success: false, message: e.message || 'Registration failed.' };
    }
  };

  const logout = async () => {
    // Signal the auth listener to ignore the next SIGNED_IN event
    if (window.__gigSetLoggingOut) window.__gigSetLoggingOut();
    syncCurrentUser(null);
    sessionStorage.removeItem('gig_pending_registration');
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.warn('Supabase sign-out error:', error);
    }
  };

  const updateUser = async (updated) => {
    try {
      const dbPayload = buildDbPayload(updated);
      await supabase.from('users').update(dbPayload).eq('id', updated.id);
    } catch (e) { console.warn('Supabase error on update', e); }

    setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
    syncCurrentUser(updated);
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

  // Refresh workers list from Supabase (so employer sees newly registered workers)
  const refreshWorkers = async () => {
    try {
      const { data: dbUsers, error } = await supabase.from('users').select('*').eq('role', 'worker');
      if (error || !dbUsers) return;
      setUsers(prev => {
        const nonWorkers = prev.filter(u => u.role !== 'worker');
        return mergeUsersById(nonWorkers, DEFAULT_WORKERS, dbUsers);
      });
    } catch (e) { console.warn('refreshWorkers failed', e); }
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
    const newJob = {
      ...buildReleasedJobPayload(jobData),
      id: `rjob_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    try {
      await supabase.from('released_jobs').insert(newJob);
    } catch (e) { console.warn('Supabase error on releaseJob', e); }

    setReleasedJobs(prev => [newJob, ...prev]);
    return newJob;
  };

  const updateReleasedJob = async (updatedJob) => {
    const payload = buildReleasedJobPayload(updatedJob);

    try {
      await supabase.from('released_jobs').update(payload).eq('id', updatedJob.id);
    } catch (e) { console.warn('Supabase error on updateReleasedJob', e); }

    const mergedJob = { ...updatedJob, ...payload };
    setReleasedJobs(prev => prev.map(job => job.id === updatedJob.id ? mergedJob : job));
    return mergedJob;
  };

  const removeReleasedJob = async (rjobId) => {
    const releasedJobSuffix = `_rjob_${rjobId}`;

    try {
      await supabase.from('released_jobs').delete().eq('id', rjobId);
    } catch (e) { console.warn('Supabase error on removeReleasedJob', e); }

    try {
      await supabase.from('jobs').delete().eq('status', 'applied').like('id', `%${releasedJobSuffix}`);
    } catch (e) { console.warn('Supabase error on removeReleasedJob cleanup', e); }
    
    setReleasedJobs(prev => prev.filter(j => j.id !== rjobId));
    setJobs(prev => prev.filter(job => !(job.id?.includes(releasedJobSuffix) && job.status === 'applied')));
  };

  const getJobsForEmployer = (employerId) => jobs.filter(j => j.employerId === employerId);
  const getJobsForWorker = (workerId) => jobs.filter(j => j.workerId === workerId);

  const updateJobStatus = async (jobId, status, extra = {}) => {
    try {
      await supabase.from('jobs').update({ status, ...extra }).eq('id', jobId);
    } catch (e) { console.warn('Supabase error on updateJobStatus', e); }
    rememberJobMutation(jobId, { status, ...extra });
    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status, ...extra } : j));
  };

  const deleteJob = async (jobId) => {
    try {
      await supabase.from('jobs').delete().eq('id', jobId);
    } catch (e) { console.warn('Supabase error on deleteJob', e); }
    setJobs(prev => prev.filter(j => j.id !== jobId));
  };

  const clearCompletedJobs = async (userId, role) => {
    try {
      const q = supabase.from('jobs').delete().eq('status', 'completed');
      if (role === 'employer') q.eq('employerId', userId);
      else q.eq('workerId', userId);
      await q;
    } catch (e) { console.warn('Supabase error on clearCompletedJobs', e); }
    
    setJobs(prev => prev.filter(j => {
      if (j.status !== 'completed') return true;
      if (role === 'employer') return j.employerId !== userId;
      return j.workerId !== userId;
    }));
  };

  // Worker accepts a hire request → generates a consistent 4-digit code based on jobId
  const updateJobWithSelect = async (jobId, payload) => {
    const { data, error } = await supabase
      .from('jobs')
      .update(payload)
      .eq('id', jobId)
      .select('id, status')
      .maybeSingle();

    if (error) {
      return { success: false, error };
    }

    if (!data?.id) {
      return {
        success: false,
        error: { message: 'The job could not be updated in Supabase.' },
      };
    }

    return { success: true, data: normalizeJobRecord(data) };
  };

  const acceptJob = async (jobId) => {
    const code = generateVerificationCode();
    const acceptedPatch = { status: 'accepted', verifyCode: code };
    let persistedRemotely = false;
    let lastError = null;

    try {
      const acceptedResult = await updateJobWithSelect(jobId, acceptedPatch);
      if (acceptedResult.success) {
        persistedRemotely = true;
      } else {
        lastError = acceptedResult.error;

        const legacyResult = await updateJobWithSelect(jobId, { status: `accepted_${code}` });
        if (legacyResult.success) {
          persistedRemotely = true;
        } else {
          lastError = legacyResult.error;
        }
      }
    } catch (error) {
      lastError = error;
    }

    if (!persistedRemotely && !isDemoUserId(currentUser?.id)) {
      console.warn('Supabase error on acceptJob:', lastError);
      return {
        success: false,
        message: lastError?.message || 'Could not save your acceptance. Please try again.',
      };
    }

    rememberJobMutation(jobId, acceptedPatch);
    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, ...acceptedPatch } : j));
    return { success: true, code };
  };

  // Employer enters the code worker tells them → marks attendance
  const verifyAttendanceCode = async (jobId, enteredCode) => {
    const normalizedCode = String(enteredCode || '').replace(/\D/g, '');
    let correctCode = null;

    if (normalizedCode.length !== 4) {
      return { success: false, message: 'Enter the 4-digit code shared by the worker.' };
    }
    
    // 1. Try reading live status from Supabase
    try {
      let liveJob = null;
      const fullSelect = await supabase
        .from('jobs')
        .select('status, verifyCode')
        .eq('id', jobId)
        .single();

      if (!fullSelect.error && fullSelect.data) {
        liveJob = fullSelect.data;
      } else if (/verifyCode/i.test(fullSelect.error?.message || '')) {
        const fallbackSelect = await supabase
          .from('jobs')
          .select('status')
          .eq('id', jobId)
          .single();

        if (!fallbackSelect.error && fallbackSelect.data) {
          liveJob = fallbackSelect.data;
        }
      }

      if (liveJob) {
        correctCode = getStoredJobVerificationCode(liveJob);
      }
    } catch (e) { console.warn('Supabase error reading code', e); }
    
    // 2. Fallback to local state
    if (!correctCode) {
      const job = jobs.find(j => j.id === jobId);
      correctCode = getStoredJobVerificationCode(job);
    }

    if (!correctCode) {
      return {
        success: false,
        message: 'Verification code is not ready yet. Ask the worker to accept the request first.',
      };
    }
    
    if (correctCode === normalizedCode) {
      let persistedRemotely = false;
      let lastError = null;

      try {
        const verificationResult = await updateJobWithSelect(jobId, { status: 'verified' });
        if (verificationResult.success) {
          persistedRemotely = true;
        } else {
          lastError = verificationResult.error;
        }
      } catch (error) {
        lastError = error;
      }

      if (!persistedRemotely && !isDemoUserId(currentUser?.id)) {
        console.warn('Supabase error on verifyAttendanceCode:', lastError);
        return {
          success: false,
          message: lastError?.message || 'Could not confirm the worker arrival. Please try again.',
        };
      }

      rememberJobMutation(jobId, { status: 'verified', verifiedAt: new Date().toISOString() });
      setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: 'verified', verifiedAt: new Date().toISOString() } : j));
      return { success: true, message: 'Worker arrival confirmed. Attendance marked successfully.' };
    }
    return { success: false, message: 'Incorrect code. Please enter the same 4-digit code shown on the worker screen.' };
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

  // ── Scheduling ─────────────────────────────────────────────────────────────
  const createSchedule = async (scheduleData) => {
    const newSchedule = {
      ...scheduleData,
      id: `sched_${Date.now()}`,
      status: 'pending', // pending | confirmed | declined | cancelled
      createdAt: new Date().toISOString(),
    };
    try {
      await supabase.from('schedules').insert(newSchedule);
    } catch (e) { console.warn('Supabase error on createSchedule', e); }
    setSchedules(prev => [...prev, newSchedule]);
    return newSchedule;
  };

  const updateScheduleStatus = async (scheduleId, status) => {
    try {
      await supabase.from('schedules').update({ status }).eq('id', scheduleId);
    } catch (e) { console.warn('Supabase error on updateScheduleStatus', e); }
    setSchedules(prev => prev.map(s => s.id === scheduleId ? { ...s, status } : s));
  };

  const getSchedulesForWorker = (workerId) => schedules.filter(s => s.workerId === workerId);
  const getSchedulesForEmployer = (employerId) => schedules.filter(s => s.employerId === employerId);

  // Update worker's available time slots on their profile
  const updateAvailableSlots = async (slots) => {
    const updated = { ...currentUser, availableSlots: slots };
    try {
      await supabase.from('users').update({ availableSlots: slots }).eq('id', currentUser.id);
    } catch (e) { console.warn('Supabase error on updateAvailableSlots', e); }
    syncCurrentUser(updated);
    setUsers(prev => prev.map(u => u.id === currentUser.id ? updated : u));
  };

  return (
    <AuthContext.Provider value={{
      currentUser, users, reviews, jobs, releasedJobs, hiringDetails, loading,
      login, register, logout, updateUser,
      getWorkers, getWorkerById, getUserById, refreshWorkers,
      getReviewsForWorker, getAvgRating, addReview,
      postJob, releaseJob, updateReleasedJob, removeReleasedJob, applyForJob, getJobsForEmployer, getJobsForWorker, updateJobStatus,
      acceptJob, verifyAttendanceCode, isJobAccepted: (job) => isAcceptedJobStatus(job?.status), getJobVerificationCode: getStoredJobVerificationCode,
      addHiringDetail, getHiringDetailsForWorker, getHiringDetailsForEmployer,
      getCities, getLocalities,
      deleteJob, clearCompletedJobs,
      schedules, createSchedule, updateScheduleStatus, getSchedulesForWorker, getSchedulesForEmployer, updateAvailableSlots
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
