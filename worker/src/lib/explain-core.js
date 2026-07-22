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
// Anchored to line start (^ with the m flag; [ \t]* tolerates indentation) so a label that
// appears mid-sentence inside a section's body (e.g. the model echoing "### LESSON" in prose)
// is not mistaken for a real heading.
const SECTION_LABELS = [
  ['summary', /^[ \t]*###\s*SUMMARY[^\n]*\n?/im],
  ['vocabulary', /^[ \t]*###\s*VOCABULARY[^\n]*\n?/im],
  ['context', /^[ \t]*###\s*CONTEXT[^\n]*\n?/im],
  ['lesson', /^[ \t]*###\s*LESSON[^\n]*\n?/im],
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

// The DoD-10 gate: runs the shared verdict filter on the FULL model text BEFORE parsing,
// so no flagged/refused text ever reaches the client — not even inside a section field.
export function applyExplainSafety(result) {
  const text = result && typeof result.text === 'string' ? result.text : '';
  if (!text.trim() || (result && result.refusal)) {
    return { safe: false, fallback: EXPLAIN_FALLBACK };
  }
  if (verdictLangDetected(text)) {
    return { safe: false, fallback: EXPLAIN_FALLBACK };
  }
  return { safe: true, ...parseExplainSections(text) };
}
