# Inheritance Calculator — Technical Specification
**`inheritance.html` · IslamicInfo.org · Faraid / Mīrāth Calculator**
*v1.1 · 2026-05-20 · Qur'an + Sahih Hadith only — no madhab framing*

---

## Revision History

| Version | Date | Change |
|---|---|---|
| v1.0 | 2026-05-20 | Initial technical doc |
| v1.1 | 2026-05-20 | Removed `#madhabSelect` and `onMadhabChange()`. Added `HADITH_DATA` const. Ḥijb citations now show "Bukhari 6732 · Muslim 1615". Updated disclaimer text, hero eyebrow, methodology section renamed to "Primary Sources". FAQ Q5 rewritten. |

---

## 1. Purpose & Constraints

`inheritance.html` calculates Islamic estate distribution (Faraid) directly from:

- **Qur'an:** An-Nisa 4:11, 4:12, 4:176 — fixed shares (Fard)
- **Sahih Hadith:** Bukhari 6732, Muslim 1615 — Ḥijb blocking and Aṣabah residue

**Hard constraints:**
- No fatwa issued — disclaimer always hard-coded HTML, always visible
- All verse and hadith text hardcoded in HTML — never JS-injected
- No madhab selector — not applicable to directly Qur'anic shares
- Tools nav item stays `.active` (inheritance is a sub-page, not a nav page)
- Pure client-side — zero API calls, no `localStorage`
- URL share params are the only persistence mechanism

---

## 2. File Structure

```
src/
├── inheritance.html
├── css/
│   └── inheritance.css
└── js/
    └── inheritance.js
```

**CSS imports (in order):**
```html
<link rel="stylesheet" href="css/tokens.css">
<link rel="stylesheet" href="css/global.css">
<link rel="stylesheet" href="css/inheritance.css">
```

**JS imports (end of body):**
```html
<script src="js/global.js"></script>
<script src="js/inheritance.js"></script>
```

**`applyTheme()` inline script must appear in `<head>` before any CSS.**

---

## 3. State Object

```js
const STATE = {
  estateValue:    0,
  debtAmount:     0,
  funeralAmount:  0,
  currency:       'USD',
  deceasedGender: 'male',
  heirs: {
    husband:              false,
    wives:                0,      // 1–4
    sons:                 0,
    daughters:            0,
    grandsons:            0,
    granddaughters:       0,
    father:               false,
    mother:               false,
    paternalGrandfather:  false,
    paternalGrandmother:  false,
    maternalGrandmother:  false,
    fullBrothers:         0,
    fullSisters:          0,
    paternalHalfBrothers: 0,
    paternalHalfSisters:  0,
    maternalHalfBrothers: 0,
    maternalHalfSisters:  0,
  }
};
```

---

## 4. Source Reference Constants (Hardcoded)

