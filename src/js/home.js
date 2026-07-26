/* ═══════════════════════════════════════════════════════════════════
   IslamicInfo.org — home.js  (v1.0 · 2026-06)
   API integration for index.html (Home page).

   Requires: api.js loaded first (window.II.api)

   Features wired here:
     1. Verse of the Day  → GET /api/verse
     2. Hadith of the Day → GET /api/hadith

   (Prayer Times moved to src/js/prayer-widget.js — calls free APIs
    directly so it works on static hosting.)

   Fallbacks (per ARCHITECTURE §14.1):
     - Verse  : static Ayat al-Kursi (2:255) seed object
     - Hadith : static Sahih Bukhari 1:1 seed object

   HTML element IDs expected on index.html:
     #verseArabic, #verseTranslation, #verseRef, #verseTranslator
     #hadithText, #hadithGrade, #hadithGradedBy, #hadithRef, #hadithNarrator
   ═══════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  const api = window.II && window.II.api;
  if (!api) { console.error('[home.js] api.js not loaded'); return; }

  /* i18n helper (i18n.js loads first; safe fallback if it didn't) */
  function tr(key, fallback, params) {
    if (window.II && window.II.t) return window.II.t(key, fallback, params);
    let s = fallback !== undefined ? fallback : key;
    if (params) Object.keys(params).forEach(k => { s = s.split('{' + k + '}').join(params[k]); });
    return s;
  }


  /* ─── Fallback seeds ──────────────────────────────────────────── */

  const FALLBACK_VERSE = {
    surahName:   'Al-Baqarah',
    surahNumber: 2,
    ayahNumber:  255,
    arabic:      'ٱللَّهُ لَآ إِلَٰهَ إِلَّا هُوَ ٱلْحَىُّ ٱلْقَيُّومُ',
    translation: 'Allah – there is no deity except Him, the Ever-Living, the Sustainer of existence.',
    translator:  'Saheeh International',
    reference:   'Quran 2:255',
  };

  const FALLBACK_HADITH = {
    collection:  'Sahih al-Bukhari',
    book:        1,
    number:      1,
    narrator:    'Umar ibn al-Khattab (رضي الله عنه)',
    grade:       'Sahih',
    gradedBy:    'Al-Bukhari',
    translation: 'Actions are judged by intentions, and every person will get the reward according to what he has intended.',
    sourceUrl:   'https://sunnah.com/bukhari:1',
  };


  /* ─── 1. Verse of the Day ─────────────────────────────────────── */

  async function loadVerse() {
    const v = await api.fetchVerse() || FALLBACK_VERSE;

    _setText('verseArabic',      v.arabic);
    _setText('verseTranslation', v.translation);
    _setText('verseRef',         v.reference || `Quran ${v.surahNumber}:${v.ayahNumber}`);
    _setText('verseTranslator',  v.translator ? `— ${v.translator}` : '');
  }


  /* ─── 2. Hadith of the Day ───────────────────────────────────── */

  async function loadHadith() {
    const h = await api.fetchHadith() || FALLBACK_HADITH;

    _setText('hadithText',     h.translation);
    _setText('hadithNarrator', h.narrator  ? tr('js.narrated', 'Narrated by: {n}', { n: h.narrator }) : '');
    _setText('hadithGrade',    h.grade     ? tr('js.grade', 'Grade: {g}', { g: h.grade })             : '');
    _setText('hadithGradedBy', h.gradedBy  ? tr('js.gradedBy', 'Graded by: {g}', { g: h.gradedBy })   : '');
    _setText('hadithRef',      `${h.collection}, Book ${h.book}, Hadith ${h.number}`);

    /* Source link */
    const link = document.getElementById('hadithSourceLink');
    if (link && h.sourceUrl) {
      link.href        = h.sourceUrl;
      link.textContent = tr('js.viewSunnah', 'View on Sunnah.com');
    }
  }


  /* ─── Utility ─────────────────────────────────────────────────── */

  function _setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }


  /* ─── Hero search (real slice) ───────────────────────────────── */
  var core = window.II && window.II.homeSearch;

  var HOME_TOPICS = [
    { key: 'prayer', label: 'Prayer' }, { key: 'fast', label: 'Fasting' },
    { key: 'charity', label: 'Charity' }, { key: 'hajj', label: 'Hajj' },
    { key: 'faith', label: 'Faith' }, { key: 'supplication', label: 'Supplication' },
  ];

  function currentMode() {
    var active = document.querySelector('#home-scope-chips .chip.active');
    return (active && active.getAttribute('data-scope')) || 'hadith';
  }

  function showNote(msg) {
    var note = document.getElementById('home-search-note');
    if (!note) return;
    note.textContent = msg || '';
    note.hidden = !msg;
  }

  // quranlyai-widget.js injects window.QuranlyAI ASYNCHRONOUSLY (it appends
  // quranly-ai-core.js to <head> and loads it over the network), so a claim
  // submitted right after page load can race it. Poll briefly (~6s budget)
  // instead of dropping the claim on a one-shot guarded call.
  function askQuranlyAI(query) {
    if (window.QuranlyAI && typeof window.QuranlyAI.ask === 'function') {
      try { window.QuranlyAI.setContext({ type: 'claim', rawText: query, language: (window.II && II.i18n && II.i18n.lang) || 'en' }); } catch (_) {}
      window.QuranlyAI.ask('custom', query);
      return true;
    }
    return false;
  }

  function askQuranlyAIWhenReady(query, attempt) {
    if (askQuranlyAI(query)) return;
    if ((attempt || 0) < 40) { setTimeout(function () { askQuranlyAIWhenReady(query, (attempt || 0) + 1); }, 150); }
    else { showNote('The assistant is still loading — please try again in a moment.'); }
  }

  function submitSearch() {
    if (!core) return;
    var input = document.getElementById('home-search-input');
    var res = core.dispatchTarget(currentMode(), input ? input.value : '');
    if (res.kind === 'navigate') { window.location.assign(res.url); }
    else if (res.kind === 'note') { showNote(res.message); }
    else if (res.kind === 'panel') { askQuranlyAIWhenReady(res.query, 0); }
    else if (input) { input.focus(); }   // noop → focus
  }

  function wireTabs() {
    var chips = document.querySelectorAll('#home-scope-chips .chip');
    var input = document.getElementById('home-search-input');
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chips.forEach(function (c) { c.classList.remove('active'); c.setAttribute('aria-selected', 'false'); });
        chip.classList.add('active'); chip.setAttribute('aria-selected', 'true');
        showNote('');   // clear any coming-soon note on tab change
        if (input && core) input.placeholder = core.placeholderFor(chip.getAttribute('data-scope'));
      });
    });
  }

  function wireForm() {
    var form = document.getElementById('home-search-form');
    if (form) form.addEventListener('submit', function (e) { e.preventDefault(); submitSearch(); });
  }

  function wireMic() {
    var mic = document.getElementById('home-mic-btn'), input = document.getElementById('home-search-input');
    if (!mic) return;
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { mic.addEventListener('click', function () { showNote('Voice search isn’t supported in this browser.'); }); return; }
    mic.addEventListener('click', function () {
      try {
        var rec = new SR(); rec.lang = 'en-US'; rec.interimResults = false; rec.maxAlternatives = 1;
        mic.classList.add('listening');
        rec.onresult = function (ev) { var txt = ev.results[0][0].transcript; if (input) { input.value = txt; submitSearch(); } };
        rec.onerror = function () { showNote('Voice search didn’t catch that.'); };
        rec.onend = function () { mic.classList.remove('listening'); };
        rec.start();
      } catch (_) { mic.classList.remove('listening'); }
    });
  }

  function renderContinue() {
    var el = document.getElementById('home-continue'); if (!el || !core) return;
    var h = null, q = null;
    try { h = JSON.parse(localStorage.getItem('islamicinfo-hadith-last-read') || 'null'); } catch (_) { h = null; }
    var surah = null, qts = null;
    try { surah = localStorage.getItem('ii-quran-last-surah'); qts = localStorage.getItem('ii-quran-last-surah-ts'); } catch (_) {}
    if (surah) q = { surah: parseInt(surah, 10), ts: qts ? parseInt(qts, 10) : -1 };
    var pick = core.pickContinue(h, q);
    if (!pick) { el.hidden = true; return; }
    el.innerHTML = '<a href="' + pick.url + '">Continue where you left off → ' + escapeHTML(pick.label) + '</a>';
    el.hidden = false;
  }

  function renderTopics() {
    var el = document.getElementById('home-topics'); if (!el) return;
    var pills = HOME_TOPICS.map(function (t) {
      return '<a href="/hadith/topics/' + encodeURIComponent(t.key) + '">' + escapeHTML(t.label) + '</a>';
    }).join('');
    el.innerHTML = pills + '<a class="home-topics-all" href="/hadith/topics">View all topics →</a>';
  }

  function escapeHTML(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function initHomeSearch() {
    if (!core) { console.error('[home.js] home-search-core not loaded'); return; }
    var input = document.getElementById('home-search-input');
    if (input) input.placeholder = core.placeholderFor(currentMode());   // Hadith default
    wireTabs(); wireForm(); wireMic(); renderContinue(); renderTopics();
  }


  /* ─── Boot ────────────────────────────────────────────────────── */

  document.addEventListener('DOMContentLoaded', () => {
    loadVerse();
    loadHadith();
    initHomeSearch();
    /* Re-render translated labels when the site language changes */
    document.addEventListener('ii:langchange', () => { loadVerse(); loadHadith(); });
  });

}());
