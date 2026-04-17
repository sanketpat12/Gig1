import { useState } from 'react';
import { X, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import StarRating from './StarRating';

export default function ReviewModal({ worker, onClose, onSuccess }) {
  const { currentUser, addReview, getReviewsForWorker } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!rating) { setError('Please select a star rating.'); return; }
    if (!comment.trim()) { setError('Please write a comment.'); return; }
    setSubmitting(true);
    setTimeout(() => {
      addReview({
        workerId: worker.id,
        employerId: currentUser.id,
        employerName: currentUser.name,
        rating,
        comment: comment.trim(),
      }).then(() => {
        setSubmitting(false);
        onSuccess?.();
        onClose();
      });
    }, 600);
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box animate-fadeInUp">
        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'20px' }}>
          <div>
            <h2 style={{ fontSize:'1.2rem', fontWeight:700, color: 'var(--text-primary)' }}>Write a Review</h2>
            <p style={{ fontSize:'0.83rem', color:'var(--text-secondary)', marginTop:'2px' }}>
              for <strong style={{ color:'var(--primary)' }}>{worker.name}</strong>
            </p>
          </div>
          <button id="close-review-modal" onClick={onClose} style={{ background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer', padding:'4px' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'18px' }}>
          {/* Star picker */}
            <div>
              <label className="form-label" style={{ marginBottom:'10px', display:'block', color: 'var(--text-primary)' }}>Your Rating</label>
              <StarRating value={rating} onChange={setRating} size={32} />
              {rating > 0 && (
                <p style={{ fontSize:'0.8rem', color:'var(--text-muted)', marginTop:'6px' }}>
                  {['','Poor','Fair','Good','Very Good','Excellent'][rating]}
                </p>
              )}
            </div>

            {/* Comment */}
            <div className="form-group">
              <label className="form-label">Your Review</label>
              <textarea
                id="review-comment"
                className="form-textarea"
                placeholder="Share your experience working with this person..."
                value={comment}
                onChange={e => { setComment(e.target.value); setError(''); }}
                rows={4}
              />
            </div>

            {error && (
              <p style={{ color:'#ff6584', fontSize:'0.83rem', background:'rgba(255,101,132,0.1)', padding:'10px 14px', borderRadius:'8px', border:'1px solid rgba(255,101,132,0.2)' }}>
                {error}
              </p>
            )}

            <div style={{ display:'flex', gap:'10px', justifyContent:'flex-end' }}>
              <button type="button" id="cancel-review" className="btn btn-secondary btn-sm" onClick={onClose}>Cancel</button>
              <button type="submit" id="submit-review" className="btn btn-primary btn-sm" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
        </form>
      </div>
    </div>
  );
}
