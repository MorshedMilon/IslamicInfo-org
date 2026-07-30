/* ═══════════════════════════════════════════════════════════════════
   IslamicInfo.org — dua-occasion-core.js
   The ONE place that decides which occasion bucket a supplication belongs to.
   Pure, framework-free. UMD: window.II.duaOccasion in the browser,
   module.exports in Node. NO DOM, NO network.

   WHAT THIS IS — AND IS NOT
   The occasion facet is NAVIGATION, derived by us. It is not a source claim and
   it never overrides, replaces or edits the entry's own chapter label, citation
   or grading, all of which stay on the card exactly as the compilation gives
   them. Nothing here invents Arabic, a translation or a reference.

   WHY IT EXISTS (2026-07-29)
   The buckets used to exist only as values baked into search-corpus.json by a
   script that was never committed, so they could not be re-derived or audited —
   and they had drifted: 24 entries whose own chapter names an occasion sat in a
   contradicting bucket (Ayat al-Kursi, the before-sleeping duas and nine prayer
   duas were all filed under "Food & Drink"). This module is that missing script,
   checked in, with worker/test/dua-occasion-core.test.js asserting the corpus
   still matches what the rules produce.

   PRECEDENCE
     1. chapter  — the entry's own chapter label, when that label names an
                   occasion. A book chapter ("Kitab al-Da'awat", "Kitab al-Witr")
                   names a place in a collection, not an occasion, so it is
                   skipped — as the corpus facet note already stated.
     2. text     — the supplication's own English meaning.
     3. fallback — 'general'. An entry is never forced into a bucket to pad it.
   Within each layer the FIRST matching rule wins, so the tables are ordered
   most-specific-first ("Funeral prayer" must be read as a funeral, not a prayer).
   ═══════════════════════════════════════════════════════════════════ */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else { root.II = root.II || {}; root.II.duaOccasion = api; }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* The 20 published buckets. Slugs are URL-visible
     (/duas/occasion/<slug>.html) — adding or renaming one changes live URLs. */
  var BUCKETS = {
    'hajj-umrah':       { label: 'Hajj & Umrah',             icon: '🕋' },
    'fasting':          { label: 'Fasting & Ramadan',        icon: '🌙' },
    'travel':           { label: 'Travel',                   icon: '🧳' },
    'food-drink':       { label: 'Food & Drink',             icon: '🍽️' },
    'home-clothing':    { label: 'Home & Clothing',          icon: '🏠' },
    'family-children':  { label: 'Family & Children',        icon: '👶' },
    'weather-nature':   { label: 'Weather & Nature',         icon: '🌧️' },
    'morning-evening':  { label: 'Morning & Evening',        icon: '🌅' },
    'sleep-waking':     { label: 'Sleep & Waking',           icon: '🛌' },
    'funeral-illness':  { label: 'Illness, Death & Funeral', icon: '🤍' },
    'prayer':           { label: 'Prayer (Salah)',           icon: '🕌' },
    'protection':       { label: 'Protection & Refuge',      icon: '🛡️' },
    'distress':         { label: 'Distress & Anxiety',       icon: '⚡' },
    'forgiveness':      { label: 'Forgiveness & Repentance', icon: '🤲' },
    'guidance':         { label: 'Guidance & Seeking Good',  icon: '🧭' },
    'provision':        { label: 'Provision & Wellbeing',    icon: '🌿' },
    'social':           { label: 'Greetings & Social',       icon: '🤝' },
    'quran-recitation': { label: "Qur'an & Recitation",      icon: '📖' },
    'praise-dhikr':     { label: 'Praise & Remembrance',     icon: '✨' },
    'general':          { label: 'General Supplications',    icon: '🤍' }
  };

  /* A chapter label that only locates the entry inside a collection. */
  var BOOK_CHAPTER = /kitab\s*al|^the book on\b|^chapters on supplication\b/i;

  /* ---- layer 1: the chapter names the occasion ---- */
  var CHAPTER_RULES = [
    // Hajj before prayer/fasting: the Day of Arafat is a Hajj station, and the
    // Black Stone / Safa chapters would otherwise be swallowed by other rules.
    ['hajj-umrah',      /hajj|umrah|pilgrim|black stone|yemenite corner|safa and marwah|day of arafat|talbiyah|ihram/i],
    // Funeral before prayer: "Invocations for the dead in the Funeral prayer".
    ['funeral-illness', /funeral|the dead|dying person|deceased|burying|grave|bereaved|terminal ill|visiting the sick|closing the eyes|tragedy strikes|pain in your body/i],
    // Sujud al-tilawah is occasioned by reciting, not by salah.
    ['quran-recitation',/recitation of the qur|reciting the qur/i],
    ['sleep-waking',    /before sleeping|go to sleep|when you wake up|waking up|stir in the night|bad dream|nightmare/i],
    ['morning-evening', /morning and evening/i],
    ['prayer',          /prayer|salah|sujood|prostrat|ruki|tash-?ahhud|tashahhud|qunut|witr|athan|call to prayer|ablution|mosque/i],
    ['fasting',         /fasting|breaking the fast|break your fast|ramadan/i],
    ['food-drink',      /eating|drink|dinner guest|his host|first dates|slaughtering|sacrificing/i],
    ['travel',          /travel|journey|vehicle|mount begins|layover|entering a town or city|riding in a/i],
    ['weather-nature',  /rain|wind blows|thunder|new moon/i],
    ['home-clothing',   /the home|restroom|new clothes|getting dressed|undressing/i],
    ['family-children', /new parents|for children|the groom|wedding night|intercourse|a child\b/i],
    // Named threats sit in Protection; a human adversary is Distress (worry),
    // matching where those chapters already sat.
    ['protection',      /against an enemy|false messiah|shirk|evil portent|evil eye|afflict something with the|foil the devil|devil and his promptings|harm you|stricken by/i],
    ['distress',        /anguish|worry and grief|adversary|oppression of rulers|a debt|becoming difficult|surprised or startled|frightened/i],
    ['social',          /salam|sneez|greeting|praise another muslim|community life|does good to you|spoken ill|i love you|bless you|forgive you/i],
    ['provision',       /lends you|share of his wealth/i],
    ['forgiveness',     /repentance and seeking forgiveness|commit a sin/i],
    ['guidance',        /istikharah|counsel/i],
    ['praise-dhikr',    /excellence of remembering allah|glorifying and magnifying/i]
  ];

  /* ---- layer 2: the supplication's own meaning ----
     Occasion-specific wording first, then themes. A dua that names a journey is
     a travel dua even though it also asks for refuge; "seek refuge" is far too
     common to be allowed to claim everything it appears in. */
  var TEXT_RULES = [
    ['hajj-umrah',      /\bhajj\b|umrah|pilgrimage|arafah|arafat|the sacred house|ka'?bah/i],
    // Travel must be the subject, not a passing word: "distance me from my sins
    // as You have distanced the East from the West" is not a travel dua.
    ['travel',          /companion on the journey|journey of mine|(?:this|our|his|the) journey|our journeys|hardships of travel|when we are travel/i],
    ['morning-evening', /this morning|this evening|enter(?:ed)? the morning|enter(?:ed)? the evening|entered upon the morning|reached the evening/i],
    ['sleep-waking',    /\bsleep\b|i lie down|on my side|\bawaken/i],
    ['food-drink',      /\bfood\b|\beat\b|\bdrink\b|\bfed (?:me|us|him)/i],
    ['weather-nature',  /\brain\b|\bwind\b|thunder/i],
    ['funeral-illness', /\bcure\b|heal(?:ing)? |remove the harm|the sick\b|his grave|widen his grave|cause me to die|when I die/i],
    ['protection',      /seek refuge|seeks protection|protect me|protect us|protect him|be for me a protector|(?:from|against) the evil of|evil of what|punishment of the grave|punishment of hell|punishment of the fire|torment of the fire|shayat|shaytan|satan|the devil|accursed/i],
    ['forgiveness',     /forgive|forgiveness|pardon|repent|wronged myself|my sins/i],
    ['family-children', /offspring|progeny|descendants|\bchild\b|\bchildren\b|my sons?\b|barren|my parents|our wives|our spouses/i],
    ['guidance',        /guide me|guide us|guidance|beneficial knowledge|increase me in knowledge|righteous course|right course|make it easy for me/i],
    ['provision',       /provision|sustenance|lawful|my wealth|good health|well-?being|bless.{0,20}wealth/i],
    ['distress',        /anxiety|grief|sorrow|worry|distress|hardship|relieve|burden|\bdebt\b|oppress|overpowered by men|laziness|cowardice/i],
    ['praise-dhikr',    /glory (?:be )?to|how perfect|all praise|praise (?:is|be) to|glorified|alone, without partner|remembrance|the most great/i],
    // Deliberately narrow: "recite" and "Your verses" also appear in verses that
    // ask for a messenger, which are not recitation supplications.
    ['quran-recitation',/qur'?an/i],
    ['prayer',          /in my prayer|of my prayer|my prostration/i]
  ];

  function firstMatch(rules, hay) {
    for (var i = 0; i < rules.length; i++) if (rules[i][1].test(hay)) return rules[i];
    return null;
  }

  /* assign(entry) -> { slug, via: 'chapter'|'text'|'fallback', rule }
     `rule` is the pattern source that fired, so a bucket a reader disagrees with
     can be traced to one line of one table instead of being argued about. */
  function assign(entry) {
    var e = entry || {};
    var cat = String(e.category == null ? '' : e.category);
    if (cat && !BOOK_CHAPTER.test(cat)) {
      var c = firstMatch(CHAPTER_RULES, cat);
      if (c) return { slug: c[0], via: 'chapter', rule: String(c[1]) };
    }
    var text = String(e.translation == null ? '' : e.translation);
    if (text) {
      var t = firstMatch(TEXT_RULES, text);
      if (t) return { slug: t[0], via: 'text', rule: String(t[1]) };
    }
    return { slug: 'general', via: 'fallback', rule: null };
  }

  /* The facet block written into the corpus meta, so meta and rules cannot drift. */
  function bucketList() {
    return Object.keys(BUCKETS).map(function (s) { return { slug: s, label: BUCKETS[s].label }; });
  }

  return { BUCKETS: BUCKETS, CHAPTER_RULES: CHAPTER_RULES, TEXT_RULES: TEXT_RULES, assign: assign, bucketList: bucketList };
}));
