'use strict';
const test = require('node:test');
const assert = require('node:assert');
const core = require('../../src/js/quran-verses-core.js');

test('sanitizeTranslation strips sup footnotes and tags', () => {
  assert.equal(
    core.sanitizeTranslation('In the name of Allah,<sup foot_note=195932>1</sup> the Merciful.'),
    'In the name of Allah, the Merciful.');
  assert.equal(core.sanitizeTranslation('Plain text'), 'Plain text');
  assert.equal(core.sanitizeTranslation('<i>x</i> y'), 'x y');
});

test('wbwWords keeps words, drops end markers, maps ar/en', () => {
  const out = core.wbwWords([
    { char_type_name: 'word', text_uthmani: 'بِسْمِ', translation: { text: 'In (the) name' } },
    { char_type_name: 'end',  text_uthmani: '١',      translation: { text: '(1)' } }
  ]);
  assert.deepEqual(out, [{ ar: 'بِسْمِ', en: 'In (the) name' }]);
});

test('pickTranslation selects by resource_id, falls back to first', () => {
  const t = [{ resource_id: 85, text: 'A' }, { resource_id: 20, text: 'B' }];
  assert.equal(core.pickTranslation(t, 20), 'B');
  assert.equal(core.pickTranslation(t, 999), 'A');
  assert.equal(core.pickTranslation([], 20), '');
});

test('normalizeVerse shape', () => {
  const v = core.normalizeVerse({
    verse_key: '1:2', verse_number: 2, text_uthmani: 'ٱلْحَمْدُ',
    text_uthmani_tajweed: '<tajweed class=ghunnah>ٱلْحَمْدُ</tajweed>',
    translations: [{ resource_id: 20, text: 'All praise<sup foot_note=1>x</sup>' }],
    words: [{ char_type_name: 'word', text_uthmani: 'ٱلْحَمْدُ', translation: { text: 'All praises' } }]
  }, 20);
  assert.equal(v.verse_key, '1:2');
  assert.equal(v.text_uthmani, 'ٱلْحَمْدُ');
  assert.equal(v.text_uthmani_tajweed, '<tajweed class=ghunnah>ٱلْحَمْدُ</tajweed>');
  assert.equal(v.translation, 'All praise');
  assert.deepEqual(v.words, [{ ar: 'ٱلْحَمْدُ', en: 'All praises' }]);
});

test('showBismillah true except Surah 9', () => {
  assert.equal(core.showBismillah(1), true);
  assert.equal(core.showBismillah(2), true);
  assert.equal(core.showBismillah(9), false);
});

test('versesCacheKey + isFresh', () => {
  assert.equal(core.versesCacheKey(2, 20), 'ii-verses-2-20');
  const now = 1e12;
  assert.equal(core.isFresh(now - 23 * 3600e3, now), true);
  assert.equal(core.isFresh(now - 25 * 3600e3, now), false);
});

test('attributionText format', () => {
  const s = core.attributionText(
    { verseKey: '1:2', arabic: 'ٱلْحَمْدُ', translation: 'All praise' },
    'Al-Fatihah', 'Saheeh International', 'https://x/quran?surah=al-fatihah');
  assert.equal(s,
    'All praise\nٱلْحَمْدُ\n\n— Al-Fatihah 1:2 · Saheeh International\nhttps://x/quran?surah=al-fatihah');
});

test('editionName maps 20, falls back', () => {
  assert.equal(core.editionName(20), 'Saheeh International');
  assert.equal(core.editionName(99999), 'Translation');
});

// ── Task 7: translation catalog helpers ──

test('isRtlLanguage: rtl langs, combined strings, ltr', () => {
  assert.equal(core.isRtlLanguage('urdu'), true);
  assert.equal(core.isRtlLanguage('Persian'), true);
  assert.equal(core.isRtlLanguage('divehi, dhivehi, maldivian'), true); // combined API string
  assert.equal(core.isRtlLanguage('uighur, uyghur'), true);
  assert.equal(core.isRtlLanguage('english'), false);
  assert.equal(core.isRtlLanguage('french'), false);
  assert.equal(core.isRtlLanguage(''), false);
  assert.equal(core.isRtlLanguage(null), false);
});

