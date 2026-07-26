/* IslamicInfo.org — dua-search-core.js
   Pure keyword search over the ingested Hisn al-Muslim corpus.
   Reuses the diacritic-insensitive normalizers from quran-search-core. */
import { isArabic, normalizeArabic, normalizeLatin } from './quran-search-core.js';

function tokens(norm) { return norm.split(' ').filter(Boolean); }

export function searchDuas(duas, q, opts) {
  opts = opts || {};
  const page = opts.page > 0 ? Math.floor(opts.page) : 1;
  const limit = opts.limit > 0 ? Math.min(Math.floor(opts.limit), 50) : 20;
  const arabicQuery = isArabic(q);
  const norm = arabicQuery ? normalizeArabic(q) : normalizeLatin(q);
  const toks = tokens(norm);
  const matches = [];
  if (toks.length) {
    for (const d of duas) {
      const hay = arabicQuery
        ? normalizeArabic(d.arabic)
        : normalizeLatin((d.translation || '') + ' ' + (d.category || '') + ' ' + (d.transliteration || ''));
      let all = true;
      for (const t of toks) { if (hay.indexOf(t) === -1) { all = false; break; } }
      if (all) matches.push({ d, score: hay.indexOf(norm) !== -1 ? 2 : 1 });
    }
    matches.sort((a, b) => b.score !== a.score ? b.score - a.score : String(a.d.id).localeCompare(String(b.d.id)));
  }
  const total = matches.length;
  const totalPages = total ? Math.ceil(total / limit) : 0;
  const start = (page - 1) * limit;
  return { total, page, totalPages, limit, results: matches.slice(start, start + limit).map(m => m.d) };
}
