/* IslamicInfo.org — quran-tafsir-core.js
   Pure, DOM-free logic for the Tafsir panel: source registry, URL building,
   and HTML/plain-text → paragraph formatting. UMD: Node + browser. */
(function (root, factory) {
  var api = factory();
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; }
  else { root.II = root.II || {}; root.II.tafsirCore = api; }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // Three confirmed-English tafsirs. spa5k CDN is primary (plain text, static);
  // quran.com is the fallback for the two it carries. (As-Sa'di added later.)
  // `ummah` = UmmahAPI tafsir work key (ADR-045: secondary/cross-check mirror of the
  // same public-domain tafsir; used only as a final fallback if spa5k + quran.com fail).
  var SOURCES = [
    { key: 'ik', label: 'Ibn Kathir',        spa5k: 'en-tafisr-ibn-kathir',      quranId: 169, ummah: 'ibn_kathir', lang: 'en' },
    { key: 'ma', label: "Ma'arif al-Qur'an", spa5k: 'en-tafsir-maarif-ul-quran', quranId: 168, lang: 'en' },
    { key: 'ja', label: 'Al-Jalalayn',       spa5k: 'tafsir-al-jalalayn',        quranId: null, lang: 'en' },
    // As-Sa'di: bundled static per-surah blocks (OCR-digitized from the archive.org
    // English 10-vol set — no free API exists). Commentary is per verse-RANGE.
    { key: 'sa', label: "As-Sa'di",          staticBase: 'src/data/tafsir-saadi/', lang: 'en', range: true }
  ];
  function sources() { return SOURCES.slice(); }
  function sourceByKey(key) {
    for (var i = 0; i < SOURCES.length; i++) if (SOURCES[i].key === key) return SOURCES[i];
    return SOURCES[0];
  }

  var SPA5K = 'https://cdn.jsdelivr.net/gh/spa5k/tafsir_api@main/tafsir/';
  var QURAN = 'https://api.quran.com/api/v4/tafsirs/';
  var UMMAH = 'https://ummahapi.com/api/tafsir/';

  function spa5kUrl(src, surah, ayah) { return SPA5K + src.spa5k + '/' + surah + '/' + ayah + '.json'; }
  function quranUrl(src, surah, ayah) {
    return src.quranId ? (QURAN + src.quranId + '/by_ayah/' + surah + ':' + ayah) : null;
  }
  // UmmahAPI: GET /api/tafsir/{work}/surah/{s}/ayah/{a} → { data: { tafsir: { text, author } } }
  function ummahUrl(src, surah, ayah) {
    return src.ummah ? (UMMAH + src.ummah + '/surah/' + surah + '/ayah/' + ayah) : null;
  }

  var ENT = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&nbsp;': ' ', '&apos;': "'" };
  function decodeEntities(s) {
    return String(s == null ? '' : s)
      .replace(/&#(\d+);/g, function (_, n) { return String.fromCharCode(Number(n)); })
      .replace(/&[a-z#0-9]+;/gi, function (m) { return ENT[m] != null ? ENT[m] : m; });
  }

  // Convert tafsir text (HTML from quran.com, or plain-text-with-newlines from spa5k)
  // into an array of plain-text paragraphs. XSS-safe: all tags stripped, entities decoded.
  function formatTafsir(raw, isHtml) {
    var s = String(raw == null ? '' : raw);
    if (isHtml) {
      s = s
        .replace(/<\s*(script|style)[^>]*>[\s\S]*?<\/\s*\1\s*>/gi, '')          // drop script/style
        .replace(/<\s*(h[1-6]|p|div|br|li)[^>]*>/gi, '\n')                       // block starts → newline
        .replace(/<\/\s*(h[1-6]|p|div|li)\s*>/gi, '\n')                          // block ends → newline
        .replace(/<[^>]+>/g, '');                                                // strip remaining tags
      s = decodeEntities(s);
    }
    return s
      .replace(/\r/g, '')
      .split(/\n{1,}/)
      .map(function (p) { return p.replace(/\s+/g, ' ').trim(); })
      .filter(function (p) { return p.length > 0; });
  }

  // As-Sa'di comments on verse RANGES. Find the block covering `ayah`; if none exactly
  // matches (OCR range gaps), fall back to the nearest block that starts at or before it.
  function findBlock(blocks, ayah) {
    if (!Array.isArray(blocks) || !blocks.length) return null;
    var a = Number(ayah);
    var exact = null, prev = null;
    for (var i = 0; i < blocks.length; i++) {
      var b = blocks[i];
      if (a >= b.from && a <= b.to) { exact = b; break; }
      if (b.from <= a && (!prev || b.from > prev.from)) prev = b;
    }
    return exact || prev || blocks[0];
  }

  return {
    sources: sources, sourceByKey: sourceByKey,
    spa5kUrl: spa5kUrl, quranUrl: quranUrl, ummahUrl: ummahUrl, findBlock: findBlock,
    decodeEntities: decodeEntities, formatTafsir: formatTafsir
  };
});
