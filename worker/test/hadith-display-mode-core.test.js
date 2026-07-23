import { test } from 'node:test';
import assert from 'node:assert';
import core from '../../src/js/hadith-display-mode-core.js';

/* Module 16 — Study Mode (US-H20) + Reading Mode (US-H21) pure logic.
   All decisions (mutual exclusion, restore-on-load, URL/storage) live
   here; the DOM layer only applies the results. */

// ── normalize ────────────────────────────────────────────────────────
test('normalize: known modes pass through', () => {
  assert.equal(core.normalize('study'), 'study');
  assert.equal(core.normalize('reading'), 'reading');
  assert.equal(core.normalize('none'), 'none');
});

test('normalize: garbage/undefined/null collapse to none', () => {
  assert.equal(core.normalize('bogus'), 'none');
  assert.equal(core.normalize(undefined), 'none');
  assert.equal(core.normalize(null), 'none');
  assert.equal(core.normalize(''), 'none');
});

// ── toggle (mutual exclusion + "reading wins") ───────────────────────
test('toggle: clicking a mode from none turns it on', () => {
  assert.equal(core.toggle('none', 'study'), 'study');
  assert.equal(core.toggle('none', 'reading'), 'reading');
});

test('toggle: clicking the active mode again turns it off', () => {
  assert.equal(core.toggle('study', 'study'), 'none');
  assert.equal(core.toggle('reading', 'reading'), 'none');
});

test('toggle: switching to the other mode replaces (never both active)', () => {
  assert.equal(core.toggle('study', 'reading'), 'reading');
  assert.equal(core.toggle('reading', 'study'), 'study');
});

test('toggle: target none always clears', () => {
  assert.equal(core.toggle('study', 'none'), 'none');
  assert.equal(core.toggle('reading', 'none'), 'none');
});

test('toggle: garbage current is treated as none', () => {
  assert.equal(core.toggle('xxx', 'study'), 'study');
});

// ── rootClass ────────────────────────────────────────────────────────
test('rootClass: maps each mode; none → empty string', () => {
  assert.equal(core.rootClass('study'), 'study-mode-hadith');
  assert.equal(core.rootClass('reading'), 'reading-mode-hadith');
  assert.equal(core.rootClass('none'), '');
  assert.equal(core.rootClass('bogus'), '');
});

// ── URL: hasReadingParam ─────────────────────────────────────────────
test('hasReadingParam: detects mode=reading with or without leading ?', () => {
  assert.equal(core.hasReadingParam('?mode=reading'), true);
  assert.equal(core.hasReadingParam('mode=reading'), true);
  assert.equal(core.hasReadingParam('?grade=sahih&mode=reading'), true);
});

test('hasReadingParam: false for absent / other / empty', () => {
  assert.equal(core.hasReadingParam('?grade=sahih'), false);
  assert.equal(core.hasReadingParam('?mode=claim'), false);
  assert.equal(core.hasReadingParam(''), false);
  assert.equal(core.hasReadingParam(null), false);
  assert.equal(core.hasReadingParam(undefined), false);
});

// ── URL: setReadingParam (preserve other params) ─────────────────────
test('setReadingParam: adds mode=reading, preserving existing params', () => {
  assert.equal(core.setReadingParam('?grade=sahih', true), '?grade=sahih&mode=reading');
});

test('setReadingParam: removes mode=reading, preserving existing params', () => {
  assert.equal(core.setReadingParam('?grade=sahih&mode=reading', false), '?grade=sahih');
});

test('setReadingParam: add on empty search yields just the param', () => {
  assert.equal(core.setReadingParam('', true), '?mode=reading');
  assert.equal(core.setReadingParam(undefined, true), '?mode=reading');
});

test('setReadingParam: remove when nothing left yields empty string (no bare ?)', () => {
  assert.equal(core.setReadingParam('?mode=reading', false), '');
});

test('setReadingParam: does not duplicate when already present', () => {
  assert.equal(core.setReadingParam('?mode=reading', true), '?mode=reading');
});

// ── storage ──────────────────────────────────────────────────────────
test('storageActive: only "1" is active', () => {
  assert.equal(core.storageActive('1'), true);
  assert.equal(core.storageActive('0'), false);
  assert.equal(core.storageActive(''), false);
  assert.equal(core.storageActive(null), false);
  assert.equal(core.storageActive(undefined), false);
});

test('storageValue: active → "1", inactive → null (remove)', () => {
  assert.equal(core.storageValue(true), '1');
  assert.equal(core.storageValue(false), null);
});

// ── initialMode (restore-on-load) ────────────────────────────────────
test('initialMode: URL param alone restores reading', () => {
  assert.equal(core.initialMode({ search: '?mode=reading' }), 'reading');
});

test('initialMode: storage key alone restores reading', () => {
  assert.equal(core.initialMode({ storageValue: '1' }), 'reading');
});

test('initialMode: both present restores reading', () => {
  assert.equal(core.initialMode({ search: '?mode=reading', storageValue: '1' }), 'reading');
});

test('initialMode: neither present → none', () => {
  assert.equal(core.initialMode({ search: '?grade=sahih', storageValue: '0' }), 'none');
  assert.equal(core.initialMode({}), 'none');
});

test('initialMode: study is never restored (no ?mode=study, no study storage)', () => {
  // A stale ?mode=study is not a reading trigger and study has no persistence.
  assert.equal(core.initialMode({ search: '?mode=study' }), 'none');
});

// ── studyBannerHTML ──────────────────────────────────────────────────
test('studyBannerHTML: canonical structure + a11y', () => {
  const html = core.studyBannerHTML();
  assert.match(html, /class="study-mode-banner"/);
  assert.match(html, /study-mode-dot/);
  assert.match(html, /Study Mode Active/);
  assert.match(html, /4-quadrant focused layout/);
  assert.match(html, /class="exit-study"[^>]*data-act="exit-study"/);
  assert.match(html, /aria-label="Exit Study Mode"/);
  assert.match(html, /type="button"/);
  // No raw inline hex color (design-system invariant).
  assert.doesNotMatch(html, /style="[^"]*#[0-9a-fA-F]{3,6}/);
});

// ── modeButtonsHTML ──────────────────────────────────────────────────
test('modeButtonsHTML: two buttons with correct data-mode + pressed state', () => {
  const html = core.modeButtonsHTML('study');
  assert.match(html, /data-mode="study"[^>]*aria-pressed="true"/);
  assert.match(html, /data-mode="reading"[^>]*aria-pressed="false"/);
});

test('modeButtonsHTML: reading active reflects on the reading button', () => {
  const html = core.modeButtonsHTML('reading');
  assert.match(html, /data-mode="reading"[^>]*aria-pressed="true"/);
  assert.match(html, /data-mode="study"[^>]*aria-pressed="false"/);
});

test('modeButtonsHTML: none → both unpressed', () => {
  const html = core.modeButtonsHTML('none');
  assert.match(html, /data-mode="study"[^>]*aria-pressed="false"/);
  assert.match(html, /data-mode="reading"[^>]*aria-pressed="false"/);
});
