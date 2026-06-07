/* ═══════════════════════════════════════════════════════════════════
   IslamicInfo.org — api.js  (v1.0 · 2026-06)
   Shared API client.  Loaded by every page that talks to /api/.

   Usage:
     import { fetchPrayer, fetchVerse, fetchHadith, fetchNisab,
              fetchGeocode, fetchQuranSurah,
              postVerify, postAskClaude, postSubscribe } from './api.js';

   Or load as a classic script (no module bundler):
     <script src="../js/api.js"></script>
     // then use window.II.api.*

   All functions:
     - Are async and always resolve (never throw to callers)
     - Check localStorage first (cache-first pattern per ARCHITECTURE §14.1)
     - Persist fresh responses to localStorage with a timestamp
     - Return null on total failure (caller shows fallback UI)

   localStorage keys used by this module:
     ii-cache-verse        (daily, busts at UTC midnight)
     ii-cache-hadith       (24 h per collection+book)
     ii-cache-prayer       (24 h per city+date)
     ii-cache-nisab        (24 h per currency)
     ii-cache-geocode      (session — never expires once set)
     ii-cache-quran-{n}    (7 days per surah number)

   POST endpoints are never cached (verify, ask-claude, subscribe).
   ═══════════════════════════════════════════════════════════════════ */

