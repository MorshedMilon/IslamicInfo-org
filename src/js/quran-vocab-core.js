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

  return {
    validateSource: validateSource
  };
});