```js
const VERSE_DATA = {
  'An-Nisa 4:11': {
    arabic: 'يُوصِيكُمُ اللَّهُ فِي أَوْلَادِكُمْ ۖ لِلذَّكَرِ مِثْلُ حَظِّ الْأُنثَيَيْنِ ۚ فَإِن كُنَّ نِسَاءً فَوْقَ اثْنَتَيْنِ فَلَهُنَّ ثُلُثَا مَا تَرَكَ ۖ وَإِن كَانَتْ وَاحِدَةً فَلَهَا النِّصْفُ',
    english: 'Allah instructs you concerning your children: for the male, what is equal to the share of two females. But if there are only daughters, two or more, for them is two-thirds of what he left. And if there is only one, for her is half.',
    reference: 'An-Nisa 4:11'
  },
  'An-Nisa 4:12': {
    arabic: 'وَلَكُمْ نِصْفُ مَا تَرَكَ أَزْوَاجُكُمْ إِن لَّمْ يَكُن لَّهُنَّ وَلَدٌ ۚ فَإِن كَانَ لَهُنَّ وَلَدٌ فَلَكُمُ الرُّبُعُ مِمَّا تَرَكْنَ',
    english: 'And for you is half of what your wives leave if they have no child. But if they have a child, for you is one-quarter of what they leave.',
    reference: 'An-Nisa 4:12'
  },
  'An-Nisa 4:176': {
    arabic: 'يَسْتَفْتُونَكَ قُلِ اللَّهُ يُفْتِيكُمْ فِي الْكَلَالَةِ ۚ إِنِ امْرُؤٌ هَلَكَ لَيْسَ لَهُ وَلَدٌ وَلَهُ أُخْتٌ فَلَهَا نِصْفُ مَا تَرَكَ',
    english: 'They request from you a ruling. Say: Allah gives you a ruling concerning the kalala. If a man dies, leaving no child but a sister, for her is half of what he left.',
    reference: 'An-Nisa 4:176'
  }
};

const HADITH_DATA = {
  'Bukhari 6732 · Muslim 1615': {
    arabic: 'أَلْحِقُوا الْفَرَائِضَ بِأَهْلِهَا، فَمَا بَقِيَ فَهُوَ لأَوْلَى رَجُلٍ ذَكَرٍ',
    english: 'Give the fixed shares to those entitled to them. Whatever remains goes to the nearest male relative (Asabah).',
    narrator: 'Ibn Abbas (رضي الله عنه)',
    grade: 'Sahih — Agreed upon (Bukhari and Muslim)',
    reference: 'Sahih al-Bukhari 6732 · Sahih Muslim 1615'
  }
};
```

---

## 5. Core Functions

### 5.1 `readForm()`

Syncs all form inputs into `STATE`.

```js
function readForm() {
  STATE.estateValue    = Math.max(0, parseFloat(document.getElementById('estateValue').value) || 0);
  STATE.debtAmount     = Math.max(0, parseFloat(document.getElementById('debtAmount').value) || 0);
  STATE.funeralAmount  = Math.max(0, parseFloat(document.getElementById('funeralAmount').value) || 0);
  STATE.currency       = document.getElementById('currencySelect').value;
  STATE.deceasedGender = document.querySelector('input[name="deceasedGender"]:checked').value;

  STATE.heirs.husband        = document.getElementById('heirHusband')?.checked || false;
  STATE.heirs.wives          = STATE.heirs.husband ? 0
    : (document.getElementById('heirWife')?.checked
       ? Math.min(4, parseInt(document.getElementById('wifeCount')?.value) || 1) : 0);
  STATE.heirs.sons           = getHeirCount('heirSon',           'sonCount');
  STATE.heirs.daughters      = getHeirCount('heirDaughter',      'daughterCount');
  STATE.heirs.grandsons      = getHeirCount('heirGrandson',      'grandsonCount');
  STATE.heirs.granddaughters = getHeirCount('heirGranddaughter', 'granddaughterCount');
  STATE.heirs.father         = document.getElementById('heirFather')?.checked || false;
  STATE.heirs.mother         = document.getElementById('heirMother')?.checked || false;
  STATE.heirs.paternalGrandfather = document.getElementById('heirPatGrandfather')?.checked || false;
  STATE.heirs.paternalGrandmother = document.getElementById('heirPatGrandmother')?.checked || false;
  STATE.heirs.maternalGrandmother = document.getElementById('heirMatGrandmother')?.checked || false;
  STATE.heirs.fullBrothers         = getHeirCount('heirFullBrother',     'fullBrotherCount');
  STATE.heirs.fullSisters          = getHeirCount('heirFullSister',      'fullSisterCount');
  STATE.heirs.paternalHalfBrothers = getHeirCount('heirPatHalfBrother', 'patHalfBrotherCount');
  STATE.heirs.paternalHalfSisters  = getHeirCount('heirPatHalfSister',  'patHalfSisterCount');
  STATE.heirs.maternalHalfBrothers = getHeirCount('heirMatHalfBrother', 'matHalfBrotherCount');
  STATE.heirs.maternalHalfSisters  = getHeirCount('heirMatHalfSister',  'matHalfSisterCount');
}

function getHeirCount(checkboxId, counterId) {
  const cb = document.getElementById(checkboxId);
  if (!cb || !cb.checked) return 0;
  return Math.max(1, parseInt(document.getElementById(counterId)?.value) || 1);
}
```

