import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Star, Briefcase, Clock, ChevronRight, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import StarRating from './StarRating';
import './WorkerCard.css';

export default function WorkerCard({ worker, onHire, onSchedule, onReview, showActions = false }) {
  const { getAvgRating, getReviewsForWorker, jobs, currentUser } = useAuth();
  const navigate = useNavigate();
  const avg = getAvgRating(worker.id);
  const reviewCount = getReviewsForWorker(worker.id).length;

  const hasHired = jobs?.some(j => j.employerId === currentUser?.id && j.workerId === worker.id);

  const handleCardClick = (e) => {
    if (e.target.closest('button') || e.target.closest('a')) return;
    navigate(`/worker/${worker.id}`);
  };

  const initials = worker.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const avatarGrad = worker.role === 'worker'
    ? 'linear-gradient(135deg, #12b886, #38f9d7)'
    : 'linear-gradient(135deg, var(--primary), var(--primary-dark))';

  return (
    <div className="worker-card glass-card animate-fadeInUp" onClick={handleCardClick} style={{ cursor: 'pointer' }}>
      {/* Header */}
      <div className="wc-header">
        <div className="avatar avatar-lg" style={{ background: avatarGrad }}>
          {initials}
        </div>
        <div className="wc-info">
          <h3 className="wc-name">{worker.name}</h3>
          <div className="wc-location">
            <MapPin size={13} /> {worker.locality}, {worker.city}
          </div>
          <div className="wc-rating">
            <StarRating value={Math.round(avg)} readonly size={14} />
            <span className="rating-num">{avg > 0 ? avg : 'No rating'}</span>
            <span className="rating-count">({reviewCount} review{reviewCount !== 1 ? 's' : ''})</span>
          </div>
        </div>
        <div className={`avail-dot ${worker.availability === 'available' ? 'avail-yes' : 'avail-no'}`}
          title={worker.availability === 'available' ? 'Available' : 'Busy'} />
      </div>

      {/* Bio */}
      {worker.bio && <p className="wc-bio">{worker.bio}</p>}

      {/* Skills */}
      <div className="wc-skills">
        {worker.skills?.slice(0, 4).map(skill => (
          <span key={skill} className="tag">{skill}</span>
        ))}
        {worker.skills?.length > 4 && <span className="tag">+{worker.skills.length - 4}</span>}
      </div>

      {/* Stats */}
      <div className="wc-stats">
        <div className="wc-stat">
          <Briefcase size={13} />
          <span>{worker.jobsDone || 0} jobs done</span>
        </div>
        <div className="wc-stat">
          <Clock size={13} />
          <span>{worker.experience || 'N/A'} exp.</span>
        </div>
        <div className="wc-stat">
          <span className="rate">₹{worker.hourlyRate || '—'}/hr</span>
        </div>
      </div>

      {/* Job Types */}
      <div className="wc-jobtypes">
        {worker.jobType?.includes('home') && <span className="badge badge-success">🏠 Home</span>}
      </div>

      {/* Work Photos (Portfolio) */}
      {worker.portfolio && worker.portfolio.length > 0 && (
        <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
          <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>Recent Work</p>
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
            {worker.portfolio.map((imgUrl, idx) => (
              <img 
                key={idx} 
                src={imgUrl} 
                alt="Work sample" 
                style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0, border: '1px solid var(--border)' }} 
              />
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="wc-actions">
        <Link to={`/worker/${worker.id}`} className="btn btn-secondary btn-sm" id={`view-profile-${worker.id}`}>
          View Profile <ChevronRight size={14} />
        </Link>
        {showActions && (
          <>
            {worker.availability !== 'available' ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 14px',
                  borderRadius: '8px',
                  background: 'rgba(239,68,68,0.08)',
                  border: '1px solid rgba(239,68,68,0.2)',
                  color: '#ef4444',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  flex: 1,
                  justifyContent: 'center',
                }}
              >
                🔴 Currently Busy — Not accepting work
              </div>
            ) : (
              <>
                {onSchedule && (
                  <button id={`sched-btn-${worker.id}`} className="btn btn-sm sched-worker-btn" onClick={() => onSchedule(worker)}>
                    <Calendar size={13} /> Schedule
                  </button>
                )}
                {onHire && (
                  <button id={`hire-btn-${worker.id}`} className="btn btn-primary btn-sm" onClick={() => onHire(worker)}>
                    Hire Now
                  </button>
                )}
              </>
            )}
            {onReview && hasHired && worker.availability === 'available' && (
              <button id={`review-btn-${worker.id}`} className="btn btn-warning btn-sm" onClick={() => onReview(worker)}>
                <Star size={13} /> Review
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
