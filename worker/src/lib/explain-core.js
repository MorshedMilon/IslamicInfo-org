/* Pure helpers for /api/explain (hadith AI explanation). No DOM, no network, no KV.
   Labeled-text parsing is used instead of Gemini JSON mode (see DECISIONS Module 13 #5):
   the hadith-explain user prompt asks for four "### LABEL" blocks; we parse them here in
   this NON-governed module so gemini.js / the system prompt / safety.js stay untouched. */
import { verdictLangDetected } from './safety.js';

export const EXPLAIN_FALLBACK = 'Unable to generate explanation for this hadith.';

// Site's supported explanation languages (mirror the i18n set; en is always the fallback).
export const SUPPORTED_EXPLAIN_LANGS = new Set(['en', 'ar', 'ur', 'id', 'tr', 'fr', 'bn', 'es', 'ru', 'de']);

export function normalizeLang(lang) {
  const l = typeof lang === 'string' ? lang.trim().toLowerCase() : '';
  return SUPPORTED_EXPLAIN_LANGS.has(l) ? l : 'en';
}

export function explainCacheKey(ref, lang) {
  return `hadith_explain:${ref}:${normalizeLang(lang)}`;
}

// Non-global regexes so .exec() yields a stable .index for the first occurrence of each label.
const SECTION_LABELS = [
  ['summary', /###\s*SUMMARY[^\n]*\n?/i],
  ['vocabulary', /###\s*VOCABULARY[^\n]*\n?/i],
  ['context', /###\s*CONTEXT[^\n]*\n?/i],
  ['lesson', /###\s*LESSON[^\n]*\n?/i],
];

export function parseExplainSections(text) {
  const src = String(text || '');
  const out = { summary: '', vocabulary: '', context: '', lesson: '' };
  const markers = [];
  for (const [key, re] of SECTION_LABELS) {
    const m = re.exec(src);
    if (m) markers.push({ key, start: m.index, end: m.index + m[0].length });
  }
  if (!markers.length) {
    out.summary = src.trim();
    return out;
  }
  markers.sort((a, b) => a.start - b.start);
  for (let i = 0; i < markers.length; i++) {
    const cur = markers[i];
    const next = markers[i + 1];
    out[cur.key] = src.slice(cur.end, next ? next.start : src.length).trim();
  }
  return out;
}
