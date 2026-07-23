/* ═══════════════════════════════════════════════════════════════════
   IslamicInfo.org — home-search-core.js
   Pure logic for the homepage hero search: tab dispatch, per-mode
   placeholder, and continue-chip recency. NO DOM, NO network. UMD
   (window.II.homeSearch in the browser; module.exports in tests).
   ═══════════════════════════════════════════════════════════════════ */
(function (root) {
  'use strict';

  var COMING_SOON = {
    quran: 'Qur’an search is coming soon — the Hadith tab is live now.',
    dua:   'Dua search is coming soon — the Hadith tab is live now.',
    all:   'Full search across all types is coming soon — the Hadith tab is live now.',
  };

  // Where a submitted query should go, by active tab.
  //   { kind:'navigate', url }   — go to a page
  //   { kind:'note', message }   — show an honest coming-soon note (no results)
  //   { kind:'noop' }            — empty query
  function dispatchTarget(mode, rawQuery) {
    var q = String(rawQuery == null ? '' : rawQuery).trim();
    if (!q) return { kind: 'noop' };
    if (mode === 'hadith') return { kind: 'navigate', url: 'hadith.html?q=' + encodeURIComponent(q) };
    if (mode === 'verify') return { kind: 'navigate', url: 'verify.html?claim=' + encodeURIComponent(q) };
    return { kind: 'note', message: COMING_SOON[mode] || COMING_SOON.all };
  }

  function placeholderFor(mode) {
    return (mode === 'verify')
      ? 'Paste a claim to verify…'
      : 'Search hadiths, narrators, topics, or paste a claim…';
  }

  // Prettify a collection slug when no display name was stored (e.g. "sahih-bukhari").
  function prettySlug(slug) {
    return String(slug || '').split('-').map(function (w) {
      return w ? (w.charAt(0).toUpperCase() + w.slice(1)) : w;
    }).join(' ');
  }

  // Accept either `ts` (deep-view writer) or `timestamp` (feed-scroll reading tracker).
  function tsOf(rec) {
    if (!rec) return -1;
    if (typeof rec.ts === 'number') return rec.ts;
    if (typeof rec.timestamp === 'number') return rec.timestamp;
    return -1;
  }

  // Choose the more-recent last-viewed record (hadith vs quran) by `ts`.
  // Returns { kind, url, label } or null when neither exists.
  function pickContinue(hadithRec, quranRec) {
    var hTs = tsOf(hadithRec);
    var qTs = tsOf(quranRec);
    var hasH = !!hadithRec, hasQ = !!quranRec;
    if (!hasH && !hasQ) return null;
    var useH = hasH && (!hasQ || hTs >= qTs);
    if (useH) {
      var name = hadithRec.collectionName || prettySlug(hadithRec.collectionSlug);
      return {
        kind: 'hadith',
        url: '/hadith/' + encodeURIComponent(hadithRec.collectionSlug) + '/' +
             encodeURIComponent(hadithRec.bookNum) + '/' + encodeURIComponent(hadithRec.hadithNum),
        label: name + ', Hadith ' + hadithRec.hadithNum,
      };
    }
    return { kind: 'quran', url: 'quran.html', label: 'Surah ' + quranRec.surah };
  }

  var core = { dispatchTarget: dispatchTarget, placeholderFor: placeholderFor, pickContinue: pickContinue, prettySlug: prettySlug };
  if (typeof module !== 'undefined' && module.exports) { module.exports = core; }
  else { root.II = root.II || {}; root.II.homeSearch = core; }

}(typeof globalThis !== 'undefined' ? globalThis : window));