### 5.2 `getDistributable()`

```js
function getDistributable() {
  return Math.max(0, STATE.estateValue - STATE.debtAmount - STATE.funeralAmount);
}
```

### 5.3 `validateForm()`

Returns an `errors` array. Proceed only if empty.

```js
function validateForm() {
  const errors = [];
  if (STATE.estateValue <= 0)
    errors.push('Enter a valid estate value greater than zero.');
  if (STATE.debtAmount + STATE.funeralAmount > STATE.estateValue)
    errors.push('Deductions cannot exceed estate value.');
  const anyHeir = Object.values(STATE.heirs).some(v => v === true || v > 0);
  if (!anyHeir)
    errors.push('Select at least one surviving heir.');
  return errors;
}
```

### 5.4 `applyHijb(heirs)` — Blocking Rules (Source: Bukhari 6732 · Muslim 1615)

Returns a `blocked` object. Each blocked entry: `{ reason: string, source: 'Bukhari 6732 · Muslim 1615' }`.

```js
function applyHijb(heirs) {
  const HIJB_SOURCE = 'Bukhari 6732 · Muslim 1615';
  const blocked = {};

  if (heirs.father)
    blocked.paternalGrandfather = { reason: 'Blocked by Father', source: HIJB_SOURCE };

  if (heirs.father || heirs.mother)
    blocked.paternalGrandmother = { reason: 'Blocked by Father / Mother', source: HIJB_SOURCE };

  const hasSons     = heirs.sons > 0;
  const hasChildren = (heirs.sons + heirs.daughters + heirs.grandsons + heirs.granddaughters) > 0;

  if (hasSons) {
    blocked.grandsons      = { reason: 'Blocked by Son', source: HIJB_SOURCE };
    blocked.granddaughters = { reason: 'Blocked by Son', source: HIJB_SOURCE };
  }

  if (hasSons || heirs.father) {
    const reason = hasSons ? 'Blocked by Son' : 'Blocked by Father';
    blocked.fullBrothers         = { reason, source: HIJB_SOURCE };
    blocked.fullSisters          = { reason, source: HIJB_SOURCE };
    blocked.paternalHalfBrothers = { reason, source: HIJB_SOURCE };
    blocked.paternalHalfSisters  = { reason, source: HIJB_SOURCE };
  }

  if (!blocked.paternalHalfBrothers && heirs.fullBrothers > 0) {
    blocked.paternalHalfBrothers = { reason: 'Blocked by Full Brother', source: HIJB_SOURCE };
    blocked.paternalHalfSisters  = { reason: 'Blocked by Full Brother', source: HIJB_SOURCE };
  }

  if (hasChildren || heirs.father) {
    const reason = hasChildren ? 'Blocked by Children' : 'Blocked by Father';
    blocked.maternalHalfBrothers = { reason, source: HIJB_SOURCE };
    blocked.maternalHalfSisters  = { reason, source: HIJB_SOURCE };
  }

  return blocked;
}
```

### 5.5 `calculateShares(distributable, heirs, gender)` — Returns `HeirResult[]`

**Step 1:** Call `applyHijb(heirs)`.  
**Step 2:** Fixed shares (Fard) — Qur'anic.  
**Step 3:** Aṣabah (residue) — Sunnah.  
**Step 4:** Append blocked heir rows.  
**Guard:** `Math.max(0, 1 - assigned)` — residue never negative.

