import React, { useState } from "react";
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
};

export default function KeywordPromptInput({
  initialKeywords = [],
  initialFilters = {},
  onChange,
  placeholder = "Add your research query here..."
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

  const previewPrompt =
    keywords.length > 0
      ? `Search for research papers on: ${keywords.join(", ")}`
      : "Start typing to add keywords...";

  return (
    <div className="w-full flex flex-col items-center justify-center min-h-[70vh]">
      <div className="w-full max-w-4xl mx-auto bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-xl text-white">
        <div className="w-full">
          <div className="flex items-center justify-between gap-2">
          {/* Input Area */}
          <div className="w-full flex flex-wrap gap-2 items-center px-3 py-3 rounded-xl bg-neutral-800 border border-white/10">
            {keywords.map((k, i) => (
              <span
                key={i}
                className="flex items-center gap-2 bg-[var(--color-orange)] px-3 py-1 font-bold rounded-full text-md text-white"
              >
                <Tag className="w-4 h-4 opacity-80" /> {k}
                <button onClick={() => removeKeyword(i)}>
                  <X className="w-5 h-5 hover:text-gray-300 cursor-pointer" />
                </button>
              </span>
            ))}

            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addKeyword()}
              className="flex-1 bg-transparent outline-none text-sm text-white placeholder-white/40"
              placeholder={placeholder}
            />
          </div>

          {/* Suggestions */}
          {input && (
            <div className="mt-3 flex gap-2 flex-wrap">
              {suggestions
                .filter((s) => s.toLowerCase().includes(input.toLowerCase()))
                .map((s, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setInput(s);
                      addKeyword();
                    }}
                    className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-sm text-white/80"
                  >
                    {s}
                  </button>
                ))}
            </div>
          )}
          <button
            onClick={addKeyword}
            className="text-neutral-800 px-4 py-3 font-bungee bg-[var(--color-light)] hover:bg-neutral-900 hover:text-white font-bold rounded-lg text-sm flex gap-1 items-center cursor-pointer"
          >
            <SendHorizonal className="w-5 h-5" /> Send

          </button>
          </div>
          <div className="flex pt-3 px-2 gap-2">
          <button
            onClick={addKeyword}
            className="text-white px-3 py-1 font-bungee bg-[var(--color-orange)] hover:bg-white hover:text-gray-800 font-bold rounded-lg text-sm flex gap-1 items-center cursor-pointer"
          >
            <Plus className="w-5 h-5" /> Add
          </button>
          <button
            onClick={addKeyword}
            className="text-white px-3 py-1 font-bungee bg-[var(--color-orange)] hover:bg-white hover:text-gray-800 font-bold rounded-lg text-sm flex gap-1 items-center cursor-pointer"
          >
            <X className="w-5 h-5" /> Reset
          </button>
          </div>
          
          {/* Preview Section */}
          <div className="mt-4 bg-black/30 border border-white/10 rounded-lg p-3 text-sm text-white/80">
            <h3 className="font-medium mb-2 flex items-center gap-2">
              <Search className="w-4 h-4" /> Preview Query
            </h3>
            <p className="text-white/70">{previewPrompt}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