(function (root) {
  'use strict';

  /* ─── TTL constants (ms) ──────────────────────────────────────── */
  const TTL_24H    = 24 * 60 * 60 * 1000;
  const TTL_7D     = 7  * 24 * 60 * 60 * 1000;
  const TTL_SESSION = Infinity;   // geocode: keep until tab closes → we store it

  /* ─── Internal: midnight-UTC bust for Verse of the Day ───────── */
  function _todayUTC() {
    const d = new Date();
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}-${String(d.getUTCDate()).padStart(2,'0')}`;
  }

  /* ─── Internal: read + validate cache entry ──────────────────── */
  function _readCache(key, ttlMs) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const { data, ts, date } = JSON.parse(raw);
      if (ttlMs === TTL_SESSION)   return data;           // geocode: never expire
      if (date && date !== _todayUTC()) return null;       // daily verse bust
      if (Date.now() - ts < ttlMs) return data;
    } catch (_) { /* corrupt entry — ignore */ }
    return null;
  }

  /* ─── Internal: write cache entry ────────────────────────────── */
  function _writeCache(key, data, isDailyBust) {
    try {
      const entry = { data, ts: Date.now() };
      if (isDailyBust) entry.date = _todayUTC();
      localStorage.setItem(key, JSON.stringify(entry));
    } catch (_) { /* localStorage full — skip silently */ }
  }

  /* ─── Internal: GET helper (cache-first) ─────────────────────── */
  async function _get(cacheKey, url, ttlMs, isDailyBust) {
    const cached = _readCache(cacheKey, ttlMs);
    if (cached) return cached;

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      _writeCache(cacheKey, data, isDailyBust);
      return data;
    } catch (err) {
      console.warn(`[II/api] GET ${url} failed:`, err.message);
      // Return stale cache if available rather than null
      try {
        const raw = localStorage.getItem(cacheKey);
        if (raw) return JSON.parse(raw).data;
      } catch (_) {}
      return null;
    }
  }

  /* ─── Internal: POST helper (never cached) ───────────────────── */
  async function _post(url, body) {
    try {
      const res = await fetch(url, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn(`[II/api] POST ${url} failed:`, err.message);
      return null;
    }
  }


  /* ═══════════════════════════════════════════════════════════════
     PUBLIC API
     ═══════════════════════════════════════════════════════════════ */

  /**
   * GET /api/verse
   * Returns the Verse of the Day. Cache busts daily at UTC midnight.
   *
   * @returns {Promise<{surahName,surahNumber,ayahNumber,arabic,translation,translator,reference}|null>}
   */
  async function fetchVerse() {
    return _get('ii-cache-verse', '/api/verse', TTL_24H, true);
  }

  /**
   * GET /api/hadith?collection=&book=
   * No params → daily hadith feed. Grading fields always present.
   *
   * @param {string} [collection=''] - e.g. 'bukhari'
   * @param {string|number} [book=''] - e.g. 1
   * @returns {Promise<{collection,book,number,narrator,grade,gradedBy,arabic,translation,translator,sourceUrl}|null>}
   */
  async function fetchHadith(collection, book) {
    const qs = [];
    if (collection) qs.push(`collection=${encodeURIComponent(collection)}`);
    if (book !== undefined && book !== '') qs.push(`book=${encodeURIComponent(book)}`);
    const query    = qs.length ? `?${qs.join('&')}` : '';
    const cacheKey = `ii-cache-hadith-${collection||'daily'}-${book||'0'}`;
    return _get(cacheKey, `/api/hadith${query}`, TTL_24H, false);
  }

  /**
   * GET /api/prayer?city=&date=&method=
   * Returns today's prayer times for a city.
   * Fallback value on null: hardcoded London MWL times (caller's responsibility).
   *
   * @param {string} city   - e.g. 'London'
   * @param {string} [date] - YYYY-MM-DD; defaults to today
   * @param {string|number} [method=3] - AlAdhan calc method
   * @returns {Promise<{city,date,method,timings:{Fajr,Dhuhr,Asr,Maghrib,Isha,Sunrise},source}|null>}
   */
  async function fetchPrayer(city, date, method) {
    const d   = date || _todayUTC();
    const m   = method || 3;
    const key = `ii-cache-prayer-${city.toLowerCase()}-${d}`;
    const url = `/api/prayer?city=${encodeURIComponent(city)}&date=${d}&method=${m}`;
    return _get(key, url, TTL_24H, false);
  }

  /**
   * GET /api/nisab?currency=
   * Returns live nisab threshold for Zakat calculations.
   * Fallback on null: $6,180 (caller's responsibility).
   *
   * @param {string} [currency='USD']
   * @returns {Promise<{currency,goldPricePerGram,nisabValue,asOf,source}|null>}
   */
  async function fetchNisab(currency) {
    const c   = (currency || 'USD').toUpperCase();
    const key = `ii-cache-nisab-${c}`;
    return _get(key, `/api/nisab?currency=${c}`, TTL_24H, false);
  }

  /**
   * GET /api/geocode?lat=&lon=
   * Reverse-geocodes lat/lon to a city label.
   * Cached for the session; returns stale on network failure.
   *
   * @param {number} lat
   * @param {number} lon
   * @returns {Promise<{city,region,country}|null>}
   */
  async function fetchGeocode(lat, lon) {
    const key = `ii-cache-geocode-${lat.toFixed(3)}-${lon.toFixed(3)}`;
    return _get(key, `/api/geocode?lat=${lat}&lon=${lon}`, TTL_SESSION, false);
  }

  /**
   * GET /api/quran/[surah]?translations=
   * Returns all verses for a surah. 7-day server cache.
   *
   * @param {number} surah - 1–114
   * @param {string} [translations='131,85,95'] - comma-separated edition IDs
   * @returns {Promise<{surahNumber,verses:[{ayah,arabic,translations,audioUrl?}]}|null>}
   */
  async function fetchQuranSurah(surah, translations) {
    const t   = translations || '131,85,95';
    const key = `ii-cache-quran-${surah}`;
    return _get(key, `/api/quran/${surah}?translations=${t}`, TTL_7D, false);
  }

  /**
   * POST /api/verify
   * Verifies an Islamic claim. v1 = 2200 ms simulation.
   * Never cached.
   *
   * @param {string} query - the claim text
   * @param {string} [mode]
   * @returns {Promise<{query,results:[],disclaimer}|null>}
   */
  async function postVerify(query, mode) {
    const body = { query };
    if (mode) body.mode = mode;
    return _post('/api/verify', body);
  }

  /**
   * POST /api/ask-claude  (Stage 3 only)
   * AI explanation with source citation.
   * Never cached by this module; callers may cache per content ID.
   *
   * @param {string} context   - Arabic text + transliteration
   * @param {string} question  - user question or "Explain this"
   * @param {string} [sourceRef] - e.g. "Quran 2:255"
   * @returns {Promise<{answer,attribution,sourcesCited}|null>}
   */
  async function postAskClaude(context, question, sourceRef) {
    const body = { context, question };
    if (sourceRef) body.sourceRef = sourceRef;
    return _post('/api/ask-claude', body);
  }

  /**
   * POST /api/subscribe
   * Email capture (Knowledge Hub).
   *
   * @param {string} email
   * @param {string} [source='website']
   * @returns {Promise<{ok:boolean}|null>}
   */
  async function postSubscribe(email, source) {
    return _post('/api/subscribe', { email, source: source || 'website' });
  }


  /* ─── Expose ─────────────────────────────────────────────────── */
  const api = {
    fetchVerse,
    fetchHadith,
    fetchPrayer,
    fetchNisab,
    fetchGeocode,
    fetchQuranSurah,
    postVerify,
    postAskClaude,
    postSubscribe,
  };

  /* Support both ES module (if bundled later) and plain <script> */
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    root.II = root.II || {};
    root.II.api = api;
  }

}(typeof globalThis !== 'undefined' ? globalThis : window));
