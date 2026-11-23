import { useEffect, useState } from "react";
import { LensLogo } from "./LensLogo";
import { SITE_NAME, TAGLINE } from "@/lib/site";
import { cn } from "@/lib/utils";

type Phase = "logo" | "tagline" | "leaving" | "done";

export function IntroSplash() {
  const [phase, setPhase] = useState<Phase>("logo");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("tagline"), 1100);
    const t2 = setTimeout(() => setPhase("leaving"), 3700);
    const t3 = setTimeout(() => setPhase("done"), 4500);
    return () => [t1, t2, t3].forEach(clearTimeout);
  }, []);

  if (phase === "done") return null;

  const skip = () => {
    setPhase("leaving");
    setTimeout(() => setPhase("done"), 800);
  };

  return (
    <div
      role="dialog"
      aria-label={`Welcome to ${SITE_NAME}`}
      onClick={skip}
      className={cn(
        "fixed inset-0 z-50 flex cursor-pointer items-center justify-center bg-ink/25 backdrop-blur-md",
        phase === "leaving" && "animate-splash-out",
      )}
    >
      <div className="glass sheen animate-glass-pop flex w-[min(92vw,34rem)] flex-col items-center rounded-3xl px-8 py-12 text-center">
        <LensLogo className="h-24 w-24 animate-drift" />
        <h1 className="masthead-type animate-ink-bleed mt-4 text-6xl leading-none text-ink sm:text-7xl">{SITE_NAME}</h1>
        <div className="mt-4 h-px w-40 bg-ink/50" />
        <p
          className={cn(
            "mt-5 min-h-8 font-display text-xl italic text-ink-soft sm:text-2xl",
            phase === "logo" ? "opacity-0" : "animate-ink-rise",
          )}
        >
          {TAGLINE}
        </p>
        <span
          className={cn(
            "mt-8 font-type text-xs uppercase tracking-[0.3em] text-ink-soft",
            phase === "logo" ? "opacity-0" : "animate-fade-up",
          )}
        >
          Click to enter the paper
        </span>
      </div>
    </div>
  );
}
