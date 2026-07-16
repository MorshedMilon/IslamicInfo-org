/* IslamicInfo.org — reflection.js
   "Today's Reflection" / "Daily Trio" (Task 2). Fills any cards carrying
   data-refl-card="verse|hadith|dua" on the current page (works on quran.html AND
   index.html). Verse = live alquran.cloud (daily); Hadith/Dua = curated static JSON.
   Depends on II.reflectionCore. */
(function () {
  'use strict';
  var core = window.II && window.II.reflectionCore;
  if (!core) return;

  var VERSE_API = 'https://api.alquran.cloud/v1/ayah/';
  var HADITH_URL = 'src/data/reflection-hadith.json';
  var DUA_URL = 'src/data/reflection-dua.json';

  function nowMs() { return Date.now(); }

  function cards(type) { return document.querySelectorAll('[data-refl-card="' + type + '"]'); }
  function field(card, name) { return card.querySelector('[data-refl="' + name + '"]'); }
  function setField(card, name, text) { var e = field(card, name); if (e && text != null) e.textContent = text; }
  function setAction(card, href, label) {
    var a = field(card, 'action'); if (!a || !href) return;
    if (a.tagName === 'A') { a.setAttribute('href', href); a.removeAttribute('onclick'); }
    else { a.style.cursor = 'pointer'; a.setAttribute('onclick', ''); a.onclick = function () { window.location.href = href; }; }
    if (label && a.getAttribute('data-refl-keeplabel') == null) { /* keep existing label */ }
  }

  function fetchJson(url) {
    var ctrl = new AbortController(); var t = setTimeout(function () { ctrl.abort(); }, 8000);
    return fetch(url, { signal: ctrl.signal })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .finally(function () { clearTimeout(t); });
  }

  /* ── Verse of the Day (live, daily, 24h cache) ── */
  var VERSE_SEED = {
    arabic: 'ٱللَّهُ لَآ إِلَٰهَ إِلَّا هُوَ ٱلْحَىُّ ٱلْقَيُّومُ',
    english: 'Allah — there is no deity except Him, the Ever-Living, the Sustainer of existence.',
    ref: 'Al-Baqarah 2:255', slug: 'al-baqarah'
  };
  function renderVerse(v) {
    cards('verse').forEach(function (c) {
      setField(c, 'arabic', v.arabic);
      setField(c, 'text', '“' + v.english + '”');
      setField(c, 'ref', v.ref);
      setAction(c, 'quran.html?surah=' + (v.slug || ''));
    });
  }
  function loadVerse() {
    var day = core.dayIndex(nowMs(), 1000000);
    try {
      var cached = JSON.parse(localStorage.getItem('ii-refl-verse'));
      if (cached && cached.day === day && cached.data) { renderVerse(cached.data); return; }
    } catch (e) {}
    var ref = core.verseRefForDay(nowMs());
    fetchJson(VERSE_API + ref + '/editions/quran-uthmani,en.sahih')
      .then(function (j) {
        var v = core.normalizeVerse(j); if (!v) throw new Error('shape');
        try { localStorage.setItem('ii-refl-verse', JSON.stringify({ day: day, data: v })); } catch (e) {}
        renderVerse(v);
      })
      .catch(function () { renderVerse(VERSE_SEED); });
  }

  /* ── Hadith of the Day (curated static, daily) ── */
  function loadHadith() {
    if (!cards('hadith').length) return;
    fetchJson(HADITH_URL).then(function (list) {
      var h = core.pickForDay(list, nowMs()); if (!h) return;
      cards('hadith').forEach(function (c) {
        setField(c, 'arabic', h.arabic);
        setField(c, 'text', '“' + h.english + '”');
        setField(c, 'ref', h.ref);
        setField(c, 'grade', '✓ ' + h.grade);
        setAction(c, 'hadith.html');
      });
    }).catch(function () {});
  }

  /* ── Dua of the Day (curated static, daily) ── */
  function loadDua() {
    if (!cards('dua').length) return;
    fetchJson(DUA_URL).then(function (list) {
      var d = core.pickForDay(list, nowMs()); if (!d) return;
      cards('dua').forEach(function (c) {
        setField(c, 'arabic', d.arabic);
        setField(c, 'text', '“' + d.english + '”');
        setField(c, 'ref', (d.source || d.title || '').replace(/^HR\.\s*/i, ''));
        setAction(c, 'dua.html');
      });
    }).catch(function () {});
  }

  function boot() { loadVerse(); loadHadith(); loadDua(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
