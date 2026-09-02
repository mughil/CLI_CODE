// Registry page: load + merge both registries, then search / filter / sort / detail drawer.
(function () {
  var state = {
    all: [],
    view: [],
    q: '',
    kind: 'all',        // all | harness | public
    category: 'all',
    sort: 'name',        // name | category | kind | date
    dir: 1,
  };

  var els = {};
  document.addEventListener('DOMContentLoaded', init);

  function init() {
    els.search = document.getElementById('reg-search');
    els.category = document.getElementById('reg-category');
    els.seg = document.getElementById('reg-kind');
    els.count = document.getElementById('reg-count');
    els.tbody = document.getElementById('reg-body');
    els.head = document.getElementById('reg-head');
    els.drawer = document.getElementById('drawer');
    els.scrim = document.getElementById('drawer-scrim');

    Promise.all([
      fetchJSON('data/registry.json'),
      fetchJSON('data/public_registry.json'),
      fetchJSON('data/registry-dates.json'),
    ]).then(function (r) {
      var dates = r[2] || {};
      var harness = (r[0].clis || []).map(function (c) { return normalize(c, 'harness', dates); });
      var pub = (r[1].clis || []).map(function (c) { return normalize(c, 'public', dates); });
      state.all = harness.concat(pub);
      buildCategoryOptions();
      wire();
      readURL();
      apply();
      var hashName = decodeURIComponent(location.hash.replace('#', ''));
      if (hashName) {
        var item = state.all.find(function (c) { return c.name === hashName; });
        if (item) openDrawer(item);
      }
    }).catch(function (err) {
      els.tbody.innerHTML = '<tr><td class="empty">Could not load registry data.<br><small>Serve this folder over HTTP (e.g. <code>python -m http.server</code>) — <code>file://</code> blocks fetch.</small></td></tr>';
      console.error(err);
    });
  }

  function fetchJSON(u) { return fetch(u).then(function (r) { if (!r.ok) throw new Error(u + ' ' + r.status); return r.json(); }); }

  function normalize(c, kind, dates) {
    return {
      kind: kind,
      name: c.name,
      title: c.display_name || c.name,
      description: c.description || '',
      category: c.category || 'other',
      version: c.version || '',
      requires: c.requires || '',
      homepage: c.homepage || c.docs_url || c.source_url || '',
      source_url: c.source_url || '',
      install_cmd: c.install_cmd || '',
      npx_cmd: c.npx_cmd || '',
      skill_md: c.skill_md || '',
      entry_point: c.entry_point || '',
      package_manager: c.package_manager || (kind === 'harness' ? 'pip / git' : ''),
      update_cmd: c.update_cmd || '',
      uninstall_cmd: c.uninstall_cmd || '',
      contributors: c.contributors || (c.contributor ? [{ name: c.contributor, url: c.contributor_url }] : []),
      date: dates[c.name] || null,
    };
  }

  function buildCategoryOptions() {
    var cats = Array.from(new Set(state.all.map(function (c) { return c.category; }))).sort();
    els.category.innerHTML = '<option value="all">All categories</option>' +
      cats.map(function (c) { return '<option value="' + c + '">' + c + '</option>'; }).join('');
  }

  function wire() {
    els.search.addEventListener('input', function () { state.q = this.value.trim().toLowerCase(); pushURL(); apply(); });
    els.category.addEventListener('change', function () { state.category = this.value; pushURL(); apply(); });
    els.seg.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      state.kind = b.dataset.kind;
      els.seg.querySelectorAll('button').forEach(function (x) { x.classList.toggle('on', x === b); });
      pushURL(); apply();
    });
    els.head.addEventListener('click', function (e) {
      var th = e.target.closest('th'); if (!th || !th.dataset.sort) return;
      if (state.sort === th.dataset.sort) state.dir *= -1;
      else { state.sort = th.dataset.sort; state.dir = 1; }
      pushURL(); apply();
    });
    els.scrim.addEventListener('click', closeDrawer);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeDrawer(); });
    window.addEventListener('hashchange', function () {
      var n = decodeURIComponent(location.hash.replace('#', ''));
      var item = state.all.find(function (c) { return c.name === n; });
      if (item) openDrawer(item); else closeDrawer();
    });
  }

  function readURL() {
    var p = new URLSearchParams(location.search);
    if (p.get('q')) { state.q = p.get('q').toLowerCase(); els.search.value = p.get('q'); }
    if (p.get('cat')) { state.category = p.get('cat'); els.category.value = p.get('cat'); }
    if (p.get('kind')) {
      state.kind = p.get('kind');
      els.seg.querySelectorAll('button').forEach(function (x) { x.classList.toggle('on', x.dataset.kind === state.kind); });
    }
    if (p.get('sort')) state.sort = p.get('sort');
    if (p.get('dir')) state.dir = p.get('dir') === '-1' ? -1 : 1;
  }

  function pushURL() {
    var p = new URLSearchParams();
    if (state.q) p.set('q', state.q);
    if (state.category !== 'all') p.set('cat', state.category);
    if (state.kind !== 'all') p.set('kind', state.kind);
    if (state.sort !== 'name') p.set('sort', state.sort);
    if (state.dir !== 1) p.set('dir', '-1');
    var qs = p.toString();
    history.replaceState(null, '', location.pathname + (qs ? '?' + qs : '') + location.hash);
  }

  function apply() {
    var q = state.q;
    state.view = state.all.filter(function (c) {
      if (state.kind !== 'all' && c.kind !== state.kind) return false;
      if (state.category !== 'all' && c.category !== state.category) return false;
      if (!q) return true;
      return (c.name + ' ' + c.title + ' ' + c.description + ' ' + c.category).toLowerCase().indexOf(q) !== -1;
    });
    state.view.sort(function (a, b) {
      var k = state.sort, av, bv;
      if (k === 'date') { av = a.date || ''; bv = b.date || ''; }
      else { av = (a[k] || '').toString().toLowerCase(); bv = (b[k] || '').toString().toLowerCase(); }
      return (av < bv ? -1 : av > bv ? 1 : 0) * state.dir;
    });
    render();
  }

  function render() {
    var n = state.view.length, t = state.all.length;
    els.count.innerHTML = 'Showing <b>' + n + '</b> of ' + t + ' CLIs';

    els.head.querySelectorAll('th').forEach(function (th) {
      var on = th.dataset.sort === state.sort;
      th.classList.toggle('sorted', on);
      var arr = th.querySelector('.arr');
      if (arr) arr.textContent = on ? (state.dir === 1 ? '↑' : '↓') : '↕';
    });

    if (!n) { els.tbody.innerHTML = '<tr><td colspan="5" class="empty">No CLIs match those filters.</td></tr>'; return; }

    els.tbody.innerHTML = state.view.map(function (c) {
      return '<tr class="row" data-name="' + esc(c.name) + '">' +
        '<td><div class="reg-name">' + esc(c.title) +
          ' <span class="pill ' + c.kind + '">' + (c.kind === 'harness' ? 'harness' : 'public') + '</span></div>' +
          '<div class="reg-desc">' + esc(c.description) + '</div></td>' +
        '<td><span class="cat-tag">' + esc(c.category) + '</span></td>' +
        '<td class="mono" style="font-size:.76rem;color:var(--ink-3)">' + esc(c.package_manager || '—') + '</td>' +
        '<td class="reg-date">' + (c.date || '—') + '</td>' +
        '<td><button class="copy-btn" data-copy="' + esc(c.install_cmd) + '">Copy install</button></td>' +
      '</tr>';
    }).join('');

    els.tbody.querySelectorAll('tr.row').forEach(function (tr) {
      tr.addEventListener('click', function (e) {
        if (e.target.closest('[data-copy]')) return;
        var item = state.all.find(function (c) { return c.name === tr.dataset.name; });
        if (item) { location.hash = encodeURIComponent(item.name); openDrawer(item); }
      });
    });
  }

  function openDrawer(c) {
    var contrib = (c.contributors || []).map(function (x) { return esc(x.name); }).join(', ') || '—';

    var cmds = [];
    if (c.install_cmd) cmds.push(cmdBlock('Install', c.install_cmd));
    if (c.npx_cmd) cmds.push(cmdBlock('Run via npx', c.npx_cmd));
    if (c.skill_md && /^(npx|pnpm|https?:)/.test(c.skill_md)) cmds.push(cmdBlock('Agent skill', c.skill_md));
    if (c.update_cmd) cmds.push(cmdBlock('Update', c.update_cmd));
    if (c.uninstall_cmd) cmds.push(cmdBlock('Uninstall', c.uninstall_cmd));

    els.drawer.innerHTML =
      '<button class="x" aria-label="Close">×</button>' +
      '<h2>' + esc(c.title) + '</h2>' +
      '<div class="d-meta">' +
        '<span class="pill ' + c.kind + '">' + (c.kind === 'harness' ? 'CLI_CODE harness' : 'Public CLI') + '</span>' +
        '<span class="pill">' + esc(c.category) + '</span>' +
        (c.version ? '<span class="pill">v' + esc(c.version) + '</span>' : '') +
        (c.date ? '<span class="pill">updated ' + c.date + '</span>' : '') +
      '</div>' +
      '<p style="color:var(--ink-2);font-size:.92rem;margin:0">' + esc(c.description) + '</p>' +
      (c.requires ? sec('Requires', '<p>' + esc(c.requires) + '</p>') : '') +
      (cmds.length ? sec('Commands', cmds.join('')) : '') +
      sec('Details',
        '<div class="kv">Entry point: <b class="mono">' + esc(c.entry_point || '—') + '</b></div>' +
        '<div class="kv">Package manager: <b>' + esc(c.package_manager || '—') + '</b></div>' +
        '<div class="kv">Contributors: <b>' + contrib + '</b></div>') +
      ((c.homepage || c.source_url) ? sec('Reference',
        (c.homepage ? '<div class="kv">Homepage: <b class="mono">' + esc(c.homepage) + '</b></div>' : '') +
        (c.source_url ? '<div class="kv">Source: <b class="mono">' + esc(c.source_url) + '</b></div>' : '')) : '');

    els.drawer.querySelector('.x').addEventListener('click', closeDrawer);
    els.drawer.classList.add('open');
    els.scrim.classList.add('open');
  }

  function closeDrawer() {
    els.drawer.classList.remove('open');
    els.scrim.classList.remove('open');
    if (location.hash) history.replaceState(null, '', location.pathname + location.search);
  }

  function sec(title, html) { return '<div class="d-sec"><h4>' + title + '</h4>' + html + '</div>'; }
  function cmdBlock(label, text) {
    return '<div class="cmd" style="margin-bottom:8px"><span class="tag">' + esc(label) + '</span>' +
      '<code>' + esc(text) + '</code>' +
      '<button class="copy-btn" data-copy="' + esc(text) + '">Copy</button></div>';
  }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (m) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
  }); }
})();
