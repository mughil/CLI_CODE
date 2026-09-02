# RESUME

Read this first. Continue without redoing completed work.

## Where we are
AI/LLM intelligence expansion, **Batch 1 (frontier + reasoning)** in progress.

## Done
- Perf/a11y pass fully complete + committed (a2a4d47, 28b1594, a4f0177). NOT pushed.
- AI infra committed: `schema/model.schema.json`, `schema/aiproject.schema.json`,
  `scripts/{validate-models,model-stats,check-model-links}.mjs`, `.agent/*`.

## Next actions (in order)
1. Finish Batch 1: populate `data/models/frontier.json` + `data/models/reasoning.json`
   with web-verified frontier/reasoning models (OpenAI, Anthropic, Google, xAI,
   DeepSeek, Qwen, Mistral, Meta, Microsoft…). Each record needs `sources[]`.
2. `node scripts/validate-models.mjs` must pass. `git commit` checkpoint.
3. Batches 2-6 (see PROJECT_STATE.md).
4. `data/ai-projects.json` (Batch 7).
5. Build UI (Batch 8): reuse the CLI patterns — `models.html` (search+facets),
   `model.html?slug=`, `model-compare.html`, `find-model.html`, `run-local.html`,
   `ai-explorer.html`. Add model.js loader like data.js.
6. Wire `validate-models` + `check-model-links` into `npm run check` and CI.
7. `docs/MODEL-DATA.md`. SEO: add model pages to sitemap.
8. ZIP + push + deploy + live verify.

## Guardrails
- Never fabricate. Unknown > fabricated. Every fact -> a source in `sources[]`.
- open-weight != open-source. Classify by actual license.
- No hard-coded star counts without live retrieval + `starsVerifiedAt`.
- Keep Lighthouse: Perf>=95, A11y 100, BP 100, SEO 100.
- Do NOT run `git checkout -- .` (it discarded uncommitted work twice this project).
- Commit after every batch.
