export default function SearchBar(){

  return (
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
  );
};
