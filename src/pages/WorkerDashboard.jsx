import { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import StarRating from '../components/StarRating';
import {
  MapPin, Edit3, Save, X, Plus, Star, Briefcase,
  CheckCircle, Clock, TrendingUp, Search, IndianRupee,
  LayoutDashboard, ListChecks, Wallet, UserCircle2,
  Phone, Mail, Award, Zap, AlertCircle,
  ArrowRight, FileText, Calendar, CalendarCheck, CalendarX, CalendarClock,
} from 'lucide-react';
import './WorkerDashboard.css';

const SKILL_SUGGESTIONS = [
  'Plumbing','Electrical','Carpentry','Painting','Cleaning','Cooking',
  'Driving','Gardening','Security','Data Entry','Delivery','Masonry',
  'Welding','Tailoring','Photography','IT Support','Elder Care','Babysitting',
  'Landscaping','Moving Help','Personal Training','AC Repair','Tiling',
];
const CITIES = [
  'Mumbai','Delhi','Bangalore','Pune','Hyderabad','Chennai',
  'Kolkata','Ahmedabad','Jaipur','Lucknow','Surat','Chandigarh',
];
const TABS = [
  { id:'overview',   label:'Overview',   icon:<LayoutDashboard size={16}/> },
  { id:'jobs',       label:'My Jobs',    icon:<ListChecks size={16}/> },
  { id:'schedule',   label:'Schedule',   icon:<Calendar size={16}/> },
  { id:'findjobs',   label:'Find Jobs',  icon:<Search size={16}/> },
  { id:'earnings',   label:'Earnings',   icon:<Wallet size={16}/> },
  { id:'profile',    label:'Profile',    icon:<UserCircle2 size={16}/> },
];


// ── Job Detail Modal ─────────────────────────────────────────────────────────
function JobDetailModal({ job, onClose, onApply, isApplied }) {
  if (!job) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass-card animate-fadeInUp" onClick={e => e.stopPropagation()} style={{ maxWidth:'500px' }}>
        <div className="modal-header">
          <h2 style={{ fontSize:'1.25rem' }}>Job Details</h2>
          <button className="btn-icon" onClick={onClose}><X size={20}/></button>
        </div>
        
        <div style={{ marginBottom:'20px' }}>
          <h1 style={{ fontSize:'1.4rem', fontWeight:800 }}>{job.title}</h1>
          <p style={{ color:'var(--text-secondary)', fontSize:'0.9rem', marginTop:'4px' }}>
            Posted by <strong style={{color:'var(--text-primary)'}}>{job.employerName || job.employer}</strong>
          </p>
        </div>

        <div className="grid-2" style={{ marginBottom:'20px', gap:'12px' }}>
          <div className="glass-card" style={{ padding:'12px' }}>
            <p style={{ color:'var(--text-muted)', fontSize:'0.75rem', marginBottom:'4px' }}>Budget / Payment</p>
            <p style={{ color:'var(--success)', fontWeight:700, fontSize:'1.1rem' }}>
              <IndianRupee size={14}/> {job.budget || job.paymentAmount || 'Negotiable'}
            </p>
          </div>
          <div className="glass-card" style={{ padding:'12px' }}>
            <p style={{ color:'var(--text-muted)', fontSize:'0.75rem', marginBottom:'4px' }}>Duration</p>
            <p style={{ color:'var(--text-primary)', fontWeight:600, fontSize:'1.1rem' }}>
              <Clock size={14} style={{ marginRight:'4px' }}/>{job.duration || 'Not specified'}
            </p>
          </div>
        </div>

        <div style={{ marginBottom:'20px' }}>
          <p style={{ fontWeight:600, fontSize:'0.9rem', marginBottom:'8px' }}>Location</p>
          <p style={{ color:'var(--text-secondary)', fontSize:'0.9rem' }}>
            <MapPin size={14} style={{ marginRight:'6px' }}/>{job.location || job.city || 'Remote'}
          </p>
        </div>

        <div style={{ marginBottom:'20px' }}>
          <p style={{ fontWeight:600, fontSize:'0.9rem', marginBottom:'8px' }}>Required Skills</p>
          <div style={{ display:'flex', gap:'6px', flexWrap:'wrap' }}>
            {(job.skills || []).map(s => <span key={s} className="tag tag-primary">{s}</span>)}
            {(!job.skills || job.skills.length === 0) && <span style={{ color:'var(--text-muted)', fontSize:'0.85rem' }}>None specified</span>}
          </div>
        </div>

        <button
          className={`btn ${isApplied ? 'btn-secondary' : 'btn-primary'}`}
          style={{ width:'100%', padding:'12px', fontSize:'1rem' }}
          disabled={isApplied}
          onClick={onApply}
        >
          {isApplied ? <><CheckCircle size={18}/> Already Applied</> : <><Briefcase size={18}/> Apply Now</>}
        </button>
      </div>
    </div>
  );
}

