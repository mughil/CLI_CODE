# AI / LLM model data

This document governs `data/models/` and `data/ai-projects.json`. It is
separate from the CLI tool dataset — independent IDs, slugs, validation and
stats.

## What goes in

A balanced set of developer-relevant models:

- latest frontier + leading commercial models
- leading open-source and open-weight models
- coding, reasoning, multimodal, vision, audio/speech models
- small language models and local/offline-capable models
- embedding models where relevant

Quality over count. Represent model **families** intelligently — do not add
dozens of near-identical parameter variants unless the differences matter to a
developer choosing between them.

## `openSourceStatus` — the one classification that matters

Downloadable weights are **not** the same as open source. Classify by the
actual license:

| value | meaning |
|---|---|
| `open-source` | OSI-approved license covering weights + (where applicable) training code (e.g. Apache-2.0, MIT) |
| `open-weight` | weights are downloadable but under a custom / restricted license (e.g. Llama Community License, Gemma Terms) |
| `proprietary` | closed model, may be self-hostable via a vendor deal |
| `api-only` | closed model, only reachable through a hosted API |
| `research-license` | weights released for research use only |
| `commercial-use-restricted` | downloadable but commercial use limited or gated |
| `other-unknown` | licensing unclear — use this rather than guessing |

`license` holds the SPDX identifier or the license's proper name.
`commercialUse` is `yes` / `no` / `restricted` / `unknown`.

## Accepted sources (in priority order)

1. official model-provider documentation
2. official model cards
3. official GitHub repositories
4. official Hugging Face organization / model pages
5. official technical reports
6. official release announcements
7. recognized benchmark sources **only** when the methodology is stated

Never rely solely on blogs, SEO articles, scraped lists, social posts,
generated summaries, or benchmark aggregators. When sources conflict, prefer
the developer's primary documentation and record the uncertainty in
`limitations`.

## Required fields

`id`, `slug` (equal, kebab-case), `name`, `provider`, `modelType[]`,
`categories[]`, `availability[]`, `openSourceStatus`, `lastVerified`,
`sources[]` (at least one). Everything else is optional and **must be omitted
or `null` when not verified**. Unknown beats fabricated.

Every record carries `sources[]` — `{ type, url, title, verifiedAt }`.
Factual metadata (context window, license, release date, parameter count,
availability, modalities) must be traceable to one of them.

## Volatile data

Use a dedicated timestamp, never a bare value presented as current:

- `pricing` + `pricingVerifiedAt`
- `stars` + `starsVerifiedAt` (AI projects) — only when fetched live
- `availability` + `availabilityVerifiedAt`

## Benchmarks

Optional. If present, each entry records `name`, `score`, `source` (URL),
`evaluatedAt`, `modelVersion`. Never merge scores from incompatible benchmark
versions. There is no global "AI score".

## Popularity

Never invent stars, forks, downloads, usage, or rankings. Editorial groupings
(`widely-used`, `notable`, `emerging`) only when evidence supports them.

## Update workflow

```
DISCOVER  → find a candidate from an official announcement / model card
VERIFY    → confirm every stated fact against sources[] (priority order above)
NORMALIZE → map to the schema; omit unverified fields
VALIDATE  → npm run check:models   (schema + unique ids/slugs + refs + openness)
REVIEW    → human pass on classification + provenance
PUBLISH   → commit; CI re-runs validation on every push
```

Newly discovered models are **not** auto-published. `scripts/validate-models.mjs`,
`scripts/check-model-links.mjs` and `scripts/model-stats.mjs` support the flow.

## Submitting a new model

Add a record to the appropriate `data/models/<group>.json` (`frontier`,
`open-weight`, `coding`, `multimodal`, `small-local`, `embeddings`, …), run
`npm run check`, open a PR. CI fails on duplicate ids/slugs, invalid required
fields, bad openness values, dangling `alternatives`/`related`, malformed URLs,
or categories outside the schema.
