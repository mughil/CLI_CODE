# CLI_CODE

**An open, self-contained directory of command-line tools for developers.**
Search by task, compare alternatives, assemble a stack, print a cheat sheet — all
client-side. No backend, no tracking, no account.

- **Live demo:** _add your GitHub Pages URL here after first deploy_ (`https://<you>.github.io/CLI_CODE/`)
- **Dataset:** 103 tools, 25 with hand-verified profiles
- **Stack:** vanilla HTML/CSS/JS for the site; Node only for the build + CI

## Why it's different

| | |
|---|---|
| **Task-first** | *Find my CLI* takes a plain-language goal and ranks tools by the tags and use cases that match — and shows you why. |
| **Honest data** | A build step derives what it safely can and leaves the rest empty. Verified facts live in a human-maintained overlay. Nothing is fabricated. |
| **Real comparison** | *Compare* leads with the differences that matter (difficulty, language, license, platform gaps), not a metadata dump. |
| **Portable** | Every path is relative; works at `/` or `/CLI_CODE/`. One JSON dataset drives every page. |

## Pages

| Page | Purpose |
|------|---------|
| `index.html` | Search-first landing — live counts, categories, verified highlights |
| `registry.html` | **Browse** — weighted search, 6 facets, sortable columns, full keyboard control, URL-persisted |
| `cli.html?slug=<slug>` | Canonical tool profile — install, platforms, use cases, alternatives, related |
| `find.html` | **Find my CLI** — deterministic natural-language recommendations with explanations |
| `stacks.html` | **Stacks** — 7 curated tool sets + capability matrices for agents |
| `compare.html?slugs=a,b` | **Compare** 2–4 tools with key differences called out |
| `cheatsheet.html` | Printable command reference for a set / stack / favorites |
| `saved.html` | Favorites, compare queue, recently viewed (local only) |
| `docs.html` | Full documentation |
| `404.html` | Not-found, resolves assets against the site root |

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
data/public_registry.json    upstream public CLIs          ├─ build inputs
data/registry-dates.json     last-verified dates          ─┘
data/overlay.json            human-verified facts, by slug ── contributor-editable
        │  scripts/build-data.mjs  (deterministic, no network)
        ▼
data/clis.json               normalized entries the site loads   (generated)
data/meta.json               facet counts                        (generated)
```

Built entries validate against `schema/cli.schema.json` (JSON Schema 2020-12).
`data/stacks.json` picks must reference real slugs — enforced in CI.

## Contributing

Add or correct a tool's verified facts in `data/overlay.json` (keyed by slug), then
`npm run build && npm run check`. See [`docs.html#contributing`](docs.html) and
`CONTRIBUTING.md`. A failing schema or dangling reference blocks the deploy.

## Deploy

`.github/workflows/deploy-pages.yml` builds, validates and publishes to GitHub Pages
on every push to `main`. One-time: repo **Settings → Pages → Source: GitHub Actions**.

## License

Apache-2.0. Underlying registry data is sourced from the upstream
[CLI-Anything](https://github.com/HKUDS/CLI-Anything) project.
