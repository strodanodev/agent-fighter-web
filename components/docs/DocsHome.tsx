import Link from "next/link";
import ConnectMindsHero from "@/components/docs/ConnectMindsHero";
import { WIKI_PAGES } from "@/lib/docs-nav";

const PAGES = WIKI_PAGES.filter((p) => p.slug !== "home");

export default function DocsHome() {
  return (
    <article className="space-y-10">
      <ConnectMindsHero />

      <section aria-labelledby="more-docs">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <p className="font-arcade text-[8px] text-ink-muted">REFERENCE</p>
            <h2
              id="more-docs"
              className="font-display mt-1 text-xl text-white md:text-2xl"
            >
              More docs
            </h2>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {PAGES.map((page) => (
            <Link
              key={page.slug}
              href={page.href}
              className="arcade-panel group block border-l-2 border-l-blue/60 p-5 transition hover:border-white/40"
            >
              <h3 className="font-display text-lg text-white group-hover:text-blue-bright">
                {page.title}
              </h3>
              <p className="mt-1.5 text-sm text-ink-muted">{page.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </article>
  );
}
