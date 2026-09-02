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

The tool list itself comes from the upstream
[CLI-Anything](https://github.com/HKUDS/CLI-Anything) registry snapshots in `data/`.
To propose a brand-new tool, open an issue using the **Add CLI** template.

## Schemas

- `schema/cli.schema.json` — a built entry
- `schema/stack.schema.json` — a stack preset

## Code

Site code is dependency-free vanilla JS/CSS. Keep it that way. Node is for the
build and CI only.
