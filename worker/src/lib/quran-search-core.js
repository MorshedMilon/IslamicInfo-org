/* IslamicInfo.org — quran-search-core.js
   Pure, diacritic-insensitive Qur'an keyword search over an ingested corpus.
   No I/O. ESM named exports (tested directly; imported by quran-search.js). */

// tashkeel + superscript alef + quranic annotation signs + tatweel
// (explicit \uXXXX escapes -- a literal-glyph range here previously parsed as
// U+061A-U+0670, which swallows core Arabic letters like alef/ra/ha/mim/lam/nun;
// always use numeric escapes for Arabic-block ranges, never literal characters)
const AR_DIACRITICS = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g;
const AR_COMBINING  = /[\u0300-\u036F]/g;

export function normalizeArabic(s) {
  return String(s == null ? '' : s)
    .replace(AR_DIACRITICS, '')
    .replace(/[\u0622\u0623\u0625\u0671]/g, '\u0627') // alef variants (madda/hamza-above/hamza-below/wasla) -> plain alef
    .replace(/\u0629/g, '\u0647')                     // ta marbuta -> ha
    .replace(/\u0649/g, '\u064A')                     // alef maksura -> ya
    .replace(/[\u0624\u0626]/g, '\u0621')              // waw/ya-hamza -> bare hamza
    .replace(/\s+/g, ' ').trim();
}

export function normalizeLatin(s) {
  return String(s == null ? '' : s)
    .normalize('NFD').replace(AR_COMBINING, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ').trim();
}

export function isArabic(s) { return /[\u0600-\u06FF]/.test(String(s || '')); }

function normalizeQuery(s) { return isArabic(s) ? normalizeArabic(s) : normalizeLatin(s); }

export function tokenize(s) { return normalizeQuery(s).split(' ').filter(Boolean); }

export function searchCorpus(verses, q, opts) {
  opts = opts || {};
  const page = opts.page > 0 ? Math.floor(opts.page) : 1;
  const limit = opts.limit > 0 ? Math.min(Math.floor(opts.limit), 50) : 20;
  const arabicQuery = isArabic(q);
  const tokens = tokenize(q);
  const norm = normalizeQuery(q);
  const matches = [];
  if (tokens.length) {
    for (const v of verses) {
      const hay = arabicQuery ? normalizeArabic(v.arabic) : normalizeLatin(v.translation);
      let all = true;
      for (const t of tokens) { if (hay.indexOf(t) === -1) { all = false; break; } }
      if (all) matches.push({ v, score: hay.indexOf(norm) !== -1 ? 2 : 1 });
    }
    matches.sort((a, b) =>
      b.score !== a.score ? b.score - a.score
      : a.v.surah !== b.v.surah ? a.v.surah - b.v.surah
      : a.v.ayah - b.v.ayah);
  }
  const total = matches.length;
  const totalPages = total ? Math.ceil(total / limit) : 0;
  const start = (page - 1) * limit;
  return { total, page, totalPages, limit, results: matches.slice(start, start + limit).map(m => m.v) };
}
