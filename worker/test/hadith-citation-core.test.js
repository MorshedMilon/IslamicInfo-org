import { test } from 'node:test';
import assert from 'node:assert';
import core from '../../src/js/hadith-citation-core.js';

/* Shared scholarly-citation builder. Contract: "[Collection Name] [Hadith Number]"
   — hadith number ONLY (no book/chapter number), proper collection name (never a
   raw slug), never a backend vendor name. */

test('buildReference: uses the collectionName the provider already normalized', () => {
  assert.equal(core.buildReference({ collectionName: 'Sahih al-Bukhari', hadithNumber: 5063 }), 'Sahih al-Bukhari 5063');
});

test('buildReference: maps a direct-source slug to its full display name (never the raw slug)', () => {
  assert.equal(core.buildReference({ collectionSlug: 'riyad-assalihin', hadithNumber: 1 }), 'Riyad as-Saliheen 1');
  assert.equal(core.buildReference({ collectionSlug: 'nawawi40', hadithNumber: 1 }), '40 Hadith Nawawi 1');
});

test('buildReference: hadith number ONLY — no book/chapter number even when present', () => {
  const r = core.buildReference({ collectionName: 'Sahih al-Bukhari', bookNumber: 78, hadithNumber: 5063 });
  assert.equal(r, 'Sahih al-Bukhari 5063');
  assert.ok(!/Book|78|·/.test(r));
});

test('buildReference: collectionName wins over the slug map', () => {
  // Provider gave a name → trust it; do not override from the slug table.
  assert.equal(core.buildReference({ collectionName: 'Custom Name', collectionSlug: 'sahih-bukhari', hadithNumber: 2 }), 'Custom Name 2');
});

test('buildReference: never emits a half-citation (null when name or number missing)', () => {
  assert.equal(core.buildReference({ hadithNumber: 5 }), null);          // no resolvable name
  assert.equal(core.buildReference({ collectionName: 'Sahih Muslim' }), null); // no number
  assert.equal(core.buildReference({}), null);
  assert.equal(core.buildReference(null), null);
});

test('buildReference: last-resort falls back to the slug, but NEVER a vendor name', () => {
  const r = core.buildReference({ collectionSlug: 'some-unknown-collection', hadithNumber: 9 });
  assert.equal(r, 'some-unknown-collection 9');
  assert.ok(!/hadithapi|AhmedBaset|fawazahmed0/i.test(r));
});

test('COLLECTION_NAMES: covers all 18 collections and holds no vendor strings', () => {
  assert.equal(Object.keys(core.COLLECTION_NAMES).length, 18);
  for (const name of Object.values(core.COLLECTION_NAMES)) {
    assert.doesNotMatch(name, /hadithapi|AhmedBaset|fawazahmed0|\.com/i);
  }
});
