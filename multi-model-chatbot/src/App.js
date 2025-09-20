import React, { useState, useEffect, useRef, useCallback } from 'react';
import ChatHistoryPanel from './ChatHistoryPanel';
import './App.css';

const MODELS = [
  { id: 'openai/gpt-4o-mini-search-preview', name: 'OpenAI GPT-4o Mini Search Preview', color: '#2563eb' },
  { id: 'google/gemini-2.5-flash-lite-preview-06-17', name: 'Google Gemini', color: '#ed8936' },
  { id: 'google/gemma-3n-e2b-it:free', name: 'Google Gemma (free)', color: '#059669' },
  { id: 'nvidia/nemotron-nano-9b-v2:free', name: 'NVIDIA Nemotron Nano (free)', color: '#13b3b6' },
  { id: 'agentica-org/deepcoder-14b-preview:free', name: 'Deepcoder (agentica, free)', color: '#b91c1c' },
  { id: 'mistralai/mistral-small-3.2-24b-instruct:free', name: 'Mistral Small (free)', color: '#7c3aed' },
  { id: 'x-ai/grok-4-fast:free', name: 'GROK (free)', color: '#ea580c' },
];

const OPENROUTER_API_KEY = process.env.REACT_APP_OPENROUTER_API_KEY;
const AVATAR_USER =
  'https://api.dicebear.com/7.x/lorelei/svg?seed=You';
const AVATAR_BOT =
  'https://api.dicebear.com/7.x/lorelei/svg?seed=AI';

function loadChatHistory() {
  try {
    return JSON.parse(localStorage.getItem('chatHistory')) || {};
  } catch {
    return {};
  }
}

function saveChatHistory(chatHistory) {
  localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
}

function generateChatId() {
  return 'chat-' + Date.now();
}

function formatTime(d) {
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function App() {
  const [chatHistory, setChatHistory] = useState(loadChatHistory);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [model, setModel] = useState(MODELS[0].id);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [botTyping, setBotTyping] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const chatEndRef = useRef(null);

  // Toggle side panel visibility
  const togglePanel = () => setIsPanelOpen((prev) => !prev);

  // Load selected chat messages and model on chat selection
  useEffect(() => {
    if (selectedChatId && chatHistory[selectedChatId]) {
      setMessages(chatHistory[selectedChatId].messages || []);
      const chatModelId = chatHistory[selectedChatId].modelId;
      if (MODELS.some((m) => m.id === chatModelId)) {
        setModel(chatModelId);
      } else {
        setModel(MODELS[0].id);
      }
    } else {
      setMessages([]);
      setModel(MODELS[0].id);
    }
  }, [selectedChatId]);

  // Update localStorage chat history whenever chatHistory state changes
  useEffect(() => {
    saveChatHistory(chatHistory);
  }, [chatHistory]);

  // Scroll chat to bottom smoothly on new message or typing
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, botTyping]);

  // Append a message and update history
  const appendMessage = useCallback(
    (role, content) => {
      setMessages((prev) => {
        const newMessages = [...prev, { role, content, ts: new Date() }];
        if (selectedChatId) {
          setChatHistory((prevHistory) => {
            const newHistory = {
              ...prevHistory,
              [selectedChatId]: {
                chatId: selectedChatId,
                modelId: model,
                modelName:
                  MODELS.find((m) => m.id === model)?.name || 'Unknown',
                lastUpdated: new Date().toISOString(),
                messages: newMessages,
              },
            };
            const entries = Object.entries(newHistory);
            entries.sort(
              (a, b) =>
                new Date(b[1].lastUpdated) - new Date(a[1].lastUpdated)
            );
            while (entries.length > 10) entries.pop();
            return Object.fromEntries(entries);
          });
        }
        return newMessages;
      });
    },
    [model, selectedChatId]
  );

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    setError(null);
    let chatId = selectedChatId;
    if (!chatId) {
      chatId = generateChatId();
      setSelectedChatId(chatId);
      const initialMessages = [{ role: 'user', content: input, ts: new Date() }];
      setMessages(initialMessages);
      setChatHistory((prevHistory) => ({
        ...prevHistory,
        [chatId]: {
          chatId,
          modelId: model,
          modelName: MODELS.find((m) => m.id === model)?.name || 'Unknown',
          lastUpdated: new Date().toISOString(),
          messages: initialMessages,
        },
      }));
      setInput('');
    } else {
      appendMessage('user', input);
      setInput('');
    }

    setLoading(true);
    setBotTyping(true);

    const recentMessages = selectedChatId
      ? [...messages, { role: 'user', content: input }].slice(-12)
      : [{ role: 'user', content: input }];

    try {
      const response = await fetch(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            messages: recentMessages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
        }
      );

      if (response.status === 429) {
        setError(
          'Rate limit exceeded for this model. Please wait or switch to another model.'
        );
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
  };

  const handleSelectChat = (chatId) => {
    setSelectedChatId(chatId);
    setError(null);
  };

  const handleNewChat = () => {
    setSelectedChatId(null);
    setMessages([]);
    setError(null);
  };

  const modelData =
    MODELS.find((m) => m.id === model) || {
      id: null,
      name: 'Unknown Model',
      color: '#555',
    };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#dde4f6' }}>
      <ChatHistoryPanel
        chatHistory={chatHistory}
        selectedChatId={selectedChatId}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        isOpen={isPanelOpen}
        toggleOpen={togglePanel}
      />
      <div style={{ flex: 1 }}>
        <div
          className="app-bg"
          style={{ height: '80vh', padding: '20px', boxSizing: 'border-box' }}
        >
          <div className="bubbles-bg" aria-hidden="true">
            <div className="bubble bubble1"></div>
            <div className="bubble bubble2"></div>
            <div className="bubble bubble3"></div>
            <div className="bubble bubble4"></div>
            <div className="bubble bubble5"></div>
            <div className="bubble bubble6"></div>
            <div className="bubble bubble7"></div>
          </div>

          <div
            className="chat-card pop"
            style={{ height: 'calc(80vh - 40px)', display: 'flex', flexDirection: 'column' }}
          >
            <div>
              <div className="chat-title">
                Multi-Model Chatbot
                <br />
                <span style={{ fontSize: '1.2rem', fontWeight: 400 }}>
                  {' '}
                  (OpenRouter Free Models and Preview)
                </span>
              </div>
              <div className="badge-row">
                <div className="model-badge" style={{ background: modelData.color }}>
                  {modelData.name}
                </div>
              </div>
              <label htmlFor="model-select" className="selector-label">
                Choose Model:
              </label>
              <select
                id="model-select"
                onChange={handleModelChange}
                value={model}
                className="model-select"
                disabled={loading}
              >
                {MODELS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div
              className="chat-history"
              id="chat"
              style={{ flex: 1, overflowY: 'auto' }}
            >
              {messages.map((msg, idx) => (
                <div key={idx} className={`msg-row ${msg.role === 'user' ? 'right' : ''}`}>
                  <img
                    src={msg.role === 'user' ? AVATAR_USER : AVATAR_BOT}
                    alt="avatar"
                    className="avatar"
                  />
                  <div className={msg.role === 'user' ? 'user-message' : 'bot-message'}>
                    <span style={{ fontWeight: 600 }}>{msg.role === 'user' ? 'You' : 'Bot'}:</span>
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
                      <span></span>
                      <span></span>
                      <span></span>
                    </span>
                    <span className="msg-time">{formatTime(new Date())}</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {error && <div className="error">{error}</div>}

            <div className="input-row" style={{ marginTop: 10 }}>
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
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="send-btn"
              >
                {loading ? '...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
