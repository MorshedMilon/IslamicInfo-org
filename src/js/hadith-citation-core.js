/* ═══════════════════════════════════════════════════════════════════
   IslamicInfo.org — hadith-citation-core.js
   The ONE place that turns a normalized hadith into a scholarly citation
   string: "[Collection Name] [Hadith Number]"  (e.g. "Sahih al-Bukhari 5063").
   Pure, framework-free. UMD: window.II.hadithCitation in the browser,
   module.exports in Node tests. NO DOM, NO network.

   WHY hadith-number-only (owner decision 2026-07-23):
   Hadith NUMBERS are standardized across sources — the same numbering as
   sunnah.com — so "[collection] [number]" is independently verifiable by the
   reader regardless of which backend JSON mirror supplied the text. We do NOT
   append a book/chapter number: our stored `bookNumber` is the provider's
   internal chapter index and is NOT confirmed to match sunnah.com's canonical
   book numbering, so including it would risk a citation that fails to verify —
   defeating the purpose. (If sunnah.com API access is granted later, their
   book numbering becomes authoritative and this can be revisited.)

   WHY no vendor name: the backend that served the JSON (hadithapi.com /
   AhmedBaset / fawazahmed0) is an implementation detail, NOT a citation. It
   confuses readers into distrusting authentic content. The vendor name stays
   in code, the `source` field, and internal/admin views — NEVER user-facing.

   COLLECTION_NAMES mirrors `nameEnglish` in src/data/hadith/collections.json
   (the canonical collection-metadata source). The Worker and the browser are
   separate bundles, so the worker adapter keeps its own small mirror; keep both
   in sync with collections.json when a collection is added or renamed.
   ═══════════════════════════════════════════════════════════════════ */
(function (root) {
  'use strict';

  // slug → full display name. Mirror of src/data/hadith/collections.json nameEnglish.
  var COLLECTION_NAMES = {
    'sahih-bukhari': 'Sahih al-Bukhari',
    'sahih-muslim': 'Sahih Muslim',
    'abu-dawood': 'Sunan Abu Dawud',
    'al-tirmidhi': "Jami' at-Tirmidhi",
    'sunan-nasai': "Sunan an-Nasa'i",
    'ibn-e-majah': 'Sunan Ibn Majah',
    'musnad-ahmad': 'Musnad Ahmad',
    'mishkat': 'Mishkat al-Masabih',
    'al-silsila-sahiha': 'Al-Silsilah al-Sahihah',
    'nawawi40': '40 Hadith Nawawi',
    'riyad-assalihin': 'Riyad as-Saliheen',
    'bulugh-almaram': 'Bulugh al-Maram',
    'muwatta-malik': 'Muwatta Imam Malik',
    'aladab-almufrad': 'Al-Adab al-Mufrad',
    'shamail-muhammadiyah': 'Shamail Muhammadiyah',
    'sunan-darimi': 'Sunan al-Darimi',
    'forty-qudsi': 'Forty Hadith Qudsi',
    'forty-shah-waliullah': 'The Forty Hadith of Shah Waliullah',
  };

  // Resolve the human display name for a hadith. Prefer a name the provider
  // already normalized onto the object (hadithapi supplies book.bookName →
  // h.collectionName), else the canonical map, else the raw slug as a last
  // resort — NEVER a vendor name.
  function displayName(h) {
    h = h || {};
    return h.collectionName || COLLECTION_NAMES[h.collectionSlug] || h.collectionSlug || null;
  }

  // "[Collection Name] [Hadith Number]", or null when either part is missing.
  // Invariant: never emit a half-citation (matches the "every claim carries a
  // source" rule — a hadith with no resolvable name+number is not attributable).
  function buildReference(h) {
    h = h || {};
    var name = displayName(h);
    var num = h.hadithNumber;
    if (!name || num == null || num === '') return null;
    return name + ' ' + num;
  }

  var core = {
    COLLECTION_NAMES: COLLECTION_NAMES,
    displayName: displayName,
    buildReference: buildReference,
  };

  if (typeof module !== 'undefined' && module.exports) { module.exports = core; }
  else { root.II = root.II || {}; root.II.hadithCitation = core; }

}(typeof globalThis !== 'undefined' ? globalThis : window));
