import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Briefcase, HardHat, LogIn, Eye, EyeOff } from 'lucide-react';
import './Auth.css';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState('employer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    setTimeout(() => {
      login(email, password, role).then(result => {
        setLoading(false);
        if (!result.success) { setError(result.message); return; }
        navigate(role === 'employer' ? '/employer' : '/worker');
      });
    }, 600);
  };

  return (
    <div className="auth-page">
      <div className="auth-box glass-card animate-fadeInUp">
        <div className="auth-logo">
          <div className="logo-icon"><Briefcase size={18}/></div>
          <span className="logo-text">GigNav</span>
        </div>

        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-sub">Sign in to your account</p>

        {/* Role Toggle */}
        <div className="role-toggle">
          <button
            id="role-employer"
            type="button"
            className={`role-btn ${role === 'employer' ? 'active' : ''}`}
            onClick={() => { setRole('employer'); setError(''); }}
          >
            <Briefcase size={16}/> Employer
          </button>
          <button
            id="role-worker"
            type="button"
            className={`role-btn ${role === 'worker' ? 'active' : ''}`}
            onClick={() => { setRole('worker'); setError(''); }}
          >
            <HardHat size={16}/> Worker
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              id="login-email"
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={email}
              onChange={e => { setEmail(e.target.value); setError(''); }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-icon-wrap">
              <input
                id="login-password"
                type={showPass ? 'text' : 'password'}
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
              />
              <button type="button" className="input-icon-btn" onClick={() => setShowPass(!showPass)}>
                {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
              </button>
            </div>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button type="submit" id="login-submit" className="btn btn-primary" style={{ width:'100%' }} disabled={loading}>
            {loading ? 'Signing in...' : <><LogIn size={16}/> Sign In as {role.charAt(0).toUpperCase()+role.slice(1)}</>}
          </button>
        </form>

        <div className="divider">or</div>

        {/* Demo Credentials */}
        <div className="demo-creds">
          <p className="demo-title">Try Demo Accounts</p>
          <div className="demo-grid">
            <button className="demo-btn" onClick={() => { setRole('employer'); setEmail('employer@demo.com'); setPassword('demo123'); }}>
              <Briefcase size={13}/> Employer Demo
            </button>
            <button className="demo-btn" onClick={() => { setRole('worker'); setEmail('rajesh@example.com'); setPassword('pass123'); }}>
              <HardHat size={13}/> Worker Demo
            </button>
          </div>
        </div>

        <p className="auth-switch">
          Don't have an account? <Link to="/register">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}
