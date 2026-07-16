/* IslamicInfo.org — quran-verses.js
   Study Mode controller (Module 2): window.loadSurah, fetch/paginate/cache/seed,
   batched card render, setActiveVerse, copyVerse.
   Depends on: window.II.versesCore (quran-verses-core.js). */
(function () {
  'use strict';

  var core = window.II && window.II.versesCore;
  var API = 'https://api.quran.com/api/v4/verses/by_chapter/';
  var SEED1 = 'src/data/verses-1.json';
  var BATCH = 20;

  var byKey = {};            // verse_key -> Verse (current surah)
  var ctxSurahId = 1, ctxSurahName = '', ctxSlug = 'al-fatihah', ctxEditionId = 20;
  var pending = null;        // remaining Verse[] to batch-render
  var io = null;             // IntersectionObserver for the sentinel
  var gen = 0;               // request generation — guards against stale renders

  function list() { return document.getElementById('versesCardList'); }
  function edition() {
    var v = 20; try { v = Number(localStorage.getItem('ii-quran-translation')) || 20; } catch (e) {}
    return v;
  }
  function subLabel(metaAyahs, type) {
    var ayahs = (metaAyahs || '').replace('Ayahs', 'ayahs');
    var t = type === 'makki' ? 'Makki' : (type === 'madinah' ? 'Madani' : '');
    return ayahs + (t ? ' · ' + t : '');
  }
  function surahMeta(id) {
    var row = document.querySelector('.surah-row[data-id="' + id + '"]');
    if (row) return { name: row.dataset.name || ('Surah ' + id), slug: row.dataset.slug || String(id),
                      sub: subLabel(row.dataset.meta, row.dataset.type) };
    try {
      var c = JSON.parse(localStorage.getItem('ii-quran-chapters'));
      var ch = c && c.data && c.data.filter(function (x) { return x.id === Number(id); })[0];
      if (ch) return { name: ch.name_simple, slug: ch.slug,
                       sub: subLabel(ch.verses_count + ' Ayahs', ch.revelation_place === 'makkah' ? 'makki' : 'madinah') };
    } catch (e) {}
    return { name: 'Surah ' + id, slug: String(id), sub: '' };
  }
  function sameVerses(a, b) {
    return !!(a && b) && a.length === b.length &&
      (a.length === 0 || (a[0].verse_key === b[0].verse_key && a[a.length - 1].verse_key === b[b.length - 1].verse_key));
  }

  function readCache(key) {
    try {
      var raw = localStorage.getItem(key); if (!raw) return null;
      var o = JSON.parse(raw); return (o && Array.isArray(o.verses)) ? o : null;
    } catch (e) { try { localStorage.removeItem(key); } catch (_) {} return null; }
  }
  function writeCache(key, verses) {
    try { localStorage.setItem(key, JSON.stringify({ fetchedAt: Date.now(), verses: verses })); }
    catch (e) { /* quota — skip */ }
  }

  function fetchPage(id, ed, page) {
    var url = API + id + '?language=en&words=true&word_fields=text_uthmani,translation' +
              '&fields=text_uthmani,text_uthmani_tajweed&translations=' + ed + '&per_page=50&page=' + page;
    var ctrl = new AbortController();
    var t = setTimeout(function () { ctrl.abort(); }, 8000);
    return fetch(url, { signal: ctrl.signal })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .finally(function () { clearTimeout(t); });
  }
  function fetchAllVerses(id, ed) {
    return fetchPage(id, ed, 1).then(function (first) {
      var total = (first.pagination && first.pagination.total_pages) || 1;
      var verses = (first.verses || []).slice();
      if (total <= 1) return verses.map(function (v) { return core.normalizeVerse(v, ed); });
      var rest = [];
      for (var p = 2; p <= total; p++) rest.push(fetchPage(id, ed, p));
      return Promise.all(rest).then(function (pages) {
        pages.forEach(function (pg) { verses = verses.concat(pg.verses || []); });
        return verses.map(function (v) { return core.normalizeVerse(v, ed); });
      });
    });
  }
  function fetchSeed1(ed) {
    return fetch(SEED1).then(function (r) { if (!r.ok) throw new Error('seed HTTP'); return r.json(); })
      .then(function (raw) { return raw.map(function (v) { return core.normalizeVerse(v, ed); }); });
  }

  function clearDynamic() {
    var c = list(); if (!c) return;
    Array.prototype.slice.call(c.querySelectorAll(
      '.ayah-card, .next-surah-btn, .verses-skeleton, .verses-error, .verses-sentinel'))
      .forEach(function (n) { n.parentNode.removeChild(n); });
    if (io) { io.disconnect(); io = null; }
  }
  function banner() { return list() ? list().querySelector('.bismillah-banner') : null; }

  var SVG = {
    play: '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>',
    book: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>',
    copy: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
    share:'<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>',
    note: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
    ai:   '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>',
    taf:  '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/></svg>',
    trace:'<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83"/></svg>'
  };
  function btn(cls, html) {
    var b = document.createElement('button'); b.type = 'button';
    b.className = cls; b.innerHTML = html; return b;
  }
  function el(tag, cls, txt) {
    var e = document.createElement(tag); if (cls) e.className = cls;
    if (txt != null) e.textContent = txt; return e;
  }

  function buildCard(v) {
    var k = v.verse_key.replace(':', '-');
    var card = el('div', 'ayah-card'); card.id = 'a-' + k; card.dataset.key = v.verse_key;
    card.addEventListener('click', function () { window.setActiveVerse(card); });

    var header = el('div', 'ayah-header');
    header.appendChild(el('div', 'ayah-num-badge', String(v.verse_number)));
    var actions = el('div', 'ayah-actions');
    var bPlay = btn('ayah-btn', SVG.play);   bPlay.addEventListener('click', function (e) { e.stopPropagation(); window.toggleAyahPlay(bPlay, e); });
    var bBook = btn('ayah-btn', SVG.book);   bBook.addEventListener('click', function (e) { e.stopPropagation(); window.toggleBookmark(bBook, e); });
    var bCopy = btn('ayah-btn', SVG.copy);   bCopy.addEventListener('click', function (e) { e.stopPropagation(); window.copyVerse(e, v.verse_key); });
    var bShare= btn('ayah-btn', SVG.share);  bShare.addEventListener('click', function (e) { e.stopPropagation(); window.openShareModal(v.text_uthmani, v.translation, ctxSurahName + ' ' + v.verse_key); });
    var bNote = btn('ayah-btn', SVG.note);   bNote.id = 'nbtn-' + k; bNote.addEventListener('click', function (e) { e.stopPropagation(); window.toggleNote('n-' + k); });
    var bAI   = btn('ayah-btn ai-btn', SVG.ai); bAI.addEventListener('click', function (e) { e.stopPropagation(); window.toggleAI('ai-' + k); });
    [bPlay, bBook, bCopy, bShare, bNote, bAI].forEach(function (x) { actions.appendChild(x); });
    header.appendChild(actions);
    card.appendChild(header);

    var arabic = el('div', 'ayah-arabic');
    v.words.forEach(function (w, i) {
      if (i > 0) arabic.appendChild(document.createTextNode(' '));
      var span = document.createElement('span');
      span.className = 'al-word';
      span.setAttribute('data-wi', String(i + 1));
      span.textContent = w.ar;
      arabic.appendChild(span);
    });
    card.appendChild(arabic);

    // Hidden Tajweed layer — shown (and arabic hidden) when Tajweed Mode is on.
    var tj = el('div', 'ayah-tajweed'); tj.setAttribute('dir', 'rtl');
    tj.style.display = 'none';
    tj.innerHTML = (window.II && window.II.tajweed)
      ? window.II.tajweed.colorize(v.text_uthmani_tajweed || '')
      : (v.text_uthmani_tajweed || '');
    card.appendChild(tj);

    var wbw = el('div', 'wbw-row');
    v.words.forEach(function (w, i) {
      var word = el('div', 'wbw-word');
      word.setAttribute('data-wi', String(i + 1));
      word.appendChild(el('div', 'wbw-ar', w.ar));
      word.appendChild(el('div', 'wbw-en', w.en));
      wbw.appendChild(word);
    });
    card.appendChild(wbw);

    card.appendChild(el('div', 'ayah-translation', '"' + v.translation + '"'));
    card.appendChild(el('div', 'ayah-trans-attr', core.editionName(ctxEditionId) + ' · ' + ctxSurahName + ' ' + v.verse_key));

    var cmp = el('div', 'cmp-block'); cmp.id = 'cmp-' + k; card.appendChild(cmp);
    var ai = el('div', 'ai-card'); ai.id = 'ai-' + k; card.appendChild(ai);
    var note = el('div', 'note-editor'); note.id = 'n-' + k; card.appendChild(note);

    var footer = el('div', 'ayah-footer');
    footer.appendChild(el('span', 'ayah-ref', v.verse_key));
    var taf = btn('tafsir-btn', SVG.taf + 'Tafsir'); taf.addEventListener('click', function () { if (window.openTafsir) window.openTafsir(); });
    var tr = btn('trace-btn', SVG.trace + 'Trace View →'); tr.addEventListener('click', function () { if (window.openTrace) window.openTrace(ctxSurahName + ' ' + v.verse_key, v.text_uthmani, v.translation); });
    footer.appendChild(taf); footer.appendChild(tr);
    card.appendChild(footer);
    return card;
  }

  function renderSkeleton() {
    var c = list(); if (!c) return; clearDynamic();
    var b = banner(); if (b) b.style.display = core.showBismillah(ctxSurahId) ? '' : 'none';
    for (var i = 0; i < 3; i++) {
      var s = el('div', 'ayah-card verses-skeleton'); s.setAttribute('aria-hidden', 'true');
      s.style.opacity = '0.5'; s.style.pointerEvents = 'none';
      s.innerHTML = '<div class="ayah-header"><div class="ayah-num-badge"></div></div>' +
        '<div class="ayah-arabic">&nbsp;</div><div class="ayah-translation">&nbsp;</div>';
      c.appendChild(s);
    }
  }
  function renderError(surahId) {
    var c = list(); if (!c) return; clearDynamic();
    var box = el('div', 'verses-error');
    box.style.cssText = 'padding:28px clamp(18px,3vw,32px);color:var(--ink-muted);font-size:14px;';
    box.appendChild(document.createTextNode('Verses temporarily unavailable — please try again. '));
    var retry = btn('', 'Retry');
    retry.style.cssText = 'margin-left:8px;font:inherit;font-size:13px;color:var(--teal-700);background:transparent;border:.5px solid var(--teal-200);border-radius:10px;padding:6px 14px;cursor:pointer;';
    retry.addEventListener('click', function () { window.loadSurah(surahId); });
    box.appendChild(retry); c.appendChild(box);
  }
  function appendBatch() {
    var c = list(); if (!c || !pending) return;
    var frag = document.createDocumentFragment();
    var slice = pending.splice(0, BATCH);
    slice.forEach(function (v) { frag.appendChild(buildCard(v)); });
    var sentinel = c.querySelector('.verses-sentinel');
    if (sentinel) c.insertBefore(frag, sentinel); else c.appendChild(frag);
    if (window.II && window.II.tajweed) window.II.tajweed.reapply();  // color freshly-added cards
    if (pending.length === 0) {
      if (sentinel) sentinel.parentNode.removeChild(sentinel);
      if (io) { io.disconnect(); io = null; }
      appendNextSurahBtn();
    }
  }
  function appendNextSurahBtn() {
    var c = list(); if (!c) return;
    if (ctxSurahId >= 114) return;
    var nid = ctxSurahId + 1;
    var next = surahMeta(nid);
    var b = el('div', 'next-surah-btn');
    var left = el('div');
    left.appendChild(el('div', 'nsb-label', 'Next Surah'));
    left.appendChild(el('div', 'nsb-name', next.name));
    if (next.sub) left.appendChild(el('div', 'nsb-meta', next.sub));
    b.appendChild(left);
    var chev = el('span');
    chev.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--teal-600)" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>';
    b.appendChild(chev.firstChild);
    b.addEventListener('click', function () { window.loadSurah(nid); });
    c.appendChild(b);
  }
  function renderSurah(verses, surahId) {
    var c = list(); if (!c) return;
    ctxSurahId = Number(surahId);
    window.currentSurahId = ctxSurahId;   // consumed by Mushaf Mode to pick the start page
    var meta = surahMeta(ctxSurahId); ctxSurahName = meta.name; ctxSlug = meta.slug;
    byKey = {}; verses.forEach(function (v) { byKey[v.verse_key] = v; });
    clearDynamic();
    var b = banner(); if (b) b.style.display = core.showBismillah(ctxSurahId) ? '' : 'none';
    pending = verses.slice();
    appendBatch();
    if (pending.length > 0) {
      var sentinel = el('div', 'verses-sentinel'); sentinel.setAttribute('aria-hidden', 'true');
      sentinel.style.height = '1px';
      c.appendChild(sentinel);
      if (window.IntersectionObserver) {
        io = new IntersectionObserver(function (entries) {
          if (entries[0].isIntersecting) appendBatch();
        }, { root: null, rootMargin: '400px' });
        io.observe(sentinel);
      } else {
        while (pending.length > 0) appendBatch();
      }
    }
  }

  window.loadSurah = function (surahId) {
    if (!core || !list()) return;
    surahId = Number(surahId) || 1;
    var myGen = ++gen;                                  // supersedes any in-flight load
    ctxSurahId = surahId; ctxEditionId = edition();
    var key = core.versesCacheKey(surahId, ctxEditionId);
    var cached = readCache(key);
    if (cached && core.isFresh(cached.fetchedAt, Date.now())) {
      renderSurah(cached.verses, surahId);
      fetchAllVerses(surahId, ctxEditionId)
        .then(function (v) {
          if (myGen !== gen) return;                   // a newer load won — drop
          writeCache(key, v);
          if (!sameVerses(v, cached.verses)) renderSurah(v, surahId); // don't wipe live state if unchanged
        })
        .catch(function () { /* keep cached */ });
      return;
    }
    renderSkeleton();
    fetchAllVerses(surahId, ctxEditionId)
      .then(function (v) { if (myGen !== gen) return; writeCache(key, v); renderSurah(v, surahId); })
      .catch(function (e) {
        if (myGen !== gen) return;
        console.warn('[quran] verses API failed for surah ' + surahId + ':', e && e.message);
        if (surahId === 1) {
          return fetchSeed1(20).then(function (v) { if (myGen !== gen) return; ctxEditionId = 20; renderSurah(v, 1); });
        }
        renderError(surahId);
      })
      .catch(function (e) { if (myGen !== gen) return; console.warn('[quran] seed failed:', e && e.message); renderError(surahId); });
  };

  window.setActiveVerse = function (card) {
    Array.prototype.forEach.call(document.querySelectorAll('.ayah-card.active-verse'),
      function (c) { c.classList.remove('active-verse'); });
    if (card) card.classList.add('active-verse');
  };

  window.copyVerse = function (evt, verseKey) {
    if (evt && evt.stopPropagation) evt.stopPropagation();
    var v = byKey[verseKey]; if (!v) return;
    var url = window.location.origin + window.location.pathname + '?surah=' + ctxSlug;
    var payload = core.attributionText(
      { verseKey: v.verse_key, arabic: v.text_uthmani, translation: v.translation },
      ctxSurahName, core.editionName(ctxEditionId), url);
    var done = function () { if (window.showToast) window.showToast('Copied with attribution'); };
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(payload).then(done, done);
      } else {
        var ta = document.createElement('textarea'); ta.value = payload;
        document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); } catch (e) {}
        document.body.removeChild(ta); done();
      }
    } catch (e) { done(); }
  };

  window.II = window.II || {};
  window.II.quranVerses = { loadSurah: window.loadSurah, _byKey: function () { return byKey; },
    renderAll: function () { while (pending && pending.length) appendBatch(); } };
})();
