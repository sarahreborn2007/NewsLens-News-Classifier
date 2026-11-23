import { cn } from "@/lib/utils";

/** Magnifying-glass mark with a blackletter "N" inside the lens. */
export function LensLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={cn("text-ink", className)} aria-hidden="true">
      <circle cx="50" cy="50" r="36" fill="none" stroke="currentColor" strokeWidth="6" />
      <circle cx="50" cy="50" r="29" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2 3" opacity="0.6" />
      <path d="M77 77 L104 104" stroke="currentColor" strokeWidth="12" strokeLinecap="round" />
      <path d="M38 28 Q30 34 30 46" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.4" strokeLinecap="round" />
      <text x="50" y="64" textAnchor="middle" fontFamily="UnifrakturMaguntia, Georgia, serif" fontSize="44" fill="currentColor">
        N
      </text>
    </svg>
  );
}
