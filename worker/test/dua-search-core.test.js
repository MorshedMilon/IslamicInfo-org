import { test } from 'node:test';
import assert from 'node:assert';
import { searchDuas } from '../src/lib/dua-search-core.js';

const DUAS = [
  { id:'1:1', category:'Supplications for when you wake up', arabic:'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا', transliteration:'Alhamdu lillahil-lathee ahyana', translation:'All praise is for Allah who gave us life after having taken it from us.' },
  { id:'2:5', category:'What to say when seeking forgiveness', arabic:'أَسْتَغْفِرُ اللَّهَ', transliteration:'Astaghfirullah', translation:'I seek the forgiveness of Allah.' },
  { id:'3:9', category:'Supplication before sleeping', arabic:'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا', transliteration:'Bismika Allahumma amootu wa-ahya', translation:'In Your name O Allah, I live and die.' },
];

test('English query matches translation', () => {
  const r = searchDuas(DUAS, 'forgiveness', {});
  assert.strictEqual(r.total, 1);
  assert.strictEqual(r.results[0].id, '2:5');
});
test('English query matches by category name', () => {
  const r = searchDuas(DUAS, 'sleeping', {});
  assert.strictEqual(r.total, 1);
  assert.strictEqual(r.results[0].id, '3:9');
});
test('Arabic query matches diacritic-insensitively', () => {
  const r = searchDuas(DUAS, 'استغفر', {});
  assert.strictEqual(r.total, 1);
  assert.strictEqual(r.results[0].id, '2:5');
});
test('token-AND + non-match', () => {
  assert.strictEqual(searchDuas(DUAS, 'praise Allah', {}).total, 1);
  assert.strictEqual(searchDuas(DUAS, 'zebra', {}).total, 0);
});
test('pagination', () => {
  const r = searchDuas(DUAS, 'Allah', { page:1, limit:2 });
  assert.ok(r.total >= 2);
  assert.strictEqual(r.results.length, 2);
  assert.strictEqual(r.totalPages, Math.ceil(r.total/2));
});
