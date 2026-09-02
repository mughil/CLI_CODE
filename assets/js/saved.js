/**
 * saved.js — browser-local lists: favorites, recently viewed, and the compare
 * queue. All state lives in CLIStore (this device only).
 */
(function () {
  'use strict';
  const esc = (s) => window.CLISearch.escapeHtml(s);

  document.addEventListener('DOMContentLoaded', async () => {
    const mount = document.getElementById('saved-view');
    let data;
    try { data = await window.CLIData.load(); } catch (e) {
      mount.innerHTML = `<p class="empty">Could not load the dataset (${esc(String(e.message || e))}).</p>`;
      return;
    }
    const bySlug = data.bySlug;

    function card(slug, extra) {
      const e = bySlug.get(slug);
      if (!e) return '';
      return `<article class="mini-card">
        <a class="mini-name" href="cli.html?slug=${encodeURIComponent(slug)}">${esc(e.name)}</a>
        <span class="mini-sum">${esc(e.summary)}</span>
        <span class="mini-cat">${esc(e.categories[0])}</span>
        ${extra || ''}
      </article>`;
    }

    function paint() {
      const s = window.CLIStore.get();
      const favs = s.favorites.filter((x) => bySlug.has(x));
      const recent = s.recent.filter((x) => bySlug.has(x));
      const queue = s.compare.filter((x) => bySlug.has(x));

      mount.innerHTML = `
        <h1 class="sec-title">Saved</h1>
        <p class="sec-sub">Kept in this browser only — no account, nothing synced.
          <button class="linklike" id="wipe">Reset all</button></p>

        <section class="cli-sec">
          <h2>Favorites <span class="muted mono sm">${favs.length}</span></h2>
          ${favs.length
            ? `<div class="mini-grid">${favs.map((x) => card(x, `<button class="btn-sm ghost" data-unfav="${esc(x)}">Remove</button>`)).join('')}</div>
               <p style="margin-top:12px"><a class="btn-sm ghost" href="cheatsheet.html?favorites=1">Cheat sheet from favorites</a></p>`
            : '<p class="muted">Star a tool on <a href="registry.html">Browse</a> or its page.</p>'}
        </section>

        <section class="cli-sec">
          <h2>Compare queue <span class="muted mono sm">${queue.length}/${window.CLIStore.LIMITS.compare}</span></h2>
          ${queue.length
            ? `<div class="mini-grid">${queue.map((x) => card(x, `<button class="btn-sm ghost" data-unq="${esc(x)}">Remove</button>`)).join('')}</div>
               <p style="margin-top:12px">${queue.length >= 2
                 ? `<a class="btn-sm" href="compare.html?slugs=${queue.join(',')}">Compare ${queue.length} tools</a>`
                 : '<span class="muted">Add one more to compare.</span>'}</p>`
            : '<p class="muted">Add tools with the “Compare” control on <a href="registry.html">Browse</a>.</p>'}
        </section>

        <section class="cli-sec">
          <h2>Recently viewed <span class="muted mono sm">${recent.length}</span></h2>
          ${recent.length
            ? `<div class="mini-grid">${recent.map((x) => card(x)).join('')}</div>
               <p style="margin-top:12px"><button class="linklike" id="clear-recent">Clear history</button></p>`
            : '<p class="muted">Tool pages you open show up here.</p>'}
        </section>`;

      mount.querySelectorAll('[data-unfav]').forEach((b) => b.addEventListener('click', () => { window.CLIStore.toggleFavorite(b.dataset.unfav); paint(); }));
      mount.querySelectorAll('[data-unq]').forEach((b) => b.addEventListener('click', () => { window.CLIStore.toggleCompare(b.dataset.unq); paint(); }));
      document.getElementById('clear-recent')?.addEventListener('click', () => { window.CLIStore.clearRecent(); paint(); });
      document.getElementById('wipe')?.addEventListener('click', () => {
        if (confirm('Clear favorites, compare queue and history on this device?')) { window.CLIStore.reset(); paint(); }
      });
    }

    paint();
    window.addEventListener('clistore:change', paint);
  });
})();
