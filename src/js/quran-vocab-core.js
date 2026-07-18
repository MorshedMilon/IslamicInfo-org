/* Vocabulary / Key Terms — pure core (DOM-free, UMD). */
(function (root, factory) {
  var mod = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = mod;
  (root.II = root.II || {}).vocabCore = mod;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function validateSource(source, taxonomy) {
    var errors = [];
    if (!source || typeof source !== 'object' || Array.isArray(source)) {
      return { ok: false, errors: ['source must be an object keyed by term slug'] };
    }
    taxonomy = taxonomy || {};
    Object.keys(source).forEach(function (slug) {
      var t = source[slug];
      if (!/^[a-z0-9-]+$/.test(slug)) errors.push(slug + ': term slug must be kebab-case [a-z0-9-]');
      if (!t || typeof t !== 'object') { errors.push(slug + ': term must be an object'); return; }
      ['arabic', 'translit', 'shortDef', 'longDef', 'source'].forEach(function (f) {
        if (typeof t[f] !== 'string' || !t[f].trim()) errors.push(slug + ': missing/blank ' + f);
      });
      if (!Array.isArray(t.topics) || t.topics.length === 0) { errors.push(slug + ': topics must be a non-empty array'); return; }
      t.topics.forEach(function (topic) {
        if (!(topic in taxonomy)) errors.push(slug + ': topic "' + topic + '" not in shared verses taxonomy');
      });
    });
    return { ok: errors.length === 0, errors: errors };
  }

  function compileIndex(source, taxonomy) {
    var terms = {}, topicTerms = {};
    Object.keys(source).forEach(function (slug) {
      var t = source[slug];
      terms[slug] = {
        arabic: t.arabic, translit: t.translit, shortDef: t.shortDef,
        longDef: t.longDef, source: t.source, topics: t.topics.slice()
      };
      t.topics.forEach(function (topic) {
        var arr = topicTerms[topic] = topicTerms[topic] || [];
        if (arr.indexOf(slug) === -1) arr.push(slug);
      });
    });
    return { terms: terms, topicTerms: topicTerms };
  }

  function keyTermsForVerse(verseKey, topicTerms, verseIndex, terms) {
    var topics = (verseIndex && verseIndex[verseKey]) ? verseIndex[verseKey] : [];
    var seen = {}, out = [];
    topics.forEach(function (topic) {
      var list = (topicTerms && topicTerms[topic]) ? topicTerms[topic] : [];
      list.forEach(function (slug) {
        if (seen[slug]) return;
        seen[slug] = true;
        var t = terms && terms[slug];
        if (!t) return;
        out.push({ slug: slug, arabic: t.arabic, translit: t.translit, shortDef: t.shortDef });
      });
    });
    out.sort(function (a, b) {
      var x = a.translit.toLowerCase(), y = b.translit.toLowerCase();
      return x < y ? -1 : x > y ? 1 : 0;
    });
    return out;
  }

  function termCrossRefs(termSlug, terms, relatedVersesTopics, relatedHadithTopics, opts) {
    opts = opts || {};
    var vLimit = opts.vLimit == null ? 3 : opts.vLimit;
    var hLimit = opts.hLimit == null ? 2 : opts.hLimit;
    var t = terms && terms[termSlug];
    if (!t) return { verses: [], hadith: [] };
    var vBest = {}, hBest = {};
    t.topics.forEach(function (topic) {
      var vt = relatedVersesTopics && relatedVersesTopics[topic];
      if (vt && vt.verses) vt.verses.forEach(function (v) {
        if (!vBest[v.key] || v.score > vBest[v.key].score) vBest[v.key] = v;
      });
      var ht = relatedHadithTopics && relatedHadithTopics[topic];
      if (ht && ht.hadith) ht.hadith.forEach(function (h) {
        var k = h.collection + '|' + h.number;
        if (!hBest[k] || h.score > hBest[k].score) hBest[k] = h;
      });
    });
    var verses = Object.keys(vBest).map(function (k) { return vBest[k]; })
      .sort(function (a, b) { return (b.score - a.score) || (a.key < b.key ? -1 : a.key > b.key ? 1 : 0); })
      .slice(0, vLimit);
    var hadith = Object.keys(hBest).map(function (k) { return hBest[k]; })
      .sort(function (a, b) { return (b.score - a.score) || ((a.collection + a.number) < (b.collection + b.number) ? -1 : 1); })
      .slice(0, hLimit);
    return { verses: verses, hadith: hadith };
  }

  return {
    validateSource: validateSource,
    compileIndex: compileIndex,
    keyTermsForVerse: keyTermsForVerse,
    termCrossRefs: termCrossRefs
  };
});
