/**
 * model.js — single AI model view (model.html?slug=<slug>).
 */
(function () {
  'use strict';
  const esc = (s) => window.CLISearch.escapeHtml(s);
  const CMP_KEY = 'clicode:model-compare';

  document.addEventListener('DOMContentLoaded', init);

  async function init() {
    const mount = document.getElementById('model-view');
    const slug = new URLSearchParams(location.search).get('slug');
    if (!slug) return notFound(mount, null);
    let data;
    try { data = await window.ModelData.load(); }
    catch (e) { mount.innerHTML = `<p class="empty">Could not load the model dataset (${esc(String(e.message || e))}).</p>`; return; }
    const m = data.bySlug.get(slug);
    if (!m) return notFound(mount, slug);

    document.title = `${m.name} — CLI_CODE`;
    setMeta('description', m.strengths && m.strengths[0] ? `${m.name} by ${m.provider}: ${m.strengths[0]}` : `${m.name} — AI model by ${m.provider}.`);
    setSocial(`${m.name} — CLI_CODE`);
    setCanonical(`${location.origin}${location.pathname}?slug=${encodeURIComponent(m.slug)}`);
    ld(m);
    render(mount, m, data.bySlug);
  }

  function notFound(mount, slug) {
    document.title = 'Model not found — CLI_CODE';
    mount.innerHTML = `<nav class="crumb"><a href="models.html">AI models</a> <span>/</span> <span>Not found</span></nav>
      <h1 class="sec-title">Model <span class="g">not found</span></h1>
      <p class="sec-sub">${slug ? `No model has the slug <code>${esc(slug)}</code>.` : 'No model was specified.'}</p>
      <p><a class="btn btn-accent" href="models.html">Browse all models</a></p>`;
  }

  const YN = { yes: 'Yes', hybrid: 'Hybrid', no: 'No', unknown: 'Unknown', strong: 'Strong', moderate: 'Moderate', basic: 'Basic' };
  const OPEN = {
    'open-source': 'Open source (OSI-style license)', 'open-weight': 'Open weight (custom / restricted license)',
    'proprietary': 'Proprietary', 'api-only': 'API only (proprietary)', 'research-license': 'Research license only',
    'commercial-use-restricted': 'Commercial use restricted', 'other-unknown': 'Openness unknown',
  };
  const ctxLabel = (n) => n == null ? 'Not documented' : n >= 1000000 ? (n / 1000000) + 'M tokens' : n >= 1000 ? Math.round(n / 1000) + 'K tokens' : n + ' tokens';

  function row(k, v) { return v ? `<div><dt>${esc(k)}</dt><dd>${v}</dd></div>` : ''; }
  function sec(t, body) { return body ? `<section class="cli-sec"><h2>${esc(t)}</h2>${body}</section>` : ''; }
  function card(slug, bySlug) {
    const t = bySlug.get(slug); if (!t) return '';
    return `<a class="mini-card" href="model.html?slug=${encodeURIComponent(slug)}"><span class="mini-name">${esc(t.name)}</span><span class="mini-sum">${esc(t.provider)} · ${esc(OPEN[t.openSourceStatus] || t.openSourceStatus)}</span><span class="mini-cat">${esc((t.categories || [])[0] || '')}</span></a>`;
  }

  function render(mount, m, bySlug) {
    const inCmp = compareList().includes(m.slug);
    const caps = [
      row('Context window', ctxLabel(m.contextWindow)),
      row('Max output', m.maxOutput ? ctxLabel(m.maxOutput) : ''),
      row('Input', (m.inputModalities || []).join(', ')),
      row('Output', (m.outputModalities || []).join(', ')),
      row('Reasoning', YN[m.reasoning] || (m.reasoning || '')),
      row('Tool use', YN[m.toolUse]), row('Function calling', YN[m.functionCalling]),
      row('Structured output', YN[m.structuredOutput]),
      row('Vision', YN[m.vision]), row('Audio', YN[m.audio]), row('Video', YN[m.video]),
      row('Code capability', YN[m.codeCapability]),
      row('Multilingual', YN[m.multilingual]),
    ].join('');
    const facts = [
      row('Provider', esc(m.provider)),
      row('Model family', esc(m.modelFamily)),
      row('Release', esc(m.releaseDate)),
      row('Knowledge cutoff', esc(m.knowledgeCutoff)),
      row('Openness', esc(OPEN[m.openSourceStatus] || m.openSourceStatus)),
      row('License', esc(m.license)),
      row('Commercial use', esc(m.commercialUse)),
      row('Parameters', esc(m.parameters)),
      row('Active parameters', esc(m.activeParameters)),
      row('Architecture', esc(m.architecture)),
      row('Availability', (m.availability || []).join(', ')),
      row('Last verified', esc(m.lastVerified)),
    ].join('');
    const local = m.localCapable ? sec('Run locally', `
      <p>${m.minimumHardware ? esc(m.minimumHardware) : 'Hardware requirements vary by quantization and serving stack — see the model card.'}</p>
      ${(m.localRunners || []).length ? `<div class="chips">${m.localRunners.map((r) => `<span class="chip">${esc(r)}</span>`).join('')}</div>` : ''}
      ${row('Quantization', YN[m.quantizationAvailable])}
      <p style="margin-top:10px"><a class="btn-sm ghost" href="run-local.html">More local models →</a></p>`) : '';
    const pricing = m.pricing && (m.pricing.inputPerMTok != null || m.pricing.outputPerMTok != null) ? sec('Pricing', `
      <div class="kv">${m.pricing.inputPerMTok != null ? `Input: <b>$${m.pricing.inputPerMTok}</b> / 1M tok` : ''}${m.pricing.outputPerMTok != null ? ` · Output: <b>$${m.pricing.outputPerMTok}</b> / 1M tok` : ''}</div>
      ${m.pricing.notes ? `<p class="muted sm">${esc(m.pricing.notes)}</p>` : ''}
      <p class="muted sm">Verified ${esc(m.pricingVerifiedAt || m.lastVerified)} — pricing changes; confirm with the provider.</p>`) : '';
    const links = [
      m.officialDocumentation && ['Official documentation', m.officialDocumentation],
      m.technicalReport && ['Technical report', m.technicalReport],
      m.modelRepository && ['Model card / repository', m.modelRepository],
      m.huggingFace && m.huggingFace !== m.modelRepository && ['Hugging Face', m.huggingFace],
      m.githubRepository && ['GitHub', m.githubRepository],
      m.apiEndpointDocumentation && ['API docs', m.apiEndpointDocumentation],
    ].filter(Boolean).map(([t, u]) => `<a class="ext-link" href="${esc(u)}" target="_blank" rel="noopener noreferrer">${esc(t)} <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8"/></svg></a>`).join('');
    const sources = (m.sources || []).map((s) => `<li><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.title)}</a> <span class="muted sm">(${esc(s.type)}, verified ${esc(s.verifiedAt)})</span></li>`).join('');

    mount.innerHTML = `
      <nav class="crumb" aria-label="Breadcrumb"><a href="models.html">AI models</a> <span aria-hidden="true">/</span>
        <a href="models.html?provider=${encodeURIComponent(m.provider)}">${esc(m.provider)}</a> <span aria-hidden="true">/</span> <span>${esc(m.name)}</span></nav>
      <header class="cli-head">
        <h1>${esc(m.name)}</h1>
        <p class="cli-summary">${esc(m.strengths && m.strengths[0] ? m.strengths[0] : (m.architecture || ''))}</p>
        <div class="cli-pills">
          <span class="pill open-${m.openSourceStatus === 'open-source' ? 'src' : m.openSourceStatus === 'open-weight' ? 'wt' : 'prop'}">${esc((OPEN[m.openSourceStatus] || m.openSourceStatus).split(' (')[0])}</span>
          ${(m.categories || []).slice(0, 6).map((c) => `<a class="tagcat" href="models.html?cap=${encodeURIComponent(c)}">${esc(c)}</a>`).join('')}
        </div>
        <div class="cli-actions">
          <button class="btn-sm ghost" id="cmp-btn" aria-pressed="${inCmp}">${inCmp ? 'In comparison' : 'Add to comparison'}</button>
          <a class="btn-sm ghost" href="find-model.html">Find my model</a>
        </div>
      </header>
      ${m.description ? `<p class="cli-desc">${esc(m.description)}</p>` : ''}
      <section class="cli-sec"><h2>At a glance</h2><dl class="meta-grid">${facts}</dl></section>
      <section class="cli-sec"><h2>Capabilities</h2><dl class="meta-grid">${caps}</dl></section>
      ${sec('Strengths', (m.strengths || []).length ? `<ul class="usecases">${m.strengths.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>` : '')}
      ${sec('Limitations', (m.limitations || []).length ? `<ul class="usecases">${m.limitations.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>` : '')}
      ${sec('Ideal use cases', (m.useCases || []).length ? `<ul class="usecases">${m.useCases.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>` : '')}
      ${local}
      ${pricing}
      ${sec('Alternatives', (m.alternatives || []).length ? `<div class="mini-grid">${m.alternatives.map((s) => card(s, bySlug)).join('')}</div>` : '')}
      ${sec('Related models', (m.related || []).length ? `<div class="mini-grid">${m.related.map((s) => card(s, bySlug)).join('')}</div>` : '')}
      ${links ? sec('Official links', `<div class="ext-links">${links}</div><p class="muted sm">External links open in a new tab.</p>`) : ''}
      ${sources ? sec('Sources', `<ul class="src-list">${sources}</ul><p class="muted sm">Every factual field above traces to one of these. Fields not covered by a source are left blank.</p>`) : ''}
      <p class="back-row"><a href="models.html">&larr; Back to models</a></p>`;

    document.getElementById('cmp-btn').addEventListener('click', function () {
      const list = compareList();
      const i = list.indexOf(m.slug);
      if (i !== -1) list.splice(i, 1);
      else if (list.length >= 4) { this.textContent = 'Comparison holds 4'; setTimeout(() => { this.textContent = 'Add to comparison'; }, 1500); return; }
      else list.push(m.slug);
      saveCompare(list);
      const on = list.includes(m.slug);
      this.textContent = on ? 'In comparison' : 'Add to comparison';
      this.setAttribute('aria-pressed', on);
    });
  }

  function compareList() { try { return JSON.parse(localStorage.getItem(CMP_KEY) || '[]').filter((x) => typeof x === 'string').slice(0, 4); } catch { return []; } }
  function saveCompare(list) { try { localStorage.setItem(CMP_KEY, JSON.stringify(list.slice(0, 4))); } catch {} }

  function ld(m) {
    const d = { '@context': 'https://schema.org', '@type': 'SoftwareApplication', applicationCategory: 'Artificial intelligence model', name: m.name, description: (m.strengths || [])[0] || m.architecture || '', url: location.href, author: { '@type': 'Organization', name: m.provider } };
    if (m.license) d.license = m.license;
    const sa = [m.modelRepository, m.officialDocumentation, m.huggingFace].filter(Boolean);
    if (sa.length) d.sameAs = [...new Set(sa)];
    let s = document.getElementById('model-ld');
    if (!s) { s = document.createElement('script'); s.type = 'application/ld+json'; s.id = 'model-ld'; document.head.appendChild(s); }
    s.textContent = JSON.stringify(d);
  }
  function setMeta(n, c) { let m = document.querySelector(`meta[name="${n}"]`); if (!m) { m = document.createElement('meta'); m.name = n; document.head.appendChild(m); } m.content = c; for (const sel of ['meta[property="og:description"]', 'meta[name="twitter:description"]']) { const e = document.querySelector(sel); if (e) e.content = c; } }
  function setSocial(t) { for (const sel of ['meta[property="og:title"]', 'meta[name="twitter:title"]']) { const e = document.querySelector(sel); if (e) e.content = t; } }
  function setCanonical(h) { let l = document.querySelector('link[rel="canonical"]'); if (!l) { l = document.createElement('link'); l.rel = 'canonical'; document.head.appendChild(l); } l.href = h; }
})();
