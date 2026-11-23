import { useState } from "react";
import { Search, Newspaper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { classifyNews, type ClassifyResult } from "@/lib/classifier";
import { SUB_TAGLINE } from "@/lib/site";
import { VerdictCard } from "./VerdictCard";
import { SideClippings } from "./SideClippings";
import { cn } from "@/lib/utils";

const EXAMPLES = [
  "SHOCKING: Doctors HATE this miracle cure they don't want you to know about!!!",
  "The ministry confirmed on Monday that inflation fell to 3.2 percent, according to official figures.",
  "Anonymous insiders say the moon landing was staged — share this before it gets deleted!",
  "Researchers at the university said in a statement that the study was published in Nature in March.",
];

export interface Clipping {
  text: string;
  result: ClassifyResult;
}

export function ClassifierPanel({ onResult }: { onResult: (c: Clipping) => void }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [current, setCurrent] = useState<{ text: string; result: ClassifyResult; notice?: string | undefined } | null>(null);

  const run = async (value = text) => {
    const story = value.trim();
    if (!story || loading) return;
    setText(story);
    setLoading(true);
    setCurrent(null);
    const { result, fallbackReason } = await classifyNews(story);
    setLoading(false);
    setCurrent({ text: story, result, notice: fallbackReason });
    onResult({ text: story, result });
  };

  return (
    <section id="check" className="relative mx-auto max-w-4xl scroll-mt-8 px-4 sm:px-8">
      <SideClippings />
      <div className="glass animate-glass-pop rounded-2xl p-6 sm:p-10" style={{ animationDelay: "4.4s" }}>
        <div className="text-center">
          <p className="font-type text-xs uppercase tracking-[0.3em] text-stamp">— The Fact Desk —</p>
          <h2 className="mt-2 font-display text-4xl font-black text-ink sm:text-5xl">Is it real, or is it rubbish?</h2>
          <p className="mt-2 font-body italic text-ink-soft">{SUB_TAGLINE}</p>
        </div>

        <form
          className="mt-8"
          onSubmit={(e) => {
            e.preventDefault();
            run();
          }}
        >
          <div className="group relative rounded-xl border-2 border-ink bg-paper/80 shadow-paper transition-shadow focus-within:shadow-glass">
            <Search className="absolute left-4 top-4 h-5 w-5 text-ink-soft" />
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  run();
                }
              }}
              rows={3}
              placeholder="Paste a headline or an article…"
              aria-label="News headline or article"
              className="w-full resize-none bg-transparent py-3.5 pl-12 pr-4 font-body text-lg text-ink placeholder:text-ink-soft/70 focus:outline-none"
            />
            <div className="flex items-center justify-between border-t border-ink/20 px-4 py-2">
              <span className="font-type text-[11px] uppercase tracking-widest text-ink-soft">
                {text.trim() ? `${text.trim().split(/\s+/).length} words` : "Enter to check"}
              </span>
              <Button type="submit" variant="ink" size="lg" disabled={!text.trim() || loading}>
                <Newspaper /> {loading ? "Inspecting…" : "Put it under the lens"}
              </Button>
            </div>
          </div>
        </form>

        <div className="mt-5">
          <p className="font-type text-[11px] uppercase tracking-widest text-ink-soft">Try a clipping:</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {EXAMPLES.map((ex, i) => (
              <Badge
                key={ex}
                variant="clipping"
                onClick={() => run(ex)}
                className={cn("animate-badge-pop max-w-full truncate font-normal", i % 2 ? "rotate-1" : "-rotate-1")}
                style={{ animationDelay: `${4.8 + i * 0.12}s` }}
              >
                {ex.length > 52 ? ex.slice(0, 52) + "…" : ex}
              </Badge>
            ))}
          </div>
        </div>

        {loading && (
          <div className="mt-8 text-center" role="status">
            <p className="font-type text-sm uppercase tracking-[0.3em] text-ink">Setting the type…</p>
            <div className="mx-auto mt-3 h-1 w-64 overflow-hidden bg-ink/15">
              <div className="animate-press h-full w-full bg-stamp" />
            </div>
          </div>
        )}

        {current && <VerdictCard result={current.result} text={current.text} notice={current.notice} />}
      </div>
    </section>
  );
}
