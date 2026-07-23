import { test } from 'node:test';
import assert from 'node:assert';
import core from '../../src/js/analytics-core.js';

/* Module 18 — DoD-17 analytics gating + KPI allowlist (pure). */

test('KPI_EVENTS: exactly the 10 PRD §1 metrics', () => {
  assert.equal(core.KPI_EVENTS.length, 10);
  assert.deepEqual(core.KPI_EVENTS, [
    'hotd_interacted', 'isnad_opened', 'narrator_panel_opened', 'tier3_pageview',
    'ai_explain_opened', 'bookmark_saved', 'note_saved', 'trace_view_opened',
    'reading_path_progress', 'copy_with_citation'
  ]);
});

test('isKpiEvent: allowlist only', () => {
  assert.equal(core.isKpiEvent('bookmark_saved'), true);
  assert.equal(core.isKpiEvent('copy_with_citation'), true);
  assert.equal(core.isKpiEvent('rogue_event'), false);
  assert.equal(core.isKpiEvent(''), false);
  assert.equal(core.isKpiEvent(undefined), false);
});

test('isEnabled: requires BOTH measurement id AND granted consent', () => {
  assert.equal(core.isEnabled({ measurementId: 'G-XXXX', consent: 'granted' }), true);
  assert.equal(core.isEnabled({ measurementId: 'G-XXXX', consent: 'denied' }), false);
  assert.equal(core.isEnabled({ measurementId: 'G-XXXX', consent: 'unset' }), false);
  assert.equal(core.isEnabled({ measurementId: '', consent: 'granted' }), false);
  assert.equal(core.isEnabled({}), false);
  assert.equal(core.isEnabled(), false);
});

const ON = { measurementId: 'G-XXXX', consent: 'granted' };

test('prepareEvent: drops everything when disabled (no id / no consent)', () => {
  assert.equal(core.prepareEvent('bookmark_saved', {}, { measurementId: '', consent: 'granted' }), null);
  assert.equal(core.prepareEvent('bookmark_saved', {}, { measurementId: 'G-XXXX', consent: 'unset' }), null);
});

test('prepareEvent: drops non-KPI event even when enabled', () => {
  assert.equal(core.prepareEvent('rogue_event', {}, ON), null);
});

test('prepareEvent: passes a KPI event and keeps only primitive params', () => {
  const ev = core.prepareEvent('tier3_pageview', {
    collection: 'sahih-bukhari', book: 1, ok: true,
    obj: { a: 1 }, arr: [1], fn: () => {}, nil: null, und: undefined
  }, ON);
  assert.deepEqual(ev, { name: 'tier3_pageview', params: { collection: 'sahih-bukhari', book: 1, ok: true } });
});

test('prepareEvent: missing/empty params → empty params object', () => {
  assert.deepEqual(core.prepareEvent('note_saved', undefined, ON), { name: 'note_saved', params: {} });
});
