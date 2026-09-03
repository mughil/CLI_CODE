# Contributing to CLI_CODE

Thanks for helping build the directory. The most valuable contribution is
**accurate tool data**.

## Add or fix a tool profile (≈5 minutes)

1. Find the tool's `slug` — it's in the URL on its page (`cli.html?slug=<slug>`)
   or the `name` field in `data/clis.json`.
2. Open **`data/overlay.json`** and add/edit the block under that slug:

   ```json
   "ripgrep": {
     "language": "Rust",
     "license": "MIT OR Unlicense",
     "platforms": ["linux", "macos", "windows"],
     "difficulty": "beginner",
     "useCases": ["Fast recursive code search", "Filtering large logs"],
     "alternatives": ["exa"],
     "related": []
   }
   ```

3. Rules:
   - Set **only what you can verify** from the tool's own docs. Leave the rest out.
   - `alternatives` / `related` must be slugs that already exist in the dataset.
   - `difficulty` is one of `beginner` / `intermediate` / `advanced`.
   - `platforms` items: `linux` `macos` `windows` `web` `cross-platform`.
   - Don't guess. Auto-derived entries are clearly labelled; that's fine.

4. Regenerate and validate:

   ```bash
   npm install
   npm run build
   npm run check
   ```

5. Open a PR. CI runs `npm run check`; a failing schema or a dangling
   `alternatives`/`related` reference blocks the merge.

## Add a stack preset

Edit `data/stacks.json`. Each `picks[].slug` must exist in the dataset; give every
pick a one-line `role`. Keep presets to ≤ 12 tools. If coverage is thin, add a
`note` saying so.

## New source entries

The tool list comes from two places in `data/`: the upstream
[CLI-Anything](https://github.com/HKUDS/CLI-Anything) registry snapshots
(`registry.json`, `public_registry.json`), and the hand-curated
`catalog_registry.json` in this repo. To add a mainstream CLI tool, append a
real entry to `catalog_registry.json` (name, display_name, description,
category, homepage, install_cmd) — one real project per entry, no duplicates
of an existing slug — then run `npm run build`. The `npm run check` size gate
holds the active dataset at exactly 500 unique tools, so an addition must be
paired with a removal until the gate is intentionally raised
(`EXPECT_TOOLS=<n>`).
To propose a brand-new tool, open an issue using the **Add CLI** template.

## Schemas

- `schema/cli.schema.json` — a built entry
- `schema/stack.schema.json` — a stack preset

## Code

Site code is dependency-free vanilla JS/CSS. Keep it that way. Node is for the
build and CI only.

## Add or fix an AI model

Edit `data/models/<group>.json` (`frontier`, `open-weight`, `coding`,
`small-local`, ...). Required: `id`/`slug` (equal, kebab-case), `name`,
`provider`, `modelType[]`, `categories[]`, `availability[]`, `openSourceStatus`,
`lastVerified`, `sources[]` (>=1). Everything else only if you can verify it from
an official source -- **omit or `null` otherwise**.

- `openSourceStatus` reflects the **license**, not downloadability:
  `open-source` (Apache-2.0 / MIT), `open-weight` (Llama / Gemma / custom),
  `proprietary`, `api-only`, `research-license`, `commercial-use-restricted`,
  `other-unknown`.
- `alternatives` / `related` must point at slugs that exist.
- Volatile data: pair `pricing` with `pricingVerifiedAt`, etc.

Then `npm run build && npm run check`. Details in `docs/MODEL-DATA.md`.

## Add an AI GitHub project

Edit `data/ai-projects.json`. Verify `stars`, `license`, `language` against
`https://api.github.com/repos/OWNER/REPO` and set `starsVerifiedAt`. Never
hard-code a star count you didn't fetch.
