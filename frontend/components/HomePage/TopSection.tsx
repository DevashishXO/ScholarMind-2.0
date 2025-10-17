import DropDown from "./DropDown";

export default function TopSection() {
  return (
    <header className="min-w-[80%] bg-[var(--color-gray)] flex justify-between items-center py-5 text-[var(--color-light)] shadow-md">
      {/* Left: Logo */}
      <h1 className="text-3xl font-bold bungee-regular text-[var(--color-orange)] tracking-wide">
        ScholarMind
      </h1>

      {/* Right: Navigation */}
      <div className="flex items-center">
        {/* Example dropdowns */}
        <DropDown name="Meet Us?" options={["Our Team", "Careers", "Partners"]} />
        <DropDown name="Platform" options={["Overview", "Features", "Roadmap"]} />
        <DropDown name="Solutions" options={["Students", "Researchers", "Educators"]} />
        <DropDown name="Pricing" options={["Students", "Researchers", "Educators"]} />
        <DropDown name="Learn" options={["Students", "Researchers", "Educators"]} />

        {/* Action Buttons */}
        <div className="flex gap-2 ml-2">
          <button className="bg-[var(--color-light)] text-[var(--color-gray)] bungee-regular px-4 py-2 rounded-md hover:bg-neutral-700 hover:text-[var(--color-light)] transition-all duration-300">
            Contact
          </button>
          <button className="bg-[var(--color-orange)] text-white bungee-regular px-4 py-2 rounded-md hover:bg-[var(--color-light)] hover:text-[var(--color-gray)] shadow-md transition-all duration-300">
            Try Now
          </button>
        </div>
      </div>
    </header>
  );
}
