import { test } from 'node:test';
import assert from 'node:assert';
import { normalizeGrade, normalizeBook, normalizeHadith } from '../src/lib/hadith-adapter.js';

test('normalizeGrade maps known statuses', () => {
  assert.equal(normalizeGrade('Sahih').value, 'sahih');
  assert.equal(normalizeGrade('Hasan').value, 'hasan');
  assert.equal(normalizeGrade("Da'eef").value, 'daif');
});

test('normalizeGrade never drops the badge on missing/blank status', () => {
  const g = normalizeGrade('');
  assert.equal(g.value, 'unknown');
  assert.equal(g.label, 'Grade Unknown');
  assert.equal(g.disputed, false);
});

test('normalizeBook maps the ASSUMPTION source shape', () => {
  const raw = { bookName: 'Sahih Bukhari', bookSlug: 'sahih-bukhari',
    writerName: 'Imam Bukhari', hadiths_count: '7563', chapters_count: '97' };
  const b = normalizeBook(raw);
  assert.equal(b.collectionSlug, 'sahih-bukhari');
  assert.equal(b.collectionName, 'Sahih Bukhari');
  assert.equal(b.hadithCount, 7563);
  assert.equal(b.chaptersCount, 97);
});

test('normalizeHadith fills required fields and marks enrichment unavailable', () => {
  const raw = {
    hadithNumber: '1', hadithArabic: 'إنما الأعمال بالنيات',
    hadithEnglish: 'Actions are by intentions', englishNarrator: 'Umar ibn al-Khattab',
    status: 'Sahih', book: { bookSlug: 'sahih-bukhari', bookName: 'Sahih Bukhari' },
    chapter: { chapterNumber: '1', chapterEnglish: 'Revelation' },
  };
  const h = normalizeHadith(raw, { language: 'en' });
  assert.equal(h.source, 'hadithapi');
  assert.equal(h.collectionSlug, 'sahih-bukhari');
  assert.equal(h.hadithNumber, 1);
  assert.equal(h.arabicMatn, 'إنما الأعمال بالنيات');
  assert.equal(h.translation.text, 'Actions are by intentions');
  assert.equal(h.grade.value, 'sahih');
  assert.equal(h.narrator.name, 'Umar ibn al-Khattab');
  assert.equal(h.isnad.status, 'unavailable');
  assert.equal(h.audio.status, 'unavailable');
  assert.ok(h.sourceMetadata.contentHash.length > 0);
});

test('normalizeHadith with no status still renders an unknown badge', () => {
  const h = normalizeHadith({ hadithNumber: 5, hadithArabic: 'x', hadithEnglish: 'y',
    book: { bookSlug: 'sahih-muslim' } }, {});
  assert.equal(h.grade.value, 'unknown');
  assert.equal(h.grade.label, 'Grade Unknown');
});
