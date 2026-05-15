"use client";

import type { TemplateCategory } from "@/lib/types";
import { CATEGORIES } from "@/data/templates";

interface CategoryTabsProps {
  active: TemplateCategory;
  onChange: (category: TemplateCategory) => void;
}

export function CategoryTabs({ active, onChange }: CategoryTabsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.id}
          type="button"
          onClick={() => onChange(cat.id)}
          className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
            active === cat.id
              ? "bg-rose-600 text-white shadow-sm"
              : "bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50"
          }`}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
}
