import { type Paper } from '../../lib/types';
import PaperList from './PaperList';
import FilterPanel from "./FilterPanel"

import { useEffect, useState } from 'react';
import SearchPapersHeader from './SearchPapersHeader';
import SearchBar from './SearchBar';
import { useParams } from 'react-router-dom';

export default function CollectionPapers() {
  const [showFilters, setShowFilters] = useState(false);
  const [isSynthesizeOpen, setIsSynthesizeOpen] = useState(false);
  const [selectedPapers, setSelectedPapers] = useState<string[]>([]);
  const { collection_id } = useParams(); // FIX: extract string ID
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(false);

  // FETCH SAVED PAPERS
  useEffect(() => {
    const fetchCollectionPapers = async () => {
      if (!collection_id) return;

      try {
        setLoading(true);

        const res = await fetch(
          `http://localhost:8000/api/v1/my-collection/${collection_id}`,
          { credentials: "include" }
        );

        const data = await res.json();
        console.log(data.saved_papers)

        if (data && data.saved_papers) {
          setPapers(data.saved_papers);
        } else {
          setPapers([]);
        }
      } catch (error) {
        console.error("Error fetching papers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCollectionPapers();
  }, [collection_id]);

  // ---------------------------
  // SYNTHESIS ACTIONS
  // ---------------------------
  const handleCancel = () => {
    setSelectedPapers([]);
    setIsSynthesizeOpen(false);
  };

  const handleDone = () => {
    console.log("Selected papers:", selectedPapers);
    setSelectedPapers([]);
    setIsSynthesizeOpen(false);
  };

  return (
    <main className="flex-1 p-8 text-[var(--color-light)] max-h-screen flex flex-col">
      
      {/* Header */}
      <SearchPapersHeader 
        label="My-Collection"
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        isMyCollection={true}
        isSynthesizeOpen={isSynthesizeOpen}
        setIsSynthesizeOpen={setIsSynthesizeOpen}
      />

      {/* Filter Panel */}
      {showFilters && <FilterPanel />}

      {/* Search Bar */}
      <SearchBar />

      {/* Stats */}
      <div className='flex items-center gap-2 my-6 p-2 '>
        <h2 className="text-xl font-bold text-[var(--color-light)]">Search Results:</h2>
        <p>{papers.length} Research Papers found!</p>
      </div>

      {/* Selection bar */}
      {isSynthesizeOpen && (
        <div className="flex justify-between items-center mb-4 p-4 bg-neutral-900 border border-neutral-700 rounded-lg shadow-md">
          <p className="text-lg text-neutral-300">
            Selected Papers: {selectedPapers.length} / {papers.length}
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

      {/* Paper List */}
      <div className="flex-1 overflow-y-auto pr-2">
        {loading ? (
          <p className="text-lg mt-4">Loading papers...</p>
        ) : (
          <PaperList
            key={collection_id}
            papers={papers}
            isMyCollection={true}
            isSynthesizeOpen={isSynthesizeOpen}
            setIsSynthesizeOpen={setIsSynthesizeOpen}
            selectedPapers={selectedPapers}
            setSelectedPapers={setSelectedPapers}
          />
        )}
      </div>
    </main>
  );
}
