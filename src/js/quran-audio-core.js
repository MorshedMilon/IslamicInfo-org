/* IslamicInfo.org — quran-audio-core.js
   Pure, DOM-free audio helpers. UMD: Node + browser. */
(function (root, factory) {
  var api = factory();
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; }
  else { root.II = root.II || {}; root.II.audioCore = api; }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function normalizeAudioUrl(url, base) {
    base = base || 'https://audio.qurancdn.com/';
    url = String(url == null ? '' : url);
    if (/^https?:\/\//i.test(url)) return url;
    if (url.indexOf('//') === 0) return 'https:' + url;
    return base + url.replace(/^\//, '');
  }

  function normalizeSegments(raw) {
    return (raw || []).map(function (s) {
      if (!Array.isArray(s)) return null;
      if (s.length >= 4) return { word: s[1], start: s[2], end: s[3] };
      if (s.length === 3) return { word: s[0], start: s[1], end: s[2] };
      return null;
    }).filter(Boolean);
  }

  function activeWordAt(segments, ms) {
    var s = segments || [];
    for (var i = 0; i < s.length; i++) { if (ms >= s[i].start && ms < s[i].end) return s[i].word; }
    return -1;
  }

  function formatTime(sec) {
    sec = Number(sec); if (!isFinite(sec) || sec < 0) sec = 0;
    var m = Math.floor(sec / 60), s = Math.floor(sec % 60);
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  function recitersCacheKey() { return 'ii-reciters'; }
  function audioCacheKey(surahId, reciterId) { return 'ii-audio-' + surahId + '-' + reciterId; }
  function isFresh(fetchedAt, now, maxAgeMs) {
    if (typeof maxAgeMs !== 'number') maxAgeMs = 7 * 24 * 60 * 60 * 1000;
    return typeof fetchedAt === 'number' && (now - fetchedAt) < maxAgeMs;
  }

  return { normalizeAudioUrl, normalizeSegments, activeWordAt, formatTime,
           recitersCacheKey, audioCacheKey, isFresh };
});
