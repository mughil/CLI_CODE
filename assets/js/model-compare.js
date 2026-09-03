/**
 * model-compare.js — "Model Battle". 2–4 models side by side.
 * Source: ?slugs=a,b,c  OR the localStorage comparison list.
 */
(function () {
  'use strict';
  const esc = (s) => window.CLISearch.escapeHtml(s);
  const CMP_KEY = 'clicode:model-compare';
  const ctxLabel = (n) => n == null ? '—' : n >= 1000000 ? (n / 1000000) + 'M' : n >= 1000 ? Math.round(n / 1000) + 'K' : String(n);

  const ROWS = [
    ['provider', 'Provider', (m) => esc(m.provider)],
    ['modelFamily', 'Family', (m) => esc(m.modelFamily || '—')],
    ['releaseDate', 'Release', (m) => esc(m.releaseDate || '—')],
    ['openSourceStatus', 'Openness', (m) => esc(m.openSourceStatus)],
    ['license', 'License', (m) => esc(m.license || '—')],
    ['commercialUse', 'Commercial use', (m) => esc(m.commercialUse || 'unknown')],
    ['contextWindow', 'Context', (m) => ctxLabel(m.contextWindow)],
    ['parameters', 'Parameters', (m) => esc(m.parameters || '—')],
    ['activeParameters', 'Active params', (m) => esc(m.activeParameters || '—')],
    ['reasoning', 'Reasoning', (m) => esc(m.reasoning || '—')],
    ['codeCapability', 'Coding', (m) => esc(m.codeCapability || '—')],
    ['toolUse', 'Tool use', (m) => esc(m.toolUse || '—')],
    ['vision', 'Vision', (m) => esc(m.vision || '—')],
    ['audio', 'Audio', (m) => esc(m.audio || '—')],
    ['localCapable', 'Local', (m) => m.localCapable ? 'Yes' : 'No'],
    ['apiAvailable', 'API', (m) => m.apiAvailable ? 'Yes' : 'No'],
    ['pricing', 'API price /1M', (m) => m.pricing && m.pricing.inputPerMTok != null ? `$${m.pricing.inputPerMTok} in / $${m.pricing.outputPerMTok ?? '?'} out` : '—'],
  ];

  const differs = (ms, key) => new Set(ms.map((m) => JSON.stringify(m[key] ?? null))).size > 1;

  function keyDiffs(ms) {
    const out = [];
    const open = ms.map((m) => m.openSourceStatus);
    if (new Set(open).size > 1) out.push('Openness differs: ' + ms.map((m) => `${m.name} (${m.openSourceStatus})`).join(', '));
    const commercial = ms.filter((m) => m.commercialUse === 'yes').map((m) => m.name);
    const notCommercial = ms.filter((m) => m.commercialUse !== 'yes').map((m) => m.name);
    if (commercial.length && notCommercial.length) out.push(`Commercial use: OK for ${commercial.join(', ')}; restricted/unknown for ${notCommercial.join(', ')}`);
    const ctx = ms.map((m) => m.contextWindow).filter((x) => x != null);
    if (ctx.length > 1 && Math.max(...ctx) / Math.min(...ctx) >= 2) out.push(`Context ranges ${ctxLabel(Math.min(...ctx))}–${ctxLabel(Math.max(...ctx))}`);
    const local = ms.filter((m) => m.localCapable).map((m) => m.name);
    if (local.length && local.length < ms.length) out.push(`Runs locally: ${local.join(', ')} (others are hosted/API only)`);
    const reason = ms.filter((m) => m.reasoning === 'yes').map((m) => m.name);
    if (reason.length && reason.length < ms.length) out.push(`Dedicated reasoning: ${reason.join(', ')}`);
    return out.length ? out : ['These models have broadly similar documented metadata.'];
  }

  function render(mount, ms, bySlug) {
    if (ms.length < 2) {
      mount.innerHTML = `<h1 class="sec-title">Compare <span class="g">AI models</span></h1>
        <p class="sec-sub">Pick 2–4 models. Add them with “Add to comparison” on a model page, or pass <code>?slugs=a,b</code>.</p>
        <p style="margin-top:16px"><a class="btn btn-accent" href="models.html">Browse models</a></p>`;
      return;
    }
    document.title = `${ms.map((m) => m.name).join(' vs ')} — CLI_CODE`;
    mount.innerHTML = `
      <h1 class="sec-title">${ms.map((m) => `<span class="g">${esc(m.name)}</span>`).join(' <span style="color:var(--ink-3)">vs</span> ')}</h1>
      <div class="cmp-controls">
        ${ms.map((m) => `<span class="chip">${esc(m.name)} <button data-drop="${esc(m.slug)}" aria-label="Remove ${esc(m.name)}">×</button></span>`).join('')}
        <a class="btn-sm ghost" href="models.html">+ Add</a>
        <button class="btn-sm ghost" id="mc-clear">Clear</button>
      </div>
      <section class="cli-sec"><h2>Key differences</h2><ul class="diff-list">${keyDiffs(ms).map((d) => `<li>${esc(d)}</li>`).join('')}</ul></section>
      <div class="table-scroll"><table class="reg-table cmp-table">
        <thead><tr><th scope="col">Field</th>${ms.map((m) => `<th scope="col"><a href="model.html?slug=${encodeURIComponent(m.slug)}">${esc(m.name)}</a></th>`).join('')}</tr></thead>
        <tbody>${ROWS.map(([k, label, fn]) => {
          const d = differs(ms, k);
          return `<tr class="${d ? 'row-diff' : ''}"><th scope="row">${label}${d ? ' <span class="diff-dot" title="differs">●</span>' : ''}</th>${ms.map((m) => `<td>${fn(m)}</td>`).join('')}</tr>`;
        }).join('')}
        <tr><th scope="row">Best suited for</th>${ms.map((m) => `<td class="sm">${esc((m.useCases || [])[0] || (m.strengths || [])[0] || '—')}</td>`).join('')}</tr>
        </tbody>
      </table></div>
      <p class="muted sm" style="margin-top:10px"><span class="diff-dot">●</span> marks rows where the models differ. No overall "winner" — pick by the row that matters to your use case.</p>`;

    mount.querySelectorAll('[data-drop]').forEach((b) => b.addEventListener('click', () => {
      const list = load().filter((s) => s !== b.dataset.drop); save(list); location.search = list.length ? `?slugs=${list.join(',')}` : '';
    }));
    document.getElementById('mc-clear').addEventListener('click', () => { save([]); location.href = 'model-compare.html'; });
  }

  const load = () => { try { return JSON.parse(localStorage.getItem(CMP_KEY) || '[]').filter((x) => typeof x === 'string'); } catch { return []; } };
  const save = (l) => { try { localStorage.setItem(CMP_KEY, JSON.stringify(l.slice(0, 4))); } catch {} };

  document.addEventListener('DOMContentLoaded', async () => {
    const mount = document.getElementById('mc-view');
    let data;
    try { data = await window.ModelData.load(); }
    catch (e) { mount.innerHTML = `<p class="empty">Could not load models (${esc(String(e.message || e))}).</p>`; return; }
    const fromUrl = (new URLSearchParams(location.search).get('slugs') || '').split(',').map((s) => s.trim()).filter(Boolean);
    let slugs = (fromUrl.length ? fromUrl : load()).filter((s) => data.bySlug.has(s));
    slugs = [...new Set(slugs)].slice(0, 4);
    if (fromUrl.length) save(slugs);
    render(mount, slugs.map((s) => data.bySlug.get(s)), data.bySlug);
  });
})();
