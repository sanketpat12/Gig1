import { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import WorkerCard from '../components/WorkerCard';
import ReviewModal from '../components/ReviewModal';
import { Search, MapPin, Filter, Briefcase, Home, Building2, SlidersHorizontal, X } from 'lucide-react';
import './EmployerDashboard.css';

const WORK_TYPE_OPTIONS = [
  { val: 'home',     label: 'Home / Personal', icon: <Home size={20}/>,      desc: 'Domestic help, repairs, cooking, cleaning for your home or family.', color: 'var(--success)' },
  { val: 'business', label: 'Business Use',    icon: <Building2 size={20}/>, desc: 'Office support, logistics, construction, professional services.',       color: 'var(--primary)' },
];

export default function EmployerDashboard() {
  const { currentUser, getWorkers, getCities, getLocalities, postJob } = useAuth();

  /* Work type selection */
  const [workType, setWorkType] = useState(null);

  /* Search / filter */
  const [city, setCity]           = useState('');
  const [locality, setLocality]   = useState('');
  const [skill, setSkill]         = useState('');
  const [availability, setAvailability] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  /* Review modal */
  const [reviewWorker, setReviewWorker] = useState(null);
  const [toast, setToast] = useState(null);

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
        <button
          id="toggle-filters"
          className={`btn btn-secondary btn-sm ${showFilters ? 'filter-active' : ''}`}
          onClick={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal size={15}/> Filters
          {(city || skill || availability) && <span className="filter-dot"/>}
        </button>
      </div>

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

      {/* Toast */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>{toast.msg}</div>
      )}
    </div>
  );
}
