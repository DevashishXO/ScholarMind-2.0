import React, { useEffect, useRef, useState } from "react";
import { Tag, Search, X, Plus, SendHorizonal } from "lucide-react";

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
  const [filters] = useState<Filters>(initialFilters);

  const suggestions = [
    "deep learning",
    "NLP",
    "transformer",
    "graph neural networks",
    "reinforcement learning",
    "federated learning"
  ];

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

  const previewPrompt =
    keywords.length > 0
      ? `Search for research papers on: ${keywords.join(", ")}`
      : "Start typing to add keywords...";

  return (
    <div className="w-full flex flex-col items-center justify-center ">
      <div className="w-full max-w-4xl mx-auto bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-xl text-white">
        <div className="w-full space-y-4">
          {/* Input Area */}
          <div className="flex items-center gap-3">
            <div className="flex flex-wrap gap-2 items-center px-3 py-3 rounded-xl bg-neutral-800 border border-white/30 w-full  transition-all">
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
              onClick={() => {
                setLoading?.(true);
              }}
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