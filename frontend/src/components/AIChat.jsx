import React, { useState, useRef, useEffect } from 'react';
import client from '../api/client';
import { Send, Sparkles, Bot, User, Loader2 } from 'lucide-react';

export default function AIChat() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I am HoneyAI, your Google Gemini-powered smart beekeeping advisor. You can ask me about bee diseases, optimal harvest timing, honey purity standards (FSSAI/Codex), or hive management tips!',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await client.post('/api/ai/chat', {
        message: userMessage,
        context: 'Beekeeping expert advice for HoneyChain SIH platform',
      });
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: response.data.reply || response.data.response },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: '⚠️ AI Advisory Service is currently running with local fallback rules or requires a valid GOOGLE_API_KEY. For Apis cerana hives, maintain 34°C brood temperature and inspect comb fortnightly.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-chat-container card">
      <div className="chat-header flex items-center justify-between border-b border-subtle pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-warning-light text-warning">
            <Sparkles size={20} />
          </div>
          <div>
            <h3 className="font-bold text-sm">HoneyAI Assistant</h3>
            <span className="text-xs text-muted">Powered by Google Gemini</span>
          </div>
        </div>
        <span className="badge badge-success text-xs">Online</span>
      </div>

      <div className="chat-messages-area">
        {messages.map((m, idx) => (
          <div key={idx} className={`chat-message ${m.role === 'user' ? 'message-user' : 'message-bot'}`}>
            <div className="message-avatar">
              {m.role === 'user' ? <User size={16} /> : <Bot size={16} className="text-honey" />}
            </div>
            <div className="message-bubble">
              <div className="message-text">{m.content}</div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="chat-message message-bot">
            <div className="message-avatar">
              <Bot size={16} className="text-honey" />
            </div>
            <div className="message-bubble flex items-center gap-2">
              <Loader2 size={16} className="animate-spin text-honey" />
              <span className="text-xs text-muted">Consulting Gemini knowledge base...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="chat-input-form mt-3">
        <input
          type="text"
          className="form-input chat-input"
          placeholder="Ask HoneyAI about Varroa mites, moisture testing, floral flora..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit" disabled={loading || !input.trim()} className="btn btn-primary btn-chat-send">
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