```js
function calculateShares(distributable, heirs, gender) {
  const blocked = applyHijb(heirs);
  const results = [];
  let assigned = 0;

  const hasChildren = (heirs.sons + heirs.daughters +
                       heirs.grandsons + heirs.granddaughters) > 0;

  // SPOUSE — An-Nisa 4:12
  if (gender === 'female' && heirs.husband && !blocked.husband) {
    const share = hasChildren ? 0.25 : 0.5;
    results.push({ heir: 'Husband', count: 1,
      shareFraction: hasChildren ? '1/4' : '1/2',
      shareDecimal: share, amount: distributable * share,
      source: 'An-Nisa 4:12', type: 'fard' });
    assigned += share;
  }

  if (gender === 'male' && heirs.wives > 0 && !blocked.wife) {
    const share = hasChildren ? 0.125 : 0.25;
    results.push({
      heir: heirs.wives > 1 ? `Wives (×${heirs.wives})` : 'Wife',
      count: heirs.wives,
      shareFraction: hasChildren ? '1/8' : '1/4',
      shareDecimal: share, amount: distributable * share,
      perPerson: (distributable * share) / heirs.wives,
      source: 'An-Nisa 4:12', type: 'fard' });
    assigned += share;
  }

  // FATHER — An-Nisa 4:11 (fixed 1/6 if children; Asabah otherwise)
  if (heirs.father && !blocked.father && hasChildren) {
    const share = 1/6;
    results.push({ heir: 'Father', count: 1,
      shareFraction: '1/6', shareDecimal: share,
      amount: distributable * share,
      source: 'An-Nisa 4:11', type: 'fard' });
    assigned += share;
  }

  // MOTHER — An-Nisa 4:11
  if (heirs.mother && !blocked.mother) {
    const totalSiblings = heirs.fullBrothers + heirs.fullSisters +
      heirs.paternalHalfBrothers + heirs.paternalHalfSisters +
      heirs.maternalHalfBrothers + heirs.maternalHalfSisters;
    const share = (hasChildren || totalSiblings >= 2) ? 1/6 : 1/3;
    results.push({ heir: 'Mother', count: 1,
      shareFraction: (hasChildren || totalSiblings >= 2) ? '1/6' : '1/3',
      shareDecimal: share, amount: distributable * share,
      source: 'An-Nisa 4:11', type: 'fard' });
    assigned += share;
  }

  // DAUGHTERS ONLY (no sons) — An-Nisa 4:11
  if (heirs.daughters > 0 && heirs.sons === 0 && !blocked.daughter) {
    const share    = heirs.daughters === 1 ? 0.5 : 2/3;
    const fraction = heirs.daughters === 1 ? '1/2' : '2/3';
    results.push({
      heir: `Daughter${heirs.daughters > 1 ? 's' : ''} (×${heirs.daughters})`,
      count: heirs.daughters, shareFraction: fraction,
      shareDecimal: share, amount: distributable * share,
      perPerson: (distributable * share) / heirs.daughters,
      source: 'An-Nisa 4:11', type: 'fard' });
    assigned += share;
  }

  // ASABAH (RESIDUE) — Bukhari 6732, Muslim 1615
  const residue = Math.max(0, 1 - assigned);

  if (heirs.sons > 0 && !blocked.son) {
    const totalParts = heirs.sons * 2 + (heirs.daughters || 0);
    const sonUnit    = residue / totalParts;

    results.push({
      heir: `Son${heirs.sons > 1 ? 's' : ''} (×${heirs.sons})`,
      count: heirs.sons,
      shareFraction: heirs.daughters > 0 ? 'Residue (2 parts each)' : 'Residue',
      shareDecimal: sonUnit * 2 * heirs.sons,
      amount: distributable * sonUnit * 2 * heirs.sons,
      perPerson: distributable * sonUnit * 2,
      source: heirs.daughters > 0 ? 'An-Nisa 4:11 · Bukhari 6732' : 'Bukhari 6732 · Muslim 1615',
      type: 'asabah',
      note: heirs.daughters > 0 ? 'Male receives double the female share (An-Nisa 4:11)' : null
    });

    if (heirs.daughters > 0) {
      results.push({
        heir: `Daughter${heirs.daughters > 1 ? 's' : ''} (×${heirs.daughters})`,
        count: heirs.daughters, shareFraction: 'Residue (1 part each)',
        shareDecimal: sonUnit * heirs.daughters,
        amount: distributable * sonUnit * heirs.daughters,
        perPerson: distributable * sonUnit,
        source: 'An-Nisa 4:11 · Bukhari 6732', type: 'asabah', note: null
      });
    }
  } else if (heirs.father && !blocked.father && !hasChildren) {
    results.push({
      heir: 'Father', count: 1, shareFraction: 'Residue',
      shareDecimal: residue, amount: distributable * residue,
      source: 'Bukhari 6732 · Muslim 1615', type: 'asabah'
    });
  }

  // BLOCKED HEIRS
  Object.entries(blocked).forEach(([heirKey, blockInfo]) => {
    if (blockInfo) {
      results.push({
        heir: formatHeirLabel(heirKey), count: null,
        shareFraction: 'Excluded', shareDecimal: 0, amount: 0,
        source: blockInfo.source, type: 'blocked', note: blockInfo.reason
      });
    }
  });

  return results;
}
```

