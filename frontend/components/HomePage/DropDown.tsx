import { useState } from "react";

type DropdownProps = {
  name: string;
  options: string[];
};

export default function DropDown({ name, options }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="relative group"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {/* Dropdown Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="
          flex items-center gap-2 
          text-[var(--color-light)] 
          px-4 py-2 
          rounded-lg 
          cursor-pointer 
          hover:bg-neutral-800
          transition-all 
          duration-300 
          font-medium
          bungee-regular
        "
      >
        {name}
        <span
          className={`text-[var(--color-orange)] transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          ▼
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <ul
          className="
            absolute left-0 mt-2 w-48 
            bg-neutral-900 
            border border-neutral-700 
            rounded-lg 
            shadow-lg 
            overflow-hidden 
            z-20
            animate-fadeIn
          "
        >
          {options.map((option, index) => (
            <li
              key={index}
              className="
                px-4 py-2 
                text-[var(--color-light)] 
                hover:bg-[var(--color-orange)] 
                hover:text-white 
                cursor-pointer 
                transition-all 
                duration-200
              "
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
