import { Hand } from "lucide-react";
import { type Paper } from "../../lib/types";
import { useNavigate } from "react-router-dom";

type PaperCardProps = {
  paper: Paper;
  isMyCollection?: boolean;
  isSynthesizeOpen?: boolean;
  isSelected?: boolean;
};

export default function PaperCard({
  paper,
  isMyCollection = false,
  isSynthesizeOpen = false,
  isSelected = false,
}: PaperCardProps) {
  const navigate = useNavigate();

  const handleCardClick = () => {
    if (!isSynthesizeOpen) navigate(`/smart-search/${paper.id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className={`group border border-neutral-700/60 transition-all w-full duration-300 rounded-2xl p-6 shadow-lg hover:shadow-[var(--color-orange)] ${
        isSelected ? "bg-neutral-900/80 hover:ring-1 hover:scale-101" : "bg-neutral-900/50"
      }`}
    >
      {/* Title */}
      <h2 className="text-xl font-semibold text-[var(--color-light)] group-hover:text-[var(--color-orange)] transition line-clamp-2 mb-2">
        {paper.title}
      </h2>

      {/* Authors */}
      <p className="text-sm text-neutral-400 mb-3 italic">
        {paper.authors.join(", ")}
      </p>

      {/* Abstract */}
      <p className="text-sm text-neutral-300 mb-4 leading-relaxed line-clamp-3">
        {paper.abstract}
      </p>

      {/* Info Tags */}
      <div className="flex flex-wrap gap-3 text-xs text-neutral-400 mb-5">
        <span className="border border-neutral-600 px-3 py-1 rounded-lg bg-neutral-800">
          📂 {paper.type}
        </span>
        <span className="border border-neutral-600 px-3 py-1 rounded-lg bg-neutral-800">
          🔓 {paper.access}
        </span>
        <span className="border border-neutral-600 px-3 py-1 rounded-lg bg-neutral-800">
          DOI: {paper.doi}
        </span>
      </div>

      {/* Keywords */}
      <div className="flex flex-wrap gap-2 mb-6">
        {paper.keywords.slice(0, 6).map((keyword, index) => (
          <span
            key={index}
            className="text-xs px-3 py-1 rounded-full bg-neutral-800 border border-neutral-700 text-neutral-300 hover:border-[var(--color-orange)] transition"
          >
            #{keyword}
          </span>
        ))}
      </div>

      {/* Footer hidden in synthesize mode */}
      {!isSynthesizeOpen && (
        <div className="flex items-center justify-between">
          <div className="text-xs text-neutral-500">
            <span>📅 {paper.year}</span> • <span>📚 {paper.noOfCitations} citations</span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate(`/smart-search/${paper.id}`)}
              className="text-sm px-4 py-2 font-bungee rounded-lg bg-[var(--color-orange)] text-[var(--color-light)] hover:bg-orange-500/70 transition shadow-md cursor-pointer"
            >
              View →
            </button>
            {isMyCollection ? (
              <button
                onClick={() => navigate(`/smart-search/${paper.id}`)}
                className="text-sm px-4 py-2 font-bungee rounded-lg bg-[var(--color-light)] text-[var(--color-gray)] hover:bg-neutral-300 transition shadow-md cursor-pointer"
              >
                Remove →
              </button>
            ) : (
              <a
                href={paper.pdfUrl}
                target="_blank"
                className="text-sm px-4 py-2 rounded-lg font-bungee bg-[var(--color-light)] text-[var(--color-gray)] hover:bg-[var(--color-orange)] hover:text-neutral-900 transition cursor-pointer"
              >
                Save
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
