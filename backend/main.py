import json
import os
import re
from datetime import datetime
from typing import Literal
from urllib.parse import urlparse

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from groq import Groq
from pydantic import BaseModel, Field
from tavily import TavilyClient

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")

if not GROQ_API_KEY or not TAVILY_API_KEY:
    raise RuntimeError("Missing GROQ_API_KEY or TAVILY_API_KEY in .env")

groq_client = Groq(api_key=GROQ_API_KEY)
tavily_client = TavilyClient(api_key=TAVILY_API_KEY)

# Current Groq free-tier models with strict structured outputs support
MODELS_FALLBACK = [
    "openai/gpt-oss-120b",
    "openai/gpt-oss-20b",
    "qwen/qwen3.8-27b",
]

app = FastAPI(title="NewsLens v2 API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


class VerifyRequest(BaseModel):
    claim: str = Field(..., min_length=5, max_length=1000)


class SourceItem(BaseModel):
    title: str
    url: str
    domain: str
    snippet: str


class VerifyResponse(BaseModel):
    claim: str
    verdict: Literal["TRUE", "FALSE", "MISLEADING", "UNVERIFIED"]
    confidence: int
    headline: str
    summary: str
    evidence_points: list[str]
    sources: list[SourceItem]
    model_used: str


# Strict JSON schema enforced by Groq constrained decoding
VERDICT_JSON_SCHEMA = {
    "type": "object",
    "properties": {
        "verdict": {
            "type": "string",
            "enum": ["TRUE", "FALSE", "MISLEADING", "UNVERIFIED"],
        },
        "confidence": {"type": "integer"},
        "headline": {"type": "string"},
        "summary": {"type": "string"},
        "evidence_points": {
            "type": "array",
            "items": {"type": "string"},
        },
        "cited_source_indices": {
            "type": "array",
            "items": {"type": "integer"},
        },
    },
    "required": [
        "verdict",
        "confidence",
        "headline",
        "summary",
        "evidence_points",
        "cited_source_indices",
    ],
    "additionalProperties": False,
}


def fetch_evidence(claim: str) -> list[SourceItem]:
    raw = tavily_client.search(
        query=claim,
        search_depth="basic",
        max_results=5,
        exclude_domains=["linkedin.com", "facebook.com", "instagram.com", "quora.com", "reddit.com"],
    )
    sources: list[SourceItem] = []
    for item in raw.get("results", []):
        url = item.get("url", "")
        domain = urlparse(url).netloc.replace("www.", "")
        # Strip raw Markdown symbols (#, *, newlines) and collapse extra spaces
        raw_snippet = item.get("content") or ""
        clean_snippet = re.sub(r"[#*_`>\n]+", " ", raw_snippet)
        snippet = re.sub(r"\s+", " ", clean_snippet).strip()[:300]
        sources.append(
            SourceItem(
                title=item.get("title") or domain,
                url=url,
                domain=domain,
                snippet=snippet,
            )
        )
    return sources


def analyze_with_groq(claim: str, sources: list[SourceItem]) -> tuple[dict, str]:
    today = datetime.now().strftime("%B %d, %Y")
    evidence_block = "\n".join(
        f"[{i}] ({s.domain}) {s.title}: {s.snippet}"
        for i, s in enumerate(sources)
    ) or "No live search results found."

    system_prompt = (
        f"You are NewsLens, a strict, neutral fact-checking engine. Today's date is {today}. "
        "Evaluate the user's claim strictly using the numbered live web evidence provided. "
        "Rules:\n"
        "- verdict: TRUE (confirmed by credible sources), FALSE (contradicted by facts), "
        "MISLEADING (partially true, outdated, or missing key context), or UNVERIFIED (not enough evidence).\n"
        "- confidence: integer from 0 to 100.\n"
        "- headline: one sharp, factual one-sentence verdict headline (e.g., 'Michael Jackson died on June 25, 2009.').\n"
        "- summary: 2-3 clear sentences explaining the reality.\n"
        "- evidence_points: 2-4 concise bullet facts backed by the sources.\n"
        "- cited_source_indices: array of source index numbers (0-based) you relied on."
    )

    user_prompt = f"CLAIM:\n{claim}\n\nLIVE WEB EVIDENCE:\n{evidence_block}"

    last_error = None
    for model_name in MODELS_FALLBACK:
        try:
            completion = groq_client.chat.completions.create(
                model=model_name,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                response_format={
                    "type": "json_schema",
                    "json_schema": {
                        "name": "verification_result",
                        "strict": True,
                        "schema": VERDICT_JSON_SCHEMA,
                    },
                },
                temperature=0.1,
            )
            content = completion.choices[0].message.content or "{}"
            return json.loads(content), model_name
        except Exception as exc:
            last_error = exc
            continue

    raise HTTPException(
        status_code=503,
        detail=f"All LLM models failed. Last error: {last_error}",
    )


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/api/verify", response_model=VerifyResponse)
def verify_claim(req: VerifyRequest):
    claim = req.claim.strip()
    sources = fetch_evidence(claim)
    data, model_used = analyze_with_groq(claim, sources)

    # Map cited indices safely back to real Tavily sources
    indices = [
        i for i in data.get("cited_source_indices", [])
        if isinstance(i, int) and 0 <= i < len(sources)
    ]
    cited_sources = [sources[i] for i in dict.fromkeys(indices)] or sources[:3]

    return VerifyResponse(
        claim=claim,
        verdict=data["verdict"],
        confidence=max(0, min(100, int(data["confidence"]))),
        headline=data["headline"],
        summary=data["summary"],
        evidence_points=data["evidence_points"],
        sources=cited_sources,
        model_used=model_used,
    )