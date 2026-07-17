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

  return {
    isValidVerseKey: isValidVerseKey
  };
});
