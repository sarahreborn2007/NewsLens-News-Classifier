/**
 * News Lens classifier client.
 * Connects to your FastAPI backend (/api/verify) with a graceful fallback
 * heuristic if the server is offline.
 */
export type Verdict = "real" | "fake" | "uncertain";
export type RawVerdict = "TRUE" | "FALSE" | "MISLEADING" | "UNVERIFIED";
export type SignalTone = "real" | "fake" | "neutral";

export interface Signal {
  label: string;
  tone: SignalTone;
}

export interface EvidenceSource {
  title: string;
  url: string;
  domain: string;
  snippet: string;
}

export interface ClassifyResult {
  verdict: Verdict;
  rawVerdict?: RawVerdict | undefined;
  /** 0–1 */
  confidence: number;
  headline?: string | undefined;
  summary?: string | undefined;
  evidencePoints?: string[] | undefined;
  sources?: EvidenceSource[] | undefined;
  modelUsed?: string | undefined;
  signals: Signal[];
  source: "model" | "sample";
}

/** Your local FastAPI backend endpoint. Override with VITE_CLASSIFIER_API_URL in .env. */
export const API_URL =
  (import.meta.env["VITE_CLASSIFIER_API_URL"] as string | undefined) ??
  "http://127.0.0.1:8000/api/verify";

export interface ClassifyOutcome {
  result: ClassifyResult;
  /** Set when the backend could not be reached and the sample stand-in was used. */
  fallbackReason?: string | undefined;
}

export async function classifyNews(text: string): Promise<ClassifyOutcome> {
  const started = Date.now();
  const minDelay = () =>
    new Promise((r) => setTimeout(r, Math.max(0, 1200 - (Date.now() - started))));

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ claim: text }),
    });

    if (!res.ok) {
      let detail = `status ${res.status}`;
      try {
        const errBody = (await res.json()) as Record<string, unknown>;
        if (typeof errBody["detail"] === "string") {
          detail = errBody["detail"];
        }
      } catch {
        // ignore JSON parse error on error response
      }
      throw new Error(detail);
    }

    const result = normalizeModelResponse(await res.json());
    await minDelay();
    return { result };
  } catch (err) {
    await minDelay();
    return {
      result: sampleClassify(text),
      fallbackReason: `Your backend at ${API_URL} didn't answer (${err instanceof Error ? err.message : "unreachable"}), so this is a sample verdict.`,
    };
  }
}

