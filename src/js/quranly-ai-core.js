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
  // The bare word "fatwa"/"fatwā" is intentionally NOT a term — it appears in the mandated
  // "Not a fatwa" footer on every answer; real rulings are caught by VERDICT_FRAMING.
  var VERDICT_TERMS = /\bit is a sin\b|\bit'?s a sin\b/i;

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
      { action: 'simple', label: 'Explain Simply' },
      { action: 'key_lessons', label: 'Key Lessons' },
      { action: 'related_verses', label: 'Related Verses' },
      { action: 'verify', label: 'Verify Hadith' }
    ],
    article: [
      { action: 'explain', label: 'Explain this Passage' },
      { action: 'simple', label: 'Explain Simply' },
      { action: 'key_lessons', label: 'Key Lessons' },
      { action: 'related_verses', label: 'Related Verses' },
      { action: 'related_hadith', label: 'Related Hadith' }
    ],
    dua: [
      { action: 'explain', label: 'Explain this Dua' },
      { action: 'simple', label: 'Explain Simply' },
      { action: 'key_lessons', label: 'Key Lessons' },
      { action: 'related_verses', label: 'Related Verses' },
      { action: 'related_hadith', label: 'Related Hadith' }
    ],
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

  // Incremental SSE frame parser. Pass the accumulated buffer (rest + newChunk);
  // returns { events: [{event, data}], rest } where rest is the unterminated remainder.
  // data is JSON-parsed when possible, else the raw string; frames with no data → null.
  function parseSSE(buffer) {
    var events = [];
    var idx;
    while ((idx = buffer.indexOf('\n\n')) !== -1) {
      var frame = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 2);
      var ev = 'message';
      var dataLines = [];
      frame.split('\n').forEach(function (line) {
        if (line.charAt(line.length - 1) === '\r') line = line.slice(0, -1);
        if (!line || line.charAt(0) === ':') return; // blank line or comment
        var c = line.indexOf(':');
        var field = c === -1 ? line : line.slice(0, c);
        var val = c === -1 ? '' : line.slice(c + 1);
        if (val.charAt(0) === ' ') val = val.slice(1);
        if (field === 'event') ev = val;
        else if (field === 'data') dataLines.push(val);
      });
      if (dataLines.length) {
        var raw = dataLines.join('\n');
        var data;
        try { data = JSON.parse(raw); } catch (e) { data = raw; }
        events.push({ event: ev, data: data });
      } else {
        events.push({ event: ev, data: null });
      }
    }
    return { events: events, rest: buffer };
  }

  // Route classification shared by the widget chips and the selection menu.
  function routeKind(action) {
    if (action === 'verify') return 'verify';
    if (action === 'save') return 'save';
    if (action === 'ask') return 'open';   // open the widget for a free-form question
    return 'ai';
  }

  // Build the verify-page URL for prefill + auto-run; the matching ?q=/&ref= handler is added to verify.html.
  function verifyUrl(meta) {
    var m = meta || {};
    var url = 'verify.html?mode=hadith&q=' + encodeURIComponent((m.rawText || '').trim());
    if (m.sourceRef) url += '&ref=' + encodeURIComponent(m.sourceRef);
    return url;
  }

  // Persist a highlighted snippet to a unified store (separate from per-item bookmarks).
  function saveSelection(storage, meta) {
    var KEY = 'ii-saved-selections';
    var m = meta || {};
    var text = String(m.rawText || '').trim();
    if (!text) return { saved: false, reason: 'empty' };
    var list;
    try { list = JSON.parse(storage.getItem(KEY) || '[]'); } catch (e) { list = []; }
    if (!Array.isArray(list)) list = [];
    var dup = list.some(function (x) { return x && x.text === text && x.type === (m.type || ''); });
    if (dup) return { saved: false, reason: 'duplicate' };
    list.push({ text: text, type: m.type || '', sourceRef: m.sourceRef || '', ts: m.ts || 0 });
    storage.setItem(KEY, JSON.stringify(list));
    return { saved: true, count: list.length };
  }

  return {
    getOrCreateAnonId: getOrCreateAnonId,
    chipsFor: chipsFor,
    buildAskPayload: buildAskPayload,
    quotaText: quotaText,
    containsVerdictLanguage: containsVerdictLanguage,
    fabBottomOffset: fabBottomOffset,
    parseSSE: parseSSE,
    routeKind: routeKind,
    verifyUrl: verifyUrl,
    saveSelection: saveSelection,
    ANON_KEY: ANON_KEY,
    SCHOLAR_REDIRECT: 'For personal religious guidance, consult a qualified scholar.'
  };
});
