import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import StarRating from '../components/StarRating';
import ReviewModal from '../components/ReviewModal';
import { MapPin, Phone, Briefcase, Clock, ArrowLeft, Star, MessageCircle, CheckCircle } from 'lucide-react';
import './WorkerProfile.css';

export default function WorkerProfile() {
  const { id } = useParams();
  const { getWorkerById, getReviewsForWorker, getAvgRating, currentUser, jobs, postJob } = useAuth();
  const navigate = useNavigate();
  const [showReview, setShowReview] = useState(false);
  const [toast, setToast] = useState(null);

  const worker = getWorkerById(id);
  const hasHired = jobs?.some(j => j.employerId === currentUser?.id && j.workerId === worker?.id);
  const dummyPortfolio = [
    'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500&q=80',
    'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=500&q=80',
    'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=500&q=80'
  ];
  const portfolio = worker?.portfolio || dummyPortfolio;
  const reviews = getReviewsForWorker(id);
  const avg = getAvgRating(id);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  if (!worker) {
    return (
      <div style={{ maxWidth:'600px', margin:'80px auto', padding:'0 24px', textAlign:'center' }}>
        <h2 style={{ fontSize:'1.5rem', fontWeight:800, marginBottom:'12px' }}>Worker Not Found</h2>
        <p style={{ color:'var(--text-secondary)', marginBottom:'24px' }}>This worker profile doesn't exist.</p>
        <Link to="/" className="btn btn-primary">← Back to Home</Link>
      </div>
    );
  }

  const initials = worker.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2);
  const ratingBuckets = [5,4,3,2,1].map(n => ({
    stars: n,
    count: reviews.filter(r => r.rating === n).length,
    pct: reviews.length ? Math.round(reviews.filter(r => r.rating === n).length / reviews.length * 100) : 0,
  }));

  return (
    <div className="wp-page">
      {/* Back button */}
      <button className="btn btn-secondary btn-sm wp-back" onClick={() => navigate(-1)}>
        <ArrowLeft size={15}/> Back
      </button>

      <div className="wp-layout">
        {/* LEFT COLUMN */}
        <div className="wp-sidebar">
          {/* Identity Card */}
          <div className="glass-card wp-identity">
            <div className="wp-avatar-wrap">
              <div className="avatar avatar-xl wp-avatar" style={{ background:'linear-gradient(135deg,#43e97b,#38f9d7)', fontSize:'2.2rem' }}>
                {initials}
              </div>
              <div className={`avail-badge ${worker.availability === 'available' ? 'avail-yes' : 'avail-no'}`}>
                {worker.availability === 'available' ? '● Available' : '● Busy'}
              </div>
            </div>

            <h1 className="wp-name">{worker.name}</h1>
            <p className="wp-location"><MapPin size={14}/> {worker.locality}, {worker.city}</p>

            {/* Rating summary */}
            <div className="wp-rating-summary">
              <div className="big-rating">{avg > 0 ? avg : '—'}</div>
              <StarRating value={Math.round(avg)} readonly size={20}/>
              <p style={{ fontSize:'0.8rem', color:'var(--text-muted)', marginTop:'4px' }}>{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
            </div>

            <div className="wp-rate">₹{worker.hourlyRate || '—'}/hr</div>

            {/* Job types */}
            <div style={{ display:'flex', gap:'8px', flexWrap:'wrap', justifyContent:'center' }}>
              {worker.jobType?.includes('home') && <span className="badge badge-success">🏠 Home</span>}
              {worker.jobType?.includes('business') && <span className="badge badge-primary">🏢 Business</span>}
            </div>

            {/* Action Buttons */}
            {currentUser?.role === 'employer' && (
              <div style={{ display:'flex', flexDirection:'column', gap:'10px', width:'100%', marginTop:'8px' }}>
                {worker.availability !== 'available' ? (
                  <div style={{
                    display:'flex',
                    alignItems:'center',
                    justifyContent:'center',
                    gap:'8px',
                    padding:'14px',
                    borderRadius:'12px',
                    background:'rgba(239,68,68,0.08)',
                    border:'1px solid rgba(239,68,68,0.25)',
                    color:'#ef4444',
                    fontWeight:700,
                    fontSize:'0.88rem',
                    textAlign:'center',
                  }}>
                    🔴 Currently Busy
                    <span style={{ fontWeight:400, color:'#b91c1c', fontSize:'0.8rem', display:'block', marginTop:'4px' }}>
                      This worker is not accepting new jobs right now.
                    </span>
                  </div>
                ) : (
                  <button
                    id="hire-worker-btn"
                    className="btn btn-primary"
                    onClick={async () => {
                      await postJob({ employerId: currentUser.id, workerId: worker.id, workerName: worker.name, employerName: currentUser.name });
                      showToast(`Hire request sent to ${worker.name}!`);
                    }}
                  >
                    <CheckCircle size={16}/> Hire {worker.name.split(' ')[0]}
                  </button>
                )}
                {hasHired && (
                  <button
                    id="write-review-btn"
                    className="btn btn-warning"
                    onClick={() => setShowReview(true)}
                  >
                    <Star size={16}/> Write a Review
                  </button>
                )}
              </div>
            )}
            {!currentUser && (
              <div style={{ width:'100%', marginTop:'8px' }}>
                <Link to="/login" className="btn btn-primary" style={{ width:'100%', display:'flex', justifyContent:'center' }}>
                  Login to Hire
                </Link>
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="glass-card wp-quick-stats">
            <div className="qstat">
              <Briefcase size={16} style={{ color:'var(--primary)' }}/>
              <div>
                <p className="qstat-val">{worker.jobsDone || 0}</p>
                <p className="qstat-label">Jobs Done</p>
              </div>
            </div>
            <div className="qstat">
              <Clock size={16} style={{ color:'#43e97b' }}/>
              <div>
                <p className="qstat-val">{worker.experience || 'N/A'}</p>
                <p className="qstat-label">Experience</p>
              </div>
            </div>
            <div className="qstat">
              <MessageCircle size={16} style={{ color:'#ffd200' }}/>
              <div>
                <p className="qstat-val">{reviews.length}</p>
                <p className="qstat-label">Reviews</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="wp-main">
          {/* Bio */}
          {worker.bio && (
            <div className="glass-card wp-section">
              <h2 className="wp-section-title">About</h2>
              <p style={{ color:'var(--text-secondary)', lineHeight:'1.75', fontSize:'0.92rem' }}>{worker.bio}</p>
            </div>
          )}

          {/* Skills */}
          <div className="glass-card wp-section">
            <h2 className="wp-section-title">Skills & Expertise</h2>
            <div style={{ display:'flex', flexWrap:'wrap', gap:'10px' }}>
              {worker.skills?.length > 0
                ? worker.skills.map(s => <span key={s} className="tag" style={{ padding:'7px 14px', fontSize:'0.83rem' }}>{s}</span>)
                : <p style={{ color:'var(--text-muted)', fontSize:'0.85rem' }}>No skills listed.</p>}
            </div>
          </div>

          {/* Portfolio */}
          {portfolio?.length > 0 && (
            <div className="glass-card wp-section">
              <h2 className="wp-section-title">Work Portfolio</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '12px' }}>
                {portfolio.map((img, i) => (
                  <img key={i} src={img} alt={`Work ${i+1}`} style={{ width: '100%', height: '110px', objectFit: 'cover', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }} />
                ))}
              </div>
            </div>
          )}

          {/* Rating breakdown */}
          {reviews.length > 0 && (
            <div className="glass-card wp-section">
              <h2 className="wp-section-title">Rating Breakdown</h2>
              <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                {ratingBuckets.map(b => (
                  <div key={b.stars} style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                    <span style={{ fontSize:'0.8rem', color:'var(--text-secondary)', minWidth:'50px' }}>{b.stars} star{b.stars>1?'s':''}</span>
                    <div style={{ flex:1, height:'8px', background:'var(--border)', borderRadius:'4px', overflow:'hidden' }}>
                      <div style={{ height:'100%', width:`${b.pct}%`, background:'linear-gradient(90deg,#ffd200,#f7971e)', borderRadius:'4px', transition:'width 0.5s ease' }}/>
                    </div>
                    <span style={{ fontSize:'0.78rem', color:'var(--text-muted)', minWidth:'30px', textAlign:'right' }}>{b.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          <div className="glass-card wp-section">
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'18px' }}>
              <h2 className="wp-section-title" style={{ marginBottom:0 }}>
                Reviews <span style={{ color:'var(--text-muted)', fontWeight:400 }}>({reviews.length})</span>
              </h2>
              {currentUser?.role === 'employer' && hasHired && (
                <button id="review-btn-top" className="btn btn-secondary btn-sm" onClick={() => setShowReview(true)}>
                  <Star size={13}/> Add Review
                </button>
              )}
            </div>

            {reviews.length === 0 ? (
              <div style={{ textAlign:'center', padding:'40px', color:'var(--text-muted)', fontSize:'0.85rem' }}>
                <Star size={36} style={{ margin:'0 auto 12px', opacity:0.3 }}/>
                <p>No reviews yet. Be the first to review!</p>
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
                {reviews.map(r => (
                  <div key={r.id} className="review-item">
                    <div className="review-header">
                      <div className="avatar avatar-sm" style={{ background:'linear-gradient(135deg,var(--primary),var(--primary-dark))', fontSize:'0.75rem', flexShrink:0 }}>
                        {r.employerName?.[0]?.toUpperCase()}
                      </div>
                      <div style={{ flex:1 }}>
                        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'6px' }}>
                          <p style={{ fontWeight:600, fontSize:'0.9rem' }}>{r.employerName}</p>
                          <p style={{ fontSize:'0.72rem', color:'var(--text-muted)' }}>{r.date}</p>
                        </div>
                        <StarRating value={r.rating} readonly size={14}/>
                      </div>
                    </div>
                    <p style={{ fontSize:'0.87rem', color:'var(--text-secondary)', lineHeight:'1.6', marginTop:'10px' }}>{r.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {showReview && (
        <ReviewModal
          worker={worker}
          onClose={() => setShowReview(false)}
          onSuccess={() => showToast('Review submitted successfully!')}
        />
      )}

      {/* Toast */}
      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
    </div>
  );
}
