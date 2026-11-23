import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { IntroSplash } from "@/components/news/IntroSplash";
import { NewspaperBackdrop } from "@/components/news/NewspaperBackdrop";
import { Masthead } from "@/components/news/Masthead";
import { Ticker } from "@/components/news/Ticker";
import { ClassifierPanel, type Clipping } from "@/components/news/ClassifierPanel";
import { HowItWorks } from "@/components/news/HowItWorks";
import { Clippings } from "@/components/news/Clippings";
import { SITE_NAME } from "@/lib/site";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "News Lens — Real or Fake News Checker" },
      { name: "description", content: "Paste any headline or article and News Lens tells you whether it's genuine or fake news." },
      { property: "og:title", content: "News Lens — Real or Fake News Checker" },
      { property: "og:description", content: "Every story, under the lens. Check headlines for fake news in seconds." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [clippings, setClippings] = useState<Clipping[]>([]);

  return (
    <div className="relative min-h-screen">
      <NewspaperBackdrop />
      <IntroSplash />
      <Masthead />
      <div className="mx-auto mt-4 max-w-6xl px-4 sm:px-8">
        <Ticker />
      </div>
      <main className="pt-12">
        <ClassifierPanel onResult={(c) => setClippings((prev) => [c, ...prev].slice(0, 9))} />
        <HowItWorks />
        <Clippings items={clippings} />
      </main>
      <footer className="mx-auto mt-24 max-w-6xl px-4 pb-10 sm:px-8">
        <div className="rule-double flex flex-wrap items-center justify-between gap-2 py-3 font-type text-[11px] uppercase tracking-[0.2em] text-ink-soft">
          <span className="masthead-type text-lg normal-case text-ink">{SITE_NAME}</span>
          <span>Printed fresh with every search</span>
          <span>© 2026</span>
        </div>
      </footer>
    </div>
  );
}
