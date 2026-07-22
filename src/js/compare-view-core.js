/* ═══════════════════════════════════════════════════════════════════
   IslamicInfo.org — compare-view-core.js  (Module 15)
   Pure builders + diff for Hadith Comparison Mode (2–3 items). NO DOM,
   NO network. §0 honesty: word-diff runs ONLY on arabicMatn (the
   narration); translations are shown but NEVER diff-highlighted; the
   chain-diverge (◆) layer is computed by diffChains but DORMANT in prod
   (isnad data is universally absent) — an honest "not yet available"
   note is shown instead. UMD (window.II.compareViewCore | module.exports).
   ═══════════════════════════════════════════════════════════════════ */
(function (root) {
  'use strict';
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  var MAX_COMPARE = 3;

  /* ── selection Set logic (ordered, deduped, capped) ── */
  function addRef(list, ref) {
    var arr = Array.isArray(list) ? list.slice() : [];
    if (!ref || arr.indexOf(ref) !== -1) return { list: arr, added: false, full: arr.length >= MAX_COMPARE };
    if (arr.length >= MAX_COMPARE) return { list: arr, added: false, full: true };
    arr.push(ref);
    return { list: arr, added: true, full: arr.length >= MAX_COMPARE };
  }
  function removeRef(list, ref) { return (Array.isArray(list) ? list : []).filter(function (r) { return r !== ref; }); }
  function canCompare(list) { return (Array.isArray(list) ? list : []).length >= 2; }

  /* ── URL ref (de)serialization ── */
  function serializeRefs(refs) { return (Array.isArray(refs) ? refs : []).filter(Boolean).join(','); }
  function parseRefs(param) {
    var out = [], seen = {};
    String(param == null ? '' : param).split(',').forEach(function (r) {
      r = r.trim();
      if (!r || seen[r] || out.length >= MAX_COMPARE) return;
      seen[r] = 1; out.push(r);
    });
    return out;
  }

  /* ── Arabic tokenization + normalization (comparison key only; display uses raw) ──
     Strips Quranic annotation signs (U+0610–U+061A), harakat/tanwin (U+064B–U+065F),
     superscript alef (U+0670), and tatweel (U+0640); then drops anything that is not a
     letter or number. This is why whitespace / punctuation / diacritic-only differences
     never produce a false-positive highlight (VERIFICATION NOTE). */
  function normalizeArabicToken(tok) {
    return String(tok == null ? '' : tok)
      .replace(/[ؐ-ًؚ-ٰٟـ]/g, '')
      .replace(/[^\p{L}\p{N}]/gu, '')
      .trim();
  }
  function tokenizeMatn(text) {
    return String(text == null ? '' : text).split(/\s+/).filter(function (s) { return s.length; })
      .map(function (raw) { return { raw: raw, key: normalizeArabicToken(raw) }; });
  }

  // Classic LCS over normalized keys. Tokens inside the longest common subsequence are
  // "shared" (flag false); the rest differ (flag true). Empty keys (pure punctuation
  // tokens) are forced non-differing so they never highlight.
  function diffTwo(aTokens, bTokens) {
    var a = (aTokens || []).map(function (t) { return t.key; });
    var b = (bTokens || []).map(function (t) { return t.key; });
    var n = a.length, m = b.length, i, j;
    var dp = []; for (i = 0; i <= n; i++) { dp.push(new Array(m + 1).fill(0)); }
    for (i = 1; i <= n; i++) for (j = 1; j <= m; j++) {
      dp[i][j] = (a[i - 1] !== '' && a[i - 1] === b[j - 1]) ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
    var af = new Array(n).fill(true), bf = new Array(m).fill(true);
    i = n; j = m;
    while (i > 0 && j > 0) {
      if (a[i - 1] !== '' && a[i - 1] === b[j - 1]) { af[i - 1] = false; bf[j - 1] = false; i--; j--; }
      else if (dp[i - 1][j] >= dp[i][j - 1]) i--; else j--;
    }
    for (i = 0; i < n; i++) if (a[i] === '') af[i] = false;
    for (j = 0; j < m; j++) if (b[j] === '') bf[j] = false;
    return { a: af, b: bf };
  }

  // N-way (order-independent) diff: a token is "shared" only if its normalized key is
  // present (frequency-aware) in EVERY list; otherwise it differs. Honest signal
  // "this word isn't in all N". Empty keys never flag.
  function diffMany(tokenLists) {
    var lists = (tokenLists || []).map(function (t) { return (t || []).map(function (x) { return x.key; }); });
    function counts(arr) { var m = {}; arr.forEach(function (k) { if (k !== '') m[k] = (m[k] || 0) + 1; }); return m; }
    var cs = lists.map(counts);
    var common = {};
    Object.keys(cs[0] || {}).forEach(function (k) {
      var min = cs[0][k];
      for (var i = 1; i < cs.length; i++) { var c = cs[i][k] || 0; if (c < min) min = c; }
      if (min > 0) common[k] = min;
    });
    return lists.map(function (arr) {
      var budget = Object.assign({}, common);
      return arr.map(function (k) {
        if (k === '') return false;
        if (budget[k] > 0) { budget[k]--; return false; }
        return true;
      });
    });
  }

  // Dispatcher: 2 lists → order-aware LCS (tighter); N>2 → shared-token model.
  function computeDiff(tokenLists) {
    tokenLists = tokenLists || [];
    if (tokenLists.length === 2) { var d = diffTwo(tokenLists[0], tokenLists[1]); return [d.a, d.b]; }
    return diffMany(tokenLists);
  }

  // DORMANT chain-diverge. Computes, per narrator position, whether narrators differ
  // across the compared chains, and whether all chains are identical (sameChain). Only
  // invoked by the DOM layer when EVERY compared hadith has a non-empty isnad.narrators
  // array — which never happens with today's data, so prod always renders the honest
  // "isnad comparison not yet available" note instead. Unit-tested against mocks so it
  // lights up automatically once narrator data lands.
  function narratorKey(n) { n = n || {}; return String(n.id || n.fullName || n.arabicName || '').trim(); }
  function diffChains(isnadArrays) {
    var chains = (isnadArrays || []).map(function (a) { return Array.isArray(a) ? a : []; });
    var same = chains.every(function (c) { return c.length === (chains[0] ? chains[0].length : 0); });
    var maxLen = chains.reduce(function (mx, c) { return Math.max(mx, c.length); }, 0);
    if (same) {
      for (var p = 0; p < maxLen && same; p++) {
        var k0 = narratorKey(chains[0][p]);
        for (var c = 1; c < chains.length; c++) { if (narratorKey(chains[c][p]) !== k0) { same = false; break; } }
      }
    }
    var diverge = chains.map(function (chain) {
      return chain.map(function (n, pos) {
        var k = narratorKey(n);
        for (var i = 0; i < chains.length; i++) { if (narratorKey(chains[i][pos] || {}) !== k) return true; }
        return false;
      });
    });
    return { diverge: diverge, sameChain: same };
  }

  var core = {
    esc: esc, MAX_COMPARE: MAX_COMPARE,
    addRef: addRef, removeRef: removeRef, canCompare: canCompare,
    serializeRefs: serializeRefs, parseRefs: parseRefs,
    normalizeArabicToken: normalizeArabicToken, tokenizeMatn: tokenizeMatn, diffTwo: diffTwo,
    diffMany: diffMany, computeDiff: computeDiff,
    diffChains: diffChains,
  };

  if (typeof module !== 'undefined' && module.exports) { module.exports = core; }
  else { root.II = root.II || {}; root.II.compareViewCore = core; }

}(typeof globalThis !== 'undefined' ? globalThis : window));
