import { test } from 'node:test';
import assert from 'node:assert';
import core from '../../src/js/reading-progress-core.js';

/* ── constants ── */
test('exposes THRESHOLD_MS = 3000 and MIN_RATIO = 0.5', () => {
  assert.equal(core.THRESHOLD_MS, 3000);
  assert.equal(core.MIN_RATIO, 0.5);
});

/* ── createTracker: the named §14.1 dwell test ── */
test('createTracker: ref counted read after 3s continuous visibility, NOT at 2s', () => {
  const t = core.createTracker();
  assert.equal(t.update('sahih-bukhari:1:5', 0), null);      // arm
  assert.equal(t.update('sahih-bukhari:1:5', 2000), null);   // 2s — not yet
  assert.equal(t.update('sahih-bukhari:1:5', 3000), 'sahih-bukhari:1:5'); // 3s — read
});

test('createTracker: changing ref re-arms the timer (previous progress discarded)', () => {
  const t = core.createTracker();
  t.update('a', 0);
  assert.equal(t.update('b', 1000), null);   // switched to b, arms at 1000
  assert.equal(t.update('b', 3900), null);   // 2.9s of b
  assert.equal(t.update('b', 4000), 'b');    // 3s of b
});

test('createTracker: leaving all cards (null) disarms; re-entry restarts the 3s clock', () => {
  const t = core.createTracker();
  t.update('a', 0);
  assert.equal(t.update(null, 1000), null);  // nothing visible → disarm
  assert.equal(t.update('a', 2000), null);   // re-armed at 2000
  assert.equal(t.update('a', 4900), null);   // only 2.9s since re-arm
  assert.equal(t.update('a', 5000), 'a');    // 3s since re-arm
});

test('createTracker: does not re-fire for the same continuously-visible ref', () => {
  const t = core.createTracker();
  t.update('a', 0);
  assert.equal(t.update('a', 3000), 'a');    // fires once
  assert.equal(t.update('a', 6000), null);   // already recorded — no repeat
});

/* ── topmost: pick the topmost card at or above MIN_RATIO ── */
test('topmost: returns the qualifying record closest to the top of the viewport', () => {
  const r = core.topmost([
    { ref: 'a', ratio: 0.6, top: 300 },
    { ref: 'b', ratio: 0.9, top: 100 },
  ]);
  assert.equal(r, 'b');
});

test('topmost: ignores records below MIN_RATIO', () => {
  assert.equal(core.topmost([{ ref: 'a', ratio: 0.3, top: 100 }]), null);
});

test('topmost: empty set → null', () => {
  assert.equal(core.topmost([]), null);
});

/* ── payloadFromRef: slug:book:hadith → last-read payload ── */
test('payloadFromRef: parses slug:book:hadith with injected timestamp', () => {
  assert.deepEqual(core.payloadFromRef('sahih-bukhari:1:5', 111), {
    collectionSlug: 'sahih-bukhari', bookNum: '1', hadithNum: '5', timestamp: 111,
  });
});

test('payloadFromRef: bookless-style ref (default book segment) still parses', () => {
  assert.deepEqual(core.payloadFromRef('musnad-ahmad:1:20', 222), {
    collectionSlug: 'musnad-ahmad', bookNum: '1', hadithNum: '20', timestamp: 222,
  });
});

test('payloadFromRef: malformed or empty ref → null (never persist garbage)', () => {
  assert.equal(core.payloadFromRef('bad', 1), null);
  assert.equal(core.payloadFromRef('', 1), null);
  assert.equal(core.payloadFromRef(null, 1), null);
});
