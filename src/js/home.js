/* ═══════════════════════════════════════════════════════════════════
   IslamicInfo.org — home.js  (v1.0 · 2026-06)
   API integration for index.html (Home page).

   Requires: api.js loaded first (window.II.api)

   Features wired here:
     1. Verse of the Day  → GET /api/verse
     2. Hadith of the Day → GET /api/hadith
     3. Prayer Times      → GET /api/prayer  (auto-detect or manual city)
     4. Geolocation → geocode → prayer chain

   Fallbacks (per ARCHITECTURE §14.1):
     - Verse  : static Ayat al-Kursi (2:255) seed object
     - Hadith : static Sahih Bukhari 1:1 seed object
     - Prayer : hardcoded London MWL times

   HTML element IDs expected on index.html:
     #verseArabic, #verseTranslation, #verseRef, #verseTranslator
     #hadithText, #hadithGrade, #hadithGradedBy, #hadithRef, #hadithNarrator
     #prayerCity, #prayerFajr, #prayerDhuhr, #prayerAsr,
     #prayerMaghrib, #prayerIsha, #prayerSunrise,
     #prayerLocationLabel, #prayerDetectBtn
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

  const FALLBACK_PRAYER = {
    city:    'London',
    timings: { Fajr: '04:02', Sunrise: '05:43', Dhuhr: '13:02', Asr: '17:00', Maghrib: '20:21', Isha: '21:55' },
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


  /* ─── 3. Prayer Times ─────────────────────────────────────────── */

  function _renderPrayer(data) {
    const t = data.timings;
    _setText('prayerFajr',    t.Fajr    || '—');
    _setText('prayerSunrise', t.Sunrise || '—');
    _setText('prayerDhuhr',   t.Dhuhr   || '—');
    _setText('prayerAsr',     t.Asr     || '—');
    _setText('prayerMaghrib', t.Maghrib || '—');
    _setText('prayerIsha',    t.Isha    || '—');
    _setText('prayerLocationLabel', data.city || '');

    /* Highlight next prayer */
    _highlightNextPrayer(t);
  }

  function _highlightNextPrayer(timings) {
    const order    = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    const now      = new Date();
    const nowMins  = now.getHours() * 60 + now.getMinutes();

    let nextName = null;
    for (const name of order) {
      const raw  = timings[name];
      if (!raw) continue;
      const [h, m] = raw.split(':').map(Number);
      if ((h * 60 + m) > nowMins) { nextName = name; break; }
    }
    if (!nextName) nextName = 'Fajr'; // past Isha → next is Fajr

    order.forEach(name => {
      const el = document.getElementById(`prayer${name}`);
      if (!el) return;
      const card = el.closest('[data-prayer]') || el.parentElement;
      if (card) card.classList.toggle('next-prayer', name === nextName);
    });
  }

  async function loadPrayer(city) {
    const data = await api.fetchPrayer(city) || { ...FALLBACK_PRAYER, city };
    _renderPrayer(data);
  }

  async function detectAndLoadPrayer() {
    if (!navigator.geolocation) { return loadPrayer('London'); }

    const btn = document.getElementById('prayerDetectBtn');
    if (btn) btn.textContent = 'Detecting…';

    navigator.geolocation.getCurrentPosition(
      async pos => {
        const { latitude: lat, longitude: lon } = pos.coords;
        const geo  = await api.fetchGeocode(lat, lon);
        const city = geo ? geo.city : 'London';
        await loadPrayer(city);
        if (btn) btn.textContent = '📍 My Location';
      },
      async () => {
        await loadPrayer('London');
        if (btn) btn.textContent = '📍 My Location';
      }
    );
  }


  /* ─── Utility ─────────────────────────────────────────────────── */

  function _setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }


  /* ─── Wire prayer city input & detect button ──────────────────── */

  function initPrayerControls() {
    /* Manual city input */
    const cityInput = document.getElementById('prayerCityInput');
    if (cityInput) {
      cityInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
          const city = cityInput.value.trim();
          if (city) loadPrayer(city);
        }
      });
    }

    /* Auto-detect button */
    const detectBtn = document.getElementById('prayerDetectBtn');
    if (detectBtn) {
      detectBtn.addEventListener('click', detectAndLoadPrayer);
    }

    /* Restore last-used city from localStorage */
    const lastCity = localStorage.getItem('ii-prayer-city');
    if (lastCity) {
      loadPrayer(lastCity);
    } else {
      detectAndLoadPrayer();
    }
  }


  /* ─── Boot ────────────────────────────────────────────────────── */

  document.addEventListener('DOMContentLoaded', () => {
    loadVerse();
    loadHadith();
    initPrayerControls();
  });

}());
