import { type Paper } from '../../lib/types';
import PaperList from './PaperList';
import FilterPanel from "./FilterPanel"
import CollectionPapersHeader from './CollectionPapersHeader';

import { useState } from 'react';

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


export default function SmartSearch() {
  const [showFilters, setShowFilters] = useState(false);
 
  return (
    <main className="flex-1 p-8 text-[var(--color-light)] max-h-screen flex flex-col">
      {/* Header */}
      <CollectionPapersHeader label='Smart Search' showFilters={showFilters} setShowFilters={setShowFilters} isMyCollection={false} />
      
      {/*Filter Panel*/}
      {showFilters && <FilterPanel/>}

      {/* Search Bar */}
      <div className="flex flex-col md:flex-row items-center gap-3 flex-shrink-0">
        <input
          type="text"
          placeholder="Search scholarly articles, topics, or papers..."
          className="w-full md:flex-1 p-3 rounded-lg border border-neutral-700 bg-neutral-900 focus:outline-none focus:border-[var(--color-orange)] placeholder-[var(--color-light)]"
        />
        <button className="px-6 py-2 rounded-lg bg-[var(--color-orange)] text-[var(--color-light)] hover:bg-[var(--color-light)] hover:text-[var(--color-gray)] border border-transparent font-bungee transition">
          Search
        </button>
      </div>

      <div className='my-6 p-2'>
        
      <h2 className="text-xl font-bold">Search Results:</h2>
      </div>

      {/* Paper List with scroll */}
      <div className="flex-1 overflow-y-auto pr-2">
        <PaperList papers={samplePapers} />
      </div>
    </main>
  );
}
