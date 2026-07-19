/* Select-to-Ask — pure, DOM-free logic (UMD). Shared by select-to-ask.js + tests. */
(function (root, factory) {
  var mod = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = mod;
  (root.II = root.II || {}).selectCore = mod;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var MAX_TEXT = 4000;
  var MIN_LEN = 6;

  // data-ai-selectable value -> QuranlyAI context type (drives chips + grounding).
  var TYPE_MAP = { hadith: 'hadith', dua: 'dua', ayah: 'quran', tafsir: 'article', article: 'article' };

  function contextTypeFor(selectable) {
    return TYPE_MAP[selectable] || 'article';
  }

  // Always 5 buttons: Ask QuranlyAI leads; contextual 4th swaps (never hides):
  //   hadith        -> Verify Hadith (routes to the hadith-authenticity flow)
  //   ayah (Quran)  -> Related Verses (charter: raw ayah is excluded from Translate)
  //   tafsir/article/dua -> Translate (machine-translate the selected text)
  // Kind is resolved at click time via quranlyCore.routeKind.
  function menuModel(selectable) {
    var contextual;
    if (selectable === 'hadith') contextual = { action: 'verify', label: 'Verify Hadith' };
    else if (selectable === 'ayah') contextual = { action: 'related_verses', label: 'Related Verses' };
    else contextual = { action: 'translate', label: 'Translate' };
    return [
      { action: 'ask', label: 'Ask QuranlyAI' },
      { action: 'summarize', label: 'Summarize' },
      { action: 'explain', label: 'Explain' },
      contextual,
      { action: 'save', label: 'Save' }
    ];
  }

  function capText(t) {
    return String(t || '').trim().slice(0, MAX_TEXT);
  }

  function eligible(text) {
    return capText(text).length >= MIN_LEN;
  }

  // attrs: { selectable, ref, key } -> selection payload for setContext/route.
  function buildMeta(attrs, rawText, ts) {
    attrs = attrs || {};
    var meta = {
      type: contextTypeFor(attrs.selectable),
      rawText: capText(rawText),
      sourceRef: attrs.ref || '',
      ts: ts || 0
    };
    var key = attrs.key || '';
    if (key.indexOf(':') !== -1) {
      var p = key.split(':');
      if (p[0]) meta.surah = +p[0];
      if (p[1]) meta.ayah = +p[1];
    }
    return meta;
  }

  return {
    MIN_LEN: MIN_LEN,
    MAX_TEXT: MAX_TEXT,
    contextTypeFor: contextTypeFor,
    menuModel: menuModel,
    capText: capText,
    eligible: eligible,
    buildMeta: buildMeta
  };
});
