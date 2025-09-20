import React, { useState, useEffect, useRef } from 'react';
import './App.css';
// console.log('Loaded API key:', process.env.REACT_APP_OPENROUTER_API_KEY);

const MODELS = [
  { id: 'openai/gpt-4o-mini-search-preview', name: 'OpenAI GPT-4o Mini Search Preview', color: '#2563eb' },
  { id: 'google/gemini-2.5-flash-lite-preview-06-17', name: 'Google Gemini', color: '#ed8936' },
  { id: 'google/gemma-3n-e2b-it:free', name: 'Google Gemma (free)', color: '#059669' },
  { id: 'nvidia/nemotron-nano-9b-v2:free', name: 'NVIDIA Nemotron Nano (free)', color: '#13b3b6' },
  { id: 'agentica-org/deepcoder-14b-preview:free', name: 'Deepcoder (agentica, free)', color: '#b91c1c' },
  { id: 'mistralai/mistral-small-3.2-24b-instruct:free', name: 'Mistral Small (free)', color: '#7c3aed' },
  { id: 'x-ai/grok-4-fast:free', name: 'GROK (free)', color: '#ea580c' },
];

const AVATAR_USER = "https://api.dicebear.com/7.x/lorelei/svg?seed=You";
const AVATAR_BOT  = "https://api.dicebear.com/7.x/lorelei/svg?seed=AI";

const OPENROUTER_API_KEY = process.env.REACT_APP_OPENROUTER_API_KEY;


function formatTime(d) {
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [model, setModel] = useState(MODELS[0].id);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [botTyping, setBotTyping] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, botTyping]);

  const appendMessage = (role, content) => {
    setMessages((prev) => [
      ...prev, 
      { role, content, ts: new Date() }
    ]);
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    setError(null);
    appendMessage('user', input);
    const userMessage = input;
    setInput('');
    setLoading(true);
    setBotTyping(true);

    const recentMessages = [...messages, { role: 'user', content: userMessage }].slice(-12);

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model,
          messages: recentMessages.map(m => ({role: m.role, content: m.content})),
        }),
      });

      if (response.status === 429) {
        setError('Rate limit exceeded for this model. Please wait or switch to another model.');
        setLoading(false);
        setBotTyping(false);
        return;
      }
      if (!response.ok) {
        setError(`Error: ${response.statusText}`);
        setLoading(false);
        setBotTyping(false);
        return;
      }
      const data = await response.json();
      const botContent = data.choices[0].message.content;
      appendMessage('assistant', botContent);
    } catch (err) {
      setError('Network or API error: ' + err.message);
    }
    setLoading(false);
    setBotTyping(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  const handleModelChange = (e) => {
    setModel(e.target.value);
    setMessages([]);
    setError(null);
  };

  const modelData = MODELS.find(m => m.id === model);
  return (
    <div className="app-bg">
      {/* Floating background bubbles */}
      <div className="bubbles-bg" aria-hidden="true">
        <div className="bubble bubble1"></div>
        <div className="bubble bubble2"></div>
        <div className="bubble bubble3"></div>
        <div className="bubble bubble4"></div>
        <div className="bubble bubble5"></div>
        <div className="bubble bubble6"></div>
        <div className="bubble bubble7"></div>
      </div>

      <div className="chat-card pop">
        <div className="chat-title">Multi-Model Chatbot<br /><span style={{fontSize:'1.2rem',fontWeight:400}}> (OpenRouter Free Models and Preview)</span></div>
        <div className="badge-row">
          <div className="model-badge" style={{background: modelData?.color || "#555"}}>
            {modelData?.name}
          </div>
        </div>
        <label htmlFor="model-select" className="selector-label">Choose Model:</label>
        <select id="model-select" onChange={handleModelChange} value={model} className="model-select">
          {MODELS.map((m) => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
        <div className="chat-history" id="chat">
          {messages.map((msg, idx) => (
            <div key={idx} className={`msg-row ${msg.role==='user'?"right":""}`}>
              <img src={msg.role==='user' ? AVATAR_USER : AVATAR_BOT} alt="avatar"
                className="avatar"
              />
              <div className={msg.role === 'user' ? 'user-message' : 'bot-message'}>
                <span style={{fontWeight:600}}>{msg.role === 'user' ? 'You' : 'Bot'}:</span>
                <span className="msg-text">{msg.content}</span>
                <span className="msg-time">{formatTime(msg.ts)}</span>
              </div>
            </div>
          ))}
          {botTyping && (
            <div className="msg-row">
              <img src={AVATAR_BOT} className="avatar" alt="bot" />
              <div className="bot-message">
                <span className="typing-indicator">
                  <span></span><span></span><span></span>
                </span>
                <span className="msg-time">{formatTime(new Date())}</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
        {error && <div className="error">{error}</div>}
        <div className="input-row">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type your message here..."
            className="user-input"
            disabled={loading}
            autoFocus
          />
          <button onClick={sendMessage} disabled={loading || !input.trim()} className="send-btn">
            {loading ? '...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
