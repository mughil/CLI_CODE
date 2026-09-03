# CLI_CODE

**An open, self-contained developer directory of command-line tools *and* AI models.**
Search by task, compare alternatives, assemble a stack, print a cheat sheet, find
the right model, run it locally — all client-side. No backend, no tracking, no account.

- **Live demo:** `https://mughil.github.io/CLI_CODE/`
- **Datasets (independent ids/slugs/validation/stats):**
  - **CLI tools** — 500 entries: 79 agent-native harnesses (HKUDS/CLI-Anything), 24 public CLIs, and a 397-entry hand-curated catalog of widely-used developer command-line tools
  - **AI models** — 50 entries, 18 providers, every fact source-linked (`docs/MODEL-DATA.md`)
  - **AI GitHub projects** — 20 entries, verified against the GitHub API
- **Stack:** vanilla HTML/CSS/JS for the site; Node only for the build + CI

## Why it's different

| | |
|---|---|
| **Task-first** | *Find my CLI* / *Find my model* take a plain-language goal or a checklist and rank by what actually matches — and show you why. |
| **Honest data** | Derive what's safe, leave the rest blank. Verified facts live in human-maintained overlays with `sources[]`. Nothing is fabricated. |
| **Open ≠ downloadable** | AI models are labelled **open source** / **open weight** / **proprietary** by their *actual license*, not by whether weights can be pulled. |
| **Real comparison** | *Compare* / *Model Battle* lead with the differences that matter, not a metadata dump. |
| **Portable** | Every path is relative; works at `/` or `/CLI_CODE/`. Built JSON drives every page. |

## Pages

**CLI tools**

| Page | Purpose |
|------|---------|
| `index.html` | Search-first landing |
| `registry.html` | **Browse** — weighted search, 6 facets, sortable, keyboard-driven, URL-persisted |
| `cli.html?slug=` | Tool profile — install, platforms, use cases, alternatives |
| `find.html` | **Find my CLI** — natural-language recommendations with explanations |
| `stacks.html` | **Stacks** — 7 curated tool sets + capability matrices |
| `compare.html?slugs=a,b` | **Compare** 2–4 tools |
| `cheatsheet.html` | Printable command reference |
| `saved.html` | Favorites, compare queue, recently viewed (local only) |

**AI models**

| Page | Purpose |
|------|---------|
| `models.html` | **Models** — search + facets (provider, openness, availability, capability, context, local) |
| `model.html?slug=` | Model profile — capabilities, license, pricing, alternatives, **Sources** list, JSON-LD |
| `find-model.html` | **Find my model** — deterministic requirement scoring |
| `model-compare.html?slugs=a,b` | **Model Battle** — 2–4 models, key differences |
| `run-local.html` | Local-capable models grouped by runner |
| `ai-explorer.html` | The 20 GitHub AI projects, filterable by category |

`docs.html` · `404.html` (resolves assets against the site root).

## Local setup

`fetch()` needs HTTP — do not open `index.html` directly.

```bash
npm install
npm run build          # data/clis.json + data/meta.json from sources + overlay
npm run check          # schema + cross-references + drift + link integrity
npx http-server -p 4173   # or: python -m http.server 4173
```

## Dataset model

```
data/registry.json          upstream harness CLIs        ─┐
data/public_registry.json    upstream public CLIs          │
data/catalog_registry.json   hand-curated CLI catalog (397) ├─ build inputs
data/registry-dates.json     last-verified dates          ─┘
data/overlay.json            human-verified facts, by slug ── contributor-editable
        │  scripts/build-data.mjs  (deterministic, no network)
        ▼
data/clis.json               normalized entries the site loads   (generated)
data/meta.json               facet counts                        (generated)
```

Built entries validate against `schema/cli.schema.json` (JSON Schema 2020-12).
`data/stacks.json` picks must reference real slugs — enforced in CI.

**AI models** are a separate dataset:

```
data/models/*.json     per-group model records, each with sources[]   ── contributor-editable
data/ai-projects.json  GitHub AI projects (GitHub-API verified)       ── contributor-editable
        │  scripts/build-data.mjs
        ▼
data/models.json       merged, normalized                              (generated)
data/model-meta.json   facet counts + project meta                     (generated)
```

Validated by `scripts/validate-models.mjs` (`npm run check:models`): schema
(`schema/model.schema.json`, `schema/aiproject.schema.json`), unique ids/slugs,
resolving `alternatives`/`related`, openness-enum, URL well-formedness. Full rules
and the DISCOVER → VERIFY → NORMALIZE → VALIDATE → REVIEW → PUBLISH workflow in
[`docs/MODEL-DATA.md`](docs/MODEL-DATA.md).

## Contributing

- **CLI tool facts** → `data/overlay.json` (keyed by slug)
- **AI model** → add/edit a record in `data/models/<group>.json` with `sources[]`
- **AI GitHub project** → `data/ai-projects.json` (verify against the GitHub API)

Then `npm run build && npm run check`. See `CONTRIBUTING.md`, `docs.html`,
`docs/MODEL-DATA.md`. A failing schema or dangling reference blocks the deploy.

## Deploy

`.github/workflows/deploy-pages.yml` builds, validates and publishes to GitHub Pages
on every push to `main`. One-time: repo **Settings → Pages → Source: GitHub Actions**.

## License

Apache-2.0. The harness/public registry snapshots come from the upstream
[CLI-Anything](https://github.com/HKUDS/CLI-Anything) project; the curated
catalog in `data/catalog_registry.json` is maintained in this repo, one real
tool per entry, with facets derived by the build.
