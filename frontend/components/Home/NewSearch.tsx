import { useState } from 'react';
import TextType from "./TextType";
import KeywordPromptInput from "./KeywordPromptInput";
import { XIcon, PlusCircle } from 'lucide-react';

import { type Paper } from "../../lib/types";
import PaperList from "./PaperList";

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

export default function NewSearch() {
  const [loading, setLoading] = useState(false);

  return (
    <main className="flex-1 px-6 pt-8 text-[var(--color-light)] max-h-screen flex flex-col">
      {/* Header */}
      <HeaderSection loading={loading} setloading={setLoading} />
      
      <div className="flex-1 flex flex-col items-center rounded-2xl border border-white/10 bg-neutral-800/80 backdrop-blur-sm justify-center w-full mx-auto mb-6 overflow-auto">
        
        {!loading ? (
          <div className="w-full max-w-4xl mx-auto px-6 py-12">
            <div className="mb-12 py-4 text-center">
              <TextType
                text={[
                  "Let's find research that matters...",
                  "Be specific — define your topic clearly...",
                  "Mention domain, problem & goal...",
                  "Add context like datasets, time range, or authors...",
                  "Build a meaningful research query!",
                ]}
                typingSpeed={85}
                pauseDuration={1600}
                showCursor={true}
                cursorCharacter="|"
              />
            </div>
            <div className="w-full max-w-2xl mx-auto">
              <KeywordPromptInput loading={loading} setLoading={setLoading} />
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-[var(--color-light)]">Search Results</h2>
                <span className="px-3 py-1 bg-[var(--color-orange)]/20 text-[var(--color-orange)] rounded-full text-sm font-medium">
                  {samplePapers.length} papers found
                </span>
              </div>
            </div>
            
            {/* Paper List with scroll */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <PaperList papers={samplePapers} />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

const HeaderSection = ({loading, setloading}: {loading: boolean, setloading: React.Dispatch<React.SetStateAction<boolean>>}) => (
  <header className="mb-8 w-full">
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
      <div className="space-y-3">
        <h1 className="text-4xl font-extrabold text-[var(--color-orange)] tracking-tight font-bungee">
          Smart Search
        </h1>
        <p className="text-gray-400 max-w-xl leading-relaxed text-lg">
          Discover relevant research papers with AI-powered search. Find exactly what you need for your academic work.
        </p>
      </div>
      
      {loading && (
        <button
          onClick={() => setloading(false)}
          className="flex items-center gap-3 bg-[var(--color-orange)] hover:scale[1.01] border border-white/10 backdrop-blur-sm px-6 py-3 rounded-lg hover:scale-[1.03] active:scale-95 transition-all duration-200 shadow-lg"
        >
          <XIcon size={20} />
          <span className="text-sm font-bungee">{loading ? 'Close' : 'New Search'}</span>
        </button>
      )}
    </div>
  </header>
);