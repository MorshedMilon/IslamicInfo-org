/* ═══════════════════════════════════════════════════════════════════
   IslamicInfo.org — hadith-topics-core.js  (Module 11)
   Pure taxonomy + co-occurrence logic for the hadith Topic index/landing.
   UMD (window.II.hadithTopics / module.exports). NO DOM/network/storage.
   TOPICS = the 14 real hero-strip chips (PRD US-H06/H14 name only these 14;
   the PRD's "16" is an unresolved gap — 2 topics unnamed, NOT invented here).
   No per-topic counts/collections (no data source — deferred to curation).
   ═══════════════════════════════════════════════════════════════════ */
(function (root) {
  'use strict';

  var TOPICS = [
    { key: 'faith',        label: 'Faith & Belief',       keyword: 'faith' },
    { key: 'prayer',       label: 'Prayer (Salah)',       keyword: 'prayer' },
    { key: 'charity',      label: 'Charity (Zakat)',      keyword: 'charity' },
    { key: 'fast',         label: 'Fasting (Sawm)',       keyword: 'fast' },
    { key: 'hajj',         label: "Hajj & 'Umrah",        keyword: 'hajj' },
    { key: 'purification', label: 'Purification',         keyword: 'purification' },
    { key: 'knowledge',    label: 'Knowledge & Wisdom',   keyword: 'knowledge' },
    { key: 'character',    label: 'Ethics & Character',   keyword: 'character' },
    { key: 'marriage',     label: 'Family & Marriage',    keyword: 'marriage' },
    { key: 'supplication', label: 'Supplications',        keyword: 'supplication' },
    { key: 'hereafter',    label: 'Afterlife & Judgment', keyword: 'hereafter' },
    { key: 'trade',        label: 'Trade & Finance',      keyword: 'trade' },
    { key: 'death',        label: 'Death & Burial',       keyword: 'death' },
    { key: 'justice',      label: 'Governance & Justice', keyword: 'justice' },
  ];

  var BY_KEY = {};
  TOPICS.forEach(function (t) { BY_KEY[t.key] = t; });

  function topicByKey(key) { return BY_KEY[key] || null; }
  function isTopicKey(key) { return Object.prototype.hasOwnProperty.call(BY_KEY, key); }

  // Over the loaded hadith whose text contains the current topic's keyword, count how
  // many ALSO contain each OTHER topic's keyword. Returns others with count>=1, sorted
  // count desc then label asc. Matching = case-insensitive substring (same shallow
  // heuristic as the feed's keyword filter — a text signal, NOT a curated relationship).
  function coOccurringTopics(loadedHadith, topicKeyword, topics) {
    topics = topics || TOPICS;
    var kw = String(topicKeyword == null ? '' : topicKeyword).toLowerCase();
    if (!kw) return [];
    var texts = (Array.isArray(loadedHadith) ? loadedHadith : [])
      .map(function (h) { return String((h && h.text) || '').toLowerCase(); })
      .filter(function (t) { return t.indexOf(kw) !== -1; });
    if (!texts.length) return [];
    var out = [];
    topics.forEach(function (t) {
      if (!t || !t.keyword) return;
      var uk = String(t.keyword).toLowerCase();
      if (uk === kw) return;                       // exclude the current topic
      var count = 0;
      texts.forEach(function (txt) { if (txt.indexOf(uk) !== -1) count++; });
      if (count > 0) out.push({ key: t.key, label: t.label, count: count });
    });
    out.sort(function (a, b) {
      return (b.count - a.count) || (a.label < b.label ? -1 : a.label > b.label ? 1 : 0);
    });
    return out;
  }

  var core = {
    TOPICS: TOPICS, topicByKey: topicByKey, isTopicKey: isTopicKey,
    coOccurringTopics: coOccurringTopics,
  };

  if (typeof module !== 'undefined' && module.exports) { module.exports = core; }
  else { root.II = root.II || {}; root.II.hadithTopics = core; }

}(typeof globalThis !== 'undefined' ? globalThis : window));
