import { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import StarRating from '../components/StarRating';
import {
  MapPin, Edit3, Save, X, Plus, Star, Briefcase,
  CheckCircle, Clock, TrendingUp, Search, IndianRupee,
  LayoutDashboard, ListChecks, Wallet, UserCircle2,
  Phone, Mail, Award, Zap, AlertCircle,
  ArrowRight, FileText,
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
  { id:'overview',  label:'Overview',  icon:<LayoutDashboard size={16}/> },
  { id:'jobs',      label:'My Jobs',   icon:<ListChecks size={16}/> },
  { id:'findjobs',  label:'Find Jobs', icon:<Search size={16}/> },
  { id:'earnings',  label:'Earnings',  icon:<Wallet size={16}/> },
  { id:'profile',   label:'Profile',   icon:<UserCircle2 size={16}/> },
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
              workerName: currentUser.name
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
  const { currentUser, updateUser, getReviewsForWorker, getAvgRating, jobs, releasedJobs, applyForJob, updateJobStatus } = useAuth();

  const [activeTab,    setActiveTab]    = useState('overview');
  const [toast,        setToast]        = useState(null);
  const [editing,      setEditing]      = useState(false);
  const [form,         setForm]         = useState({ ...currentUser });
  const [skillInput,   setSkillInput]   = useState('');
  const [appliedJobs,  setAppliedJobs]  = useState([]);

  const reviews      = getReviewsForWorker(currentUser.id);
  const avg          = getAvgRating(currentUser.id);
  const myJobs       = (jobs || []).filter(j => j.workerId === currentUser.id);
  const completedJobs = myJobs.filter(j => j.status === 'completed');
  const pendingJobs  = myJobs.filter(j => j.status === 'open');

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
          {currentUser.jobType?.includes('business') && <span className="badge badge-primary">🏢 Business</span>}
          {!currentUser.jobType?.length && <span style={{ fontSize:'0.78rem', color:'var(--text-muted)' }}>No work types set</span>}
        </div>
        {/* Availability toggle */}
        <div
          className={`wd-avail-toggle ${currentUser.availability === 'available' ? 'avail-on' : 'avail-off'}`}
          onClick={() => {
            const updated = { ...currentUser, availability: currentUser.availability === 'available' ? 'busy' : 'available' };
            updateUser(updated);
            showToast(updated.availability === 'available' ? '✅ Now showing as Available' : '🔴 Now showing as Busy');
          }}
        >
          <span className="avail-indicator"/>
          {currentUser.availability === 'available' ? 'Available for Work' : 'Marked as Busy'}
          <span style={{ fontSize:'0.68rem', marginLeft:'auto', opacity:0.6 }}>tap to toggle</span>
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
          <div key={s.label} className="glass-card wd-quick-stat-card" style={{ borderTop:`3px solid ${s.color}` }}>
            <div style={{ color:s.color, background:s.bg, padding:'8px', borderRadius:'10px', width:'fit-content' }}>{s.icon}</div>
            <p className="wd-qs-val" style={{ color:s.color }}>{s.val}</p>
            <p className="wd-qs-label">{s.label}</p>
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
      <div className="glass-card">
        <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'16px' }}>
          <Star size={18} style={{ color:'var(--warning)' }}/>
          <h3 style={{ fontWeight:700, fontSize:'0.95rem' }}>Recent Reviews</h3>
          {avg > 0 && <span style={{ marginLeft:'auto', color:'var(--warning)', fontWeight:800 }}>★ {avg}</span>}
        </div>
        {reviews.length === 0 ? (
          <div className="wd-empty-reviews">
            <Star size={36} style={{ opacity:0.2, margin:'0 auto 10px' }}/>
            <p style={{ color:'var(--text-muted)', fontSize:'0.85rem' }}>No reviews yet. Complete jobs to receive feedback.</p>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
            {reviews.slice(0,3).map(r => (
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
                <Zap size={15}/> Incoming Requests ({pendingJobs.length})
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
                        onClick={() => { updateJobStatus(j.id,'completed'); showToast('Job accepted & marked complete!'); }}>
                        <CheckCircle size={13}/> Accept & Complete
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

          {completedJobs.length > 0 && (
            <div className="glass-card">
              <h3 className="wd-jobs-section-title" style={{ color:'var(--success)' }}>
                <CheckCircle size={15}/> Completed ({completedJobs.length})
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
                ? <input type="number" className="form-input" value={form.hourlyRate||''} onChange={e => setForm(f => ({...f, hourlyRate:e.target.value}))} min="0"/>
                : <p className="wd-profile-val" style={{ color:'var(--success)', fontWeight:700 }}>
                    <IndianRupee size={13} style={{ marginRight:'5px' }}/>{currentUser.hourlyRate||'Not set'}{currentUser.hourlyRate?'/hr':''}
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
                {[['home','🏠 Home'],['business','🏢 Business']].map(([val,label]) => (
                  <button key={val} type="button" className={`role-btn ${form.jobType?.includes(val) ? 'active' : ''}`} style={{ flex:1 }}
                    onClick={() => toggleJobType(val)}>{label}</button>
                ))}
              </div>
            ) : (
              <div style={{ display:'flex', gap:'8px' }}>
                {currentUser.jobType?.includes('home')     && <span className="badge badge-success">🏠 Home / Personal</span>}
                {currentUser.jobType?.includes('business') && <span className="badge badge-primary">🏢 Business</span>}
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

  const TAB_CONTENT = {
    overview: overviewTab,
    jobs:     jobsTab,
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
