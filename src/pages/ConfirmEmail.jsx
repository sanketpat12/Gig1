import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Briefcase, CheckCircle, Loader2 } from 'lucide-react';
import './Auth.css';

export default function ConfirmEmail() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // verifying | success | error

  useEffect(() => {
    // Give the auth state listener time to process the token from the URL
    const timer = setTimeout(() => {
      if (currentUser) {
        setStatus('success');
        // Redirect to appropriate dashboard after short delay
        setTimeout(() => {
          navigate(currentUser.role === 'employer' ? '/employer' : '/worker', { replace: true });
        }, 2000);
      } else {
        setStatus('error');
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [currentUser, navigate]);

  // If user logs in while on this page, redirect immediately
  useEffect(() => {
    if (currentUser && status !== 'success') {
      setStatus('success');
      setTimeout(() => {
        navigate(currentUser.role === 'employer' ? '/employer' : '/worker', { replace: true });
      }, 2000);
    }
  }, [currentUser, status, navigate]);

  return (
    <div className="auth-page">
      <div className="auth-box glass-card animate-fadeInUp" style={{ maxWidth: '460px', textAlign: 'center' }}>
        <div className="auth-logo" style={{ justifyContent: 'center', marginBottom: '8px' }}>
          <div className="logo-icon"><Briefcase size={18}/></div>
          <span className="logo-text">GigNav</span>
        </div>

        {status === 'verifying' && (
          <>
            <div style={{
              width: '72px', height: '72px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #2962ff22, #2962ff11)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '20px auto',
              border: '2px solid #2962ff33',
              animation: 'spin 1.5s linear infinite'
            }}>
              <Loader2 size={32} color="#2962ff" />
            </div>
            <h1 className="auth-title" style={{ fontSize: '1.3rem' }}>Verifying Your Email...</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
              Please wait while we confirm your account.
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={{
              width: '72px', height: '72px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #00c85322, #00c85311)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '20px auto',
              border: '2px solid #00c85333'
            }}>
              <CheckCircle size={36} color="#00c853" />
            </div>
            <h1 className="auth-title" style={{ fontSize: '1.3rem', color: '#00c853' }}>Email Confirmed!</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
              Your account has been verified successfully.<br/>
              Redirecting to your dashboard...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div style={{
              width: '72px', height: '72px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #ff525222, #ff525211)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '20px auto',
              border: '2px solid #ff525233'
            }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#ff5252" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>
              </svg>
            </div>
            <h1 className="auth-title" style={{ fontSize: '1.3rem', color: '#ff5252' }}>Verification Issue</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '20px' }}>
              We couldn't complete the verification. The link may have expired.
            </p>
            <button
              className="btn btn-primary"
              style={{ width: '100%' }}
              onClick={() => navigate('/register')}
            >
              Try Registering Again
            </button>
          </>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
