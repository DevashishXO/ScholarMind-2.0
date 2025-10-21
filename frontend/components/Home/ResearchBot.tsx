import React, { useEffect, useRef, useState } from "react";
import { Send, Sparkles } from "lucide-react";

// Simplified ResearchBot with modern glass UI, ChatGPT-style full-width messages
export default function ResearchBot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  function pushMessage(msg) {
    setMessages(prev => [...prev, msg]);
  }

  function handleSend() {
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMsg = { id: `m-${Date.now()}`, role: 'user', text: trimmed, createdAt: Date.now() };
    pushMessage(userMsg);
    setInput('');

    // Mock bot reply
    mockBotReply(trimmed);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function mockBotReply(userMessage) {
    setIsTyping(true);
    const replyText = `Echo: ${userMessage}`;
    const id = `m-${Date.now()}`;
    pushMessage({ id, role: 'bot', text: '', createdAt: Date.now() });

    let idx = 0;
    const interval = setInterval(() => {
      idx += 2;
      setMessages(prev => prev.map(m => m.id === id ? { ...m, text: replyText.slice(0, idx) } : m));
      if (idx >= replyText.length) {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 40);
  }

  return (
    <main className="flex flex-col flex-1 w-full items-center justify-center p-8 min-h-screen text-white bg-neutral-800">
      {/* Header */}
      <div className="flex flex-col items-center max-w-5xl w-full backdrop-blur-md rounded-2xl py-5">
        <div className="flex items-center gap-3">
          <img src="/icons8-bot-64.png" alt="Logo" className="w-16 h-16 rounded-full bg-[var(--color-orange)] p-1" />
          <div>
            <h1 className="text-2xl font-semibold font-bungee">HEY THERE !</h1>
            <p className="text-gray-300 font-bungee">Your Research Bot</p>
          </div>
        </div>
      </div>

      {/* Chat container */}
      <div className="max-w-4xl w-full flex flex-col rounded-2xl backdrop-blur-md">
        <div ref={chatRef} className="flex-1 h-96 overflow-y-auto p-4 space-y-4">
          {messages.map(m => (
            <div key={m.id} className={`${m.role === 'user' ? 'justify-end' : 'justify-start'} flex` }>
              <div className={`w-full max-w-[90%] p-4 rounded-2xl break-words ${m.role === 'user' ? 'bg-[#1f1f1f] text-white rounded-br-none' : 'bg-white/10 text-gray-100 rounded-bl-none'}`}>
                {m.text || (m.role === 'bot' && isTyping ? <TypingDots /> : '')}
              </div>
            </div>
          ))}
        </div>

        {/* Input area */}
        <div className="flex flex-col px-4 py-3 border border-white/20 rounded-2xl bg-neutral-900">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message here..."
            className="w-full resize-none p-3 rounded-lg bg-transparent focus:outline-none focus:border-[var(--color-orange)]"
            rows={2}
          />
          <div className="flex justify-between mt-2 border-t pt-4 border-neutral-700">
            <button onClick={handleSend} className="flex items-center gap-2 px-5 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition">
              +
            </button>
            <button onClick={handleSend} className="flex items-center gap-2 px-3 py-2 bg-[var(--color-orange)] hover:bg-orange-600 rounded-lg transition">
              <Send size={16} /> Send
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1">
      <span className="w-2 h-2 rounded-full bg-white/80 animate-pulse" />
      <span className="w-2 h-2 rounded-full bg-white/60 animate-pulse delay-75" />
      <span className="w-2 h-2 rounded-full bg-white/40 animate-pulse delay-150" />
      <style>{`
        .animate-pulse { animation: pulse 1s infinite ease-in-out; }
        .delay-75 { animation-delay: 0.12s; }
        .delay-150 { animation-delay: 0.24s; }
        @keyframes pulse { 0% { opacity:0.2; transform:translateY(0); } 50% { opacity:1; transform:translateY(-3px); } 100% { opacity:0.2; transform:translateY(0); } }
      `}</style>
    </div>
  );
}