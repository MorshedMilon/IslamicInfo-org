/* ═══════════════════════════════════════════════════════════════════
   IslamicInfo.org — dua-faq-core.js   (Block B4, DUA-PAGE-CONTENT-SPEC §3)
   Pure, framework-free. UMD: window.II.duaFaq in the browser, module.exports
   in Node. NO DOM, NO network.

   WHAT IT MAY USE — only what is already verified and visible on the page:
     • the record's own translation and transliteration
     • the source reference and narrator carried in the corpus
     • the authored A1 prose (page-copy meaning / timing / reflection), already
       owner-reviewed and itself explication of that translation
     • a repetition count ONLY where the Arabic text states one
       (src/js/dua-repetition-core.js — never inferred)

   WHAT IT MAY NEVER DO
     • state a count, time, benefit or virtue not already sourced on the page.
       Every question is GATED on the fact it needs; where the fact is absent the
       question is dropped rather than answered thin.
     • pad. Owner decision 2026-08-02: the 40-word floor is REMOVED. An answer runs
       exactly as long as the genuine per-page fact takes to state. The 80-word
       ceiling stays. The first build padded short answers with shared connective
       sentences ("it appears above as text, not as a picture…"), which put an
       identical 12-gram on 3 of only 5 pilot pages — the same defect as the lede.
       Those connectives are gone, and check-dua-a1-overlap.mjs now bans them by
       name so they cannot return.
     • repeat itself. A sentence used in one answer is never reused in another on
       the same page — a page with little material gets a shorter answer, not a
       duplicated one.
     • fewer than 3 answerable questions => emit NOTHING. §3 requires 3-6.

   `secondary_keywords` supplies the SUBJECTS people search for; it is never pasted
   in as a question. Each keyword is matched to a question type and the question is
   written the way a reader would actually ask it.
   ═══════════════════════════════════════════════════════════════════ */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else { root.II = root.II || {}; root.II.duaFaq = api; }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function words(s) { return String(s || '').split(/\s+/).filter(Boolean); }
  function clean(s) { return String(s || '').replace(/^[("'“]+/, '').replace(/[)"'”]+$/, '').trim(); }
  function firstSentence(s) {
    var t = String(s || '').trim();
    var m = t.match(/^[\s\S]*?[.!?](\s|$)/);
    return (m ? m[0] : t).trim();
  }
  function keyOf(s) { return String(s || '').toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim(); }
  function hash(s) { var h = 0, i; for (i = 0; i < String(s).length; i++) h = (h * 33 + String(s).charCodeAt(i)) >>> 0; return h; }
  function pick(arr, seed) { return arr[seed % arr.length]; }
  /* question and answer leads must not move together, or the 12-gram that spans
     from the question into the answer repeats whenever both pools cycle. */
  function pick2(arr, seed) { return arr[(seed * 7 + 3) % arr.length]; }

  function subjects(secondaryKeywords) {
    var s = String(secondaryKeywords || '').toLowerCase();
    return {
      english: /english|meaning|translat/.test(s),
      translit: /translit|pronounc|roman/.test(s),
      short: /\bshort\b|\bsmall\b/.test(s),
      when: /when|time|after|before|morning|evening|night/.test(s)
    };
  }

  /* ---- question builders: the fact, and nothing else ---- */

  function qMeaning(f, seed) {
    var tr = clean(f.translation);
    if (words(tr).length < 4) return null;
    return { q: pick(['What does this supplication actually say?', 'What is being said in English?',
      'What do these words mean?'], seed),
      a: pick2(['In English it reads: ', 'Translated, it says: ', 'The English of it is: ',
        'Rendered in English: ', 'The translation given here is: ', 'In translation: '], seed) +
         '“' + tr + '”', extra: f.meaningSentence };
  }

  function qTranslit(f, seed) {
    if (!f.transliteration) return null;
    return { q: pick(['How is it pronounced if you cannot read Arabic?', 'Is there a transliteration?',
      'How do you say this in Latin letters?', 'How is this pronounced?', 'Can I read it without Arabic script?',
      'What is the transliteration?'], seed),
      a: pick2(['If you do not read Arabic, the romanised form is: ', 'Written in Latin letters it is: ',
        'For those reading it without Arabic script: ', 'Romanised, it runs: ', 'In Latin script: ',
        'The romanisation used on this page is: ', 'Read without Arabic letters it is: ',
        'Transliterated: '], seed) + '“' + clean(f.transliteration) + '”' };
  }

  function qWhen(f, seed) {
    if (!f.timing) return null;
    return { q: pick(['When is this said?', 'At what point is it recited?', 'When should you say it?'], seed),
      a: f.timing, extra: f.reflectionSentence };
  }

  function qCount(f, seed) {
    if (!f.count) return null;
    return { q: pick(['How many times is it repeated?', 'Is there a set number of repetitions?',
      'How many times should it be said?'], seed),
      a: pick2(['The Arabic text itself marks this to be said ', 'A repetition is stated in the Arabic: it is said ',
        'The wording carries its own count — it is said ', 'The Arabic states a number: ',
        'A count is written into the text — ', 'The source wording gives it as ',
        'Repeated, per the Arabic, ', 'The text sets it at '], seed) + f.count + '.' };
  }

  function qSource(f, seed) {
    if (!f.reference) return null;
    return { q: pick(['Where does this dua come from?', 'What is the source for this?',
      'Which collection records it?'], seed),
      a: pick2(['It is recorded at ', 'The reference given is ', 'This page cites ',
        'The citation carried by our record is ', 'Our source line reads ', 'It is listed at ',
        'Our record gives ', 'The entry is filed at ', 'Cited here as ',
        'The corpus records it at ', 'Referenced as ', 'Carried in our data as '], seed) +
         f.reference + (f.narrator ? ', narrated by ' + f.narrator : '') + '.' };
  }


  /* ---- assembly ---- */
  function buildFaq(f) {
    if (!f) return [];
    var seed = hash(f.id || ''), subj = subjects(f.secondaryKeywords), used = {}, out = [], i, r;

    /* An `extra` sentence is attached only if it has not already been used on this
       page. No sentence appears twice across a page's answers. */
    function emit(r) {
      if (!r) return;
      var a = r.a;
      if (r.extra) {
        var k = keyOf(r.extra);
        if (k && !used[k]) { a = a + ' ' + r.extra; used[k] = 1; }
      }
      used[keyOf(r.a)] = 1;
      var w = words(a);
      if (w.length > 80) {                       // ceiling stays; floor is gone
        var parts = a.split(/(?<=[.!?])\s+/), acc = '';
        for (var j = 0; j < parts.length; j++) {
          if (words(acc + ' ' + parts[j]).length > 80) break;
          acc = acc ? acc + ' ' + parts[j] : parts[j];
        }
        a = acc || parts[0];
      }
      /* An answer must actually answer: it carries quoted text, a number, or a
         clause of real length. Judgement, not a word floor. */
      var substantive = /[“"]/.test(a) || /\d/.test(a) || words(a).length >= 8;
      if (!substantive) return;
      if (!out.some(function (x) { return x.q === r.q; })) out.push({ q: r.q, a: a });
    }

    var built = [
      { on: subj.english !== false, fn: qMeaning },
      { on: subj.translit, fn: qTranslit },
      { on: subj.when, fn: qWhen },
      { on: true, fn: qCount },
      { on: true, fn: qSource },
    ];
    for (i = 0; i < built.length; i++) if (built[i].on) emit(built[i].fn(f, seed + i));
    for (i = 0; i < built.length && out.length < 6; i++) if (!built[i].on) emit(built[i].fn(f, seed + i));
    out = out.slice(0, 6);
    return out.length >= 3 ? out : [];
  }

  return { buildFaq: buildFaq, subjects: subjects, _firstSentence: firstSentence };
}));
