import { useEffect, useRef } from "react";

const ARTICLES = [
  { h: "Tram Lines Extended to the Eastern Quarter", b: "Commuters greeted the new carriages with applause on the morning of their first run, as the city council declared the works complete ahead of schedule." },
  { h: "Wireless Set Sales Reach Record Heights", b: "Merchants report households across the nation gathering nightly around the parlour receiver, with orchestral broadcasts proving most popular." },
  { h: "Aviator Crosses Channel in Under an Hour", b: "Crowds lined the cliffs to witness the landing, the pilot remarking that the winds had been kind and the engine faithful." },
  { h: "Harvest Festival Draws Thousands", b: "Farmers from the outlying counties brought prize marrows and loaves to the market square, where the brass band played until dusk." },
  { h: "New Bridge Opens Across the River", b: "The mayor cut the ribbon before a gathering of dignitaries, praising the engineers for a structure built to last a century." },
  { h: "Telegraph Office Extends Its Hours", b: "Citizens may now dispatch messages until ten o'clock in the evening, a change welcomed by merchants and lovers alike." },
  { h: "Exhibition of Modern Machines Unveiled", b: "Visitors marvelled at the calculating engines and mechanical looms displayed in the great glass hall by the park." },
  { h: "Local Team Triumphs in Cup Final", b: "A late goal from the young forward sent supporters into raptures, the trophy paraded through the streets that very night." },
  { h: "Observatory Spots Comet Over the Hills", b: "Astronomers invite the public to view the celestial visitor through the great telescope on clear evenings this week." },
  { h: "Parliament Debates the Railway Bill", b: "Members argued late into the night over the proposed northern line, with the vote now expected before the recess." },
  { h: "Theatre Season Opens to Full Houses", b: "The new comedy delighted audiences, critics hailing the leading lady's performance as the finest of the decade." },
  { h: "Postal Rates to Remain Unchanged", b: "The Postmaster General assured the public that the penny stamp shall endure, despite rising costs of carriage." },
];

const FILLER =
  " Correspondents note that the matter has stirred considerable interest throughout the district, and further particulars are expected in tomorrow's edition. Readers are invited to write to the editor with their observations.";

/** The faux newspaper columns. Rendered twice (soft + sharp) so the lens can reveal the sharp copy. */
function Columns() {
  return (
    <div
      className="absolute -inset-[10%] columns-2 gap-8 p-10 text-ink transition-transform duration-700 ease-out sm:columns-4 lg:columns-6"
      style={{
        transform: "rotate(-3deg) translate(calc(var(--mx, 0) * -16px), calc(var(--my, 0) * -16px))",
      }}
    >
      {[...ARTICLES, ...ARTICLES, ...ARTICLES].map((a, i) => (
        <article key={i} className="mb-6 break-inside-avoid border-b border-ink/60 pb-4">
          <h3 className="font-display text-xl font-black leading-tight">{a.h}</h3>
          <p className="drop-cap mt-2 text-justify font-body text-[11px] leading-snug">
            {a.b}
            {FILLER}
            {i % 2 === 0 ? FILLER : ""}
          </p>
        </article>
      ))}
    </div>
  );
}

/**
 * Faded old-newspaper page behind everything. It stays soft and quiet,
 * and sharpens under a magnifying lens wherever the mouse moves.
 */
export function NewspaperBackdrop() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const onMove = (e: MouseEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.setProperty("--mx", String(e.clientX / window.innerWidth - 0.5));
        el.style.setProperty("--my", String(e.clientY / window.innerHeight - 0.5));
        el.style.setProperty("--lx", `${e.clientX}px`);
        el.style.setProperty("--ly", `${e.clientY}px`);
        el.dataset["lens"] = "on";
      });
    };
    const onLeave = (e: MouseEvent) => {
      if (!e.relatedTarget) el.dataset["lens"] = "off";
    };
    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseout", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseout", onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      data-lens="off"
      className="group/lens newsprint pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* Soft, faint copy: quiet enough that the page has one clear focus. */}
      <div className="absolute inset-0 opacity-[0.09] blur-[1.5px]">
        <Columns />
      </div>

      {/* Sharp copy, only visible inside the lens. */}
      <div className="lens-reveal absolute inset-0 opacity-0 transition-opacity duration-300 group-data-[lens=on]/lens:opacity-45">
        <Columns />
      </div>

      <div className="vignette absolute inset-0" />

      {/* The lens rim that follows the mouse. */}
      <div className="lens-ring opacity-0 transition-opacity duration-300 group-data-[lens=on]/lens:opacity-100" />
    </div>
  );
}
