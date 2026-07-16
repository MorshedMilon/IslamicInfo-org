/* IslamicInfo.org — quran-tafsir.js
   Tafsir panel controller (Task 1): loads per-ayah tafsir for the selected source
   into #tafsirBody. spa5k CDN primary → quran.com fallback. Depends on II.tafsirCore. */
(function () {
  'use strict';
  var core = window.II && window.II.tafsirCore;
  if (!core) { return; }

  var state = { verseKey: null, surahName: '', sourceKey: 'ik', gen: 0 };
  var TTL = 30 * 24 * 60 * 60 * 1000; // tafsir is static → 30d cache

  function body() { return document.getElementById('tafsirBody'); }
  function cacheKey(vk, sk) { return 'ii-tafsir-' + vk + '-' + sk; }

  function readCache(vk, sk) {
    try {
      var o = JSON.parse(localStorage.getItem(cacheKey(vk, sk)));
      if (o && Array.isArray(o.paras) && (Date.now() - o.ts) < TTL) return o.paras;
    } catch (e) {}
    return null;
  }
  function writeCache(vk, sk, paras) {
    try { localStorage.setItem(cacheKey(vk, sk), JSON.stringify({ paras: paras, ts: Date.now() })); } catch (e) {}
  }

  function fetchJson(url) {
    var ctrl = new AbortController();
    var t = setTimeout(function () { ctrl.abort(); }, 8000);
    return fetch(url, { signal: ctrl.signal })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .finally(function () { clearTimeout(t); });
  }

  // Returns Promise<string[]> paragraphs. spa5k plain-text primary, quran.com HTML fallback.
  function fetchTafsir(src, surah, ayah) {
    return fetchJson(core.spa5kUrl(src, surah, ayah))
      .then(function (j) {
        var txt = j && j.text;
        if (!txt) throw new Error('empty');
        return core.formatTafsir(txt, false);
      })
      .catch(function () {
        var qurl = core.quranUrl(src, surah, ayah);
        if (!qurl) throw new Error('unavailable');
        return fetchJson(qurl).then(function (j) {
          var txt = j && j.tafsir && j.tafsir.text;
          if (!txt) throw new Error('empty');
          return core.formatTafsir(txt, true);
        });
      });
  }

  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }

  function renderMessage(msg) {
    var b = body(); if (!b) return;
    b.innerHTML = '';
    var m = el('div', 'tp-text', msg); m.style.color = 'var(--ink-subtle)'; m.style.fontStyle = 'italic';
    b.appendChild(m);
  }

  function renderTafsir(src, paras) {
    var b = body(); if (!b) return;
    b.innerHTML = '';
    b.appendChild(el('div', 'tp-ref', state.surahName + ' · ' + state.verseKey + ' · ' + src.label));
    if (!paras.length) { b.appendChild(el('p', 'tp-text', 'No tafsir text for this ayah.')); }
    paras.forEach(function (p) {
      var node = el('p', 'tp-text', p);
      if (src.lang === 'ar') { node.setAttribute('dir', 'rtl'); node.style.fontFamily = 'var(--font-arabic)'; }
      b.appendChild(node);
    });
    b.appendChild(el('div', 'tp-attr', 'Tafsir ' + src.label + ' · sourced'));
    b.scrollTop = 0;
  }

  function load() {
    if (!state.verseKey) { renderMessage('Select an ayah to read its tafsir.'); return; }
    var src = core.sourceByKey(state.sourceKey);
    var parts = String(state.verseKey).split(':');
    var surah = parts[0], ayah = parts[1];
    var myGen = ++state.gen;

    var cached = readCache(state.verseKey, state.sourceKey);
    if (cached) { renderTafsir(src, cached); return; }

    renderMessage('Loading ' + src.label + '…');
    fetchTafsir(src, surah, ayah)
      .then(function (paras) {
        if (myGen !== state.gen) return;                    // superseded
        writeCache(state.verseKey, state.sourceKey, paras);
        renderTafsir(src, paras);
      })
      .catch(function (e) {
        if (myGen !== state.gen) return;
        console.warn('[tafsir] ' + state.verseKey + '/' + state.sourceKey + ' failed:', e && e.message);
        renderMessage('Tafsir temporarily unavailable for this ayah — please try again.');
      });
  }

  window.II.tafsir = {
    setVerse: function (verseKey, surahName) {
      if (!verseKey) return;
      state.verseKey = verseKey;
      if (surahName != null) state.surahName = surahName;
      load();
    },
    setSource: function (key) {
      state.sourceKey = core.sourceByKey(key).key;
      syncTabs();
      load();
    },
    current: function () { return { verseKey: state.verseKey, source: state.sourceKey }; }
  };

  function syncTabs() {
    document.querySelectorAll('.tp-src').forEach(function (b) {
      b.classList.toggle('on', b.getAttribute('data-src') === state.sourceKey);
    });
  }

  // Rewire the panel's source tabs (replaces the inline hardcoded switchTafsir).
  window.switchTafsir = function (btn, key) { window.II.tafsir.setSource(key); };

  document.addEventListener('DOMContentLoaded', function () {
    // Tag tabs with data-src for active-state sync, then show the initial prompt.
    var tabs = document.querySelectorAll('.tp-src');
    var keys = core.sources().map(function (s) { return s.key; });
    tabs.forEach(function (b, i) { if (keys[i]) b.setAttribute('data-src', keys[i]); });
    syncTabs();
    if (!state.verseKey) renderMessage('Select an ayah to read its tafsir.');
  });
})();