### 5.6 `runCalculation()`

```js
function runCalculation() {
  readForm();
  const errors = validateForm();
  const errEl  = document.getElementById('calcError');

  if (errors.length > 0) {
    errEl.textContent = errors[0];
    errEl.style.display = 'block';
    return;
  }
  errEl.style.display = 'none';

  const distributable = getDistributable();
  const results = calculateShares(distributable, STATE.heirs, STATE.deceasedGender);
  renderResults(results, distributable);
  showResults();
  document.getElementById('results-section')
    .scrollIntoView({ behavior: 'smooth', block: 'start' });
}
```

### 5.7 `renderResults(results, distributable)`

```js
function renderResults(results, distributable) {
  document.getElementById('rsTotalEstate').textContent   = fmt(STATE.estateValue);
  document.getElementById('rsDeductions').textContent    = fmt(STATE.debtAmount + STATE.funeralAmount);
  document.getElementById('rsDistributable').textContent = fmt(distributable);

  const tbody = document.getElementById('heirsTableBody');
  tbody.innerHTML = '';
  results.forEach(r => {
    const tr = document.createElement('tr');
    tr.className = 'heir-result-row' + (r.type === 'blocked' ? ' blocked-row' : '');
    tr.innerHTML = `
      <td class="hr-heir">${r.heir}</td>
      <td class="hr-share">${r.shareFraction}</td>
      <td class="hr-amount">${r.type === 'blocked' ? '—' : fmt(r.amount)}</td>
      <td class="hr-source">
        <span class="source-pill" data-source="${r.source}">${r.source}</span>
      </td>
      <td class="hr-note">${r.note || ''}</td>
    `;
    tbody.appendChild(tr);
  });

  document.querySelectorAll('.source-pill').forEach(pill =>
    pill.addEventListener('click', () => showSourceTooltip(pill.dataset.source, pill))
  );

  renderChart(results, distributable);
}
```

### 5.8 `renderChart(results, distributable)`

CSS flex stacked bar — no canvas, no library.

```js
const TEAL_SHADES = ['#00696E','#2CA4AB','#5BC1C7','#0A3A3D','#0F5257'];
const GOLD_SHADES = ['#C5A059','#E8CE89','#9A7C3F','#D4B06A'];

function renderChart(results, distributable) {
  const chart  = document.getElementById('distribution-chart');
  const legend = document.getElementById('chart-legend');
  chart.innerHTML = legend.innerHTML = '';
  let tIdx = 0, gIdx = 0;

  results
    .filter(r => r.type !== 'blocked' && r.shareDecimal > 0)
    .forEach(r => {
      const femaleHeirs = ['wife','wives','daughter','mother','sister','grandmother'];
      const isFemale = femaleHeirs.some(k => r.heir.toLowerCase().includes(k));
      const color = isFemale
        ? GOLD_SHADES[gIdx++ % GOLD_SHADES.length]
        : TEAL_SHADES[tIdx++ % TEAL_SHADES.length];

      const seg = document.createElement('div');
      seg.className = 'chart-segment';
      seg.style.cssText = `flex:${r.shareDecimal};background:${color};
        min-width:4px;height:40px;border-radius:4px;
        transition:flex 0.8s var(--ease-reverent);`;
      seg.title = `${r.heir}: ${r.shareFraction}`;
      chart.appendChild(seg);

      const li = document.createElement('div');
      li.className = 'legend-item';
      li.innerHTML = `<span class="legend-dot" style="background:${color}"></span>
        <span>${r.heir} — ${r.shareFraction}</span>`;
      legend.appendChild(li);
    });
}
```

