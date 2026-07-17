/* Related Hadith — browser wrapper. Loads the pre-built static index + reused verse-index,
   renders a per-verse panel with expand. Zero AI, zero backend, one-time JSON load. */
(function () {
  'use strict';
  var core = (window.II && window.II.relatedHadithCore);
  var TOPICS_URL = 'src/data/related-hadith/topics.json';
  var VERSE_INDEX_URL = 'src/data/related-verses/verse-index.json';
  var state = { topics: null, verseIndex: null, loaded: false, loading: null };

  function loadIndex() {
    if (state.loaded) return Promise.resolve();
    if (state.loading) return state.loading;
    var p = Promise.all([
      fetch(TOPICS_URL).then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); }),
      fetch(VERSE_INDEX_URL).then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
    ]).then(function (res) { state.topics = res[0]; state.verseIndex = res[1]; state.loaded = true; });
    state.loading = p;
    p.catch(function () { state.loading = null; }); // retry after a transient failure
    return p;
  }

  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  function gradeClass(g) { return g === 'Sahih' ? 'rh-grade-sahih' : 'rh-grade-hasan'; }

  function render(panel, verseKey) {
    panel.innerHTML = '';
    var rows = core.relatedHadith(verseKey, state.topics, state.verseIndex, { limit: 5 });
    if (!rows.length) { panel.appendChild(el('p', 'rh-empty', 'No reviewed related hadith yet.')); return; }
    rows.forEach(function (h) {
      var row = el('div', 'rh-row');
      var head = el('div', 'rh-head');
      head.appendChild(el('span', 'rh-grade ' + gradeClass(h.grade), h.grade));
      head.appendChild(el('span', 'rh-ref', h.ref));
      head.appendChild(el('span', 'rh-chip', h.topic));
      row.appendChild(head);
      row.appendChild(el('p', 'rh-narrator', 'Narrated ' + h.narrator));
      row.appendChild(el('p', 'rh-text', h.english));

      var full = el('div', 'rh-full'); full.style.display = 'none';
      var ar = el('p', 'rh-arabic', h.arabic); ar.setAttribute('dir', 'rtl'); full.appendChild(ar);
      full.appendChild(el('p', 'rh-isnad', 'Isnad: ' + h.isnadSummary));
      full.appendChild(el('p', 'rh-attr', h.grade + ' · graded by ' + h.gradedBy));
      var link = el('a', 'rh-src', 'Source ↗'); link.href = h.url; link.target = '_blank'; link.rel = 'noopener'; full.appendChild(link);

      var toggle = el('button', 'rh-expand', 'View full ▾');
      toggle.addEventListener('click', function () {
        var open = full.style.display === 'none';
        full.style.display = open ? 'block' : 'none';
        toggle.textContent = open ? 'Hide ▴' : 'View full ▾';
      });
      row.appendChild(toggle); row.appendChild(full);
      panel.appendChild(row);
    });
  }

  window.toggleRelatedHadith = function (panelId) {
    var panel = document.getElementById(panelId);
    if (!panel) return;
    var card = document.getElementById(panelId.replace(/^rh-/, 'a-'));
    var verseKey = card && card.dataset ? card.dataset.key : null;
    var open = panel.classList.toggle('show');
    if (!open) return;
    if (panel.dataset.rendered === verseKey) return;
    loadIndex().then(function () { render(panel, verseKey); panel.dataset.rendered = verseKey; })
      .catch(function () { panel.innerHTML = ''; panel.appendChild(el('p', 'rh-empty', 'Related hadith unavailable.')); });
  };
})();
