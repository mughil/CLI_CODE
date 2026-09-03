/**
 * cli.js — the canonical single-tool view (cli.html?slug=<slug>).
 * Renders one entry from data/clis.json, records it as recently viewed,
 * and cross-links alternatives / related / categories.
 */
(function () {
  'use strict';
  const esc = (s) => window.CLISearch.escapeHtml(s);

  document.addEventListener('DOMContentLoaded', init);

  async function init() {
    const mount = document.getElementById('cli-view');
    const slug = new URLSearchParams(location.search).get('slug');

    if (!slug) { notFound(mount, null); return; }

    let data;
    try {
      data = await window.CLIData.load();
    } catch (err) {
      mount.innerHTML = `<p class="empty">Could not load the dataset (${esc(String(err.message || err))}).</p>`;
      return;
    }

    const e = data.bySlug.get(slug);
    if (!e) { notFound(mount, slug); return; }

    document.title = `${e.name} — CLI_CODE`;
    setSocialTitle(`${e.name} — CLI_CODE`);
    setMeta('description', e.summary);
    setCanonical(`${location.origin}${location.pathname}?slug=${encodeURIComponent(e.slug)}`);
    injectJsonLd(e);
    try { window.CLIStore.addRecent(e.slug); } catch {}

    render(mount, e, data.bySlug);
  }

  function notFound(mount, slug) {
    document.title = 'Tool not found — CLI_CODE';
    mount.innerHTML = `
      <nav class="crumb"><a href="registry.html">Browse</a> <span>/</span> <span>Not found</span></nav>
      <h1 class="sec-title">Tool <span class="g">not found</span></h1>
      <p class="sec-sub">${slug ? `No entry has the slug <code>${esc(slug)}</code>.` : 'No tool was specified.'}</p>
      <p><a class="btn btn-accent" href="registry.html">Browse all tools</a></p>`;
  }

  function crumb(e) {
    const cat = e.categories[0];
    return `<nav class="crumb" aria-label="Breadcrumb">
      <a href="registry.html">Browse</a> <span aria-hidden="true">/</span>
      <a href="registry.html?cat=${encodeURIComponent(cat)}">${esc(cat)}</a> <span aria-hidden="true">/</span>
      <span>${esc(e.name)}</span></nav>`;
  }

  function pill(text, cls, title) {
    return `<span class="pill ${cls || ''}"${title ? ` title="${esc(title)}"` : ''}>${esc(text)}</span>`;
  }

  function cmdRow(i) {
    return `<div class="cmd">
      <span class="tag">${esc(i.label || i.method)}</span>
      <code>${esc(i.command)}</code>
      <button class="copy-btn" data-copy="${esc(i.command)}">Copy</button>
    </div>`;
  }

  function toolCard(slug, bySlug) {
    const t = bySlug.get(slug);
    if (!t) return '';
    return `<a class="mini-card" href="cli.html?slug=${encodeURIComponent(slug)}">
      <span class="mini-name">${esc(t.name)}</span>
      <span class="mini-sum">${esc(t.summary)}</span>
      <span class="mini-cat">${esc(t.categories[0])}</span>
    </a>`;
  }

  function section(title, body) {
    return body ? `<section class="cli-sec"><h2>${esc(title)}</h2>${body}</section>` : '';
  }

  function render(mount, e, bySlug) {
    const fav = window.CLIStore.isFavorite(e.slug);
    const meta = [
      e.language && ['Language', esc(e.language)],
      e.runtime && ['Runtime', esc(e.runtime)],
      e.license && ['License', esc(e.license)],
      (e.platforms || []).length && ['Platforms', e.platforms.join(', ')],
      (e.packageManagers || []).length && ['Install via', e.packageManagers.join(', ')],
      e.lastVerified && ['Last verified', e.lastVerified],
      ['Data', e.dataQuality === 'curated' ? 'human-verified profile' : 'auto-derived from source registry'],
    ].filter(Boolean);

    const catLinks = e.categories
      .map((c) => `<a class="tagcat" href="registry.html?cat=${encodeURIComponent(c)}">${esc(c)}</a>`).join(' ');
    const tagLinks = (e.tags || [])
      .map((t) => `<a class="chip" href="registry.html?q=${encodeURIComponent(t)}">${esc(t)}</a>`).join(' ');

    const externals = [
      e.repository && ['Repository', e.repository],
      e.documentation && ['Documentation', e.documentation],
    ].filter(Boolean).map(([label, url]) =>
      `<a class="ext-link" href="${esc(url)}" target="_blank" rel="noopener noreferrer">${label}
        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8"/></svg></a>`).join('');

    mount.innerHTML = `
      ${crumb(e)}
      <header class="cli-head">
        <div class="cli-title">
          <h1>${esc(e.name)}</h1>
          <button class="star lg${fav ? ' on' : ''}" id="fav-btn" aria-pressed="${fav}" aria-label="${fav ? 'Remove from' : 'Add to'} favorites">${fav ? '★' : '☆'}</button>
        </div>
        <p class="cli-summary">${esc(e.summary)}</p>
        <div class="cli-pills">
          ${pill({ harness: 'CLI_CODE harness', public: 'public CLI', catalog: 'curated catalog' }[e.source] || e.source, 'src ' + e.source)}
          ${e.dataQuality === 'curated' ? pill('curated', 'curated', 'Human-verified profile') : ''}
          ${e.difficulty ? pill(e.difficulty, 'diff-' + e.difficulty) : ''}
          ${catLinks}
        </div>
        <div class="cli-actions">
          <button class="btn-sm ghost" id="cmp-btn" aria-pressed="${window.CLIStore.inCompare(e.slug)}">${window.CLIStore.inCompare(e.slug) ? 'In compare' : 'Add to compare'}</button>
          <a class="btn-sm ghost" href="cheatsheet.html?slugs=${encodeURIComponent(e.slug)}">Cheat sheet</a>
        </div>
      </header>

      ${e.description && e.description !== e.summary ? `<p class="cli-desc">${esc(e.description)}</p>` : ''}

      <section class="cli-sec"><h2>At a glance</h2>
        <div class="meta-grid">${meta.map(([k, v]) => `<dl class="mg-cell"><dt>${esc(k)}</dt><dd>${v}</dd></dl>`).join('')}</div>
      </section>

      ${section('Install', e.install.length ? e.install.map(cmdRow).join('') : '<p class="muted">No install command recorded. See the repository below.</p>')}

      ${section('Examples', e.examples.length
        ? e.examples.map((x) => `<div class="example"><div class="ex-title">${esc(x.title)}</div><div class="cmd"><code>${esc(x.command)}</code><button class="copy-btn" data-copy="${esc(x.command)}">Copy</button></div>${x.description ? `<p class="muted">${esc(x.description)}</p>` : ''}</div>`).join('')
        : '')}

      ${section('Use cases', e.useCases.length
        ? `<ul class="usecases">${e.useCases.map((u) => `<li>${esc(u)}</li>`).join('')}</ul>`
        : (e.dataQuality === 'derived' ? '<p class="muted">Not yet documented. <a href="docs.html#contributing">Contribute use cases</a>.</p>' : ''))}

      ${section('Alternatives', e.alternatives.length
        ? `<div class="mini-grid">${e.alternatives.map((s) => toolCard(s, bySlug)).join('')}</div>` : '')}

      ${section('Related tools', e.related.length
        ? `<div class="mini-grid">${e.related.map((s) => toolCard(s, bySlug)).join('')}</div>` : '')}

      ${section('Tags', tagLinks ? `<div class="chips">${tagLinks}</div>` : '')}

      ${externals ? `<section class="cli-sec"><h2>Authoritative references</h2><div class="ext-links">${externals}</div><p class="muted sm">External links open in a new tab.</p></section>` : ''}

      <p class="back-row"><a href="registry.html">&larr; Back to browse</a></p>`;

    document.getElementById('fav-btn').addEventListener('click', function () {
      const on = window.CLIStore.toggleFavorite(e.slug);
      this.classList.toggle('on', on);
      this.textContent = on ? '★' : '☆';
      this.setAttribute('aria-pressed', on);
      this.setAttribute('aria-label', `${on ? 'Remove from' : 'Add to'} favorites`);
    });

    const cmpBtn = document.getElementById('cmp-btn');
    cmpBtn.addEventListener('click', function () {
      const r = window.CLIStore.toggleCompare(e.slug);
      if (!r.ok) { this.textContent = `Compare limit is ${r.limit}`; setTimeout(() => { this.textContent = 'Add to compare'; }, 1600); return; }
      this.textContent = r.inCompare ? 'In compare' : 'Add to compare';
      this.setAttribute('aria-pressed', r.inCompare);
    });
  }

  function injectJsonLd(e) {
    const ld = {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: e.name,
      description: e.summary,
      applicationCategory: e.categories[0],
      url: location.href,
    };
    if ((e.platforms || []).length) ld.operatingSystem = e.platforms.join(', ');
    if (e.license) ld.license = e.license;
    if (e.documentation) ld.softwareHelp = e.documentation;
    const sameAs = [e.repository, e.documentation].filter(Boolean);
    if (sameAs.length) ld.sameAs = sameAs;
    let s = document.getElementById('cli-ld');
    if (!s) { s = document.createElement('script'); s.type = 'application/ld+json'; s.id = 'cli-ld'; document.head.appendChild(s); }
    s.textContent = JSON.stringify(ld);
  }

  function setMeta(name, content) {
    let m = document.querySelector(`meta[name="${name}"]`);
    if (!m) { m = document.createElement('meta'); m.name = name; document.head.appendChild(m); }
    m.content = content;
    // keep social tags in sync for JS-rendering crawlers
    for (const [sel, key] of [['meta[property="og:description"]', name], ['meta[name="twitter:description"]', name]]) {
      if (name !== 'description') break;
      const el = document.querySelector(sel);
      if (el) el.content = content;
    }
  }
  function setSocialTitle(t) {
    for (const sel of ['meta[property="og:title"]', 'meta[name="twitter:title"]']) {
      const el = document.querySelector(sel);
      if (el) el.content = t;
    }
  }
  function setCanonical(href) {
    let l = document.querySelector('link[rel="canonical"]');
    if (!l) { l = document.createElement('link'); l.rel = 'canonical'; document.head.appendChild(l); }
    l.href = href;
  }
})();
