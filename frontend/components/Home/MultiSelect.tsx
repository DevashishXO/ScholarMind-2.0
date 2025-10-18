import { useState } from "react";
import { ChevronDown, Check } from "lucide-react";

type MultiSelectDropdownProps = {
  label: string;
  options: string[];
  defaultAll?: boolean;
  onChange?: (selected: string[]) => void;
};

export default function MultiSelectDropdown({
  label,
  options,
  defaultAll = true,
  onChange,
}: MultiSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>(
    defaultAll ? [...options] : []
  );

  const toggleOption = (option: string) => {
    let updated: string[];
    if (selected.includes(option)) {
      updated = selected.filter((item) => item !== option);
    } else {
      updated = [...selected, option];
    }
    setSelected(updated);
    onChange?.(updated);
  };

  const allSelected = selected.length === options.length;

  const handleSelectAll = () => {
    const newSelected = allSelected ? [] : [...options];
    setSelected(newSelected);
    onChange?.(newSelected);
  };

  return (
    <div className="relative">
      <label className="text-xs text-neutral-400">{label}</label>

      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full mt-1 flex justify-between items-center bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm focus:outline-none hover:border-[var(--color-orange)] transition"
      >
        <span className="truncate text-left text-[var(--color-light)]">
          {allSelected
            ? "All selected"
            : selected.length
            ? selected.join(", ")
            : "Select..."}
        </span>
        <ChevronDown
          size={16}
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown List */}
      {isOpen && (
        <div className="absolute z-10 mt-2 w-full bg-neutral-900 border border-neutral-700 rounded-lg shadow-lg max-h-48 overflow-auto">
          <div
            onClick={handleSelectAll}
            className="flex items-center px-3 py-2 text-sm hover:bg-neutral-800 cursor-pointer text-[var(--color-light)]"
          >
            <Check
              size={14}
              className={`mr-2 ${
                allSelected ? "text-[var(--color-orange)]" : "opacity-30"
              }`}
            />
            Select All
          </div>
          <div className="border-t border-neutral-700/60" />
          {options.map((option) => (
            <div
              key={option}
              onClick={() => toggleOption(option)}
              className="flex items-center px-3 py-2 text-sm hover:bg-neutral-800 cursor-pointer text-[var(--color-light)]"
            >
              <Check
                size={14}
                className={`mr-2 ${
                  selected.includes(option)
                    ? "text-[var(--color-orange)]"
                    : "opacity-30"
                }`}
              />
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
