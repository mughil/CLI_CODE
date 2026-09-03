# CLI_CODE — resume

Updated: 2026-09-03

## Status: COMPLETE — nothing pending
- HEAD 50e22d5 == origin/main. Working tree clean.
- Live: https://mughil.github.io/CLI_CODE/ — GitHub Actions run #12 build+deploy success.

## Counts
- CLI_COUNT: 500 (79 harness + 24 public + 397 curated catalog)
- MODEL_COUNT: 50 ; GITHUB_AI_PROJECT_COUNT: 20

## What's built
- CLI registry expanded to 500 via data/catalog_registry.json (397 real tools),
  merged by build-data.mjs. Hard size gate in scripts/validate-data.mjs +
  `npm run check` + CI: fails unless 500/500/500/0/0 (EXPECT_TOOLS override).
  Asset `?v=` cache busting; registry.js 60-row initial cap + "show all".
- AI hub: 50 source-linked models + 20 GitHub projects + 6 UI surfaces
  (models / model / find-model / model-compare / run-local / ai-explorer).
- deploy-pages.yml on Node-24 action majors (checkout@v5, setup-node@v5,
  configure-pages@v6, upload-pages-artifact@v4, deploy-pages@v5).

## If resuming
- `npm run check` is the gate (schema, drift, links, html, models, 500-size).
- To add a CLI tool: append a real entry to data/catalog_registry.json and
  drop one (or raise EXPECT_TOOLS), then `npm run build`.

## Do NOT
- run `git checkout -- .`
- fabricate model or tool facts
- call open-weight "open source"
