/* Module 5B — AI Explain pure core (DOM-free, UMD). */
(function (root, factory) {
  var mod = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = mod;
  (root.II = root.II || {}).aiCore = mod;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
  // Conservative v1 backstop — final ruling-term set is owned by the 🕌 human reviewer (CONTENT-POLICY §4/§6).
  var VERDICT_FRAMING = /\b(?:is|are|it'?s|its|be|being|was|were|becomes?|remains?|considered|declared|deemed|ruled)\s+(?:(?:not|an?|clearly|strictly|definitely|therefore|thus|now|then)\s+)?(?:haram|haraam|halal|forbidden|impermissible|permissible|unlawful|lawful|obligatory|sinful|makruh|mustahabb|wajib|fard)\b/i;
  var VERDICT_TERMS = /\bfatwa\b|fatwā|\bit is a sin\b|\bit'?s a sin\b/i;
  var FIXED_Q = 'Explain the meaning of this verse in simple, easy language for a general reader.';

  function slugEdition(edition) {
    return String(edition || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }
  function aiCacheKey(verseKey, edition) {
    return 'ii-quran-ai-' + verseKey + '-' + slugEdition(edition);
  }
  function editionFromAttr(attr) {
    var s = String(attr || '');
    var i = s.indexOf('·'); // middle dot ·
    return (i === -1 ? s : s.slice(0, i)).trim();
  }
  function buildAskPayload(d) {
    d = d || {};
    var ed = d.edition ? ' (' + d.edition + ')' : '';
    return {
      context: String(d.arabic || '') + '\n' + String(d.translation || '') + ed,
      question: FIXED_Q,
      sourceRef: d.ref || ''
    };
  }
  function containsVerdictLanguage(text) {
    var s = String(text || '');
    return VERDICT_FRAMING.test(s) || VERDICT_TERMS.test(s);
  }
  function isFresh(fetchedAt, now, maxAge) {
    if (maxAge == null) maxAge = THIRTY_DAYS;
    return (now - fetchedAt) < maxAge;
  }

  return {
    slugEdition: slugEdition,
    aiCacheKey: aiCacheKey,
    editionFromAttr: editionFromAttr,
    buildAskPayload: buildAskPayload,
    containsVerdictLanguage: containsVerdictLanguage,
    isFresh: isFresh,
    FIXED_QUESTION: FIXED_Q,
    SCHOLAR_REDIRECT: 'For personal religious guidance, consult a qualified scholar.'
  };
});
