/* dua-clause-core.js — isolating the recitable supplication from a source record.
 *
 * Pure, UMD, no DOM and no network, matching src/js/dua-occasion-core.js.
 *
 * WHY THIS EXISTS
 * Several corpus records store more than the supplication in `arabic`. A page that renders
 * the whole field presents a chain of narrators, or a narrative frame, or a neighbouring
 * āyah, as the words to recite. Four distinct shapes were found during the Session 0.6–0.7
 * integrity work, and they were being handled by four ad-hoc probe scripts. This is the one
 * module.
 *
 * WHAT IT WILL NOT DO
 *  - It never writes over `arabic`. Output goes to a separate field; the source is evidence
 *    and stays byte-identical.
 *  - It never returns a "verified" result. Every extraction carries the shape that ran and a
 *    confidence, and every one requires a human ruling before a page may render it
 *    (DUA-CONTENT-INTEGRITY-v1_0; validator rule R3).
 *  - It never infers an anchor for SHAPE_VERSE_FROM_BUNDLE. That anchor is supplied per
 *    record by a reviewer, because picking the wrong āyah out of a bundle is silent and
 *    unrecoverable.
 *
 * SHAPES
 *   classb-isnad      hadith-collection record; arabic is the full narration incl. isnad
 *   quran-clause      full āyah where the supplication is one clause of a longer verse
 *   verse-from-bundle record holding more than one āyah; the target must be anchored
 *   prefix-trim       recitable text preceded by material that is not part of it
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.IIDuaClause = factory();
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var SHAPES = {
    CLASS_B: 'classb-isnad',
    QURAN_CLAUSE: 'quran-clause',
    VERSE_FROM_BUNDLE: 'verse-from-bundle',
    PREFIX_TRIM: 'prefix-trim'
  };

  /* Diacritics are stripped only to LOCATE a boundary; every returned string is sliced out
     of the original text unmodified. The range must include 0653-0655 (maddah, hamza above,
     hamza below) or "لَّآ" normalises to "لآ" and never matches "لا" — that single gap made
     an earlier probe report 1/25 instead of 24/25. */
  var DIAC = /[ً-ٰٕـۖ-ۭ‏‎]/;

  function normalise(s) {
    var out = '', map = [], i, c;
    for (i = 0; i < s.length; i++) {
      if (DIAC.test(s[i])) continue;
      c = s[i];
      if ('أإآٱ'.indexOf(c) !== -1) c = 'ا';
      if (c === 'ى') c = 'ي';
      if (c === 'ة') c = 'ه';
      out += c; map.push(i);
    }
    return { out: out, map: map };
  }

  /* ---- shape detection --------------------------------------------------- */
  var ISNAD = /حدثنا|أخبرنا|حدثني|أخبرني/;
  /* Qur'anic passages quoted inside a Hisn record are fenced with the ornate brackets
     U+FD3E/U+FD3F, not with "((" — 27:75 (Ayat al-Kursi, printed after a taʿawwudh) is the
     case that exposed this. Both fences must be recognised or the record falls through
     detection entirely and silently renders its prefix. */
  var TAAWWUDH = /اعوذ\s+بالله\s+من\s+الشيطان\s+الرجيم/;
  function fenceAt(ar) {
    var a = ar.indexOf('(('), b = ar.indexOf('﴿');
    if (a === -1) return b; if (b === -1) return a;
    return Math.min(a, b);
  }

  function detectShape(entry, opts) {
    var e = entry || {}, o = opts || {};
    if (o.anchor) return SHAPES.VERSE_FROM_BUNDLE;
    var ar = String(e.arabic == null ? '' : e.arabic);
    if (!ar) return null;
    var isQuran = String(e.id || '').indexOf('quran:') === 0;
    if (!isQuran && ar.indexOf('((') === -1 && ISNAD.test(normalise(ar).out)) return SHAPES.CLASS_B;
    if (isQuran) return SHAPES.QURAN_CLAUSE;
    /* Recitable text preceded by material that is not part of it: a narrator's frame ahead
       of a ((delimited)) dua (106:218), or a taʿawwudh ahead of a ﴿quoted﴾ passage (27:75). */
    if (TAAWWUDH.test(normalise(ar).out)) return SHAPES.PREFIX_TRIM;
    if (fenceAt(ar) > 0) return SHAPES.PREFIX_TRIM;
    return null;
  }

  /* ---- shape 1: classb-isnad --------------------------------------------- */
  /* The collection datasets wrap the Prophet's words in U+0022. An instruction can sit
     inside the same quote ahead of the dua ("…فليقل: اللهم…"), so trim at the reporting
     verb when one is followed by an address to Allah. */
  var SAY = /(فليقل|فليقول|فقولوا|فقل|قولوا|يقول|قال)\s+(?=الل|رب|اعوذ|لا اله|سبحان|بسم|الحمد|حسبنا)/;
  var ADDRESS = /^(اللهم|رب|ربنا|اعوذ|لا اله|سبحان|بسم|الحمد|حسبنا)/;

  function extractClassB(entry) {
    var ar = String(entry.arabic || ''), spans = [], m;
    var rx = /"([^"]{6,})"/g;
    while ((m = rx.exec(ar)) !== null) spans.push(m[1].replace(/[‏‎]/g, '').trim());
    if (!spans.length) return fail(SHAPES.CLASS_B, 'no quoted span in the source');

    var scored = spans.map(function (s) {
      var n = normalise(s), say = n.out.match(SAY);
      if (say && say.index !== undefined)
        return { text: s.slice(n.map[say.index + say[0].length] || 0).trim(),
                 via: 'trimmed at a reporting verb', confidence: 'medium' };
      if (ADDRESS.test(n.out.replace(/^\s+/, '')))
        return { text: s, via: 'span opens with an address to Allah', confidence: 'medium' };
      return { text: s, via: 'longest quoted span; no marker matched', confidence: 'low' };
    });
    var best = null, i;
    for (i = 0; i < scored.length; i++) if (scored[i].confidence === 'medium') { best = scored[i]; break; }
    if (!best) best = scored.sort(function (a, b) { return b.text.length - a.text.length; })[0];
    return ok(SHAPES.CLASS_B, best.text, best.via, best.confidence, { spans: spans.length });
  }

  /* ---- shape 2: quran-clause --------------------------------------------- */
  /* Ordered most-specific-first. A bare رب matches inside رَبَّنَا too, so it is last. */
  var VOCATIVE = [
    ['ربنا', /ربنا/], ['رب (with space)', /\bرب\s/], ['اللهم', /اللهم/], ['حسبنا', /حسبنا/],
    ['لا اله الا انت', /لا اله الا انت/], ['اني مسني', /اني مسني/], ['رب (anywhere)', /رب/]
  ];

  function extractQuranClause(entry) {
    var ar = String(entry.arabic || ''), n = normalise(ar), i, m;
    for (i = 0; i < VOCATIVE.length; i++) {
      m = n.out.match(VOCATIVE[i][1]);
      if (m && m.index !== undefined) {
        var text = ar.slice(n.map[m.index]).trim();
        /* A clause that is the entire āyah means no narrative frame was present — true of
           many short supplication verses, and not a defect. Flagged so a reviewer can tell
           "nothing to trim" apart from "trimmed correctly". */
        var whole = text.length >= ar.trim().length;
        return ok(SHAPES.QURAN_CLAUSE, text, 'first vocative marker: ' + VOCATIVE[i][0],
          'medium', { wholeAyah: whole, pctOfAyah: Math.round(100 * text.length / ar.length) });
      }
    }
    return fail(SHAPES.QURAN_CLAUSE, 'no vocative marker — the verse may not be a petition');
  }

  /* ---- shape 3: verse-from-bundle ---------------------------------------- */
  /* A record holding more than one āyah. The first vocative in the field can belong to the
     WRONG verse — 28:101 holds 2:285 and 2:286, and 2:285 ends "غُفْرَانَكَ رَبَّنَا"، so a
     naive shape-2 pass lands in the previous āyah. The anchor is therefore required and is
     never guessed: a reviewer states which words open the target verse. */
  function extractVerseFromBundle(entry, anchor) {
    if (!anchor) return fail(SHAPES.VERSE_FROM_BUNDLE, 'no anchor supplied — refusing to guess which āyah');
    var ar = String(entry.arabic || ''), n = normalise(ar), a = normalise(String(anchor));
    var at = n.out.indexOf(a.out);
    if (at === -1) return fail(SHAPES.VERSE_FROM_BUNDLE, 'anchor not found in the record');
    if (n.out.indexOf(a.out, at + 1) !== -1)
      return fail(SHAPES.VERSE_FROM_BUNDLE, 'anchor appears more than once — it does not identify one āyah');
    return ok(SHAPES.VERSE_FROM_BUNDLE, ar.slice(n.map[at]).trim(),
      'sliced at a reviewer-supplied anchor', 'medium', { anchor: String(anchor) });
  }

  /* ---- shape 4: prefix-trim ---------------------------------------------- */
  /* Two sub-cases, both "the recitable text is preceded by something that is not it":
       a) a taʿawwudh printed ahead of a Qur'anic passage (27:75)
       b) a narrator's frame ahead of a ((delimited)) dua (106:218 and 18 others) */
  function extractPrefixTrim(entry) {
    var ar = String(entry.arabic || ''), n = normalise(ar);
    var t = n.out.match(TAAWWUDH);
    if (t && t.index !== undefined) {
      var after = n.map[t.index + t[0].length];
      /* Drop the ornate Qur'an fence too — it marks a quotation, it is not recited. */
      var rest = ar.slice(after).replace(/^[\s،.:﴿]+/, '').replace(/[﴾\s]+$/, '').trim();
      return ok(SHAPES.PREFIX_TRIM, rest, 'removed the taʿawwudh printed ahead of the passage',
        'medium', { removed: ar.slice(0, after).trim() });
    }
    var open = ar.indexOf('((');
    if (open > 0) {
      /* FIRST delimiter pair, not the last. 106:218 carries two duas in one record — one for
         news that pleases you and one for news that does not — and reaching for the last
         `))` returned both spans with the intervening narration still between them. Where a
         record holds more than one delimited dua the extraction cannot be trusted to have
         picked the right one, so the count is reported and confidence drops. */
      var close = ar.indexOf('))', open + 2);
      var inner = close > open ? ar.slice(open + 2, close) : ar.slice(open + 2);
      var pairs = (ar.match(/\(\(/g) || []).length;
      /* Always LOW. A four-record spot check found the delimiter is not a reliable boundary
         in either direction:
           13:20   text before "((" is an instruction  -> correct to drop
           96:207  text before "((" is the takbīr and Qur'anic opening of the travel dua
                   -> dropping it destroys half the supplication
           26:74   the ONLY "((" span is the instruction; the istikhāra dua is not in it
                   -> keeping the span returns the wrong text
         Single-span is therefore no guarantee, which is why this is not graded on span
         count. What was removed is always reported so a reviewer sees the decision. */
      return ok(SHAPES.PREFIX_TRIM, inner.trim(),
        'took the ' + (pairs > 1 ? 'FIRST of ' + pairs + ' ' : '') + '((delimited)) span — verify BOTH what was kept and what was removed',
        'low',
        { removed: ar.slice(0, open).trim(), delimitedSpans: pairs });
    }
    return fail(SHAPES.PREFIX_TRIM, 'no removable prefix found');
  }

  /* ---- result helpers ---------------------------------------------------- */
  function ok(shape, text, via, confidence, extra) {
    var r = { ok: true, shape: shape, text: text, via: via, confidence: confidence,
              needsReview: true, verified: false };
    if (extra) for (var k in extra) if (extra.hasOwnProperty(k)) r[k] = extra[k];
    return r;
  }
  function fail(shape, why) {
    return { ok: false, shape: shape, text: null, why: why, confidence: 'none',
             needsReview: true, verified: false };
  }

  /* ---- entry point -------------------------------------------------------
     extract(entry, opts) -> result
       opts.shape  force a shape instead of detecting one
       opts.anchor required for verse-from-bundle; supplying it also selects that shape

     `needsReview` is true on every result including the successes. Nothing this module
     returns may be rendered until a reviewer sets `verified`. */
  function extract(entry, opts) {
    var e = entry || {}, o = opts || {};
    var shape = o.shape || detectShape(e, o);
    if (!shape) return fail(null, 'no extraction shape applies to this record');
    if (shape === SHAPES.CLASS_B) return extractClassB(e);
    if (shape === SHAPES.QURAN_CLAUSE) return extractQuranClause(e);
    if (shape === SHAPES.VERSE_FROM_BUNDLE) return extractVerseFromBundle(e, o.anchor);
    if (shape === SHAPES.PREFIX_TRIM) return extractPrefixTrim(e);
    return fail(shape, 'unknown shape');
  }

  return { SHAPES: SHAPES, detectShape: detectShape, extract: extract, normalise: normalise };
}));
