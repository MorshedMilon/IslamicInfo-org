/* IslamicInfo.org — quran-tajweed.js
   Context-aware Tajweed: colors flowing Study view (text_uthmani_tajweed) and swaps
   the Mushaf page font v2<->v4. Depends on window.II.tajweedCore + window.II.mushaf. */
(function () {
  'use strict';
  var tcore = window.II && window.II.tajweedCore;
  var on = false;

  function inMushaf() { return !!(window.II && window.II.mushaf && window.II.mushaf.isActive()); }

  function legend(show) {
    var l = document.getElementById('tjLegend'); if (l) l.classList.toggle('show', show);
    var m = document.getElementById('mushafTjLegend'); if (m) m.classList.toggle('show', show);
  }

  // Study view: swap between the per-word .ayah-arabic layer and the colored .ayah-tajweed layer.
  function applyFlow() {
    document.querySelectorAll('.ayah-card').forEach(function (card) {
      var plain = card.querySelector('.ayah-arabic');
      var tj = card.querySelector('.ayah-tajweed');
      if (!tj) return;
      if (on) { if (plain) plain.style.display = 'none'; tj.style.display = ''; }
      else    { if (plain) plain.style.display = '';     tj.style.display = 'none'; }
    });
  }

  function applyMushaf() {
    if (window.II && window.II.mushaf) window.II.mushaf._setVariant(on ? 'v4' : 'v2');
  }

  window.toggleTajweed = function (btn) {
    on = !on;
    if (btn) btn.classList.toggle('tajweed-active', on);
    legend(on);
    if (inMushaf()) applyMushaf(); else applyFlow();
    if (window.showToast) window.showToast(on ? 'Tajweed color-coding on ✦' : 'Tajweed off');
  };

  window.II = window.II || {};
  window.II.tajweed = {
    isOn: function () { return on; },
    // Re-assert current tajweed state for the active view (called after (re)render / mode switch).
    reapply: function () { if (inMushaf()) { if (on) applyMushaf(); } else applyFlow(); },
    colorize: function (html) { return tcore ? tcore.colorize(html) : (html || ''); }
  };
})();
