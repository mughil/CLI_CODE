# Changelog

Notable changes. Format loosely follows [Keep a Changelog](https://keepachangelog.com/);
versioning follows [SemVer](https://semver.org/).

## [Unreleased]

### Added
- Repository community infrastructure: `CODE_OF_CONDUCT.md`, `SECURITY.md`,
  issue forms for bug reports, AI models and documentation, contact links on the
  issue chooser, and an expanded pull-request template.
- `docs/GITHUB-SETUP.md`, `docs/SOCIAL-PREVIEW.md`, `docs/STARTER-ISSUES.md`.

### Changed
- README restructured around the product: hero, live demo, statistics, capabilities,
  then implementation detail.
- `CONTRIBUTING.md` rewritten with step-by-step instructions for each contribution
  type and an explicit generated-vs-maintained file list.
- CI workflow moved to the Node 24 action majors already used by the deploy workflow.

## [1.0.0] — 2026-09-03

First stable release. 500 CLI tools, 50 AI models, 20 open-source AI projects.

### Added — CLI directory
- **500 CLI tools** from three sources, merged by a deterministic build:
  79 agent-native harnesses (upstream CLI-Anything), 24 public CLIs, and a
  397-entry hand-curated catalog of widely-used developer command-line tools.
  500 unique ids, 500 unique slugs, zero duplicates.
- **Browse** (`registry.html`) — weighted client-side search with highlighting,
  six facets plus a curated toggle, sortable columns, full keyboard control,
  URL-persisted state, per-row favourite and compare controls.
- **Tool pages** (`cli.html?slug=`) — deep-linkable profiles with install methods,
  platforms, use cases, alternatives, related tools and `SoftwareApplication` JSON-LD.
- **Find my CLI** (`find.html`) — deterministic natural-language recommendations with
  a per-result explanation of what matched.
- **Stacks** (`stacks.html`) — 7 curated presets plus capability matrices.
- **Compare** (`compare.html`) — 2–4 tools with a key-differences summary and a
  diff-marked field table.
- **Cheat sheets** (`cheatsheet.html`) — printable command reference for a set,
  stack or your favourites.
- **Saved** (`saved.html`) — favourites, compare queue and recently viewed in
  versioned, corruption-safe `localStorage`.

### Added — AI model intelligence
- **50 AI models** across 18 providers, each field traceable through `sources[]`:
  22 open source, 11 open weight, 13 API-only, 34 local-capable, 37 API-available.
- **Models** (`models.html`) — search plus six facets (provider, openness,
  availability, capability, context bucket, local-capable).
- **Model pages** (`model.html?slug=`) — capabilities, licence, pricing with its own
  verification date, alternatives, a full **Sources** list and JSON-LD.
- **Find my model** (`find-model.html`) — 12 requirements, deterministic weighted
  scoring, "matched N% — why" on every result. Explicitly not an LLM.
- **Model Battle** (`model-compare.html`) — 2–4 models with the differences that
  matter called out.
- **Run locally** (`run-local.html`) — local-capable models grouped by runner
  (Ollama, llama.cpp, MLX, vLLM, Transformers, LocalAI, LM Studio, TGI).
- **AI open-source explorer** (`ai-explorer.html`) — 20 GitHub projects with
  API-verified, timestamped star counts.
- Openness is classified by **actual licence**, never by downloadability.

### Added — engineering
- Deterministic data pipeline (`scripts/build-data.mjs`): no network, no randomness,
  stable key order; emits `data/clis.json`, `data/meta.json`, `data/models.json`,
  `data/model-meta.json`, `sitemap.xml`, `robots.txt` and the per-page SEO blocks.
- Validation suite (`npm run check`): JSON Schema 2020-12 for entries, stacks, models
  and projects; unique ids/slugs; resolving cross-references; a generated-file drift
  gate; link and integrity scanning; `html-validate`; model URL well-formedness.
- **Registry size gate** — the build fails unless the active dataset is exactly
  500 tools with 500 unique ids and 500 unique slugs (`EXPECT_TOOLS` to change).
- Opt-in external-link reachability: `check-links.mjs --net`,
  `check-model-links.mjs --net`.
- Content-hash asset stamping (`?v=<sha1>`) so returning visitors never run a stale
  bundle against fresh data.
- GitHub Pages deployment workflow with build + validation gating, on Node 24 action
  majors.

### Security
- All user-controlled values escaped before reaching `innerHTML`; `?slugs=` filtered
  against known slugs before render.
- No `eval`, no `new Function`, no third-party runtime scripts, no analytics, no cookies.
- Every `target="_blank"` carries `rel="noopener"` — enforced by the link checker.
- `404.html` base-path segment restricted to `[A-Za-z0-9._-]`.
- Dev-only dependencies, installed from a committed lockfile; `npm audit` reports
  0 vulnerabilities.

### Accessibility & performance
- Lighthouse **Accessibility 100 / Best Practices 100 / SEO 100** on all 16 pages.
- Mobile performance 96–100 on production; LCP ≈ 1.7 s, CLS ≤ 0.08.
- WCAG 2.2 target sizes on icon-only controls; skip link, landmarks, `aria-live`
  result counts, visible focus, full keyboard operation.
- No page-level horizontal scroll at 375 / 768 / desktop.

[Unreleased]: https://github.com/mughil/CLI_CODE/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/mughil/CLI_CODE/releases/tag/v1.0.0
