import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import WorkerCard from '../components/WorkerCard';
import ReviewModal from '../components/ReviewModal';
import { Search, MapPin, Filter, Briefcase, Home, Building2, SlidersHorizontal, X, PlusCircle, Bell, CheckCircle } from 'lucide-react';
import './EmployerDashboard.css';

const WORK_TYPE_OPTIONS = [
  { val: 'home',     label: 'Home / Personal', icon: <Home size={20}/>,      desc: 'Domestic help, repairs, cooking, cleaning for your home or family.', color: 'var(--success)' },
  { val: 'business', label: 'Business Use',    icon: <Building2 size={20}/>, desc: 'Office support, logistics, construction, professional services.',       color: 'var(--primary)' },
];

export default function EmployerDashboard() {
  const { currentUser, getWorkers, getCities, getLocalities, postJob, releaseJob, removeReleasedJob, getJobsForEmployer, updateJobStatus, getWorkerById } = useAuth();

  /* Work type selection - Persist in sessionStorage so 'back' button doesn't reset it */
  const [workType, setWorkType] = useState(() => sessionStorage.getItem('gig_emp_workType') || null);

  /* Search / filter */
  const [city, setCity]           = useState(() => sessionStorage.getItem('gig_emp_city') || '');
  const [locality, setLocality]   = useState(() => sessionStorage.getItem('gig_emp_locality') || '');
  const [skill, setSkill]         = useState(() => sessionStorage.getItem('gig_emp_skill') || '');
  const [availability, setAvailability] = useState(() => sessionStorage.getItem('gig_emp_avail') || '');
  const [showFilters, setShowFilters] = useState(() => sessionStorage.getItem('gig_emp_showFilters') === 'true');

  /* Review modal */
  const [reviewWorker, setReviewWorker] = useState(null);
  
  /* Release job modal */
  const [showReleaseModal, setShowReleaseModal] = useState(false);
  
  /* Applicant Detail modal - Persist its ID so modal re-opens after pressing 'back' */
  const [selectedAppId, setSelectedAppId] = useState(() => sessionStorage.getItem('gig_emp_applicant_id') || null);
  
  const [toast, setToast] = useState(null);

  // Sync state to sessionStorage whenever it changes
  useEffect(() => {
    if (workType) sessionStorage.setItem('gig_emp_workType', workType); else sessionStorage.removeItem('gig_emp_workType');
    if (city) sessionStorage.setItem('gig_emp_city', city); else sessionStorage.removeItem('gig_emp_city');
    if (locality) sessionStorage.setItem('gig_emp_locality', locality); else sessionStorage.removeItem('gig_emp_locality');
    if (skill) sessionStorage.setItem('gig_emp_skill', skill); else sessionStorage.removeItem('gig_emp_skill');
    if (availability) sessionStorage.setItem('gig_emp_avail', availability); else sessionStorage.removeItem('gig_emp_avail');
    if (selectedAppId) sessionStorage.setItem('gig_emp_applicant_id', selectedAppId); else sessionStorage.removeItem('gig_emp_applicant_id');
    sessionStorage.setItem('gig_emp_showFilters', showFilters);
  }, [workType, city, locality, skill, availability, showFilters, selectedAppId]);

  const cities = getCities();
  const localities = city ? getLocalities(city) : [];

  const workers = useMemo(() => {
    if (!workType) return [];
    return getWorkers({ jobType: workType, city, locality, skill, availability });
  }, [workType, city, locality, skill, availability, getWorkers]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const clearFilters = () => { setCity(''); setLocality(''); setSkill(''); setAvailability(''); };

  // Pending worker applications to open jobs
  const employerJobs = getJobsForEmployer(currentUser?.id);
  const pendingApplications = employerJobs.filter(j => j.status === 'applied');
  
  // Reconstruct selectedApplicant from persisted ID
  const selectedApplicantApp = pendingApplications.find(a => a.id === selectedAppId);
  const selectedApplicantWorker = selectedApplicantApp ? getWorkerById(selectedApplicantApp.workerId) : null;
  const selectedApplicant = selectedApplicantWorker ? { worker: selectedApplicantWorker, jobId: selectedApplicantApp.id } : null;

  if (!workType) {
    return (
      <div className="emp-page">
        <div className="emp-hero">
          <h1 className="emp-welcome">Hi, {currentUser?.name?.split(' ')[0]} 👋</h1>
          <p className="emp-sub">What type of work do you need help with today?</p>
        </div>

        <div className="worktype-grid">
          {WORK_TYPE_OPTIONS.map(opt => (
            <button
              key={opt.val}
              id={`worktype-${opt.val}`}
              className="worktype-card glass-card"
              onClick={() => setWorkType(opt.val)}
            >
              <div className="worktype-icon" style={{ background: `${opt.color}22`, color: opt.color, border: `1px solid ${opt.color}44` }}>
                {opt.icon}
              </div>
              <h2 className="worktype-label">{opt.label}</h2>
              <p className="worktype-desc">{opt.desc}</p>
              <span className="worktype-cta" style={{ color: opt.color }}>Browse Workers →</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="emp-page">
      {/* Header */}
      <div className="emp-toolbar">
        <div className="emp-toolbar-left">
          <button id="back-worktype" className="btn btn-secondary btn-sm" onClick={() => setWorkType(null)}>
            ← Change Type
          </button>
          <span className={`badge ${workType === 'home' ? 'badge-success' : 'badge-primary'}`} style={{ fontSize:'0.82rem', padding:'6px 14px' }}>
            {workType === 'home' ? '🏠 Home / Personal' : '🏢 Business'}
          </span>
          <span className="worker-count">{workers.length} worker{workers.length !== 1 ? 's' : ''} found</span>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setShowReleaseModal(true)}
          >
            <PlusCircle size={15}/> Post Open Job
          </button>
          <button
            id="toggle-filters"
            className={`btn btn-secondary btn-sm ${showFilters ? 'filter-active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal size={15}/> Filters
            {(city || skill || availability) && <span className="filter-dot"/>}
          </button>
        </div>
      </div>

      {/* Notifications / Pending Applications */}
      {pendingApplications.length > 0 && (
        <div className="glass-card animate-fadeInUp" style={{ marginBottom: '20px', borderLeft: '4px solid var(--primary)', padding: '16px 20px', background: 'rgba(41,98,255,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Bell size={18} style={{ color: 'var(--primary)' }}/>
            <h3 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--primary)' }}>New Applications ({pendingApplications.length})</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {pendingApplications.map(app => (
              <div 
                key={app.id} 
                onClick={() => {
                  if (getWorkerById(app.workerId)) {
                    setSelectedAppId(app.id);
                  }
                }}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', cursor: 'pointer', transition: 'border-color 0.2s', ':hover': { borderColor: 'var(--primary)' } }}
                className="hover-border-primary"
              >
                <div>
                  <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{app.workerName} applied for your job</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tap to view profile • Applied recently</p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }} onClick={e => e.stopPropagation()}>
                  <button 
                    className="btn btn-sm btn-primary"
                    onClick={() => {
                      updateJobStatus(app.id, 'open'); // Convert to a regular 'open' incoming job for the worker
                      
                      // Remove the public posted job if the rjobId was recorded
                      if (app.id && app.id.includes('_rjob_')) {
                        const rjobId = app.id.split('_rjob_')[1];
                        if (rjobId) removeReleasedJob(rjobId);
                      }

                      showToast(`You hired ${app.workerName}! They will see it in their dashboard.`);
                    }}
                  >
                    <CheckCircle size={14}/> Hire
                  </button>
                  <button 
                    className="btn btn-sm btn-secondary"
                    onClick={() => {
                      updateJobStatus(app.id, 'rejected');
                    }}
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Applicant Detail Modal */}
      {selectedApplicant && (
        <div className="modal-overlay" onClick={() => setSelectedAppId(null)}>
          <div className="modal-content animate-fadeInUp" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px', padding: 0, background: 'transparent', boxShadow: 'none' }}>
            <div style={{ background: '#fff', borderRadius: '16px', overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Applicant Profile</h2>
                <button className="btn-icon" onClick={() => setSelectedAppId(null)}><X size={20}/></button>
              </div>
              <div style={{ padding: '20px' }}>
                {/* Re-use the existing beautiful WorkerCard but turn off its own actions */}
                <WorkerCard worker={selectedApplicant.worker} showActions={false} />
              </div>
              <div style={{ display: 'flex', gap: '12px', padding: '16px 20px', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)' }}>
                <button 
                  className="btn btn-primary" style={{ flex: 1 }}
                  onClick={() => {
                    updateJobStatus(selectedApplicant.jobId, 'open');
                    
                    // Remove the public posted job if the rjobId was recorded
                    if (selectedApplicant.jobId && selectedApplicant.jobId.includes('_rjob_')) {
                      const rjobId = selectedApplicant.jobId.split('_rjob_')[1];
                      if (rjobId) removeReleasedJob(rjobId);
                    }

                    showToast(`You hired ${selectedApplicant.worker.name}! They will see it in their dashboard.`);
                    setSelectedAppId(null);
                  }}
                >
                  <CheckCircle size={16}/> Hire {selectedApplicant.worker.name.split(' ')[0]}
                </button>
                <button 
                  className="btn btn-secondary" style={{ flex: 1 }}
                  onClick={() => {
                    updateJobStatus(selectedApplicant.jobId, 'rejected');
                    setSelectedAppId(null);
                  }}
                >
                  Decline
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters Panel */}
      {showFilters && (
        <div className="filter-panel glass-card animate-fadeInUp">
          <div className="filter-row">
            <div className="form-group" style={{ minWidth:'180px' }}>
              <label className="form-label"><MapPin size={12} style={{ display:'inline', marginRight:'4px' }}/>City</label>
              <select id="filter-city" className="form-select" value={city} onChange={e => { setCity(e.target.value); setLocality(''); }}>
                <option value="">All Cities</option>
                {cities.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            {city && localities.length > 0 && (
              <div className="form-group" style={{ minWidth:'200px' }}>
                <label className="form-label">Locality</label>
                <select id="filter-locality" className="form-select" value={locality} onChange={e => setLocality(e.target.value)}>
                  <option value="">All Localities</option>
                  {localities.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            )}
            {city && localities.length === 0 && (
              <div className="form-group" style={{ minWidth:'200px' }}>
                <label className="form-label">Locality</label>
                <input id="filter-locality-input" type="text" className="form-input" placeholder="e.g. Kothrud"
                  value={locality} onChange={e => setLocality(e.target.value)} />
              </div>
            )}
            <div className="form-group" style={{ minWidth:'160px' }}>
              <label className="form-label">Skill</label>
              <input id="filter-skill" type="text" className="form-input" placeholder="e.g. Plumbing"
                value={skill} onChange={e => setSkill(e.target.value)} />
            </div>
            <div className="form-group" style={{ minWidth:'150px' }}>
              <label className="form-label">Availability</label>
              <select id="filter-availability" className="form-select" value={availability} onChange={e => setAvailability(e.target.value)}>
                <option value="">Any</option>
                <option value="available">Available Now</option>
                <option value="busy">Busy</option>
              </select>
            </div>
            {(city || skill || availability) && (
              <button className="btn btn-secondary btn-sm" style={{ alignSelf:'flex-end', marginBottom:'0' }} onClick={clearFilters}>
                <X size={13}/> Clear
              </button>
            )}
          </div>
        </div>
      )}

      {/* Workers Grid */}
      {workers.length === 0 ? (
        <div className="empty-state glass-card">
          <Search size={48} style={{ color:'var(--text-secondary)', margin:'0 auto' }}/>
          <h3 style={{ marginTop:'16px', color:'var(--text-secondary)' }}>No workers found</h3>
          <p style={{ fontSize:'0.85rem', color:'var(--text-secondary)', marginTop:'8px' }}>
            Try changing the city or skill filter, or check back later.
          </p>
          {(city || skill || availability) && (
            <button className="btn btn-secondary btn-sm" style={{ marginTop:'16px' }} onClick={clearFilters}>Clear Filters</button>
          )}
        </div>
      ) : (
        <div className="workers-grid">
          {workers.map((w, i) => (
            <div key={w.id} style={{ animationDelay:`${i * 0.07}s` }}>
              <WorkerCard
                worker={w}
                showActions
                onHire={(worker) => {
                  postJob({ employerId: currentUser.id, workerId: worker.id, workerName: worker.name, employerName: currentUser.name });
                  showToast(`Hire request sent to ${worker.name}! Check your messages.`);
                }}
                onReview={(worker) => setReviewWorker(worker)}
              />
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {reviewWorker && (
        <ReviewModal
          worker={reviewWorker}
          onClose={() => setReviewWorker(null)}
          onSuccess={() => showToast(`Review submitted for ${reviewWorker.name}!`)}
        />
      )}

      {/* Release Job Modal */}
      {showReleaseModal && (
        <ReleaseJobModal
          onClose={() => setShowReleaseModal(false)}
          onRelease={async (jobData) => {
            await releaseJob({ ...jobData, employerId: currentUser.id, employerName: currentUser.name });
            setShowReleaseModal(false);
            showToast('Job released successfully! Workers can now find and apply for it.');
          }}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>{toast.msg}</div>
      )}
    </div>
  );
}

// ── RELEASE JOB MODAL ────────────────────────────────────────────────────────
function ReleaseJobModal({ onClose, onRelease }) {
  const [formData, setFormData] = useState({
    title: '',
    typeOfWork: '',
    duration: '',
    budget: '',
    location: '',
    skills: '' // Comma separated
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const skillsArray = formData.skills.split(',').map(s => s.trim()).filter(s => s.length > 0);
    onRelease({
      ...formData,
      skills: skillsArray
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass-card animate-fadeInUp" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
        <div className="modal-header">
          <h2 style={{ fontSize: '1.25rem' }}>Release an Open Job</h2>
          <button className="btn-icon" onClick={onClose}><X size={20}/></button>
        </div>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>
          Post a job describing what you need. Workers will see it in their dashboard and can apply directly.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Job Title</label>
            <input type="text" className="form-input" required placeholder="e.g. Office deep cleaning"
              value={formData.title} onChange={e => setFormData(f => ({...f, title: e.target.value}))} />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Type of Work</label>
              <select className="form-select" required value={formData.typeOfWork} onChange={e => setFormData(f => ({...f, typeOfWork: e.target.value}))}>
                <option value="">Select...</option>
                <option value="home">Home / Personal</option>
                <option value="business">Business</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Location (City)</label>
              <input type="text" className="form-input" required placeholder="e.g. Pune"
                value={formData.location} onChange={e => setFormData(f => ({...f, location: e.target.value}))} />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Duration</label>
              <input type="text" className="form-input" required placeholder="e.g. Full day, 4 hours"
                value={formData.duration} onChange={e => setFormData(f => ({...f, duration: e.target.value}))} />
            </div>
            <div className="form-group">
              <label className="form-label">Budget / Payment</label>
              <input type="text" className="form-input" required placeholder="e.g. ₹1200, ₹400/hr"
                value={formData.budget} onChange={e => setFormData(f => ({...f, budget: e.target.value}))} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Required Skills (comma separated)</label>
            <input type="text" className="form-input" placeholder="e.g. Cleaning, Plumbing"
              value={formData.skills} onChange={e => setFormData(f => ({...f, skills: e.target.value}))} />
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
            <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Post Job</button>
          </div>
        </form>
      </div>
    </div>
  );
}
