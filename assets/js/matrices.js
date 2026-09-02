// Matrices page: render capability matrices from matrix_registry.json.
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    var mount = document.getElementById('mtx-grid');
    fetch('data/matrix_registry.json').then(function (r) { return r.json(); }).then(function (data) {
      var matrices = data.matrices || [];
      document.getElementById('mtx-count').textContent = matrices.length + ' curated matrices';
      mount.innerHTML = matrices.map(card).join('');
      revealNow(mount.querySelectorAll('.reveal'));
    }).catch(function (e) {
      mount.innerHTML = '<p class="empty">Could not load matrix data. Serve over HTTP.</p>';
      console.error(e);
    });

    function card(m) {
      var caps = (m.capabilities || []).map(function (c) {
        var provs = (c.providers || []).map(function (p) { return p.name; }).slice(0, 5).join(' · ');
        return '<div class="cap"><b>' + esc(c.id) + '</b>' +
          '<p>' + esc(c.intent) + '</p>' +
          (provs ? '<div class="prov">Providers: ' + esc(provs) + '</div>' : '') + '</div>';
      }).join('');

      return '<article class="mtx reveal" id="' + esc(m.name) + '">' +
        '<h3><span class="g">' + esc(m.display_name) + '</span></h3>' +
        '<p>' + esc(m.description) + '</p>' +
        '<div class="chips">' + (m.clis || []).map(function (c) {
          return '<a class="chip" href="registry.html#' + encodeURIComponent(c) + '">' + esc(c) + '</a>';
        }).join('') + '</div>' +
        '<div style="font-size:.78rem;color:var(--ink-3)">' +
          (m.clis || []).length + ' CLIs · ' + (m.capabilities || []).length + ' capabilities · ' +
          esc(m.category) + '</div>' +
        (caps ? '<details><summary>Show ' + (m.capabilities || []).length + ' capabilities</summary>' + caps + '</details>' : '') +
      '</article>';
    }

    function revealNow(els) {
      var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      Array.prototype.forEach.call(els, function (el, i) {
        if (reduce) { el.classList.add('in'); return; }
        el.style.transitionDelay = Math.min(i * 60, 360) + 'ms';
        requestAnimationFrame(function () { requestAnimationFrame(function () { el.classList.add('in'); }); });
      });
    }

    function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    }); }
  });
})();
