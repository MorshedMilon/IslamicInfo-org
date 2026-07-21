import { test } from 'node:test';
import assert from 'node:assert';

/* Grade-badge WCAG AA contrast guard (PRD FIX-1 / TechSpec §2.6 / DECISIONS.md ADR-025).
   Pure value-based test: it locks the grade-token hex values that ship in the page :root
   blocks (hadith.html / verify.html / index.html / DESIGN-SYSTEM.md) and asserts every
   grade text colour clears 4.5:1 against its card surface in BOTH themes. If anyone reverts
   --grade-hasan/--grade-daif to the old failing values, this fails.
   Measure: text vs the card surface (the container background the badge sits on). The badge's
   own translucent tint (rgba(colour,.10–.12)) is a decorative overlay; see the tinted-bg note
   at the bottom for the one documented marginal (dark Mawdu'). */

// Card surfaces (from the page :root blocks): light --surface-base, dark --surface-base.
const SURFACE = { light: '#FAFBFB', dark: '#0F1B1D' };

// The shipped token values (ADR-025). Light hasan/daif corrected from #5D8A3A/#A86932.
const TOKENS = {
  light: { sahih: '#0F6E56', hasan: '#4A7030', daif: '#8A5228', mawdu: '#B33A3A' },
  dark:  { sahih: '#1FA882', hasan: '#7AB84E', daif: '#D4884A', mawdu: '#E05555' },
};

function hex(h) { h = h.replace('#', ''); return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)); }
function lin(c) { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }
function L(rgb) { return 0.2126 * lin(rgb[0]) + 0.7152 * lin(rgb[1]) + 0.0722 * lin(rgb[2]); }
function ratio(a, b) { const l1 = L(hex(a)), l2 = L(hex(b)); const hi = Math.max(l1, l2), lo = Math.min(l1, l2); return (hi + 0.05) / (lo + 0.05); }
function composite(fgHex, bgHex, alpha) {
  const fg = hex(fgHex), bg = hex(bgHex);
  const out = fg.map((c, i) => Math.round(c * alpha + bg[i] * (1 - alpha)));
  return '#' + out.map((c) => c.toString(16).padStart(2, '0')).join('');
}

const AA = 4.5;

for (const theme of ['light', 'dark']) {
  for (const grade of ['sahih', 'hasan', 'daif', 'mawdu']) {
    test(`grade-badge contrast: ${grade} (${theme}) clears WCAG AA 4.5:1 vs surface`, () => {
      const r = ratio(TOKENS[theme][grade], SURFACE[theme]);
      assert.ok(r >= AA, `${grade}/${theme} ${TOKENS[theme][grade]} vs ${SURFACE[theme]} = ${r.toFixed(2)}:1 (< ${AA})`);
    });
  }
}

test('regression guard: the OLD light hasan/daif values would FAIL (proves the fix is real)', () => {
  assert.ok(ratio('#5D8A3A', SURFACE.light) < AA, 'old hasan should fail');   // 3.92:1
  assert.ok(ratio('#A86932', SURFACE.light) < AA, 'old daif should fail');    // 4.28:1
});

test('dark-mode overrides exist for all 4 grades (required before Stage 1 ships)', () => {
  for (const grade of ['sahih', 'hasan', 'daif', 'mawdu']) {
    assert.ok(TOKENS.dark[grade] && TOKENS.dark[grade] !== TOKENS.light[grade], `dark ${grade} override missing`);
  }
});

/* Documented marginal (ADR-025): against the badge's translucent tint (not the raw surface),
   dark Mawdu' #E05555 over rgba(224,85,85,.12) computes ~4.17:1 — below 4.5. It is retained as
   the TechSpec §2.6-specified value; Mawdu' (fabricated narrations) is essentially never shown
   live. This assertion pins that known value so a future change is a conscious one. */
test('documented marginal: dark Mawdu vs its tinted badge bg is ~4.17:1 (accepted, TechSpec value)', () => {
  const tinted = composite('#E05555', SURFACE.dark, 0.12);
  const r = ratio('#E05555', tinted);
  assert.ok(r > 4.0 && r < 4.5, `expected ~4.17, got ${r.toFixed(2)}`);
});