### 5.9 `showSourceTooltip(sourceRef, anchor)`

Handles both `VERSE_DATA` and `HADITH_DATA`. For compound refs (e.g. `"An-Nisa 4:11 · Bukhari 6732"`), resolves the first matching part.

```js
function showSourceTooltip(sourceRef, anchor) {
  let tip = document.getElementById('source-tooltip');
  if (!tip) {
    tip = document.createElement('div');
    tip.id = 'source-tooltip';
    tip.className = 'source-tooltip';
    document.body.appendChild(tip);
  }

  let resolved = VERSE_DATA[sourceRef] || HADITH_DATA[sourceRef];
  if (!resolved) {
    const parts = sourceRef.split('·').map(s => s.trim());
    for (const part of parts) {
      resolved = VERSE_DATA[part] || HADITH_DATA[part];
      if (resolved) break;
    }
  }
  if (!resolved) return;

  const isHadith = !!HADITH_DATA[sourceRef] ||
    sourceRef.includes('Bukhari') || sourceRef.includes('Muslim');

  tip.innerHTML = `
    <div class="st-ref">${resolved.reference || sourceRef}</div>
    <div class="st-arabic"
         style="font-family:var(--font-arabic);direction:rtl;text-align:right;
                font-size:18px;line-height:1.8;margin-bottom:8px">
      ${resolved.arabic}
    </div>
    <div class="st-english">${resolved.english}</div>
    ${isHadith && resolved.narrator
      ? `<div class="st-narrator">Narrator: ${resolved.narrator}</div>
         <div class="st-grade">Grade: ${resolved.grade}</div>`
      : ''}
    <button onclick="this.closest('.source-tooltip').remove()" class="st-close">✕</button>
  `;

  const rect = anchor.getBoundingClientRect();
  tip.style.top  = (rect.bottom + window.scrollY + 8) + 'px';
  tip.style.left = Math.min(rect.left, window.innerWidth - 340) + 'px';

  setTimeout(() => {
    document.addEventListener('click', function handler(e) {
      if (!tip.contains(e.target) && e.target !== anchor) {
        tip.remove();
        document.removeEventListener('click', handler);
      }
    });
  }, 10);
}
```

### 5.10 `shareResult()` and `restoreFromURL()`

```js
function shareResult() {
  const params = new URLSearchParams({
    estate:  STATE.estateValue,
    debt:    STATE.debtAmount,
    funeral: STATE.funeralAmount,
    cur:     STATE.currency,
    gender:  STATE.deceasedGender,
    heirs:   Object.entries(STATE.heirs)
      .filter(([,v]) => v === true || v > 0)
      .map(([k,v]) => `${k}:${v === true ? 1 : v}`)
      .join(',')
  });
  const url = window.location.origin + '/inheritance.html?' + params.toString();
  navigator.clipboard.writeText(url)
    .then(() => showToast('Link copied — JazakAllahu Khayran'))
    .catch(() => showToast('Copy failed — please copy the URL manually'));
}

function restoreFromURL() {
  try {
    const p = new URLSearchParams(window.location.search);
    if (!p.has('estate')) return;
    document.getElementById('estateValue').value   = p.get('estate')  || 0;
    document.getElementById('debtAmount').value    = p.get('debt')    || 0;
    document.getElementById('funeralAmount').value = p.get('funeral') || 0;
    if (p.has('cur'))    document.getElementById('currencySelect').value = p.get('cur');
    if (p.has('gender')) {
      const r = document.querySelector(`input[name="deceasedGender"][value="${p.get('gender')}"]`);
      if (r) r.checked = true;
    }
    if (p.has('heirs')) {
      p.get('heirs').split(',').forEach(pair => {
        const [k, v] = pair.split(':');
        const cb = document.getElementById('heir' + k.charAt(0).toUpperCase() + k.slice(1));
        if (cb) { cb.checked = true; toggleHeirSpinner(cb); }
        const counter = document.getElementById(k + 'Count');
        if (counter) counter.value = v;
      });
    }
    runCalculation();
  } catch (e) {
    console.warn('URL restore failed:', e);
  }
}
```

