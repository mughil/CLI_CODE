<!-- Thanks for contributing to CLI_CODE. Small, single-purpose PRs get reviewed fastest. -->

## What this changes



## Type
- [ ] New CLI tool (`data/catalog_registry.json`)
- [ ] CLI facts (`data/overlay.json`)
- [ ] AI model (`data/models/*.json`)
- [ ] AI GitHub project (`data/ai-projects.json`)
- [ ] Stack preset (`data/stacks.json`)
- [ ] Site code / UI
- [ ] Build / CI / docs

## Sources
<!-- Required for any data change. Link the page you verified each fact against. -->



## Checklist
- [ ] `npm ci && npm run build && npm run check` passes locally
- [ ] `npm run check` prints **Total tools: 500 / Unique IDs: 500 / Unique slugs: 500 / Duplicates: 0 / PASS**
- [ ] Regenerated files are committed (`data/clis.json`, `data/meta.json`, `data/models.json`, `data/model-meta.json`, `sitemap.xml`, `robots.txt`, SEO blocks, asset `?v=` stamps)
- [ ] I did **not** hand-edit a generated file
- [ ] Every data fact is verifiable from the sources above — nothing guessed
- [ ] `alternatives` / `related` reference slugs that exist
- [ ] AI models: `openSourceStatus` reflects the **licence**, not downloadability; volatile values carry their own `*VerifiedAt`
- [ ] No check was weakened to make CI pass
- [ ] Shipped site stays dependency-free (no new runtime `<script src>`)
- [ ] External links use `target="_blank" rel="noopener noreferrer"`

## If this changes the tool count
<!-- The size gate holds the dataset at exactly 500. Say which entry you removed, or why the gate was raised. -->
