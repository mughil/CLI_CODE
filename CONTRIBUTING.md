# Contributing to CLI_CODE

Thanks for helping build the directory. The most valuable contribution is
**accurate data** — a verified licence, a real install command, a use case that
tells someone whether a tool fits.

**One rule above all: never fabricate.** If you cannot verify a fact from the
project's own documentation, leave the field out. `null` beats a guess.

## Contents

- [Set up](#set-up)
- [Generated vs. maintained files](#generated-vs-maintained-files)
- [Add a CLI tool](#1-add-a-cli-tool)
- [Correct or enrich CLI facts](#2-correct-or-enrich-cli-facts)
- [Add an AI model](#3-add-an-ai-model)
- [Add an AI GitHub project](#4-add-an-ai-github-project)
- [Add or change a stack](#5-add-or-change-a-stack)
- [Validate your change](#6-validate-your-change)
- [Open a pull request](#7-open-a-pull-request)
- [Site code](#site-code)
- [Schemas](#schemas)

## Set up

```bash
git clone https://github.com/mughil/CLI_CODE.git
cd CLI_CODE
npm ci          # clean, lockfile-exact install (use this, not `npm install`)
npm run build   # regenerate every derived file
npm run check   # must print PASS before you push
```

To view the site, serve it over HTTP — `fetch()` will not work from `file://`:

```bash
npx http-server -p 4173   # then open http://localhost:4173
```

## Generated vs. maintained files

**Edit these** (source of truth):

| File | Holds |
|---|---|
| `data/catalog_registry.json` | the hand-curated CLI catalog (397 entries) |
| `data/overlay.json` | human-verified CLI facts, keyed by slug |
| `data/models/*.json` | AI model records, grouped |
| `data/ai-projects.json` | open-source AI GitHub projects |
| `data/stacks.json` | curated stack presets |
| `data/registry.json`, `data/public_registry.json` | upstream snapshots — change only to fix a broken upstream field |

**Never hand-edit these** — `npm run build` rewrites them, and `npm run check` fails
if they are stale:

`data/clis.json` · `data/meta.json` · `data/models.json` · `data/model-meta.json` ·
`sitemap.xml` · `robots.txt` · the `<!-- SEO:auto -->` and `<!-- LD:auto -->` blocks
in the HTML files · the `?v=<hash>` asset stamps.

Run `npm run build` and **commit the regenerated files** with your change.

---

## 1. Add a CLI tool

The dataset is held at **exactly 500 tools** by a size gate in `npm run check`.
Adding one therefore means either removing one, or raising the gate deliberately.

If you just want to *propose* a tool, skip the code and
[open an "Add a CLI" issue](https://github.com/mughil/CLI_CODE/issues/new/choose) —
that is a genuinely useful contribution on its own.

To add it yourself, append an entry to **`data/catalog_registry.json`**:

```json
{
  "name": "ripgrep",
  "display_name": "ripgrep",
  "version": "curated",
  "description": "Recursively search directories for a regex pattern with automatic .gitignore filtering.",
  "requires": "cross-platform",
  "homepage": "https://github.com/BurntSushi/ripgrep",
  "source_url": "https://github.com/BurntSushi/ripgrep",
  "install_cmd": "brew install ripgrep",
  "category": "search",
  "language": "Rust",
  "license": "MIT / Unlicense"
}
```

Rules:

- **A real, maintained project.** No placeholders, no duplicates of an existing slug,
  no counting an alias as a second tool.
- `name` becomes the slug (lower-cased, non-alphanumerics → `-`). It must be unique.
- `homepage` must be live and canonical. Prefer the project's own site; use the GitHub
  repo when there is no site, or when the vanity domain has lapsed.
- `install_cmd` must be a command that actually installs the tool on a mainstream
  platform.
- Everything else (tags, platforms, package managers, runtime) is **derived by the
  build** — do not add it by hand.

Then, if you are keeping the count at 500, remove one entry in the same PR and say
which and why. To change the target size instead, update the gate deliberately:

```bash
EXPECT_TOOLS=501 npm run check
```

and raise the default in `scripts/validate-data.mjs` in the same PR.

## 2. Correct or enrich CLI facts

This is the highest-value, lowest-friction contribution — about five minutes.

1. Find the slug. It is in the page URL: `cli.html?slug=<slug>`.
2. Add or edit that slug's block in **`data/overlay.json`**:

```json
"ripgrep": {
  "language": "Rust",
  "license": "MIT OR Unlicense",
  "platforms": ["linux", "macos", "windows"],
  "difficulty": "beginner",
  "useCases": ["Fast recursive code search", "Filtering large logs"],
  "examples": [
    { "title": "Search a word, ignore case", "command": "rg -i TODO" }
  ],
  "alternatives": ["fd"],
  "related": ["fzf"]
}
```

Rules:

- Set **only what you can verify** from the tool's own docs. Omit the rest.
- `difficulty`: `beginner` | `intermediate` | `advanced`.
- `platforms` items: `linux` | `macos` | `windows` | `web` | `cross-platform`.
- `alternatives` / `related` must be slugs that already exist — a dangling reference
  fails CI.
- To suppress a dead upstream link, set it explicitly to `null`:
  `"documentation": null`. Do not invent a replacement.

An entry with verified facts is labelled **curated** in the UI; derived-only entries
are labelled as such. Both are fine — the label is the point.

## 3. Add an AI model

Edit the right group file in **`data/models/`** (`frontier`, `open-weight`, `coding`,
`small-local`, `multimodal-more`, …).

Required: `id` and `slug` (identical, kebab-case), `name`, `provider`, `modelType[]`,
`categories[]`, `availability[]`, `openSourceStatus`, `lastVerified`, and at least one
entry in `sources[]`.

```json
{
  "id": "example-model-8b",
  "slug": "example-model-8b",
  "name": "Example Model 8B",
  "provider": "Example AI",
  "modelType": ["text"],
  "categories": ["general-purpose", "small-language-model"],
  "availability": ["download", "local"],
  "openSourceStatus": "open-source",
  "license": "Apache-2.0",
  "lastVerified": "2026-09-03",
  "sources": [
    {
      "type": "model-card",
      "url": "https://huggingface.co/example/model-8b",
      "title": "Example Model 8B model card",
      "verifiedAt": "2026-09-03"
    }
  ]
}
```

Rules:

- **`openSourceStatus` reflects the licence, not downloadability.** Use
  `open-source` (OSI-style: Apache-2.0, MIT), `open-weight` (Llama / Gemma / custom
  restricted), `proprietary`, `api-only`, `research-license`,
  `commercial-use-restricted`, or `other-unknown`. Downloadable weights under a
  custom licence are **open weight**, never "open source".
- Every non-obvious fact must be reachable from `sources[]`.
- Volatile values need their own timestamp: `pricing` → `pricingVerifiedAt`,
  `stars` → `starsVerifiedAt`, availability → `availabilityVerifiedAt`.
- `alternatives` / `related` must resolve to existing slugs.
- No invented benchmark numbers. If you include one, record the benchmark name,
  score, evaluation source, date and model version.

Full rules and the DISCOVER → VERIFY → NORMALIZE → VALIDATE → REVIEW → PUBLISH
workflow: [`docs/MODEL-DATA.md`](docs/MODEL-DATA.md).

## 4. Add an AI GitHub project

Edit **`data/ai-projects.json`**. Verify every field against the GitHub API:

```bash
curl -s https://api.github.com/repos/OWNER/REPO \
  | jq '{stargazers_count, license: .license.spdx_id, language, description}'
```

```json
{
  "id": "example-runner",
  "slug": "example-runner",
  "name": "Example Runner",
  "summary": "One sentence on what it does and why someone would reach for it.",
  "category": ["local-runner", "inference"],
  "repository": "https://github.com/example/runner",
  "officialDocs": "https://example.dev",
  "language": "Go",
  "license": "MIT",
  "stars": 12345,
  "starsVerifiedAt": "2026-09-03",
  "lastVerified": "2026-09-03",
  "sources": [
    { "type": "api", "url": "https://api.github.com/repos/example/runner",
      "title": "GitHub API", "verifiedAt": "2026-09-03" }
  ]
}
```

**Never hard-code a star count you did not fetch**, and always set `starsVerifiedAt`.
If the API returns `NOASSERTION` for the licence, use `null` rather than guessing.

## 5. Add or change a stack

Edit **`data/stacks.json`**. Every `picks[].slug` must exist in the dataset, and each
pick needs a one-line `role` explaining why it is in the stack. Keep a stack to 12
tools or fewer. If coverage in a discipline is thin, add a `note` saying so rather than
padding it out.

## 6. Validate your change

From a clean tree:

```bash
npm ci
npm run build
npm run check
```

`npm run check` must exit 0 and print:

```
CLI DATA VALIDATION
Total tools: 500
Unique IDs: 500
Unique slugs: 500
Duplicate IDs: 0
Duplicate slugs: 0
PASS
```

Optional, network-dependent (not run in CI, and it can report false positives for
sites that block automated clients):

```bash
node scripts/check-links.mjs --net
node scripts/check-model-links.mjs --net
```

**Never weaken a check to make it pass.** If the size gate or a schema blocks you,
that is the gate doing its job — fix the data, or change the gate deliberately and say
so in the PR.

## 7. Open a pull request

1. Branch: `git checkout -b data/add-ripgrep-facts` (or `feat/…`, `fix/…`, `docs/…`).
2. Commit the **source** change *and* the regenerated files from `npm run build`.
3. Push and open a PR. Fill in the template — especially which source you verified
   against.
4. CI runs `npm ci && npm run build && npm run check`. A failing schema, a dangling
   reference or generated-file drift blocks the merge.

Small, single-purpose PRs get reviewed fastest. A PR that fixes one tool's licence is
very welcome.

## Site code

The shipped site is dependency-free vanilla HTML/CSS/JS. Please keep it that way:

- No frameworks, no bundler, no runtime `<script src>` to a third party.
- Node is for the build and CI only; `devDependencies` never reach the browser.
- Everything user-controlled goes through `window.CLISearch.escapeHtml` before it
  touches `innerHTML`.
- External links need `target="_blank" rel="noopener noreferrer"` — `check:links`
  enforces it.
- Keep paths relative so the site works at `/` and at `/CLI_CODE/`.
- Preserve keyboard support, focus visibility and the existing `localStorage` schema.

## Schemas

| Schema | Validates |
|---|---|
| `schema/cli.schema.json` | a built CLI entry |
| `schema/stack.schema.json` | a stack preset |
| `schema/model.schema.json` | an AI model record |
| `schema/aiproject.schema.json` | an AI GitHub project |

By participating you agree to the [Code of Conduct](CODE_OF_CONDUCT.md) and to license
your contribution under [Apache-2.0](LICENSE).
