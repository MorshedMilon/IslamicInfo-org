/* QuranlyAI — pure core (DOM-free, UMD). Shared by quranly-ai.js + quranly-ai-panel.js. */
(function (root, factory) {
  var mod = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = mod;
  (root.II = root.II || {}).quranlyCore = mod;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var ANON_KEY = 'ii-anon-id';

  // Conservative v1 backstop — identical to quran-ai-core.js; final term set owned by the 🕌 reviewer (CONTENT-POLICY §4/§6).
  var VERDICT_FRAMING = /\b(?:is|are|it'?s|its|be|being|was|were|becomes?|remains?|considered|declared|deemed|ruled)\s+(?:(?:not|an?|clearly|strictly|definitely|therefore|thus|now|then)\s+)?(?:haram|haraam|halal|forbidden|impermissible|permissible|unlawful|lawful|obligatory|sinful|makruh|mustahabb|wajib|fard)\b/i;
  var VERDICT_TERMS = /\bfatwa\b|fatwā|\bit is a sin\b|\bit'?s a sin\b/i;

  var CHIPS = {
    quran: [
      { action: 'explain', label: 'Explain this Ayah' },
      { action: 'simple', label: 'Explain Simply' },
      { action: 'key_lessons', label: 'Key Lessons' },
      { action: 'related_verses', label: 'Related Verses' },
      { action: 'related_hadith', label: 'Related Hadith' }
    ],
    hadith: [
      { action: 'explain', label: 'Explain this Hadith' },
      { action: 'related_verses', label: 'Related Verses' }
    ],
    dua: [{ action: 'explain', label: 'Explain this Dua' }],
    article: [{ action: 'summarize_tafsir', label: 'Summarize this Article' }],
    search: [{ action: 'custom', label: 'Explain these Results' }]
  };
  var DEFAULT_CHIPS = [
    { action: 'explain', label: 'Explain' },
    { action: 'custom', label: 'Ask a question' }
  ];

  function getOrCreateAnonId(storage) {
    var id = storage.getItem(ANON_KEY);
    if (!id) {
      id = (typeof crypto !== 'undefined' && crypto.randomUUID)
        ? crypto.randomUUID()
        : ('a-' + Date.now() + '-' + Math.floor(Math.random() * 1e9).toString(16));
      storage.setItem(ANON_KEY, id);
    }
    return id;
  }

  function chipsFor(type) {
    return (CHIPS[type] || DEFAULT_CHIPS).slice();
  }

  function buildAskPayload(context, action, customQuestion, anonId) {
    var payload = { context: context || {}, action: action, userIdOrFingerprint: anonId };
    if (action === 'custom' && customQuestion) payload.customQuestion = customQuestion;
    return payload;
  }

  function quotaText(remaining, max) {
    var r = (remaining == null ? max : remaining);
    return r + ' of ' + max + ' questions remaining today';
  }

  function containsVerdictLanguage(text) {
    var s = String(text || '');
    return VERDICT_FRAMING.test(s) || VERDICT_TERMS.test(s);
  }

  // audioRect: a getBoundingClientRect()-like object ({top}) or null. Returns the FAB `bottom` px.
  function fabBottomOffset(audioRect, viewportH, defaultBottom, gap) {
    if (!audioRect) return defaultBottom;
    var fromBottom = viewportH - audioRect.top;
    return Math.max(defaultBottom, fromBottom + gap);
  }

  return {
    getOrCreateAnonId: getOrCreateAnonId,
    chipsFor: chipsFor,
    buildAskPayload: buildAskPayload,
    quotaText: quotaText,
    containsVerdictLanguage: containsVerdictLanguage,
    fabBottomOffset: fabBottomOffset,
    ANON_KEY: ANON_KEY,
    SCHOLAR_REDIRECT: 'For personal religious guidance, consult a qualified scholar.'
  };
});
