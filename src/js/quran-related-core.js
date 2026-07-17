/* Related Verses — pure core (DOM-free, UMD). */
(function (root, factory) {
  var mod = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = mod;
  (root.II = root.II || {}).relatedCore = mod;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function isValidVerseKey(key, ayahCounts) {
    if (typeof key !== 'string') return false;
    var m = /^(\d+):(\d+)$/.exec(key);
    if (!m) return false;
    var s = +m[1], a = +m[2];
    if (s < 1 || s > 114) return false;
    var max = ayahCounts && ayahCounts[s];
    if (!max) return false;
    return a >= 1 && a <= max;
  }

  function validateSource(source, ayahCounts) {
    var errors = [];
    if (!source || typeof source !== 'object' || Array.isArray(source)) {
      return { ok: false, errors: ['source must be an object keyed by topic slug'] };
    }
    Object.keys(source).forEach(function (slug) {
      var topic = source[slug];
      if (!/^[a-z0-9-]+$/.test(slug)) errors.push(slug + ': slug must be kebab-case [a-z0-9-]');
      if (!topic || typeof topic !== 'object') { errors.push(slug + ': topic must be an object'); return; }
      if (typeof topic.label !== 'string' || !topic.label.trim()) errors.push(slug + ': missing/blank label');
      if (!Array.isArray(topic.verses) || topic.verses.length === 0) {
        errors.push(slug + ': verses must be a non-empty array'); return;
      }
      var seen = {};
      topic.verses.forEach(function (v, i) {
        var at = slug + '[' + i + ']';
        if (!v || typeof v !== 'object') { errors.push(at + ': row must be an object'); return; }
        if (!isValidVerseKey(v.key, ayahCounts)) errors.push(at + ': invalid verse key ' + JSON.stringify(v.key));
        else if (seen[v.key]) errors.push(at + ': duplicate key ' + v.key + ' within topic');
        seen[v.key] = true;
        if (!Number.isInteger(v.score) || v.score < 1 || v.score > 10) errors.push(at + ': score must be an integer 1-10');
        if (typeof v.sourceCitation !== 'string' || !v.sourceCitation.trim()) errors.push(at + ': missing sourceCitation');
      });
    });
    return { ok: errors.length === 0, errors: errors };
  }

  function compileIndex(source, translations, surahNames) {
    var topics = {}, verseIndex = {};
    translations = translations || {};
    surahNames = surahNames || {};
    Object.keys(source).forEach(function (slug) {
      var t = source[slug];
      var rows = t.verses.slice().sort(function (a, b) { return b.score - a.score; }).map(function (v) {
        var tr = translations[v.key] || {};
        var s = +v.key.split(':')[0];
        return {
          key: v.key,
          ref: (surahNames[s] ? surahNames[s] + ' ' : '') + v.key,
          score: v.score,
          translation: tr.translation || '',
          translator: tr.translator || '',
          sourceCitation: v.sourceCitation
        };
      });
      topics[slug] = { label: t.label, verses: rows };
      t.verses.forEach(function (v) {
        var arr = verseIndex[v.key] = verseIndex[v.key] || [];
        if (arr.indexOf(slug) === -1) arr.push(slug);
      });
    });
    return { topics: topics, verseIndex: verseIndex };
  }

  return {
    isValidVerseKey: isValidVerseKey,
    validateSource: validateSource,
    compileIndex: compileIndex
  };
});
