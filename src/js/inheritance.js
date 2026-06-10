/* ═══════════════════════════════════════════════════════════════════
   IslamicInfo.org — inheritance.js  (v1.0 · 2026-06)
   Corrected Farā'iḍ calculation engine for inheritance.html.

   LOAD ORDER CONTRACT:
     This file loads AFTER the inline script in inheritance.html.
     It intentionally re-declares applyHijb() and calculateShares(),
     overriding the inline v0 versions. All other inline functions
     (readState, renderResults, runCalculation, fmt, …) are reused
     unchanged. inheritance.html requires NO edits.

   SOURCES (page policy: Qur'an + Sahih hadith only, no madhab framing):
     - An-Nisa 4:11   — children, parents
     - An-Nisa 4:12   — spouses, maternal half-siblings (kalālah)
     - An-Nisa 4:176  — full / paternal siblings (kalālah)
     - Sahih al-Bukhari 6732 · Sahih Muslim 1615 — ʿaṣabah residue rule
     - Sahih al-Bukhari 6736 — son's daughter 1/6 with one daughter;
       sister takes residue with daughters (maʿa l-banāt)
     - Grandmother 1/6: established Sunnah (Abu Dawud 2894)

   Result-object contract (consumed by inline renderResults):
     { heir, shareFraction, shareDecimal, amount,
       source, type: 'fard'|'asabah'|'blocked', note }

   Differed-upon edge cases are computed from the literal texts above
   and flagged with a "consult a specialist" note, per the page's
   hard-coded disclaimer. This file never issues rulings.
   ═══════════════════════════════════════════════════════════════════ */

/* ─── Exact fraction arithmetic (avoids float drift) ─────────────── */
function _gcd(a, b) { return b ? _gcd(b, a % b) : a; }
function FR(n, d) {
  if (d < 0) { n = -n; d = -d; }
  const g = _gcd(Math.abs(n), d) || 1;
  return { n: n / g, d: d / g };
}
const FR_ZERO = FR(0, 1);
const FR_ONE  = FR(1, 1);
function frAdd(a, b) { return FR(a.n * b.d + b.n * a.d, a.d * b.d); }
function frSub(a, b) { return FR(a.n * b.d - b.n * a.d, a.d * b.d); }
function frMul(a, b) { return FR(a.n * b.n, a.d * b.d); }
function frDiv(a, b) { return FR(a.n * b.d, a.d * b.n); }
function frCmp(a, b) { return a.n * b.d - b.n * a.d; }   /* >0, 0, <0 */
function frDec(a)    { return a.n / a.d; }
function frStr(a) {
  if (a.n === 0) return '0';
  if (a.n === a.d) return '1';
  return a.n + '/' + a.d;
}

/* ─── Ḥijb — blocking rules ───────────────────────────────────────
   Bukhari 6732 · Muslim 1615 + established exclusion principles.   */
function applyHijb(h) {
  const SRC = 'Bukhari 6732 · Muslim 1615';
  const B = {};
  const hasSons      = h.sons > 0;
  const hasGrandsons = h.grandsons > 0;
  const hasDesc      = (h.sons + h.daughters + h.grandsons + h.granddaughters) > 0;
  const gfActsAsFather = !h.father && h.paternalGrandfather;

  /* Grandparents */
  if (h.father) B.paternalGrandfather = { reason: 'Blocked by Father', src: SRC };
  if (h.father || h.mother)
    B.paternalGrandmother = { reason: h.mother ? 'Blocked by Mother' : 'Blocked by Father', src: SRC };
  if (h.mother)
    B.maternalGrandmother = { reason: 'Blocked by Mother', src: SRC };

  /* Grandchildren */
  if (hasSons) {
    B.grandsons      = { reason: 'Blocked by Son', src: SRC };
    B.granddaughters = { reason: 'Blocked by Son', src: SRC };
  } else if (h.daughters >= 2 && h.granddaughters > 0 && h.grandsons === 0) {
    /* Two+ daughters exhaust the 2/3; son's daughters excluded unless
       a son's son exists to carry them as ʿaṣabah. */
    B.granddaughters = { reason: 'Blocked by two Daughters (2/3 complete)', src: 'An-Nisa 4:11' };
  }

  /* Full + paternal siblings — blocked by male descendant or father
     (grandfather acting as father: differed-upon, flagged in note). */
  if (hasSons || hasGrandsons || h.father || gfActsAsFather) {
    const r = hasSons ? 'Blocked by Son'
            : hasGrandsons ? "Blocked by Son's Son"
            : h.father ? 'Blocked by Father'
            : 'Blocked by Grandfather (differed-upon case — consult a specialist)';
    B.fullBrothers    = { reason: r, src: SRC };
    B.fullSisters     = { reason: r, src: SRC };
    B.patHalfBrothers = { reason: r, src: SRC };
    B.patHalfSisters  = { reason: r, src: SRC };
  }

  /* Full brothers block paternal half-siblings */
  if (!B.patHalfBrothers && h.fullBrothers > 0) {
    B.patHalfBrothers = { reason: 'Blocked by Full Brother', src: SRC };
    B.patHalfSisters  = { reason: 'Blocked by Full Brother', src: SRC };
  }
  /* Two+ full sisters exhaust 2/3 → pat half-sisters excluded unless
     a pat half-brother exists to carry them as ʿaṣabah. */
  if (!B.patHalfSisters && h.fullSisters >= 2 && h.patHalfBrothers === 0 && h.patHalfSisters > 0) {
    B.patHalfSisters = { reason: 'Blocked by two Full Sisters (2/3 complete)', src: 'An-Nisa 4:176' };
  }

  /* Maternal half-siblings — blocked by any descendant, father,
     or paternal grandfather (kalālah condition, An-Nisa 4:12). */
  if (hasDesc || h.father || h.paternalGrandfather) {
    const r = hasDesc ? 'Blocked by Descendants'
            : h.father ? 'Blocked by Father'
            : 'Blocked by Paternal Grandfather';
    B.matHalfBrothers = { reason: r, src: 'An-Nisa 4:12' };
    B.matHalfSisters  = { reason: r, src: 'An-Nisa 4:12' };
  }

  return B;
}

