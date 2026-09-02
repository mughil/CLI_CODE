/**
 * stacks.js — Stack Builder (curated presets from data/stacks.json) plus the
 * capability matrices from data/matrix_registry.json.
 */
(function () {
  'use strict';
  const esc = (s) => window.CLISearch.escapeHtml(s);

  document.addEventListener('DOMContentLoaded', init);

  async function init() {
    const presetMount = document.getElementById('preset-list');
    const mtxMount = document.getElementById('mtx-grid');

    let data;
    try { data = await window.CLIData.load(); } catch (e) {
      presetMount.innerHTML = `<p class="empty">Could not load the dataset (${esc(String(e.message || e))}).</p>`;
      return;
    }
    const bySlug = data.bySlug;

    let stacks = [];
    try {
      stacks = (await (await fetch('data/stacks.json', { cache: 'no-cache' })).json()).stacks || [];
    } catch { /* section stays empty, note shown below */ }

    document.getElementById('preset-count').textContent =
      stacks.length ? `${stacks.length} preset stacks` : 'No preset stacks loaded';
    presetMount.innerHTML = stacks.map((s) => presetCard(s, bySlug)).join('');
    wireCopyAll(bySlug, stacks);

    // capability matrices
    try {
      const m = (await (await fetch('data/matrix_registry.json', { cache: 'no-cache' })).json()).matrices || [];
      document.getElementById('mtx-count').textContent = `${m.length} capability matrices`;
      mtxMount.innerHTML = m.map(matrixCard).join('');
      revealNow(mtxMount.querySelectorAll('.reveal'));
    } catch {
      document.getElementById('mtx-count').textContent = '';
      mtxMount.innerHTML = '<p class="empty">Capability matrices unavailable.</p>';
    }
  }

  function presetCard(s, bySlug) {
    const rows = s.picks.map((p) => {
      const t = bySlug.get(p.slug);
      const name = t ? t.name : p.slug;
      return `<li>
        <a class="pick-name" href="cli.html?slug=${encodeURIComponent(p.slug)}">${esc(name)}</a>
        <span class="pick-role">${esc(p.role)}</span>
      </li>`;
    }).join('');
    return `<article class="preset" id="stack-${esc(s.id)}">
      <div class="preset-head">
        <h3>${esc(s.name)}</h3>
        <button class="btn-sm ghost" data-copy-stack="${esc(s.id)}">Copy all installs</button>
      </div>
      <p class="preset-desc">${esc(s.description)}</p>
      ${s.note ? `<p class="preset-note">Note: ${esc(s.note)}</p>` : ''}
      <ol class="pick-list">${rows}</ol>
    </article>`;
  }

  function wireCopyAll(bySlug, stacks) {
    document.getElementById('preset-list').addEventListener('click', (e) => {
      const b = e.target.closest('[data-copy-stack]');
      if (!b) return;
      const s = stacks.find((x) => x.id === b.dataset.copyStack);
      if (!s) return;
      const lines = s.picks.map((p) => {
        const t = bySlug.get(p.slug);
        const cmd = t && t.install[0] ? t.install[0].command : `# ${p.slug}: see cli.html?slug=${p.slug}`;
        return `# ${p.slug} — ${p.role}\n${cmd}`;
      });
      navigator.clipboard.writeText(lines.join('\n\n')).then(() => {
        const old = b.textContent;
        b.textContent = 'Copied';
        b.classList.add('done');
        setTimeout(() => { b.textContent = old; b.classList.remove('done'); }, 1400);
      });
    });
  }

  function matrixCard(m) {
    const caps = (m.capabilities || []).map((c) => {
      const provs = (c.providers || []).map((p) => p.name).slice(0, 5).join(' · ');
      return `<div class="cap"><b>${esc(c.id)}</b><p>${esc(c.intent)}</p>${provs ? `<div class="prov">Providers: ${esc(provs)}</div>` : ''}</div>`;
    }).join('');
    return `<article class="mtx reveal" id="matrix-${esc(m.name)}">
      <h3><span class="g">${esc(m.display_name)}</span></h3>
      <p>${esc(m.description)}</p>
      <div class="chips">${(m.clis || []).map((c) => `<a class="chip" href="cli.html?slug=${encodeURIComponent(c)}">${esc(c)}</a>`).join('')}</div>
      <div style="font-size:.78rem;color:var(--ink-3)">${(m.clis || []).length} CLIs · ${(m.capabilities || []).length} capabilities · ${esc(m.category)}</div>
      ${caps ? `<details><summary>Show ${(m.capabilities || []).length} capabilities</summary>${caps}</details>` : ''}
    </article>`;
  }

  function revealNow(els) {
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    Array.prototype.forEach.call(els, (el, i) => {
      if (reduce) { el.classList.add('in'); return; }
      el.style.transitionDelay = Math.min(i * 60, 360) + 'ms';
      requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('in')));
    });
  }
})();
