import { test } from 'node:test';
import assert from 'node:assert';
import core from '../../src/js/narrator-panel-core.js';

/* SYNTHETIC fixtures only — never shipped. Live data has narrators:[] and no
   citation files; these mocked entries exercise the populated render path the
   way Module 2/7 tested disputed-grade dead-code. NOT real scholarly data. */
function narrator(over = {}) {
  return Object.assign({
    id: 'test-1', fullName: 'Test Narrator', arabicName: 'فلان',
    lifespan: 'd. 100 AH', era: 'Tabi‘i', reliabilityGrade: 'thiqah',
    graderCitations: [
      { scholar: 'Scholar A', gradeText: 'Thiqah', source: 'Some Work', sourceRef: 'no. 1' },
    ],
  }, over);
}

test('reliabilityParts: thiqah/saduq/daif map to known badge + dot classes', () => {
  assert.deepEqual(
    ['thiqah', 'saduq', 'daif'].map((g) => core.reliabilityParts(g).dotClass),
    ['thiqah', 'saduq', 'daif']);
  assert.equal(core.reliabilityParts('thiqah').label, 'Thiqah');
  assert.equal(core.reliabilityParts('saduq').badgeClass, 'rel-saduq');
  assert.equal(core.reliabilityParts('daif').label, "Da'if");
  assert.ok(core.reliabilityParts('thiqah').known);
});

test('reliabilityParts: unknown/missing/garbage → grey unknown, never guessed', () => {
  ['', null, undefined, 'majhul', 'made-up'].forEach((g) => {
    const p = core.reliabilityParts(g);
    assert.equal(p.grade, 'unknown');
    assert.equal(p.dotClass, 'unknown');
    assert.equal(p.badgeClass, 'rel-unknown');
    assert.equal(p.known, false);
  });
});

test('graderRowsHTML: renders a row per citation with scholar/grade/citation', () => {
  const html = core.graderRowsHTML([
    { scholar: 'Ibn Hajar', gradeText: 'Thiqah thabt', source: 'Taqrib at-Tahdhib', sourceRef: 'no. 4686' },
  ]);
  assert.match(html, /Ibn Hajar/);
  assert.match(html, /Thiqah thabt/);
  assert.match(html, /Taqrib at-Tahdhib, no\. 4686/);
  assert.match(html, /scholar-grading-row/);
});

test('graderRowsHTML: empty citations → honest "No scholar citations", NEVER padded rows', () => {
  const html = core.graderRowsHTML([]);
  assert.match(html, /No scholar citations available for this narrator/);
  assert.doesNotMatch(html, /scholar-grading-row/);
});

test('graderRowsHTML: empty citations use unified .dv-empty--compact + role="note"', () => {
  const html = core.graderRowsHTML([]);
  assert.match(html, /class="dv-empty dv-empty--compact"/);
  assert.match(html, /role="note"/);
  assert.doesNotMatch(html, /narrator-empty/);
});

test('buildNarratorPanelHTML: null uses unified .dv-empty--compact + role="note"', () => {
  const html = core.buildNarratorPanelHTML(null);
  assert.match(html, /class="dv-empty dv-empty--compact"/);
  assert.match(html, /role="note"/);
  assert.doesNotMatch(html, /narrator-empty/);
});

test('graderRowsHTML: escapes provider text (no raw HTML)', () => {
  const html = core.graderRowsHTML([{ scholar: '<script>x</script>', gradeText: 'y', source: 's', sourceRef: 'r' }]);
  assert.doesNotMatch(html, /<script>x<\/script>/);
  assert.match(html, /&lt;script&gt;/);
});

test('buildNarratorPanelHTML: full panel — name, arabic, reliability badge, gradings', () => {
  const html = core.buildNarratorPanelHTML(narrator());
  assert.match(html, /Test Narrator/);
  assert.match(html, /rel-thiqah/);
  assert.match(html, /Thiqah/);
  assert.match(html, /scholar-grading-row/);
});

test('buildNarratorPanelHTML: null → honest "Reliability data unavailable", never throws', () => {
  assert.match(core.buildNarratorPanelHTML(null), /Reliability data unavailable for this narrator/);
});

test('buildNarratorPanelHTML: narrator with empty citations → panel + honest no-citations note', () => {
  const html = core.buildNarratorPanelHTML(narrator({ graderCitations: [] }));
  assert.match(html, /Test Narrator/);
  assert.match(html, /No scholar citations available for this narrator/);
});

test('buildNarratorPanelHTML: escapes its OWN fields (name/arabic/kunya/nasab/lifespan) — no raw HTML', () => {
  const html = core.buildNarratorPanelHTML(narrator({
    fullName: '<script>a</script>', arabicName: '<b>ar</b>', kunya: '<i>k</i>',
    nasab: '<u>n</u>', lifespan: '<em>d.100</em>',
  }));
  ['<script>a</script>', '<b>ar</b>', '<i>k</i>', '<u>n</u>', '<em>d.100</em>'].forEach((raw) => {
    assert.ok(!html.includes(raw), 'raw HTML leaked: ' + raw);
  });
  assert.match(html, /&lt;script&gt;/);
});

test('buildNarratorPanelHTML: unknown reliability + absent fullName → grey unknown badge + "Unknown narrator", never throws', () => {
  const html = core.buildNarratorPanelHTML({ id: 'x', reliabilityGrade: 'majhul', graderCitations: [] });
  assert.match(html, /rel-unknown/);
  assert.match(html, /Unknown narrator/);
  assert.match(html, /No scholar citations available for this narrator/);
});
