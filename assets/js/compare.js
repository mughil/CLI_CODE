/**
 * compare.js — "CLI Battle". Compare 2–4 tools side by side, surfacing the
 * differences that matter rather than dumping every field.
 * Source of slugs: ?slugs=a,b,c  OR the compare queue in CLIStore.
 */
(function () {
  'use strict';
  const esc = (s) => window.CLISearch.escapeHtml(s);

  const ROWS = [
    ['summary', 'Summary', (e) => esc(e.summary)],
    ['categories', 'Categories', (e) => e.categories.join(', ')],
    ['difficulty', 'Difficulty', (e) => e.difficulty || '—'],
    ['platforms', 'Platforms', (e) => (e.platforms || []).join(', ') || '—'],
    ['language', 'Language', (e) => e.language || e.runtime || '—'],
    ['license', 'License', (e) => e.license || '—'],
    ['packageManagers', 'Install via', (e) => (e.packageManagers || []).join(', ') || '—'],
    ['useCases', 'Use cases', (e) => (e.useCases || []).length ? '<ul>' + e.useCases.map((u) => `<li>${esc(u)}</li>`).join('') + '</ul>' : '—'],
    ['examples', 'Examples', (e) => e.examples.length ? `${e.examples.length} documented` : 'none'],
    ['lastVerified', 'Last verified', (e) => e.lastVerified || '—'],
    ['dataQuality', 'Data', (e) => e.dataQuality],
  ];

  function differs(entries, key) {
    const norm = (e) => JSON.stringify(e[key] ?? null);
    return new Set(entries.map(norm)).size > 1;
  }

  function keyDifferences(entries) {
    const out = [];
    const names = entries.map((e) => e.name);
    if (differs(entries, 'difficulty')) {
      out.push(entries.map((e) => `${e.name} is ${e.difficulty || 'unrated'}`).join(', '));
    }
    const langs = entries.map((e) => e.language || e.runtime).filter(Boolean);
    if (new Set(langs).size > 1) out.push('Different implementation languages: ' + entries.map((e) => `${e.name} (${e.language || e.runtime || '?'})`).join(', '));
    const lic = entries.map((e) => e.license).filter(Boolean);
    if (lic.length && new Set(lic).size === 1) out.push(`All ${lic.length === entries.length ? '' : 'known '}licensed ${lic[0]}`);
    else if (new Set(lic).size > 1) out.push('Licenses differ: ' + entries.map((e) => `${e.name} (${e.license || '?'})`).join(', '));
    const plats = entries.map((e) => new Set(e.platforms || []));
    const allPlats = [...new Set(entries.flatMap((e) => e.platforms || []))];
    const notEverywhere = allPlats.filter((p) => !plats.every((s) => s.has(p)));
    if (notEverywhere.length && allPlats.length) {
      out.push('Platform gaps: ' + entries.filter((e) => (e.platforms || []).length < allPlats.length)
        .map((e) => `${e.name} lacks ${allPlats.filter((p) => !(e.platforms || []).includes(p)).join('/')}`).join('; '));
    }
    const noUse = entries.filter((e) => !(e.useCases || []).length);
    if (noUse.length && noUse.length < entries.length) out.push('No documented use cases yet for ' + noUse.map((e) => e.name).join(', '));
    const sharedCat = entries.map((e) => new Set(e.categories)).reduce((a, b) => new Set([...a].filter((x) => b.has(x))));
    if (sharedCat.size) out.push(`All in category ${[...sharedCat].join(', ')} — direct alternatives`);
    return out.length ? out : [`${names.join(' and ')} have very similar metadata.`];
  }

  function render(mount, entries) {
    if (entries.length < 2) {
      mount.innerHTML = `
        <h1 class="sec-title">CLI <span class="g">battle</span></h1>
        <p class="sec-sub">Pick 2–4 tools to compare. Add them from the star/compare controls on <a href="registry.html">Browse</a>, or open a tool and use “Add to compare”.</p>
        ${entries.length === 1 ? `<p class="reg-count">In the queue: <b>${esc(entries[0].name)}</b> — add at least one more.</p>` : ''}
        <p style="margin-top:20px"><a class="btn btn-accent" href="registry.html">Browse tools</a></p>`;
      return;
    }

    document.title = `${entries.map((e) => e.name).join(' vs ')} — CLI_CODE`;

    mount.innerHTML = `
      <h1 class="sec-title">${entries.map((e) => `<span class="g">${esc(e.name)}</span>`).join(' <span style="color:var(--ink-3)">vs</span> ')}</h1>
      <div class="cmp-controls">
        ${entries.map((e) => `<span class="chip">${esc(e.name)} <button data-drop="${esc(e.slug)}" aria-label="Remove ${esc(e.name)}">×</button></span>`).join('')}
        <a class="btn-sm ghost" href="registry.html">+ Add tool</a>
        <button class="btn-sm ghost" id="cmp-clear">Clear</button>
      </div>

      <section class="cli-sec"><h2>Key differences</h2>
        <ul class="diff-list">${keyDifferences(entries).map((d) => `<li>${d}</li>`).join('')}</ul>
      </section>

      <div class="table-scroll">
        <table class="reg-table cmp-table">
          <thead><tr><th scope="col">Field</th>${entries.map((e) => `<th scope="col"><a href="cli.html?slug=${encodeURIComponent(e.slug)}">${esc(e.name)}</a></th>`).join('')}</tr></thead>
          <tbody>
            ${ROWS.map(([key, label, fn]) => {
              const d = differs(entries, key);
              return `<tr class="${d ? 'row-diff' : ''}">
                <th scope="row">${label}${d ? ' <span class="diff-dot" title="differs">●</span>' : ''}</th>
                ${entries.map((e) => `<td>${fn(e)}</td>`).join('')}
              </tr>`;
            }).join('')}
            <tr>
              <th scope="row">Install</th>
              ${entries.map((e) => e.install[0]
                ? `<td><div class="cmd"><code>${esc(e.install[0].command)}</code><button class="copy-btn" data-copy="${esc(e.install[0].command)}">Copy</button></div></td>`
                : '<td>—</td>').join('')}
            </tr>
          </tbody>
        </table>
      </div>
      <p class="muted sm" style="margin-top:10px"><span class="diff-dot">●</span> marks rows where the tools differ.</p>`;

    mount.querySelectorAll('[data-drop]').forEach((b) => b.addEventListener('click', () => {
      window.CLIStore.toggleCompare(b.dataset.drop);
      location.search = queueParam();
    }));
    document.getElementById('cmp-clear')?.addEventListener('click', () => {
      window.CLIStore.clearCompare();
      location.href = 'compare.html';
    });
  }

  function queueParam() {
    const q = window.CLIStore.get().compare;
    return q.length ? `?slugs=${q.join(',')}` : '';
  }

  document.addEventListener('DOMContentLoaded', async () => {
    const mount = document.getElementById('cmp-view');
    let data;
    try { data = await window.CLIData.load(); } catch (e) {
      mount.innerHTML = `<p class="empty">Could not load the dataset (${esc(String(e.message || e))}).</p>`;
      return;
    }

    const fromUrl = (new URLSearchParams(location.search).get('slugs') || '')
      .split(',').map((s) => s.trim()).filter(Boolean);
    let slugs = fromUrl.length ? fromUrl : window.CLIStore.get().compare;
    slugs = [...new Set(slugs)].filter((s) => data.bySlug.has(s)).slice(0, 4);

    // keep the store queue in sync with an explicit URL
    if (fromUrl.length) {
      window.CLIStore.clearCompare();
      slugs.forEach((s) => window.CLIStore.toggleCompare(s));
    }

    render(mount, slugs.map((s) => data.bySlug.get(s)));
  });
})();
