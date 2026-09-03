# CLI_CODE — project state

Updated: 2026-09-03

## Counts
- CLI_COUNT: 500 (79 harness + 24 public + 397 curated catalog); `npm run check`
  size gate fails CI unless total == unique ids == unique slugs == 500
- MODEL_COUNT: 50 / >=50
- GITHUB_AI_PROJECT_COUNT: 20

## CLI registry — 500 tools (COMPLETE + DEPLOYED)
- Root cause of "UI stuck at 103": none. data.js fetches data/clis.json
  (cache:'no-cache'); every count is dynamic; no service worker; no hardcoded
  103. The canonical source data simply held 103 records.
- data/catalog_registry.json — new canonical source, 397 hand-curated REAL CLI
  tools (git, docker, kubectl, terraform, ripgrep, neovim, ffmpeg, ...). Each is
  a real project w/ homepage + install cmd; facets derived by build-data.mjs.
- build-data.mjs: merges harness(79)+public(24)+catalog(397)=500; reads raw
  license/language; content-hash `?v=` cache-busting on every assets/{js,css}
  reference so returning visitors never run a stale bundle.
- scripts/validate-data.mjs: hard size gate — prints the "CLI DATA VALIDATION …
  PASS" block, fails unless 500/500/500/0/0 (EXPECT_TOOLS=<n> to change).
- schema/cli.schema.json: source enum adds "catalog".
- registry.js: initial table render capped at 60 rows (+ "show all"; keyboard
  nav lifts it) — mobile Lighthouse 85 -> 97.
- Docs: README / ROADMAP / CONTRIBUTING / docs.html / index.html / .agent all
  updated. "500" is in ROADMAP > Shipped.

## AI hub — COMPLETE + DEPLOYED (batches 1–10)
- schema/{model,aiproject}.schema.json, scripts/{validate-models,model-stats,
  check-model-links}.mjs, docs/MODEL-DATA.md
- data/models/*.json (50) + data/ai-projects.json (20) -> data/models.json +
  data/model-meta.json. 18 providers · 22 open-source · 11 open-weight ·
  13 api-only · 34 local-capable · 37 API-available. Every field sourced.
- UI: models.html, model.html?slug=, find-model.html, model-compare.html,
  run-local.html, ai-explorer.html (+ their assets/js).

## Deployment (origin/main, GitHub Pages)
- HEAD 50e22d5. Live: https://mughil.github.io/CLI_CODE/
- Key commits: b448af3 (CI SITE_URL) · 405a337 (canonical injector) ·
  8e643b6 (a11y dlitem) · 9b22870 (CI actions -> Node 24 majors) ·
  9c56a85 (registry -> 500) · d978ba2 (registry 60-row cap) ·
  ebb0e2c / 50e22d5 (docs + agent state).
- deploy-pages.yml: checkout@v5, setup-node@v5 (node 24), configure-pages@v6,
  upload-pages-artifact@v4, deploy-pages@v5. Job-level SITE_URL set.
- GitHub Actions runs #7–#12 all build + deploy success.

## Verification (live production)
- HTTP: all core + AI pages + data + assets 200.
- data/clis.json: count 500, 500 unique ids, 500 unique slugs, 0 dup;
  sources {catalog 397, harness 79, public 24}.
- UI: registry "500 of 500 tools" (60 rows + show all -> 500); search finds
  catalog tools (ripgrep/kubectl/ffmpeg/neovim/terraform); source=catalog -> 397;
  cli.html detail for new tools OK ("curated catalog" pill); home "500 tools ·
  53 categories · 25 curated"; Find My CLI / Compare / Stacks OK; AI hub
  "50 of 50 models" OK; zero console errors.
- Lighthouse (live, mobile): registry P97 A100 B100 SEO100 · cli P99 · index P99
  · models P98 · model P99 · find-model P99 · ai-explorer P95-100.
- Fresh-directory ZIP test: npm install + build + check ->
  "Total tools: 500 / Unique IDs: 500 / Unique slugs: 500 / PASS" + all other
  validators green.

## Do NOT
- run `git checkout -- .`
- fabricate model or tool facts
- call open-weight "open source"
