import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MessageSquare, Bookmark, Plus, Download, ExternalLink, Quote } from "lucide-react";

type PaperViewTopBarProps = {
  isChatOpen: boolean;
  setIsChatOpen: (isOpen: boolean) => void;
};


export default function PaperViewTopBar({ isChatOpen, setIsChatOpen }: PaperViewTopBarProps) {
  
    const navigate = useNavigate();
  
    return (
      <div className="mt-2 max-w-[90%] w-full flex justify-between items-center py-4 px-8 backdrop-blur-md bg-white/10 border border-white/10 shadow-lg sticky top-0 z-50 rounded-2xl">
        <button className="flex items-center gap-2 text-sm hover:text-[var(--color-orange)] transition font-bungee cursor-pointer"
        onClick={() => navigate(-1)}>
          <ArrowLeft size={20} /> Back
        </button>
        <div className="flex items-center gap-3 font-bungee">
          {!isChatOpen ? (
            <button className="flex items-center gap-2 py-2 px-4 rounded-xl bg-[var(--color-orange)] hover:bg-[var(--color-light)] hover:text-[var(--color-gray)] shadow-lg hover:scale-105 transition active:scale-95 cursor-pointer"
            onClick={() => setIsChatOpen(true)}>
              <MessageSquare size={20} /> Chat with Paper
            </button>
          ) : (
            <button className="flex items-center gap-2 py-2 px-4 rounded-xl bg-[var(--color-orange)] hover:bg-[var(--color-light)] hover:text-[var(--color-gray)] shadow-lg hover:scale-105 transition active:scale-95 cursor-pointer"
            onClick={() => setIsChatOpen(false)}>
              <MessageSquare size={20} /> Close X
            </button>
          )}
          <button className="flex items-center gap-2 py-2 px-4 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-sm transition cursor-pointer">
            <Bookmark size={20} /> Save
          </button>
          <button className="flex items-center gap-2 py-2 px-4 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-sm transition cursor-pointer">
            <Plus size={20} /> Add
          </button>
        </div>
      </div>
    );
}