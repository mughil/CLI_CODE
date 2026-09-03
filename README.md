<div align="center">

# CLI_CODE

### Discover the right CLI tool or AI model in seconds.

**500 CLI Tools · 50 AI Models · 20 AI Projects**

Search → Compare → Build Stacks → Get Commands → Run Models Locally

*No backend · No account · No tracking · Open source*

### **[▶ Open the live demo](https://mughil.github.io/CLI_CODE/)**

[![Deploy to GitHub Pages](https://github.com/mughil/CLI_CODE/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/mughil/CLI_CODE/actions/workflows/deploy-pages.yml)
[![CI](https://github.com/mughil/CLI_CODE/actions/workflows/ci.yml/badge.svg)](https://github.com/mughil/CLI_CODE/actions/workflows/ci.yml)
[![License: Apache-2.0](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)
[![CLI tools](https://img.shields.io/badge/CLI%20tools-500-22c55e)](https://mughil.github.io/CLI_CODE/registry.html)
[![AI models](https://img.shields.io/badge/AI%20models-50-8b5cf6)](https://mughil.github.io/CLI_CODE/models.html)

</div>

---

Search, compare and discover **500 command-line tools**, **50 AI models** and curated
developer stacks. CLI_CODE is an open-source, client-side directory: everything runs in
your browser from static JSON, so there is no backend, no account and no tracking.

## Live demo

**https://mughil.github.io/CLI_CODE/**

| Try this | Link |
|---|---|
| Browse all 500 CLI tools | [registry.html](https://mughil.github.io/CLI_CODE/registry.html) |
| Describe a task, get tools | [find.html](https://mughil.github.io/CLI_CODE/find.html) |
| Compare `ripgrep` vs `fd` | [compare.html?slugs=ripgrep,fd](https://mughil.github.io/CLI_CODE/compare.html?slugs=ripgrep,fd) |
| Browse 50 AI models | [models.html](https://mughil.github.io/CLI_CODE/models.html) |
| Models you can run locally | [run-local.html](https://mughil.github.io/CLI_CODE/run-local.html) |
| Open-source AI projects | [ai-explorer.html](https://mughil.github.io/CLI_CODE/ai-explorer.html) |

## Project statistics

| Dataset | Count | Notes |
|---|---:|---|
| CLI tools | **500** | 500 unique ids, 500 unique slugs, 0 duplicates — enforced in CI |
| AI models | **50** | 18 providers; 22 open source, 11 open weight, 13 API-only |
| AI GitHub projects | **20** | star counts fetched from the GitHub API and timestamped |
| Curated stacks | **7** | preset tool sets + capability matrices |
| Categories | **53** | derived from the data, not hand-maintained |
| Runtime dependencies | **0** | vanilla HTML/CSS/JS; Node is build + CI only |

## Key capabilities

- **Weighted search** across name, tags, summary and use cases — instant, client-side.
- **Find my CLI** — describe a task in plain language, get ranked tools *and the reason each matched*.
- **Find my model** — tick requirements (local, coding, open source, large context…), get deterministic scoring with a per-result explanation.
- **Compare** — 2–4 CLI tools side by side with the differences called out.
- **Model Battle** — 2–4 AI models compared on openness, license, context, modalities, pricing.
- **Stacks** — curated tool sets per discipline plus capability matrices.
- **Cheat sheets** — printable command reference for a set, stack or your favourites.
- **Run locally** — which models run on your own hardware, grouped by runner (Ollama, llama.cpp, MLX, vLLM…).
- **Saved** — favourites, compare queue and recently viewed, stored only in your browser.
- **Keyboard-first** — `/` to search, `↑↓` to move, `Enter` to open, `Esc` to clear.

## Screenshots

Not checked in yet — see the [live demo](https://mughil.github.io/CLI_CODE/).
Contributions welcome: place images in `docs/screenshots/` and link them here.

## Quick navigation

[Live demo](https://mughil.github.io/CLI_CODE/) ·
[Why it's different](#why-cli_code-is-different) ·
[CLI features](#cli-features) ·
[AI model features](#ai-model-features) ·
[Run models locally](#run-models-locally) ·
[Development](#development) ·
[Data architecture](#data-architecture) ·
[Contributing](CONTRIBUTING.md) ·
[Validation](#validation) ·
[Deployment](#deployment) ·
[Changelog](CHANGELOG.md) ·
[Roadmap](ROADMAP.md)

## Why CLI_CODE is different

| | |
|---|---|
| **Task-first** | *Find my CLI* and *Find my model* take a goal or a checklist and rank by what actually matches — and show you why. Deterministic scoring, never disguised as an LLM. |
| **Honest data** | Derive only what is safe to derive; leave the rest blank. Verified facts live in human-maintained overlays with `sources[]`. Nothing is fabricated. |
| **Open ≠ downloadable** | AI models are labelled **open source** / **open weight** / **proprietary** by their *actual licence*, not by whether the weights can be pulled. |
| **Real comparison** | *Compare* and *Model Battle* lead with the differences that matter, not a metadata dump. |
| **Private by construction** | No backend, no analytics, no cookies. Favourites and history never leave `localStorage`. |
| **Portable** | Every path is relative — the site works at `/` or at `/CLI_CODE/` with no configuration. |

## CLI features

| Page | Purpose |
|------|---------|
| `index.html` | Search-first landing page |
| `registry.html` | **Browse** — weighted search, 6 facets, sortable, keyboard-driven, URL-persisted |
| `cli.html?slug=` | Tool profile — install methods, platforms, use cases, alternatives, JSON-LD |
| `find.html` | **Find my CLI** — natural-language recommendations with explanations |
| `stacks.html` | **Stacks** — 7 curated tool sets + capability matrices |
| `compare.html?slugs=a,b` | **Compare** 2–4 tools |
| `cheatsheet.html` | Printable command reference |
| `saved.html` | Favourites, compare queue, recently viewed (browser-local only) |

## AI model features

| Page | Purpose |
|------|---------|
| `models.html` | **Models** — search + facets (provider, openness, availability, capability, context, local) |
| `model.html?slug=` | Model profile — capabilities, licence, pricing, alternatives, **Sources**, JSON-LD |
| `find-model.html` | **Find my model** — deterministic requirement scoring |
| `model-compare.html?slugs=a,b` | **Model Battle** — 2–4 models, key differences |
| `run-local.html` | Local-capable models grouped by runner |
| `ai-explorer.html` | 20 open-source AI GitHub projects, filterable by category |

Every model fact is traceable through `sources[]`, and volatile values carry their own
timestamps (`pricingVerifiedAt`, `starsVerifiedAt`, `lastVerified`).

## Run models locally

34 of the 50 models can run on your own hardware. `run-local.html` groups them by runner —
**Ollama**, **llama.cpp**, **MLX**, **vLLM**, **Transformers**, **LocalAI**, **LM Studio**,
**TGI** — using only what the model card documents. Hardware requirements are never invented;
where they vary by quantisation the page says so.

## Development

`fetch()` needs HTTP — do not open `index.html` from the filesystem.

```bash
npm ci                     # clean, lockfile-exact install
npm run build              # regenerate all derived data + SEO blocks
npm run check              # schema + cross-refs + drift + links + HTML + models
npx http-server -p 4173    # or: python -m http.server 4173
```

Then open <http://localhost:4173>.

Optional, network-dependent (not run in CI):

```bash
node scripts/check-links.mjs --net        # reachability of every external CLI URL
node scripts/check-model-links.mjs --net  # reachability of every model/project URL
npm run model-stats                       # human-readable AI dataset roll-up
```

## Data architecture

Two independent datasets, each with its own ids, slugs, schema, validators and statistics.

**CLI tools**

```
data/registry.json           upstream harness CLIs (79)        ─┐
data/public_registry.json    upstream public CLIs (24)          │
data/catalog_registry.json   hand-curated CLI catalog (397)     ├─ build inputs
data/registry-dates.json     last-verified dates               ─┘
data/overlay.json            human-verified facts, by slug  ── contributor-editable
        │  scripts/build-data.mjs   (deterministic, no network)
        ▼
data/clis.json               normalized entries the site loads      (generated)
data/meta.json               facet counts                           (generated)
```

**AI models**

```
data/models/*.json           per-group model records, each with sources[]  ── contributor-editable
data/ai-projects.json        GitHub AI projects (GitHub-API verified)      ── contributor-editable
        │  scripts/build-data.mjs
        ▼
data/models.json             merged, normalized                            (generated)
data/model-meta.json         facet counts + project meta                   (generated)
```

**Never hand-edit generated files** — `data/clis.json`, `data/meta.json`,
`data/models.json`, `data/model-meta.json`, `sitemap.xml`, `robots.txt` and the
`<!-- SEO:auto -->` blocks in the HTML are all rewritten by `npm run build`, and a drift
gate in `npm run check` fails if they are out of date.

## Validation

`npm run check` runs, in order:

| Step | What it enforces |
|---|---|
| `validate` | JSON Schema 2020-12 for entries and stacks; unique ids/slugs; resolving `alternatives`/`related`; **size gate: exactly 500 tools, 500 unique ids, 500 unique slugs, 0 duplicates** |
| `check:drift` | Rebuilds in memory and fails if any generated file is stale |
| `check:links` | Missing/case-mismatched local refs, broken anchors, duplicate ids, missing `alt`, `target="_blank"` without `rel="noopener"`, stray `localhost`/`TODO`/`console.log` |
| `check:html` | `html-validate` across every page |
| `check:models` | Model + project schemas, unique ids/slugs, openness enum, resolving cross-references, URL well-formedness |

Expected output:

```
CLI DATA VALIDATION
Total tools: 500
Unique IDs: 500
Unique slugs: 500
Duplicate IDs: 0
Duplicate slugs: 0
PASS
```

## Deployment

`.github/workflows/deploy-pages.yml` builds, validates and publishes to GitHub Pages on
every push to `main`; a failing schema, dangling reference or drift blocks the deploy.
One-time repository setup: **Settings → Pages → Source: GitHub Actions**.

Static assets are content-hash stamped (`?v=<sha1>`) at build time, so a returning visitor
never runs a stale bundle against fresh data.

## Contributing

Good first contributions: verify a tool's facts, add install examples, propose a stack,
improve model sourcing. See **[CONTRIBUTING.md](CONTRIBUTING.md)** for the exact steps for:

- adding a CLI tool · correcting CLI facts · adding an AI model
- adding an AI GitHub project · editing a stack · validating · opening a PR

Also: [Code of Conduct](CODE_OF_CONDUCT.md) · [Security policy](SECURITY.md) ·
[Model data rules](docs/MODEL-DATA.md) · [Roadmap](ROADMAP.md)

## License

Apache-2.0 — see [LICENSE](LICENSE).

The `registry.json` / `public_registry.json` snapshots come from the upstream
[CLI-Anything](https://github.com/HKUDS/CLI-Anything) project. The curated catalog in
`data/catalog_registry.json` is maintained in this repository — one real tool per entry,
with facets derived by the build.

---

<div align="center">

**Found this useful?** ⭐ Star the repo, [open an issue](https://github.com/mughil/CLI_CODE/issues/new/choose)
with a tool or model we're missing, or send a PR.

[Live demo](https://mughil.github.io/CLI_CODE/) · [Issues](https://github.com/mughil/CLI_CODE/issues) · [Contributing](CONTRIBUTING.md)

</div>
