/* Worker-only wiring: bundle the compiled index JSON + pure cores into one `data`
   object for grounding.js. esbuild/wrangler inlines the JSON at build time, so
   grounding is a local call with zero network. Rebundle (redeploy) when data changes. */
import relatedCore from '../../../src/js/quran-related-core.js';
import hadithCore from '../../../src/js/quran-related-hadith-core.js';
import vocabCore from '../../../src/js/quran-vocab-core.js';

// Plain JSON imports (no `with { type: 'json' }` attribute): wrangler's esbuild bundles
// .json natively and rejects the import-attribute syntax. This file is Worker-only
// (bundled by wrangler), so it is never imported by the Node test runner.
import relatedTopics from '../../../src/data/related-verses/topics.json';
import verseIndex from '../../../src/data/related-verses/verse-index.json';
import hadithTopics from '../../../src/data/related-hadith/topics.json';
import terms from '../../../src/data/vocab/terms.json';
import topicTerms from '../../../src/data/vocab/topic-terms.json';

export const groundingData = {
  relatedCore, hadithCore, vocabCore,
  relatedTopics, verseIndex, hadithTopics, terms, topicTerms,
};
