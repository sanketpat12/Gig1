import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import WorkerCard from '../components/WorkerCard';
import ReviewModal from '../components/ReviewModal';
import { Search, MapPin, Briefcase, SlidersHorizontal, X, PlusCircle, Bell, CheckCircle, Users, ShieldCheck, Hash, Calendar, CalendarCheck, CalendarX, CalendarClock, Edit3, Trash2, Clock3, IndianRupee } from 'lucide-react';
import './EmployerDashboard.css';

export default function EmployerDashboard() {
  const { currentUser, getWorkers, getCities, getLocalities, postJob, releasedJobs, releaseJob, updateReleasedJob, removeReleasedJob, getJobsForEmployer, updateJobStatus, getWorkerById, verifyAttendanceCode, getUserById, deleteJob, clearCompletedJobs, createSchedule, getSchedulesForEmployer, refreshWorkers } = useAuth();

  /* Work type selection - Persist in sessionStorage so 'back' button doesn't reset it */
  /* Default to 'home' as home use is removed */
  const workType = 'home';

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
  const [editingReleasedJob, setEditingReleasedJob] = useState(null);
  
  /* Applicant Detail modal - Persist its ID so modal re-opens after pressing 'back' */
  const [selectedAppId, setSelectedAppId] = useState(() => sessionStorage.getItem('gig_emp_applicant_id') || null);
  
  /* View toggle: 'browse' | 'posts' | 'hired' | 'schedules' */
  const [empView, setEmpView] = useState('browse');
  
  /* Verification code inputs for each job */
  const [codeInputs, setCodeInputs] = useState({});
  
  /* Hired worker profile modal - stores { worker, job } */
  const [selectedHiredWorker, setSelectedHiredWorker] = useState(null);
  
<<<<<<< HEAD
  /* Schedule modal */
  const [scheduleWorker, setScheduleWorker] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

=======
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  
>>>>>>> 5fb96a6 (Q2)
  const [toast, setToast] = useState(null);

  // Auto-refresh workers from DB when employer opens the dashboard
  useEffect(() => { refreshWorkers(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync state to sessionStorage whenever it changes
  useEffect(() => {
    if (city) sessionStorage.setItem('gig_emp_city', city); else sessionStorage.removeItem('gig_emp_city');
    if (locality) sessionStorage.setItem('gig_emp_locality', locality); else sessionStorage.removeItem('gig_emp_locality');
    if (skill) sessionStorage.setItem('gig_emp_skill', skill); else sessionStorage.removeItem('gig_emp_skill');
    if (availability) sessionStorage.setItem('gig_emp_avail', availability); else sessionStorage.removeItem('gig_emp_avail');
    if (selectedAppId) sessionStorage.setItem('gig_emp_applicant_id', selectedAppId); else sessionStorage.removeItem('gig_emp_applicant_id');
    sessionStorage.setItem('gig_emp_showFilters', showFilters);
  }, [city, locality, skill, availability, showFilters, selectedAppId]);

  const cities = getCities();
  const localities = city ? getLocalities(city) : [];

  const workers = useMemo(() => {
    if (!workType) return [];
    return getWorkers({ jobType: workType, city, locality, skill, availability });
  }, [workType, city, locality, skill, availability, getWorkers]);

  const myReleasedJobs = useMemo(
    () => [...(releasedJobs || [])]
      .filter(job => job.employerId === currentUser.id)
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)),
    [releasedJobs, currentUser.id]
  );

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const clearFilters = () => { setCity(''); setLocality(''); setSkill(''); setAvailability(''); };

  // Pending worker applications to open jobs
  const employerJobs = getJobsForEmployer(currentUser?.id);
  const pendingApplications = employerJobs.filter(j => j.status === 'applied');
  const pendingApplicationsByReleasedJob = useMemo(
    () => pendingApplications.reduce((acc, application) => {
      if (!application.id?.includes('_rjob_')) return acc;

      const releasedJobId = application.id.split('_rjob_')[1];
      if (!releasedJobId) return acc;

      acc[releasedJobId] = (acc[releasedJobId] || 0) + 1;
      return acc;
    }, {}),
    [pendingApplications]
  );
  
  // Reconstruct selectedApplicant from persisted ID
  const selectedApplicantApp = pendingApplications.find(a => a.id === selectedAppId);
  const selectedApplicantWorker = selectedApplicantApp ? getWorkerById(selectedApplicantApp.workerId) : null;
  const selectedApplicant = selectedApplicantWorker ? { worker: selectedApplicantWorker, jobId: selectedApplicantApp.id } : null;

  // Hired workers (accepted / verified / completed)
  const hiredJobs = employerJobs.filter(j => ['open','verified','completed'].includes(j.status) || j.status?.startsWith('accepted_'));
  const awaitingAcceptJobs = hiredJobs.filter(j => j.status === 'open');
  const acceptedHiredJobs = hiredJobs.filter(j => j.status?.startsWith('accepted_'));
  const verifiedHiredJobs = hiredJobs.filter(j => j.status === 'verified');
  const completedHiredJobs = hiredJobs.filter(j => j.status === 'completed');

  const mySchedules = getSchedulesForEmployer(currentUser.id);
  const pendingSchedules   = mySchedules.filter(s => s.status === 'pending');
  const confirmedSchedules = mySchedules.filter(s => s.status === 'confirmed');
  const declinedSchedules  = mySchedules.filter(s => s.status === 'declined');

  return (
    <div className="emp-page">
      {/* Header */}
      <div className="emp-toolbar">
        <div className="emp-toolbar-left">
          <span className="badge badge-success" style={{ fontSize:'0.82rem', padding:'6px 14px' }}>
            🏠 Home / Personal
          </span>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems:'center' }}>
          {/* Refresh Button */}
          <button
            className={`btn btn-secondary btn-sm ${refreshing ? 'btn-disabled' : ''}`}
            onClick={async () => { setRefreshing(true); await refreshWorkers(); setRefreshing(false); showToast('Worker list refreshed!'); }}
            title="Reload workers from database"
            disabled={refreshing}
          >
            {refreshing ? '⟳ Refreshing…' : '⟳ Refresh'}
          </button>

          {/* Expandable Search */}
          {isSearchExpanded ? (
            <div style={{ display:'flex', alignItems:'center', background:'var(--bg-card)', border:'1px solid var(--primary)', borderRadius:'999px', padding:'2px 6px 2px 14px', width:'220px', transition:'all 0.3s ease', boxShadow:'0 0 0 2px rgba(41,98,255,0.1)' }}>
              <Search size={14} style={{ color:'var(--primary)' }}/>
              <input
                type="text"
                autoFocus
                placeholder="Search skills..."
                value={skill}
                onChange={e => setSkill(e.target.value)}
                style={{ border:'none', background:'transparent', outline:'none', fontSize:'0.85rem', padding:'6px 8px', flex:1, color:'var(--text-primary)' }}
              />
              <button style={{ background:'none', border:'none', cursor:'pointer', display:'flex', padding:'4px', alignItems:'center' }} onClick={() => { setIsSearchExpanded(false); setSkill(''); }}>
                <X size={14} style={{ color:'var(--text-muted)' }}/>
              </button>
            </div>
          ) : (
            <button className="btn btn-secondary btn-sm" style={{ padding:'0 12px', borderRadius:'999px' }} onClick={() => setIsSearchExpanded(true)}>
              <Search size={15} style={{ color:'var(--text-secondary)' }}/>
            </button>
          )}
          <button
            className="btn btn-primary btn-sm"
            onClick={() => {
              setEditingReleasedJob(null);
              setShowReleaseModal(true);
            }}
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

      {/* View Switcher: Browse Workers | My Posts | Hired Workers | My Schedules */}
      <div className="glass-card" style={{ display:'flex', gap:'4px', padding:'4px', marginBottom:'20px', flexWrap:'wrap' }}>
        <button
          className={`btn btn-sm ${empView === 'browse' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ flex:1, borderRadius:'8px', minWidth:'100px' }}
          onClick={() => setEmpView('browse')}
        >
          <Search size={14}/> Browse Workers
        </button>
        <button
          className={`btn btn-sm ${empView === 'posts' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ flex:1, borderRadius:'8px', position:'relative', minWidth:'100px' }}
          onClick={() => setEmpView('posts')}
        >
          <Briefcase size={14}/> My Posts
          {myReleasedJobs.length > 0 && (
            <span style={{ position:'absolute', top:'-4px', right:'-4px', background:'var(--primary)', color:'#fff', borderRadius:'50%', width:'18px', height:'18px', fontSize:'0.65rem', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700 }}>
              {myReleasedJobs.length}
            </span>
          )}
        </button>
        <button
          className={`btn btn-sm ${empView === 'hired' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ flex:1, borderRadius:'8px', position:'relative', minWidth:'100px' }}
          onClick={() => setEmpView('hired')}
        >
          <Users size={14}/> Hired Workers
          {hiredJobs.length > 0 && (
            <span style={{ position:'absolute', top:'-4px', right:'-4px', background:'var(--danger)', color:'#fff', borderRadius:'50%', width:'18px', height:'18px', fontSize:'0.65rem', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700 }}>
              {hiredJobs.length}
            </span>
          )}
        </button>
        <button
          className={`btn btn-sm ${empView === 'schedules' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ flex:1, borderRadius:'8px', position:'relative', minWidth:'100px' }}
          onClick={() => setEmpView('schedules')}
        >
          <Calendar size={14}/> My Schedules
          {pendingSchedules.length > 0 && (
            <span style={{ position:'absolute', top:'-4px', right:'-4px', background:'var(--warning)', color:'#fff', borderRadius:'50%', width:'18px', height:'18px', fontSize:'0.65rem', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700 }}>
              {pendingSchedules.length}
            </span>
          )}
        </button>
      </div>

      {/* ──── BROWSE WORKERS VIEW ──── */}
      {empView === 'browse' && (
        <>
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
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', cursor: 'pointer', transition: 'border-color 0.2s' }}
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
                          updateJobStatus(app.id, 'open');
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
                        onClick={() => { updateJobStatus(app.id, 'rejected'); }}
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
                    <WorkerCard worker={selectedApplicant.worker} showActions={false} />
                  </div>
                  <div style={{ display: 'flex', gap: '12px', padding: '16px 20px', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)' }}>
                    <button 
                      className="btn btn-primary" style={{ flex: 1 }}
                      onClick={() => {
                        updateJobStatus(selectedApplicant.jobId, 'open');
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
                      showToast(`Hire request sent to ${worker.name}! Check your Hired Workers tab.`);
                    }}
                    onSchedule={(worker) => setScheduleWorker(worker)}
                    onReview={(worker) => setReviewWorker(worker)}
                  />
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ──── HIRED WORKERS VIEW ──── */}
      {empView === 'posts' && (
        <div style={{ display:'flex', flexDirection:'column', gap:'20px' }}>
          {myReleasedJobs.length === 0 ? (
            <div className="glass-card" style={{ textAlign:'center', padding:'56px 20px' }}>
              <Briefcase size={52} style={{ color:'var(--text-muted)', margin:'0 auto 14px', opacity:0.25 }}/>
              <h3 style={{ color:'var(--text-secondary)', fontWeight:700, marginBottom:'8px' }}>No posted jobs yet</h3>
              <p style={{ color:'var(--text-muted)', fontSize:'0.85rem', marginBottom:'18px' }}>
                Post an open job to attract workers, then manage it here.
              </p>
              <button className="btn btn-primary btn-sm" onClick={() => {
                setEditingReleasedJob(null);
                setShowReleaseModal(true);
              }}>
                <PlusCircle size={14}/> Post Open Job
              </button>
            </div>
          ) : (
            <>
              <div className="glass-card" style={{ padding:'18px 20px', display:'flex', justifyContent:'space-between', alignItems:'center', gap:'12px', flexWrap:'wrap' }}>
                <div>
                  <h2 style={{ fontSize:'1.05rem', fontWeight:800, marginBottom:'4px' }}>Manage Your Posted Jobs</h2>
                  <p style={{ color:'var(--text-muted)', fontSize:'0.83rem' }}>
                    Edit details, remove old posts, and track incoming applications from workers.
                  </p>
                </div>
                <button className="btn btn-primary btn-sm" onClick={() => {
                  setEditingReleasedJob(null);
                  setShowReleaseModal(true);
                }}>
                  <PlusCircle size={14}/> New Post
                </button>
              </div>

              <div className="emp-posts-grid">
                {myReleasedJobs.map(job => {
                  const applicantCount = pendingApplicationsByReleasedJob[job.id] || 0;

                  return (
                    <div key={job.id} className="glass-card emp-post-card">
                      <div className="emp-post-top">
                        <div>
                          <div className="emp-post-title-row">
                            <h3 className="emp-post-title">{job.title}</h3>
                            <span className={`badge ${applicantCount > 0 ? 'badge-primary' : 'badge-success'}`}>
                              {applicantCount > 0 ? `${applicantCount} Applicant${applicantCount > 1 ? 's' : ''}` : 'Open'}
                            </span>
                          </div>
                          <p className="emp-post-date">
                            Posted {job.createdAt ? new Date(job.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }) : 'recently'}
                          </p>
                        </div>
                      </div>

                      <div className="emp-post-meta">
                        <span><MapPin size={13}/> {job.location || 'Location not set'}</span>
                        <span><Clock3 size={13}/> {job.duration || 'Duration not set'}</span>
                        <span><IndianRupee size={13}/> {job.budget || 'Negotiable'}</span>
                      </div>

                      <div style={{ display:'flex', flexWrap:'wrap', gap:'6px', marginBottom:'14px' }}>
                        {(job.skills || []).length > 0
                          ? job.skills.map(skillTag => <span key={skillTag} className="tag">{skillTag}</span>)
                          : <span style={{ color:'var(--text-muted)', fontSize:'0.82rem' }}>No required skills added</span>}
                      </div>

                      {applicantCount > 0 && (
                        <div className="emp-post-note">
                          <Bell size={14} style={{ color:'var(--primary)' }}/>
                          <span>{applicantCount} worker application{applicantCount > 1 ? 's are' : ' is'} waiting in Browse Workers.</span>
                        </div>
                      )}

                      <div className="emp-post-actions">
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => {
                            setEditingReleasedJob(job);
                            setShowReleaseModal(true);
                          }}
                        >
                          <Edit3 size={14}/> Edit
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={async () => {
                            const confirmed = window.confirm(
                              applicantCount > 0
                                ? 'Delete this post? Pending applications for it will also be removed.'
                                : 'Delete this posted job?'
                            );
                            if (!confirmed) return;

                            await removeReleasedJob(job.id);
                            showToast(`"${job.title}" deleted successfully.`);
                          }}
                        >
                          <Trash2 size={14}/> Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {empView === 'hired' && (
        <div style={{ display:'flex', flexDirection:'column', gap:'20px' }}>
          {hiredJobs.length === 0 ? (
            <div className="glass-card" style={{ textAlign:'center', padding:'50px 20px' }}>
              <Users size={48} style={{ color:'var(--text-muted)', margin:'0 auto 12px', opacity:0.3 }}/>
              <h3 style={{ color:'var(--text-secondary)', fontWeight:700 }}>No hired workers yet</h3>
              <p style={{ color:'var(--text-muted)', fontSize:'0.85rem', marginTop:'8px' }}>Hire workers from the Browse tab or post an open job.</p>
              <button className="btn btn-primary btn-sm" style={{ marginTop:'16px' }} onClick={() => setEmpView('browse')}>
                <Search size={14}/> Browse Workers
              </button>
            </div>
          ) : (
            <>
              {/* Awaiting Worker Acceptance */}
              {awaitingAcceptJobs.length > 0 && (
                <div className="glass-card" style={{ borderLeft:'4px solid var(--warning)' }}>
                  <h3 style={{ fontWeight:700, fontSize:'0.95rem', marginBottom:'14px', display:'flex', alignItems:'center', gap:'8px', color:'var(--warning)' }}>
                    <Briefcase size={16}/> Awaiting Worker Acceptance ({awaitingAcceptJobs.length})
                  </h3>
                  <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                    {awaitingAcceptJobs.map(j => {
                      const w = getWorkerById(j.workerId);
                      return (
                        <div 
                          key={j.id} 
                          onClick={() => w && setSelectedHiredWorker({ workerId: j.workerId, jobId: j.id })}
                          style={{ display:'flex', alignItems:'center', gap:'12px', padding:'10px 14px', background:'rgba(255,193,7,0.06)', borderRadius:'10px', border:'1px solid rgba(255,193,7,0.2)', cursor:'pointer', transition:'all 0.2s' }}
                          className="hover-border-primary"
                        >
                          <div className="avatar avatar-sm" style={{ background:'linear-gradient(135deg,var(--warning),#ffa000)', flexShrink:0 }}>
                            {j.workerName?.[0]?.toUpperCase()}
                          </div>
                          <div style={{ flex:1 }}>
                            <p style={{ fontWeight:700, fontSize:'0.9rem' }}>{j.workerName}</p>
                            <p style={{ fontSize:'0.73rem', color:'var(--text-muted)' }}>Tap to view profile • Waiting for acceptance</p>
                          </div>
                          <span className="badge badge-warning">Pending</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Workers who accepted – Enter code to verify attendance */}
              {acceptedHiredJobs.length > 0 && (
                <div className="glass-card" style={{ borderLeft:'4px solid #7c3aed' }}>
                  <h3 style={{ fontWeight:700, fontSize:'0.95rem', marginBottom:'14px', display:'flex', alignItems:'center', gap:'8px', color:'#7c3aed' }}>
                    <ShieldCheck size={16}/> Ready for Attendance Verification ({acceptedHiredJobs.length})
                  </h3>
                  <p style={{ fontSize:'0.82rem', color:'var(--text-muted)', marginBottom:'16px' }}>
                    Ask the worker for their 4-digit code and enter it below to verify attendance.
                  </p>
                  <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
                    {acceptedHiredJobs.map(j => {
                      const w = getUserById(j.workerId);
                      return (
                        <div key={j.id} style={{ padding:'16px', background:'linear-gradient(135deg,rgba(124,58,237,0.04),rgba(167,139,250,0.04))', borderRadius:'12px', border:'1px solid rgba(124,58,237,0.15)' }}>
                          <div 
                            style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'12px', cursor:'pointer' }}
                            onClick={() => w && setSelectedHiredWorker({ workerId: j.workerId, jobId: j.id })}
                          >
                            <div className="avatar avatar-sm" style={{ background:'linear-gradient(135deg,#7c3aed,#a78bfa)', flexShrink:0 }}>
                              {j.workerName?.[0]?.toUpperCase()}
                            </div>
                            <div style={{ flex:1 }}>
                              <p style={{ fontWeight:700, fontSize:'0.9rem' }}>{j.workerName}</p>
                              <p style={{ fontSize:'0.73rem', color:'var(--text-muted)' }}>Tap name to view profile • Enter code below</p>
                            </div>
                            <span className="badge" style={{ background:'rgba(124,58,237,0.15)', color:'#7c3aed' }}>Accepted</span>
                          </div>

                          {/* Reveal worker contact info since job is accepted */}
                          <div style={{ background:'rgba(124,58,237,0.06)', borderRadius:'10px', padding:'10px', marginBottom:'12px' }}>
                            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#7c3aed', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>📞 Worker Contact</p>
                            {w?.phone && (
                              <p style={{ fontSize: '0.88rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
                                📱 <strong>{w.phone}</strong>
                              </p>
                            )}
                            {w?.email && (
                              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                ✉️ {w.email}
                              </p>
                            )}
                          </div>

                          <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
                            <div style={{ position:'relative', flex:1 }}>
                              <Hash size={14} style={{ position:'absolute', left:'10px', top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }}/>
                              <input
                                type="text"
                                className="form-input"
                                placeholder="Enter 4-digit code"
                                maxLength={4}
                                value={codeInputs[j.id] || ''}
                                onChange={e => setCodeInputs(prev => ({ ...prev, [j.id]: e.target.value.replace(/\D/g, '') }))}
                                style={{ paddingLeft:'32px', textAlign:'center', fontSize:'1.1rem', fontFamily:'monospace', letterSpacing:'4px', fontWeight:700 }}
                              />
                            </div>
                            <button
                              className="btn btn-primary btn-sm"
                              disabled={!codeInputs[j.id] || codeInputs[j.id].length !== 4}
                              onClick={async () => {
                                const result = await verifyAttendanceCode(j.id, codeInputs[j.id]);
                                if (result.success) {
                                  showToast(`\u2705 ${result.message}`);
                                  setCodeInputs(prev => { const n = {...prev}; delete n[j.id]; return n; });
                                } else {
                                  showToast(result.message, 'error');
                                }
                              }}
                            >
                              <ShieldCheck size={14}/> Verify
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Verified attendance */}
              {verifiedHiredJobs.length > 0 && (
                <div className="glass-card" style={{ borderLeft:'4px solid var(--success)' }}>
                  <h3 style={{ fontWeight:700, fontSize:'0.95rem', marginBottom:'14px', display:'flex', alignItems:'center', gap:'8px', color:'var(--success)' }}>
                    <CheckCircle size={16}/> Attendance Verified ({verifiedHiredJobs.length})
                  </h3>
                  <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                    {verifiedHiredJobs.map(j => {
                      const w = getWorkerById(j.workerId);
                      return (
                        <div 
                          key={j.id} 
                          onClick={() => w && setSelectedHiredWorker({ workerId: j.workerId, jobId: j.id })}
                          style={{ display:'flex', alignItems:'center', gap:'12px', padding:'10px 14px', background:'rgba(18,184,134,0.06)', borderRadius:'10px', border:'1px solid rgba(18,184,134,0.2)', cursor:'pointer' }}
                          className="hover-border-primary"
                        >
                          <div className="avatar avatar-sm" style={{ background:'linear-gradient(135deg,#43e97b,#12b886)', flexShrink:0 }}>
                            {j.workerName?.[0]?.toUpperCase()}
                          </div>
                          <div style={{ flex:1 }}>
                            <p style={{ fontWeight:700, fontSize:'0.9rem' }}>{j.workerName}</p>
                            <p style={{ fontSize:'0.73rem', color:'var(--text-muted)' }}>
                              Verified on {new Date(j.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short' })}
                            </p>
                          </div>
                          <span className="badge badge-success">✅ Verified</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Completed */}
              {completedHiredJobs.length > 0 && (
                <div className="glass-card" style={{ borderLeft:'4px solid var(--success)' }}>
                  <h3 style={{ fontWeight:700, fontSize:'0.95rem', marginBottom:'14px', display:'flex', alignItems:'center', gap:'8px', color:'var(--success)' }}>
                    <CheckCircle size={16}/> Completed ({completedHiredJobs.length})
                    <button 
                      className="btn btn-clear-all btn-sm" 
                      style={{ marginLeft:'auto', padding:'4px 12px', fontSize:'0.72rem' }}
                      onClick={() => {
                        clearCompletedJobs(currentUser.id, 'employer');
                        showToast('Completed history cleared');
                      }}
                    >
                      Clear All
                    </button>
                  </h3>
                  <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                    {completedHiredJobs.map(j => (
                      <div key={j.id} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'10px 14px', background:'rgba(18,184,134,0.06)', borderRadius:'10px', border:'1px solid rgba(18,184,134,0.2)' }}>
                        <div className="avatar avatar-sm" style={{ background:'linear-gradient(135deg,#43e97b,#12b886)', flexShrink:0 }}>
                          {j.workerName?.[0]?.toUpperCase()}
                        </div>
                        <div style={{ flex:1 }}>
                          <p style={{ fontWeight:700, fontSize:'0.9rem' }}>{j.workerName}</p>
                          <p style={{ fontSize:'0.73rem', color:'var(--text-muted)' }}>Job completed</p>
                        </div>
                        <span className="badge badge-success">✅ Done</span>
                        <button 
                          className="btn-dismiss" 
                          style={{ marginLeft:'12px', color:'var(--text-muted)' }}
                          onClick={() => {
                            deleteJob(j.id);
                            showToast('Job removed from history');
                          }}
                          title="Dismiss"
                        >
                          <X size={14}/>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
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

      {/* Hired Worker Profile Modal with Code Verification */}
      {selectedHiredWorker && (() => {
        const liveJob = employerJobs.find(j => j.id === selectedHiredWorker.jobId);
        const liveWorker = getUserById(selectedHiredWorker.workerId);
        const liveStatus = liveJob?.status || 'open';
        
        if (!liveWorker) return null;
        
        const isVerified = liveStatus === 'verified' || liveStatus === 'completed';
        const isAccepted = liveStatus.startsWith('accepted_');
        
        return (
          <div className="modal-overlay" onClick={() => setSelectedHiredWorker(null)}>
            <div className="modal-content animate-fadeInUp" onClick={e => e.stopPropagation()} style={{ maxWidth: '420px', padding: 0, background: 'transparent', boxShadow: 'none' }}>
              <div style={{ background: '#fff', borderRadius: '16px', overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
                  <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Worker Profile</h2>
                  <button className="btn-icon" onClick={() => setSelectedHiredWorker(null)}><X size={20}/></button>
                </div>
                <div style={{ padding: '20px' }}>
                  <WorkerCard worker={liveWorker} showActions={false} />
                </div>

                {/* Show contact info if accepted or later */}
                {(isAccepted || isVerified) && (
                  <div style={{ padding: '14px 20px', background: 'rgba(124,58,237,0.06)', borderTop: '1px solid var(--border)' }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#7c3aed', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>📞 Worker Contact</p>
                    {liveWorker.phone && (
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
                        📱 <strong>{liveWorker.phone}</strong>
                      </p>
                    )}
                    {liveWorker.email && (
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        ✉️ {liveWorker.email}
                      </p>
                    )}
                  </div>
                )}

                {/* Verified \u2013 show success */}
                {isVerified ? (
                  <div style={{ padding: '14px 20px', background: 'rgba(18,184,134,0.08)', borderTop: '1px solid rgba(18,184,134,0.2)' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                      <CheckCircle size={16} style={{ color:'var(--success)' }}/>
                      <p style={{ fontWeight:600, fontSize:'0.88rem', color:'var(--success)' }}>{liveStatus === 'verified' ? '\u2705 Attendance verified successfully' : '\u2705 Job completed'}</p>
                    </div>
                  </div>
                ) : isAccepted ? (
                  /* Not verified yet \u2013 always show code input */
                  <div style={{ padding: '16px 20px', background: 'linear-gradient(135deg,rgba(124,58,237,0.06),rgba(167,139,250,0.06))', borderTop: '1px solid rgba(124,58,237,0.2)' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'10px' }}>
                      <ShieldCheck size={16} style={{ color:'#7c3aed' }}/>
                      <p style={{ fontWeight:700, fontSize:'0.9rem', color:'#7c3aed' }}>Verify Attendance Code</p>
                    </div>
                    <p style={{ fontSize:'0.78rem', color:'var(--text-muted)', marginBottom:'12px' }}>
                      When the worker arrives, ask for their 4-digit code and enter it below to mark attendance.
                    </p>
                    <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
                      <div style={{ position:'relative', flex:1 }}>
                        <Hash size={14} style={{ position:'absolute', left:'10px', top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }}/>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="_ _ _ _"
                          maxLength={4}
                          value={codeInputs[selectedHiredWorker.jobId] || ''}
                          onChange={e => setCodeInputs(prev => ({ ...prev, [selectedHiredWorker.jobId]: e.target.value.replace(/\D/g, '') }))}
                          style={{ paddingLeft:'32px', textAlign:'center', fontSize:'1.3rem', fontFamily:'monospace', letterSpacing:'8px', fontWeight:800 }}
                        />
                      </div>
                      <button
                        className="btn btn-primary"
                        disabled={!codeInputs[selectedHiredWorker.jobId] || codeInputs[selectedHiredWorker.jobId].length !== 4}
                        onClick={async () => {
                          const result = await verifyAttendanceCode(selectedHiredWorker.jobId, codeInputs[selectedHiredWorker.jobId]);
                          if (result.success) {
                            showToast(`\u2705 ${result.message}`);
                            setCodeInputs(prev => { const n = {...prev}; delete n[selectedHiredWorker.jobId]; return n; });
                            setSelectedHiredWorker(null);
                          } else {
                            showToast(result.message, 'error');
                          }
                        }}
                        style={{ whiteSpace:'nowrap' }}
                      >
                        <ShieldCheck size={15}/> Verify
                      </button>
                    </div>
                  </div>
                ) : null}

                <div style={{ padding: '12px 20px 16px', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)', textAlign:'center' }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => setSelectedHiredWorker(null)} style={{ minWidth:'120px' }}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ──── MY SCHEDULES VIEW ──── */}
      {empView === 'schedules' && (
        <div style={{ display:'flex', flexDirection:'column', gap:'20px' }}>
          {mySchedules.length === 0 ? (
            <div className="glass-card" style={{ textAlign:'center', padding:'60px 20px' }}>
              <CalendarClock size={56} style={{ color:'var(--text-muted)', margin:'0 auto 16px', opacity:0.2 }}/>
              <h3 style={{ color:'var(--text-secondary)', fontWeight:700, marginBottom:'8px' }}>No Schedule Requests Yet</h3>
              <p style={{ color:'var(--text-muted)', fontSize:'0.85rem', marginBottom:'20px' }}>
                Browse workers and click "Schedule" to book them for a specific time slot.
              </p>
              <button className="btn btn-primary btn-sm" onClick={() => setEmpView('browse')}>
                <Search size={14}/> Browse Workers
              </button>
            </div>
          ) : (
            <>
              {/* Pending */}
              {pendingSchedules.length > 0 && (
                <div className="glass-card" style={{ borderLeft:'4px solid var(--warning)' }}>
                  <h3 style={{ fontWeight:700, fontSize:'0.95rem', marginBottom:'16px', display:'flex', alignItems:'center', gap:'8px', color:'var(--warning)' }}>
                    <CalendarClock size={16}/> Awaiting Confirmation ({pendingSchedules.length})
                  </h3>
                  <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                    {pendingSchedules.map(s => (
                      <div key={s.id} className="emp-sched-row emp-sched-pending">
                        <div className="avatar avatar-sm" style={{ background:'linear-gradient(135deg,var(--warning),#ffa000)', flexShrink:0 }}>
                          {s.workerName?.[0]?.toUpperCase()}
                        </div>
                        <div style={{ flex:1 }}>
                          <p style={{ fontWeight:700, fontSize:'0.9rem' }}>{s.workerName}</p>
                          <p style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>
                            <CalendarClock size={11} style={{ marginRight:'4px', verticalAlign:'middle' }}/>
                            {s.day} · {s.from} – {s.to}
                          </p>
                          {s.note && <p style={{ fontSize:'0.78rem', color:'var(--text-secondary)', marginTop:'4px', fontStyle:'italic' }}>"{s.note}"</p>}
                        </div>
                        <span className="badge sched-badge-pending" style={{ flexShrink:0 }}>
                          <CalendarClock size={11}/> Pending
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Confirmed */}
              {confirmedSchedules.length > 0 && (
                <div className="glass-card" style={{ borderLeft:'4px solid var(--success)' }}>
                  <h3 style={{ fontWeight:700, fontSize:'0.95rem', marginBottom:'16px', display:'flex', alignItems:'center', gap:'8px', color:'var(--success)' }}>
                    <CalendarCheck size={16}/> Confirmed Bookings ({confirmedSchedules.length})
                  </h3>
                  <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                    {confirmedSchedules.map(s => (
                      <div key={s.id} className="emp-sched-row emp-sched-confirmed">
                        <div className="avatar avatar-sm" style={{ background:'linear-gradient(135deg,#43e97b,#12b886)', flexShrink:0 }}>
                          {s.workerName?.[0]?.toUpperCase()}
                        </div>
                        <div style={{ flex:1 }}>
                          <p style={{ fontWeight:700, fontSize:'0.9rem' }}>{s.workerName}</p>
                          <p style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>
                            <CalendarCheck size={11} style={{ marginRight:'4px', verticalAlign:'middle' }}/>
                            {s.day} · {s.from} – {s.to}
                          </p>
                          {s.note && <p style={{ fontSize:'0.78rem', color:'var(--text-secondary)', marginTop:'4px', fontStyle:'italic' }}>"{s.note}"</p>}
                        </div>
                        <span className="badge sched-badge-confirmed" style={{ flexShrink:0 }}>
                          <CalendarCheck size={11}/> Confirmed ✅
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Declined */}
              {declinedSchedules.length > 0 && (
                <div className="glass-card" style={{ borderLeft:'4px solid var(--danger)', opacity:0.75 }}>
                  <h3 style={{ fontWeight:700, fontSize:'0.95rem', marginBottom:'16px', display:'flex', alignItems:'center', gap:'8px', color:'var(--danger)' }}>
                    <CalendarX size={16}/> Declined ({declinedSchedules.length})
                  </h3>
                  <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                    {declinedSchedules.map(s => (
                      <div key={s.id} className="emp-sched-row emp-sched-declined">
                        <div className="avatar avatar-sm" style={{ background:'linear-gradient(135deg,#ff6584,#c0392b)', flexShrink:0 }}>
                          {s.workerName?.[0]?.toUpperCase()}
                        </div>
                        <div style={{ flex:1 }}>
                          <p style={{ fontWeight:700, fontSize:'0.9rem' }}>{s.workerName}</p>
                          <p style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>
                            {s.day} · {s.from} – {s.to}
                          </p>
                        </div>
                        <span className="badge sched-badge-declined" style={{ flexShrink:0 }}>
                          <CalendarX size={11}/> Declined
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Release Job Modal */}
      {showReleaseModal && (
        <ReleaseJobModal
          initialData={editingReleasedJob}
          onClose={() => {
            setShowReleaseModal(false);
            setEditingReleasedJob(null);
          }}
          onRelease={async (jobData) => {
            if (editingReleasedJob) {
              await updateReleasedJob({ ...editingReleasedJob, ...jobData, employerId: currentUser.id, employerName: currentUser.name });
              showToast('Job post updated successfully!');
            } else {
              await releaseJob({ ...jobData, employerId: currentUser.id, employerName: currentUser.name });
              showToast('Job released successfully! Workers can now find and apply for it.');
            }
            setShowReleaseModal(false);
            setEditingReleasedJob(null);
          }}
        />
      )}

      {/* Schedule Modal */}
      {scheduleWorker && (
        <ScheduleModal
          worker={scheduleWorker}
          employer={currentUser}
          onClose={() => setScheduleWorker(null)}
          onScheduled={async (data) => {
            await createSchedule(data);
            setScheduleWorker(null);
            showToast(`📅 Schedule request sent to ${scheduleWorker.name}!`);
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
function ReleaseJobModal({ onClose, onRelease, initialData = null }) {
  const isEditing = Boolean(initialData);
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    typeOfWork: initialData?.typeOfWork || 'home',
    duration: initialData?.duration || '',
    budget: initialData?.budget || '',
    location: initialData?.location || '',
    skills: Array.isArray(initialData?.skills) ? initialData.skills.join(', ') : '' // Comma separated
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
          <h2 style={{ fontSize: '1.25rem' }}>{isEditing ? 'Edit Job Post' : 'Release an Open Job'}</h2>
          <button className="btn-icon" onClick={onClose}><X size={20}/></button>
        </div>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>
          {isEditing
            ? 'Update your posted job details. Workers will see the latest version in their dashboard.'
            : 'Post a job describing what you need. Workers will see it in their dashboard and can apply directly.'}
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
              <p className="badge badge-success" style={{ width:'fit-content', padding:'8px 16px', margin:0 }}>🏠 Home / Personal</p>
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
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
              {isEditing ? 'Save Changes' : 'Post Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── SCHEDULE MODAL ────────────────────────────────────────────────────────────
function ScheduleModal({ worker, employer, onClose, onScheduled }) {
  const slots = worker.availableSlots || [];
  const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  const slotsByDay = DAYS.reduce((acc, d) => {
    const daySlots = slots.filter(s => s.day === d);
    if (daySlots.length) acc[d] = daySlots;
    return acc;
  }, {});

  const [selected, setSelected] = useState(null); // { day, from, to }
  const [note, setNote] = useState('');

  const handleBook = () => {
    if (!selected) return;
    onScheduled({
      workerId: worker.id,
      workerName: worker.name,
      employerId: employer.id,
      employerName: employer.name,
      day: selected.day,
      from: selected.from,
      to: selected.to,
      note,
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content animate-fadeInUp" onClick={e => e.stopPropagation()}
        style={{ maxWidth:'500px', padding:0, background:'transparent', boxShadow:'none' }}>
        <div style={{ background:'#fff', borderRadius:'20px', overflow:'hidden' }}>
          {/* Header */}
          <div style={{ background:'linear-gradient(135deg,var(--primary),#7c3aed)', padding:'20px 24px', color:'#fff' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                <Calendar size={20}/>
                <div>
                  <h2 style={{ fontSize:'1.1rem', fontWeight:800, margin:0 }}>Schedule {worker.name.split(' ')[0]}</h2>
                  <p style={{ fontSize:'0.8rem', opacity:0.85, margin:0 }}>Pick an available time slot</p>
                </div>
              </div>
              <button className="btn-icon" style={{ color:'#fff' }} onClick={onClose}><X size={20}/></button>
            </div>
          </div>

          <div style={{ padding:'24px', display:'flex', flexDirection:'column', gap:'20px' }}>
            {slots.length === 0 ? (
              <div style={{ textAlign:'center', padding:'32px 20px', color:'var(--text-muted)' }}>
                <CalendarX size={40} style={{ opacity:0.2, margin:'0 auto 12px' }}/>
                <p style={{ fontSize:'0.88rem' }}>
                  {worker.name.split(' ')[0]} hasn't added any availability slots yet.<br/>
                  <span style={{ fontSize:'0.78rem' }}>Ask them to add their schedule on their dashboard.</span>
                </p>
              </div>
            ) : (
              <>
                <div>
                  <p style={{ fontSize:'0.8rem', fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'12px' }}>
                    Available Slots
                  </p>
                  <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                    {Object.entries(slotsByDay).map(([day, daySlots]) => (
                      <div key={day}>
                        <p style={{ fontSize:'0.78rem', fontWeight:700, color:'var(--text-secondary)', marginBottom:'6px' }}>{day}</p>
                        <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
                          {daySlots.map(slot => {
                            const isSel = selected?.day === day && selected?.from === slot.from && selected?.to === slot.to;
                            return (
                              <button key={slot.id}
                                onClick={() => setSelected({ day, from: slot.from, to: slot.to })}
                                className={`sched-slot-btn ${isSel ? 'sched-slot-btn-active' : ''}`}
                              >
                                <CalendarClock size={12}/>
                                {slot.from} – {slot.to}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Note for Worker (optional)</label>
                  <textarea className="form-textarea" rows={3}
                    placeholder="Describe what you need help with..."
                    value={note} onChange={e => setNote(e.target.value)}/>
                </div>
              </>
            )}

            <div style={{ display:'flex', gap:'12px' }}>
              <button className="btn btn-secondary" style={{ flex:1 }} onClick={onClose}>Cancel</button>
              <button className="btn btn-primary" style={{ flex:1 }}
                disabled={!selected}
                onClick={handleBook}>
                <CalendarCheck size={15}/> Send Booking Request
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