/* ─── Core calculation ────────────────────────────────────────────── */
function calculateShares(dist, h, gender) {
  const B = applyHijb(h);
  const fard = [];        /* fixed-share rows  {key,heir,frac,source,note,count} */
  let blockedRows = [];

  const hasMaleDesc   = h.sons > 0 || (h.grandsons > 0 && h.sons === 0);
  const hasDesc       = (h.sons + h.daughters + h.grandsons + h.granddaughters) > 0;
  const gfActsAsFather = !h.father && !!h.paternalGrandfather;
  const fatherFig      = h.father ? 'father' : (gfActsAsFather ? 'grandfather' : null);
  const fatherFigLabel = h.father ? 'Father' : 'Paternal Grandfather';
  const gfNote = gfActsAsFather ? 'Grandfather stands in Father\u2019s place — differed-upon with siblings; consult a specialist for complex cases. ' : '';

  /* Count ALL selected siblings (blocked or not) — they still reduce
     the Mother to 1/6 per An-Nisa 4:11. */
  const totalSiblings = h.fullBrothers + h.fullSisters + h.patHalfBrothers +
                        h.patHalfSisters + h.matHalfBrothers + h.matHalfSisters;

  /* ── 1 · Spouse — An-Nisa 4:12 ── */
  if (gender === 'female' && h.husband) {
    fard.push({ key: 'husband', heir: 'Husband',
      frac: hasDesc ? FR(1, 4) : FR(1, 2),
      source: 'An-Nisa 4:12', note: '', count: 1 });
  }
  if (gender === 'male' && h.wives > 0) {
    fard.push({ key: 'wives', heir: h.wives > 1 ? `Wives (×${h.wives})` : 'Wife',
      frac: hasDesc ? FR(1, 8) : FR(1, 4),
      source: 'An-Nisa 4:12', note: '', count: h.wives });
  }

  /* ── 2 · Father / Grandfather-as-father — An-Nisa 4:11 ──
     With male-line descendants: 1/6.
     With only female descendants: 1/6 + residue (taʿṣīb).
     No descendants: pure ʿaṣabah (handled in residue stage).        */
  let fatherTakesResidue = false;
  if (fatherFig && hasDesc) {
    fard.push({ key: fatherFig, heir: fatherFigLabel, frac: FR(1, 6),
      source: 'An-Nisa 4:11', note: gfNote.trim(), count: 1 });
    if (!hasMaleDesc) fatherTakesResidue = true;  /* +residue with daughters only */
  }

  /* ── 3 · Mother — An-Nisa 4:11 ── */
  if (h.mother) {
    const sixth = hasDesc || totalSiblings >= 2;
    let note = '';
    const spousePresent = (gender === 'female' && h.husband) || (gender === 'male' && h.wives > 0);
    if (!sixth && spousePresent && fatherFig) {
      note = 'Spouse + both parents: companion-era consensus applies 1/3 of the remainder (ʿUmariyyah) — shown here per the literal text; consult a specialist.';
    }
    fard.push({ key: 'mother', heir: 'Mother', frac: sixth ? FR(1, 6) : FR(1, 3),
      source: 'An-Nisa 4:11', note, count: 1 });
  }

  /* ── 4 · Grandmothers — 1/6 shared (Sunnah, Abu Dawud 2894) ── */
  const gms = [];
  if (h.paternalGrandmother && !B.paternalGrandmother) gms.push('Paternal Grandmother');
  if (h.maternalGrandmother && !B.maternalGrandmother) gms.push('Maternal Grandmother');
  if (gms.length) {
    fard.push({ key: 'grandmothers',
      heir: gms.length === 2 ? 'Grandmothers (×2)' : gms[0],
      frac: FR(1, 6), source: 'Abu Dawud 2894',
      note: gms.length === 2 ? '1/6 shared equally between both grandmothers' : '',
      count: gms.length });
  }

  /* ── 5 · Daughters — An-Nisa 4:11 (fard only when no sons) ── */
  if (h.daughters > 0 && h.sons === 0) {
    fard.push({ key: 'daughters',
      heir: `Daughter${h.daughters > 1 ? 's' : ''} (×${h.daughters})`,
      frac: h.daughters === 1 ? FR(1, 2) : FR(2, 3),
      source: 'An-Nisa 4:11', note: '', count: h.daughters });
  }

  /* ── 6 · Son's daughters (no sons, no son's sons) ──
     No daughters → take daughters' shares; one daughter → 1/6
     completing 2/3 (Bukhari 6736). Two+ daughters → blocked (ḥijb). */
  if (h.granddaughters > 0 && !B.granddaughters && h.sons === 0 && h.grandsons === 0) {
    if (h.daughters === 0) {
      fard.push({ key: 'granddaughters',
        heir: `Son's Daughter${h.granddaughters > 1 ? 's' : ''} (×${h.granddaughters})`,
        frac: h.granddaughters === 1 ? FR(1, 2) : FR(2, 3),
        source: 'An-Nisa 4:11', note: 'Takes the daughters\u2019 share in their absence', count: h.granddaughters });
    } else if (h.daughters === 1) {
      fard.push({ key: 'granddaughters',
        heir: `Son's Daughter${h.granddaughters > 1 ? 's' : ''} (×${h.granddaughters})`,
        frac: FR(1, 6),
        source: 'Bukhari 6736', note: 'Completes 2/3 alongside one Daughter', count: h.granddaughters });
    }
  }

  /* ── 7 · Full sisters — An-Nisa 4:176 (kalālah fard) ──
     Fard only when: no descendants, no father-figure, no full
     brothers, and not converted to ʿaṣabah by daughters.            */
  const sistersWithDaughters = hasDesc && !hasMaleDesc;  /* maʿa l-banāt */
  if (h.fullSisters > 0 && !B.fullSisters && h.fullBrothers === 0 && !hasDesc && !fatherFig) {
    fard.push({ key: 'fullSisters',
      heir: `Full Sister${h.fullSisters > 1 ? 's' : ''} (×${h.fullSisters})`,
      frac: h.fullSisters === 1 ? FR(1, 2) : FR(2, 3),
      source: 'An-Nisa 4:176', note: '', count: h.fullSisters });
  }

  /* ── 8 · Paternal half-sisters — An-Nisa 4:176 ──
     In absence of fulls: same as full sisters.
     With exactly one full sister: 1/6 completing 2/3.               */
  if (h.patHalfSisters > 0 && !B.patHalfSisters && h.patHalfBrothers === 0 && !hasDesc && !fatherFig) {
    if (h.fullSisters === 0 && h.fullBrothers === 0) {
      fard.push({ key: 'patHalfSisters',
        heir: `Paternal Half-Sister${h.patHalfSisters > 1 ? 's' : ''} (×${h.patHalfSisters})`,
        frac: h.patHalfSisters === 1 ? FR(1, 2) : FR(2, 3),
        source: 'An-Nisa 4:176', note: '', count: h.patHalfSisters });
    } else if (h.fullSisters === 1) {
      fard.push({ key: 'patHalfSisters',
        heir: `Paternal Half-Sister${h.patHalfSisters > 1 ? 's' : ''} (×${h.patHalfSisters})`,
        frac: FR(1, 6),
        source: 'An-Nisa 4:176', note: 'Completes 2/3 alongside one Full Sister', count: h.patHalfSisters });
    }
  }

  /* ── 9 · Maternal half-siblings — An-Nisa 4:12 (kalālah) ──
     One → 1/6. Two+ → 1/3 shared equally (male = female).           */
  const matCount = h.matHalfBrothers + h.matHalfSisters;
  if (matCount > 0 && !B.matHalfBrothers && !B.matHalfSisters) {
    fard.push({ key: 'maternals',
      heir: `Maternal Half-Sibling${matCount > 1 ? 's' : ''} (×${matCount})`,
      frac: matCount === 1 ? FR(1, 6) : FR(1, 3),
      source: 'An-Nisa 4:12',
      note: matCount > 1 ? 'Shared equally — male and female alike' : '', count: matCount });
  }

  /* ── 10 · ʿAwl — proportional reduction if fard exceeds estate ── */
  let fardTotal = fard.reduce((acc, f) => frAdd(acc, f.frac), FR_ZERO);
  let awlApplied = false;
  if (frCmp(fardTotal, FR_ONE) > 0) {
    awlApplied = true;
    fard.forEach(f => { f.awlFrac = frDiv(f.frac, fardTotal); });
    fardTotal = FR_ONE;
  }

  /* ── 11 · Assemble fard rows ── */
  const results = [];
  fard.forEach(f => {
    const eff = f.awlFrac || f.frac;
    const dec = frDec(eff);
    const amount = dist * dec;
    let note = f.note || '';
    if (awlApplied) note = (note ? note + ' · ' : '') + `ʿAwl applied: ${frStr(f.frac)} reduced to ${frStr(eff)}`;
    if (f.count > 1) note = (note ? note + ' · ' : '') + `Each: ${fmt(amount / f.count)}`;
    results.push({ heir: f.heir, shareFraction: awlApplied ? `${frStr(eff)} (ʿAwl)` : frStr(f.frac),
      shareDecimal: dec, amount, source: f.source, type: 'fard', note });
  });

  /* ── 12 · ʿAṣabah — residue (Bukhari 6732 · Muslim 1615) ── */
  const residue = awlApplied ? FR_ZERO : frSub(FR_ONE, fardTotal);
  const resDec = frDec(residue);
  const SRC = 'Bukhari 6732 · Muslim 1615';
  const pct = fr => (frDec(fr) * 100).toFixed(2).replace(/\.?0+$/, '') + '%';

  function pushTasib(group) {
    /* group: [{heir, parts, count, note?, source?}] — splits residue by parts */
    const totalParts = group.reduce((s, g) => s + g.parts, 0);
    group.forEach(g => {
      const fr = frMul(residue, FR(g.parts, totalParts));
      const dec = frDec(fr);
      const amount = dist * dec;
      let note = g.note || '';
      if (g.count > 1 && dec > 0) note = (note ? note + ' · ' : '') + `Each: ${fmt(amount / g.count)}`;
      results.push({ heir: g.heir,
        shareFraction: dec > 0 ? `Residue (${pct(fr)})` : 'Residue: none',
        shareDecimal: dec, amount, source: g.source || SRC, type: 'asabah',
        note: dec > 0 ? note : 'No residue remains after fixed shares' });
    });
  }

  if (h.sons > 0) {
    const g = [{ heir: `Son${h.sons > 1 ? 's' : ''} (×${h.sons})`, parts: h.sons * 2, count: h.sons,
      source: 'An-Nisa 4:11 · Bukhari 6732',
      note: h.daughters > 0 ? 'Male: double the female share (An-Nisa 4:11)' : '' }];
    if (h.daughters > 0) g.push({ heir: `Daughter${h.daughters > 1 ? 's' : ''} (×${h.daughters})`,
      parts: h.daughters, count: h.daughters, source: 'An-Nisa 4:11 · Bukhari 6732' });
    pushTasib(g);
  } else if (h.grandsons > 0 && !B.grandsons) {
    const g = [{ heir: `Son's Son${h.grandsons > 1 ? 's' : ''} (×${h.grandsons})`, parts: h.grandsons * 2, count: h.grandsons,
      note: h.granddaughters > 0 ? 'Male: double the female share (An-Nisa 4:11)' : '' }];
    if (h.granddaughters > 0) g.push({ heir: `Son's Daughter${h.granddaughters > 1 ? 's' : ''} (×${h.granddaughters})`,
      parts: h.granddaughters, count: h.granddaughters });
    pushTasib(g);
  } else if (fatherTakesResidue && frCmp(residue, FR_ZERO) > 0) {
    /* Father (or grandfather) already holds 1/6 fard; add residue. */
    const row = results.find(r => r.heir === fatherFigLabel && r.type === 'fard');
    if (row) {
      row.shareFraction = `1/6 + Residue (${pct(residue)})`;
      row.shareDecimal += resDec;
      row.amount = dist * row.shareDecimal;
      row.source = 'An-Nisa 4:11 · Bukhari 6732';
      row.note = (row.note ? row.note + ' · ' : '') + '1/6 fixed share plus remainder (taʿṣīb)';
    }
  } else if (fatherFig && !hasDesc) {
    pushTasib([{ heir: fatherFigLabel, parts: 1, count: 1,
      note: gfActsAsFather ? gfNote.trim() : '' }]);
  } else if (h.fullBrothers > 0 && !B.fullBrothers) {
    const g = [{ heir: `Full Brother${h.fullBrothers > 1 ? 's' : ''} (×${h.fullBrothers})`,
      parts: h.fullBrothers * 2, count: h.fullBrothers,
      source: 'An-Nisa 4:176 · Bukhari 6732',
      note: h.fullSisters > 0 ? 'Male: double the female share (An-Nisa 4:176)' : '' }];
    if (h.fullSisters > 0) g.push({ heir: `Full Sister${h.fullSisters > 1 ? 's' : ''} (×${h.fullSisters})`,
      parts: h.fullSisters, count: h.fullSisters, source: 'An-Nisa 4:176 · Bukhari 6732' });
    pushTasib(g);
  } else if (h.fullSisters > 0 && !B.fullSisters && sistersWithDaughters) {
    /* Sisters with daughters become residuaries — Bukhari 6736 */
    pushTasib([{ heir: `Full Sister${h.fullSisters > 1 ? 's' : ''} (×${h.fullSisters})`,
      parts: 1, count: h.fullSisters, source: 'Bukhari 6736',
      note: 'Sister takes the remainder alongside daughters (maʿa l-banāt)' }]);
  } else if (h.patHalfBrothers > 0 && !B.patHalfBrothers) {
    const g = [{ heir: `Paternal Half-Brother${h.patHalfBrothers > 1 ? 's' : ''} (×${h.patHalfBrothers})`,
      parts: h.patHalfBrothers * 2, count: h.patHalfBrothers,
      note: (h.patHalfSisters > 0 && !B.patHalfSisters) ? 'Male: double the female share (An-Nisa 4:176)' : '' }];
    if (h.patHalfSisters > 0 && !B.patHalfSisters) g.push({
      heir: `Paternal Half-Sister${h.patHalfSisters > 1 ? 's' : ''} (×${h.patHalfSisters})`,
      parts: h.patHalfSisters, count: h.patHalfSisters });
    pushTasib(g);
  } else if (h.patHalfSisters > 0 && !B.patHalfSisters && sistersWithDaughters &&
             h.fullSisters === 0 && h.fullBrothers === 0) {
    pushTasib([{ heir: `Paternal Half-Sister${h.patHalfSisters > 1 ? 's' : ''} (×${h.patHalfSisters})`,
      parts: 1, count: h.patHalfSisters, source: 'Bukhari 6736',
      note: 'Sister takes the remainder alongside daughters (maʿa l-banāt)' }]);
  } else if (resDec > 0.0001) {
    results.push({ heir: 'Remaining Estate', shareFraction: pct(residue),
      shareDecimal: resDec, amount: dist * resDec, source: '—', type: 'asabah',
      note: 'No residuary heir selected — may revert to fixed-share heirs (radd) or Bayt al-Māl; consult a scholar' });
  }

  /* ── 13 · Blocked-heir rows ── */
  const heirLabels = {
    paternalGrandfather: 'Paternal Grandfather', paternalGrandmother: 'Paternal Grandmother',
    maternalGrandmother: 'Maternal Grandmother', grandsons: "Son's Sons",
    granddaughters: "Son's Daughters", fullBrothers: 'Full Brothers', fullSisters: 'Full Sisters',
    patHalfBrothers: 'Paternal Half-Brothers', patHalfSisters: 'Paternal Half-Sisters',
    matHalfBrothers: 'Maternal Half-Brothers', matHalfSisters: 'Maternal Half-Sisters'
  };
  Object.entries(B).forEach(([k, v]) => {
    const selected = h[k] === true || h[k] > 0;
    if (v && heirLabels[k] && selected) {
      blockedRows.push({ heir: heirLabels[k], shareFraction: 'Excluded',
        shareDecimal: 0, amount: 0, source: v.src, type: 'blocked', note: v.reason });
    }
  });

  return results.concat(blockedRows);
}

/* ─── Namespace + load confirmation ──────────────────────────────── */
window.II = window.II || {};
window.II.inheritance = window.II.inheritance || {};
window.II.inheritance.engineVersion = '1.0';
console.info('[II/inheritance] Farā\u2019iḍ engine v1.0 loaded — An-Nisa 4:11 · 4:12 · 4:176 + Sahih ḥijb rules');
