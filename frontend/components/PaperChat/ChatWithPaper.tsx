import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, FileText, Sparkles, MapPin, ArrowUpRight, Highlighter, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function ChatWithPaper({ pdfUrl }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'bot',
      text: `Hello! I'm your research assistant. I'm ready to discuss the paper. Ask me about the methodology, key findings, or specific sections!`,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentPdf, setCurrentPdf] = useState(pdfUrl);
  const [pdfLoadError, setPdfLoadError] = useState(false);
  const [citations, setCitations] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [activeCitation, setActiveCitation] = useState(null);
  const [highlightedText, setHighlightedText] = useState('');
  const chatContainerRef = useRef(null);
  const iframeRef = useRef(null);
  
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportContent, setReportContent] = useState('');
  const [reportLoading, setReportLoading] = useState(false);
  const [reportData, setReportData] = useState(null);

  const API_BASE_URL = 'http://localhost:8000';

  // Update currentPdf when pdfUrl prop changes
  useEffect(() => {
    if (pdfUrl) {
      setCurrentPdf(pdfUrl);
      setPdfLoadError(false);
      
      if (messages.length === 1) {
        setMessages(prev => [{
          ...prev[0],
          text: `Hello! I'm your research assistant. I've loaded the paper and I'm ready to discuss it. Ask me about the methodology, key findings, or specific sections!`
        }]);
      }
    }
  }, [pdfUrl]);

  // Update the handleGenerateReport function
  const handleGenerateReport = async () => {
    try {
      setReportLoading(true);
      setShowReportModal(true);
      setReportContent('');
      setReportData(null);
  
      // Call your backend to generate a report
      const response = await fetch(`http://localhost:8001/api/v1/chat-with-paper/generate-report`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pdf_url: currentPdf
        })
      });
  
      if (response.ok) {
        const data = await response.json();
        setReportData(data);
        setReportContent(data.report || '');
      } else {
        throw new Error('Failed to generate report');
      }
    } catch (error) {
      console.error('Report generation failed:', error);
      setReportContent('Error generating report. Please try again.');
    } finally {
      setReportLoading(false);
    }
  };
  
  // Add this function to convert markdown to HTML with styling
  const renderReportContent = () => {
    if (!reportContent) return null;
    
    return (
      <ReactMarkdown
        components={{
          h1: ({node, ...props}) => <h1 className="text-2xl font-bold text-white mb-4 flex items-center gap-2" {...props} />,
          h2: ({node, ...props}) => <h2 className="text-xl font-bold text-white mt-6 mb-3" {...props} />,
          h3: ({node, ...props}) => <h3 className="text-lg font-bold text-white mt-4 mb-2" {...props} />,
          p: ({node, ...props}) => <p className="text-gray-200 mb-3 leading-relaxed" {...props} />,
          ul: ({node, ...props}) => <ul className="list-disc list-inside mb-4 ml-4 text-gray-200 space-y-1" {...props} />,
          ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-4 ml-4 text-gray-200 space-y-1" {...props} />,
          li: ({node, ...props}) => <li className="mb-1" {...props} />,
          strong: ({node, ...props}) => <strong className="font-bold text-white" {...props} />,
          em: ({node, ...props}) => <em className="italic text-gray-300" {...props} />,
          code: ({node, inline, ...props}) => 
            inline 
              ? <code className="bg-neutral-700 px-1.5 py-0.5 rounded text-sm text-orange-300" {...props} />
              : <pre className="bg-neutral-700 p-4 rounded-lg my-4 overflow-x-auto"><code className="text-sm text-orange-300" {...props} /></pre>,
          blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-[var(--color-orange)] pl-4 my-4 italic text-gray-300 bg-neutral-700/50 py-2 rounded-r-lg" {...props} />,
          a: ({node, ...props}) => <a className="text-[var(--color-orange)] hover:text-orange-400 underline" {...props} />,
          hr: ({node, ...props}) => <hr className="my-6 border-neutral-600" {...props} />
        }}
      >
        {reportContent}
      </ReactMarkdown>
    );
  };
  
  // Update the save and download handlers
  const handleSaveReport = () => {
    console.log('Saving report...');
    // Implement your save functionality here
    alert('Report saved successfully!');
  };
  
  const handleDownloadReport = () => {
    if (!reportData) return;
    
    const element = document.createElement("a");
    const file = new Blob([reportContent], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `research-report-${reportData.arxiv_id || 'report'}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };
  
  const handleCloseModal = () => {
    if (!reportLoading) {
      setShowReportModal(false);
    }
  };
  
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    if (!currentPdf) {
      const errorMessage = {
        id: Date.now(),
        role: 'bot',
        text: 'No PDF is currently loaded. Please provide a PDF URL to start chatting.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }

    const userMessage = {
      id: Date.now(),
      role: 'user',
      text: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/chat-with-paper/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: input.trim(),
          pdf_url: currentPdf
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === 'success') {
        const botMessage = {
          id: Date.now() + 1,
          role: 'bot',
          text: data.answer,
          timestamp: new Date(),
          citations: data.citations,
          metadata: data.metadata
        };

        setMessages(prev => [...prev, botMessage]);
        setCitations(data.citations || []);
      } else {
        throw new Error(data.error || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('API call failed:', error);
      const errorMessage = {
        id: Date.now() + 1,
        role: 'bot',
        text: `Sorry, I encountered an error while processing your request: ${error.message}. Please try again.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCitationClick = (citation) => {
    console.log('Citation clicked:', citation);
    
    if (citation.page) {
      // Set the current page state
      const targetPage = citation.page;
      setCurrentPage(targetPage);
      setActiveCitation(citation);
      setHighlightedText(citation.full_text || citation.text_preview);
      
      // Use PDF.js viewer for reliable page navigation
      navigateToPDFJSPage(targetPage);
      
      console.log(`Navigating to page ${targetPage}`);
    } else {
      console.log('No page number available for this citation');
    }
  };

  const clearCitationHighlight = () => {
    setActiveCitation(null);
    setHighlightedText('');
  };

  // Use PDF.js viewer for reliable page navigation
  const navigateToPDFJSPage = (pageNumber) => {
    const iframe = iframeRef.current;
    if (!iframe) {
      console.log('Iframe not found');
      return;
    }

    // Use Mozilla's PDF.js viewer for reliable page navigation
    const pdfJsViewerUrl = `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(currentPdf)}#page=${pageNumber}`;
    
    console.log('Setting PDF.js viewer URL:', pdfJsViewerUrl);
    iframe.src = pdfJsViewerUrl;
  };

  // Handle manual page navigation
  const handlePageNavigation = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      clearCitationHighlight(); // Clear active citation when manually navigating
      navigateToPDFJSPage(newPage);
    }
  };

  // Enhanced citation buttons with better UI and spacing
  const CitationButtons = ({ citations, onCitationClick }) => {
    if (!citations || citations.length === 0) return null;

    return (
      <div className="mt-4 p-4 bg-neutral-750 rounded-xl border border-neutral-600 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-semibold text-blue-400">Source References</span>
          </div>
          <span className="text-xs text-neutral-400 bg-neutral-700 px-2.5 py-1 rounded-full font-medium">
            {citations.length} citation{citations.length > 1 ? 's' : ''}
          </span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {citations.map((citation) => (
            <button
              key={citation.citation_number}
              onClick={() => onCitationClick(citation)}
              className={`
                group relative p-3 rounded-xl text-sm font-medium transition-all duration-200 
                border-2 shadow-sm flex items-start gap-3 text-left min-w-0 hover:scale-[1.02]
                ${
                  activeCitation?.citation_number === citation.citation_number
                    ? 'bg-blue-600/20 border-blue-400 text-white shadow-blue-500/25'
                    : 'bg-neutral-700/50 border-neutral-600 text-neutral-200 hover:bg-neutral-600/50 hover:border-neutral-500 hover:shadow-lg'
                }
              `}
            >
              <div className={`
                w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5
                ${
                  activeCitation?.citation_number === citation.citation_number
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-blue-600/80 text-white group-hover:bg-blue-500'
                }
              `}>
                {citation.citation_number}
              </div>
              
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white">Page {citation.page}</span>
                </div>
              </div>
              
              <ArrowUpRight className={`
                w-3.5 h-3.5 transition-transform duration-200 flex-shrink-0 mt-0.5
                ${
                  activeCitation?.citation_number === citation.citation_number
                    ? 'text-blue-300'
                    : 'text-neutral-400 group-hover:text-neutral-300'
                }
                group-hover:translate-x-0.5 group-hover:-translate-y-0.5
              `} />
              
              {/* Active indicator */}
              {activeCitation?.citation_number === citation.citation_number && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full ring-2 ring-neutral-800 animate-pulse"></div>
              )}
            </button>
          ))}
        </div>
      </div>
    );
  };

  // Enhanced PDF viewer with citation highlighting
  const renderPDFViewer = () => {
    return (
      <div className="w-full h-full flex flex-col">
        {/* PDF Controls */}
        <div className="bg-neutral-700 px-4 py-3 flex items-center justify-between">
          
          
          <div className="flex items-center gap-3">
            {activeCitation && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 rounded-full animate-pulse">
                <Highlighter className="w-3 h-3 text-white" />
                <span className="text-white text-xs font-medium">
                  Citation [{activeCitation.citation_number}] Active
                </span>
              </div>
            )}
            <div className="text-neutral-400 text-sm">
              {citations.length > 0 && `${citations.length} citation${citations.length > 1 ? 's' : ''}`}
            </div>
          </div>
        </div>

        {/* PDF Display with Highlight Overlay */}
        <div className="flex-1 bg-neutral-900 flex items-center justify-center relative">
          {currentPdf && !pdfLoadError ? (
            <>
              <iframe
                ref={iframeRef}
                src={`https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(currentPdf)}`}
                className="w-full h-full"
                title="PDF Viewer"
                onLoad={() => console.log('PDF loaded successfully')}
                onError={handlePdfLoadError}
              />
              
              
            </>
          ) : pdfLoadError ? (
            <div className="flex flex-col items-center justify-center text-neutral-500 p-6">
              <FileText size={64} className="mb-4 opacity-50" />
              <p className="text-lg mb-2 text-red-400">Failed to load PDF</p>
              <p className="text-sm text-center max-w-md mb-4">
                The PDF could not be loaded. This might be due to CORS restrictions or the PDF being unavailable.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setPdfLoadError(false);
                    navigateToPDFJSPage(1);
                  }}
                  className="bg-[var(--color-orange)] hover:bg-orange-600 transition px-4 py-2 rounded-lg text-white text-sm font-medium"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-neutral-500 p-6">
              <FileText size={64} className="mb-4 opacity-50" />
              <p className="text-lg mb-2">No PDF loaded</p>
              <p className="text-sm text-center max-w-md">
                Waiting for PDF URL to be provided...
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const handlePdfLoadError = () => {
    console.error('PDF failed to load');
    setPdfLoadError(true);
  };

  const handleLoadDifferentPaper = () => {
    const newPdfUrl = prompt('Enter PDF URL:');
    if (newPdfUrl) {
      setPdfLoadError(false);
      setCurrentPdf(newPdfUrl);
      setCurrentPage(1);
      setTotalPages(0);
      clearCitationHighlight();
      
      const botMessage = {
        id: Date.now(),
        role: 'bot',
        text: `PDF loaded successfully! You can now ask questions about this paper.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    }
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Markdown styling components
  const markdownComponents = {
    h1: ({node, ...props}) => <h1 className="text-2xl font-bold mt-4 mb-2 text-white" {...props} />,
    h2: ({node, ...props}) => <h2 className="text-xl font-bold mt-3 mb-2 text-white" {...props} />,
    h3: ({node, ...props}) => <h3 className="text-lg font-bold mt-2 mb-1 text-white" {...props} />,
    p: ({node, ...props}) => <p className="mb-2 text-gray-200 leading-relaxed" {...props} />,
    ul: ({node, ...props}) => <ul className="list-disc list-inside mb-2 ml-4 text-gray-200" {...props} />,
    ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-2 ml-4 text-gray-200" {...props} />,
    li: ({node, ...props}) => <li className="mb-1 text-gray-200" {...props} />,
    strong: ({node, ...props}) => <strong className="font-bold text-white" {...props} />,
    em: ({node, ...props}) => <em className="italic text-gray-300" {...props} />,
    code: ({node, inline, ...props}) => 
      inline 
        ? <code className="bg-neutral-600 px-1 rounded text-sm text-orange-300" {...props} />
        : <code className="block bg-neutral-600 p-2 rounded my-2 text-sm text-orange-300 overflow-x-auto" {...props} />,
    blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-[var(--color-orange)] pl-4 my-2 italic text-gray-300" {...props} />,
  };

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
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* Chatbot Panel */}
        <div className="bg-neutral-800 border border-neutral-700 rounded-xl shadow-2xl flex flex-col h-[85vh]">
          <div className="border-b border-neutral-700 px-6 py-4 flex justify-between items-center bg-neutral-900/50">
            <div className="flex gap-3 items-center w-full">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-[var(--color-orange)] p-2 flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-orange-500 rounded-full border-2 border-neutral-800 flex items-center justify-center">
                  <Sparkles className="w-2 h-2 text-white" />
                </div>
              </div>
              <div className='flex justify-between w-full'>
                <div>
                <h2 className="text-xl font-bold text-white font-bungee">Research Assistant</h2>
                <p className="text-sm text-neutral-400">Ask anything about the paper</p>
                </div>
                <div>
                  <button 
                    onClick={handleGenerateReport}
                    className='bg-[var(--color-orange)] font-bungee text-white px-5 py-2 rounded-xl shadow-lg hover:scale-102 transition cursor-pointer flex items-center gap-2'
                  >
                    <FileText className="w-4 h-4" />
                    Generate Report
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Chat Messages */}
          <div 
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar"
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
                      <ReactMarkdown components={markdownComponents}>
                        {message.text}
                      </ReactMarkdown>
                      
                      {message.citations && message.citations.length > 0 && (
                        <CitationButtons 
                          citations={message.citations} 
                          onCitationClick={handleCitationClick}
                        />
                      )}
                    </div>
                    {message.metadata && (
                      <div className="text-xs text-neutral-400 mt-2">
                        Retrieved {message.metadata.chunks_retrieved} chunks, cited {message.metadata.chunks_cited} sources
                        {message.metadata.avg_similarity && ` • Avg similarity: ${message.metadata.avg_similarity}%`}
                      </div>
                    )}
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
                placeholder="Ask about the paper content, methodology, or findings..."
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
          <div className="border-b border-neutral-700 px-6 py-4 bg-neutral-900/50 flex justify-between items-center">
            <h2 className="text-xl font-bold text-white font-bungee">Paper Viewer</h2>
            <div className="flex items-center gap-4">
              {currentPdf && (
                <div className="text-sm text-neutral-400 truncate max-w-md">
                  {currentPdf}
                </div>
              )}
              {currentPage > 0 && (
                <div className="text-sm text-[var(--color-orange)] font-medium">
                  Page: {currentPage}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex-1 overflow-hidden">
            {renderPDFViewer()}
          </div>
        </div>
      </div>

      {/* Citations Sidebar */}
      {citations.length > 0 && (
        <div className="mt-6 bg-neutral-800 border border-neutral-700 rounded-xl p-4">
          <h3 className="text-lg font-bold text-white mb-3">All Citations</h3>
          <div className="space-y-3 max-h-40 overflow-y-auto">
            {citations.map((citation) => (
              <div
                key={citation.citation_number}
                className={`bg-neutral-700 p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                  activeCitation?.citation_number === citation.citation_number
                    ? 'bg-yellow-500/20 border-2 border-yellow-400 shadow-lg'
                    : 'hover:bg-neutral-600 border border-transparent'
                }`}
                onClick={() => handleCitationClick(citation)}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={`font-bold ${
                    activeCitation?.citation_number === citation.citation_number
                      ? 'text-yellow-400'
                      : 'text-blue-400'
                  }`}>
                    [{citation.citation_number}]
                  </span>
                  <span className="text-neutral-400 text-sm">Page {citation.page}</span>
                </div>
                <p className="text-sm text-neutral-300 line-clamp-2 mb-2">
                  {citation.text_preview}
                </p>
                <div className="text-xs text-neutral-500">
                  Similarity: {citation.similarity}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {showReportModal && (
        <div className="fixed inset-0 z-[9999]">
          {/* Background overlay - prevents interaction while loading */}
          <div 
            className={`fixed inset-0 bg-black/80 backdrop-blur-sm transition-all duration-300 ${reportLoading ? 'cursor-not-allowed' : ''}`}
            onClick={handleCloseModal}
          />
          
          {/* Modal container */}
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              {/* Modal content */}
              <div 
                className="relative bg-neutral-800 border border-neutral-700 rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="border-b border-neutral-700 px-6 py-4 flex justify-between items-center bg-neutral-900/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[var(--color-orange)] p-2 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white font-bungee">Research Report</h2>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${reportData?.status === 'success' ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`}></div>
                        <p className="text-sm text-neutral-400">
                          {reportData ? `arXiv: ${reportData.arxiv_id}` : 'Generating from Paper...'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {reportData && !reportLoading && (
                      <>
                        {/* Tool Buttons */}
                        <button
                          onClick={handleSaveReport}
                          className="flex items-center gap-2 font-bungee bg-neutral-700 hover:bg-neutral-600 text-white px-4 py-2 rounded-lg transition-all hover:scale-105 active:scale-95"
                          disabled={reportLoading}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                          </svg>
                          Save
                        </button>
                        
                        {/*<button
                          onClick={handleDownloadReport}
                          className="flex items-center gap-2 bg-[var(--color-orange)] hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-all hover:scale-105 active:scale-95"
                          disabled={reportLoading}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Download
                        </button>*/}
                      </>
                    )}
                    
                    <button
                      onClick={handleCloseModal}
                      className="p-2 hover:bg-neutral-700 rounded-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={reportLoading}
                    >
                      <X className="w-5 h-5 text-neutral-400" />
                    </button>
                  </div>
                </div>
      
                {/* Loading State */}
                {reportLoading && (
                  <div className="flex-1 flex flex-col items-center justify-center p-12">
                    <div className="relative mb-8">
                      <div className="w-24 h-24 border-4 border-neutral-700 rounded-full"></div>
                      <div className="absolute top-0 left-0 w-24 h-24 border-4 border-t-[var(--color-orange)] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <FileText className="w-8 h-8 text-[var(--color-orange)] animate-pulse" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">Generating Smart Report</h3>
                    <p className="text-neutral-400 text-center mb-6 max-w-md">
                      Analyzing paper content, extracting key insights, and generating comprehensive report...
                    </p>
                    <div className="w-full max-w-md bg-neutral-700 rounded-full h-2 mb-4">
                      <div className="bg-[var(--color-orange)] h-2 rounded-full animate-pulse w-3/4"></div>
                    </div>
                    <div className="text-sm text-neutral-500">
                      Please wait, this may take a moment...
                    </div>
                    <div className="mt-8 text-xs text-neutral-600">
                      The report generation is in progress. You cannot close this window until it's complete.
                    </div>
                  </div>
                )}
      
                {/* Report Content */}
                {!reportLoading && reportData && (
                  <div className="flex-1 overflow-y-auto">
                    <div className="p-6">
                      {/* Report Metadata Summary */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-neutral-700/50 border border-neutral-600 rounded-xl p-4">
                          <div className="text-xs text-neutral-400 mb-1">Reading Time</div>
                          <div className="text-lg font-bold text-white">
                            {reportData.metadata?.reading_time_minutes || '--'} min
                          </div>
                        </div>
                        
                        <div className="bg-neutral-700/50 border border-neutral-600 rounded-xl p-4">
                          <div className="text-xs text-neutral-400 mb-1">Pages</div>
                          <div className="text-lg font-bold text-white">
                            {reportData.metadata?.page_count || '--'}
                          </div>
                        </div>
                        
                        <div className="bg-neutral-700/50 border border-neutral-600 rounded-xl p-4">
                          <div className="text-xs text-neutral-400 mb-1">Chunks Analyzed</div>
                          <div className="text-lg font-bold text-white">
                            {reportData.metadata?.chunks_analyzed || '--'}
                          </div>
                        </div>
                        
                        <div className="bg-neutral-700/50 border border-neutral-600 rounded-xl p-4">
                          <div className="text-xs text-neutral-400 mb-1">Generated</div>
                          <div className="text-lg font-bold text-white">
                            {new Date(reportData.timestamp).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
      
                      {/* Main Report Content */}
                      <div className="bg-neutral-900/50 border border-neutral-700 rounded-xl p-6">
                        <div className="prose prose-invert max-w-none">
                          {renderReportContent()}
                        </div>
                      </div>
      
                      {/* Additional Metadata */}
                      {reportData.metadata && (
                        <div className="mt-6 grid grid-cols-2 md:grid-cols-2 gap-4">
                          <div className="bg-neutral-700/30 border border-neutral-600 rounded-lg p-3">
                            <div className="text-xs text-neutral-400 mb-1">Sections Generated</div>
                            <div className="text-sm font-bold text-white">{reportData.metadata.sections_generated}</div>
                          </div>
                          
                          
                          <div className="bg-neutral-700/30 border border-neutral-600 rounded-lg p-3">
                            <div className="text-xs text-neutral-400 mb-1">Citations Found</div>
                            <div className="text-sm font-bold text-white">{reportData.metadata.citations_found}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
      
                {/* Error State */}
                {!reportLoading && !reportData && reportContent && reportContent.includes('Error') && (
                  <div className="flex-1 flex flex-col items-center justify-center p-12">
                    <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
                      <X className="w-8 h-8 text-red-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">Report Generation Failed</h3>
                    <p className="text-neutral-400 text-center mb-6 max-w-md">
                      {reportContent}
                    </p>
                    <button
                      onClick={handleGenerateReport}
                      className="px-4 py-2 bg-[var(--color-orange)] hover:bg-orange-600 text-white rounded-lg transition-all font-medium"
                    >
                      Try Again
                    </button>
                  </div>
                )}
      
                {/* Modal Footer */}
                {reportData && !reportLoading && (
                  <div className="border-t border-neutral-700 px-6 py-4 bg-neutral-900/30">
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-neutral-400">
                        {reportData.metadata?.chunks_analyzed ? `${reportData.metadata.chunks_analyzed} excerpts analyzed` : 'Smart Report generated'}
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={handleCloseModal}
                          className="px-4 py-2 text-neutral-300 font-bungee hover:text-white bg-neutral-700 rounded-lg transition-all hover:scale-105 active:scale-95"
                        >
                          Close
                        </button>
                        <button
                          onClick={handleDownloadReport}
                          className="px-4 py-2 bg-[var(--color-orange)] font-bungee hover:scale-102 text-white rounded-lg transition-all font-medium hover:scale-105 active:scale-95"
                        >
                          Download Report
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}    
    </div>
    
  );
}