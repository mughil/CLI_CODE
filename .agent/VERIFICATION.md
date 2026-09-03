# CLI_CODE — verification log

Updated: 2026-09-03 · HEAD fdc61d6 · live https://mughil.github.io/CLI_CODE/

## Production-readiness pass (HEAD fdc61d6)
- `npm ci` clean install + `npm audit` → **0 vulnerabilities**.
- `npm run check` → PASS (500/500/500 + schema + drift + links + html + models + 124 model URLs well-formed).
- `node scripts/check-links.mjs --net` → **505 reachable, 0 dead**, 7 inconclusive
  (5× www.gnu.org/software/* + renderdoc.org + open.work.weixin.qq.com — all
  canonical official URLs; those hosts block automated clients / geo-restrict).
- `node scripts/check-model-links.mjs --net` → **all 124 model/project URLs reachable**.
- Data fixes: dog→github.com/ogham/dog, curlie→github.com/rs/curlie (curlie.io
  had lapsed to a squatter domain), dooit→dooit-org.github.io, iotop→Tomas-M/iotop,
  websocketd http→https. anygen/intelwatch/stata dead upstream links suppressed
  via data/overlay.json (explicit null; entries stay dataQuality "derived").
- Security: 404.html <base href> segment restricted to [A-Za-z0-9._-]; XSS review
  of all URL-param sinks (escapeHtml) clean; all target=_blank carry rel=noopener;
  no inline handlers / eval / document.write (except the hardened 404 base trick).
- A11y: Lighthouse **A100 / B100 / SEO100 on all 16 pages** (mobile). .star toggle
  now 24×24 (32 on coarse pointers); .linklike tap padding on touch. Skip link,
  landmarks, aria-live count, :focus-visible outlines all present.
- Responsive: 375 (mobile) + 768 (tablet) + desktop — **no page-level horizontal
  scroll**; wide tables scroll inside .table-scroll.
- Perf (live, mobile Lighthouse): registry **P98**, cli **P100**, index **P98**,
  models **P99** — all A/B/SEO 100. registry.js builds the 500-item search index
  lazily (first query, warmed via requestIdleCallback), not on load.
- Functional (live): Browse "500 of 500", 60-row cap + show-all, search finds
  catalog tools, category/source filters, sort, favourites + compare persist to
  localStorage (clicode:state), saved.html renders them, keyboard nav lifts the
  row cap, zero console/JS errors. cli-ld / model-ld JSON-LD parse valid.


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
