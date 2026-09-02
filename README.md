# CLI-Anything Hub — updated build

A static rebuild of the [CLI-Anything](https://github.com/HKUDS/CLI-Anything) hub site with a
reworked registry experience. No framework, no build step — plain HTML/CSS/JS.

## Pages

| Page | What it does |
|------|--------------|
| `index.html` | Hero, live stats, both install paths (agents + `pip` toolkit), demo strip, matrices teaser |
| `registry.html` | Searchable registry: instant filter by name/purpose, **harness / public** toggle, category filter, sortable columns, per-CLI detail drawer with copyable install/update/uninstall commands. Filter + open CLI are written to the URL, so any view is shareable. |
| `matrices.html` | Capability matrices with CLI chips (linking into the registry) and expandable capability/provider lists |

## Design system

`design-system/cli-anything-hub/MASTER.md` — generated with the ui-ux-pro-max skill.
"Code dark + run green": slate `#0f172a` base, green `#22c55e` accent, IBM Plex Sans + JetBrains Mono.
Dark is the default; a tuned light theme is available via the header toggle (persisted to `localStorage`).

## Data

`data/*.json` is pulled from the live registry:

- `registry.json` — CLI-Anything harness CLIs
- `public_registry.json` — third-party / official CLIs
- `matrix_registry.json` — capability matrices
- `registry-dates.json` — last-updated dates keyed by CLI name

Replace these files to update the catalog — the UI re-renders from them, nothing is hardcoded.

## Run locally

`fetch()` needs HTTP, not `file://`:

```bash
python -m http.server 4173
```

Then open <http://localhost:4173/>. A `.claude/launch.json` is included for the Claude Code `/run` flow.

## Deploy

Any static host (GitHub Pages, Netlify, Cloudflare Pages, `nginx`). Serve the folder root as-is.

## License

Apache-2.0, matching the upstream project.
