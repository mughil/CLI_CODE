# Roadmap

Direction, not dates. Scope: keep it self-contained, client-side, and honest
about data.

## Shipped

- **AI model intelligence hub** — 50 source-linked models (18 providers),
  20 GitHub-API-verified OSS projects, 6 UI surfaces (Models, model profile,
  Find my model, Model Battle, Run locally, AI OSS explorer), separate schema +
  validators + `docs/MODEL-DATA.md`. Open-source vs open-weight classified by
  license.

## Now

- **CLI dataset → 500.** Currently 103 verified entries from the
  HKUDS/CLI-Anything snapshots. Expanding to 500 needs a real source for the
  additional tools — no fabrication. Tracked here as a target, not a gate.
- **Grow the model dataset** past 50 — Nemotron, Jamba variants, more small
  local models, image/video/audio families — every field source-linked.
- **Model pricing freshness** — a scheduled job to re-verify `pricingVerifiedAt`.

- **Grow the verified overlay.** 25 / 103 tools have hand-checked profiles.
  Every added `useCases` / `alternatives` / `difficulty` improves Find, Compare
  and Stacks at once.
- **Examples.** Almost no entry has `examples[]` yet — the piece the cheat sheet
  most wants. Prioritise the widely-used public CLIs.
- **Fill category gaps** the presets exposed (build/lint/test runners; cloud
  provider CLIs; security tooling).

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
