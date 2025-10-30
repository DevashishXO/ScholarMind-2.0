import { useState } from "react";
import { ChevronDown } from "lucide-react";

type DropdownProps = {
  name: string;
  options: string[];
};

export default function DropDown({ name, options }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {/* Dropdown Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="
          flex items-center justify-between gap-2
          text-[var(--color-light)] font-medium
          px-4 py-2 rounded-lg
          hover:bg-neutral-800
          transition-all duration-300
          outline-none focus:ring-2 focus:ring-[var(--color-orange)]
          cursor-pointer
        "
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {name}
        <ChevronDown
          className={`w-4 h-4 text-[var(--color-orange)] transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      <ul
        className={`
          absolute left-0 mt-2 w-48 
          bg-neutral-900 border border-neutral-800
          rounded-lg shadow-lg z-20 overflow-hidden
          transition-all duration-300 origin-top
          ${isOpen ? "scale-y-100 opacity-100" : "scale-y-0 opacity-0"}
        `}
      >
        {options.map((option, index) => (
          <li
            key={index}
            role="menuitem"
            tabIndex={0}
            className="
              px-4 py-2 cursor-pointer
              text-[var(--color-light)]
              hover:bg-[var(--color-orange)] hover:text-white 
              transition-all duration-200
              outline-none focus:bg-[var(--color-orange)]
            "
          >
            {option}
          </li>
        ))}
      </ul>
    </div>
  );
}
