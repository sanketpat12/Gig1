import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Bot, X, Send, User, ChevronUp, ChevronDown, Sparkles, Mic, MicOff } from 'lucide-react';
import './AIAssistant.css';

// Pointing directly to NVIDIA endpoint to support static serverless hosting
const API_URL = "https://integrate.api.nvidia.com/v1/chat/completions";

export default function AIAssistant() {
  const { currentUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! I am your GigNav AI Assistant. How can I help you today?' }
  ]);
  const [inputMsg, setInputMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  const bottomRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Don't render until they are logged in
  if (!currentUser) return null;

  const roleName = currentUser.role === 'employer' ? 'Employer' : 'Worker';

  const systemPrompt = `You are a helpful and polite AI Assistant directly built into the GigNav web platform. 
GigNav connects local gig workers (plumbers, drivers, cleaners, IT support) with employers.
You are currently talking to a logged-in User whose role is: ${roleName}. Their name is ${currentUser.name}.
If they are an Employer: Help them write job descriptions, figure out what skills to look for, or estimate appropriate budgets.
If they are a Worker: Help them write better profile bios, suggest skills to learn, or draft professional responses to clients.
Be concise, friendly, and practical. Format your answers smoothly (avoid overly complex markdown layouts, stick to brief paragraphs and bullet points).`;

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    const userText = inputMsg.trim();
    const newMessages = [...messages, { role: 'user', content: userText }];
    setMessages(newMessages);
    setInputMsg('');
    setIsLoading(true);

    try {
      const apiMessages = [
        { role: 'system', content: systemPrompt },
        ...newMessages.map(m => ({ role: m.role, content: m.content }))
      ];

      const API_URL = import.meta.env.VITE_API_BASE_URL 
        ? `${import.meta.env.VITE_API_BASE_URL}/api/chat` 
        : (window.location.hostname === 'localhost' ? 'http://localhost:3001/api/chat' : '/api/chat');

      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: apiMessages
        })
      });

      if (!res.ok) {
        throw new Error('Failed to fetch from API');
      }

      const rawText = await res.text();
      let data;
      try {
        data = JSON.parse(rawText);
      } catch (e) {
        throw new Error(`Parse failed. Status ${res.status}. Raw body: '${rawText.substring(0, 30)}'`);
      }

      const reply = data.choices && data.choices[0] && data.choices[0].message.content;

      if (reply) {
        setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I received an empty response. Try again!' }]);
      }
    } catch (err) {
      console.error("AI Assistant Error:", err);
      let errorDesc = err.message ? err.message : String(err);
      setMessages(prev => [...prev, { role: 'assistant', content: `Oops! Something went wrong: ${errorDesc}. Please make sure the NVIDIA API key is valid.` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleListen = () => {
    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Sorry, your browser doesn't support speech recognition.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    
    recognition.onresult = (event) => {
      const current = event.resultIndex;
      const transcript = event.results[current][0].transcript;
      setInputMsg(transcript); // Set live text as they speak
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  if (!isOpen) {
    return (
      <button 
        id="ai-fab-btn"
        className="ai-fab glass-card animate-fadeInUp delay-4" 
        onClick={() => setIsOpen(true)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="ai-fab-icon">
          <Sparkles size={24} className={isHovered ? 'animate-pulse-fast' : ''} />
        </div>
        {isHovered && <span className="ai-fab-text animate-slideInLeft">Ask AI</span>}
      </button>
    );
  }

  return (
    <div className="ai-chat-window glass-card animate-fadeInUp">
      {/* Header */}
      <div className="ai-header">
        <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
          <div className="ai-header-icon">
            <Bot size={18} />
          </div>
          <div>
            <h3 style={{fontSize:'0.95rem', fontWeight:800}}>GigNav AI Assistant</h3>
            <p style={{fontSize:'0.75rem', color:'rgba(255,255,255,0.7)'}}>Powered by NVIDIA NIM</p>
          </div>
        </div>
        <button id="close-ai-btn" className="ai-close-btn" onClick={() => setIsOpen(false)}>
          <ChevronDown size={20} />
        </button>
      </div>

      {/* Messages Array */}
      <div className="ai-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`ai-msg-row ${msg.role === 'user' ? 'ai-msg-right' : 'ai-msg-left'}`}>
            {msg.role === 'assistant' && (
              <div className="ai-avatar ai-bot-avatar"><Bot size={14}/></div>
            )}
            <div className={`ai-bubble ${msg.role === 'user' ? 'ai-bubble-user' : 'ai-bubble-bot'}`}>
              {msg.content}
            </div>
            {msg.role === 'user' && (
              <div className="ai-avatar ai-user-avatar"><User size={14}/></div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="ai-msg-row ai-msg-left">
            <div className="ai-avatar ai-bot-avatar"><Bot size={14}/></div>
            <div className="ai-bubble ai-bubble-bot ai-typing">
              <span>.</span><span>.</span><span>.</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="ai-input-area">
        <button 
          type="button" 
          className={`ai-mic-btn ${isListening ? 'listening' : ''}`}
          onClick={toggleListen}
          title="Voice Typing"
          style={{
            background: 'none',
            border: 'none',
            color: isListening ? '#ff6584' : 'var(--text-muted)',
            cursor: 'pointer',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'color 0.2s',
            animation: isListening ? 'pulse-glow 1.5s infinite' : 'none'
          }}
        >
          {isListening ? <MicOff size={18} /> : <Mic size={18} />}
        </button>

        <input 
          type="text" 
          value={inputMsg}
          onChange={(e) => setInputMsg(e.target.value)}
          placeholder={isListening ? "Listening..." : `Ask me anything, ${currentUser.name.split(' ')[0]}...`} 
          className="ai-input" 
          disabled={isLoading}
        />
        <button type="submit" className="ai-send-btn" disabled={!inputMsg.trim() || isLoading}>
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
