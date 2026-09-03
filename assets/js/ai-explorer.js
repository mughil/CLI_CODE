/**
 * ai-explorer.js — filterable directory of open-source GitHub AI projects.
 */
(function () {
  'use strict';
  const esc = (s) => window.CLISearch.escapeHtml(s);
  const CATS = ['inference', 'serving', 'local-runner', 'training', 'fine-tuning', 'rag', 'agents', 'coding', 'evaluation', 'prompt-tooling', 'vector-search', 'optimization', 'quantization', 'multimodal', 'observability', 'ai-gateway', 'orchestration', 'app-framework'];
  const S = { cat: 'all', q: '' };

  document.addEventListener('DOMContentLoaded', async () => {
    const mount = document.getElementById('ax-view');
    let data;
    try { data = await window.ModelData.load(); }
    catch (e) { mount.innerHTML = `<p class="empty">Could not load projects (${esc(String(e.message || e))}).</p>`; return; }
    const projects = data.projects;
    S.cat = new URLSearchParams(location.search).get('cat') || 'all';

    mount.innerHTML = `
      <h1 class="sec-title">AI <span class="g">open-source explorer</span></h1>
      <p class="sec-sub"><b>${projects.length}</b> high-value GitHub projects for running, serving, building with and evaluating AI models. Star counts are verified against the GitHub API and timestamped — treat them as a snapshot.</p>
      <div class="browse-toolbar">
        <div class="search-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
          <input id="ax-q" type="search" placeholder="Search projects…" aria-label="Search AI projects" autocomplete="off"></div>
        <div class="filters"><label>Category <select id="ax-cat" class="filter">
          <option value="all">All categories</option>
          ${CATS.map((c) => { const n = projects.filter((p) => (p.category || []).includes(c)).length; return n ? `<option value="${c}"${S.cat === c ? ' selected' : ''}>${c} (${n})</option>` : ''; }).join('')}
        </select></label></div>
      </div>
      <p class="reg-count" id="ax-count" aria-live="polite"></p>
      <div class="mini-grid" id="ax-grid"></div>`;

    const q = document.getElementById('ax-q'), catSel = document.getElementById('ax-cat');
    q.addEventListener('input', () => { S.q = q.value.trim().toLowerCase(); paint(); });
    catSel.addEventListener('change', () => { S.cat = catSel.value; history.replaceState(null, '', S.cat === 'all' ? location.pathname : `?cat=${S.cat}`); paint(); });
    paint();

    function paint() {
      let list = projects.filter((p) => {
        if (S.cat !== 'all' && !(p.category || []).includes(S.cat)) return false;
        if (S.q && !(`${p.name} ${p.summary} ${(p.category || []).join(' ')} ${p.language || ''}`.toLowerCase().includes(S.q))) return false;
        return true;
      }).sort((a, b) => (b.stars || 0) - (a.stars || 0) || a.name.localeCompare(b.name));
      document.getElementById('ax-count').innerHTML = `<b>${list.length}</b> of ${projects.length} projects`;
      document.getElementById('ax-grid').innerHTML = list.map((p) => `
        <article class="mini-card">
          <span class="mini-name">${esc(p.name)}</span>
          <span class="mini-sum">${esc(p.summary)}</span>
          <span class="mini-cat">${esc((p.category || []).join(' · '))}</span>
          <div class="kv sm" style="margin-top:4px">
            ${p.language ? esc(p.language) + ' · ' : ''}${p.license ? esc(p.license) : 'license: see repo'}
            ${p.stars != null ? ` · ★ ${p.stars.toLocaleString()} <span class="muted">(${esc(p.starsVerifiedAt)})</span>` : ''}
          </div>
          <div class="chips" style="margin-top:8px">
            <a class="chip" href="${esc(p.repository)}" target="_blank" rel="noopener noreferrer">GitHub ↗</a>
            ${p.officialDocs ? `<a class="chip" href="${esc(p.officialDocs)}" target="_blank" rel="noopener noreferrer">Docs ↗</a>` : ''}
          </div>
        </article>`).join('') || '<p class="empty">No projects match.</p>';
    }
  });
})();
