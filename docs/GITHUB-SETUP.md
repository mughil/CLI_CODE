# GitHub repository settings — manual actions

Everything in this file must be done by a repository **owner/admin** through the GitHub
web UI or an authenticated client. It cannot be committed, because it lives in
GitHub's repository settings rather than in the repository tree.

Baseline recorded 2026-09-03 (before any of these were applied):

| Setting | Value |
|---|---|
| Description | *(empty)* |
| Homepage | *(empty)* |
| Topics | *(none)* |
| Discussions | disabled |
| Releases | 0 |
| Tags | 0 |
| Open issues | 0 |
| Social preview | default |
| Licence | Apache-2.0 ✅ |
| Default branch | `main` ✅ |

---

## 1. Description, homepage, topics — **highest impact**

**Settings → General**, or the ⚙ next to *About* on the repository home page.

**Description** (paste exactly):

```
Search, compare and discover 500 CLI tools, 50 AI models and curated developer stacks. Open-source, client-side and privacy-friendly.
```

**Website:**

```
https://mughil.github.io/CLI_CODE/
```

Tick **Use your GitHub Pages website** if offered.

**Topics** (GitHub allows up to 20; all lower-case, hyphenated):

```
cli
command-line
cli-tools
command-line-tools
developer-tools
devtools
ai-tools
ai-models
llm
llm-tools
local-ai
open-source
awesome-list
productivity
automation
tool-directory
ai-directory
javascript
github-pages
developers
```

Also under *About*: tick **Releases** and **Packages**? Leave Packages unticked —
this project publishes none.

> Topics are the single biggest discoverability lever here: they are what powers
> `github.com/topics/cli-tools` browsing and GitHub search facets.

## 2. Enable Discussions

**Settings → General → Features → Discussions → ✅ Set up discussions**

Then **Discussions → ⚙ Categories** and create:

| Category | Format | Purpose |
|---|---|---|
| 📣 Announcements | Announcement | Releases and dataset milestones (maintainers post) |
| 💡 Ideas | Open-ended | Feature and direction proposals |
| 🛠 Tool Requests | Open-ended | "Please add this CLI" without opening an issue |
| 🤖 AI Model Requests | Open-ended | "Please add this model" |
| ❓ Questions | Q&A | Usage and contribution help |
| 🎉 Show and Tell | Open-ended | Stacks and cheat sheets people have built |

Delete the default *General* category once these exist.

## 3. Create the labels the issue forms and starter issues expect

**Issues → Labels → New label**

| Name | Colour | Description |
|---|---|---|
| `data` | `#0e8a16` | Dataset accuracy or coverage |
| `cli-data` | `#0e8a16` | CLI tool records specifically |
| `model-data` | `#8b5cf6` | AI model records specifically |
| `performance` | `#fbca04` | Load time, layout shift, main-thread work |
| `design` | `#d4c5f9` | Visual design and imagery |

`bug`, `documentation`, `enhancement`, `good first issue`, `help wanted` and
`accessibility` already exist. The issue forms currently use only labels that exist,
so they work today; adding these lets you re-point the forms for finer triage.

## 4. Open the starter issues

The 15 ready-to-post items are in [`STARTER-ISSUES.md`](STARTER-ISSUES.md) — title,
body, labels and acceptance criteria for each. Open them via **Issues → New issue**.

Post at least #1, #2, #8 and #13 first: they are the friendliest `good first issue`
entry points and give a newcomer somewhere obvious to land.

## 5. Cut the v1.0.0 release

Validation is green and the tag can be pushed from the repository:

```bash
git checkout main
git pull
git tag -a v1.0.0 -m "v1.0.0 — 500 CLI Tools + 50 AI Models"
git push origin v1.0.0
```

Then **Releases → Draft a new release**:

- **Tag:** `v1.0.0` (choose the existing tag)
- **Title:** `v1.0.0 — 500 CLI Tools + 50 AI Models`
- **Description:** paste the `## [1.0.0]` section from
  [`../CHANGELOG.md`](../CHANGELOG.md), then add:

  > **Live demo:** https://mughil.github.io/CLI_CODE/
  > **Contributing:** https://github.com/mughil/CLI_CODE/blob/main/CONTRIBUTING.md
  >
  > Validation at this tag: `npm ci && npm run build && npm run check` →
  > Total tools 500 / Unique IDs 500 / Unique slugs 500 / Duplicates 0 / PASS,
  > 50 AI models, 20 AI projects, `npm audit` 0 vulnerabilities.

- Tick **Set as the latest release**.
- Leave *pre-release* unticked.
- No binary assets — the site is deployed, not downloaded.

## 6. Upload the social preview

**Settings → General → Social preview → Edit → Upload an image**

Build it first to the spec in [`SOCIAL-PREVIEW.md`](SOCIAL-PREVIEW.md)
(1280 × 640). Until an image exists, links to the repo unfurl with GitHub's generic
card.

## 7. Confirm Pages source

**Settings → Pages → Build and deployment → Source: GitHub Actions**

Already working — `deploy-pages.yml` has deployed successfully 15 times. Only re-check
this if deployments stop appearing.

## 8. Optional hardening

- **Settings → Branches → Add branch ruleset** for `main`: require the `check` status
  check from `ci.yml`, require a PR before merging. Do this once there is a second
  contributor; on a solo repo it mostly adds friction.
- **Settings → Code security → Dependabot alerts + security updates:** enable. The
  dependencies are dev-only, but it is free coverage.
- **Settings → Code security → Private vulnerability reporting:** enable, so the link
  in [`../SECURITY.md`](../SECURITY.md) works.

---

## What is already done in the repository

No manual action needed for these — they are committed:

- README rebuilt for conversion, with factual badges only
- `CONTRIBUTING.md` with step-by-step instructions per contribution type
- `CODE_OF_CONDUCT.md` (Contributor Covenant 2.1 + no-fabrication clause)
- `SECURITY.md` with scope, out-of-scope and private reporting
- `CHANGELOG.md` with a complete `1.0.0` section
- Six issue forms + contact links on the issue chooser
- Expanded pull-request template
- CI and deploy workflows aligned on Node 24 action majors
