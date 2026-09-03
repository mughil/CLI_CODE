# Security Policy

## Supported versions

CLI_CODE is a static, client-side site deployed continuously from `main`. Only the
currently deployed version is supported.

| Version | Supported |
|---|---|
| `main` (live at https://mughil.github.io/CLI_CODE/) | ✅ |
| Older tags / forks | ❌ |

## Reporting a vulnerability

**Please do not open a public issue for a security problem.**

Report privately through GitHub:

**https://github.com/mughil/CLI_CODE/security/advisories/new**

Include, where you can:

- what the issue is and where (file, page, URL, parameter)
- steps to reproduce, or a proof-of-concept URL
- what an attacker could achieve
- browser and OS if it is browser-specific

You should get an acknowledgement within **7 days**. Please give the maintainers a
reasonable window to ship a fix before disclosing publicly.

## What is in scope

This is a static site with no backend, no database and no authentication, so the
realistic attack surface is small but real:

- **DOM XSS** — anything that lets a crafted URL (`?slug=`, `?q=`, `?slugs=`,
  `?need=`, `?cat=`) inject markup or script into a page.
- **Malicious data** — an entry in `data/**` that renders as executable markup, or a
  `documentation` / `repository` URL pointing somewhere harmful.
- **Unsafe outbound links** — an external link missing `rel="noopener"`, or a
  `javascript:` / `data:` URL reaching an `href`.
- **Supply chain** — a compromised or typosquatted build/CI dependency, or a
  workflow change that exfiltrates secrets.
- **Deployment integrity** — anything that lets a non-maintainer influence what is
  published to GitHub Pages.

## What is out of scope

- Missing HTTP security headers (CSP, HSTS, X-Frame-Options). GitHub Pages does not
  allow custom response headers; this is a platform limitation, not a project defect.
- Reports that only cite an automated scanner's output with no demonstrated impact.
- Denial of service against GitHub's own infrastructure.
- Content of third-party sites we link to. Report those to their owners; tell us and
  we will remove or repoint the link.
- Absence of rate limiting, account lockout or MFA — the site has no accounts.
- `localStorage` contents. Favourites, compare queue and recent history are stored
  per-browser under `clicode:state`, contain no personal data and are never
  transmitted anywhere.

## Our security practices

Enforced on every push by `npm run check` and the CI/deploy workflows:

- All user-controlled values are escaped with `CLISearch.escapeHtml` before reaching
  `innerHTML`; `?slugs=` values are filtered against known slugs before rendering.
- `check-links.mjs` fails the build on any `target="_blank"` without `rel="noopener"`.
- No `eval`, no `new Function`, no third-party runtime scripts, no analytics, no cookies.
- Dependencies are dev-only (`ajv`, `ajv-formats`, `html-validate`), installed with
  `npm ci` from a committed lockfile, and are not shipped to the browser.
- Workflow permissions are least-privilege (`contents: read`, plus `pages: write` and
  `id-token: write` only on the deploy job).

## Credit

We are happy to credit reporters in the release notes. Tell us how you would like to
be named, or say if you prefer to stay anonymous.
