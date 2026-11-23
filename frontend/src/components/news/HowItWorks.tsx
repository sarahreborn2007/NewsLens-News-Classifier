const STEPS = [
  { n: "I.", h: "Paste the Story", b: "Drop in any headline, tweet or full article that has crossed your desk and left you wondering." },
  { n: "II.", h: "The Lens Reads", b: "Our model studies the wording, the sourcing and the tell-tale marks of sensational or fabricated reporting." },
  { n: "III.", h: "The Verdict is Stamped", b: "Receive a clear stamp — Genuine, Fake or Unverified — with the clues that led to the call." },
];

export function HowItWorks() {
  return (
    <section id="how" className="mx-auto mt-20 max-w-6xl scroll-mt-8 px-4 sm:px-8">
      <div className="rule-double py-2 text-center font-type text-xs uppercase tracking-[0.35em] text-ink">How the Fact Desk Works</div>
      <div className="mt-8 grid gap-8 md:grid-cols-3 md:divide-x md:divide-ink/40">
        {STEPS.map((s, i) => (
          <article
            key={s.h}
            className="animate-fade-up group md:px-6"
            style={{ animationDelay: `${0.2 + i * 0.15}s` }}
          >
            <span className="font-masthead text-5xl font-bold text-stamp transition-transform group-hover:-rotate-6 inline-block">{s.n}</span>
            <h3 className="mt-2 font-display text-2xl font-black text-ink">{s.h}</h3>
            <p className="drop-cap mt-3 text-justify font-body leading-relaxed text-ink-soft">{s.b}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
