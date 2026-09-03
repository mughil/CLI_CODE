# CLI_CODE — verification log

Updated: 2026-09-03 · HEAD 50e22d5 · live https://mughil.github.io/CLI_CODE/

## `npm run check` (local + CI, GitHub Actions runs #9–#12 all green)
```
CLI DATA VALIDATION
Total tools: 500
Unique IDs: 500
Unique slugs: 500
Duplicate IDs: 0
Duplicate slugs: 0
PASS
```
\+ schema (500 entries + 7 stacks, 27 cross-refs) · drift gate · check:links
(16 html / 25 js) · html-validate · check:models (50 models, 20 projects,
124 URLs well-formed).

## Fresh-directory ZIP test (CLI_CODE-FINAL.zip)
Extract to empty dir, no .git / no node_modules → `npm install && npm run build
&& npm run check` → all of the above green. Built data/clis.json count = 500.

## Live production (curl + browser)
- HTTP 200: all 10 CLI pages, 6 AI pages, 404, data/{clis,meta,catalog_registry,
  models}.json, sitemap.xml, robots.txt, css/js assets.
- data/clis.json: count 500 · 500 unique ids · 500 unique slugs · 0 dup ·
  sources {catalog 397, harness 79, public 24}.
- data/meta.json counts: {total 500, harness 79, public 24, catalog 397, curated 25}.
- Browse UI: "500 of 500 tools"; 60 rows initial + "show all" → 500;
  search ripgrep/kubectl/ffmpeg/neovim/terraform all resolve to catalog entries;
  source=catalog → 397; category=kubernetes → 18.
- cli.html?slug=ripgrep: "ripgrep", "curated catalog" pill, brew install ripgrep.
- index.html: "500 tools · 53 categories · 25 curated".
- Find My CLI / Compare / Stacks: OK. AI hub models.html: "50 of 50 models".
- Console: zero errors on every page checked.
- Assets cache-stamped: registry.js?v=b2168535, data.js?v=5b049d0c, etc.
- Canonical: https://mughil.github.io/CLI_CODE/<page> (real host).

## Lighthouse (live, mobile)
registry P97 A100 B100 SEO100 · cli P99 · index P99 · models P98 · model P99 ·
find-model P99 · ai-explorer P95–100. All A100 / B100 / SEO100.

## Do NOT
- run `git checkout -- .`
- fabricate model or tool facts
- call open-weight "open source"