/** Maps NewsLens FastAPI (/api/verify) output into the UI's ClassifyResult shape. */
export function normalizeModelResponse(data: unknown): ClassifyResult {
  const d = (data ?? {}) as Record<string, unknown>;
  const rawUpper = String(
    d["verdict"] ?? d["label"] ?? d["prediction"] ?? d["class"] ?? "",
  ).toUpperCase();
  const rawLower = rawUpper.toLowerCase();

  const rawConf = Number(d["confidence"] ?? d["score"] ?? d["probability"] ?? 50);
  const confidence = Math.min(1, Math.max(0, rawConf > 1 ? rawConf / 100 : rawConf));

  let verdict: Verdict = "uncertain";
  let rawVerdict: RawVerdict = "UNVERIFIED";

  if (["true", "real", "genuine", "reliable", "1"].includes(rawLower)) {
    verdict = "real";
    rawVerdict = "TRUE";
  } else if (rawLower === "misleading") {
    verdict = "fake";
    rawVerdict = "MISLEADING";
  } else if (["false", "fake", "unreliable", "0"].includes(rawLower)) {
    verdict = "fake";
    rawVerdict = "FALSE";
  }

  const headline =
    typeof d["headline"] === "string" && d["headline"].trim()
      ? d["headline"].trim()
      : undefined;

  const summary =
    typeof d["summary"] === "string" && d["summary"].trim()
      ? d["summary"].trim()
      : undefined;

  const modelUsed =
    typeof d["model_used"] === "string" && d["model_used"].trim()
      ? d["model_used"].trim()
      : undefined;

  const evidencePoints = Array.isArray(d["evidence_points"])
    ? (d["evidence_points"] as unknown[])
        .map((p) => String(p).trim())
        .filter(Boolean)
    : [];

  const sources: EvidenceSource[] = Array.isArray(d["sources"])
    ? (d["sources"] as unknown[])
        .map((item) => {
          const s = (item ?? {}) as Record<string, unknown>;
          return {
            title: String(s["title"] ?? "Untitled Source"),
            url: String(s["url"] ?? ""),
            domain: String(s["domain"] ?? ""),
            snippet: String(s["snippet"] ?? ""),
          };
        })
        .filter((s) => Boolean(s.url))
    : [];

  const tone: SignalTone =
    verdict === "real" ? "real" : verdict === "fake" ? "fake" : "neutral";

  const signals: Signal[] = [
    {
      label: `${sources.length} live ${sources.length === 1 ? "source" : "sources"} checked`,
      tone,
    },
    {
      label: `${evidencePoints.length} key ${evidencePoints.length === 1 ? "finding" : "findings"}`,
      tone: "neutral",
    },
  ];

  if (modelUsed) {
    signals.push({ label: modelUsed, tone: "neutral" });
  }

  return {
    verdict,
    rawVerdict,
    confidence,
    headline,
    summary,
    evidencePoints,
    sources,
    modelUsed,
    signals,
    source: "model",
  };
}

const FAKE_CUES: [RegExp, string][] = [
  [/\b(shocking|unbelievable|you won'?t believe|mind[- ]blowing)\b/i, "Sensational wording"],
  [/\b(miracle|secret cure|cures? (all|everything)|100% (guaranteed|proven))\b/i, "Too-good-to-be-true claim"],
  [/\b(they don'?t want you to know|cover[- ]?up|exposed|wake up)\b/i, "Conspiracy framing"],
  [/\b(share (this )?before|going viral|must share)\b/i, "Urges you to share"],
  [/!{2,}/, "Excess exclamation"],
  [/\b[A-Z]{4,}\b.*\b[A-Z]{4,}\b/, "All-caps shouting"],
  [/\b(anonymous insiders?|sources say|rumou?red)\b/i, "Vague sourcing"],
];

const REAL_CUES: [RegExp, string][] = [
  [/\b(according to|said in a statement|told reporters|confirmed)\b/i, "Attributed statement"],
  [/\b(reuters|associated press|ap|bbc|ministry|department|university|study published)\b/i, "Named source"],
  [/\b\d+(\.\d+)?\s?(percent|%|million|billion)\b/i, "Specific figures"],
  [/\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday|january|february|march|april|may|june|july|august|september|october|november|december)\b/i, "Dated reporting"],
  [/["“][^"”]{12,}["”]/, "Direct quotation"],
];

export function sampleClassify(text: string): ClassifyResult {
  const signals: Signal[] = [];
  let fake = 0;
  let real = 0;
  for (const [re, label] of FAKE_CUES) if (re.test(text)) { fake++; signals.push({ label, tone: "fake" }); }
  for (const [re, label] of REAL_CUES) if (re.test(text)) { real++; signals.push({ label, tone: "real" }); }

  const score = fake - real;
  let verdict: Verdict = "uncertain";
  if (score >= 1) verdict = "fake";
  else if (score <= -1) verdict = "real";

  const confidence =
    verdict === "uncertain"
      ? 0.5
      : Math.min(0.97, 0.62 + Math.abs(score) * 0.1 + Math.min(text.length, 600) / 6000);

  if (signals.length === 0) signals.push({ label: "Few clues found", tone: "neutral" });
  signals.push({ label: `${text.trim().split(/\s+/).length} words read`, tone: "neutral" });

  return { verdict, confidence, signals, source: "sample" };
}