const ITEMS = [
  "LATEST — 1 in 4 viral headlines contain misleading claims",
  "FACT DESK — Always check who is quoted",
  "BULLETIN — Sensational wording is a red flag",
  "NOTICE — Dates & named sources build trust",
  "EXTRA — Think before you share",
];

export function Ticker() {
  const row = [...ITEMS, ...ITEMS];
  return (
    <div className="overflow-hidden border-y border-ink bg-ink py-2 text-paper">
      <div className="animate-marquee flex w-max gap-12 whitespace-nowrap font-type text-xs uppercase tracking-[0.25em]">
        {row.map((t, i) => (
          <span key={i} className="flex items-center gap-3">
            <span className="text-stamp">◆</span>
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}
