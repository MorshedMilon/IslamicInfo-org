/* IslamicInfo.org — quran-mushaf-core.js
   Pure, DOM-free logic for Madina Mushaf (QCF v2) page rendering. UMD: Node + browser. */
(function (root, factory) {
  var api = factory();
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; }
  else { root.II = root.II || {}; root.II.mushafCore = api; }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var PAGE_MIN = 1, PAGE_MAX = 604;
  var API = 'https://api.quran.com/api/v4/verses/by_page/';
  var FONT_BASE = 'https://verses.quran.foundation/fonts/quran/hafs/';

  function chapterOf(surahId, chapters) {
    var data = chapters && chapters.data;
    if (!data) return null;
    for (var i = 0; i < data.length; i++) if (Number(data[i].id) === Number(surahId)) return data[i];
    return null;
  }
  function pageOfSurah(surahId, chapters) {
    var ch = chapterOf(surahId, chapters);
    return (ch && ch.pages && ch.pages[0]) ? Number(ch.pages[0]) : 1;
  }
  function hasBismillah(surahId, chapters) {
    var ch = chapterOf(surahId, chapters);
    if (ch && typeof ch.bismillah_pre === 'boolean') return ch.bismillah_pre;
    return Number(surahId) !== 1 && Number(surahId) !== 9; // safe default
  }

  // variant 'v2' -> plain glyphs; 'v4' -> tajweed color font (colrv1 default, ot-svg for Firefox)
  function fontUrl(page, variant, theme, isFirefox) {
    if (variant === 'v4') {
      if (isFirefox) return FONT_BASE + 'v4/ot-svg/' + (theme === 'dark' ? 'dark' : 'light') + '/woff2/p' + page + '.woff2';
      return FONT_BASE + 'v4/colrv1/woff2/p' + page + '.woff2';
    }
    return FONT_BASE + 'v2/woff2/p' + page + '.woff2';
  }
  function fontFamily(page, variant) { return 'p' + page + '-' + variant; }

  function buildPageModel(apiJson, chapters, page) {
    var verses = (apiJson && apiJson.verses) || [];
    var byLine = {}; // line_number -> [{code,type,verseKey,position}]
    var juz = null, hizb = null;
    var surahStarts = {}; // line_number -> surahId (first word of a surah on this line)

    verses.forEach(function (v) {
      if (juz == null && typeof v.juz_number === 'number') juz = v.juz_number;
      if (hizb == null && typeof v.hizb_number === 'number') hizb = v.hizb_number;
      var surahId = Number(String(v.verse_key || '').split(':')[0]) || null;
      (v.words || []).forEach(function (w) {
        var ln = Number(w.line_number) || 0; if (!ln) return;
        (byLine[ln] = byLine[ln] || []).push({
          code: w.code_v2 || '', type: w.char_type_name === 'end' ? 'end' : 'word',
          verseKey: v.verse_key, position: Number(w.position) || 0
        });
        if (v.verse_number === 1 && Number(w.position) === 1 && surahStarts[ln] == null) {
          surahStarts[ln] = surahId;
        }
      });
    });

    var lineNums = Object.keys(byLine).map(Number).sort(function (a, b) { return a - b; });
    var lines = [];
    var minLine = lineNums.length ? lineNums[0] : 1;

    // For each surah start, the empty line(s) directly above the first ayah line are header (+ basmala).
    Object.keys(surahStarts).map(Number).forEach(function (startLine) {
      var surahId = surahStarts[startLine];
      var slotsAbove = [];
      for (var L = startLine - 1; L >= 1 && !byLine[L]; L--) slotsAbove.unshift(L);
      var wantBasmala = hasBismillah(surahId, chapters);
      var needed = wantBasmala ? 2 : 1;
      var chosen = slotsAbove.slice(-needed);
      while (chosen.length < needed) chosen.unshift((chosen.length ? chosen[0] : startLine) - 0.5);
      if (wantBasmala) {
        lines.push({ n: chosen[0], type: 'surah_name', surah: surahId, centered: true, words: [] });
        lines.push({ n: chosen[1], type: 'basmallah', surah: surahId, centered: true, words: [] });
      } else {
        lines.push({ n: chosen[0], type: 'surah_name', surah: surahId, centered: true, words: [] });
      }
    });

    lineNums.forEach(function (ln) {
      lines.push({ n: ln, type: 'ayah', centered: false, words: byLine[ln] });
    });
    lines.sort(function (a, b) { return a.n - b.n; });

    return { page: Number(page) || minLine, juz: juz, hizb: hizb, lines: lines };
  }

  function fetchPage(page, opts) {
    opts = opts || {};
    var url = API + page + '?words=true&word_fields=code_v2,line_number,page_number,char_type_name,position' +
              '&fields=juz_number,hizb_number,page_number&per_page=50&mushaf=1';
    var ctrl = new AbortController();
    var t = setTimeout(function () { ctrl.abort(); }, opts.timeout || 8000);
    return fetch(url, { signal: ctrl.signal })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (json) { return buildPageModel(json, opts.chapters, page); })
      .finally(function () { clearTimeout(t); });
  }

  return {
    PAGE_MIN: PAGE_MIN, PAGE_MAX: PAGE_MAX,
    pageOfSurah: pageOfSurah, hasBismillah: hasBismillah,
    fontUrl: fontUrl, fontFamily: fontFamily,
    buildPageModel: buildPageModel, fetchPage: fetchPage
  };
});
