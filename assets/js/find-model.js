/**
 * find-model.js — "Find my AI model". Deterministic weighted scoring against
 * declared requirements. Every recommendation explains what matched.
 */
(function () {
  'use strict';
  const esc = (s) => window.CLISearch.escapeHtml(s);

  // requirement -> scoring predicate + weight + explanation
  const REQS = [
    { id: 'coding', label: 'Coding', w: 6, test: (m) => m.codeCapability === 'strong' ? 6 : m.codeCapability === 'moderate' ? 3 : (m.categories || []).includes('coding') ? 5 : 0, why: 'strong code capability' },
    { id: 'reasoning', label: 'Reasoning', w: 6, test: (m) => m.reasoning === 'yes' ? 6 : m.reasoning === 'hybrid' ? 4 : (m.categories || []).includes('reasoning') ? 5 : 0, why: 'reasoning support' },
    { id: 'local', label: 'Local / private', w: 7, test: (m) => m.localCapable ? 7 : 0, why: 'runs locally' },
    { id: 'low-resource', label: 'Low-resource hardware', w: 5, test: (m) => { const p = String(m.parameters || ''); const small = (m.categories || []).includes('small-language-model'); const act = String(m.activeParameters || ''); return small ? 5 : /(^| )[0-9]{1,2}B/.test(p) && !/[0-9]{3}B|T/.test(p) ? 4 : /[0-9]{1,2}B/.test(act) ? 3 : 0; }, why: 'small enough for modest hardware' },
    { id: 'multimodal', label: 'Multimodal', w: 5, test: (m) => (m.categories || []).includes('multimodal') ? 5 : 0, why: 'multimodal' },
    { id: 'vision', label: 'Vision', w: 5, test: (m) => m.vision === 'yes' ? 5 : 0, why: 'vision input' },
    { id: 'large-context', label: 'Large context', w: 5, test: (m) => (m.contextWindow || 0) >= 1000000 ? 5 : (m.contextWindow || 0) >= 200000 ? 3 : 0, why: 'large context window' },
    { id: 'commercial', label: 'Commercial use', w: 5, test: (m) => m.commercialUse === 'yes' ? 5 : m.commercialUse === 'restricted' ? 1 : 0, why: 'commercial use permitted' },
    { id: 'open-source', label: 'Open source', w: 6, test: (m) => m.openSourceStatus === 'open-source' ? 6 : m.openSourceStatus === 'open-weight' ? 2 : 0, why: 'OSI-style open license' },
    { id: 'cheap-api', label: 'Cheap API', w: 4, test: (m) => { const p = m.pricing || {}; return m.apiAvailable && p.inputPerMTok != null && p.inputPerMTok <= 1 ? 4 : m.apiAvailable && p.inputPerMTok != null && p.inputPerMTok <= 3 ? 2 : 0; }, why: 'low API price' },
    { id: 'fast', label: 'Fast inference', w: 3, test: (m) => { const act = String(m.activeParameters || ''); return (m.categories || []).includes('small-language-model') ? 3 : /[0-9]{1,2}B/.test(act) && !/[0-9]{3}/.test(act) ? 2 : 0; }, why: 'few active parameters' },
    { id: 'research', label: 'Research', w: 3, test: (m) => (m.categories || []).includes('research') ? 3 : 0, why: 'research-oriented' },
  ];

  document.addEventListener('DOMContentLoaded', async () => {
    const mount = document.getElementById('find-model');
    let data;
    try { data = await window.ModelData.load(); }
    catch (e) { mount.innerHTML = `<p class="empty">Could not load models (${esc(String(e.message || e))}).</p>`; return; }

    const preset = new Set((new URLSearchParams(location.search).get('need') || '').split(',').filter(Boolean));
    mount.innerHTML = `
      <h1 class="sec-title">Find my <span class="g">AI model</span></h1>
      <p class="sec-sub">Pick what matters. Scoring is deterministic — each result shows which requirements it satisfied. Not an LLM.</p>
      <form id="fm-form" style="margin-top:20px">
        <fieldset class="fm-reqs"><legend class="sr-only">Requirements</legend>
          ${REQS.map((r) => `<label class="chk"><input type="checkbox" name="need" value="${r.id}"${preset.has(r.id) ? ' checked' : ''}> ${esc(r.label)}</label>`).join('')}
        </fieldset>
        <button type="submit" class="btn btn-accent" style="margin-top:14px">Recommend models</button>
      </form>
      <div id="fm-results" style="margin-top:26px" aria-live="polite"></div>`;

    const form = document.getElementById('fm-form');
    const out = document.getElementById('fm-results');
    form.addEventListener('submit', (e) => { e.preventDefault(); run(); });
    if (preset.size) run();

    function run() {
      const need = [...form.querySelectorAll('input[name="need"]:checked')].map((i) => i.value);
      history.replaceState(null, '', need.length ? `?need=${need.join(',')}` : location.pathname);
      if (!need.length) { out.innerHTML = '<p class="muted">Select at least one requirement.</p>'; return; }
      const reqs = REQS.filter((r) => need.includes(r.id));
      const scored = data.models.map((m) => {
        let score = 0; const hits = [];
        for (const r of reqs) { const s = r.test(m); if (s > 0) { score += s; hits.push(r.why); } }
        if (m.dataQuality !== 'derived') score += 0.1;
        return { m, score, hits, coverage: hits.length / reqs.length };
      }).filter((x) => x.score > 0).sort((a, b) => b.coverage - a.coverage || b.score - a.score || a.m.name.localeCompare(b.m.name)).slice(0, 8);

      if (!scored.length) { out.innerHTML = '<p class="empty">No model in the directory matches that combination. Try fewer requirements.</p>'; return; }
      out.innerHTML = `<p class="reg-count"><b>${scored.length}</b> recommendations</p>` + scored.map((r, i) => `
        <article class="rec">
          <div class="rec-rank">${i + 1}</div>
          <div class="rec-body">
            <a class="rec-name" href="model.html?slug=${encodeURIComponent(r.m.slug)}">${esc(r.m.name)}</a>
            <span class="pill">${esc(r.m.provider)}</span>
            <span class="pill open-${r.m.openSourceStatus === 'open-source' ? 'src' : r.m.openSourceStatus === 'open-weight' ? 'wt' : 'prop'}">${esc(r.m.openSourceStatus)}</span>
            <p class="rec-sum">${esc(r.m.strengths && r.m.strengths[0] ? r.m.strengths[0] : r.m.architecture || '')}</p>
            <p class="rec-why">Matched ${Math.round(r.coverage * 100)}% of requirements — ${esc(r.hits.join(' · '))}</p>
          </div>
        </article>`).join('') + `<p class="muted sm" style="margin-top:14px">Best suited for — based on documented capabilities, not a quality ranking. See <a href="model-compare.html">Compare</a> for a side-by-side.</p>`;
    }
  });
})();
