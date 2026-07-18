/* Vocabulary — browser wrapper. Loads the glossary index + reused related indexes,
   renders a per-verse "Key Terms" panel. Zero AI, zero backend, one-time JSON load. */
(function () {
  'use strict';
  var core = (window.II && window.II.vocabCore);
  var URLS = {
    terms: 'src/data/vocab/terms.json',
    topicTerms: 'src/data/vocab/topic-terms.json',
    verseIndex: 'src/data/related-verses/verse-index.json',
    rvTopics: 'src/data/related-verses/topics.json',
    rhTopics: 'src/data/related-hadith/topics.json'
  };
  var state = { d: null, loaded: false, loading: null };

  function loadIndex() {
    if (state.loaded) return Promise.resolve();
    if (state.loading) return state.loading;
    var keys = Object.keys(URLS);
    var p = Promise.all(keys.map(function (k) {
      return fetch(URLS[k]).then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); });
    })).then(function (res) {
      var d = {}; keys.forEach(function (k, i) { d[k] = res[i]; }); state.d = d; state.loaded = true;
    });
    state.loading = p;
    p.catch(function () { state.loading = null; });
    return p;
  }

  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }

  function renderTermDetail(box, slug) {
    var d = state.d, t = d.terms[slug];
    box.appendChild(el('p', 'kt-long', t.longDef));
    box.appendChild(el('p', 'kt-source', 'Source: ' + t.source));
    var refs = core.termCrossRefs(slug, d.terms, d.rvTopics, d.rhTopics, { vLimit: 3, hLimit: 2 });
    if (refs.verses.length) {
      box.appendChild(el('p', 'kt-xlabel', 'In the Qur’an'));
      refs.verses.forEach(function (v) { box.appendChild(el('p', 'kt-xref', v.ref + ' — ' + v.translation)); });
    }
    if (refs.hadith.length) {
      box.appendChild(el('p', 'kt-xlabel', 'In hadith'));
      refs.hadith.forEach(function (h) {
        var row = el('p', 'kt-xref');
        var badge = el('span', 'kt-grade ' + (h.grade === 'Sahih' ? 'kt-grade-sahih' : 'kt-grade-hasan'), h.grade);
        row.appendChild(badge);
        row.appendChild(document.createTextNode(' ' + h.ref + ' — ' + h.english));
        box.appendChild(row);
      });
    }
  }

  function render(panel, verseKey) {
    panel.innerHTML = '';
    if (!core) { panel.appendChild(el('p', 'kt-empty', 'Key terms unavailable.')); return; }
    var d = state.d;
    var terms = core.keyTermsForVerse(verseKey, d.topicTerms, d.verseIndex, d.terms);
    if (!terms.length) { panel.appendChild(el('p', 'kt-empty', 'No key terms indexed for this verse yet.')); return; }
    terms.forEach(function (t) {
      var chip = el('div', 'kt-term');
      var head = el('button', 'kt-head');
      var ar = el('span', 'kt-ar', t.arabic); ar.setAttribute('dir', 'rtl');
      head.appendChild(ar);
      head.appendChild(el('span', 'kt-translit', t.translit));
      chip.appendChild(head);
      chip.appendChild(el('p', 'kt-short', t.shortDef));
      var detail = el('div', 'kt-detail'); detail.style.display = 'none';
      var built = false;
      head.addEventListener('click', function () {
        var open = detail.style.display === 'none';
        detail.style.display = open ? 'block' : 'none';
        if (open && !built) { renderTermDetail(detail, t.slug); built = true; }
      });
      chip.appendChild(detail);
      panel.appendChild(chip);
    });
  }

  window.toggleKeyTerms = function (panelId) {
    var panel = document.getElementById(panelId);
    if (!panel) return;
    var card = document.getElementById(panelId.replace(/^kt-/, 'a-'));
    var verseKey = card && card.dataset ? card.dataset.key : null;
    var open = panel.classList.toggle('show');
    if (!open) return;
    if (panel.dataset.rendered === verseKey) return;
    loadIndex().then(function () { render(panel, verseKey); panel.dataset.rendered = verseKey; })
      .catch(function () { panel.innerHTML = ''; panel.appendChild(el('p', 'kt-empty', 'Key terms unavailable.')); });
  };
})();
