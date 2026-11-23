import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ClassifyResult, RawVerdict } from "@/lib/classifier";
import { cn } from "@/lib/utils";

const VERDICT_META: Record<
  RawVerdict,
  {
    stamp: string;
    kicker: string;
    line: string;
    color: string;
    bar: string;
    compactStamp?: boolean;
  }
> = {
  TRUE: {
    stamp: "Genuine",
    kicker: "Cleared by the Fact Desk",
    line: "this claim aligns with verified reporting",
    color: "text-verdict-real border-verdict-real",
    bar: "bg-verdict-real",
  },
  FALSE: {
    stamp: "Fake",
    kicker: "Warning from the Fact Desk",
    line: "this claim is contradicted by verified evidence",
    color: "text-verdict-fake border-verdict-fake",
    bar: "bg-verdict-fake",
  },
  MISLEADING: {
    stamp: "Misleading",
    kicker: "Caution from the Fact Desk",
    line: "this claim mixes facts with missing or distorted context",
    color: "text-verdict-unsure border-verdict-unsure",
    bar: "bg-verdict-unsure",
    compactStamp: true,
  },
  UNVERIFIED: {
    stamp: "Unverified",
    kicker: "Under Investigation",
    line: "there is not enough verified evidence to confirm or refute this claim",
    color: "text-verdict-unsure border-verdict-unsure",
    bar: "bg-verdict-unsure",
    compactStamp: true,
  },
};

function resolveRawVerdict(result: ClassifyResult): RawVerdict {
  if (result.rawVerdict) return result.rawVerdict;
  if (result.verdict === "real") return "TRUE";
  if (result.verdict === "fake") return "FALSE";
  return "UNVERIFIED";
}

function joinClues(labels: string[]) {
  const l = labels.map((x) => x.toLowerCase());
  if (l.length === 0) return "";
  if (l.length === 1) return l[0] ?? "";
  return `${l.slice(0, -1).join(", ")} and ${l[l.length - 1]}`;
}

