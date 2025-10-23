type HeaderProps = {
  label: string;
  showFilters: boolean;
  setShowFilters: React.Dispatch<React.SetStateAction<boolean>>;
  isMyCollection: boolean;
}

export default function SearchPapersHeader({ label, showFilters, setShowFilters, isMyCollection = false }: HeaderProps) {
  return (
    <div className="mb-6 flex items-center justify-between flex-shrink-0">
      <h1 className="text-3xl md:text-4xl font-bungee font-bold text-[var(--color-orange)]">
        {label}
      </h1>
      <div className="flex gap-2">
        {isMyCollection && (
          <button className="px-6 py-2 rounded-lg text-[var(--color-gray)] bg-[var(--color-light)] hover:bg-neutral-400 hover:text-[var(--color-gray)] transition font-bungee cursor-pointer"
          onClick={() => setShowFilters(!showFilters)}>
            Synthesize
          </button>
        )}
      <button className="px-6 py-2 rounded-lg bg-[var(--color-orange)] hover:bg-[var(--color-light)] hover:text-[var(--color-gray)] border border-transparent hover:border-[var(--color-orange)] transition font-bungee cursor-pointer"
      onClick={() => setShowFilters(!showFilters)}>
        Show Filters
      </button>
      </div>
    </div>
  );
}