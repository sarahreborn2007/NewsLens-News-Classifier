import type { Clipping } from "./ClassifierPanel";
import { cn } from "@/lib/utils";

const LABEL = { real: "Genuine", fake: "Fake", uncertain: "Unverified" } as const;
const TONE = {
  real: "text-verdict-real border-verdict-real",
  fake: "text-verdict-fake border-verdict-fake",
  uncertain: "text-verdict-unsure border-verdict-unsure",
} as const;

export function Clippings({ items }: { items: Clipping[] }) {
  return (
    <section id="clippings" className="mx-auto mt-20 max-w-6xl scroll-mt-8 px-4 sm:px-8">
      <div className="rule-double py-2 text-center font-type text-xs uppercase tracking-[0.35em] text-ink">Today's Clippings</div>
      {items.length === 0 ? (
        <p className="mt-8 text-center font-display text-lg italic text-ink-soft">
          No stories inspected yet. Your checked clippings will be pinned here.
        </p>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((c, i) => (
            <article
              key={i}
              className={cn(
                "animate-badge-pop relative bg-card p-5 shadow-paper transition-transform duration-300 hover:-translate-y-1 hover:rotate-0",
                i % 2 ? "rotate-1" : "-rotate-1",
              )}
            >
              <span
                className={cn(
                  "absolute -right-2 -top-3 rotate-12 border-2 bg-paper px-2 py-0.5 font-type text-xs uppercase tracking-widest",
                  TONE[c.result.verdict],
                )}
              >
                {LABEL[c.result.verdict]} · {Math.round(c.result.confidence * 100)}%
              </span>
              <p className="line-clamp-4 font-display text-lg leading-snug text-ink">{c.text}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
