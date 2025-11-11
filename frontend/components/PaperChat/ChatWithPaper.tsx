import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, FileText, Sparkles } from 'lucide-react';

export default function ChatWithPaper() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'bot',
      text: 'Hello! I\'m your research assistant. I\'m ready to discuss the paper "Attention Is All You Need". Ask me about the methodology, key findings, or specific sections!',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentPdf, setCurrentPdf] = useState('https://arxiv.org/pdf/1706.03762.pdf');
  const [highlights, setHighlights] = useState([]);
  const [pdfLoadError, setPdfLoadError] = useState(false);
  const chatContainerRef = useRef(null);
  const iframeRef = useRef(null);

  // Paper information for the default PDF
  const paperInfo = {
    title: "Attention Is All You Need",
    authors: "Ashish Vaswani, Noam Shazeer, Niki Parmar, Jakob Uszkoreit, Llion Jones, Aidan N. Gomez, Lukasz Kaiser, Illia Polosukhin",
    year: "2017",
    abstract: "The dominant sequence transduction models are based on complex recurrent or convolutional neural networks that include an encoder and a decoder. The best performing models also connect the encoder and decoder through an attention mechanism. We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely."
  };

  // Responses with highlights based on the actual paper content
  const sampleResponses = {
    'summary': {
      text: 'The paper introduces the Transformer architecture, which relies entirely on self-attention mechanisms without using recurrence or convolution. Key innovations include multi-head attention, positional encoding, and a encoder-decoder structure that enables parallel processing and better long-range dependency modeling.',
      highlights: ['Transformer architecture', 'self-attention mechanisms', 'multi-head attention', 'positional encoding', 'encoder-decoder structure', 'parallel processing', 'long-range dependency']
    },
    'methods': {
      text: 'The methodology uses scaled dot-product attention and multi-head attention mechanisms. The model employs residual connections, layer normalization, and positional encodings to capture sequence order. Training was done on WMT 2014 English-German and English-French translation tasks.',
      highlights: ['scaled dot-product attention', 'multi-head attention', 'residual connections', 'layer normalization', 'positional encodings', 'WMT 2014', 'translation tasks']
    },
    'attention': {
      text: 'The self-attention mechanism allows the model to weigh the importance of different words in a sequence when processing each word. Multi-head attention enables the model to jointly attend to information from different representation subspaces at different positions.',
      highlights: ['self-attention mechanism', 'weigh the importance', 'multi-head attention', 'representation subspaces', 'different positions']
    },
    'architecture': {
      text: 'The Transformer architecture consists of an encoder with 6 identical layers and a decoder with 6 identical layers. Each encoder layer has two sub-layers: multi-head self-attention and position-wise feed-forward network. The decoder has an additional third sub-layer for encoder-decoder attention.',
      highlights: ['encoder', 'decoder', '6 identical layers', 'multi-head self-attention', 'position-wise feed-forward network', 'encoder-decoder attention']
    },
    'results': {
      text: 'The Transformer achieved a BLEU score of 28.4 on the WMT 2014 English-to-German translation task, outperforming all previously published models. On English-to-French, it achieved 41.0 BLEU, establishing new state-of-the-art results with significantly less training time.',
      highlights: ['BLEU score of 28.4', 'WMT 2014 English-to-German', 'outperforming all previously published models', '41.0 BLEU', 'state-of-the-art results', 'less training time']
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      text: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      const responseKey = Object.keys(sampleResponses).find(key => 
        input.toLowerCase().includes(key)
      ) || 'summary';
      
      const response = sampleResponses[responseKey];
      
      const botMessage = {
        id: Date.now() + 1,
        role: 'bot',
        text: response.text,
        timestamp: new Date(),
        highlights: response.highlights
      };

      setMessages(prev => [...prev, botMessage]);
      setHighlights(response.highlights);
      setIsLoading(false);
    }, 1500);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const highlightText = (text, highlights) => {
    if (!highlights || highlights.length === 0) return text;

    let highlightedText = text;
    highlights.forEach(highlight => {
      const regex = new RegExp(`(${highlight})`, 'gi');
      highlightedText = highlightedText.replace(regex, '<mark class="bg-yellow-200 text-yellow-900 px-1 rounded">$1</mark>');
    });

    return <span dangerouslySetInnerHTML={{ __html: highlightedText }} />;
  };

  const handlePdfLoadError = () => {
    setPdfLoadError(true);
  };

  const handleLoadDifferentPaper = () => {
    setPdfLoadError(false);
    setCurrentPdf('https://arxiv.org/pdf/1706.03762.pdf');
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="max-w-[90%] w-full mx-auto py-8 px-6">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-white mb-3">Chat with Paper</h1>
        <p className="text-neutral-400 text-lg max-w-2xl mx-auto">
          Interact with research papers using AI — ask questions, summarize content, and explore insights.
        </p>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-2">
        
        {/* Chatbot Panel */}
        <div className="bg-neutral-800 border border-neutral-700 rounded-xl shadow-2xl flex flex-col h-[85vh]">
          <div className="border-b border-neutral-700 px-6 py-4 flex justify-between items-center bg-neutral-900/50">
            <div className="flex gap-3 items-center">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-[var(--color-orange)] p-2 flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-orange-500 rounded-full border-2 border-neutral-800 flex items-center justify-center">
                  <Sparkles className="w-2 h-2 text-white" />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white font-bungee">Research Assistant</h2>
                <p className="text-sm text-neutral-400">Ask anything about the paper</p>
              </div>
            </div>
            <button
              onClick={handleLoadDifferentPaper}
              className="bg-[var(--color-orange)] hover:bg-orange-600 transition px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2 cursor-pointer font-bungee"
            >
              <FileText size={16} />
              NotePad
            </button>
          </div>
          
          {/* Chat Messages */}
          <div 
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar"
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start gap-3 max-w-[85%] ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  {message.role === 'bot' && (
                    <div className="w-8 h-8 rounded-full bg-[var(--color-orange)] flex items-center justify-center flex-shrink-0 mt-1">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div
                    className={`px-4 py-3 rounded-2xl ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-neutral-700 text-gray-200 rounded-bl-none'
                    }`}
                  >
                    <div className="text-sm leading-relaxed">
                      {message.highlights 
                        ? highlightText(message.text, message.highlights)
                        : message.text
                      }
                    </div>
                    <div className={`text-xs mt-2 ${message.role === 'user' ? 'text-blue-200' : 'text-neutral-400'}`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  {message.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-1">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-start gap-3 max-w-[85%]">
                  <div className="w-8 h-8 rounded-full bg-[var(--color-orange)] flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-neutral-700 px-4 py-3 rounded-2xl rounded-bl-none">
                    <div className="flex items-center gap-2 text-gray-300">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-[var(--color-orange)] rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-[var(--color-orange)] rounded-full animate-bounce delay-100" />
                        <div className="w-2 h-2 bg-[var(--color-orange)] rounded-full animate-bounce delay-200" />
                      </div>
                      <span className="text-sm text-neutral-400">Analyzing paper content...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t border-neutral-700 px-6 py-4 bg-neutral-900/30">
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about the Transformer architecture, attention mechanism, or results..."
                className="flex-1 bg-neutral-700 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[var(--color-orange)] focus:border-transparent transition-all"
                disabled={isLoading}
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className={`p-3 rounded-xl transition-all ${
                  !input.trim() || isLoading
                    ? 'bg-neutral-600 cursor-not-allowed opacity-50'
                    : 'bg-[var(--color-orange)] hover:bg-orange-600 hover:scale-105'
                }`}
              >
                <Send className="w-5 h-5 text-white" />
              </button>
            </div>
            <div className="flex justify-between items-center mt-2 text-xs text-neutral-500">
              <span>Press Enter to send</span>
              <span>{input.length}/500</span>
            </div>
          </div>
        </div>

        {/* PDF Viewer Panel */}
        <div className="bg-neutral-800 border border-neutral-700 rounded-xl shadow-2xl flex flex-col h-[85vh]">
          {/*<div className="border-b border-neutral-700 px-6 py-4 bg-neutral-900/50 flex items-center gap ">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white font-bungee">Paper Viewer :</h2>
            </div>
            {currentPdf && !pdfLoadError && (
                <h3 className="text-lg font-semibold font-bungee text-[var(--color-orange)]">{paperInfo.title}</h3>
            )}
          </div>*/}
          
          <div className="flex-1 overflow-hidden">
            {currentPdf && !pdfLoadError ? (
              <iframe
                ref={iframeRef}
                src={currentPdf}
                className="w-full h-full"
                title="PDF Viewer"
                onError={handlePdfLoadError}
              />
            ) : pdfLoadError ? (
              <div className="flex flex-col items-center justify-center h-full text-neutral-500 p-6">
                <FileText size={64} className="mb-4 opacity-50" />
                <p className="text-lg mb-2 text-red-400">Failed to load PDF</p>
                <p className="text-sm text-center max-w-md mb-4">
                  The PDF could not be loaded. This might be due to network issues or the PDF being unavailable.
                </p>
                <button
                  onClick={handleLoadDifferentPaper}
                  className="bg-[var(--color-orange)] hover:bg-orange-600 transition px-4 py-2 rounded-lg text-white text-sm font-medium"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-neutral-500 p-6">
                <FileText size={64} className="mb-4 opacity-50" />
                <p className="text-lg mb-2">No PDF available</p>
                <p className="text-sm text-center max-w-md">
                  There is no paper currently loaded for viewing.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}