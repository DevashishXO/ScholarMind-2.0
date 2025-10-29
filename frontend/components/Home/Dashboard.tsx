import React, { useState } from "react";
import { PlusCircle, XIcon } from "lucide-react";
import { type Paper } from '../../lib/types';


import DashBoardMain from "./DashBoardMain";
import PaperList from './PaperList';
import SearchBar from './SearchBar';
import KeywordPromptInput from './KeywordPromptInput';

export const samplePapers: Paper[] = [
  {
    id: "PAPER-001",
    title: "Deep Learning for Natural Language Processing",
    authors: ["Andrew Ng", "Chris Manning"],
    abstract:
      "This paper explores deep learning applications in natural language processing, covering transformers, embeddings, and contextual language models.",
    type: "Journal",
    noOfCitations: 15230,
    year: 2019,
    keywords: ["Deep Learning", "NLP", "Transformers", "AI"],
    access: "Open Access",
    doi: "10.1001/dlnlp.2019.001",
    url: "https://example.com/nlp-paper",
    pdfUrl: "https://example.com/nlp-paper.pdf",
  },
  {
    id: "PAPER-002",
    title: "A Survey on Reinforcement Learning Techniques",
    authors: ["Richard Sutton", "David Silver"],
    abstract:
      "This survey presents a detailed overview of reinforcement learning approaches including model-free, model-based, and policy gradient methods.",
    type: "Conference",
    noOfCitations: 9800,
    year: 2020,
    keywords: ["Reinforcement Learning", "AI", "Policy Gradient", "Q-Learning"],
    access: "Restricted",
    doi: "10.1002/rlsurvey.2020.002",
    url: "https://example.com/rl-survey",
    pdfUrl: "https://example.com/rl-survey.pdf",
  },
  {
    id: "PAPER-003",
    title: "Graph Neural Networks: A Review of Methods and Applications",
    authors: ["Thomas Kipf", "Max Welling"],
    abstract:
      "Graph Neural Networks have gained attention for their ability to process graph-structured data. This paper discusses architectures and real-world applications.",
    type: "Review",
    noOfCitations: 7430,
    year: 2021,
    keywords: ["GNN", "Graph Theory", "Deep Learning", "AI"],
    access: "Open Access",
    doi: "10.1003/gnnreview.2021.003",
    url: "https://example.com/gnn-review",
    pdfUrl: "https://example.com/gnn-review.pdf",
  },
  {
    id: "PAPER-004",
    title: "Advancements in Quantum Machine Learning",
    authors: ["Scott Aaronson"],
    abstract:
      "Quantum machine learning is an emerging field combining quantum computing with machine learning to solve complex computational problems.",
    type: "Journal",
    noOfCitations: 4500,
    year: 2022,
    keywords: ["Quantum Computing", "Machine Learning", "QML"],
    access: "Paid",
    doi: "10.1004/qml.2022.004",
    url: "https://example.com/qml",
    pdfUrl: "https://example.com/qml.pdf",
  },
  {
    id: "PAPER-005",
    title: "Retrieval Augmented Generation (RAG) for Knowledge-Intensive NLP Tasks",
    authors: ["Patrick Lewis", "Yuxiang Wu"],
    abstract:
      "This paper introduces RAG, a hybrid approach combining retrieval and generation to improve factual consistency in NLP models.",
    type: "Conference",
    noOfCitations: 6120,
    year: 2023,
    keywords: ["RAG", "NLP", "LLM", "Knowledge Retrieval"],
    access: "Open Access",
    doi: "10.1005/rag.2023.005",
    url: "https://example.com/rag-paper",
    pdfUrl: "https://example.com/rag-paper.pdf",
  },
];


export default function Dashboard(): JSX.Element {
  
  const[newSearch, setNewSearch] = useState(false);

  return (
    <main className="flex-1 min-h-screen w-full text-[var(--color-light)] bg-[var(--color-gray)] overflow-y-auto">
      <div className="max-w-screen mx-auto px-6 py-10">
        {/* Header */}
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-4xl font-extrabold text-[var(--color-orange)] tracking-tight font-bungee">Dashboard</h1>
            <p className="text-gray-400 mt-2 max-w-xl">
              Welcome back — here’s your ScholarMind overview. Insights, activity and quick actions to help your research flow.
            </p>
          </div>
          {!newSearch ?(
            <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 bg-[var(--color-orange)] cursor-pointer border border-white/6 backdrop-blur-md px-4 py-2 rounded-lg hover:scale-[1.02] transition"
            onClick={() => setNewSearch(!newSearch)}>
              <PlusCircle size={18} className="text-[var(--color-white)]" />
              <span className="text-sm font-bungee">New Research</span>
            </button>
          </div>
          ): (
            <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 bg-[var(--color-light)] text-[var(--color-gray)] cursor-pointer border border-white/6 backdrop-blur-md px-4 py-2 rounded-lg hover:scale-[1.02] transition"
            onClick={() => setNewSearch(!newSearch)}>
              <XIcon size={18} className="text-[var(--color-gray)]" />
              <span className="text-sm font-bungee">Close</span>
            </button>
          </div>
          )}
          
        </header>
        
        {!newSearch ? <DashBoardMain /> :  (<div>
            <div className=" text-[var(--color-light)] max-h-screen flex flex-col">
              <KeywordPromptInput />
            </div>
        </div>
        )}
        
      </div>
    </main>
  );
}
