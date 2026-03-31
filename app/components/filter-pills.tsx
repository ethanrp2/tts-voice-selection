"use client";

const CATEGORIES = ["empathy", "authority", "energy"] as const;

interface FilterPillsProps {
  selected: string;
  onSelect: (category: string) => void;
}

export function FilterPills({ selected, onSelect }: FilterPillsProps) {
  return (
    <div className="w-full md:w-auto overflow-x-auto hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
      <div className="flex bg-surface-container-low rounded-full p-1 w-max">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => onSelect(cat)}
            className={`px-5 py-2 rounded-full font-label text-xs font-semibold transition-all whitespace-nowrap capitalize ${
              selected === cat
                ? "bg-primary text-on-primary"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}
