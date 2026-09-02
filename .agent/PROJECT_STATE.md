# CLI_CODE — project state

Updated: 2026-09-03

## Counts
- CLI_COUNT: 103 / 500  *(blocked — no verified source for +397; tracked in ROADMAP, not a delivery gate)*
- MODEL_COUNT: 13 / >=50   (Batch 1 committed)
- GITHUB_AI_PROJECT_COUNT: 0

## AI hub — batch progress
- [x] Infra: schemas, 3 validators, `npm run check:models` wired into `npm run check`
- [x] `docs/MODEL-DATA.md`
- [x] Batch 1 — frontier + reasoning (13 models: OpenAI GPT-5.6 Sol/Terra/Luna,
      Anthropic Fable 5.1 / Opus 5 / Sonnet 5 / Haiku 4.5, Google Gemini 3.8 Flash /
      3.1 Pro / 2.5 Pro / 2.5 Flash, xAI Grok 4.6 / 4.3). All api-only, sourced.
- [ ] Batch 2 — open-source / open-weight (Llama 4.x, DeepSeek V3.x/R1.x, Qwen3,
      Mistral, Gemma 3, Phi, OLMo, Falcon, Command) — needs HF/official verification
- [ ] Batch 3 — coding (Qwen3-Coder, DeepSeek-Coder, Codestral, GPT-5.x-Codex, StarCoder2)
- [ ] Batch 4 — multimodal / vision / audio / speech
- [ ] Batch 5 — small / local (Gemma 3n, Phi mini, Qwen3 0.6-4B, SmolLM, Llama 3.2 1/3B)
- [ ] Batch 6 — embeddings + other
- [ ] Batch 7 — data/ai-projects.json (llama.cpp, Ollama, vLLM, Transformers,
      LangChain, LlamaIndex, DSPy, Aider, OpenHands, LiteLLM, …) via live GitHub
- [ ] Batch 8 — UI: models.html (search+facets), model.html?slug=, model-compare.html,
      find-model.html, run-local.html, ai-explorer.html + assets/js/model*.js;
      reuse the CLI search/data/store patterns
- [ ] Batch 9 — SEO (model pages -> sitemap), nav, CI job, README/ROADMAP updates
- [ ] Batch 10 — ZIP verify in clean dir + push + GitHub Actions + live verify

## Perf/a11y pass — DONE, committed (a2a4d47, 28b1594, a4f0177). NOT pushed.
index P98 · registry P99 · cli/saved/compare P100 · find/stacks/docs P97-100
A11y 100 · Best-practices 100 · SEO 100 (indexed pages).

## Do NOT
- run `git checkout -- .` (discarded uncommitted work twice)
- fabricate model facts — omit unverified fields
- call open-weight models "open source"
