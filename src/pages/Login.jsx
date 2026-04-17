import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Briefcase, HardHat, LogIn, Eye, EyeOff, Bot, Volume2, VolumeX, Mic } from 'lucide-react';
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
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const formStateRef = useRef({ email, password, role, error });

  useEffect(() => {
    formStateRef.current = { email, password, role, error };
  }, [email, password, role, error]);

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

  const handleVoiceGuide = async (transcript) => {
    setAiLoading(true);
    const { email: curEmail, password: curPass, role: curRole, error: curError } = formStateRef.current;

    let situationText = `The user is on the Login page trying to log in as a ${curRole || 'unselected role'}. `;
    if (!curEmail && !curPass) {
      situationText += "They haven't entered their email or password yet.";
    } else if (!curEmail) {
      situationText += "They entered a password but no email.";
    } else if (!curPass) {
      situationText += "They entered an email but no password.";
    } else {
      situationText += "They have entered both email and password.";
    }
    
    if (curError) situationText += ` There is currently an error on their screen: "${curError}".`;

    const systemPrompt = `You are a helpful voice guide for the GigNav login page.
Current form status: ${situationText}

The user just asked this via microphone: "${transcript}"

Evaluate what they asked. Give a short, helpful, 1 or 2 sentence spoken ANSWER/INSTRUCTION to guide them.
CRITICAL RULES:
1. Do NOT ask them any questions as they cannot easily reply back.
2. Identify the language the user used to ask the question (e.g., Hindi, English, Marathi, Tamil, etc).
3. Draft your response natively in exactly that SAME language.
4. Output STRICTLY raw JSON data matching this schema:
{
  "lang_code": "en-US", // use appropriate TTS lang code like hi-IN, mr-IN, ta-IN, en-US
  "spoken_response": "string"
}`;

    const API_URL = import.meta.env.VITE_API_BASE_URL || (window.location.hostname === 'localhost' ? 'http://localhost:3001' : '');
    try {
      const res = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'system', content: systemPrompt }]
        })
      });

      if (!res.ok) throw new Error('API failed');
      const data = await res.json();
      let rawText = data.choices[0].message.content || '{}';
      rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(rawText);

      const utterance = new SpeechSynthesisUtterance(parsed.spoken_response || "Sorry, I couldn't understand.");
      if (parsed.lang_code) utterance.lang = parsed.lang_code;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      setAiLoading(false);
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error(err);
      setAiLoading(false);
      speakText("I'm having trouble connecting to my brain right now. Please make sure the AI server is running.");
    }
  };

  const startListening = () => {
    if (isSpeaking || aiLoading) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setAiLoading(false);
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice recognition not supported in this browser.");
      return;
    }
    if (recognitionRef.current) recognitionRef.current.stop();
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      handleVoiceGuide(transcript);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    
    recognitionRef.current = recognition;
    recognition.start();
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
        {isListening && (
          <span style={{ fontSize: '0.75rem', position: 'absolute', background: 'var(--surface)', top: 12, right: 120, whiteSpace: 'nowrap', padding: '6px 12px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 9999 }}>
            Listening...
          </span>
        )}
        <button 
          type="button"
          onClick={isListening ? () => { if(recognitionRef.current) recognitionRef.current.stop(); } : startListening}
          className={`login-ai-guide-btn ${isSpeaking || isListening ? 'active' : ''}`}
          title="AI Voice Guide"
        >
          {aiLoading ? (
            <Bot size={16} className="animate-pulse" />
          ) : isSpeaking ? (
            <VolumeX size={16} />
          ) : isListening ? (
            <Mic size={16} className="animate-pulse" />
          ) : (
            <Mic size={16} />
          )}
          <span>{aiLoading ? 'Thinking...' : isSpeaking ? 'Stop Guide' : isListening ? 'Tap to Stop' : 'Ask AI Help'}</span>
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
