import { Link } from 'react-router-dom';
import { Briefcase, Star, MapPin, Shield, ArrowRight, Users, CheckCircle, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Landing.css';

const FEATURES = [
  { icon: <MapPin size={22}/>, title: 'Location-Based Matching', desc: 'Find skilled workers right in your neighbourhood — no travel hassle.' },
  { icon: <Shield size={22}/>, title: 'Verified Profiles', desc: 'Every worker profile displays real reviews and verified skills.' },
  { icon: <Star size={22}/>, title: 'Rating & Reviews', desc: 'Rate workers after every job. Transparent community trust system.' },
  { icon: <Zap size={22}/>, title: 'Instant Hiring', desc: 'Browse, contact and hire workers in minutes, not days.' },
];

const STATS = [
  { val: '5,000+', label: 'Skilled Workers' },
  { val: '12,000+', label: 'Jobs Completed' },
  { val: '200+', label: 'Cities Covered' },
  { val: '4.8★', label: 'Avg. Rating' },
];

export default function Landing() {
  const { currentUser, getWorkers } = useAuth();
  const featuredWorkers = getWorkers({ availability: 'available' }).slice(0, 3);

  return (
    <main className="landing">
      {/* Hero */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge animate-fadeInUp">
            <Briefcase size={14}/> India's Gig Worker Platform
          </div>
          <h1 className="hero-title animate-fadeInUp delay-1">
            Find Trusted Workers<br/>
            <span className="gradient-text">In Your Locality</span>
          </h1>
          <p className="hero-sub animate-fadeInUp delay-2">
            Connect with verified local workers for home services, office tasks, and more.
            Post jobs, hire instantly, and leave reviews — all in one place.
          </p>
          <div className="hero-btns animate-fadeInUp delay-3">
            {currentUser ? (
              <Link
                to={currentUser.role === 'employer' ? '/employer' : '/worker'}
                className="btn btn-primary btn-lg"
                id="hero-dashboard-btn"
              >
                Go to Dashboard <ArrowRight size={18}/>
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary btn-lg" id="hero-signup-btn">
                  Get Started Free <ArrowRight size={18}/>
                </Link>
                <Link to="/login" className="btn btn-secondary btn-lg" id="hero-login-btn">
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Hero visual */}
        <div className="hero-visual animate-float">
          <div className="hero-card glass-card">
            <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'16px' }}>
              <div className="avatar avatar-md" style={{ background:'linear-gradient(135deg,#43e97b,#38f9d7)', fontSize:'1rem' }}>RK</div>
              <div>
                <p style={{ fontWeight:700, fontSize:'0.95rem' }}>Rajesh Kumar</p>
                <p style={{ fontSize:'0.75rem', color:'var(--text-secondary)' }}>Plumber · Andheri West</p>
              </div>
              <div style={{ marginLeft:'auto', display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'4px' }}>
                <span className="badge badge-success" style={{ fontSize:'0.65rem' }}>● Available</span>
                <span style={{ color:'#43e97b', fontWeight:700, fontSize:'0.85rem' }}>₹350/hr</span>
              </div>
            </div>
            <div style={{ display:'flex', gap:'6px', marginBottom:'12px', flexWrap:'wrap' }}>
              {['Plumbing','Electrical','Carpentry'].map(s => <span key={s} className="tag" style={{ fontSize:'0.72rem' }}>{s}</span>)}
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
              {[1,2,3,4,5].map(s => <span key={s} style={{ color:'#ffd200', fontSize:'1rem' }}>★</span>)}
              <span style={{ fontSize:'0.8rem', color:'var(--text-secondary)' }}>5.0 (2 reviews)</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-section">
        <div className="stats-grid">
          {STATS.map((s, i) => (
            <div key={i} className={`stat-item glass-card animate-fadeInUp delay-${i+1}`}>
              <span className="stat-val">{s.val}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="section">
        <div className="section-inner">
          <div className="section-header">
            <h2 className="section-title">How GigNav Works</h2>
            <p className="section-sub">Three simple steps to get work done</p>
          </div>
          <div className="steps-grid">
            {[
              { n:'01', title:'Sign Up as Employer or Worker', desc:'Choose your role and create a profile in under 2 minutes.' },
              { n:'02', title:'Employers Post Jobs, Workers Apply', desc:'Employers filter workers by location, skill & job type. Workers get discovered.' },
              { n:'03', title:'Hire, Work & Review', desc:'Hire the right person, get the job done, then leave an honest review.' },
            ].map((step, i) => (
              <div key={i} className={`step-card glass-card animate-fadeInUp delay-${i+1}`}>
                <div className="step-num">{step.n}</div>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-desc">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section">
        <div className="section-inner">
          <div className="section-header">
            <h2 className="section-title">Why Choose GigNav</h2>
            <p className="section-sub">Built for trust, speed, and simplicity</p>
          </div>
          <div className="features-grid">
            {FEATURES.map((f, i) => (
              <div key={i} className={`feature-card glass-card animate-fadeInUp delay-${i+1}`}>
                <div className="feature-icon">{f.icon}</div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Workers */}
      {featuredWorkers.length > 0 && (
        <section className="section">
          <div className="section-inner">
            <div className="section-header">
              <h2 className="section-title">Featured Workers</h2>
              <Link to={currentUser ? '/employer' : '/register'} className="btn btn-secondary btn-sm">
                View All <ArrowRight size={14}/>
              </Link>
            </div>
            <div className="featured-grid">
              {featuredWorkers.map(w => (
                <div key={w.id} className="mini-worker-card glass-card">
                  <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                    <div className="avatar avatar-md" style={{ background:'linear-gradient(135deg,#43e97b,#38f9d7)', fontSize:'0.9rem' }}>
                      {w.name?.split(' ').map(n => n[0]).join('').slice(0,2)}
                    </div>
                    <div>
                      <p style={{ fontWeight:700, fontSize:'0.9rem' }}>{w.name}</p>
                      <p style={{ fontSize:'0.75rem', color:'var(--text-secondary)' }}><MapPin size={11} style={{ display:'inline' }}/> {w.locality}, {w.city}</p>
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:'6px', marginTop:'10px', flexWrap:'wrap' }}>
                    {w.skills?.slice(0,3).map(s => <span key={s} className="tag" style={{ fontSize:'0.72rem' }}>{s}</span>)}
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'12px' }}>
                    <span style={{ color:'#43e97b', fontWeight:700, fontSize:'0.88rem' }}>₹{w.hourlyRate}/hr</span>
                    <Link to={`/worker/${w.id}`} className="btn btn-secondary btn-sm" style={{ padding:'6px 12px', fontSize:'0.78rem' }}>
                      View Profile
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      {!currentUser && (
        <section className="cta-section">
          <div className="cta-inner glass-card">
            <h2 className="cta-title">Ready to Get Started?</h2>
            <p className="cta-sub">Join thousands of employers and workers on GigNav today.</p>
            <div style={{ display:'flex', gap:'12px', justifyContent:'center', flexWrap:'wrap' }}>
              <Link to="/register" className="btn btn-primary btn-lg" id="cta-employer-btn">
                <Users size={18}/> Hire a Worker
              </Link>
              <Link to="/register" className="btn btn-success btn-lg" id="cta-worker-btn">
                <CheckCircle size={18}/> Find Work
              </Link>
            </div>
          </div>
        </section>
      )}

      <footer className="footer">
        <div className="footer-inner">
          <div className="logo-text" style={{ fontSize:'1.1rem' }}>GigNav</div>
          <p style={{ fontSize:'0.8rem', color:'var(--text-muted)' }}>© 2025 GigNav · Connecting workers and employers across India</p>
        </div>
      </footer>
    </main>
  );
}
