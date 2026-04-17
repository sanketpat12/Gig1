import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Briefcase, HardHat, Plus, X, CheckCircle,
  ChevronRight, ChevronLeft, Eye, EyeOff,
  MapPin, DollarSign, User, Zap, ArrowRight
} from 'lucide-react';
import './Auth.css';

const SKILL_SUGGESTIONS = [
  'Plumbing','Electrical','Carpentry','Painting','Cleaning','Cooking',
  'Driving','Gardening','Security','Data Entry','Delivery','Masonry',
  'Tiling','AC Repair','Babysitting','Elder Care','Welding','Tailoring',
  'Photography','IT Support','Landscaping','Moving Help','Personal Training',
];

const CITIES = [
  'Mumbai','Delhi','Bangalore','Pune','Hyderabad','Chennai',
  'Kolkata','Ahmedabad','Jaipur','Lucknow','Surat','Chandigarh',
];

const LANGUAGES = ['Hindi','English','Marathi','Tamil','Telugu','Kannada','Bengali','Gujarati','Punjabi','Malayalam'];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  // Phase 0 = role selection splash, phase 1+ = form steps
  const [phase, setPhase] = useState(0);
  const [role, setRole] = useState('');
  const [step, setStep] = useState(1);

  // Common fields
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [phone, setPhone]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  // Employer-specific
  const [company, setCompany]   = useState('');

  // Worker-specific — step 2
  const [city, setCity]           = useState('');
  const [locality, setLocality]   = useState('');
  const [experience, setExperience] = useState('');
  const [jobType, setJobType]     = useState([]);

  // Worker-specific — step 3
  const [bio, setBio]             = useState('');
  const [skills, setSkills]       = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [languages, setLanguages] = useState([]);
  const [idType, setIdType]       = useState('');

  const addSkill = (s = skillInput.trim()) => {
    if (s && !skills.includes(s) && skills.length < 10) {
      setSkills(prev => [...prev, s]);
      setSkillInput('');
    }
  };
  const removeSkill = (s) => setSkills(prev => prev.filter(k => k !== s));
  const toggleJobType = (t) => setJobType(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  const toggleLanguage = (l) => setLanguages(prev => prev.includes(l) ? prev.filter(x => x !== l) : [...prev, l]);

  const validateStep1 = () => {
    if (!name.trim())                         { setError('Full name is required.'); return false; }
    if (!email.trim() || !email.includes('@')){ setError('Valid email is required.'); return false; }
    if (!phone.trim() || phone.length < 10)   { setError('Valid 10-digit phone is required.'); return false; }
    if (!password || password.length < 6)     { setError('Password must be at least 6 characters.'); return false; }
    return true;
  };

  const validateStep2Worker = () => {
    if (!city.trim())       { setError('City is required.'); return false; }
    if (!locality.trim())   { setError('Locality / area is required.'); return false; }
    if (jobType.length === 0) { setError('Select at least one work type.'); return false; }
    return true;
  };

  const validateStep3Worker = () => {
    if (skills.length === 0) { setError('Add at least one skill.'); return false; }
    return true;
  };

  const totalSteps = role === 'worker' ? 3 : 1;

  const handleNext = () => {
    setError('');
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && role === 'worker' && !validateStep2Worker()) return;
    setStep(s => s + 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (role === 'worker' && !validateStep3Worker()) return;
    setLoading(true);

    const data = role === 'employer'
      ? { role: 'employer', name, email, phone, password, company }
      : {
          role: 'worker', name, email, phone, password,
          city, locality, bio, skills,
          hourlyRate: hourlyRate ? Number(hourlyRate) : 0,
          experience, jobType,
          availability: 'available',
          languages,
          idVerified: !!idType,
        };

    setTimeout(() => {
      register(data).then(result => {
        setLoading(false);
        if (!result.success) { setError(result.message); return; }
        navigate(role === 'employer' ? '/employer' : '/worker');
      });
    }, 600);
  };

  // ── PHASE 0: Role selection splash ──────────────────────────────────────────
  if (phase === 0) {
    return (
      <div className="auth-page role-select-page">
        <div className="role-select-container animate-fadeInUp">
          <div className="auth-logo" style={{ justifyContent:'center', marginBottom:'8px' }}>
            <div className="logo-icon"><Briefcase size={18}/></div>
            <span className="logo-text">GigNav</span>
          </div>
          <h1 className="role-select-title">Join GigNav</h1>
          <p className="role-select-sub">I want to join as a…</p>

          <div className="role-select-cards">
            {/* Employer card */}
            <button
              id="splash-employer"
              className="role-select-card"
              onClick={() => { setRole('employer'); setPhase(1); setStep(1); }}
            >
              <div className="rsc-icon rsc-icon-employer">
                <Briefcase size={36}/>
              </div>
              <h2 className="rsc-title">Employer</h2>
              <p className="rsc-desc">
                I'm looking to hire skilled workers for home services, business tasks, or projects.
              </p>
              <ul className="rsc-points">
                <li>✅ Post job requirements</li>
                <li>✅ Browse verified workers</li>
                <li>✅ Leave reviews</li>
              </ul>
              <span className="rsc-cta">Get Started <ArrowRight size={15}/></span>
            </button>

            {/* Worker card */}
            <button
              id="splash-worker"
              className="role-select-card rsc-worker"
              onClick={() => { setRole('worker'); setPhase(1); setStep(1); }}
            >
              <div className="rsc-icon rsc-icon-worker">
                <HardHat size={36}/>
              </div>
              <h2 className="rsc-title">Worker</h2>
              <p className="rsc-desc">
                I offer my skills and services to employers — get hired, earn money, build reputation.
              </p>
              <ul className="rsc-points">
                <li>✅ Create skill profile</li>
                <li>✅ Get hired by employers</li>
                <li>✅ Track earnings & reviews</li>
              </ul>
              <span className="rsc-cta rsc-cta-worker">Get Started <ArrowRight size={15}/></span>
            </button>
          </div>

          <p className="auth-switch" style={{ textAlign:'center', marginTop:'8px' }}>
            Already have an account? <Link to="/login">Sign In</Link>
          </p>
        </div>
      </div>
    );
  }

  // ── PHASE 1+: Registration form ──────────────────────────────────────────────
  return (
    <div className="auth-page">
      <div className="auth-box glass-card animate-fadeInUp" style={{ maxWidth: role === 'worker' ? '520px' : '460px' }}>
        <div className="auth-logo">
          <div className="logo-icon"><Briefcase size={18}/></div>
          <span className="logo-text">GigNav</span>
        </div>

        <div>
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-sub">
            Join GigNav as {role === 'employer' ? 'an employer' : 'a worker'}
            {' '}·{' '}
            <button
              type="button"
              style={{ background:'none', border:'none', color:'var(--primary)', fontWeight:600, cursor:'pointer', fontSize:'0.83rem' }}
              onClick={() => { setPhase(0); setStep(1); setError(''); }}
            >
              Change
            </button>
          </p>
        </div>

        {/* Progress steps */}
        {role === 'worker' && (
          <div className="reg-steps">
            {[
              { n:1, label:'Account' },
              { n:2, label:'Location' },
              { n:3, label:'Skills' },
            ].map((s, i, arr) => (
              <>
                <div key={s.n} className={`reg-step ${step >= s.n ? (step > s.n ? 'done' : 'active') : ''}`}>
                  <div className="step-circle">{step > s.n ? '✓' : s.n}</div>
                  <span>{s.label}</span>
                </div>
                {i < arr.length - 1 && <div className={`step-line ${step > s.n ? 'done' : ''}`}/>}
              </>
            ))}
          </div>
        )}

        <form
          onSubmit={step === totalSteps ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }}
          className="auth-form"
        >
          {/* ── STEP 1: Account basics ── */}
          {step === 1 && (
            <>
              <div className="form-group">
                <label className="form-label"><User size={12} style={{ display:'inline', marginRight:'4px'}}/> Full Name</label>
                <input id="reg-name" type="text" className="form-input" placeholder="Rahul Sharma"
                  value={name} onChange={e => { setName(e.target.value); setError(''); }} />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input id="reg-email" type="email" className="form-input" placeholder="you@email.com"
                    value={email} onChange={e => { setEmail(e.target.value); setError(''); }} />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input id="reg-phone" type="tel" className="form-input" placeholder="9876543210"
                    value={phone} onChange={e => { setPhone(e.target.value); setError(''); }} />
                </div>
              </div>
              {role === 'employer' && (
                <div className="form-group">
                  <label className="form-label">Company / Organisation (optional)</label>
                  <input id="reg-company" type="text" className="form-input" placeholder="Acme Corp"
                    value={company} onChange={e => setCompany(e.target.value)} />
                </div>
              )}
              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="input-icon-wrap">
                  <input id="reg-password" type={showPass ? 'text' : 'password'} className="form-input"
                    placeholder="Min. 6 characters"
                    value={password} onChange={e => { setPassword(e.target.value); setError(''); }} />
                  <button type="button" className="input-icon-btn" onClick={() => setShowPass(!showPass)}>
                    {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ── STEP 2: Worker location & work type ── */}
          {step === 2 && role === 'worker' && (
            <>
              <div className="form-group">
                <label className="form-label" style={{ fontSize:'0.95rem', fontWeight:700, color:'var(--text-primary)' }}>
                  📍 Where are you based?
                </label>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">City</label>
                  <select id="reg-city" className="form-select" value={city} onChange={e => { setCity(e.target.value); setError(''); }}>
                    <option value="">Select city</option>
                    {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Locality / Area</label>
                  <input id="reg-locality" type="text" className="form-input" placeholder="e.g. Andheri West"
                    value={locality} onChange={e => { setLocality(e.target.value); setError(''); }} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Years of Experience</label>
                <select id="reg-exp" className="form-select" value={experience} onChange={e => setExperience(e.target.value)}>
                  <option value="">Select experience</option>
                  <option value="Fresher">Fresher (0–1 yr)</option>
                  <option value="1-2 years">1–2 years</option>
                  <option value="3-5 years">3–5 years</option>
                  <option value="5-8 years">5–8 years</option>
                  <option value="8+ years">8+ years</option>
                  <option value="10+ years">10+ years</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">What kind of work do you do?</label>
                <div style={{ display:'flex', gap:'10px' }}>
                  {[['home','🏠 Home / Personal'],['business','🏢 Business']].map(([val,label]) => (
                    <button key={val} id={`jobtype-${val}`} type="button"
                      className={`role-btn ${jobType.includes(val) ? 'active' : ''}`}
                      style={{ flex:1 }}
                      onClick={() => toggleJobType(val)}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Languages you speak</label>
                <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
                  {LANGUAGES.map(l => (
                    <button key={l} type="button"
                      className={`demo-btn ${languages.includes(l) ? 'lang-active' : ''}`}
                      style={{ padding:'5px 12px', fontSize:'0.78rem', background: languages.includes(l) ? 'var(--primary-light)' : '', color: languages.includes(l) ? 'var(--primary-dark)' : '', borderColor: languages.includes(l) ? 'rgba(41,98,255,0.2)' : '' }}
                      onClick={() => toggleLanguage(l)}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ── STEP 3: Worker skills & rate ── */}
          {step === 3 && role === 'worker' && (
            <>
              <div className="form-group">
                <label className="form-label" style={{ fontSize:'0.95rem', fontWeight:700, color:'var(--text-primary)' }}>
                  ⚡ What are your skills?
                </label>
              </div>

              <div className="form-group">
                <label className="form-label">Skills (add up to 10)</label>
                <div className="skills-input-wrap">
                  <input id="reg-skill-input" type="text" className="form-input" placeholder="Type a skill..."
                    value={skillInput}
                    onChange={e => setSkillInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())} />
                  <button type="button" id="add-skill-btn" className="btn btn-secondary btn-sm" onClick={() => addSkill()}>
                    <Plus size={14}/>
                  </button>
                </div>
                <div className="skills-tags" style={{ marginTop:'8px' }}>
                  {SKILL_SUGGESTIONS.filter(s => !skills.includes(s)).slice(0, 10).map(s => (
                    <button key={s} type="button" className="demo-btn" style={{ padding:'4px 10px', fontSize:'0.75rem' }} onClick={() => addSkill(s)}>{s}</button>
                  ))}
                </div>
                {skills.length > 0 && (
                  <div className="skills-tags" style={{ marginTop:'8px' }}>
                    {skills.map(s => (
                      <button key={s} type="button" className="skill-tag-remove" onClick={() => removeSkill(s)}>
                        {s} <X size={11}/>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label"><DollarSign size={12} style={{ display:'inline', marginRight:'4px' }}/>Hourly Rate (₹)</label>
                <input id="reg-rate" type="number" className="form-input" placeholder="e.g. 350"
                  value={hourlyRate} onChange={e => setHourlyRate(e.target.value)} min="0" />
                <span style={{ fontSize:'0.75rem', color:'var(--text-muted)', marginTop:'2px' }}>Leave blank to set later. Industry avg: ₹200–₹600/hr</span>
              </div>

              <div className="form-group">
                <label className="form-label">Government ID Type (for verification)</label>
                <select id="reg-id" className="form-select" value={idType} onChange={e => setIdType(e.target.value)}>
                  <option value="">Skip for now</option>
                  <option value="aadhaar">Aadhaar Card</option>
                  <option value="pan">PAN Card</option>
                  <option value="dl">Driving Licence</option>
                  <option value="voter">Voter ID</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Bio / About yourself (optional)</label>
                <textarea id="reg-bio" className="form-textarea"
                  placeholder="Tell employers about your experience, work ethic and specialties..."
                  value={bio} onChange={e => setBio(e.target.value)} rows={3}/>
              </div>
            </>
          )}

          {error && <div className="auth-error">{error}</div>}

          <div style={{ display:'flex', gap:'10px' }}>
            {step > 1 && (
              <button type="button" className="btn btn-secondary" style={{ flex:1 }}
                onClick={() => { setStep(s => s - 1); setError(''); }}>
                <ChevronLeft size={16}/> Back
              </button>
            )}
            <button type="submit" id="reg-submit" className="btn btn-primary" style={{ flex:1 }} disabled={loading}>
              {loading ? 'Creating account...' : (
                step < totalSteps
                  ? <>Next <ChevronRight size={16}/></>
                  : <><CheckCircle size={16}/> Create Account</>
              )}
            </button>
          </div>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
