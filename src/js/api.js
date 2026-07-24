/* ═══════════════════════════════════════════════════════════════════
   IslamicInfo.org — api.js  (v1.0 · 2026-06)
   Shared API client.  Loaded by every page that talks to /api/.

   Usage:
     import { fetchPrayer, fetchVerse, fetchHadith, fetchNisab,
              fetchGeocode, fetchQuranSurah,
              postVerify, postAskClaude, postExplain, postSubscribe } from './api.js';

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

  /* ─── API origin for same-origin /api/* calls (ADR-028) ───────────
     Empty '' = same-origin (DEFAULT, INERT — identical to legacy behavior;
     nothing changes for any endpoint). GitHub Pages serves no /api, so in
     production the whole /api layer is 404 until this is pointed at the Worker.
     To route /api/* at the Worker cross-origin, set API_BASE to its origin:
       interim: 'https://islamicinfo-api.islamicinfo.workers.dev'  (live now)
       later:   'https://api.islamicinfo.org'                      (once DNS lands)
     CORS is already handled + the Pages origins are allow-listed
     (worker/src/lib/cors.js ALLOWED_ORIGINS). ⚠ Flipping this activates
     cross-origin for EVERY /api/* endpoint at once (verse, quran, prayer,
     verify, subscribe, ask-claude, hadith) — and only makes hadith work AFTER
     the Worker is redeployed with the hadith routes. See DECISIONS.md ADR-028
     + TASKS.md (verify each call site still degrades gracefully before flipping). */
  const API_BASE = 'https://islamicinfo-api.islamicinfo.workers.dev';  // ACTIVE (interim workers.dev): routes all /api/* to the Worker (ADR-028). Swap to https://api.islamicinfo.org once DNS lands.

  /* Prefix a same-origin `/api/...` path with API_BASE. Leaves absolute URLs
     (CDN direct sources) and non-/api asset paths (src/data/...) untouched, so a
     single knob rebases every /api call site without corrupting other fetches. */
  function _apiUrl(u) {
    return (typeof u === 'string' && u.indexOf('/api/') === 0) ? API_BASE + u : u;
  }

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
      const res = await fetch(_apiUrl(url));
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
      const res = await fetch(_apiUrl(url), {
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
   * POST /api/explain  (Module 13)
   * AI plain-language explanation of a hadith/verse passage, with a 10s
   * client-side AbortController timeout. Never cached; never throws.
   *
   * @param {{type?:string, ref?:string, arabic?:string, translation?:string, language?:string}} payload
   * @param {{timeoutMs?:number}} [opts]
   * @returns {Promise<object>} parsed JSON on success; { _status:429 } on rate-limit;
   *   { _error:'timeout'|'network' } on failure. Never throws.
   */
  async function postExplain(payload, opts) {
    const ms = (opts && opts.timeoutMs) || 10000;
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), ms);
    try {
      const res = await fetch(_apiUrl('/api/explain'), {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
        signal:  ctrl.signal,
      });
      if (res.status === 429) return { _status: 429 };
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      return { _error: err && err.name === 'AbortError' ? 'timeout' : 'network' };
    } finally {
      clearTimeout(t);
    }
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


  /* ─── Hadith Library REST endpoints (Module 0 · ADR-021) ─────────
     Relative /api/ URLs like every other method; the Worker's KV is the
     cache, so these do a plain fetch and return the uniform envelope
     { ok, data?, error?, source }. No new localStorage keys. */
  async function _getHadith(path) {
    try {
      const res = await fetch(_apiUrl(path), { headers: { Accept: 'application/json' } });
      return await res.json();
    } catch (err) {
      console.warn(`[II/api] GET ${path} failed:`, err.message);
      return { ok: false, error: { code: 'network', message: 'Network error', retryable: true }, source: 'fallback' };
    }
  }
  /* Merged 18-collection index (ADR-024): live hadithapi counts (Worker) layered over
     the static 18-collection seed, seed as offline fallback (TechSpec §8 — no user error).
     Same { ok, data:[...], source } envelope as the Worker, so existing callers
     (hadith.js) render unchanged — now data-driven on all 18. Helpers (_hadithSeed,
     _seedToCollection) are declared below and hoisted. */
  async function fetchHadithCollections() {
    const seedList = (await _hadithSeed()).map(_seedToCollection);
    let live = null;
    try { live = await _getHadith('/api/hadith/collections'); } catch (_) { live = null; }

    if (live && live.ok && Array.isArray(live.data) && live.data.length) {
      const bySlug = {};
      live.data.forEach(function (d) { if (d && d.collectionSlug) bySlug[d.collectionSlug] = d; });
      const merged = seedList.map(function (c) {
        const d = bySlug[c.collectionSlug];
        if (!d) return c;                                    // fawazahmed0/AhmedBaset → keep seed
        // For collections we serve from a DIRECT source (in HADITH_ROUTES — e.g. Musnad Ahmad,
        // which hadithapi returns 0 for), the seed count is authoritative; don't let the live
        // hadithapi 0 override it. Only true hadithapi-provider collections take the live count.
        var live = hadithProviderOf(c.collectionSlug) === 'hadithapi';
        return Object.assign({}, c, {                        // hadithapi → live count/name authoritative
          collectionName: d.collectionName || c.collectionName,
          collectionArabicName: d.collectionArabicName || c.collectionArabicName || null,
          hadithCount: (live && typeof d.hadithCount === 'number') ? d.hadithCount : c.hadithCount,
          chaptersCount: (live && typeof d.chaptersCount === 'number') ? d.chaptersCount : c.chaptersCount,
        });
      });
      live.data.forEach(function (d) {                       // defensive: live collection not in seed
        if (d && d.collectionSlug && !seedList.some(function (c) { return c.collectionSlug === d.collectionSlug; })) merged.push(d);
      });
      return { ok: true, data: merged, source: live.source || 'live' };
    }
    if (seedList.length) return { ok: true, data: seedList, source: 'fallback' };
    return live || { ok: false, error: { code: 'unavailable', message: 'Collections unavailable', retryable: true }, source: 'fallback' };
  }
  function fetchHadithBooks(slug) { return _getHadith(`/api/hadith/collections/${encodeURIComponent(slug)}/books`); }
  function fetchHadithList(slug, book, page, limit) {
    return _getHadith(`/api/hadith/collections/${encodeURIComponent(slug)}/books/${book}/hadiths?page=${page || 1}&limit=${limit || 25}`);
  }
  function fetchHadithOne(slug, book, num) {
    return _getHadith(`/api/hadith/${encodeURIComponent(slug)}/${book}/${num}`);
  }
  // Resolve a typed hadith number → its record (with real bookNumber) for hadithapi
  // collections, so a number search can route into the deep view.
  function fetchHadithByNumber(slug, num) {
    return _getHadith(`/api/hadith/collections/${encodeURIComponent(slug)}/hadiths?hadithNumber=${encodeURIComponent(num)}`);
  }
  function fetchHadithSearch(q, lang, page, collection) {
    var scope = collection ? ('&collection=' + encodeURIComponent(collection)) : '';
    return _getHadith(`/api/hadith/search?q=${encodeURIComponent(q)}&lang=${lang || 'en'}&page=${page || 1}${scope}`);
  }
  function fetchHadithDaily() { return _getHadith('/api/hadith/daily'); }

  /* fetchDorarSilsila — Dorar.net (Silsila as-Sahihah/Da'ifah) keyword search,
     proxied via the Worker (/api/hadith/dorar/search). _dorarUrl is exposed
     separately so callers/tests can inspect the built URL without firing a request. */
  function _dorarUrl(q, page) {
    return _apiUrl(`/api/hadith/dorar/search?q=${encodeURIComponent(q || '')}&page=${parseInt(page, 10) || 1}`);
  }
  function fetchDorarSilsila(q, page) {
    return _getHadith(`/api/hadith/dorar/search?q=${encodeURIComponent(q || '')}&page=${parseInt(page, 10) || 1}`);
  }

  /* Narrator reliability data (Module 8, TechSpec §4.3) — self-hosted static
     JSON, cache-first 7d, lazy on panel open. Returns the narrator object or
     null (honest "unavailable"). NOT an /api route → API_BASE-exempt. */
  function fetchNarrator(id) {
    var safe = String(id == null ? '' : id).replace(/[^a-z0-9_-]/gi, '');
    if (!safe) return Promise.resolve(null);
    return _get('ii-cache-narrator-' + safe, '/data/narrator/' + safe + '.json', TTL_7D, false);
  }

  /* fetchNarratorById — Itqan reliability profile by NUMERIC id (ADR-046/047).
     Client resolves an English narrator name → Itqan id (narrator-match-core), then
     calls this. /api route (API_BASE-rebased). Returns { ok, matched, narrator } or,
     when D1 isn't provisioned / no match, { ok:true, matched:false }. Never null-fabricates. */
  function fetchNarratorById(id) {
    var n = parseInt(id, 10);
    if (!(n > 0)) return Promise.resolve({ ok: true, matched: false });
    return _get('ii-cache-rijal-' + n, '/api/narrator/' + n, TTL_7D, false)
      .then(function (r) { return r || { ok: true, matched: false }; })
      .catch(function () { return { ok: true, matched: false }; });
  }

  /* ═══════════════════════════════════════════════════════════════
     Hadith 3-provider routing (ADR-024) — 18 collections.
       · hadithapi (9): proxied via the Worker (/api/hadith/*) — key stays server-side.
       · fawazahmed0 (1) + AhmedBaset (8): keyless, permissively-licensed static JSON
         fetched DIRECT from CDN — no /api/ proxy, NO apiKey (none exists for these).
         AhmedBaset is pinned to release tag v1.2.0 (never `main`) per ADR-024.
     Cache-first via _get() → localStorage `islamicinfo-hadith-*` (JSON.parse/setItem
     already wrapped in try/catch inside _get, per TechSpec §7.4).
     ═══════════════════════════════════════════════════════════════ */

  const HADITH_SEED_URL = 'src/data/hadith/collections.json';
  const HADITH_DIRECT_BASE = {
    fawazahmed0: 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/',
    ahmedbaset:  'https://raw.githubusercontent.com/AhmedBaset/hadith-json/v1.2.0/db/by_book/',
  };
  // slug → direct-source route for the 9 non-hadithapi collections. Endpoints verified 2026-07-20.
  const HADITH_ROUTES = {
    'nawawi40':             { provider: 'fawazahmed0', eng: 'eng-nawawi', ara: 'ara-nawawi', characterization: "Sahih / Hasan — an-Nawawi's selection" },
    'riyad-assalihin':      { provider: 'ahmedbaset', path: 'other_books/riyad_assalihin.json',      characterization: "Sahih / Hasan — compiler's selection" },
    'bulugh-almaram':       { provider: 'ahmedbaset', path: 'other_books/bulugh_almaram.json',       characterization: 'Mixed Grades (ahkam / legal hadith)' },
    'aladab-almufrad':      { provider: 'ahmedbaset', path: 'other_books/aladab_almufrad.json',      characterization: 'Mixed Grades' },
    'shamail-muhammadiyah': { provider: 'ahmedbaset', path: 'other_books/shamail_muhammadiyah.json', characterization: 'Mixed Grades' },
    'muwatta-malik':        { provider: 'ahmedbaset', path: 'the_9_books/malik.json',                characterization: 'Sahih / Hasan' },
    'sunan-darimi':         { provider: 'ahmedbaset', path: 'the_9_books/darimi.json',               characterization: 'Mixed Grades' },
    'musnad-ahmad':         { provider: 'ahmedbaset', path: 'the_9_books/ahmed.json',                characterization: 'Mixed Grades' },   // hadithapi returns 0 → served from AhmedBaset instead
    'forty-qudsi':          { provider: 'ahmedbaset', path: 'forties/qudsi40.json',                  characterization: 'Mixed (per source hadith)' },
    'forty-shah-waliullah': { provider: 'ahmedbaset', path: 'forties/shahwaliullah40.json',          characterization: 'Mixed' },
  };

  /** Which provider serves a collection slug. Unknown slug → 'hadithapi' (Worker validates). */
  function hadithProviderOf(slug) {
    const r = HADITH_ROUTES[slug];
    return r ? r.provider : 'hadithapi';
  }

  /* Static 18-collection seed (7d cache). */
  async function _hadithSeed() {
    const s = await _get('islamicinfo-hadith-collections', HADITH_SEED_URL, TTL_7D, false);
    return (s && Array.isArray(s.collections)) ? s.collections : [];
  }
  /* Seed row → Worker-shaped collection item (so core.mergeCollection consumes it uniformly). */
  function _seedToCollection(c) {
    return {
      collectionSlug: c.slug,
      collectionName: c.nameEnglish,
      collectionArabicName: c.nameArabic || null,
      compiler: c.compiler || null,
      hadithCount: (typeof c.hadithCount === 'number') ? c.hadithCount : null,
      chaptersCount: null,
      source: c.source || null,
      perHadithGrade: c.perHadithGrade === true,
      gradeCharacterization: c.gradeCharacterization || null,
    };
  }

  /* Direct keyless fetchers — NO apiKey param (none exists for these public sources). */
  function _fetchFawaz(edition) {
    return _get('islamicinfo-hadith-fawaz-' + edition, HADITH_DIRECT_BASE.fawazahmed0 + edition + '.json', TTL_7D, false);
  }
  function _fetchAhmedBaset(path) {
    const key = 'islamicinfo-hadith-ab-' + path.replace(/[^a-z0-9]+/gi, '-');
    return _get(key, HADITH_DIRECT_BASE.ahmedbaset + path, TTL_7D, false);
  }

  /* Normalize a direct-source hadith into the SAME internal shape the Worker emits
     (worker/src/lib/hadith-adapter.js → normalizeHadith). grade is NULL for these
     collections (no per-hadith grade at source) — ADR-022/ADR-024: the UI shows the
     collection-level gradeCharacterization badge, never a fabricated grade, never
     "Grade Unknown". */
  function _directHadith(slug, provider, num, book, arabic, text, narrator, characterization) {
    // Scholarly citation "[Collection] [Number]" via the shared table, so
    // direct-source collections read "Riyad as-Saliheen 1" (a proper name),
    // never the raw slug and never the backend vendor. `provider` is retained
    // in `source` for internal/admin only. buildRef is a no-op safe fallback if
    // the citation core is not on the page.
    var cite = (root.II && root.II.hadithCitation) || null;
    var collectionName = (cite && cite.COLLECTION_NAMES[slug]) || null;
    var hadithNumber = (typeof num === 'number' ? num : null);
    var reference = cite
      ? cite.buildReference({ collectionSlug: slug, collectionName: collectionName, hadithNumber: hadithNumber })
      : (collectionName && hadithNumber != null ? collectionName + ' ' + hadithNumber : null);
    return {
      id: (slug && num != null) ? (slug + ':' + (book != null ? book : 0) + ':' + num) : null,
      source: provider,
      sourceId: null,
      collectionSlug: slug,
      collectionName: collectionName,
      collectionArabicName: null,
      bookNumber: (book != null ? book : null),
      bookName: null,
      bookArabicName: null,
      hadithNumber: hadithNumber,
      reference: reference,
      arabicMatn: arabic || '',
      // `edition` null: it previously carried the backend vendor (provider id),
      // which must never be shown to users as a "source".
      translation: { text: text || '', language: 'en', edition: null, translator: null },
      narrator: { id: null, name: narrator || null, arabicName: null },
      grade: null,
      gradeCharacterization: characterization || null,
      isnad: { status: 'unavailable', narrators: [] },
      topics: [],
      audio: { status: 'unavailable', url: null, reciter: null },
      sourceMetadata: { fetchedAt: null, sourceUrlOrId: null, contentHash: null, verificationStatus: 'source-only' },
    };
  }

  /* Paginate a flat array → Worker list envelope shape { hadiths, page, limit, total, lastPage }. */
  function _pageDirect(list, page, limit) {
    const p = Math.max(1, parseInt(page, 10) || 1);
    const l = Math.max(1, parseInt(limit, 10) || 25);
    const start = (p - 1) * l;
    return { hadiths: list.slice(start, start + l), page: p, limit: l, total: list.length, lastPage: Math.max(1, Math.ceil(list.length / l)) };
  }

  /* fetchHadithsByBook — provider-routed hadith feed (ADR-024).
     hadithapi → Worker (fetchHadithList). Direct sources → fetch file, normalize,
     paginate the flat list (their Tier-2 book split is deferred per TechSpec §10). */
  async function fetchHadithsByBook(slug, book, page, limit) {
    if (hadithProviderOf(slug) === 'hadithapi') return fetchHadithList(slug, book, page, limit);
    const route = HADITH_ROUTES[slug];
    try {
      if (route.provider === 'fawazahmed0') {
        const pair = await Promise.all([_fetchFawaz(route.eng), _fetchFawaz(route.ara)]);
        const eng = pair[0], ara = pair[1];
        if (!eng || !Array.isArray(eng.hadiths)) return { ok: false, error: { code: 'upstream', message: 'Source unavailable', retryable: true }, source: 'fallback' };
        const araBy = {};
        (ara && Array.isArray(ara.hadiths) ? ara.hadiths : []).forEach(function (h) { araBy[h.hadithnumber] = h.text; });
        const list = eng.hadiths.map(function (h) { return _directHadith(slug, 'fawazahmed0', h.hadithnumber, null, araBy[h.hadithnumber] || '', h.text, null, route.characterization); });
        return { ok: true, data: _pageDirect(list, page, limit), source: 'live' };
      }
      const doc = await _fetchAhmedBaset(route.path);
      if (!doc || !Array.isArray(doc.hadiths)) return { ok: false, error: { code: 'upstream', message: 'Source unavailable', retryable: true }, source: 'fallback' };
      const list = doc.hadiths.map(function (h) {
        return _directHadith(slug, 'ahmedbaset',
          (typeof h.idInBook === 'number' ? h.idInBook : h.id),
          (typeof h.chapterId === 'number' ? h.chapterId : null),
          h.arabic || '', (h.english && h.english.text) || '', (h.english && h.english.narrator) || null,
          route.characterization);
      });
      return { ok: true, data: _pageDirect(list, page, limit), source: 'live' };
    } catch (err) {
      console.warn('[II/api] fetchHadithsByBook direct failed:', err && err.message);
      return { ok: false, error: { code: 'network', message: 'Network error', retryable: true }, source: 'fallback' };
    }
  }

  /* fetchSingleHadith — provider-routed single hadith. hadithapi → Worker (needs book+num).
     Direct sources → fetch (cached) file + find by hadith number. */
  async function fetchSingleHadith(slug, book, num) {
    if (hadithProviderOf(slug) === 'hadithapi') return fetchHadithOne(slug, book, num);
    const res = await fetchHadithsByBook(slug, book, 1, 1000000);
    if (!res || !res.ok || !res.data || !Array.isArray(res.data.hadiths)) {
      return res || { ok: false, error: { code: 'upstream', message: 'unavailable', retryable: true }, source: 'fallback' };
    }
    const one = res.data.hadiths.find(function (h) { return String(h.hadithNumber) === String(num); });
    return one ? { ok: true, data: one, source: res.source } : { ok: false, error: { code: 'not_found', message: 'Hadith not found', retryable: false }, source: 'fallback' };
  }

  /* fetchHadithOfDay — alias of the existing Worker daily endpoint (ADR-021). */
  function fetchHadithOfDay() { return fetchHadithDaily(); }

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
    postExplain,
    postSubscribe,
    fetchHadithCollections,
    fetchHadithBooks,
    fetchHadithList,
    fetchHadithOne,
    fetchHadithSearch,
    fetchHadithByNumber,
    fetchHadithDaily,
    fetchDorarSilsila,
    _dorarUrl,
    fetchNarrator,
    fetchNarratorById,
    fetchHadithOfDay,
    fetchHadithsByBook,
    fetchSingleHadith,
    hadithProviderOf,
    API_BASE,          // exposed for tests + debugging (ADR-028)
    _apiUrl,
  };

  /* Support both ES module (if bundled later) and plain <script> */
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    root.II = root.II || {};
    root.II.api = api;
  }

}(typeof globalThis !== 'undefined' ? globalThis : window));
