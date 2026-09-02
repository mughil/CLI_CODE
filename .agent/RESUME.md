# CLI_CODE — project state

Updated: 2026-09-03

## Counts
- CLI_COUNT: 103 / 500  *(blocked — no verified source for +397; ROADMAP backlog, not a gate)*
- MODEL_COUNT: 33 / >=50   (Batches 1, 2, 2b, 2c, 3, 5, 6 done)
- GITHUB_AI_PROJECT_COUNT: 0

## Model dataset (data/models/*.json — validator globs all)
- frontier.json (13): OpenAI GPT-5.6 Sol/Terra/Luna · Anthropic Fable 5.1/Opus 5/Sonnet 5/Haiku 4.5 · Google Gemini 3.8 Flash/3.1 Pro/2.5 Pro/2.5 Flash · xAI Grok 4.6/4.3
- open-weight.json (10): DeepSeek V4-Flash/V4-Flash-Vision · Llama 4 Scout/Maverick · Qwen3.8 27B/Flash-Next/2.4T-A95B · Mistral Small 4 · Gemma 3 27B/4B
- open-weight-2.json (2): Kimi K2 Instruct · GLM-4.6
- open-source.json (4): gpt-oss 120b/20b · OLMo 2 32B · Cohere Command A (research-license)
- coding.json (1): Qwen3-Coder 480B-A35B
- small-local.json (1): Phi-4-mini-instruct
- speech-embeddings.json (2): Whisper large-v3 · Qwen3-Embedding-8B
Every record has sources[]; unverified fields left null with a limitations note.

## Stats: 13 providers · 14 open-source · 5 open-weight · 13 api-only · 1 research-license · 18 local-capable · 28 API

## Remaining to reach >=50 (Batches 4/5/6 continued)
Candidates to verify (fetch each model card for license + context):
- Mistral Large 3, Ministral 3 8B Reasoning, Voxtral (speech), Devstral
- Qwen3.8 small sizes (0.6B–8B), Qwen3-VL, Qwen3.8-Flash-Next specs
- DeepSeek V4-Pro, DeepSeek-OCR
- NVIDIA Nemotron (Llama-Nemotron / Nemotron-H)
- IBM Granite 4, Databricks DBRX successor, Snowflake Arctic successor
- Reka Flash/Core, AI21 Jamba, TII Falcon 3/H1
- Image-gen families in scope: FLUX (Black Forest Labs), Stable Diffusion 3.5, Qwen-Image
- Nomic Embed / BGE-M3 / EmbeddingGemma (embeddings)
- GLM-4.1V-9B-Thinking, Kimi-VL-A3B (small multimodal)
- Perplexity Sonar (api), Amazon Nova, Reka

## Then
- Batch 7: data/ai-projects.json — live GitHub verification (llama.cpp, Ollama, vLLM,
  Transformers, LangChain, LlamaIndex, DSPy, Aider, OpenHands, LiteLLM, vLLM, SGLang,
  text-generation-inference, unsloth, axolotl, PEFT/TRL, LangGraph, CrewAI, Dify, …)
- Batch 8: UI — models.html (search+facets, reuse registry.js pattern), model.html?slug=,
  model-compare.html, find-model.html, run-local.html, ai-explorer.html + assets/js/*
- Batch 9: nav + sitemap (model pages) + SEO + README/ROADMAP + CI job
- Batch 10: ZIP verify clean-dir + push + GitHub Actions + live verify

## Perf/a11y pass — DONE, committed a2a4d47..a4f0177. NOT pushed.
## AI infra + batches — committed ed4f997..c04a3f4. NOT pushed.

## Do NOT
- run `git checkout -- .`
- fabricate model facts — omit unverified fields
- call open-weight "open source"
