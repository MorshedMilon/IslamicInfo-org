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
    _setText('hadithNarrator', h.narrator  ? `Narrated by: ${h.narrator}` : '');
    _setText('hadithGrade',    h.grade     ? `Grade: ${h.grade}`           : '');
    _setText('hadithGradedBy', h.gradedBy  ? `Graded by: ${h.gradedBy}`   : '');
    _setText('hadithRef',      `${h.collection}, Book ${h.book}, Hadith ${h.number}`);

    /* Source link */
    const link = document.getElementById('hadithSourceLink');
    if (link && h.sourceUrl) {
      link.href        = h.sourceUrl;
      link.textContent = 'View on Sunnah.com';
    }
  }


  /* ─── Utility ─────────────────────────────────────────────────── */

  function _setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }


  /* ─── Boot ────────────────────────────────────────────────────── */

  document.addEventListener('DOMContentLoaded', () => {
    loadVerse();
    loadHadith();
  });

}());
