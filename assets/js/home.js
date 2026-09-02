/**
 * home.js — landing page: live counts, category chips, curated highlights,
 * recently-viewed, and a search box that hands off to the Browse page.
 */
(function () {
  'use strict';
  const esc = (s) => window.CLISearch.escapeHtml(s);

  document.addEventListener('DOMContentLoaded', async () => {
    const form = document.getElementById('home-search');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const q = document.getElementById('home-q').value.trim();
      location.href = q ? `registry.html?q=${encodeURIComponent(q)}` : 'registry.html';
    });

    let data;
    try { data = await window.CLIData.load(); } catch { return; }
    const { clis, meta } = data;

    setText('s-total', meta.counts.total);
    setText('s-cat', meta.categories.length);
    setText('s-curated', meta.counts.curated);

    document.getElementById('cat-chips').innerHTML = meta.categories.slice(0, 18)
      .map((c) => `<a class="chip" href="registry.html?cat=${encodeURIComponent(c.id)}">${esc(c.id)} <span class="chip-n">${c.count}</span></a>`).join('');

    const curated = clis.filter((c) => c.dataQuality === 'curated').slice(0, 6);
    document.getElementById('curated-grid').innerHTML = curated.map((e) => `
      <a class="mini-card" href="cli.html?slug=${encodeURIComponent(e.slug)}">
        <span class="mini-name">${esc(e.name)}</span>
        <span class="mini-sum">${esc(e.summary)}</span>
        <span class="mini-cat">${esc(e.categories[0])}${e.difficulty ? ' · ' + esc(e.difficulty) : ''}</span>
      </a>`).join('');

    const recent = window.CLIStore.get().recent.map((s) => data.bySlug.get(s)).filter(Boolean).slice(0, 5);
    if (recent.length) {
      const wrap = document.getElementById('recent-wrap');
      wrap.hidden = false;
      wrap.querySelector('#recent-list').innerHTML = recent
        .map((e) => `<a class="chip" href="cli.html?slug=${encodeURIComponent(e.slug)}">${esc(e.name)}</a>`).join('');
    }
  });

  function setText(id, v) { const el = document.getElementById(id); if (el) el.textContent = v; }
})();
