/* IslamicInfo.org — quran-related.js
   Related Verses (Module: Related Verses) — browser wrapper.
   Lazily fetches the pre-built topic/verse index and renders a related-verses
   panel per ayah card, mirroring the toggleAI idiom in quran-ai.js.
   Depends on: window.II.relatedCore (quran-related-core.js). */
(function () {
  'use strict';

  var core = window.II && window.II.relatedCore;
  var TOPICS_URL = 'src/data/related-verses/topics.json';
  var VERSE_INDEX_URL = 'src/data/related-verses/verse-index.json';
  var state = { topics: null, verseIndex: null, loaded: false, loading: null };

  function loadIndex() {
    if (state.loaded) return Promise.resolve();
    if (state.loading) return state.loading;
    state.loading = Promise.all([
      fetch(TOPICS_URL).then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); }),
      fetch(VERSE_INDEX_URL).then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
    ]).then(function (res) { state.topics = res[0]; state.verseIndex = res[1]; state.loaded = true; });
    return state.loading;
  }
  function el(tag, cls, txt) {
    var e = document.createElement(tag); if (cls) e.className = cls;
    if (txt != null) e.textContent = txt; return e;
  }
  function render(panel, verseKey) {
    panel.innerHTML = '';
    if (!core || !state.topics) { panel.appendChild(el('p', 'rv-empty', 'Related verses unavailable.')); return; }
    var rows = core.relatedVerses(verseKey, state.topics, state.verseIndex, { limit: 8 });
    if (!rows.length) { panel.appendChild(el('p', 'rv-empty', 'No related verses indexed yet.')); return; }
    rows.forEach(function (r) {
      var a = el('a', 'rv-row'); a.href = '#a-' + String(r.key).replace(':', '-'); a.setAttribute('data-verse', r.key);
      a.appendChild(el('span', 'rv-ref', r.ref));
      a.appendChild(el('span', 'rv-chip', r.topic));
      a.appendChild(el('p', 'rv-text', r.translation));
      a.appendChild(el('span', 'rv-attr', r.translator + ' · ' + r.sourceCitation));
      // Cross-surah aware navigation — reuses the same surah-switch + scroll
      // path bookmarks use (src/js/quran-marks.js). The href stays as a
      // graceful fallback for when that global isn't loaded.
      a.addEventListener('click', function (e) {
        if (window.jumpToVerseKey) { e.preventDefault(); window.jumpToVerseKey(r.key); }
      });
      panel.appendChild(a);
    });
  }

  window.toggleRelated = function (id) {
    var panel = document.getElementById(id); if (!panel) return;
    var card = document.getElementById(id.replace(/^rv-/, 'a-'));
    var vk = card && card.dataset.key;
    panel.classList.toggle('show');
    if (!panel.classList.contains('show')) return;
    if (panel.dataset.rendered === vk) return;
    loadIndex().then(function () { render(panel, vk); panel.dataset.rendered = vk; })
      .catch(function () { panel.innerHTML = ''; panel.appendChild(el('p', 'rv-empty', 'Related verses unavailable.')); });
  };
})();
