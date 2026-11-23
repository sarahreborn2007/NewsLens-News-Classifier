# News Lens

News Lens is a full-stack fact-checking web app that checks headlines and viral claims against live web sources and displays the verdict like a vintage newspaper clipping.

I built this because most fact-checking demos either rely on outdated AI memory or dump raw text on a blank screen. News Lens pulls real-time articles from the web first, evaluates the claim against actual reporting, and stamps a clear verdict with clickable sources so you can verify it yourself.

## What it does

- **Live Web Search:** Searches current news and articles using the Tavily API before making any call.
- **Fact-Check Verdicts:** Uses a FastAPI backend with Groq to classify claims as `TRUE`, `FALSE`, `MISLEADING`, or `UNVERIFIED`, complete with a certainty score, a short summary, and numbered key findings.
- **Sources on Record:** Lists the actual articles and snippets used for the verdict so every claim is backed by clickable links.
- **Vintage Broadsheet UI:** Built with React, TypeScript, Tailwind CSS, and shadcn/ui, styled like an old-school fact desk with animated verdict stamps and a clippings history.

## Tech Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend:** Python, FastAPI, Uvicorn
- **APIs:** Groq (LLM reasoning) and Tavily (real-time web search)

## Project Structure

```text
newslens-v2/
├── backend/
│   ├── main.py              # FastAPI server and /api/verify endpoint
│   └── requirements.txt     # Python dependencies
├── frontend/
│   ├── public/              # Static assets and custom favicon
│   ├── src/
│   │   ├── components/news/ # Fact desk UI, verdict card, clippings
│   │   └── lib/             # API client (classifier.ts)
│   └── package.json
├── .gitignore
└── README.md