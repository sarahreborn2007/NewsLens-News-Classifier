import { cn } from "@/lib/utils";
import { LensLogo } from "./LensLogo";
import { SITE_NAME, TAGLINE } from "@/lib/site";

/** Thick-thin newspaper rule pair; `flip` puts the heavy line on top. */
function Rule({ flip = false, delay = 0 }: { flip?: boolean; delay?: number }) {
  return (
    <div
      aria-hidden="true"
      style={delay ? { animationDelay: `${delay}ms` } : undefined}
      className={cn("rule-broadsheet animate-rule-draw", flip && "[&>span:first-child]:h-[3px] [&>span:last-child]:h-px")}
    >
      <span />
      <span />
    </div>
  );
}

function Lozenge({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={cn("h-2.5 w-2.5 shrink-0 text-ink/70", className)}
    >
      <path d="M12 0 24 12 12 24 0 12Z" fill="currentColor" />
    </svg>
  );
}

export function Masthead() {
  return (
    <header className="mx-auto max-w-6xl px-4 pt-6 sm:px-8">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink/60 pb-2 font-type text-[11px] uppercase tracking-[0.2em] text-ink-soft">
        <span>Vol. I · No. 1</span>
        <span className="hidden sm:inline">Late City Edition</span>
        <span>Price: Free</span>
      </div>

      <div className="py-5">
        <Rule delay={120} />
        <div className="flex items-center gap-3 py-3 sm:gap-5">
          <span className="hidden h-px flex-1 bg-ink/35 sm:block" />
          <Lozenge className="hidden sm:block" />
          <div className="flex items-center gap-3 sm:gap-5">
            <LensLogo className="h-12 w-12 shrink-0 sm:h-16 sm:w-16" />
            <h1
              style={{ animationDelay: "420ms" }}
              className="masthead-type animate-ink-bleed text-[3.25rem] leading-none text-ink sm:text-8xl lg:text-9xl"
            >
              {SITE_NAME}
            </h1>
          </div>
          <Lozenge className="hidden sm:block" />
          <span className="hidden h-px flex-1 bg-ink/35 sm:block" />
        </div>
        <Rule flip delay={260} />
      </div>

      <div className="rule-double flex flex-wrap items-center justify-between gap-2 py-2 font-body text-xs text-ink-soft sm:text-sm">
        <span className="italic">"{TAGLINE}"</span>
        <nav className="flex gap-5 font-type uppercase tracking-widest">
          <a href="#check" className="hover:text-stamp">The Lens</a>
          <a href="#how" className="hover:text-stamp">How it works</a>
          <a href="#clippings" className="hover:text-stamp">Clippings</a>
        </nav>
      </div>
    </header>
  );
}
