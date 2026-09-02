/**
 * cheatsheet.js — printable command reference for a set of tools.
 * Source: ?slugs=a,b,c  |  ?stack=<id>  |  ?favorites=1  |  compare queue.
 * Renders install commands + documented examples. Never invents commands.
 */
(function () {
  'use strict';
  const esc = (s) => window.CLISearch.escapeHtml(s);

  async function resolveSlugs(data) {
    const p = new URLSearchParams(location.search);
    if (p.get('slugs')) return { title: 'Selected tools', slugs: p.get('slugs').split(',').map((s) => s.trim()) };
    if (p.get('favorites')) return { title: 'Favorites', slugs: window.CLIStore.get().favorites };
    if (p.get('stack')) {
      try {
        const stacks = (await (await fetch('data/stacks.json', { cache: 'no-cache' })).json()).stacks || [];
        const s = stacks.find((x) => x.id === p.get('stack'));
        if (s) return { title: s.name + ' stack', slugs: s.picks.map((x) => x.slug) };
      } catch { /* fall through */ }
    }
    const q = window.CLIStore.get().compare;
    if (q.length) return { title: 'Comparison queue', slugs: q };
    return { title: '', slugs: [] };
  }

  function toolBlock(e) {
    const installs = e.install.length
      ? e.install.map((i) => `<div class="cs-cmd"><span class="cs-label">${esc(i.label && i.label !== 'Install' ? i.label : i.method)}</span><code>${esc(i.command)}</code></div>`).join('')
      : '<p class="muted">No install command recorded — see the tool page.</p>';
    const examples = e.examples.length
      ? `<h4>Examples</h4>` + e.examples.map((x) =>
        `<div class="cs-ex"><div class="cs-ex-t">${esc(x.title)}</div><code>${esc(x.command)}</code>${x.description ? `<p class="muted sm">${esc(x.description)}</p>` : ''}</div>`).join('')
      : (e.source === 'harness'
        ? '<p class="muted sm">Harness CLI — subcommands are listed in the tool\'s <code>SKILL.md</code>; run the entry point with <code>--help</code> after install.</p>'
        : '<p class="muted sm">No examples documented yet.</p>');

    return `<section class="cs-tool">
      <h3><a href="cli.html?slug=${encodeURIComponent(e.slug)}">${esc(e.name)}</a>
        <span class="pill src ${e.source}">${e.source}</span></h3>
      <p class="muted">${esc(e.summary)}</p>
      <h4>Install</h4>
      ${installs}
      ${examples}
    </section>`;
  }

  document.addEventListener('DOMContentLoaded', async () => {
    const mount = document.getElementById('cs-view');
    let data;
    try { data = await window.CLIData.load(); } catch (e) {
      mount.innerHTML = `<p class="empty">Could not load the dataset (${esc(String(e.message || e))}).</p>`;
      return;
    }

    const { title, slugs } = await resolveSlugs(data);
    const tools = [...new Set(slugs)].map((s) => data.bySlug.get(s)).filter(Boolean);

    if (!tools.length) {
      mount.innerHTML = `
        <h1 class="sec-title">Cheat <span class="g">sheet</span></h1>
        <p class="sec-sub">Build a printable command reference from a set of tools. Open a <a href="stacks.html">stack</a>, your <a href="saved.html">favorites</a>, or pass <code>?slugs=a,b,c</code>.</p>`;
      return;
    }

    document.title = `${title || 'Cheat sheet'} — CLI_CODE`;
    mount.innerHTML = `
      <div class="cs-head no-print">
        <div>
          <h1 class="sec-title" style="margin:0">${esc(title || 'Cheat sheet')}</h1>
          <p class="muted sm">${tools.length} tool${tools.length > 1 ? 's' : ''} · generated from local data</p>
        </div>
        <div class="cs-actions">
          <button class="btn-sm" id="cs-print">Print</button>
          <button class="btn-sm ghost" id="cs-copy">Copy all commands</button>
        </div>
      </div>
      <div class="cs-doc">
        <h1 class="print-only">${esc(title || 'Cheat sheet')} — CLI_CODE</h1>
        ${tools.map(toolBlock).join('')}
        <p class="muted sm cs-foot">Commands are drawn from each tool's registry entry. Some entries have install steps only until contributors add examples.</p>
      </div>`;

    document.getElementById('cs-print').addEventListener('click', () => window.print());
    document.getElementById('cs-copy').addEventListener('click', function () {
      const text = tools.map((e) => {
        const lines = [`## ${e.name}`];
        for (const i of e.install) lines.push(`# ${i.label || i.method}\n${i.command}`);
        for (const x of e.examples) lines.push(`# ${x.title}\n${x.command}`);
        return lines.join('\n');
      }).join('\n\n');
      navigator.clipboard.writeText(text).then(() => {
        this.textContent = 'Copied';
        setTimeout(() => { this.textContent = 'Copy all commands'; }, 1400);
      });
    });
  });
})();
