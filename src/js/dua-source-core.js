/* ═══════════════════════════════════════════════════════════════════
   IslamicInfo.org — dua-source-core.js
   The ONE place that decides which collection a supplication comes from,
   and what its reference is. Pure, framework-free. UMD: window.II.duaSource
   in the browser, module.exports in Node. NO DOM, NO network.

   WHAT THIS IS — AND IS NOT
   This states provenance only: which compilation lists the supplication, and at
   what reference. It never invents a citation, never grades a narration, and
   never promotes a translator's dataset into a scholarly source. Where the
   compilation gives no reference, none is produced — the caller renders the
   honest "unavailable" line rather than a placeholder.

   WHY IT EXISTS (2026-07-31)
   The corpus assigned `sourceKey` from WHO PRODUCED THE TRANSLATION rather than
   WHICH COLLECTION THE TEXT IS FROM. The two are different facts and had been
   collapsed into one field. The result: 60 of the 506 browse entries rendered a
   non-collection string in the source slot — 15 as "Other source" and 45 as
   "dua-dhikr collection" — and that string reached JSON-LD as `citation`.

   Every one of those 60 carries an `N:M` id, which is Hisn al-Muslim's own
   chapter:entry numbering. Their collection was never unknown; only their
   translator differed (quran.com, fitrahive, AhmedBaset). So the fix is to
   derive the source from the id shape, which is structural and verifiable, and
   to move the translator to the separate attribution line where it belongs.

   Approved by the project owner 2026-07-31 (option "split source from
   translator"). See docs/seo/DUA-URL-SCHEME.md §1.1 for the id shapes.

   PRECEDENCE
     1. verseRef        — an explicit Qur'an reference on the entry.
     2. hadithCitation  — an explicit {book, number, narrator} on the entry.
     3. id shape        — `quran:S:A`, `<collection>:<num>`, or Hisn's `N:M`.
     4. none            — no source claim is made. The caller must say so.
   ═══════════════════════════════════════════════════════════════════ */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else { root.II = root.II || {}; root.II.duaSource = api; }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* The collections that can appear in the source slot. Slugs are URL-visible
     (/duas/source/<slug>.html) — adding or renaming one changes live URLs.
     `other` and `dua-dhikr` are deliberately ABSENT: neither is a collection.
     "dua-dhikr" is the fitrahive translation dataset and "other" was a catch-all;
     both are translator provenance and belong in translationAttribution(). */
  var SOURCES = {
    hisn:     { label: "Hisn al-Muslim" },
    quran:    { label: "The Qur'an" },
    bukhari:  { label: "Sahih al-Bukhari" },
    muslim:   { label: "Sahih Muslim" },
    abudawud: { label: "Sunan Abi Dawud" },
    tirmidhi: { label: "Jami at-Tirmidhi" },
    nasai:    { label: "Sunan an-Nasa'i" },
    ibnmajah: { label: "Sunan Ibn Majah" }
  };

  /* Hisn al-Muslim's own numbering is `chapter:entry`. The chapter number is the
     citable reference; the entry number is an index within it, not a reference. */
  var HISN_ID = /^(\d+):\d+$/;
  var QURAN_ID = /^quran:(\d+):(\d+)$/;
  var COLLECTION_ID = /^([a-z]+):(\d+)$/;

  function labelOf(key) { return SOURCES[key] ? SOURCES[key].label : null; }

  /* Returns { key, label, reference, via } — or key:null when no source can be
     stated. `reference` is null when the collection is known but the specific
     locus is not; callers must not substitute the label for a reference. */
  function assign(entry) {
    var e = entry || {};
    var id = String(e.id == null ? '' : e.id);

    // 1. an explicit Qur'an verse reference on the entry
    if (e.verseRef) {
      return { key: 'quran', label: labelOf('quran'), reference: "Qur'an " + e.verseRef, via: 'verseRef' };
    }

    // 2. an explicit hadith citation on the entry
    var h = e.hadithCitation;
    if (h && typeof h === 'object' && h.book && h.number != null) {
      var m0 = COLLECTION_ID.exec(id);
      var key0 = m0 && SOURCES[m0[1]] ? m0[1] : keyFromLabel(h.book);
      return { key: key0, label: key0 ? labelOf(key0) : String(h.book),
               reference: String(h.book) + " " + String(h.number), via: 'hadithCitation' };
    }

    // 3a. `quran:S:A`
    var q = QURAN_ID.exec(id);
    if (q) return { key: 'quran', label: labelOf('quran'), reference: "Qur'an " + q[1] + ":" + q[2], via: 'id' };

    // 3b. Hisn al-Muslim's `chapter:entry`. Checked BEFORE the generic
    //     `<collection>:<num>` shape, which it would otherwise not match anyway
    //     (a numeric prefix is never a collection slug).
    var hs = HISN_ID.exec(id);
    if (hs) return { key: 'hisn', label: labelOf('hisn'), reference: labelOf('hisn') + " " + hs[1], via: 'id' };

    // 3c. `<collection>:<num>`
    var cm = COLLECTION_ID.exec(id);
    if (cm && SOURCES[cm[1]]) {
      return { key: cm[1], label: labelOf(cm[1]), reference: labelOf(cm[1]) + " " + cm[2], via: 'id' };
    }

    // 4. nothing verifiable — say so rather than guess
    return { key: null, label: null, reference: null, via: 'none' };
  }

  function keyFromLabel(label) {
    var want = String(label == null ? '' : label).toLowerCase();
    for (var k in SOURCES) if (SOURCES[k].label.toLowerCase() === want) return k;
    return null;
  }

  /* The narrator, where the entry records one. Never inferred. */
  function narratorOf(entry) {
    var h = (entry || {}).hadithCitation;
    return (h && typeof h === 'object' && h.narrator) ? String(h.narrator) : null;
  }

  /* Who produced the ENGLISH TRANSLATION. This is a separate fact from the
     source and is rendered on its own attribution line. Returned verbatim from
     the corpus — never parsed into a citation, because these strings sometimes
     mention a hadith locus in passing and reading one out would be an inference,
     not a citation. */
  function translationAttribution(entry) {
    var t = (entry || {}).translationSource;
    return t ? String(t) : null;
  }

  /* True when the entry's `transliteration` field does not hold romanised Arabic
     but English narration prose. 20 corpus entries are affected; without this
     check they poison meta descriptions, which prefer the transliteration.
     Detection is conservative: only unambiguous English narration markers. */
  var NARRATION_PROSE = /\b(said|narrated|reported|related that|the Prophet|Messenger of Allah|went to see|used to|it would be counted)\b/i;
  function transliterationIsProse(entry) {
    var t = (entry || {}).transliteration;
    return !!t && NARRATION_PROSE.test(String(t));
  }
  function usableTransliteration(entry) {
    var t = (entry || {}).transliteration;
    if (!t || transliterationIsProse(entry)) return null;
    return String(t);
  }

  return {
    SOURCES: SOURCES,
    assign: assign,
    labelOf: labelOf,
    narratorOf: narratorOf,
    translationAttribution: translationAttribution,
    transliterationIsProse: transliterationIsProse,
    usableTransliteration: usableTransliteration
  };
}));
