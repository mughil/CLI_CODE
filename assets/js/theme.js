// Theme toggle with persistence + system default.
(function () {
  var KEY = 'clicode:theme';
  var root = document.documentElement;
  var stored = null;
  try { stored = localStorage.getItem(KEY); } catch (e) {}
  var sysDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  var theme = stored || (sysDark ? 'dark' : 'light');
  apply(theme);

  function apply(t) {
    root.setAttribute('data-theme', t);
    theme = t;
  }

  document.addEventListener('DOMContentLoaded', function () {
    var btn = document.querySelector('.theme-btn');
    if (!btn) return;
    render(btn);
    btn.addEventListener('click', function () {
      apply(theme === 'dark' ? 'light' : 'dark');
      try { localStorage.setItem(KEY, theme); } catch (e) {}
      render(btn);
    });
  });

  function render(btn) {
    var sun = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
    var moon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
    btn.innerHTML = theme === 'dark' ? sun : moon;
    btn.setAttribute('aria-label', 'Switch to ' + (theme === 'dark' ? 'light' : 'dark') + ' theme');
  }
})();

// Shared: keep the "Saved" nav badge in sync with favorites.
document.addEventListener('DOMContentLoaded', function () {
  var badge = document.getElementById('nav-fav-count');
  if (!badge || !window.CLIStore) return;
  function paint() {
    var n = window.CLIStore.get().favorites.length;
    badge.textContent = n;
    badge.hidden = n === 0;
  }
  paint();
  window.addEventListener('clistore:change', paint);
});

// Shared: staggered reveal-on-scroll for [.reveal] elements.
document.addEventListener('DOMContentLoaded', function () {
  var items = document.querySelectorAll('.reveal');
  if (!items.length) return;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('in'); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var group = Array.prototype.filter.call(
        e.target.parentElement ? e.target.parentElement.children : [e.target],
        function (c) { return c.classList && c.classList.contains('reveal'); }
      );
      var i = Math.max(0, group.indexOf(e.target));
      e.target.style.transitionDelay = Math.min(i * 60, 360) + 'ms';
      e.target.classList.add('in');
      io.unobserve(e.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  items.forEach(function (el) { io.observe(el); });
  // safety net: never leave content invisible if the observer misfires
  setTimeout(function () {
    document.querySelectorAll('.reveal:not(.in)').forEach(function (el) { el.classList.add('in'); });
  }, 2500);
});

// Shared: copy-to-clipboard for any [data-copy] button.
document.addEventListener('click', function (e) {
  var b = e.target.closest('[data-copy]');
  if (!b) return;
  var text = b.getAttribute('data-copy');
  navigator.clipboard.writeText(text).then(function () {
    var old = b.textContent;
    b.textContent = 'Copied';
    b.classList.add('done');
    setTimeout(function () { b.textContent = old; b.classList.remove('done'); }, 1400);
  });
});
