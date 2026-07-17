/* Related Hadith — pure core (DOM-free, UMD). */
(function (root, factory) {
  var mod = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = mod;
  (root.II = root.II || {}).relatedHadithCore = mod;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var ALLOWED_COLLECTIONS = ['Sahih al-Bukhari', 'Sahih Muslim', "Jami' at-Tirmidhi",
    'Sunan Abu Dawud', 'Sunan Ibn Majah', "Sunan an-Nasa'i", 'Mishkat al-Masabih',
    'Musnad Ahmad', 'Al-Silsila as-Sahiha'];
  var ALLOWED_GRADES = ['Sahih', 'Hasan'];

  function validateSource(source, taxonomy) {
    var errors = [];
    if (!source || typeof source !== 'object' || Array.isArray(source)) {
      return { ok: false, errors: ['source must be an object keyed by topic slug'] };
    }
    taxonomy = taxonomy || {};
    Object.keys(source).forEach(function (slug) {
      var topic = source[slug];
      if (!/^[a-z0-9-]+$/.test(slug)) errors.push(slug + ': slug must be kebab-case [a-z0-9-]');
      if (!topic || typeof topic !== 'object') { errors.push(slug + ': topic must be an object'); return; }
      if (typeof topic.label !== 'string' || !topic.label.trim()) errors.push(slug + ': missing/blank label');
      if (!(slug in taxonomy)) errors.push(slug + ': slug not in shared verses taxonomy');
      else if (topic.label !== taxonomy[slug]) errors.push(slug + ': label "' + topic.label + '" != taxonomy label "' + taxonomy[slug] + '"');
      if (!Array.isArray(topic.hadith) || topic.hadith.length === 0) { errors.push(slug + ': hadith must be a non-empty array'); return; }
      var seen = {};
      topic.hadith.forEach(function (h, i) {
        var at = slug + '[' + i + ']';
        if (!h || typeof h !== 'object') { errors.push(at + ': row must be an object'); return; }
        if (ALLOWED_COLLECTIONS.indexOf(h.collection) === -1) errors.push(at + ': collection not in allowed list: ' + JSON.stringify(h.collection));
        if (!Number.isInteger(h.number) || h.number < 1) errors.push(at + ': number must be a positive integer');
        else {
          var dk = h.collection + '|' + h.number;
          if (seen[dk]) errors.push(at + ': duplicate ' + dk + ' within topic');
          seen[dk] = true;
        }
        ['arabic', 'english', 'narrator', 'isnadSummary', 'gradedBy'].forEach(function (f) {
          if (typeof h[f] !== 'string' || !h[f].trim()) errors.push(at + ': missing/blank ' + f);
        });
        if (ALLOWED_GRADES.indexOf(h.grade) === -1) errors.push(at + ': grade must be Sahih or Hasan (got ' + JSON.stringify(h.grade) + ')');
        if (typeof h.url !== 'string' || !/^https:\/\//.test(h.url)) errors.push(at + ': url must be an https link');
        if (!Number.isInteger(h.score) || h.score < 1 || h.score > 10) errors.push(at + ': score must be an integer 1-10');
        if (typeof h.reviewed !== 'boolean') errors.push(at + ': reviewed must be a boolean');
      });
    });
    return { ok: errors.length === 0, errors: errors };
  }

  return {
    ALLOWED_COLLECTIONS: ALLOWED_COLLECTIONS,
    ALLOWED_GRADES: ALLOWED_GRADES,
    validateSource: validateSource
  };
});