/** The verdict, printed as a front-page news story with a rubber stamp and cited sources. */
export function VerdictCard({
  result,
  text,
  notice,
}: {
  result: ClassifyResult;
  text: string;
  notice?: string | undefined;
}) {
  const rawVerdict = resolveRawVerdict(result);
  const v = VERDICT_META[rawVerdict];
  const pct = Math.round(result.confidence * 100);
  const fallbackHeadline = text.length > 160 ? text.slice(0, 160).trimEnd() + "…" : text;
  const displayHeadline = result.headline ?? fallbackHeadline;
  const clues = joinClues(
    result.signals.filter((s) => s.tone !== "neutral").map((s) => s.label),
  );
  const dateline = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const evidencePoints = result.evidencePoints ?? [];
  const sources = result.sources ?? [];

  return (
    <article className="newsprint animate-fade-up relative mt-8 overflow-hidden border border-ink/30 p-5 shadow-paper sm:p-8">
      {/* Kicker strip */}
      <div className="rule-double flex flex-wrap items-center justify-between gap-2 py-1.5 font-type text-[10px] uppercase tracking-[0.25em] text-ink-soft">
        <span className="text-stamp">{v.kicker}</span>
        <span>{dateline}</span>
      </div>

      {/* Headline + Stamp side-by-side so the stamp never covers headline text */}
      <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          {result.headline && (
            <p className="mb-2 font-type text-[11px] uppercase tracking-[0.18em] text-ink-soft">
              Claim examined: “{text}”
            </p>
          )}
          <h3 className="font-display text-2xl font-black leading-tight text-ink sm:text-3xl">
            {result.headline ? displayHeadline : `“${displayHeadline}”`}
          </h3>
          <p className="mt-3 font-type text-[11px] uppercase tracking-[0.25em] text-ink-soft">
            By the News Lens Fact Desk
          </p>
        </div>

        <div
          className={cn(
            "animate-stamp stamp-ink pointer-events-none flex shrink-0 flex-col items-center self-start rounded-md border-[5px] border-double px-4 py-2 font-display uppercase sm:px-5",
            v.color,
          )}
          aria-hidden="true"
        >
          <span
            className={cn(
              "font-black leading-none tracking-wider",
              v.compactStamp ? "text-3xl sm:text-4xl" : "text-4xl sm:text-5xl",
            )}
          >
            {v.stamp}
          </span>
          <span className="mt-1 font-type text-[10px] tracking-[0.3em]">
            {pct}% sure
          </span>
        </div>
      </div>

      <div className="mt-5 border-t border-ink/40" />

      <div className="mt-5 grid gap-6 md:grid-cols-[1fr_220px]">
        {/* Body copy */}
        <div className="font-body text-[15px] leading-relaxed text-ink">
          {result.summary ? (
            <>
              <p className="drop-cap text-justify">{result.summary}</p>

              {evidencePoints.length > 0 && (
                <div className="mt-5 border-t border-ink/20 pt-4">
                  <p className="font-type text-[10px] uppercase tracking-[0.25em] text-ink-soft">
                    Key Findings
                  </p>
                  <ol className="mt-2.5 space-y-2 text-sm leading-relaxed text-ink">
                    {evidencePoints.map((point, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <span className="mt-0.5 font-type text-xs font-bold text-stamp">
                          {idx + 1}.
                        </span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </>
          ) : (
            <>
              <p className="drop-cap text-justify">
                Our fact desk put this story under the lens and concluded that{" "}
                {v.line}. We are {pct}% sure of this verdict.
                {clues && <> On closer reading, our correspondents noted {clues}.</>}
              </p>
              <p className="mt-3 text-justify text-ink-soft">
                As ever, readers are advised to check who is quoted, where the
                figures come from, and whether other papers are reporting the same.
              </p>
            </>
          )}

          {notice && (
            <p className="mt-4 border-l-2 border-stamp pl-3 font-type text-xs text-ink-soft">
              <span className="uppercase tracking-widest text-stamp">
                Editor's note:{" "}
              </span>
              {notice}
            </p>
          )}
        </div>

        {/* Sidebar: desk summary + certainty meter */}
        <aside className="border-t border-ink/30 pt-4 md:border-l md:border-t-0 md:pl-5 md:pt-0">
          <p className="font-type text-[10px] uppercase tracking-[0.25em] text-ink-soft">
            {result.source === "model" ? "Desk File" : "Clues on file"}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {result.signals.map((s, i) => (
              <Badge
                key={s.label + i}
                variant={s.tone}
                className="animate-badge-pop max-w-full truncate px-2.5 py-1"
                style={{ animationDelay: `${0.4 + i * 0.12}s` }}
              >
                {s.tone === "real" ? "✓ " : s.tone === "fake" ? "✕ " : "• "}
                {s.label}
              </Badge>
            ))}
          </div>

          <div className="mt-5">
            <div className="flex justify-between font-type text-[10px] uppercase tracking-widest text-ink-soft">
              <span>Certainty</span>
              <span>{pct}%</span>
            </div>
            <div className="mt-1 h-2.5 w-full overflow-hidden rounded-full border border-ink/40 bg-paper">
              <div
                className={cn("animate-bar-grow h-full", v.bar)}
                style={{ width: `${pct}%`, animationDelay: "0.4s" }}
              />
            </div>
          </div>
        </aside>
      </div>

      {/* Clickable Live Sources Section */}
      {sources.length > 0 && (
        <div className="mt-6 border-t border-ink/40 pt-5">
          <div className="flex items-center justify-between">
            <p className="font-type text-[10px] uppercase tracking-[0.25em] text-ink-soft">
              Sources on Record ({sources.length})
            </p>
            <span className="font-type text-[10px] uppercase tracking-widest text-ink-soft">
              Live Web Citations
            </span>
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {sources.map((src) => (
              <a
                key={src.url}
                href={src.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col justify-between rounded-sm border border-ink/25 bg-paper/70 p-3.5 transition-colors hover:border-ink/70 hover:bg-paper"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 font-type text-[10px] uppercase tracking-wider text-ink-soft">
                    <span className="truncate">{src.domain || "Web Source"}</span>
                    <ExternalLink className="h-3 w-3 shrink-0 opacity-60 transition-opacity group-hover:opacity-100" />
                  </div>
                  <h4 className="mt-1.5 line-clamp-2 font-display text-sm font-bold leading-snug text-ink group-hover:underline">
                    {src.title}
                  </h4>
                  {src.snippet && (
                    <p className="mt-1.5 line-clamp-3 font-body text-xs leading-relaxed text-ink-soft">
                      {src.snippet}
                    </p>
                  )}
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}