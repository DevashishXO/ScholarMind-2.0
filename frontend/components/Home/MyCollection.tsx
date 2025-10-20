import FilterPanel from "./FilterPanel"

import { useState } from 'react';

export default function MyCollection() {
  const [showFilters, setShowFilters] = useState(false);
 
  return (
    <main className="flex-1 p-8 text-[var(--color-light)] max-h-screen flex flex-col">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between flex-shrink-0">
        <h1 className="text-3xl md:text-4xl font-bungee font-bold text-[var(--color-orange)]">
          My Collection
        </h1>
        <button className="px-6 py-2 rounded-lg bg-[var(--color-orange)] hover:bg-[var(--color-light)] hover:text-[var(--color-gray)] border border-transparent hover:border-[var(--color-orange)] transition font-bungee"
        onClick={() => setShowFilters(!showFilters)}>
          Show Filters
        </button>
      </div>
      
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
        
      </div>

    </main>
  );
}
