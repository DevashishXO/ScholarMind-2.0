// components/PublicationModal.tsx
import React, { useEffect, useState } from "react";
import { XIcon, ExternalLink, Copy } from "lucide-react";
import type { Publication } from "../lib/profile.types";

interface Props {
  open: boolean;
  publication: Publication | null;
  onClose: () => void;
}

export default function PublicationModal({ open, publication, onClose }: Props) {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const onChange = () => setIsMobile(mq.matches);
    onChange();
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open || !publication) return null;

  const copyCitation = async () => {
    const citation = `${publication.authors} (${publication.year}). ${publication.title}. ${publication.publisher ?? publication.venue ?? ""}${publication.doi ? ` doi:${publication.doi}` : ""}`;
    try {
      await navigator.clipboard.writeText(citation);
      // quick feedback - small toast would be nicer; here we use alert fallback minimally
      // avoid alert in production; replace with a toast system if available
      // eslint-disable-next-line no-alert
      alert("Citation copied to clipboard");
    } catch {
      // eslint-disable-next-line no-alert
      alert("Unable to copy citation");
    }
  };

  const openDoi = () => {
    if (publication.doi) window.open(`https://doi.org/${publication.doi}`, "_blank");
  };

  const openUrl = () => {
    if (publication.url) window.open(publication.url, "_blank");
  };

  const openPdf = () => {
    if (publication.oa_pdf_url) window.open(publication.oa_pdf_url, "_blank");
  };

  return (
    <div className="fixed inset-0 z-[9999]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      {/* Container */}
      <div
        className={
          isMobile
            ? "absolute bottom-0 left-0 right-0 bg-neutral-900 border-t border-white/10 rounded-t-2xl p-5 max-h-[85vh] overflow-auto animate-slideUp"
            : "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[72%] max-w-6xl max-h-[86vh] overflow-auto rounded-2xl bg-neutral-900 border border-white/10 p-8 shadow-2xl animate-fadeIn"
        }
        role="dialog"
        aria-modal="true"
      >
        <div className="flex justify-between items-start gap-4">
          <div>
            <h3 className="text-2xl md:text-3xl font-bold text-[var(--color-orange)] leading-tight">
              {publication.title}
            </h3>
            <p className="text-sm md:text-base text-gray-300 mt-2 italic">{publication.authors}</p>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            className="ml-4 p-2 rounded-md hover:bg-white/10"
          >
            <XIcon size={20} />
          </button>
        </div>

        {/* meta */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-300 mt-4">
          <div><span className="font-medium text-gray-200">Year:</span> {publication.year}</div>
          {publication.publisher && <div><span className="font-medium text-gray-200">Publisher:</span> {publication.publisher}</div>}
          <div><span className="font-medium text-gray-200">Citations:</span> {publication.citation_count ?? 0}</div>
        </div>

        {/* buttons */}
        <div className="flex flex-wrap items-center gap-3 mt-5">
          {publication.doi && (
            <button
              type="button"
              onClick={openDoi}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--color-orange)]/30 bg-[var(--color-orange)]/10 text-[var(--color-orange)] hover:bg-[var(--color-orange)]/20 transition"
            >
              <ExternalLink size={14} /> Open DOI
            </button>
          )}

          {publication.url && (
            <button
              type="button"
              onClick={openUrl}
              className="px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-sm hover:bg-white/10 transition"
            >
              Visit Page
            </button>
          )}

          {publication.oa_pdf_url && (
            <button
              type="button"
              onClick={openPdf}
              className="px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-sm hover:bg-white/10 transition"
            >
              Open PDF
            </button>
          )}

          <button
            onClick={copyCitation}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-sm hover:bg-white/10 transition"
          >
            <Copy size={14} /> Copy Citation
          </button>
        </div>

        {/* abstract */}
        {publication.abstract && (
          <div className="mt-6">
            <h4 className="text-lg font-semibold text-[var(--color-orange)]">Abstract</h4>
            <p className="mt-2 text-gray-300 leading-relaxed max-h-48 overflow-y-auto pr-2">
              {publication.abstract}
            </p>
          </div>
        )}

        {/* bibtex */}
        {publication.bibtex && (
          <div className="mt-6">
            <h4 className="text-lg font-semibold text-[var(--color-orange)]">BibTeX</h4>
            <pre className="mt-2 bg-black/30 border border-white/10 p-4 rounded-lg text-sm text-gray-100 overflow-x-auto whitespace-pre-wrap">
{publication.bibtex}
            </pre>
          </div>
        )}

        {/* footer small metadata */}
        <div className="mt-6 text-xs text-gray-400 flex flex-wrap gap-4">
          {publication.pages && <span>Pages: {publication.pages}</span>}
          {publication.doi && <span>DOI: {publication.doi}</span>}
          {publication.updated_at && <span>Updated: {String(publication.updated_at?.$date ?? "")}</span>}
        </div>
      </div>
    </div>
  );
}
