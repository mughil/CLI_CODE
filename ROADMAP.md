# Roadmap

Direction, not dates. Scope: keep it self-contained, client-side, and honest
about data.

## Shipped

- **CLI dataset — 500 tools.** 79 agent-native harnesses (HKUDS/CLI-Anything) +
  24 public CLIs + a 397-entry hand-curated catalog (`data/catalog_registry.json`)
  of widely-used real developer command-line tools, merged by `build-data.mjs`.
  A size gate in `npm run check` fails CI unless the active dataset is exactly
  500 unique ids/slugs (`EXPECT_TOOLS` to change). Content-hash `?v=` cache
  busting on every JS/CSS asset so returning visitors never run a stale bundle.
- **AI model intelligence hub** — 50 source-linked models (18 providers),
  20 GitHub-API-verified OSS projects, 6 UI surfaces (Models, model profile,
  Find my model, Model Battle, Run locally, AI OSS explorer), separate schema +
  validators + `docs/MODEL-DATA.md`. Open-source vs open-weight classified by
  license.

## Now

- **Grow the model dataset** past 50 — Nemotron, Jamba variants, more small
  local models, image/video/audio families — every field source-linked.
- **Model pricing freshness** — a scheduled job to re-verify `pricingVerifiedAt`.

- **Grow the verified overlay.** 25 / 500 tools have deep hand-checked profiles
  (`useCases`, `alternatives`, `difficulty`, `examples[]`). The other 475 carry
  a real summary, category, language, license and install command but derive the
  rest. Every promoted profile improves Find, Compare and Stacks at once —
  prioritise the widely-used catalog and public CLIs.
- **Examples.** Almost no entry has `examples[]` yet — the piece the cheat sheet
  most wants.

## Next

- **Compare presets** — one click to compare the alternatives of the tool
  you're viewing.
- **Keyword landing pages** — static, indexable pages for high-intent queries
  ("best DevOps CLI tools", "terminal utilities") built from the dataset.
- **`og:image`** — a generated 1200×630 card per page.
- **Search quality** — typo tolerance, synonym coverage, per-token weighting
  tuned against a small labelled query set.
- **Data provenance** — show the source and date for each verified field.

## Later

- **Offline / PWA** — the dataset is small; a service worker makes the whole
  directory work offline.
- **Alternate dataset sources** — a documented adapter so other CLI registries
  can feed the same UI.
- **i18n** of the interface strings.

## Non-goals

- A backend, accounts, or server-side search.
- Runtime dependencies in the shipped site.
- Inventing tool facts to fill columns.
