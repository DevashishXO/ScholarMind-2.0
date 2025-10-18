import { type Paper } from "../../lib/types";

export default function PaperCard({ paper }: { paper: Paper }) {
  return (
    <div className="group bg-neutral-900/40 backdrop-blur-xl border border-neutral-700/60 hover:border-[var(--color-orange)]/80 transition-all duration-300 rounded-2xl p-6 shadow-[0_8px_20px_rgba(0,0,0,0.35)] hover:-translate-y-1">
      
      {/* Title */}
      <h2 className="text-xl font-semibold text-[var(--color-light)] mb-2 group-hover:text-[var(--color-orange)] transition line-clamp-2">
        {paper.title}
      </h2>

      {/* Authors */}
      <p className="text-sm text-neutral-400 mb-4 italic">
        {paper.authors.join(", ")}
      </p>

      {/* Abstract */}
      <p className="text-sm text-neutral-300 mb-4 leading-relaxed line-clamp-3">
        {paper.abstract}
      </p>

      {/* Keywords */}
      <div className="flex flex-wrap gap-2 mb-5">
        {paper.keywords.slice(0, 5).map((keyword, index) => (
          <span
            key={index}
            className="text-xs px-3 py-1 rounded-full bg-neutral-800 border border-neutral-700 text-neutral-300 hover:border-[var(--color-orange)] transition"
          >
            #{keyword}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center">
        {/* Meta */}
        <div className="text-xs text-neutral-500">
          <span className="mr-2">📚 {paper.noOfCitations} cites</span> •{" "}
          <span className="ml-2">📅 {paper.year}</span>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <a
            href={paper.url}
            target="_blank"
            className="text-sm px-4 py-2 rounded-lg bg-[var(--color-orange)] text-neutral-900 hover:bg-orange-500 font-medium transition shadow-md"
          >
            View →
          </a>
          <a
            href={paper.pdfUrl}
            target="_blank"
            className="text-sm px-4 py-2 border rounded-lg border-neutral-600 hover:border-[var(--color-orange)] text-[var(--color-light)] transition"
          >
            PDF ⬇
          </a>
        </div>
      </div>
    </div>
  );
}
