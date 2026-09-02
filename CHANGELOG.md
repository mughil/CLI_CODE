# Changelog

Notable changes. Format loosely follows [Keep a Changelog]; the project is
pre-1.0 and not yet versioned on npm.

## [Unreleased]

### Added
- **Data pipeline** — `scripts/build-data.mjs` merges upstream registry
  snapshots with a human-verified `data/overlay.json` into `data/clis.json` +
  `data/meta.json`. Deterministic; never fabricates domain facts.
- **Schema + validation** — `schema/cli.schema.json`, `schema/stack.schema.json`,
  `scripts/validate-data.mjs` (unique slugs, resolving cross-references),
  `scripts/check-links.mjs` (missing/case-mismatched refs, broken anchors,
  unsafe `target=_blank`, duplicate ids, missing `alt`, stale branding).
- **Browse** (`registry.html`) — weighted client-side search with highlighting,
  six facets + curated toggle, sortable columns, full keyboard control,
  URL-persisted state, per-row favorite and compare controls.
- **Tool pages** (`cli.html?slug=`) — canonical deep-linkable profiles with
  install methods, use cases, alternatives, related tools, `SoftwareApplication`
  JSON-LD.
- **Find my CLI** (`find.html`) — deterministic natural-language recommendations
  with per-result explanations.
- **Stacks** (`stacks.html`) — 7 curated presets from `data/stacks.json` plus
  capability matrices.
- **Compare** (`compare.html`) — 2–4 tools with a key-differences summary and a
  diff-marked field table.
- **Cheat sheets** (`cheatsheet.html`) — printable command reference for a set /
  stack / favorites.
- **Saved** (`saved.html`) — favorites, compare queue, recently viewed;
  versioned `localStorage`, corruption-safe.
- **SEO** — per-page Open Graph / Twitter tags and `sitemap.xml` / `robots.txt`
  generated at build time; `WebSite` + `SearchAction` JSON-LD on the home page.
- **CI** — `ci.yml` (build + validate + HTML validate + Lighthouse) on PRs;
  `deploy-pages.yml` builds, validates and publishes to GitHub Pages.
- Issue templates (Add CLI, Incorrect data, Feature request), PR template,
  `CONTRIBUTING.md`, `ROADMAP.md`.

### Changed
- Rebranded from the CLI-Anything hub clone to **CLI_CODE**; all navigation is
  internal.
- Home page rebuilt search-first.
- `matrices.html` → `stacks.html`.
- `docs.html` and `README.md` rewritten for the current product.

### Removed
- The scroll-driven demo video deck and outbound links from the original clone.
