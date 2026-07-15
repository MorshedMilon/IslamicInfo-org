/* Module 6 — QUL ingest pure core (DOM-free, UMD). */
(function (root, factory) {
  var mod = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = mod;
  (root.II = root.II || {}).qulCore = mod;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var QUL_OFFSET = 1000000;
  function isQulId(id) { return Number(id) >= QUL_OFFSET; }
  function offsetId(qulId) { return QUL_OFFSET + Number(qulId); }
  function baseId(offset) { return Number(offset) - QUL_OFFSET; }

  function firstDefined() { for (var i = 0; i < arguments.length; i++) { if (arguments[i] != null) return arguments[i]; } return undefined; }

  function parseQulAyah(raw) {
    raw = raw || {};
    var audioObj = (raw.audio && typeof raw.audio === 'object') ? raw.audio : null;
    var surah = firstDefined(raw.surah, raw.sura_number, raw.chapter, raw.chapter_id);
    var ayah = firstDefined(raw.ayah, raw.ayah_number, raw.verse_number, raw.verse);
    var url = firstDefined(raw.audio_url, (typeof raw.audio === 'string' ? raw.audio : undefined), raw.url, (audioObj ? audioObj.url : undefined), '');
    var segments = firstDefined(raw.segments, (audioObj ? audioObj.segments : undefined), []);
    return { surah: Number(surah), ayah: Number(ayah), url: String(url || ''), segments: segments };
  }

  function qulSegments(raw) {
    if (!Array.isArray(raw)) return [];
    return raw.map(function (s) {
      if (Array.isArray(s)) {
        if (s.length >= 4) return { word: s[1], start: s[2], end: s[3] };
        return { word: s[0], start: s[1], end: s[2] };
      }
      return s ? { word: s.word, start: s.start, end: s.end } : null;
    }).filter(function (x) { return x && x.start != null && x.end != null; });
  }

  function toAyahAudio(raw) {
    var p = parseQulAyah(raw);
    if (!p.surah || !p.ayah) return null;
    return { verse_key: p.surah + ':' + p.ayah, url: p.url, segments: qulSegments(p.segments) };
  }

  function groupBySurah(rawAyahs) {
    var out = {};
    (rawAyahs || []).forEach(function (r) {
      var a = toAyahAudio(r);
      if (!a) return;
      var s = a.verse_key.split(':')[0];
      (out[s] = out[s] || []).push(a);
    });
    Object.keys(out).forEach(function (s) {
      out[s].sort(function (a, b) { return Number(a.verse_key.split(':')[1]) - Number(b.verse_key.split(':')[1]); });
    });
    return out;
  }

  return {
    QUL_OFFSET: QUL_OFFSET, isQulId: isQulId, offsetId: offsetId, baseId: baseId,
    parseQulAyah: parseQulAyah, qulSegments: qulSegments, toAyahAudio: toAyahAudio, groupBySurah: groupBySurah
  };
});
