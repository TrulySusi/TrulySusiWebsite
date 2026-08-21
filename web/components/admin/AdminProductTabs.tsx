"use client";

import { useState, type ReactNode } from "react";

export function AdminProductTabs({
  tabs,
}: {
  tabs: { id: string; label: string; content: ReactNode }[];
}) {
  const [active, setActive] = useState(tabs[0]?.id);

  return (
    <div>
      <div className="flex gap-1 border-b border-navy/10">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActive(tab.id)}
            className={`-mb-px rounded-t-lg border-b-2 px-4 py-2.5 font-body text-sm font-semibold transition-colors ${
              active === tab.id
                ? "border-navy text-navy"
                : "border-transparent text-navy/45 hover:text-navy/70"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="pt-6">{tabs.find((t) => t.id === active)?.content}</div>
    </div>
  );
}
