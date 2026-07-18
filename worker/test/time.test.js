import { test } from 'node:test';
import assert from 'node:assert';
import { todayUTC, secondsUntilUTCMidnight } from '../src/lib/time.js';

test('todayUTC returns YYYY-MM-DD', () => {
  assert.match(todayUTC(), /^\d{4}-\d{2}-\d{2}$/);
});

test('secondsUntilUTCMidnight is within a day and at least 60', () => {
  const s = secondsUntilUTCMidnight();
  assert.ok(s >= 60 && s <= 86400, `got ${s}`);
});
