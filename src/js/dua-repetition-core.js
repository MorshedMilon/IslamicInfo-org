/* ═══════════════════════════════════════════════════════════════════
   IslamicInfo.org — dua-repetition-core.js
   Reads a repetition count that the ARABIC TEXT ITSELF states. Pure,
   framework-free. UMD: window.II.duaRepetition in the browser, module.exports
   in Node. NO DOM, NO network.

   Some corpus entries carry a short parenthetical in the arabic field stating how
   many times the words are said — e.g. (سبع مرات) — which the English translation
   dropped. Nothing here is ever inferred:
     • only the exact expressions in COUNTS are recognised, after diacritics are
       stripped; anything else produces no count at all
     • a parenthetical longer than 5 words is skipped outright, because the long
       ones hold dua or hadith text (which often *mentions* a number in passing)
       rather than a recitation rubric
     • the alternatives are joined with "or" only when the Arabic itself has أو
   Approved by the owner 2026-07-30.

   This lives in its own module so scripts/build-dua-pages.mjs and
   scripts/check-dua-page-copy.mjs run the SAME code. The checker used to recover
   it by string-slicing the builder source, which silently broke the moment the
   builder was reordered.
   ═══════════════════════════════════════════════════════════════════ */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else { root.II = root.II || {}; root.II.duaRepetition = api; }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var DIACRITICS = /[ً-ْـ]/g;

  var COUNTS = {
    "ثلاثا": "three times",
    "ثلاث مرات": "three times",
    "أربع مرات": "four times",
    "سبع مرات": "seven times",
    "عشر مرات": "ten times",
    "مائة مرة": "one hundred times",
    "ثلاثا وثلاثين": "thirty-three times",
    "أربعا وثلاثين": "thirty-four times",
    "مرة واحدة عند الكسل": "once if tired",
    "مائة مرة إذا أصبح": "one hundred times in the morning",
    "ثلاث مرات إذا أصبح": "three times in the morning",
    "ثلاث مرات إذا أمسى": "three times in the evening",
    "مائة مرة في اليوم": "one hundred times a day"
  };

  /* Returns an English phrase such as "three times", or null when the Arabic
     states no recognised count. */
  function arabicCounts(entry) {
    var a = String((entry || {}).arabic || "").replace(DIACRITICS, "");
    var out = [];
    var found = a.match(/[([][^()[\]]*[)\]]/g) || [];
    for (var i = 0; i < found.length; i++) {
      var inner = found[i].slice(1, -1).trim();
      if (inner.split(/\s+/).length > 5) continue; // long parenthetical = text, not a rubric
      var en = COUNTS[inner];
      if (en && out.indexOf(en) === -1) out.push(en);
    }
    var joiner = out.length === 2 && /\bأو\b|أَوْ/.test(String((entry || {}).arabic)) ? ", or " : ", ";
    return out.length ? out.join(joiner) : null;
  }

  return { COUNTS: COUNTS, DIACRITICS: DIACRITICS, arabicCounts: arabicCounts };
}));
