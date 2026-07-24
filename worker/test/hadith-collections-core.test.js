import { test } from 'node:test';
import assert from 'node:assert';
import core from '../../src/js/hadith-collections-core.js';

const META = {
  'sahih-bukhari': { arabicName: 'صحيح البخاري', lifespan: '810–870 CE', motif: '📖', category: 'sittah', featured: true, authLabel: 'Sahih — Highest Standard', authTone: 'sahih' },
  'musnad-ahmad':  { arabicName: 'مسند أحمد', lifespan: '780–855 CE', motif: '📚', category: 'musnad', featured: false, authLabel: 'Mixed Grades', authTone: 'hasan' },
  'mishkat':       { arabicName: 'مشكاة المصابيح', lifespan: 'd. ~741 AH', motif: '🔦', category: 'selected', featured: false, authLabel: 'Mixed Grades', authTone: 'hasan' },
};
const api = { collectionSlug: 'sahih-bukhari', collectionName: 'Sahih Bukhari', compiler: 'Imam Bukhari', hadithCount: 7276, chaptersCount: 99 };

test('mergeCollection: API wins for authoritative fields, meta fills presentation', () => {
  const c = core.mergeCollection(api, META);
  assert.equal(c.slug, 'sahih-bukhari');
  assert.equal(c.nameEnglish, 'Sahih Bukhari');
  assert.equal(c.compiler, 'Imam Bukhari');
  assert.equal(c.hadithCount, 7276);
  assert.equal(c.nameArabic, 'صحيح البخاري');
  assert.equal(c.lifespan, '810–870 CE');
  assert.equal(c.motif, '📖');
  assert.equal(c.category, 'sittah');
  assert.equal(c.featured, true);
  assert.equal(c.authLabel, 'Sahih — Highest Standard');
  assert.equal(c.authTone, 'sahih');
});

test('mergeCollection: missing meta → null presentation fields, no fabrication', () => {
  const c = core.mergeCollection({ collectionSlug: 'unknown-x', collectionName: 'X', hadithCount: null }, META);
  assert.equal(c.nameArabic, null);
  assert.equal(c.lifespan, null);
  assert.equal(c.motif, null);
  assert.equal(c.category, 'other');
  assert.equal(c.featured, false);
  assert.equal(c.authLabel, null);
  assert.equal(c.hadithCount, null);
});

test('inCategory: tab membership', () => {
  const bukhari = core.mergeCollection(api, META);
  const ahmad = core.mergeCollection({ collectionSlug: 'musnad-ahmad', collectionName: 'Musnad Ahmad' }, META);
  const mishkat = core.mergeCollection({ collectionSlug: 'mishkat', collectionName: 'Mishkat' }, META);
  assert.ok(core.inCategory(bukhari, 'all'));
  assert.ok(core.inCategory(bukhari, 'sittah'));
  assert.ok(!core.inCategory(bukhari, 'musnad'));
  assert.ok(core.inCategory(ahmad, 'musnad'));
  assert.ok(core.inCategory(mishkat, 'selected'));
  assert.ok(core.inCategory(mishkat, 'all'));
});

test('aggregateStats: sums confirmable counts, flags partial on null', () => {
  const list = [
    core.mergeCollection({ collectionSlug: 'sahih-bukhari', collectionName: 'B', hadithCount: 7276 }, META),
    core.mergeCollection({ collectionSlug: 'musnad-ahmad', collectionName: 'A', hadithCount: 26000 }, META),
  ];
  const s = core.aggregateStats(list);
  assert.equal(s.collectionCount, 2);
  assert.equal(s.totalHadiths, 33276);
  assert.equal(s.partial, false);
  assert.equal(s.verifiedPct, 100);

  const withNull = list.concat(core.mergeCollection({ collectionSlug: 'mishkat', collectionName: 'M', hadithCount: null }, META));
  const s2 = core.aggregateStats(withNull);
  assert.equal(s2.collectionCount, 3);
  assert.equal(s2.totalHadiths, 33276);
  assert.equal(s2.partial, true);
});

test('formatCountK: locked N,K+ shape and honest fallback', () => {
  assert.deepEqual(core.formatCountK(60123), { lead: '60,', suffix: 'K+' });
  assert.deepEqual(core.formatCountK(7276), { lead: '7,', suffix: 'K+' });
  assert.deepEqual(core.formatCountK(null), { lead: '—', suffix: '' });
  assert.deepEqual(core.formatCountK(0), { lead: '—', suffix: '' });
});

test('formatInt: thousands separators or fallback', () => {
  assert.equal(core.formatInt(7276), '7,276');
  assert.equal(core.formatInt(null), 'Unavailable');
});

test('hotdFields: grade always present, missing → Grade Unknown', () => {
  const good = core.hotdFields({ collectionSlug: 'sahih-bukhari', collectionName: 'Sahih al-Bukhari', bookNumber: 1,
    hadithNumber: 1, arabicMatn: 'إنما الأعمال', translation: { text: 'Actions by intentions' },
    narrator: { name: 'Umar' }, grade: { value: 'sahih', label: 'Sahih', grader: 'Imam al-Bukhari' } });
  assert.equal(good.gradeValue, 'sahih');
  assert.equal(good.gradeLabel, 'Sahih');
  assert.equal(good.grader, 'Imam al-Bukhari');
  assert.equal(good.narrator, 'Umar');
  // Citation "[Collection] [Number]" — hadith number only, no book number, no dot separator.
  assert.equal(good.reference, 'Sahih al-Bukhari 1');
  assert.ok(!/Book|·/.test(good.reference));

  const noGrade = core.hotdFields({ collectionSlug: 'x', collectionName: 'X', hadithNumber: 5,
    arabicMatn: 'a', translation: { text: 'b' }, narrator: { name: null }, grade: null });
  assert.equal(noGrade.gradeValue, 'unknown');
  assert.equal(noGrade.gradeLabel, 'Grade Unknown');
  assert.equal(noGrade.grader, null);
  assert.equal(noGrade.narrator, null);
});

test('mergeCollection: uncurated authTone defaults to unknown (no fabricated sahih signal)', () => {
  const c = core.mergeCollection({ collectionSlug: 'unknown-x', collectionName: 'X' }, META);
  assert.equal(c.authTone, 'unknown');
  assert.equal(c.authLabel, null);
});

test('toneColor maps each grade tone, neutral for unknown/other', () => {
  assert.equal(core.toneColor('sahih'), 'var(--grade-sahih)');
  assert.equal(core.toneColor('hasan'), 'var(--grade-hasan)');
  assert.equal(core.toneColor('daif'), 'var(--grade-daif)');
  assert.equal(core.toneColor('mawdu'), 'var(--grade-mawdu)');
  assert.equal(core.toneColor('unknown'), 'var(--ink-muted)');
  assert.equal(core.toneColor(undefined), 'var(--ink-muted)');
});

test('hotdGradeText: named grader, honest fallback when grader absent, and Grade Unknown', () => {
  assert.equal(core.hotdGradeText({ gradeValue: 'sahih', gradeLabel: 'Sahih', grader: 'Imam al-Bukhari' }), 'Graded Sahih by Imam al-Bukhari');
  assert.equal(core.hotdGradeText({ gradeValue: 'sahih', gradeLabel: 'Sahih', grader: null }), 'Graded Sahih · grader not individually cited');
  assert.equal(core.hotdGradeText({ gradeValue: 'unknown', gradeLabel: 'Grade Unknown', grader: null }), 'Grade Unknown');
});
