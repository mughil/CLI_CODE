# Social preview specification

GitHub renders the repository social preview at **1280 × 640** (2:1). It appears on
X/Twitter, LinkedIn, Slack, Discord and in Google's social cards.

> No image is checked in. Generating one is a design task, and a poor placeholder is
> worse than GitHub's default card. This file is the spec — build it, then upload via
> **Settings → General → Social preview → Edit → Upload an image**.

## Canvas

| Property | Value |
|---|---|
| Size | 1280 × 640 px |
| Safe area | keep all text inside a 1120 × 500 centred box — the card is cropped on some clients |
| Format | PNG (or JPG), under 1 MB |
| Background | flat `#0f172a` (the site's dark surface). No photo, no gradient mesh, no stock imagery |

## Content hierarchy

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│                        CLI_CODE                            │   ← 1
│                                                            │
│        500 CLI Tools · 50 AI Models · 20 AI Projects       │   ← 2
│                                                            │
│              Search • Compare • Build • Run                │   ← 3
│                                                            │
└────────────────────────────────────────────────────────────┘
```

| # | Text | Size | Weight | Colour |
|---|---|---|---|---|
| 1 | `CLI_CODE` | 128 px | 700 | `#f8fafc` |
| 2 | `500 CLI Tools · 50 AI Models · 20 AI Projects` | 44 px | 600 | `#22c55e` (accent) |
| 3 | `Search • Compare • Build • Run` | 32 px | 500 | `#94a3b8` (muted) |

Vertical rhythm: 1 → 2 gap 48 px, 2 → 3 gap 40 px. Whole block optically centred
(shift ~16 px above true centre).

## Type

Match the site: **IBM Plex Sans** for lines 1 and 3, **JetBrains Mono** for line 2.
Both are self-hosted in `assets/fonts/`. If unavailable, substitute Inter / SF Mono.

## Optional accent

A single 3 px `#22c55e` rule, 200 px wide, centred 32 px below line 3. Nothing else —
no logo lockups, no screenshots, no badges, no shadows.

## Rules

- **Never put a star, fork or download count on the card.** It goes stale and looks
  like a growth-hack.
- Keep the three numbers in sync with reality. When the dataset changes, regenerate
  the image or drop the numbers.
- Text must be legible at 25 % scale (that is roughly the Slack unfurl size).
- Contrast: line 1 ≈ 15:1, line 2 ≈ 6:1, line 3 ≈ 5:1 on `#0f172a` — all pass WCAG AA.

## Producing it

Any of these is fine:

- Figma / Penpot frame at 1280 × 640, export 1× PNG.
- An SVG built to the spec above, rasterised with `resvg` or a headless browser.
- A one-off HTML page rendered at 1280 × 640 with Playwright — reuses the real fonts
  and colour tokens from `assets/css/site.css`.

Save the source alongside the export (`docs/social-preview.svg` +
`docs/social-preview.png`) so it can be regenerated when the counts change.
