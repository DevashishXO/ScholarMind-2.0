import React, { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function ResearchBot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages, isTyping]);

  const pushMessage = (msg) => setMessages((prev) => [...prev, msg]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg = { id: Date.now(), role: "user", text: input.trim(), createdAt: Date.now() };
    pushMessage(userMsg);
    setInput("");
    mockBotReply(input.trim());
  };

  const mockBotReply = (text) => {
    const botId = Date.now() + 1;
    const reply = `**Got it!** You said:\n\n> ${text}\n\nHere is a *mock reply* with **Markdown support** ✅`;
    let i = 0;

    setIsTyping(true);
    pushMessage({ id: botId, role: "bot", text: "", createdAt: Date.now() });

    const typing = setInterval(() => {
      i++;
      setMessages((prev) =>
        prev.map((m) => (m.id === botId ? { ...m, text: reply.slice(0, i) } : m))
      );
      if (i >= reply.length) {
        clearInterval(typing);
        setIsTyping(false);
      }
    }, 15);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <main className="flex-1 flex flex-col justify-center items-center w-full min-h-screen bg-neutral-800 p-8 text-white">
      
      {/* Header */}
      <div className="flex flex-col items-center max-w-5xl w-full mb-6">
        <div className="flex items-center gap-3">
          <img src="/icons8-bot-64.png" className="w-14 h-14 rounded-full bg-[var(--color-orange)] p-1" />
          <div className="font-bungee">
            <h1 className="text-2xl font-bold">HEY THERE!</h1>
            <p className="text-gray-300">Your Research Bot</p>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="max-w-7xl w-full flex flex-col rounded-3xl backdrop-blur-xl overflow-hidden">
        <div ref={chatRef} className="flex-1 h-[70vh] overflow-y-auto px-6 py-6 space-y-6 custom-scrollbar">
          
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] px-5 py-3 rounded-2xl leading-relaxed text-sm shadow-md ${
                  msg.role === "user"
                    ? "bg-neutral-700 text-white border border-white/10 rounded-br-none"
                    : "text-gray-200 rounded-bl-none prose prose-invert"
                }`}
              >
                {msg.role === "bot" ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.text}
                  </ReactMarkdown>
                ) : (
                  msg.text
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white/10 px-5 py-3 rounded-2xl shadow-md max-w-[60%]">
                <TypingDots />
              </div>
            </div>
          )}
        </div>

        {/* Input Section */}
        <div className="max-w-4xl w-full mx-auto p-5 border-t border-white/10 bg-neutral-900 rounded-2xl">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            rows={2}
            className="w-full bg-transparent outline-none resize-none rounded-xl p-3 border border-white/20 focus:border-[var(--color-orange)]"
          />
          <div className="flex justify-between mt-3">
            <button
              onClick={handleSend}
              className="flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg shadow-lg"
            >+ Add files
            </button>
            <button
              onClick={handleSend}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--color-orange)] hover:bg-orange-600 rounded-lg shadow-lg"
            >
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
    <div className="flex gap-1">
      <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
      <span className="w-2 h-2 bg-white/70 rounded-full animate-pulse delay-100" />
      <span className="w-2 h-2 bg-white/50 rounded-full animate-pulse delay-200" />
    </div>
  );
}