### 5.11 Initialisation Sequence

```js
document.addEventListener('DOMContentLoaded', () => {
  applyTheme(localStorage.getItem('islamicinfo-theme') || 'light');
  initHeaderScroll();
  initSearchPopup();
  initMobileMenu();
  initReveal();

  ['estateValue','debtAmount','funeralAmount'].forEach(id =>
    document.getElementById(id)?.addEventListener('input', updateDistributableDisplay)
  );

  document.querySelectorAll('.heir-checkbox').forEach(cb =>
    cb.addEventListener('change', () => toggleHeirSpinner(cb))
  );

  document.querySelectorAll('input[name="deceasedGender"]').forEach(r =>
    r.addEventListener('change', updateGenderDependentHeirs)
  );

  if (window.location.search) restoreFromURL();
});

function updateDistributableDisplay() {
  const el = document.getElementById('distributableDisplay');
  if (el) el.textContent = fmt(getDistributable());
}

function fmt(n) {
  const cur = (STATE.currency === 'Other') ? 'USD' : (STATE.currency || 'USD');
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: cur, minimumFractionDigits: 2
  }).format(n);
}

function toggleHeirSpinner(cb) {
  const spinner = cb.closest('.heir-row')?.querySelector('.heir-count');
  if (spinner) spinner.style.display = cb.checked ? 'inline-block' : 'none';
}

function updateGenderDependentHeirs() {
  const isMale = document.querySelector('input[name="deceasedGender"]:checked')?.value === 'male';
  const husbandRow = document.getElementById('heirHusband')?.closest('.heir-row');
  const wifeRow    = document.getElementById('heirWife')?.closest('.heir-row');
  if (husbandRow) husbandRow.style.display = isMale ? 'none' : 'flex';
  if (wifeRow)    wifeRow.style.display    = isMale ? 'flex'  : 'none';
}

function showResults() {
  const rs = document.getElementById('results-section');
  rs.style.display = 'block';
  requestAnimationFrame(() => rs.classList.add('in'));
}
```

---

## 6. TypeScript Interfaces

```typescript
interface HeirCounts {
  husband:              boolean;
  wives:                number;    // 0–4
  sons:                 number;
  daughters:            number;
  grandsons:            number;
  granddaughters:       number;
  father:               boolean;
  mother:               boolean;
  paternalGrandfather:  boolean;
  paternalGrandmother:  boolean;
  maternalGrandmother:  boolean;
  fullBrothers:         number;
  fullSisters:          number;
  paternalHalfBrothers: number;
  paternalHalfSisters:  number;
  maternalHalfBrothers: number;
  maternalHalfSisters:  number;
}

interface HijbEntry {
  reason: string;
  source: 'Bukhari 6732 · Muslim 1615';
}

interface HeirResult {
  heir:          string;
  count:         number | null;
  shareFraction: string;
  shareDecimal:  number;           // 0.0–1.0
  amount:        number;
  perPerson?:    number;
  source:        string;           // Qur'anic verse ref or hadith ref
  type:          'fard' | 'asabah' | 'blocked';
  note?:         string | null;
}

interface VerseData {
  arabic:    string;
  english:   string;
  reference: string;
}

interface HadithData {
  arabic:    string;
  english:   string;
  narrator:  string;
  grade:     string;
  reference: string;
}
// No MadhabSelection — not applicable
```

---

## 7. Validation Rules

| Input | Rule |
|---|---|
| Estate value | `> 0` |
| Debts + Funeral | `<= estateValue` |
| Heirs | At least 1 selected |
| Wife count | 1–4 (clamped in `readForm()`) |
| All heir counts | 1–20 (min/max attributes) |
| Distributable | `Math.max(0, ...)` |
| Residue | `Math.max(0, 1 - assigned)` — never negative |

