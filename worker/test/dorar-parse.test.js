import { test } from 'node:test';
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { parseDorarResult, buildSilsilaReference } from '../src/lib/dorar-parse.js';

const BLOCK = (over = {}) => `
  <div class="hadith" style="text-align:justify;">1 -   ${'matn' in over ? over.matn : 'إنما الأعمال بالنيات'}</div>
  <div class="hadith-info">
    <span class="info-subtitle">الراوي:</span> ${over.rawi ?? 'عائشة أم المؤمنين'}</span>
    <span class="info-subtitle">المحدث:</span> ${over.mohdith ?? 'الألباني'}
    <span class="info-subtitle">المصدر:</span>  ${over.book ?? 'السلسلة الصحيحة'}
    <span class="info-subtitle">الصفحة أو الرقم:</span>  ${'num' in over ? over.num : '6/778'}
    <span class="info-subtitle">خلاصة حكم المحدث:</span>  <span >${'ruling' in over ? over.ruling : 'رجاله ثقات رجال مسلم إلا أنه منقطع'}</span>
  </div>`;

test('buildSilsilaReference: verbatim ref when present, collection-only when absent', () => {
  assert.equal(buildSilsilaReference('6/778'), 'Al-Silsilah al-Sahihah — 6/778');
  assert.equal(buildSilsilaReference('52'), 'Al-Silsilah al-Sahihah — 52');
  assert.equal(buildSilsilaReference(''), 'Al-Silsilah al-Sahihah');
  assert.equal(buildSilsilaReference(null), 'Al-Silsilah al-Sahihah');
});

test('parseDorarResult returns one normalized Silsila item (ruling verbatim, page-style ref)', () => {
  const items = parseDorarResult(BLOCK());
  assert.equal(items.length, 1);
  const it = items[0];
  assert.match(it.arabicMatn, /إنما الأعمال بالنيات/);
  assert.ok(!/^\s*1\s*-/.test(it.arabicMatn));
  assert.equal(it.narrator, 'عائشة أم المؤمنين');
  assert.equal(it.ruling, 'رجاله ثقات رجال مسلم إلا أنه منقطع');
  assert.equal(it.grader, 'الألباني');
  assert.equal(it.rulingSource, 'Dorar.net');
  assert.equal(it.collectionSlug, 'al-silsila-sahiha');
  assert.equal(it.numberOrPage, '6/778');
  assert.equal(it.reference, 'Al-Silsilah al-Sahihah — 6/778');
  assert.equal(it.grade, undefined);
});

test('parseDorarResult: falls back to درجة الحديث when it is the only ruling label', () => {
  const html = `
    <div class="hadith">1 - متن</div>
    <div class="hadith-info">
      <span class="info-subtitle">المحدث:</span> الألباني
      <span class="info-subtitle">المصدر:</span> السلسلة الصحيحة
      <span class="info-subtitle">درجة الحديث:</span> صحيح
    </div>`;
  const it = parseDorarResult(html)[0];
  assert.equal(it.ruling, 'صحيح');
});

test('parseDorarResult: no number at all → reference is collection-only', () => {
  const items = parseDorarResult(BLOCK({ num: '' }));
  assert.equal(items[0].numberOrPage, null);
  assert.equal(items[0].reference, 'Al-Silsilah al-Sahihah');
});

test('parseDorarResult drops a block whose book is not Silsila (scope safety net)', () => {
  assert.equal(parseDorarResult(BLOCK({ book: 'صحيح البخاري' })).length, 0);
});

test('parseDorarResult drops a block with no matn or no ruling (never half-parsed)', () => {
  assert.equal(parseDorarResult(BLOCK({ matn: '' })).length, 0);
  assert.equal(parseDorarResult(BLOCK({ ruling: '' })).length, 0);
});

test('parseDorarResult handles the real captured fixture: 1 item, ruling + reference set', () => {
  const d = JSON.parse(readFileSync(new URL('./fixtures/dorar-silsila-api.json', import.meta.url)));
  const items = parseDorarResult(d.ahadith.result);
  assert.equal(items.length, 1);
  assert.equal(items[0].grader, 'الألباني');
  assert.match(items[0].ruling, /رجاله ثقات/);
  assert.equal(items[0].numberOrPage, '6/778');
  assert.equal(items[0].reference, 'Al-Silsilah al-Sahihah — 6/778');
});
