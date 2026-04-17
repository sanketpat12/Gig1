import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Briefcase, HardHat, LogIn, Eye, EyeOff, Bot, Volume2, VolumeX } from 'lucide-react';
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
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  // Stop speaking when component unmounts
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

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

  const handleVoiceGuide = async () => {
    if (isSpeaking || aiLoading) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setAiLoading(false);
      return;
    }

    setAiLoading(true);
    let situationText = `The user is on the Login page for GigNav. They have currently selected the role: ${role}. `;
    
    if (!email && !password) {
      situationText += "They haven't entered their email or password yet. Tell them to enter their credentials and make sure they selected the correct role.";
    } else if (!email) {
      situationText += "They entered a password but no email. Tell them they still need to provide an email.";
    } else if (!password) {
      situationText += "They entered an email but no password. Tell them they still need to provide a password.";
    } else if (error) {
      situationText += `They tried to login and got this error message: "${error}". Give them a short tip on how to fix it or what to check.`;
    } else {
      situationText += "They have entered both email and password. Tell them they are ready to click 'Sign In', or they can try the Demo Accounts below if they are just testing the app.";
    }

    const systemPrompt = "You are a helpful and friendly voice AI assistant for GigNav. Provide a very short, natural-sounding spoken guidance (1 to 2 sentences max) based on the user's situation. Do not use markdown, emojis, or bullet points because this will be read out loud by a text-to-speech engine.";

    try {
      const res = await fetch("http://localhost:3001/api/chat", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: situationText }
          ]
        })
      });

      if (!res.ok) throw new Error('API failed');
      const data = await res.json();
      const reply = data.choices && data.choices[0] && data.choices[0].message.content;

      if (reply) {
        speakText(reply);
      } else {
        speakText("I'm sorry, I couldn't understand the situation.");
      }
    } catch (err) {
      console.error(err);
      speakText("I'm having trouble connecting to my brain right now. Please make sure the AI server is running.");
    } finally {
      setAiLoading(false);
    }
  };

  const speakText = (text) => {
    window.speechSynthesis.cancel(); // cancel any ongoing speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  // Auto-trigger voice guidance whenever an error occurs
  useEffect(() => {
    if (!error) return;

    const autoGuideError = async () => {
      window.speechSynthesis.cancel(); // Interrupt whatever is currently speaking
      setAiLoading(true);

      const situationText = `The user is on the Login page trying to log in but got this error message: "${error}". Give them a very short 1-sentence tip on what they did wrong and how to fix it.`;
      const systemPrompt = "You are a helpful voice AI for GigNav. Provide a very short, natural spoken guidance for this error. Do not use markdown or emojis.";

      try {
        const res = await fetch("http://localhost:3001/api/chat", {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: situationText }
            ]
          })
        });

        if (!res.ok) throw new Error('API failed');
        const data = await res.json();
        const reply = data.choices && data.choices[0] && data.choices[0].message.content;

        if (reply) {
          speakText(reply);
        }
      } catch (err) {
        console.error("Auto guide error:", err);
      } finally {
        setAiLoading(false);
      }
    };

    autoGuideError();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  return (
    <div className="auth-page">
      <div className="auth-box glass-card animate-fadeInUp" style={{ position: 'relative' }}>
        
        {/* Floating AI Guide Button */}
        <button 
          onClick={handleVoiceGuide}
          className={`login-ai-guide-btn ${isSpeaking ? 'active' : ''}`}
          title="AI Voice Guide"
        >
          {aiLoading ? (
            <Bot size={16} className="animate-pulse" />
          ) : isSpeaking ? (
            <VolumeX size={16} />
          ) : (
            <Bot size={16} />
          )}
          <span>{aiLoading ? 'Thinking...' : isSpeaking ? 'Stop Guide' : 'Voice Guide'}</span>
        </button>

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
