# Starter issues

Real, scoped work items derived from actual gaps in the repository — no manufactured
bugs. Each one is ready to be opened as a GitHub issue: copy the title, the body and
the labels.

> Maintainer: these have to be created through the GitHub UI or an authenticated
> client. Suggested order — #1, #2, #8 and #13 are the friendliest entry points.

**Suggested labels to create first** (Issues → Labels → New label):
`data` `#0e8a16` · `cli-data` `#0e8a16` · `model-data` `#8b5cf6` · `performance` `#fbca04` · `design` `#d4c5f9`

---

## 1. Add verified facts for 10 CLI tools in a category you know

**Labels:** `good first issue` `help wanted` `documentation`
**Files:** `data/overlay.json`

Only **25 of 500** tools have a curated profile; the other 475 show derived data only
and an empty "Use cases" section. Pick one category (`vcs`, `kubernetes`, `network`,
`database`, …), choose 10 tools you actually use, and add verified `useCases`,
`platforms`, `language`, `license` and `difficulty`.

**Acceptance:** 10 slugs added to `data/overlay.json`; every fact traceable to the
tool's own docs; `npm run build && npm run check` passes; the PR links the sources.

---

## 2. Add runnable `examples[]` to the 20 most-used tools

**Labels:** `good first issue` `help wanted` `documentation`
**Files:** `data/overlay.json`

`cheatsheet.html` exists to print real commands, but almost no entry has `examples[]`,
so printed sheets are mostly empty. Add 2–3 genuinely useful invocations each for
tools like `git`, `ripgrep`, `fd`, `jq`, `docker`, `kubectl`, `ffmpeg`, `curl`, `tmux`.

**Acceptance:** each example has a `title` and a `command` that runs as written;
verified against the tool's own docs or `--help`; cheat sheet renders them.

---

## 3. Add Windows install commands (winget / Scoop / Chocolatey)

**Labels:** `help wanted` `enhancement`
**Files:** `data/overlay.json`

The curated catalog leans on Homebrew. Windows users get an install line they cannot
run. For tools that ship a Windows package, add an extra `install` entry via the
overlay (`winget install BurntSushi.ripgrep`, `scoop install ripgrep`, …).

**Acceptance:** only packages you verified exist in the respective manifest; the
existing install entry is kept, not replaced; `check` passes.

---

## 4. Add Linux distro install commands (apt / dnf / pacman)

**Labels:** `help wanted` `enhancement`
**Files:** `data/overlay.json`

Same gap as #3 for Linux. Add `apt`, `dnf` or `pacman` lines where the package
genuinely exists under that name — package names differ between distros, so please
verify rather than assume.

**Acceptance:** verified package names; no invented packages; `check` passes.

---

## 5. Propose a new developer stack

**Labels:** `good first issue` `enhancement`
**Files:** `data/stacks.json`

There are 7 stacks. Obvious gaps: **data engineering**, **security / pentest**,
**SRE / on-call**, **mobile development**, **technical writing**.

**Acceptance:** ≤ 12 picks, every `picks[].slug` exists in the dataset, each pick has
a one-line `role`; if coverage is thin, add a `note` saying so rather than padding.

---

## 6. Verify the licence for models currently marked `other-unknown`

**Labels:** `help wanted` `data`
**Files:** `data/models/*.json`

`ministral-3-8b-reasoning` carries `openSourceStatus: "other-unknown"` and
`license: null` because no licence could be confirmed at the time of entry. Find the
official model card or repository, confirm the licence, and reclassify.

**Acceptance:** licence confirmed from an official source added to `sources[]`;
`openSourceStatus` set by the **licence**, not by downloadability; `lastVerified` updated.

---

## 7. Fill in the four AI projects with `license: null`

**Labels:** `help wanted` `data`
**Files:** `data/ai-projects.json`

`open-webui`, `litellm`, `dify` and `langfuse` have `license: null` because the GitHub
API returned `NOASSERTION`. Read each repository's `LICENSE` file and record the real
identifier.

