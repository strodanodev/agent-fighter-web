"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { WIKI_PAGES } from "@/lib/docs-nav";

export default function WikiSidebar() {
  const pathname = usePathname()?.replace(/\/$/, "") || "/docs";

  return (
    <nav
      aria-label="Docs wiki"
      className="arcade-panel sticky top-20 max-h-[calc(100svh-6rem)] overflow-y-auto p-4"
    >
      <p className="font-arcade text-[8px] text-blue-bright">DOCS</p>
      <ul className="mt-3 space-y-1">
        {WIKI_PAGES.map((page) => {
          const active = pathname === page.href;
          return (
            <li key={page.slug}>
              <Link
                href={page.href}
                className={`block border-l-2 px-2.5 py-1.5 transition ${
                  active
                    ? "border-blue-bright bg-blue/10 text-white"
                    : "border-transparent text-ink-muted hover:border-white/20 hover:text-white"
                }`}
              >
                <span className="font-arcade text-[8px]">{page.title}</span>
                <span className="mt-0.5 block text-[11px] leading-snug text-ink-muted/80">
                  {page.short}
                </span>
              </Link>
              {active && page.anchors.length > 0 && (
                <ul className="mt-1 mb-2 ml-2 space-y-0.5 border-l border-white/10 pl-2">
                  {page.anchors.map((a) => (
                    <li key={a.id}>
                      <a
                        href={`#${a.id}`}
                        className="block py-1 text-[12px] text-ink-muted transition hover:text-blue-bright"
                      >
                        {a.label}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
