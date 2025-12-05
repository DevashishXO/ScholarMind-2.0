import { useState } from 'react';
import TextType from "./TextType";
import KeywordPromptInput from "./KeywordPromptInput";
import { XIcon } from 'lucide-react';

import { type Paper } from "../../lib/types";
import PaperList from "./PaperList";
import { type Filters } from '../../lib/smart_search.types';

export const samplePapers: Paper[] = [
  // ... your existing sample papers
];

export default function NewSearch() {
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<Paper[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false); // Add this state

  const handleSearch = async (filters: Filters) => {
    try {
      setLoading(true);
      setSearchError(null);
      setHasSearched(true); // Mark that a search has been performed
      
      console.log('Sending search request with filters:', filters);
      
      const response = await fetch('http://localhost:8000/api/v1/smart-search/', {
        method: 'POST',
        credentials: "include",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(filters)
      });
      
      if (!response.ok) {
        throw new Error(`Search failed: ${response.status} ${response.statusText}`);
      }
      
      const results = await response.json();
      console.log('Search results:', results);
      
      const papers = results.results;
      
      // Add safety checks for the data transformation
      setSearchResults(papers.map(paper => ({
        paper_id: paper.arxiv_id || paper.id,
        id: paper.arxiv_id || paper.id,
        title: paper.title || 'Refer to the docs',
        authors: typeof paper.authors === 'string' 
          ? paper.authors.split(',').map(author => author.trim())
          : paper.authors || [],
        abstract: paper.abstract || '',
        year: paper.year || new Date().getFullYear(),
        url: paper.link || paper.url || '#refer to the docs',
        pdfUrl: paper.pdf_link?.replace('http://', 'https://') || paper.pdfUrl?.replace('http://', 'https://') || '#',
        matchtype: paper.match_type || paper.matchtype || 'unknown'
        
      })));
      
    } catch (error) {
      console.error('Search error:', error);
      setSearchError(error instanceof Error ? error.message : 'Search failed');
      setSearchResults(samplePapers); // Fallback to sample data
    } finally {
      setLoading(false);
    }
  };

  const handleNewSearch = () => {
    setHasSearched(false);
    setSearchResults([]);
    setSearchError(null);
  };

  return (
    <main className="flex-1 px-6 pt-8 text-[var(--color-light)] max-h-screen flex flex-col">
      {/* Header */}
      <HeaderSection 
        loading={loading} 
        hasSearched={hasSearched} 
        onNewSearch={handleNewSearch} 
      />
      
      <div className="flex-1 flex flex-col items-center rounded-2xl border border-white/10 bg-neutral-800/80 backdrop-blur-sm justify-center w-full mx-auto mb-6 overflow-auto">
        
        {/* Show loading spinner */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-orange)]"></div>
          </div>
        )}
        
        {/* Show search input when no search has been performed OR during new search */}
        {!hasSearched && !loading && (
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
            <div className="w-full max-w-4xl mx-auto">
              <KeywordPromptInput 
                onChange={handleSearch} 
                loading={loading} 
                setLoading={setLoading} 
              />
            </div>
          </div>
        )}
        
        {/* Show results when search is complete and we have results */}
        {hasSearched && !loading && (
          <div className="w-full h-full flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-[var(--color-light)]">Search Results</h2>
                <span className="px-3 py-1 bg-[var(--color-orange)]/20 text-[var(--color-orange)] rounded-full text-sm font-medium">
                  {searchResults.length} papers found
                </span>
              </div>
              {searchError && (
                <div className="px-4 py-2 bg-red-500/20 text-red-300 rounded-lg text-sm">
                  {searchError} (showing sample data)
                </div>
              )}
            </div>
            
            {/* Paper List with scroll */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <PaperList papers={searchResults} />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

// Updated HeaderSection
const HeaderSection = ({ 
  loading, 
  hasSearched, 
  onNewSearch 
}: { 
  loading: boolean; 
  hasSearched: boolean;
  onNewSearch: () => void;
}) => (
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
      
      {/* Show New Search button when we have results */}
      {hasSearched && !loading && (
        <button
          onClick={onNewSearch}
          className="flex items-center gap-3 bg-[var(--color-orange)] hover:scale[1.01] border border-white/10 backdrop-blur-sm px-6 py-3 rounded-lg hover:scale-[1.03] active:scale-95 transition-all duration-200 shadow-lg"
        >
          <XIcon size={20} />
          <span className="text-sm font-bungee">Close</span>
        </button>
      )}
    </div>
  </header>
);