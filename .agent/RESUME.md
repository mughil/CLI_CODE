# CLI_CODE — project state

Updated: 2026-09-03

## Counts
- CLI_COUNT: 500 (79 harness + 24 public + 397 curated catalog); npm run check size gate enforces exactly 500 unique ids/slugs
- MODEL_COUNT: 50 / >=50  ✅
- GITHUB_AI_PROJECT_COUNT: 20

## AI hub — COMPLETE (batches 1–10)
- Infra: schema/model.schema.json, schema/aiproject.schema.json,
  scripts/{validate-models,model-stats,check-model-links}.mjs, docs/MODEL-DATA.md
- Data: data/models/*.json (50, per-group) + data/ai-projects.json (20),
  merged by build-data.mjs -> data/models.json + data/model-meta.json
- 18 providers · 22 open-source · 11 open-weight · 13 api-only ·
  1 research-license · 34 local-capable · 37 API-available. Every field sourced.
- UI: models.html, model.html?slug=, find-model.html, model-compare.html,
  run-local.html, ai-explorer.html + assets/js/{modeldata,models,model,
  find-model,model-compare,run-local,ai-explorer}.js
- Nav: "Models" added everywhere. Sitemap + SEO + docs + README + ROADMAP +
  CONTRIBUTING updated. `npm run check` includes check:models.

## Verification (mobile Lighthouse, gzip server ≈ production)
- models P98 · model P100 · find-model P100 · compare P100 · run-local P100 ·
  ai-explorer P95 — all A100 (a11y) B100 SEO100, CLS <= 0.08
- Fresh-extract ZIP test: npm install + build + check all green (16 html, 25 js)

## Pending
- git push (24 commits ahead of origin/main including the perf/a11y pass and
  the whole AI hub)
- GitHub Actions run + live verification at https://mughil.github.io/CLI_CODE/

## Do NOT
- run `git checkout -- .`
- fabricate model facts
- call open-weight "open source"

## CLI registry -> 500 (2026-09-03, commits 9c56a85 / d978ba2)
- Root cause of "still 103": none. data.js fetches data/clis.json (cache:no-cache),
  every count dynamic, no service worker, no hardcoded 103. Source data was 103.
- data/catalog_registry.json = new canonical source: 397 hand-curated REAL CLI tools.
  build-data.mjs merges harness(79)+public(24)+catalog(397)=500. All ids/slugs unique.
- validate-data.mjs: hard size gate prints "CLI DATA VALIDATION ... PASS", fails
  unless total==uniqIds==uniqSlugs==500 (EXPECT_TOOLS override). In npm run check + CI.
- build-data.mjs: content-hash ?v= cache-busting on all assets/{js,css} refs (STEP 10).
- registry.js: initial render capped at 60 rows (+ "show all") -> mobile perf 85 -> 97.
- Live verified: registry "500 of 500", search finds kubectl/ripgrep/ffmpeg,
  source=catalog filter -> 397, cli.html detail for new tools, home "500 tools",
  Find My CLI + Compare + Stacks OK, AI hub 50 models OK, zero console errors.
- Lighthouse live: registry P97 A100 B100 SEO100, cli P99, index P99.
- GitHub Actions runs #9 #10 success. ZIP fresh-extract: 500 / PASS.
