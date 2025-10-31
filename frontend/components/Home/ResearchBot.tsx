import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Send, ExternalLink, Paperclip, Bot, User, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function ResearchBot() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages, isTyping]);

  const pushMessage = (msg: any) => setMessages((prev) => [...prev, msg]);

  const handleSend = async () => {
    if (!input.trim() || isSending) return;

    const userMsg = { 
      id: Date.now(), 
      role: "user", 
      text: input.trim(), 
      createdAt: Date.now() 
    };
    pushMessage(userMsg);
    setInput("");
    setIsSending(true);

    await fetchBotReply(input.trim());
    setIsSending(false);
  };

  const fetchBotReply = async (query: string) => {
    const botId = Date.now() + 1;
    setIsTyping(true);
    pushMessage({ 
      id: botId, 
      role: "bot", 
      text: "", 
      createdAt: Date.now(),
      citations: [] 
    });

    try {
      const response = await axios.post("http://localhost:8000/api/v1/research-bot/", {
        user_query: query,
      });

      const data = response.data;
      const answerText = data?.answer_json?.answer || data?.answer || "No answer available.";
      const citations = data?.answer_json?.citations || [];

      setMessages((prev) =>
        prev.map((m) =>
          m.id === botId ? { ...m, text: answerText, citations } : m
        )
      );
    } catch (err: any) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === botId
            ? {
                ...m,
                text: `❌ **Error fetching data:** ${
                  err.response?.data?.detail || err.message
                }`,
              }
            : m
        )
      );
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: any) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <main className="flex-1 flex flex-col justify-center items-center w-full min-h-screen bg-neutral-800 p-4 md:py-4 text-white">
      {/* Header */}
      <div className="flex mt-2 flex-col items-center max-w-7xl w-full mb-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-14 h-14 rounded-full bg-[var(--color-orange)] p-1 flex items-center justify-center">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-neutral-800 flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
          </div>
          <div className="font-bungee">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-[var(--color-orange)] to-orange-400 bg-clip-text text-transparent">
              HEY THERE!
            </h1>
            <p className="text-gray-300">Your Research Assistant</p>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="max-w-7xl w-full h-screen flex flex-col rounded-3xl backdrop-blur-xl overflow-hidden">
        <div
          ref={chatRef}
          className="flex-1 h-[65vh] overflow-y-auto px-4 md:px-6 py-6 space-y-6 custom-scrollbar"
        >
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-4">
              <Bot className="w-16 h-16 text-[var(--color-orange)] opacity-50" />
              <p className="text-sm text-center max-w-md">
                Ask me anything about research papers, and I'll find relevant studies with summaries and links.
              </p>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div className="flex items-start gap-3 max-w-[85%]">
                {msg.role === "bot" && (
                  <div className="w-8 h-8 rounded-full bg-[var(--color-orange)] flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
                <div
                  className={`px-5 py-3 rounded-2xl leading-relaxed text-sm shadow-lg ${
                    msg.role === "user"
                      ? "bg-gradient-to-br from-neutral-700 to-neutral-800 text-white border border-white/10 rounded-br-none"
                      : "text-gray-200 rounded-bl-none bg-gradient-to-br from-neutral-800 to-neutral-900 border border-white/10 prose prose-invert"
                  }`}
                >
                  {msg.role === "bot" ? (
                    <>
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.text}
                      </ReactMarkdown>

                      {msg.citations?.length > 0 && (
                        <div className="mt-6 space-y-4">
                          <div className="flex items-center gap-2 text-[var(--color-orange)]">
                            <Sparkles className="w-4 h-4" />
                            <h3 className="text-lg font-semibold">
                              📚 Research Papers
                            </h3>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {msg.citations.map((citation: any, idx: number) => (
                              <div
                                key={idx}
                                className="group bg-neutral-800/80 border border-white/10 p-4 rounded-2xl hover:bg-neutral-700/50 transition-all duration-300 hover:border-[var(--color-orange)]/30 hover:translate-y-[-2px] hover:shadow-lg"
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <h4 className="font-semibold text-white text-sm leading-tight flex-1">
                                    {citation.title}
                                  </h4>
                                  <span className="bg-[var(--color-orange)] text-white text-xs px-2 py-1 rounded-full ml-2 flex-shrink-0">
                                    {citation.year}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-400 mb-2">
                                  {citation.authors}
                                </p>
                                <p className="text-xs text-gray-300 mb-3 leading-relaxed">
                                  <span className="text-[var(--color-orange)] font-medium">
                                    Citation #{citation.number}
                                  </span>
                                  {" - Referenced in the answer above"}
                                </p>
                                <div className="flex justify-between items-center">
                                  <a
                                    href={citation.pdf_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[var(--color-orange)] text-xs flex items-center gap-1 hover:underline group-hover:text-orange-400 transition-colors"
                                  >
                                    View PDF <ExternalLink size={12} />
                                  </a>
                                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      {msg.text}
                    </div>
                  )}
                </div>
                {msg.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-1">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-start gap-3 max-w-[85%]">
                <div className="w-8 h-8 rounded-full bg-[var(--color-orange)] flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white/10 px-5 py-3 rounded-2xl shadow-md rounded-bl-none">
                  <div className="flex items-center gap-2 text-gray-300">
                    <TypingDots />
                    <span className="text-xs text-gray-400">Researching...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Section */}
        <div className="max-w-4xl w-full my-2  mx-auto p-5 border-t border-white/10 bg-neutral-900/80 rounded-2xl">
          <div className="relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about research papers, studies, or any topic..."
              rows={2}
              disabled={isSending}
              className="w-full bg-neutral-800/50 outline-none resize-none rounded-xl p-3 border border-white/20 focus:border-[var(--color-orange)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed pr-24"
            />
            <div className="absolute right-3 bottom-3 flex items-center gap-2">
              <button
                onClick={() => alert("File upload coming soon")}
                disabled={isSending}
                className="p-2 bg-neutral-700 hover:bg-neutral-600 rounded-lg shadow-lg transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105"
                title="Attach files"
              >
                <Paperclip className="w-4 h-4" />
              </button>
              <button
                onClick={handleSend}
                disabled={!input.trim() || isSending}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg transition-all duration-200 ${
                  !input.trim() || isSending
                    ? "bg-gray-600 cursor-not-allowed opacity-50"
                    : "bg-[var(--color-orange)] hover:bg-orange-600 hover:scale-105"
                }`}
              >
                {isSending ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span className="text-sm">{isSending ? "Sending..." : "Send"}</span>
              </button>
            </div>
          </div>
          <div className="flex justify-between items-center mt-3 text-xs text-gray-400">
            <span>Press Enter to send, Shift+Enter for new line</span>
            <span>{input.length}/500</span>
          </div>
        </div>
      </div>
    </main>
  );
}

function TypingDots() {
  return (
    <div className="flex gap-1">
      <span className="w-2 h-2 bg-[var(--color-orange)] rounded-full animate-bounce" />
      <span className="w-2 h-2 bg-[var(--color-orange)] rounded-full animate-bounce delay-100" />
      <span className="w-2 h-2 bg-[var(--color-orange)] rounded-full animate-bounce delay-200" />
    </div>
  );
}