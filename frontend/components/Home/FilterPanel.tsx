import MultiSelect from "./MultiSelect";

export default function FilterPanel() {
  return (
    <div className=" bg-neutral-900 border border-neutral-700/60 mb-4  w-full rounded-xl p-6 text-[var(--color-light)] shadow-lg ">
      <h1 className="py-4 font-bungee text-2xl">Filters</h1>
      <div className="grid grid-cols-3 gap-4">
        {/* Year Filter */}
        <MultiSelect
          label="Year"
          options={["2025", "2024", "2023", "2022", "2021"]}
        />
  
        {/* Type Filter */}
        <MultiSelect
          label="Type"
          options={["Journal", "Conference", "Preprint", "Thesis"]}
        />
  
        {/* Access Filter */}
        <MultiSelect
          label="Access"
          options={["Open Access", "Restricted", "Paid"]}
        />
  
        {/* Keyword Filter */}
        <div>
          <label className="text-xs text-neutral-400">Keyword</label>
          <input
            type="text"
            placeholder="AI, Robotics..."
            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2 text-sm mt-1 focus:outline-none focus:border-[var(--color-orange)]"
          />
        </div>
  
        {/* Citations Filter */}
        <MultiSelect
          label="Citations"
          options={["0-10", "10-50", "50-100", "100+"]}
        />
  
        {/* Sort By */}
        <div>
          <label className="text-xs text-neutral-400">Sort By</label>
          <select className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:border-[var(--color-orange)]">
            <option>Relevance</option>
            <option>Newest</option>
            <option>Oldest</option>
            <option>Most Cited</option>
          </select>
        </div>
  
        {/* Buttons */}
        <div className="col-span-3 flex justify-end gap-4 mt-4">
          <button className="px-4 py-2 text-sm bg-[var(--color-light)] font-bungee text-[var(--color-gray)] rounded-lg  hover:border-[var(--color-orange)]  transition">
            Reset
          </button>
          <button className="px-5 py-2 text-sm font-bungee bg-[var(--color-orange)] rounded-lg text-[var(--color-light)] font-medium hover:bg-orange-500 transition shadow-md">
            Apply Filters
          </button>
        </div>
      </div>
    </div>
    
    
  );
}
