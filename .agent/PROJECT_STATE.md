# CLI_CODE — project state

Updated: 2026-09-03

## Counts
- CLI_COUNT: 103 (verified) — "500" is a ROADMAP target, not a delivery gate (no source for +397; non-fabrication rule stands)
- MODEL_COUNT: 50 / >=50  ✅
- GITHUB_AI_PROJECT_COUNT: 20

## AI hub — COMPLETE + DEPLOYED (batches 1–10)
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

## Deployment (origin/main, GitHub Pages)
- Pushed through commit 8e643b6. Live at https://mughil.github.io/CLI_CODE/
- CI fix b448af3: restored job-level SITE_URL in deploy-pages.yml
- SEO fix 405a337: canonical injector now normalises absolute-placeholder
  hrefs (was only matching "./file" form) — production canonical/og:url now
  use the real host; sitemap.xml + robots.txt verified correct on prod.
- a11y fix 8e643b6: model/cli meta pairs are per-pair <dl class="mg-cell">
  (axe dlitem rule rejects <dt>/<dd> under a <div>).

## Verification (live production, mobile Lighthouse)
- models P98 A100 B100 SEO100 · model P99 A100(after 8e643b6) B100 SEO100 ·
  find-model P99 A100 B100 SEO100 · ai-explorer P90 A100 B100 SEO100
- Live functional check: models list (50/50), model detail, find-model
  (?need deep-link), model-compare (3-way diff), run-local (34/50, by runner),
  ai-explorer (category deep-link), registry, find, stacks, compare — all OK,
  zero console errors.
- Fresh-extract ZIP (CLI_CODE-FINAL.zip): npm install + build + check green
  (16 html, 25 js, 50 models, 20 projects).

## Do NOT
- run `git checkout -- .`
- fabricate model facts
- call open-weight "open source"
