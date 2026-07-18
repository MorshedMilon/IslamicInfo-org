/* Pure grounding builder. Takes the compiled index data + cores as `data`, returns
   { found, text } — verified source text to inject into the prompt, or a
   not-documented sentinel. Never fabricates. */

export const GROUNDED_ACTIONS = new Set(['related_verses', 'related_hadith', 'vocabulary']);

const NOT_DOCUMENTED = 'not documented in available sources';

function notDocumented() {
  return { found: false, text: NOT_DOCUMENTED };
}

export function buildGrounding(action, verseKey, data) {
  if (action === 'related_verses') {
    const rows = data.relatedCore.relatedVerses(verseKey, data.relatedTopics, data.verseIndex, { limit: 8 });
    if (!rows.length) return notDocumented();
    const lines = rows.map((r) => `- ${r.ref} — "${r.translation}" (${r.translator}). Source: ${r.sourceCitation}`);
    return { found: true, text: 'Verified related verses:\n' + lines.join('\n') };
  }

  if (action === 'related_hadith') {
    const rows = data.hadithCore.relatedHadith(verseKey, data.hadithTopics, data.verseIndex, { limit: 5 });
    if (!rows.length) return notDocumented();
    const lines = rows.map((r) => `- ${r.ref} (${r.grade}, graded by ${r.gradedBy}): "${r.english}" Source: ${r.url}`);
    return { found: true, text: 'Verified related hadith:\n' + lines.join('\n') };
  }

  if (action === 'vocabulary') {
    const rows = data.vocabCore.keyTermsForVerse(verseKey, data.topicTerms, data.verseIndex, data.terms);
    if (!rows.length) return notDocumented();
    const lines = rows.map((r) => `- ${r.translit} (${r.arabic}): ${r.shortDef}`);
    return { found: true, text: 'Verified key terms:\n' + lines.join('\n') };
  }

  // asbab_al_nuzul and any other action have no grounding dataset.
  return notDocumented();
}
