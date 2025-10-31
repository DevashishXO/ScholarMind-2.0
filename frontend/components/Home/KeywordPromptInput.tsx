import React, { useState } from "react";
import { Tag, Search, X, Plus, SendHorizonal, Filter } from "lucide-react";

type Filters = {
  yearFrom?: number | null;
  yearTo?: number | null;
  venues?: string[];
  pdfOnly?: boolean;
  semantic?: boolean;
};

type Props = {
  initialKeywords?: string[];
  initialFilters?: Filters;
  onChange?: (payload: { prompt: string; keywords: string[]; filters: Filters }) => void;
  placeholder?: string;
  loading?: boolean;
  setLoading?: (loading: boolean) => void;
};

export default function KeywordPromptInput({
  initialKeywords = [],
  initialFilters = {},
  onChange,
  placeholder = "Add your research query here...",
  loading,
  setLoading
}: Props) {
  const [input, setInput] = useState("");
  const [keywords, setKeywords] = useState<string[]>(initialKeywords);
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [showFilters, setShowFilters] = useState(false);

  const [tempFilters, setTempFilters] = useState<Filters>(initialFilters); // used in modal before applying
  const availableJournals = ["Nature", "IEEE", "Springer", "Elsevier", "ACM", "arXiv"];

  const suggestions = [
    "deep learning",
    "NLP",
    "transformer",
    "graph neural networks",
    "reinforcement learning",
    "federated learning"
  ];

  // --- Keyword Functions ---
  function addKeyword() {
    const trimmed = input.trim();
    if (!trimmed || keywords.includes(trimmed)) return;
    const next = [...keywords, trimmed];
    setKeywords(next);
    onChange?.({ prompt: next.join(", "), keywords: next, filters });
    setInput("");
  }

  function removeKeyword(idx: number) {
    const next = keywords.filter((_, i) => i !== idx);
    setKeywords(next);
    onChange?.({ prompt: next.join(", "), keywords: next, filters });
  }

  function resetKeywords() {
    setKeywords([]);
    setInput("");
  }

  // --- Filters ---
  function toggleVenue(v: string) {
    setTempFilters((prev) => {
      const venues = prev.venues || [];
      return venues.includes(v)
        ? { ...prev, venues: venues.filter((j) => j !== v) }
        : { ...prev, venues: [...venues, v] };
    });
  }

  function applyFilters() {
    setFilters(tempFilters);
    onChange?.({ prompt: keywords.join(", "), keywords, filters: tempFilters });
    setShowFilters(false);
  }

  const previewPrompt =
    keywords.length > 0
      ? `Search for research papers on: ${keywords.join(", ")}`
      : "Start typing to add keywords...";

  // --- JSX ---
  return (
    <div className="w-full flex flex-col items-center justify-center">
      <div className="w-full max-w-4xl mx-auto bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-xl text-white">
        <div className="w-full space-y-4">
          {/* Input Area */}
          <div className="flex items-center gap-3">
            <div className="flex flex-wrap gap-2 items-center px-3 py-3 rounded-xl bg-neutral-800 border border-white/30 w-full transition-all">
              {keywords.map((k, i) => (
                <span
                  key={i}
                  className="flex items-center gap-2 bg-[var(--color-orange)] px-3 font-bold rounded-full text-md text-white shadow"
                >
                  <Tag className="w-4 h-4 opacity-80" /> {k}
                  <button onClick={() => removeKeyword(i)} className="hover:scale-110 transition">
                    <X className="w-5 h-5 hover:text-gray-300 cursor-pointer" />
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
              onClick={() => setLoading?.(true)}
              className="text-neutral-800 cursor-pointer px-4 py-3 font-bungee bg-[var(--color-light)] hover:opacity-90 rounded-lg text-sm flex gap-2 items-center shadow"
            >
              <SendHorizonal className="w-5 h-5" /> Send
            </button>
          </div>

          {/* Suggestions */}
          {input && (
            <div className="mt-2 flex gap-2 flex-wrap">
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

          {/* Buttons */}
          <div className="flex justify-between gap-3">
            <div className="flex gap-3">
              <button
                onClick={addKeyword}
                className="text-white px-4 py-2 font-bungee bg-[var(--color-orange)] hover:bg-white hover:text-gray-800 rounded-lg text-sm flex gap-2 items-center shadow transition cursor-pointer"
              >
                <Plus className="w-5 h-5" /> Add
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

          {/* Filters Section */}
          {showFilters && (
            <div className="bg-neutral-900/70 border border-white/10 rounded-2xl p-5 text-sm text-white/80 shadow-lg backdrop-blur-md">
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold flex items-center gap-2 text-white">
                  <Filter className="w-4 h-4 text-[var(--color-orange)]" />
                  Set Filters
                </h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-white/60 hover:text-white/90 transition-colors"
                >
                  <X className="w-4 h-4 cursor-pointer" />
                </button>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-xs text-white/60">Year From</label>
                  <input
                    type="number"
                    value={tempFilters.yearFrom ?? ""}
                    onChange={(e) =>
                      setTempFilters({ ...tempFilters, yearFrom: Number(e.target.value) || null })
                    }
                    placeholder="e.g. 2019"
                    className="w-full mt-1 bg-neutral-800 border border-white/20 rounded-lg px-3 py-2 text-white/90 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/60">Year To</label>
                  <input
                    type="number"
                    value={tempFilters.yearTo ?? ""}
                    onChange={(e) =>
                      setTempFilters({ ...tempFilters, yearTo: Number(e.target.value) || null })
                    }
                    placeholder="e.g. 2024"
                    className="w-full mt-1 bg-neutral-800 border border-white/20 rounded-lg px-3 py-2 text-white/90 outline-none"
                  />
                </div>
              </div>

              {/* Journal Multi-select */}
              <div className="mb-4">
                <label className="text-xs text-white/60 mb-1 block">Journal References</label>
                <div className="flex flex-wrap gap-2">
                  {availableJournals.map((j) => {
                    const selected = tempFilters.venues?.includes(j);
                    return (
                      <button
                        key={j}
                        onClick={() => toggleVenue(j)}
                        className={`px-3 py-1 rounded-lg text-xs border ${
                          selected
                            ? "bg-[var(--color-orange)] border-[var(--color-orange)] text-[var(--color-light)]"
                            : "bg-neutral-800 border-white/20 text-white/70 hover:bg-neutral-700"
                        } transition cursor-pointer`}
                      >
                        {j}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 mt-4 font-bungee">
                <button
                  onClick={() => setShowFilters(false)}
                  className="px-4 py-2 rounded-lg bg-neutral-600 hover:bg-neutral-700 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={applyFilters}
                  className="px-4 py-2 rounded-lg bg-[var(--color-orange)] text-white font-semibold hover:opacity-90 transition cursor-pointer"
                >
                  Apply
                </button>
              </div>
            </div>
          )}

          {/* Preview Section */}
          <div className="bg-neutral-900/50 border border-white/10 rounded-lg p-4 text-sm text-white/80 shadow">
            <h3 className="font-medium mb-2 flex items-center gap-2">
              <Search className="w-4 h-4 text-[var(--color-orange)]" /> Preview Query
            </h3>
            <p className="text-white/70">{previewPrompt}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
