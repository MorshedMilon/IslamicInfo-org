'use strict';
const test = require('node:test');
const assert = require('node:assert');
const core = require('../../src/js/quran-audio-core.js');

test('normalizeAudioUrl: relative, protocol-relative, absolute', () => {
  assert.equal(core.normalizeAudioUrl('Alafasy/mp3/001001.mp3'),
    'https://audio.qurancdn.com/Alafasy/mp3/001001.mp3');
  assert.equal(core.normalizeAudioUrl('//mirrors.quranicaudio.com/x/001001.mp3'),
    'https://mirrors.quranicaudio.com/x/001001.mp3');
  assert.equal(core.normalizeAudioUrl('https://a.com/b.mp3'), 'https://a.com/b.mp3');
  assert.equal(core.normalizeAudioUrl('/Alafasy/1.mp3', 'https://cdn/'), 'https://cdn/Alafasy/1.mp3');
});

test('normalizeSegments: Quran.com 4-tuple and QUL 3-tuple', () => {
  assert.deepEqual(core.normalizeSegments([[0,1,60,610],[1,2,620,1310]]),
    [{word:1,start:60,end:610},{word:2,start:620,end:1310}]);
  assert.deepEqual(core.normalizeSegments([[1,0,960],[2,970,1420]]),
    [{word:1,start:0,end:960},{word:2,start:970,end:1420}]);
  assert.deepEqual(core.normalizeSegments(null), []);
});

test('activeWordAt: in-range, boundary, gap', () => {
  const s = [{word:1,start:60,end:610},{word:2,start:620,end:1310}];
  assert.equal(core.activeWordAt(s, 60), 1);
  assert.equal(core.activeWordAt(s, 700), 2);
  assert.equal(core.activeWordAt(s, 615), -1);
  assert.equal(core.activeWordAt(s, 1310), -1);
  assert.equal(core.activeWordAt([], 100), -1);
});

test('formatTime', () => {
  assert.equal(core.formatTime(0), '0:00');
  assert.equal(core.formatTime(65), '1:05');
  assert.equal(core.formatTime(600), '10:00');
  assert.equal(core.formatTime(NaN), '0:00');
  assert.equal(core.formatTime(-5), '0:00');
});

test('cache keys + isFresh (7d)', () => {
  assert.equal(core.recitersCacheKey(), 'ii-reciters');
  assert.equal(core.audioCacheKey(2, 7), 'ii-audio-2-7');
  const now = 1e12;
  assert.equal(core.isFresh(now - 6*86400e3, now), true);
  assert.equal(core.isFresh(now - 8*86400e3, now), false);
  assert.equal(core.isFresh(undefined, now), false);
});

test('parseHighlightMode reads ?highlight, defaults both', () => {
  assert.equal(core.parseHighlightMode('?highlight=block'), 'block');
  assert.equal(core.parseHighlightMode('?x=1&highlight=fill'), 'fill');
  assert.equal(core.parseHighlightMode('?highlight=both'), 'both');
  assert.equal(core.parseHighlightMode(''), 'both');
  assert.equal(core.parseHighlightMode('?highlight=bogus'), 'both');
});
test('modeFlags', () => {
  assert.deepEqual(core.modeFlags('both'), { block: true, fill: true });
  assert.deepEqual(core.modeFlags('block'), { block: true, fill: false });
  assert.deepEqual(core.modeFlags('fill'), { block: false, fill: true });
});
test('wordFillStates: active = current, filled = up to current (1-based w)', () => {
  assert.deepEqual(core.wordFillStates(0, 3), [
    { active: false, filled: false }, { active: false, filled: false }, { active: false, filled: false }]);
  assert.deepEqual(core.wordFillStates(1, 3), [
    { active: true, filled: true }, { active: false, filled: false }, { active: false, filled: false }]);
  assert.deepEqual(core.wordFillStates(3, 3), [
    { active: false, filled: true }, { active: false, filled: true }, { active: true, filled: true }]);
});
test('nextHighlightMode cycles both->block->fill->both', () => {
  assert.equal(core.nextHighlightMode('both'), 'block');
  assert.equal(core.nextHighlightMode('block'), 'fill');
  assert.equal(core.nextHighlightMode('fill'), 'both');
});