**Acceptance:** SPDX identifier from the repository's own `LICENSE`; source URL added;
`lastVerified` bumped; `npm run check` passes.

---

## 8. Add README screenshots

**Labels:** `good first issue` `documentation` `design`
**Files:** `docs/screenshots/`, `README.md`

The README's "Screenshots" section is a placeholder. Capture Browse, Find my CLI,
Compare and Model Battle at a 1440-px viewport in both light and dark themes.

**Acceptance:** PNGs under 300 KB each in `docs/screenshots/`, linked from the README
with descriptive alt text, no personal data visible.

---

## 9. Produce the social preview image

**Labels:** `help wanted` `design` `documentation`
**Files:** `docs/social-preview.svg`, `docs/social-preview.png`

`docs/SOCIAL-PREVIEW.md` specifies a 1280 × 640 card but no image exists, so links to
the repo unfurl with GitHub's generic default.

**Acceptance:** export matches the spec, source file committed alongside it so it can
be regenerated when the counts change.

---

## 10. Reduce cumulative layout shift on `registry.html`

**Labels:** `enhancement` `performance`
**Files:** `assets/css/site.css`, `assets/js/registry.js`

Production Lighthouse reports a consistent **CLS ≈ 0.073** on Browse. It is inside the
0.1 budget, so this is a polish task, not a bug. Likely causes: the result-count line
growing from "Loading…" to the full string, and web-font swap.

**Acceptance:** CLS measurably lower across 3+ runs; Performance ≥ 95 and
Accessibility 100 preserved; no functional change.

---

## 11. Make the theme toggle reachable without scrolling the header on phones

**Labels:** `enhancement` `accessibility`
**Files:** `assets/css/site.css`, page headers

Below 560 px the sticky header scrolls horizontally, so the theme toggle and the saved
icon sit off-screen. They are keyboard-reachable and Lighthouse passes, but a
touch user has to discover the swipe.

**Acceptance:** both controls reachable without horizontal scrolling at 360 px; nav
links still reachable; no page-level horizontal scroll; Accessibility stays 100.

---

## 12. Add typo tolerance to search

**Labels:** `enhancement` `help wanted`
**Files:** `assets/js/search.js`

Search is exact-token AND matching, so `kubctl` or `ripgrpe` return nothing. Add
bounded fuzzy matching (e.g. edit distance ≤ 1 for tokens of 5+ characters) as a
fallback *after* exact matches, so ranking does not regress.

**Acceptance:** exact-match ordering unchanged; common typos resolve; still
instant over 500 entries; no new dependency.

---

## 13. Document Homebrew-only install commands as such

**Labels:** `good first issue` `documentation`
**Files:** `assets/js/cli.js`, `data/overlay.json`

Install blocks show `brew install x` with no indication that it is macOS/Linuxbrew
only. Label the platform on each install method so a Windows visitor is not misled.

**Acceptance:** platform shown per install method; derived from the existing
`method` field; no data fabricated.

---

## 14. Add a contributor scaffold script

**Labels:** `enhancement` `help wanted`
**Files:** `scripts/` , `package.json`

Adding a tool means hand-writing JSON that matches an implicit shape. A small
`node scripts/new-tool.mjs` that prompts for the fields, validates the slug is unique
and appends a correctly-shaped entry would lower the barrier.

**Acceptance:** Node-only, no new dependency, refuses duplicate slugs, output passes
`npm run check` unchanged.

---

## 15. Audit the print stylesheet for cheat sheets

**Labels:** `good first issue` `enhancement`
**Files:** `assets/css/site.css`

`cheatsheet.html` is meant to be printed and there is a `@media print` block, but it
has not been verified against a real print/PDF export — check for clipped commands,
orphaned headings and wasted page breaks.

**Acceptance:** a printed/PDF cheat sheet of 20+ tools has no clipped text, sensible
page breaks and no navigation chrome.
