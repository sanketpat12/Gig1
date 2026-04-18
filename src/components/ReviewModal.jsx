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
      <div className="modal-content animate-fadeInUp" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px', padding: 0, background: 'transparent', boxShadow: 'none' }}>
        <div style={{ background: '#fff', borderRadius: '20px', overflow: 'hidden' }}>
          {/* Header */}
          <div style={{ background: 'linear-gradient(135deg, var(--primary), #7c3aed)', padding: '24px 32px', color: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Star size={24} fill="#fff" stroke="#fff" />
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#fff' }}>Write a Review</h2>
                  <p style={{ fontSize: '0.85rem', opacity: 0.9, margin: 0, color: '#fff' }}>
                    Share your experience with <strong>{worker.name.split(' ')[0]}</strong>
                  </p>
                </div>
              </div>
              <button id="close-review-modal" onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', opacity: 0.8, cursor: 'pointer', padding: '4px' }}>
                <X size={20} />
              </button>
            </div>
          </div>

          <div style={{ padding: '32px' }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
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

              <div style={{ display:'flex', gap:'12px', justifyContent:'flex-end', marginTop: '8px' }}>
                <button type="button" id="cancel-review" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                <button type="submit" id="submit-review" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