test('normalizeTranslation: API item → compact record, dir from language', () => {
  assert.deepEqual(
    core.normalizeTranslation({ id: 20, name: 'Saheeh International',
      author_name: 'Saheeh International', language_name: 'english' }),
    { id: 20, name: 'Saheeh International', language: 'english',
      languageLabel: 'English', dir: 'ltr' });
  const ur = core.normalizeTranslation({ id: 97, name: 'x',
    author_name: 'Syed Abu Ali Maududi', language_name: 'urdu' });
  assert.equal(ur.dir, 'rtl');
  assert.equal(ur.name, 'Syed Abu Ali Maududi'); // prefers author_name
  // falls back to name, then to a synthesized label
  assert.equal(core.normalizeTranslation({ id: 5, name: 'OnlyName', language_name: 'x' }).name, 'OnlyName');
  assert.equal(core.normalizeTranslation({ id: 7 }).name, 'Translation 7');
  // Roman/transliterated Urdu carries an RTL language_name but Latin script → force LTR
  assert.equal(core.normalizeTranslation({ id: 831, name: 'Roman Urdu',
    slug: 'maududi-roman-urdu', language_name: 'urdu' }).dir, 'ltr');
  assert.equal(core.normalizeTranslation({ id: 57, author_name: 'Transliteration',
    language_name: 'english' }).dir, 'ltr');
});

test('groupTranslationsByLanguage: english first, then alpha; items by name', () => {
  const list = [
    core.normalizeTranslation({ id: 2, author_name: 'Zeta', language_name: 'french' }),
    core.normalizeTranslation({ id: 3, author_name: 'Alpha', language_name: 'french' }),
    core.normalizeTranslation({ id: 4, author_name: 'Beta', language_name: 'english' }),
    core.normalizeTranslation({ id: 5, author_name: 'Amir', language_name: 'urdu' })
  ];
  const g = core.groupTranslationsByLanguage(list);
  assert.deepEqual(g.map(x => x.language), ['english', 'french', 'urdu']);
  assert.equal(g[0].languageLabel, 'English');
  assert.deepEqual(g[1].items.map(x => x.name), ['Alpha', 'Zeta']); // sorted within group
});

test('filterTranslations: matches name/language, empty query returns all', () => {
  const list = [
    core.normalizeTranslation({ id: 20, author_name: 'Saheeh International', language_name: 'english' }),
    core.normalizeTranslation({ id: 45, author_name: 'Elmir Kuliev', language_name: 'russian' })
  ];
  assert.equal(core.filterTranslations(list, 'kuliev').length, 1);
  assert.equal(core.filterTranslations(list, 'RUSSIAN')[0].id, 45);
  assert.equal(core.filterTranslations(list, 'saheeh')[0].id, 20);
  assert.equal(core.filterTranslations(list, '').length, 2);
  assert.equal(core.filterTranslations(list, 'zzz').length, 0);
});

test('translationsCacheKey', () => {
  assert.equal(core.translationsCacheKey(), 'ii-quran-translations-list');
});

// ── Task 7b: compare helpers ──

test('pickCompareSet: curated-popular first, then catalog order, capped at n', () => {
  const cat = [
    core.normalizeTranslation({ id: 85, author_name: 'Haleem', language_name: 'english' }),
    core.normalizeTranslation({ id: 20, author_name: 'Saheeh', language_name: 'english' }),
    core.normalizeTranslation({ id: 19, author_name: 'Pickthall', language_name: 'english' }),
    core.normalizeTranslation({ id: 999, author_name: 'Obscure', language_name: 'english' }),
    core.normalizeTranslation({ id: 45, author_name: 'Kuliev', language_name: 'russian' })
  ];
  // english curated order [20,19,22,85,...] → 20,19,85 present; 22 absent skipped
  assert.deepEqual(core.pickCompareSet(cat, 'english', 3).map(t => t.id), [20, 19, 85]);
  // fewer than n available → returns what exists
  assert.deepEqual(core.pickCompareSet(cat, 'russian', 3).map(t => t.id), [45]);
  // uncurated language falls back to catalog order
  const un = [
    core.normalizeTranslation({ id: 301, author_name: 'B', language_name: 'swahili' }),
    core.normalizeTranslation({ id: 300, author_name: 'A', language_name: 'swahili' })
  ];
  assert.deepEqual(core.pickCompareSet(un, 'swahili', 3).map(t => t.id), [301, 300]); // uncurated → preserves catalog order (no re-sort)
  assert.deepEqual(core.pickCompareSet(cat, 'nonexistent', 3), []);
});

test('orderCompareTexts: aligns to requested id order, sanitizes, fills gaps', () => {
  const tr = [
    { resource_id: 19, text: 'Pickthall<sup>1</sup> text' },
    { resource_id: 20, text: 'Saheeh text' }
  ];
  assert.deepEqual(core.orderCompareTexts(tr, [20, 19, 85]), [
    { id: 20, text: 'Saheeh text' },
    { id: 19, text: 'Pickthall text' },
    { id: 85, text: '' }
  ]);
  assert.deepEqual(core.orderCompareTexts([], [20]), [{ id: 20, text: '' }]);
});

test('POPULAR_BY_LANG uses verified ids, english default first', () => {
  assert.equal(core.POPULAR_BY_LANG.english[0], 20);
  assert.ok(core.POPULAR_BY_LANG.urdu.includes(97));
});
