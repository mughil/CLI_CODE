/**
 * models.js — the AI models browse page. Search + facets + sortable table,
 * URL-persisted. Rows link to model.html?slug=<slug>.
 */
(function () {
  'use strict';
  const esc = (s) => window.CLISearch.escapeHtml(s);
  const S = { models: [], index: null, meta: null, q: '', provider: 'all', openness: 'all', availability: 'all', category: 'all', context: 'all', local: false, view: [] };
  const el = {};

  document.addEventListener('DOMContentLoaded', init);

  async function init() {
    ['q', 'f-provider', 'f-openness', 'f-availability', 'f-category', 'f-context', 'f-local', 'f-clear', 'result-count', 'rows'].forEach((id) => { el[id] = document.getElementById(id); });
    let data;
    try { data = await window.ModelData.load(); }
    catch (e) { el.rows.innerHTML = `<tr><td colspan="6" class="empty">Could not load models (${esc(String(e.message || e))}). Run <code>npm run build</code>.</td></tr>`; return; }
    S.models = data.models; S.meta = data.meta; S.index = window.ModelSearch.build(S.models);

    fill(el['f-provider'], data.meta.providers, 'All providers');
    fill(el['f-openness'], data.meta.openness, 'Any openness');
    fill(el['f-availability'], data.meta.availability, 'Any availability');
    fill(el['f-category'], data.meta.categories, 'Any capability');

    el.q.addEventListener('input', debounce(() => { S.q = el.q.value.trim(); sync(); }, 90));
    for (const [k, node] of [['provider', 'f-provider'], ['openness', 'f-openness'], ['availability', 'f-availability'], ['category', 'f-category'], ['context', 'f-context']])
      el[node].addEventListener('change', () => { S[k] = el[node].value; sync(); });
    el['f-local'].addEventListener('change', () => { S.local = el['f-local'].checked; sync(); });
    el['f-clear'].addEventListener('click', reset);
    window.addEventListener('popstate', () => { readURL(); apply(); });
    el.rows.addEventListener('click', (ev) => {
      if (ev.target.closest('a') || ev.target.closest('button')) return;
      const tr = ev.target.closest('tr[data-slug]');
      if (tr) location.href = `model.html?slug=${encodeURIComponent(tr.dataset.slug)}`;
    });

    readURL(); apply();
  }

  const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
  function fill(node, list, label) {
    node.innerHTML = `<option value="all">${label}</option>` + list.map((o) => `<option value="${esc(o.id)}">${esc(o.id)} (${o.count})</option>`).join('');
  }
  function ctxBucket(n) { return n == null ? 'unknown' : n <= 16000 ? 'small' : n <= 200000 ? 'medium' : n <= 1000000 ? 'large' : 'very-large'; }
  function ctxLabel(n) { return n == null ? '—' : n >= 1000000 ? (n / 1000000) + 'M' : n >= 1000 ? Math.round(n / 1000) + 'K' : String(n); }

  function reset() {
    Object.assign(S, { q: '', provider: 'all', openness: 'all', availability: 'all', category: 'all', context: 'all', local: false });
    el.q.value = ''; ['f-provider', 'f-openness', 'f-availability', 'f-category', 'f-context'].forEach((i) => { el[i].value = 'all'; });
    el['f-local'].checked = false; sync();
  }
  function sync() { pushURL(); apply(); }

  function readURL() {
    const p = new URLSearchParams(location.search);
    S.q = p.get('q') || ''; S.provider = p.get('provider') || 'all'; S.openness = p.get('openness') || 'all';
    S.availability = p.get('availability') || 'all'; S.category = p.get('cap') || 'all'; S.context = p.get('ctx') || 'all';
    S.local = p.get('local') === '1';
    el.q.value = S.q; el['f-provider'].value = S.provider; el['f-openness'].value = S.openness;
    el['f-availability'].value = S.availability; el['f-category'].value = S.category; el['f-context'].value = S.context;
    el['f-local'].checked = S.local;
  }
  function pushURL() {
    const p = new URLSearchParams();
    if (S.q) p.set('q', S.q);
    if (S.provider !== 'all') p.set('provider', S.provider);
    if (S.openness !== 'all') p.set('openness', S.openness);
    if (S.availability !== 'all') p.set('availability', S.availability);
    if (S.category !== 'all') p.set('cap', S.category);
    if (S.context !== 'all') p.set('ctx', S.context);
    if (S.local) p.set('local', '1');
    const qs = p.toString();
    history.replaceState(null, '', location.pathname + (qs ? '?' + qs : ''));
  }

  function passes(m) {
    if (S.provider !== 'all' && m.provider !== S.provider) return false;
    if (S.openness !== 'all' && m.openSourceStatus !== S.openness) return false;
    if (S.availability !== 'all' && !(m.availability || []).includes(S.availability)) return false;
    if (S.category !== 'all' && !(m.categories || []).includes(S.category)) return false;
    if (S.context !== 'all' && ctxBucket(m.contextWindow) !== S.context) return false;
    if (S.local && !m.localCapable) return false;
    return true;
  }

  function apply() {
    let rows = S.q
      ? window.ModelSearch.query(S.index, S.q, 500).map((h) => h.entry).filter(passes)
      : S.models.filter(passes).sort((a, b) => a.name.localeCompare(b.name));
    S.view = rows; render();
  }

  const OPEN = { 'open-source': 'open-source', 'open-weight': 'open-weight', 'proprietary': 'proprietary', 'api-only': 'api-only', 'research-license': 'research', 'commercial-use-restricted': 'restricted', 'other-unknown': 'unknown' };

  function render() {
    el['result-count'].innerHTML = `<b>${S.view.length}</b> of ${S.models.length} models` + (S.q ? ` · matching “${esc(S.q)}”` : '');
    if (!S.view.length) { el.rows.innerHTML = `<tr><td colspan="6" class="empty">No models match. <button type="button" class="linklike" id="er">Clear filters</button></td></tr>`; document.getElementById('er')?.addEventListener('click', reset); return; }
    el.rows.innerHTML = S.view.map((m) => `
      <tr data-slug="${esc(m.slug)}" class="row">
        <td class="c-name">
          <a class="name-link" href="model.html?slug=${encodeURIComponent(m.slug)}">${esc(m.name)}</a>
          ${m.modelFamily ? `<span class="pill">${esc(m.modelFamily)}</span>` : ''}
          <div class="c-sub">${esc(m.strengths && m.strengths[0] ? m.strengths[0] : (m.architecture || (m.categories || []).slice(0, 3).join(' · ')))}</div>
        </td>
        <td class="sm">${esc(m.provider)}</td>
        <td><span class="pill open-${m.openSourceStatus === 'open-source' ? 'src' : m.openSourceStatus === 'open-weight' ? 'wt' : 'prop'}">${esc(OPEN[m.openSourceStatus] || m.openSourceStatus)}</span></td>
        <td class="mono sm nowrap">${ctxLabel(m.contextWindow)}</td>
        <td class="sm">${m.localCapable ? 'local' : ''}${m.localCapable && m.apiAvailable ? ' + ' : ''}${m.apiAvailable ? 'API' : ''}${!m.localCapable && !m.apiAvailable ? 'download' : ''}</td>
        <td class="c-act"><a class="btn-sm" href="model.html?slug=${encodeURIComponent(m.slug)}">Open</a></td>
      </tr>`).join('');
  }
})();