---

## 8. Error Handling

| Scenario | Behaviour |
|---|---|
| Estate = 0 | Inline error; no results |
| No heirs | Inline error; no results |
| Deductions > estate | Inline error; no results |
| All heirs blocked | Show blocked rows + note: "Estate may revert to Bayt al-Mal — consult a scholar" |
| Radd (shares sum > 1) | Note: "Fixed shares exceed 100% — Radd applies. Consult a scholar." |
| Residue with no Asabah | Note: "Remaining share may revert to Bayt al-Mal — consult a scholar." |
| URL params malformed | `try/catch` in `restoreFromURL()` → silently ignore, show empty form |
| Clipboard fails | `showToast('Copy failed — please copy the URL manually')` |

---

## 9. Edge Cases

| Scenario | Behaviour |
|---|---|
| 4 wives + children | Total wife share 1/8; perPerson = distributable × 0.125 ÷ 4 |
| Sons only | Residue split equally after fixed shares |
| 1 daughter only | 1/2 fixed (An-Nisa 4:11) |
| 2+ daughters only | 2/3 fixed (An-Nisa 4:11) |
| Father + no children | Father = Aṣabah (full residue after spouse + mother) |
| All heirs blocked | Bayt al-Mal note shown |
| Estate insolvent | Distributable = 0; warning shown |
| Shares sum = 1.0 exactly | No residue row |
| Radd scenario | Note shown; tool does not auto-apply Radd |
| URL round-trip | Encode STATE → URL → `restoreFromURL()` → same results |

---

## 10. Performance

- Zero API calls — instantaneous calculation
- `renderChart()` — CSS flex, no canvas, no library
- `renderResults()` — DOM append per row, max ~20 rows
- `showSourceTooltip()` — single reused DOM node
- All transitions: `transform`/`opacity`/`flex` — compositor-safe

---

## 11. Testing

### 11.1 Unit Tests

| Function | Test cases |
|---|---|
| `getDistributable()` | 100k − 5k − 2k = 93k; 0 debts → full estate; debts > estate → 0 |
| `validateForm()` | estate=0 → error; no heirs → error; debts>estate → error; valid → [] |
| `applyHijb()` | Son → grandsons blocked (source = Bukhari 6732); father → grandfather blocked; full brothers → paternal half-siblings blocked |
| `calculateShares()` | Husband source = "An-Nisa 4:12"; daughters source = "An-Nisa 4:11"; Asabah source = "Bukhari 6732 · Muslim 1615" |
| Share sum ≤ 1.0 | Husband 1/8 + sons/daughters residue = exactly 1.0 |
| `fmt()` | USD → "$95,000.00"; SAR → "SAR 95,000.00" |
| `shareResult()` | Encodes truthy values only; false/0 skipped |

### 11.2 Integration Tests

| Scenario | Expected | Source check |
|---|---|---|
| Husband + 2 sons + 1 daughter ($100k) | Husband 1/4; sons + daughter residue 2:1 | Husband: 4:12; sons/daughter: 4:11 + Bukhari 6732 |
| Wife + father + mother (no children, $60k) | Wife 1/4; mother 1/3; father residue | Wife: 4:12; mother: 4:11; father: Bukhari 6732 |
| 1 daughter only | 1/2 fixed | Source: 4:11 |
| Son present → grandsons blocked | Blocked row with "Bukhari 6732 · Muslim 1615" | Source pill shows hadith tooltip |
| Source pill click — 4:11 | Tooltip: full Arabic + English | Amiri font, RTL |
| Source pill click — Bukhari 6732 | Tooltip: Arabic hadith + narrator + Sahih grade | Grade: "Sahih — Agreed upon" |

---

*End of Technical Specification v1.1*
*`inheritance.html` · Qur'an An-Nisa 4:11–12, 4:176 · Bukhari 6732 · Muslim 1615*
