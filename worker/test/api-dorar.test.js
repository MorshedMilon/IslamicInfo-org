import { test } from 'node:test';
import assert from 'node:assert';
import api from '../../src/js/api.js';

test('api exposes fetchDorarSilsila', () => {
  assert.equal(typeof api.fetchDorarSilsila, 'function');
});
test('fetchDorarSilsila builds the /api/hadith/dorar/search URL with q + page', () => {
  const u = api._dorarUrl('النية', 2);
  assert.ok(u.indexOf('/api/hadith/dorar/search') !== -1);
  assert.match(u, /q=/);
  assert.match(u, /page=2/);
});
