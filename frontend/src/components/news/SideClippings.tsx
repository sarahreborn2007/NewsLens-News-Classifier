/** Two pinned paper notes that sit in the margins beside the search box, only on wide screens. */
export function SideClippings() {
  return (
    <div aria-hidden="true" className="pointer-events-none hidden xl:block">
      <div
        className="animate-drift absolute right-full top-40 mr-6 w-40 bg-paper-deep/85 p-3 shadow-paper"
        style={{ ["--r" as string]: "-6deg" }}
      >
        <p className="font-display text-base font-black leading-tight text-ink/75">EXTRA! EXTRA!</p>
        <p className="mt-1 font-body text-[11px] text-ink/65">Read all about it — but read carefully.</p>
      </div>
      <div
        className="animate-drift absolute bottom-24 left-full ml-6 w-40 bg-paper-deep/85 p-3 shadow-paper"
        style={{ ["--r" as string]: "5deg", animationDelay: "-4s" }}
      >
        <p className="font-type text-[10px] uppercase tracking-widest text-stamp/85">Fact Desk Bulletin</p>
        <p className="mt-1 font-display text-sm italic text-ink/75">"A lie can travel halfway round the world…"</p>
      </div>
    </div>
  );
}