// ── Find Jobs (needs its own state so must be a top-level component) ──────────
function FindJobsTab({ openJobs, appliedJobs, setAppliedJobs, showToast, applyForJob, currentUser }) {
  const [searchSkill, setSearchSkill] = useState('');
  const [searchCity,  setSearchCity]  = useState('');
  const [selectedJob, setSelectedJob] = useState(null);

  const filtered = openJobs.filter(j => {
    // 1. Text Search matches
    const matchSkill = !searchSkill || (j.skills && j.skills.some(s => s.toLowerCase().includes(searchSkill.toLowerCase()))) || (j.title && j.title.toLowerCase().includes(searchSkill.toLowerCase()));
    const matchCity  = !searchCity  || (j.city && j.city.toLowerCase().includes(searchCity.toLowerCase())) || (j.location && j.location.toLowerCase().includes(searchCity.toLowerCase()));
    
    // 2. ONLY show if the required skills overlap with the worker's skills (unless job has no specific skills required)
    const workerSkills = currentUser?.skills || [];
    const jobSkills = j.skills || [];
    const overlaps = jobSkills.length === 0 || jobSkills.some(s => workerSkills.some(ws => ws.toLowerCase() === s.toLowerCase()));
    
    return matchSkill && matchCity && overlaps;
  });

  return (
    <div className="wd-tab-content">
      <div className="wd-section-header">
        <h2 style={{ fontWeight:800, fontSize:'1.1rem' }}>Open Jobs Near You</h2>
        <span className="badge badge-success">{filtered.length} available</span>
      </div>

      <div className="glass-card wd-job-search-bar">
        <div className="wd-search-field">
          <Search size={15} style={{ color:'var(--text-muted)' }}/>
          <input type="text" className="wd-search-input" placeholder="Search by skill..."
            value={searchSkill} onChange={e => setSearchSkill(e.target.value)}/>
        </div>
        <div className="wd-search-divider"/>
        <div className="wd-search-field">
          <MapPin size={15} style={{ color:'var(--text-muted)' }}/>
          <input type="text" className="wd-search-input" placeholder="City..."
            value={searchCity} onChange={e => setSearchCity(e.target.value)}/>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="glass-card wd-jobs-empty">
          <Search size={40} style={{ color:'var(--text-muted)', margin:'0 auto 12px', opacity:0.4 }}/>
          <p style={{ color:'var(--text-muted)', fontSize:'0.88rem' }}>No jobs match your search. Try different filters.</p>
        </div>
      ) : (
        <div className="wd-open-jobs-grid">
          {filtered.map((j, i) => (
            <div key={j.id} className="glass-card wd-open-job-card" style={{ animationDelay:`${i*0.06}s` }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'10px' }}>
                <div>
                  <h3 style={{ fontWeight:700, fontSize:'0.95rem', marginBottom:'3px' }}>{j.title}</h3>
                  <p style={{ color:'var(--text-secondary)', fontSize:'0.8rem' }}>{j.employer}</p>
                </div>
                <span style={{ fontSize:'0.7rem', color:'var(--text-muted)', whiteSpace:'nowrap', flexShrink:0 }}>{j.posted}</span>
              </div>

              <div style={{ display:'flex', gap:'6px', flexWrap:'wrap', margin:'10px 0 8px' }}>
                {(j.skills || []).map(s => <span key={s} className="tag" style={{ fontSize:'0.72rem' }}>{s}</span>)}
              </div>

              <div className="wd-open-job-meta">
                <span><MapPin size={12}/> {j.location || j.city}</span>
                <span><Clock size={12}/> {j.duration}</span>
                <span style={{ color:'var(--success)', fontWeight:700 }}><IndianRupee size={12}/> {j.budget || j.paymentAmount}</span>
              </div>

              <button
                className="btn btn-sm btn-secondary"
                style={{ width:'100%', marginTop:'12px' }}
                onClick={() => setSelectedJob(j)}
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedJob && (
        <JobDetailModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          isApplied={appliedJobs.includes(selectedJob.id)}
          onApply={() => {
            setAppliedJobs(p => [...p, selectedJob.id]);
            applyForJob({
              employerId: selectedJob.employerId,
              workerId: currentUser.id,
              employerName: selectedJob.employerName || selectedJob.employer,
              workerName: currentUser.name,
              rjobId: selectedJob.id
            });
            showToast(`Applied for "${selectedJob.title}"! Employer will be notified.`);
            setSelectedJob(null);
          }}
        />
      )}
    </div>
  );
}

// ── Main Worker Dashboard component ──────────────────────────────────────────
export default function WorkerDashboard() {
  const { currentUser, updateUser, getReviewsForWorker, getAvgRating, jobs, releasedJobs, applyForJob, updateJobStatus, acceptJob, getUserById, deleteJob, clearCompletedJobs, getSchedulesForWorker, updateScheduleStatus, updateAvailableSlots, isJobAccepted, getJobVerificationCode } = useAuth();

  const [activeTab,    setActiveTab]    = useState('overview');
  const [toast,        setToast]        = useState(null);
  const [editing,      setEditing]      = useState(false);
  const [form,         setForm]         = useState({ ...currentUser });
  const [skillInput,   setSkillInput]   = useState('');
  const [appliedJobs,  setAppliedJobs]  = useState([]);
  const [slotInput,    setSlotInput]    = useState({ day:'Monday', from:'09:00', to:'17:00' });

  const reviews      = getReviewsForWorker(currentUser.id);
  const avg          = getAvgRating(currentUser.id);
  const myJobs       = (jobs || []).filter(j => j.workerId === currentUser.id);
  const completedJobs = myJobs.filter(j => j.status === 'completed');
  const pendingJobs  = myJobs.filter(j => j.status === 'open');
  const acceptedJobs = myJobs.filter(j => isJobAccepted(j));
  const verifiedJobs = myJobs.filter(j => j.status === 'verified');

  const completionScore = useMemo(() => {
    let s = 0;
    if (currentUser.name)               s += 15;
    if (currentUser.phone)              s += 10;
    if (currentUser.city)               s += 10;
    if (currentUser.locality)           s += 10;
    if (currentUser.bio)                s += 15;
    if ((currentUser.skills?.length||0) >= 2) s += 15;
    if (currentUser.hourlyRate)         s += 10;
    if (currentUser.experience)         s += 10;
    if (currentUser.jobType?.length)    s += 5;
    return s;
  }, [currentUser]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Profile helpers
  const addSkill = (s = skillInput.trim()) => {
    if (s && !form.skills?.includes(s)) {
      setForm(f => ({ ...f, skills: [...(f.skills||[]), s] }));
      setSkillInput('');
    }
  };
  const removeSkill = (s) => setForm(f => ({ ...f, skills: f.skills.filter(k => k !== s) }));
  const toggleJobType = (t) => setForm(f => ({
    ...f,
    jobType: f.jobType?.includes(t) ? f.jobType.filter(x => x !== t) : [...(f.jobType||[]), t]
  }));
  const handleSave = async () => {
    await updateUser(form);
    setEditing(false);
    showToast('Profile updated successfully!');
  };
  const handleCancel = () => { setForm({ ...currentUser }); setEditing(false); };

  const initials = currentUser.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2);
  const rate     = currentUser.hourlyRate || 0;

  function switchTab(id) {
    setActiveTab(id);
    if (id !== 'profile') setEditing(false);
  }

  // ── Sidebar ─────────────────────────────────────────────────────────────────
  const sidebar = (
    <div className="wd-sidebar">
      {/* Profile card */}
      <div className="glass-card wd-profile-card">
        <div className="wd-avatar-wrap">
          <div className="avatar avatar-xl wd-avatar">{initials}</div>
          <span className={`wd-avail-dot ${currentUser.availability === 'available' ? 'dot-green' : 'dot-red'}`}/>
        </div>
        <h2 className="wd-name">{currentUser.name}</h2>
        <p className="wd-location">
          <MapPin size={13}/> {currentUser.locality || 'No locality'}, {currentUser.city || 'No city'}
        </p>
        <div className="wd-rating-row">
          <StarRating value={Math.round(avg)} readonly size={15}/>
          <span className="wd-rating-num">{avg > 0 ? avg : '—'}</span>
          <span className="wd-review-count">({reviews.length})</span>
        </div>
        <div className="wd-rate-badge">
          <IndianRupee size={14}/>{rate || '—'}/hr
        </div>
        <div className="wd-job-types">
          {currentUser.jobType?.includes('home')     && <span className="badge badge-success">🏠 Home</span>}
          {!currentUser.jobType?.length && <span style={{ fontSize:'0.78rem', color:'var(--text-muted)' }}>No work types set</span>}
        </div>
        {/* Availability toggle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: currentUser.availability === 'available' ? 'rgba(18, 184, 134, 0.1)' : 'rgba(150, 150, 150, 0.1)', borderRadius: '12px', marginTop: '16px', transition: 'all 0.3s ease' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className={`avail-indicator ${currentUser.availability === 'available' ? 'avail-on' : 'avail-off'}`} style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: currentUser.availability === 'available' ? 'var(--success)' : 'var(--text-muted)' }}/>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: currentUser.availability === 'available' ? 'var(--success)' : 'var(--text-secondary)' }}>
              {currentUser.availability === 'available' ? 'Available for Work' : 'Busy'}
            </span>
          </div>
          
          {/* Switch Button */}
          <div 
            onClick={() => {
              const updated = { ...currentUser, availability: currentUser.availability === 'available' ? 'busy' : 'available' };
              updateUser(updated);
              showToast(updated.availability === 'available' ? '✅ Now showing as Available' : '🔴 Now showing as Busy');
            }}
            style={{
              width: '44px',
              height: '24px',
              borderRadius: '12px',
              backgroundColor: currentUser.availability === 'available' ? 'var(--success)' : '#cbd5e1',
              position: 'relative',
              cursor: 'pointer',
              transition: 'background-color 0.3s ease'
             }}
          >
            <div style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              backgroundColor: '#fff',
              position: 'absolute',
              top: '2px',
              left: currentUser.availability === 'available' ? '22px' : '2px',
              transition: 'left 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }} />
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="glass-card wd-stats-card">
        {[
          { label:'Jobs Done', val: currentUser.jobsDone||0, color:'var(--primary)',  icon:<Briefcase size={16}/> },
          { label:'Avg Rating',val: avg>0 ? avg : '—',      color:'var(--warning)',  icon:<Star size={16}/> },
          { label:'Experience',val: currentUser.experience||'N/A', color:'var(--success)', icon:<Clock size={16}/> },
          { label:'Active',    val: pendingJobs.length,       color:'#7c3aed',        icon:<TrendingUp size={16}/> },
        ].map(s => (
          <div key={s.label} className="wd-stat">
            <span style={{ color:s.color }}>{s.icon}</span>
            <div>
              <p className="wd-stat-val">{s.val}</p>
              <p className="wd-stat-label">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Profile strength */}
      <div className="glass-card" style={{ padding:'18px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'10px' }}>
          <p style={{ fontSize:'0.8rem', fontWeight:700, color:'var(--text-secondary)' }}>Profile Strength</p>
          <span style={{ fontSize:'0.85rem', fontWeight:800, color: completionScore >= 80 ? 'var(--success)' : completionScore >= 50 ? 'var(--warning)' : 'var(--danger)' }}>
            {completionScore}%
          </span>
        </div>
        <div className="wd-progress-wrap">
          <div className="wd-progress-bar" style={{
            width:`${completionScore}%`,
            background: completionScore >= 80 ? 'linear-gradient(90deg,#43e97b,#12b886)' : completionScore >= 50 ? 'linear-gradient(90deg,#f7971e,#ffd200)' : 'linear-gradient(90deg,#ff6584,#fa5252)',
          }}/>
        </div>
        {completionScore < 80 && (
          <p style={{ fontSize:'0.73rem', color:'var(--text-muted)', marginTop:'8px' }}>Complete your profile to get more hires</p>
        )}
      </div>

      {/* Skills preview */}
      {(currentUser.skills?.length || 0) > 0 && (
        <div className="glass-card" style={{ padding:'18px' }}>
          <p style={{ fontSize:'0.78rem', fontWeight:700, color:'var(--text-secondary)', marginBottom:'10px', textTransform:'uppercase', letterSpacing:'0.05em' }}>Skills</p>
          <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
            {currentUser.skills.map(s => (
              <span key={s} className="tag" style={{ padding:'4px 10px', fontSize:'0.75rem' }}>{s}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // ── Overview Tab ─────────────────────────────────────────────────────────────
  const overviewTab = (
    <div className="wd-tab-content">
      {/* Welcome banner */}
      <div className="glass-card wd-welcome-banner">
        <div>
          <h2 style={{ fontSize:'1.25rem', fontWeight:800, marginBottom:'4px' }}>
            Hi, {currentUser.name?.split(' ')[0]} 👋
          </h2>
          <p style={{ color:'var(--text-secondary)', fontSize:'0.88rem' }}>
            {currentUser.availability === 'available'
              ? "You're visible to employers. Keep your profile sharp!"
              : "You're currently Busy. Toggle in the sidebar to accept new work."}
          </p>
        </div>
        <div className="wd-score-circle">
          <span style={{ fontSize:'1.1rem', fontWeight:900, color: completionScore >= 80 ? 'var(--success)' : 'var(--warning)' }}>{completionScore}%</span>
          <span style={{ fontSize:'0.62rem', color:'var(--text-muted)' }}>Profile</span>
        </div>
      </div>

      {/* Quick stats */}
      <div className="wd-quick-stats-row">
        {[
          { label:'Active Jobs', val: pendingJobs.length,   color:'var(--primary)', bg:'rgba(41,98,255,0.08)',  icon:<Briefcase size={18}/> },
          { label:'Completed',   val: completedJobs.length, color:'var(--success)', bg:'rgba(18,184,134,0.08)', icon:<CheckCircle size={18}/> },
          { label:'Reviews',     val: reviews.length,       color:'var(--warning)', bg:'rgba(245,159,0,0.08)',  icon:<Star size={18}/> },
          { label:'Avg Rating',  val: avg > 0 ? avg : '—', color:'#7c3aed',        bg:'rgba(124,58,237,0.08)', icon:<Award size={18}/> },
        ].map(s => (
          <div key={s.label} className="glass-card wd-quick-stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ color:s.color, background:s.bg, padding:'10px', borderRadius:'12px' }}>{s.icon}</div>
            </div>
            <div style={{ marginTop: 'auto' }}>
              <p className="wd-qs-val" style={{ color:s.color }}>{s.val}</p>
              <p className="wd-qs-label">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Bio / prompt */}
      {currentUser.bio ? (
        <div className="glass-card">
          <h3 style={{ fontWeight:700, marginBottom:'10px', fontSize:'0.95rem' }}>📝 About Me</h3>
          <p style={{ color:'var(--text-secondary)', fontSize:'0.88rem', lineHeight:'1.75' }}>{currentUser.bio}</p>
        </div>
      ) : (
        <div className="glass-card wd-empty-prompt" onClick={() => { switchTab('profile'); setEditing(true); }}>
          <FileText size={28} style={{ color:'var(--text-muted)' }}/>
          <div>
            <p style={{ fontWeight:600, fontSize:'0.9rem' }}>Add a Bio</p>
            <p style={{ color:'var(--text-muted)', fontSize:'0.8rem' }}>Tell employers what makes you great.</p>
          </div>
          <ArrowRight size={18} style={{ color:'var(--primary)', marginLeft:'auto' }}/>
        </div>
      )}

      {/* Recent reviews */}
      <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.97), rgba(248,250,255,0.9))' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'20px' }}>
          <div style={{ background: 'linear-gradient(135deg, #f59e0b, #fbbf24)', padding:'8px', borderRadius:'12px', display:'flex', flexShrink:0 }}>
            <Star size={16} style={{ color:'#fff' }}/>
          </div>
          <div style={{ flex:1 }}>
            <h3 style={{ fontWeight:800, fontSize:'0.98rem', color:'var(--text-primary)' }}>Recent Reviews</h3>
            <p style={{ fontSize:'0.72rem', color:'var(--text-muted)', marginTop:'1px' }}>{reviews.length} review{reviews.length !== 1 ? 's' : ''} received</p>
          </div>
          {avg > 0 && (
            <div style={{ display:'flex', alignItems:'center', gap:'4px', background:'rgba(245,158,11,0.1)', border:'1px solid rgba(245,158,11,0.2)', borderRadius:'999px', padding:'4px 12px', flexShrink:0 }}>
              <span style={{ color:'#f59e0b', fontWeight:900, fontSize:'0.9rem' }}>★ {avg}</span>
            </div>
          )}
        </div>
        {reviews.length === 0 ? (
          <div className="wd-empty-reviews">
            <div style={{ background:'rgba(245,158,11,0.1)', padding:'16px', borderRadius:'50%' }}>
              <Star size={28} style={{ color:'#f59e0b', opacity:0.5 }}/>
            </div>
            <p style={{ color:'var(--text-secondary)', fontSize:'0.88rem', fontWeight:600 }}>No reviews yet</p>
            <p style={{ color:'var(--text-muted)', fontSize:'0.8rem' }}>Complete jobs to receive feedback from employers.</p>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
            {reviews.slice(0,3).map(r => (
              <div key={r.id} className="wd-review-item">
                <div className="avatar avatar-sm wd-review-avatar">{r.employerName?.[0]?.toUpperCase()}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:'8px', flexWrap:'wrap' }}>
                    <p style={{ fontWeight:700, fontSize:'0.9rem', color:'var(--text-primary)' }}>{r.employerName}</p>
                    <p style={{ fontSize:'0.72rem', color:'var(--text-muted)', flexShrink:0 }}>{r.date}</p>
                  </div>
                  <div className="wd-review-stars">
                    <StarRating value={r.rating} readonly size={14}/>
                    <span style={{ fontSize:'0.75rem', color:'#f59e0b', fontWeight:700, marginLeft:'4px' }}>
                      {['','Poor','Fair','Good','Very Good','Excellent'][r.rating]}
                    </span>
                  </div>
                  <p className="wd-review-comment">{r.comment}</p>
                </div>
              </div>
            ))}
            {reviews.length > 3 && (
              <button className="btn btn-secondary btn-sm" style={{ alignSelf:'center', marginTop:'4px' }} onClick={() => switchTab('profile')}>
                View all {reviews.length} reviews →
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );

  // ── My Jobs Tab ──────────────────────────────────────────────────────────────
  const jobsTab = (
    <div className="wd-tab-content">
      <div className="wd-section-header">
        <h2 style={{ fontWeight:800, fontSize:'1.1rem' }}>My Jobs</h2>
        <span className="badge badge-primary">{myJobs.length} total</span>
      </div>

      {myJobs.length === 0 ? (
        <div className="glass-card wd-jobs-empty">
          <ListChecks size={48} style={{ color:'var(--text-muted)', margin:'0 auto 12px' }}/>
          <h3 style={{ fontWeight:700, color:'var(--text-secondary)' }}>No jobs yet</h3>
          <p style={{ color:'var(--text-muted)', fontSize:'0.85rem', marginTop:'6px', marginBottom:'16px' }}>
            Employers will send you hire requests once they find your profile.
          </p>
          <button className="btn btn-primary btn-sm" onClick={() => switchTab('findjobs')}>
            <Search size={14}/> Browse Open Jobs
          </button>
        </div>
      ) : (
        <>
          {pendingJobs.length > 0 && (
            <div className="glass-card">
              <h3 className="wd-jobs-section-title" style={{ color:'var(--primary)' }}>
                <Zap size={15}/> Incoming Hire Requests ({pendingJobs.length})
              </h3>
              <div className="wd-jobs-list">
                {pendingJobs.map(j => (
                  <div key={j.id} className="wd-job-card wd-job-pending">
                    <div className="wd-job-info">
                      <div className="avatar avatar-sm" style={{ background:'linear-gradient(135deg,var(--primary),var(--primary-dark))' }}>
                        {j.employerName?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p style={{ fontWeight:700, fontSize:'0.9rem' }}>{j.employerName}</p>
                        <p style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>
                          {new Date(j.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short' })}
                        </p>
                      </div>
                      <span className="badge badge-warning" style={{ marginLeft:'auto' }}>Pending</span>
                    </div>
                    <div style={{ display:'flex', gap:'8px', marginTop:'10px' }}>
                      <button className="btn btn-success btn-sm" style={{ flex:1 }}
                        onClick={async () => {
                          const result = await acceptJob(j.id);
                          if (result.success) {
                            showToast(`Accepted! Your arrival code is ${result.code}. Show this to the employer when you reach the location.`);
                          } else {
                            showToast(result.message, 'error');
                          }
                        }}>
                        <CheckCircle size={13}/> Accept
                      </button>
                      <button className="btn btn-danger btn-sm" style={{ flex:1 }}
                        onClick={() => { updateJobStatus(j.id,'rejected'); showToast('Job declined.','error'); }}>
                        <X size={13}/> Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Accepted Jobs – show verification code & Employer Details */}
          {acceptedJobs.length > 0 && (
            <div className="glass-card">
              <h3 className="wd-jobs-section-title" style={{ color:'#7c3aed' }}>
                <CheckCircle size={15}/> Accepted – Show Code to Employer ({acceptedJobs.length})
              </h3>
              <div className="wd-jobs-list">
                {acceptedJobs.map(j => {
                  const code = getJobVerificationCode(j);
                  const employer = getUserById(j.employerId);
                  return (
                    <div key={j.id} className="wd-job-card" style={{ borderLeft:'4px solid #7c3aed', padding:'16px' }}>
                      <div className="wd-job-info" style={{ marginBottom:'12px' }}>
                        <div className="avatar avatar-sm" style={{ background:'linear-gradient(135deg,#7c3aed,#a78bfa)' }}>
                          {j.employerName?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p style={{ fontWeight:700, fontSize:'0.9rem' }}>{j.employerName}</p>
                          <p style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>Show this code to your employer when you reach the location</p>
                        </div>
                        <span className="badge" style={{ background:'#7c3aed22', color:'#7c3aed', border:'1px solid #7c3aed44', marginLeft:'auto' }}>🟣 Accepted</span>
                      </div>

                      {/* Employer Contact Info (Newly Added logic merged) */}
                      <div style={{ background:'rgba(124,58,237,0.06)', borderRadius:'10px', padding:'12px', marginBottom:'12px' }}>
                        <p style={{ fontSize:'0.75rem', fontWeight:700, color:'#7c3aed', marginBottom:'8px', textTransform:'uppercase', letterSpacing:'0.05em' }}>📞 Employer Contact</p>
                        {employer?.phone && (
                          <p style={{ fontSize:'0.85rem', color:'var(--text-primary)', marginBottom:'4px' }}>
                            📱 <strong>{employer.phone}</strong>
                          </p>
                        )}
                        {employer?.email && (
                          <p style={{ fontSize:'0.85rem', color:'var(--text-secondary)' }}>
                            ✉️ {employer.email}
                          </p>
                        )}
                        {!employer?.phone && !employer?.email && (
                          <p style={{ fontSize:'0.82rem', color:'var(--text-muted)' }}>Contact info not available</p>
                        )}
                      </div>

                      <div style={{ textAlign:'center', padding:'16px', background:'linear-gradient(135deg,rgba(124,58,237,0.08),rgba(167,139,250,0.08))', borderRadius:'12px' }}>
                        <p style={{ fontSize:'0.75rem', color:'var(--text-muted)', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'1px', fontWeight:600 }}>Your Arrival Code</p>
                        <p style={{ fontSize:'2rem', fontWeight:900, color:'#7c3aed', letterSpacing:'8px', fontFamily:'monospace' }}>{code}</p>
                        <p style={{ fontSize:'0.7rem', color:'var(--text-muted)', marginTop:'8px' }}>⚠️ Do not share this until you reach the work location</p>
                      </div>

                      <button className="btn btn-success btn-sm" style={{ width:'100%', marginTop:'12px' }}
                        onClick={() => { updateJobStatus(j.id,'completed'); showToast('Job marked as complete! Great work! 🎉'); }}>
                        <CheckCircle size={13}/> Mark Job as Complete
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Verified (attendance marked) */}
          {verifiedJobs.length > 0 && (
            <div className="glass-card">
              <h3 className="wd-jobs-section-title" style={{ color:'var(--success)' }}>
                <CheckCircle size={15}/> Attendance Verified ({verifiedJobs.length})
              </h3>
              <div className="wd-jobs-list">
                {verifiedJobs.map(j => (
                  <div key={j.id} className="wd-job-card wd-job-done">
                    <div className="wd-job-info">
                      <div className="avatar avatar-sm" style={{ background:'linear-gradient(135deg,#43e97b,#12b886)' }}>
                        {j.employerName?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p style={{ fontWeight:700, fontSize:'0.9rem' }}>{j.employerName}</p>
                        <p style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>
                          {new Date(j.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short' })}
                        </p>
                      </div>
                      <span className="badge badge-success" style={{ marginLeft:'auto' }}>✅ Attendance Marked</span>
                    </div>
                    
                    <button className="btn btn-success btn-sm" style={{ width:'100%', marginTop:'12px' }}
                        onClick={() => { updateJobStatus(j.id,'completed'); showToast('Job marked as complete! Great work! 🎉'); }}>
                        <CheckCircle size={13}/> Mark Job as Complete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {completedJobs.length > 0 && (
            <div className="glass-card">
              <h3 className="wd-jobs-section-title" style={{ color:'var(--success)', display:'flex', alignItems:'center' }}>
                <CheckCircle size={15}/> Completed ({completedJobs.length})
                <button 
                  className="wd-btn-clear btn-sm" 
                  style={{ marginLeft:'auto', fontSize:'0.7rem', height:'fit-content' }}
                  onClick={() => {
                    clearCompletedJobs(currentUser.id, 'worker');
                    showToast('Work history cleared');
                  }}
                >
                  Clear All
                </button>
              </h3>
              <div className="wd-jobs-list">
                {completedJobs.map(j => (
                  <div key={j.id} className="wd-job-card wd-job-done">
                    <div className="wd-job-info">
                      <div className="avatar avatar-sm" style={{ background:'linear-gradient(135deg,#43e97b,#12b886)' }}>
                        {j.employerName?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p style={{ fontWeight:700, fontSize:'0.9rem' }}>{j.employerName}</p>
                        <p style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>
                          {new Date(j.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short' })}
                        </p>
                      </div>
                      <span className="badge badge-success" style={{ marginLeft:'auto' }}>✅ Done</span>
                      <button 
                        className="wd-btn-clear-single" 
                        style={{ marginLeft:'8px' }}
                        onClick={() => {
                          deleteJob(j.id);
                          showToast('Job removed from history');
                        }}
                        title="Dismiss"
                      >
                        <X size={14}/>
                      </button>
                    </div>
                    <p style={{ fontSize:'0.8rem', color:'var(--text-muted)', marginTop:'6px' }}>
                      Est. earnings: <strong style={{ color:'var(--success)' }}>₹{rate ? rate * 4 : '—'}</strong>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );

  // ── Earnings Tab ─────────────────────────────────────────────────────────────
  const earningsTab = (
    <div className="wd-tab-content">
      <div className="wd-section-header">
        <h2 style={{ fontWeight:800, fontSize:'1.1rem' }}>Earnings Overview</h2>
      </div>

      <div className="wd-earnings-grid">
        <div className="glass-card wd-earn-card" style={{ borderTop:'3px solid var(--success)' }}>
          <p className="wd-earn-label">Estimated Total</p>
          <p className="wd-earn-val" style={{ color:'var(--success)' }}>₹{(completedJobs.length * rate * 4).toLocaleString('en-IN')}</p>
          <p style={{ fontSize:'0.75rem', color:'var(--text-muted)', marginTop:'4px' }}>From {completedJobs.length} jobs</p>
        </div>
        <div className="glass-card wd-earn-card" style={{ borderTop:'3px solid var(--primary)' }}>
          <p className="wd-earn-label">Hourly Rate</p>
          <p className="wd-earn-val" style={{ color:'var(--primary)' }}>₹{rate || '—'}</p>
          <p style={{ fontSize:'0.75rem', color:'var(--text-muted)', marginTop:'4px' }}>per hour</p>
        </div>
        <div className="glass-card wd-earn-card" style={{ borderTop:'3px solid #7c3aed' }}>
          <p className="wd-earn-label">Jobs Done</p>
          <p className="wd-earn-val" style={{ color:'#7c3aed' }}>{completedJobs.length}</p>
          <p style={{ fontSize:'0.75rem', color:'var(--text-muted)', marginTop:'4px' }}>completed</p>
        </div>
      </div>

      {!rate && (
        <div className="glass-card wd-rate-prompt">
          <AlertCircle size={20} style={{ color:'var(--warning)', flexShrink:0 }}/>
          <div>
            <p style={{ fontWeight:700, fontSize:'0.9rem' }}>Set your hourly rate</p>
            <p style={{ color:'var(--text-muted)', fontSize:'0.8rem' }}>Employers need to know your rate to hire you.</p>
          </div>
          <button className="btn btn-warning btn-sm" onClick={() => { switchTab('profile'); setEditing(true); }}>Set Rate</button>
        </div>
      )}

      <div className="glass-card">
        <h3 style={{ fontWeight:700, marginBottom:'16px', fontSize:'0.95rem' }}>Job History</h3>
        {completedJobs.length === 0 ? (
          <div style={{ textAlign:'center', padding:'40px', color:'var(--text-muted)', fontSize:'0.85rem' }}>
            <Wallet size={40} style={{ margin:'0 auto 12px', opacity:0.2 }}/>
            <p>No completed jobs yet. Finish jobs to see earnings here.</p>
          </div>
        ) : (
          <div className="wd-earnings-table">
            <div className="wd-et-header"><span>Employer</span><span>Date</span><span>Est. Earn</span><span>Status</span></div>
            {completedJobs.map(j => (
              <div key={j.id} className="wd-et-row">
                <span style={{ fontWeight:600, fontSize:'0.88rem' }}>{j.employerName}</span>
                <span style={{ fontSize:'0.78rem', color:'var(--text-muted)' }}>{new Date(j.createdAt).toLocaleDateString('en-IN')}</span>
                <span style={{ color:'var(--success)', fontWeight:700 }}>₹{rate ? rate * 4 : '—'}</span>
                <span className="badge badge-success">Paid</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // ── Profile Tab ──────────────────────────────────────────────────────────────
  const profileTab = (
    <div className="wd-tab-content">
      <div className="wd-section-header">
        <h2 style={{ fontWeight:800, fontSize:'1.1rem' }}>My Profile</h2>
        {!editing ? (
          <button id="edit-profile-btn" className="btn btn-primary btn-sm" onClick={() => setEditing(true)}>
            <Edit3 size={14}/> Edit
          </button>
        ) : (
          <div style={{ display:'flex', gap:'8px' }}>
            <button id="save-profile-btn" className="btn btn-success btn-sm" onClick={handleSave}><Save size={14}/> Save</button>
            <button id="cancel-edit-btn" className="btn btn-secondary btn-sm" onClick={handleCancel}><X size={14}/> Cancel</button>
          </div>
        )}
      </div>

      {/* Basic info */}
      <div className="glass-card">
        <h3 style={{ fontWeight:700, marginBottom:'18px', fontSize:'0.95rem', borderBottom:'1px solid var(--border)', paddingBottom:'12px' }}>Basic Information</h3>
        <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              {editing
                ? <input type="text" className="form-input" value={form.name||''} onChange={e => setForm(f => ({...f, name:e.target.value}))}/>
                : <p className="wd-profile-val">{currentUser.name}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              {editing
                ? <input type="tel" className="form-input" value={form.phone||''} onChange={e => setForm(f => ({...f, phone:e.target.value}))}/>
                : <p className="wd-profile-val"><Phone size={13} style={{ marginRight:'5px' }}/>{currentUser.phone}</p>}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <p className="wd-profile-val"><Mail size={13} style={{ marginRight:'5px' }}/>{currentUser.email}</p>
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">City</label>
              {editing
                ? <select className="form-select" value={form.city||''} onChange={e => setForm(f => ({...f, city:e.target.value}))}>
                    <option value="">Select</option>
                    {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                : <p className="wd-profile-val"><MapPin size={13} style={{ marginRight:'5px' }}/>{currentUser.city||'Not set'}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Locality</label>
              {editing
                ? <input type="text" className="form-input" value={form.locality||''} onChange={e => setForm(f => ({...f, locality:e.target.value}))}/>
                : <p className="wd-profile-val">{currentUser.locality||'Not set'}</p>}
            </div>
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Hourly Rate (₹)</label>
              {editing
                ? <div style={{ position:'relative' }}>
                    <IndianRupee size={14} style={{ position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }}/>
                    <input type="number" className="form-input" style={{ paddingLeft:'32px' }} value={form.hourlyRate||''} onChange={e => setForm(f => ({...f, hourlyRate:e.target.value}))} min="0" placeholder="0"/>
                  </div>
                : <p className="wd-profile-val" style={{ color:'var(--success)', fontWeight:700 }}>
                    <IndianRupee size={13} style={{ marginRight:'5px' }}/>{currentUser.hourlyRate||'Not set'}{currentUser.hourlyRate?' / hr':''}
                  </p>}
            </div>
            <div className="form-group">
              <label className="form-label">Experience</label>
              {editing
                ? <select className="form-select" value={form.experience||''} onChange={e => setForm(f => ({...f, experience:e.target.value}))}>
                    <option value="">Select</option>
                    {['Fresher','1-2 years','3-5 years','5-8 years','8+ years','10+ years'].map(x => <option key={x} value={x}>{x}</option>)}
                  </select>
                : <p className="wd-profile-val"><Clock size={13} style={{ marginRight:'5px' }}/>{currentUser.experience||'Not set'}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Availability & work type */}
      <div className="glass-card">
        <h3 style={{ fontWeight:700, marginBottom:'14px', fontSize:'0.95rem', borderBottom:'1px solid var(--border)', paddingBottom:'12px' }}>Availability & Work Type</h3>
        <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
          <div className="form-group">
            <label className="form-label">Status</label>
            {editing ? (
              <div style={{ display:'flex', gap:'10px' }}>
                {[['available','✅ Available Now'],['busy','🔴 Busy']].map(([val,label]) => (
                  <button key={val} type="button" className={`role-btn ${form.availability === val ? 'active' : ''}`} style={{ flex:1 }}
                    onClick={() => setForm(f => ({...f, availability:val}))}>{label}</button>
                ))}
              </div>
            ) : (
              <span className={`badge ${currentUser.availability === 'available' ? 'badge-success' : 'badge-danger'}`} style={{ fontSize:'0.85rem', padding:'6px 14px', width:'fit-content' }}>
                {currentUser.availability === 'available' ? '● Available' : '● Busy'}
              </span>
            )}
          </div>
          <div className="form-group">
            <label className="form-label">Work Type</label>
            {editing ? (
              <div style={{ display:'flex', gap:'10px' }}>
                {[['home','🏠 Home']].map(([val,label]) => (
                  <button key={val} type="button" className={`role-btn ${form.jobType?.includes(val) ? 'active' : ''}`} style={{ flex:1 }}
                    onClick={() => toggleJobType(val)}>{label}</button>
                ))}
              </div>
            ) : (
              <div style={{ display:'flex', gap:'8px' }}>
                {currentUser.jobType?.includes('home') && <span className="badge badge-success">🏠 Home / Personal</span>}
                {!currentUser.jobType?.length && <span style={{ color:'var(--text-muted)', fontSize:'0.83rem' }}>Not set</span>}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Skills */}
      <div className="glass-card">
        <h3 style={{ fontWeight:700, marginBottom:'14px', fontSize:'0.95rem', borderBottom:'1px solid var(--border)', paddingBottom:'12px' }}>Skills & Expertise</h3>
        {editing ? (
          <>
            <div style={{ display:'flex', gap:'8px', marginBottom:'10px' }}>
              <input type="text" className="form-input" placeholder="Add skill..."
                value={skillInput}
                onChange={e => setSkillInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}/>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => addSkill()}><Plus size={14}/></button>
            </div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:'6px', marginBottom:'8px' }}>
              {(form.skills||[]).map(s => (
                <button key={s} type="button" className="skill-tag-remove" onClick={() => removeSkill(s)}>{s} <X size={11}/></button>
              ))}
            </div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:'6px', marginTop:'6px' }}>
              {SKILL_SUGGESTIONS.filter(s => !(form.skills||[]).includes(s)).slice(0,8).map(s => (
                <button key={s} type="button" className="demo-btn" style={{ padding:'4px 10px', fontSize:'0.75rem' }} onClick={() => addSkill(s)}>{s}</button>
              ))}
            </div>
          </>
        ) : (
          <div style={{ display:'flex', flexWrap:'wrap', gap:'8px' }}>
            {(currentUser.skills?.length||0) > 0
              ? currentUser.skills.map(s => <span key={s} className="tag" style={{ padding:'6px 14px' }}>{s}</span>)
              : <p style={{ color:'var(--text-muted)', fontSize:'0.85rem' }}>No skills added yet. Click Edit to add skills.</p>}
          </div>
        )}
      </div>

      {/* Bio */}
      <div className="glass-card">
        <h3 style={{ fontWeight:700, marginBottom:'14px', fontSize:'0.95rem', borderBottom:'1px solid var(--border)', paddingBottom:'12px' }}>Bio</h3>
        {editing
          ? <textarea className="form-textarea" rows={4} value={form.bio||''} onChange={e => setForm(f => ({...f, bio:e.target.value}))} placeholder="Describe your experience and work style..."/>
          : currentUser.bio
            ? <p style={{ color:'var(--text-secondary)', fontSize:'0.88rem', lineHeight:'1.75' }}>{currentUser.bio}</p>
            : <p style={{ color:'var(--text-muted)', fontSize:'0.85rem' }}>No bio yet. Click Edit to add one.</p>}
      </div>

      {/* Reviews section */}
      <div className="glass-card">
        <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'16px' }}>
          <Star size={18} style={{ color:'var(--warning)' }}/>
          <h3 style={{ fontWeight:700, fontSize:'0.95rem' }}>Reviews ({reviews.length})</h3>
          {avg > 0 && <span style={{ marginLeft:'auto', color:'var(--warning)', fontWeight:800 }}>★ {avg}</span>}
        </div>
        {reviews.length === 0 ? (
          <div className="wd-empty-reviews">
            <Star size={36} style={{ opacity:0.2, margin:'0 auto 10px' }}/>
            <p style={{ color:'var(--text-muted)', fontSize:'0.85rem' }}>No reviews yet.</p>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
            {reviews.map(r => (
              <div key={r.id} className="wd-review-item">
                <div className="avatar avatar-sm wd-review-avatar">{r.employerName?.[0]?.toUpperCase()}</div>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', justifyContent:'space-between' }}>
                    <p style={{ fontWeight:600, fontSize:'0.88rem' }}>{r.employerName}</p>
                    <p style={{ fontSize:'0.72rem', color:'var(--text-muted)' }}>{r.date}</p>
                  </div>
                  <StarRating value={r.rating} readonly size={13}/>
                  <p style={{ fontSize:'0.84rem', color:'var(--text-secondary)', lineHeight:'1.6', marginTop:'5px' }}>{r.comment}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const mySchedules = getSchedulesForWorker(currentUser.id);
  const mySlots      = currentUser.availableSlots || [];

  const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

  const addSlot = () => {
    if (!slotInput.from || !slotInput.to || slotInput.from >= slotInput.to) {
      showToast('Please enter a valid time range', 'error');
      return;
    }
    const newSlot = { ...slotInput, id: `slot_${Date.now()}` };
    const updated = [...mySlots, newSlot];
    updateAvailableSlots(updated);
    showToast('Availability slot added!');
  };

  const removeSlot = (slotId) => {
    const updated = mySlots.filter(s => s.id !== slotId);
    updateAvailableSlots(updated);
    showToast('Slot removed');
  };

  const scheduleTab = (
    <div className="wd-tab-content">
      {/* My Availability Slots */}
      <div className="glass-card sched-card">
        <div className="sched-header">
          <CalendarClock size={18} style={{ color:'var(--primary)' }}/>
          <h3 style={{ fontWeight:800, fontSize:'1rem' }}>My Availability</h3>
          <p style={{ color:'var(--text-muted)', fontSize:'0.8rem', marginLeft:'auto' }}>
            Employers can book you in these time slots
          </p>
        </div>

        {/* Slot adder */}
        <div className="sched-slot-adder">
          <select className="form-select sched-mini-select" value={slotInput.day}
            onChange={e => setSlotInput(s => ({...s, day: e.target.value}))}>
            {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <div className="sched-time-group">
            <span style={{ fontSize:'0.78rem', color:'var(--text-muted)', fontWeight:600 }}>From</span>
            <input type="time" className="form-input sched-time-input" value={slotInput.from}
              onChange={e => setSlotInput(s => ({...s, from: e.target.value}))}/>
          </div>
          <div className="sched-time-group">
            <span style={{ fontSize:'0.78rem', color:'var(--text-muted)', fontWeight:600 }}>To</span>
            <input type="time" className="form-input sched-time-input" value={slotInput.to}
              onChange={e => setSlotInput(s => ({...s, to: e.target.value}))}/>
          </div>
          <button className="btn btn-primary btn-sm sched-add-btn" onClick={addSlot}>
            <Plus size={14}/> Add Slot
          </button>
        </div>

        {/* Current slots grouped by day */}
        {mySlots.length === 0 ? (
          <div className="sched-empty">
            <CalendarClock size={36} style={{ opacity:0.15, margin:'0 auto 10px' }}/>
            <p style={{ color:'var(--text-muted)', fontSize:'0.85rem' }}>
              No availability slots added yet. Add slots above so employers can schedule you.
            </p>
          </div>
        ) : (
          <div className="sched-slots-grid">
            {DAYS.filter(d => mySlots.some(s => s.day === d)).map(day => (
              <div key={day} className="sched-day-group">
                <p className="sched-day-label">{day}</p>
                <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
                  {mySlots.filter(s => s.day === day).map(slot => (
                    <div key={slot.id} className="sched-slot-chip">
                      <Clock size={12} style={{ color:'var(--primary)' }}/>
                      <span>{slot.from} – {slot.to}</span>
                      <button className="sched-slot-remove" onClick={() => removeSlot(slot.id)} title="Remove">
                        <X size={11}/>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Incoming schedule requests */}
      <div className="glass-card sched-card">
        <div className="sched-header" style={{ marginBottom:'16px' }}>
          <Calendar size={18} style={{ color:'#7c3aed' }}/>
          <h3 style={{ fontWeight:800, fontSize:'1rem' }}>Booking Requests</h3>
          <span className="badge badge-primary" style={{ marginLeft:'auto' }}>{mySchedules.filter(s => s.status === 'pending').length} Pending</span>
        </div>

        {mySchedules.length === 0 ? (
          <div className="sched-empty">
            <Calendar size={36} style={{ opacity:0.15, margin:'0 auto 10px' }}/>
            <p style={{ color:'var(--text-muted)', fontSize:'0.85rem' }}>No booking requests yet.</p>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
            {mySchedules.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).map(sch => (
              <div key={sch.id} className={`sched-request-card sched-status-${sch.status}`}>
                <div className="sched-req-top">
                  <div className="avatar avatar-sm" style={{ background:'linear-gradient(135deg,var(--primary),#7c3aed)', flexShrink:0 }}>
                    {sch.employerName?.[0]?.toUpperCase()}
                  </div>
                  <div style={{ flex:1 }}>
                    <p style={{ fontWeight:700, fontSize:'0.9rem' }}>{sch.employerName}</p>
                    <p style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>
                      {sch.day} · {sch.from} – {sch.to}
                    </p>
                    {sch.note && <p style={{ fontSize:'0.8rem', color:'var(--text-secondary)', marginTop:'4px', fontStyle:'italic' }}>"{sch.note}"</p>}
                  </div>
                  <span className={`badge sched-badge-${sch.status}`}>
                    {sch.status === 'pending'   && <><CalendarClock size={11}/> Pending</>}
                    {sch.status === 'confirmed' && <><CalendarCheck size={11}/> Confirmed</>}
                    {sch.status === 'declined'  && <><CalendarX size={11}/> Declined</>}
                  </span>
                </div>
                {sch.status === 'pending' && (
                  <div style={{ display:'flex', gap:'8px', marginTop:'10px' }}>
                    <button className="btn btn-success btn-sm" style={{ flex:1 }}
                      onClick={async () => { await updateScheduleStatus(sch.id, 'confirmed'); showToast('Booking confirmed! ✅'); }}>
                      <CalendarCheck size={13}/> Confirm
                    </button>
                    <button className="btn btn-danger btn-sm" style={{ flex:1 }}
                      onClick={async () => { await updateScheduleStatus(sch.id, 'declined'); showToast('Booking declined', 'error'); }}>
                      <CalendarX size={13}/> Decline
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const TAB_CONTENT = {
    overview: overviewTab,
    jobs:     jobsTab,
    schedule: scheduleTab,
    findjobs: (
      <FindJobsTab
        currentUser={currentUser}
        openJobs={releasedJobs || []}
        appliedJobs={appliedJobs}
        setAppliedJobs={setAppliedJobs}
        showToast={showToast}
        applyForJob={applyForJob}
      />
    ),
    earnings: earningsTab,
    profile:  profileTab,
  };

  return (
    <div className="wd-page">
      {/* Mobile bottom tab bar */}
      <div className="wd-tab-bar">
        {TABS.map(t => (
          <button
            key={t.id}
            id={`wd-tab-${t.id}`}
            className={`wd-tab-btn ${activeTab === t.id ? 'wd-tab-active' : ''}`}
            onClick={() => switchTab(t.id)}
          >
            {t.icon}
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      <div className="wd-layout">
        {sidebar}

        <div className="wd-main">
          {/* Desktop horizontal tabs */}
          <div className="wd-desktop-tabs glass-card">
            {TABS.map(t => (
              <button
                key={t.id}
                id={`wd-dtab-${t.id}`}
                className={`wd-dtab-btn ${activeTab === t.id ? 'wd-dtab-active' : ''}`}
                onClick={() => switchTab(t.id)}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          {TAB_CONTENT[activeTab]}
        </div>
      </div>

      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
    </div>
  );
}
