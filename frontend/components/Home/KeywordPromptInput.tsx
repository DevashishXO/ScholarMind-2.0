import React, { useState, useEffect } from "react";
import { Tag, Search, X, Plus, SendHorizonal, Filter, User, Calendar, Hash, FileText } from "lucide-react";

type Filters = {
  keywords: string[];
  title: string;
  authors: string[];
  year?: number | null;
  arxiv_id: string;
  results_per_page: number;
  page: number;
};

type Props = {
  initialFilters?: Partial<Filters>;
  onChange?: (payload: Filters) => void;
  placeholder?: string;
  loading?: boolean;
  setLoading?: (loading: boolean) => void;
};

export default function ResearchSearchInput({
  initialFilters = {},
  onChange,
  placeholder = "Describe your research query...",
  loading,
  setLoading
}: Props) {
  // Main input state
  const [input, setInput] = useState("");
  const [keywords, setKeywords] = useState<string[]>(initialFilters.keywords || []);
  
  // Current active filters
  const [filters, setFilters] = useState<Filters>({
    keywords: initialFilters.keywords || [],
    title: initialFilters.title || "",
    authors: initialFilters.authors || [],
    year: initialFilters.year || null,
    arxiv_id: initialFilters.arxiv_id || "",
    results_per_page: initialFilters.results_per_page || 20,
    page: initialFilters.page || 1,
  });

  // Temporary filters for the modal
  const [tempFilters, setTempFilters] = useState<Filters>({ ...filters });
  const [showFilters, setShowFilters] = useState(false);

  // Input states for multi-value fields in modal
  const [tempKeywordInput, setTempKeywordInput] = useState("");
  const [tempAuthorInput, setTempAuthorInput] = useState("");

  const suggestions = [
    "transformer architecture",
    "attention mechanism", 
    "neural networks",
    "deep learning",
    "computer vision",
    "natural language processing"
  ];

  // Sync tempFilters when filters change
  useEffect(() => {
    setTempFilters({ ...filters });
  }, [filters]);

  // --- Main Input Functions ---
  const addKeyword = () => {
    const trimmed = input.trim();
    if (!trimmed || keywords.includes(trimmed)) return;
    const newKeywords = [...keywords, trimmed];
    setKeywords(newKeywords);
    // Only update local filters, don't call onChange
    setFilters(prev => ({ ...prev, keywords: newKeywords }));
    setInput("");
  };

  const removeKeyword = (idx: number) => {
    const newKeywords = keywords.filter((_, i) => i !== idx);
    setKeywords(newKeywords);
    // Only update local filters, don't call onChange
    setFilters(prev => ({ ...prev, keywords: newKeywords }));
  };

  const resetKeywords = () => {
    setKeywords([]);
    setInput("");
    // Only update local filters, don't call onChange
    setFilters(prev => ({ ...prev, keywords: [] }));
  };

  // --- Filter Management ---
  const updateFilters = (newFilters: Filters) => {
    setFilters(newFilters);
    // Don't call onChange here - only call it when user explicitly clicks Search
  };

  const applyAllFilters = () => {
    // Only update local state, don't trigger search
    setFilters(tempFilters);
    setKeywords(tempFilters.keywords);
    setShowFilters(false);
  };

  const resetAll = () => {
    const resetFilters = {
      keywords: [],
      title: "",
      authors: [],
      year: null,
      arxiv_id: "",
      results_per_page: 20,
      page: 1
    };
    setKeywords([]);
    setInput("");
    setFilters(resetFilters);
    setTempFilters(resetFilters);
    setTempKeywordInput("");
    setTempAuthorInput("");
    // Don't call onChange on reset
  };

  // --- Multi-value handlers for temp filters ---
  const addTempKeyword = () => {
    const trimmed = tempKeywordInput.trim();
    if (!trimmed || tempFilters.keywords.includes(trimmed)) return;
    const newKeywords = [...tempFilters.keywords, trimmed];
    setTempFilters({ ...tempFilters, keywords: newKeywords });
    setTempKeywordInput("");
  };

  const removeTempKeyword = (idx: number) => {
    const newKeywords = tempFilters.keywords.filter((_, i) => i !== idx);
    setTempFilters({ ...tempFilters, keywords: newKeywords });
  };

  const addTempAuthor = () => {
    const trimmed = tempAuthorInput.trim();
    if (!trimmed || tempFilters.authors.includes(trimmed)) return;
    const newAuthors = [...tempFilters.authors, trimmed];
    setTempFilters({ ...tempFilters, authors: newAuthors });
    setTempAuthorInput("");
  };

  const removeTempAuthor = (idx: number) => {
    const newAuthors = tempFilters.authors.filter((_, i) => i !== idx);
    setTempFilters({ ...tempFilters, authors: newAuthors });
  };

  const submitSearch = () => {
    setLoading?.(true);
    // Only call onChange when user explicitly clicks Search
    onChange?.(filters);
  };

  // --- Preview Generation ---
  const generatePreview = () => {
    const parts = [];
    
    if (filters.keywords.length > 0) {
      parts.push(`Keywords: ${filters.keywords.join(", ")}`);
    }
    if (filters.title) {
      parts.push(`Title: "${filters.title}"`);
    }
    if (filters.authors.length > 0) {
      parts.push(`Authors: ${filters.authors.join(", ")}`);
    }
    if (filters.year) {
      parts.push(`Year: ${filters.year}`);
    }
    if (filters.arxiv_id) {
      parts.push(`arXiv ID: ${filters.arxiv_id}`);
    }

    return parts.length > 0 
      ? `Searching for papers with: ${parts.join(" | ")}`
      : "Start typing to add keywords or open filters for advanced search...";
  };

  return (
    <div className="w-full flex flex-col items-center justify-center">
      <div className="w-full max-w-4xl mx-auto bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-xl text-white">
        <div className="w-full space-y-4">
          {/* Main Input Area */}
          <div className="flex items-center gap-3">
            <div className="flex flex-wrap gap-2 items-center px-3 py-3 rounded-xl bg-neutral-800 border border-white/30 w-full transition-all min-h-[60px]">
              {keywords.map((k, i) => (
                <span
                  key={i}
                  className="flex items-center gap-2 bg-[var(--color-orange)] px-3 py-1 font-bold rounded-full text-sm text-white shadow"
                >
                  <Tag className="w-4 h-4 opacity-80" /> {k}
                  <button 
                    onClick={() => removeKeyword(i)} 
                    className="hover:scale-110 transition"
                  >
                    <X className="w-4 h-4 hover:text-gray-300 cursor-pointer" />
                  </button>
                </span>
              ))}
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addKeyword()}
                className="flex-1 bg-transparent outline-none text-md text-white placeholder-white/40"
                placeholder={placeholder}
              />
            </div>
            <button
              onClick={submitSearch}
              disabled={loading}
              className="text-neutral-800 cursor-pointer px-4 py-3 font-bungee bg-[var(--color-light)] hover:opacity-90 rounded-lg text-sm flex gap-2 items-center shadow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <SendHorizonal className="w-5 h-5" /> Search
            </button>
          </div>

          {/* Suggestions */}
          {input && (
            <div className="flex gap-2 flex-wrap">
              {suggestions
                .filter((s) => s.toLowerCase().includes(input.toLowerCase()))
                .map((s, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(s)}
                    className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-sm text-white/90 transition"
                  >
                    {s}
                  </button>
                ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between gap-3">
            <div className="flex gap-3">
              <button
                onClick={addKeyword}
                className="text-white px-4 py-2 font-bungee bg-[var(--color-orange)] hover:bg-white hover:text-gray-800 rounded-lg text-sm flex gap-2 items-center shadow transition cursor-pointer"
              >
                <Plus className="w-5 h-5" /> Add Keyword
              </button>
              <button
                onClick={resetKeywords}
                className="text-white px-4 py-2 font-bungee bg-neutral-800 hover:bg-neutral-900 rounded-lg text-sm flex gap-2 items-center shadow transition cursor-pointer"
              >
                <X className="w-5 h-5" /> Reset
              </button>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="text-white px-4 py-2 font-bungee bg-neutral-800 hover:bg-neutral-900 rounded-lg text-sm flex gap-2 items-center shadow transition cursor-pointer"
            >
              <Filter className="w-5 h-5" /> Filters
            </button>
          </div>

          {/* Filters Modal */}
          {showFilters && (
            <div className="bg-neutral-900/70 border border-white/10 rounded-2xl p-5 text-sm text-white/80 shadow-lg backdrop-blur-md">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2 text-white">
                  <Filter className="w-4 h-4 text-[var(--color-orange)]" />
                  Advanced Search Filters
                </h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-white/60 hover:text-white/90 transition-colors"
                >
                  <X className="w-4 h-4 cursor-pointer" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Keywords in Filters */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-semibold text-white/90">
                    <Tag className="w-4 h-4 text-[var(--color-orange)]" />
                    Keywords
                  </label>
                  <div className="flex flex-wrap gap-2 items-center p-3 rounded-xl bg-neutral-800 border border-white/30 transition-all min-h-[60px]">
                    {tempFilters.keywords.map((keyword, i) => (
                      <span
                        key={i}
                        className="flex items-center gap-2 bg-[var(--color-orange)] px-3 py-1 font-bold rounded-full text-sm text-white shadow"
                      >
                        {keyword}
                        <button 
                          onClick={() => removeTempKeyword(i)} 
                          className="hover:scale-110 transition"
                        >
                          <X className="w-4 h-4 hover:text-gray-300 cursor-pointer" />
                        </button>
                      </span>
                    ))}
                    <input
                      value={tempKeywordInput}
                      onChange={(e) => setTempKeywordInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addTempKeyword()}
                      className="flex-1 bg-transparent outline-none text-sm text-white placeholder-white/40"
                      placeholder="Add keyword..."
                    />
                    <button
                      onClick={addTempKeyword}
                      className="text-white p-1 hover:bg-white/10 rounded transition cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Authors */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-semibold text-white/90">
                    <User className="w-4 h-4 text-[var(--color-orange)]" />
                    Authors
                  </label>
                  <div className="flex flex-wrap gap-2 items-center p-3 rounded-xl bg-neutral-800 border border-white/30 transition-all min-h-[60px]">
                    {tempFilters.authors.map((author, i) => (
                      <span
                        key={i}
                        className="flex items-center gap-2 bg-blue-500/80 px-3 py-1 font-bold rounded-full text-sm text-white shadow"
                      >
                        {author}
                        <button 
                          onClick={() => removeTempAuthor(i)} 
                          className="hover:scale-110 transition"
                        >
                          <X className="w-4 h-4 hover:text-gray-300 cursor-pointer" />
                        </button>
                      </span>
                    ))}
                    <input
                      value={tempAuthorInput}
                      onChange={(e) => setTempAuthorInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addTempAuthor()}
                      className="flex-1 bg-transparent outline-none text-sm text-white placeholder-white/40"
                      placeholder="Add author..."
                    />
                    <button
                      onClick={addTempAuthor}
                      className="text-white p-1 hover:bg-white/10 rounded transition cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Title, Year, arXiv ID */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-sm font-semibold text-white/90">
                      <FileText className="w-4 h-4 text-[var(--color-orange)]" />
                      Title
                    </label>
                    <input
                      type="text"
                      value={tempFilters.title}
                      onChange={(e) => setTempFilters({ ...tempFilters, title: e.target.value })}
                      className="w-full p-3 rounded-xl bg-neutral-800 border border-white/30 text-white placeholder-white/40 outline-none transition-all focus:border-[var(--color-orange)]"
                      placeholder="e.g., Attention Is All You Need"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-sm font-semibold text-white/90">
                      <Calendar className="w-4 h-4 text-[var(--color-orange)]" />
                      Year
                    </label>
                    <input
                      type="number"
                      value={tempFilters.year || ""}
                      onChange={(e) => setTempFilters({ 
                        ...tempFilters, 
                        year: e.target.value ? parseInt(e.target.value) : null 
                      })}
                      className="w-full p-3 rounded-xl bg-neutral-800 border border-white/30 text-white placeholder-white/40 outline-none transition-all focus:border-[var(--color-orange)]"
                      placeholder="e.g., 2017"
                      min="1990"
                      max="2030"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-sm font-semibold text-white/90">
                      <Hash className="w-4 h-4 text-[var(--color-orange)]" />
                      arXiv ID
                    </label>
                    <input
                      type="text"
                      value={tempFilters.arxiv_id}
                      onChange={(e) => setTempFilters({ ...tempFilters, arxiv_id: e.target.value })}
                      className="w-full p-3 rounded-xl bg-neutral-800 border border-white/30 text-white placeholder-white/40 outline-none transition-all focus:border-[var(--color-orange)]"
                      placeholder="e.g., 1706.03762"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-sm font-semibold text-white/90">
                      <Filter className="w-4 h-4 text-[var(--color-orange)]" />
                      Results per Page
                    </label>
                    <select
                      value={tempFilters.results_per_page}
                      onChange={(e) => setTempFilters({ ...tempFilters, results_per_page: parseInt(e.target.value) })}
                      className="w-full p-3 rounded-xl bg-neutral-800 border border-white/30 text-white outline-none transition-all focus:border-[var(--color-orange)]"
                    >
                      <option value={10}>10 results</option>
                      <option value={20}>20 results</option>
                      <option value={50}>50 results</option>
                      <option value={100}>100 results</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 mt-6 font-bungee">
                <button
                  onClick={() => setShowFilters(false)}
                  className="px-4 py-2 rounded-lg bg-neutral-600 hover:bg-neutral-700 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={resetAll}
                  className="px-4 py-2 rounded-lg bg-neutral-600 hover:bg-neutral-700 transition cursor-pointer"
                >
                  Reset All
                </button>
                <button
                  onClick={applyAllFilters}
                  className="px-4 py-2 rounded-lg bg-[var(--color-orange)] text-white font-semibold hover:opacity-90 transition cursor-pointer"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          )}

          {/* Preview Section */}
          <div className="bg-neutral-900/50 border border-white/10 rounded-lg p-4 text-sm text-white/80 shadow">
            <h3 className="font-medium mb-2 flex items-center gap-2">
              <Search className="w-4 h-4 text-[var(--color-orange)]" /> Search Preview
            </h3>
            <p className="text-white/70">{generatePreview()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}