"use client";

import { useState } from "react";
import WikiSidebar from "./WikiSidebar";

export default function WikiShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mx-auto max-w-6xl px-5 pb-16 md:px-8">
      {/* Mobile wiki nav toggle */}
      <div className="mb-4 lg:hidden">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="font-arcade flex w-full items-center justify-between border border-white/20 bg-black/40 px-3 py-2.5 text-[8px] text-blue-bright"
          aria-expanded={open}
        >
          <span>PAGES</span>
          <span aria-hidden>{open ? "−" : "+"}</span>
        </button>
        {open && (
          <div className="mt-2" onClick={() => setOpen(false)}>
            <WikiSidebar />
          </div>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-[200px_minmax(0,1fr)] lg:items-start xl:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <WikiSidebar />
        </aside>
        <div className="min-w-0 max-w-4xl">{children}</div>
      </div>
    </div>
  );
}
