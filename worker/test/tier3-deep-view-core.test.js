import { test } from 'node:test';
import assert from 'node:assert';
import core from '../../src/js/tier3-deep-view-core.js';

/* Fixture mirrors the normalized hadith shape (worker/src/lib/hadith-adapter.js).
   Live hadithapi always yields a single EN translation, grader:null,
   isnad.narrators:[], topics:[], alternateGradings:[]. */
function bukhari(over = {}) {
  return Object.assign({
    collectionSlug: 'sahih-bukhari', collectionName: 'Sahih al-Bukhari',
    bookNumber: 1, bookName: 'Revelation', hadithNumber: 1,
    reference: 'Sahih al-Bukhari · Book 1 · Hadith 1',
    arabicMatn: 'إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ',
    translation: { text: 'The reward of deeds depends upon the intentions.', language: 'en', edition: 'hadithapi.com', translator: null },
    narrator: { id: null, name: "Narrated 'Umar ibn al-Khattab:", arabicName: null },
    grade: { value: 'sahih', label: 'Sahih', grader: null, disputed: false, alternateGradings: [] },
    isnad: { status: 'unavailable', narrators: [] },
    topics: [],
  }, over);
}

test('translationModel: single EN translation → one entry, English label', () => {
  const m = core.translationModel(bukhari());
  assert.equal(m.length, 1);
  assert.equal(m[0].lang, 'en');
  assert.equal(m[0].label, 'English');
  assert.match(m[0].text, /reward of deeds/);
});

test('translationModel: AR-tagged provider translation is treated as EN (no fabricated language)', () => {
  const m = core.translationModel(bukhari({ translation: { text: 'x', language: 'ar' } }));
  assert.equal(m.length, 1);
  assert.equal(m[0].lang, 'en');
});

test('translationModel: multiple editions sort into canonical EN·UR·FR·ID·TR order', () => {
  const m = core.translationModel(bukhari({
    translations: [{ text: 'tr', language: 'tr' }, { text: 'ur', language: 'ur' }],
  }));
  assert.deepEqual(m.map((x) => x.lang), ['en', 'ur', 'tr']);
});

test('translationModel: empty payload → empty array, never throws', () => {
  assert.deepEqual(core.translationModel(null), []);
  assert.deepEqual(core.translationModel({}), []);
  assert.deepEqual(core.translationModel({ translation: { text: '' } }), []);
});

test('chooseLang: honors preferred when present, else first available', () => {
  const m = core.translationModel(bukhari({ translations: [{ text: 'ur', language: 'ur' }] }));
  assert.equal(core.chooseLang(m, 'ur'), 'ur');
  assert.equal(core.chooseLang(m, 'fr'), 'en');   // preferred absent → first
  assert.equal(core.chooseLang([], 'en'), null);
});
