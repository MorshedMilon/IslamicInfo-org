import { test } from 'node:test';
import assert from 'node:assert';
import { readFileSync } from 'node:fs';

// The hadithapi.com API key must never appear in any client-shipped file.
// (worker/src/hadith.js legitimately builds apiKey URLs server-side — it is
// NOT a client file and is intentionally excluded.)
const clientFiles = ['../../src/js/api.js', '../../src/js/hadith.js', '../../src/js/ui-utils.js'];

test('no client file references the hadith API key or a raw hadithapi apiKey URL', () => {
  for (const rel of clientFiles) {
    let src = '';
    try { src = readFileSync(new URL(rel, import.meta.url), 'utf8'); } catch (_) { continue; }
    assert.ok(!/HADITH_API_KEY/.test(src), `${rel} must not mention HADITH_API_KEY`);
    assert.ok(!/hadithapi\.com[^\s"']*apiKey=/.test(src), `${rel} must not build a hadithapi apiKey URL`);
  }
});
