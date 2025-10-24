import { type Paper } from '../../lib/types';
import PaperList from './PaperList';
import FilterPanel from "./FilterPanel"

import { useState } from 'react';
import SearchPapersHeader from './SearchPapersHeader';
import SearchBar from './SearchBar';

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

export default function CollectionPapers() {
  const [showFilters, setShowFilters] = useState(false);
  const [isSynthesizeOpen, setIsSynthesizeOpen] = useState(false);
  const [selectedPapers, setSelectedPapers] = useState<string[]>([]);
  
  const handleCancel = () => {
    if (setSelectedPapers) setSelectedPapers([]);
    setIsSynthesizeOpen?.(false);
  };

  const handleDone = () => {
    console.log("Selected papers:", selectedPapers ?? []);
    if (setSelectedPapers) setSelectedPapers([]);
    setIsSynthesizeOpen?.(false);
  };

 
  return (
    <main className="flex-1 p-8 text-[var(--color-light)] max-h-screen flex flex-col">
      {/* Header */}
      <SearchPapersHeader label='My-Collection' showFilters={showFilters} setShowFilters={setShowFilters} isMyCollection={true} isSynthesizeOpen={isSynthesizeOpen} setIsSynthesizeOpen={setIsSynthesizeOpen}/>
      
      {/*Filter Panel*/}
      {showFilters && <FilterPanel/>}

      {/* Search Bar */}
      <SearchBar/>

      <div className='flex items-center gap-2 my-6 p-2 '>
        <h2 className="text-xl font-bold text-[var(--color-light)]">Search Results:</h2>
        <p>{samplePapers.length} Research Papers found!</p>
      </div>
      
      {/* selection bar */}
      {isSynthesizeOpen && (
        <div className="flex justify-between items-center mb-4 p-4 bg-neutral-900 border border-neutral-700 rounded-lg shadow-md">
          <p className="text-lg text-neutral-300">
            Selected Papers: {selectedPapers?.length ?? 0} / {samplePapers.length}
          </p>
          <div className="flex gap-4">
            <button
              onClick={handleCancel}
              className="px-4 py-2 rounded-lg bg-[var(--color-light)] text-[var(--color-gray)] font-bungee hover:bg-neutral-400 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleDone}
              className="px-4 py-2 rounded-lg bg-[var(--color-orange)] text-[var(--color-light)] font-bungee hover:bg-orange-500/50 cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Paper List with scroll */}
      <div className="flex-1 overflow-y-auto pr-2">
        <PaperList papers={samplePapers} isMyCollection={true} isSynthesizeOpen={isSynthesizeOpen} setIsSynthesizeOpen={setIsSynthesizeOpen} selectedPapers={selectedPapers} setSelectedPapers={setSelectedPapers} />
      </div>
    </main>
  );
}
