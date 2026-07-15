# Dual Word-Sync + Reciter Dropdowns — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`).

**Goal:** (1) Highlight the current recited word in BOTH the verse line AND its WBW tile via ONE shared `data-wi` index. (2) Wire the dead top-toolbar reciter dropdown. (3) Make both reciter dropdowns share one state (select in either → syncs both + player + playback + persistence).

**Spec:** `doc/superpowers/specs/2026-07-15-wordsync-dual-and-reciter-dropdowns-design.md`. Read first. Read the FULL current `quran-audio.js` (onTime ~183, clearHighlights ~162, populatePicker ~283, selectReciter ~253, toggleReciterPicker ~273) and `quran-verses.js` (~130-139) before editing.

---

### Task 1: Verse-line per-word spans + WBW `data-wi` (`quran-verses.js`)

**Files:** Edit `src/js/quran-verses.js`.

- [ ] **Step 1:** Replace `card.appendChild(el('div', 'ayah-arabic', v.text_uthmani));` with:

```js
    var arabic = el('div', 'ayah-arabic');
    v.words.forEach(function (w, i) {
      if (i > 0) arabic.appendChild(document.createTextNode(' '));
      var span = document.createElement('span');
      span.className = 'al-word';
      span.setAttribute('data-wi', String(i + 1));
      span.textContent = w.ar;
      arabic.appendChild(span);
    });
    card.appendChild(arabic);
```

- [ ] **Step 2:** In the existing `.wbw-row` build loop, add `data-wi` to each tile — change the `forEach` to include the index and set the attribute:

```js
    v.words.forEach(function (w, i) {
      var word = el('div', 'wbw-word');
      word.setAttribute('data-wi', String(i + 1));
      word.appendChild(el('div', 'wbw-ar', w.ar));
      word.appendChild(el('div', 'wbw-en', w.en));
      wbw.appendChild(word);
    });
```

- [ ] **Step 3:** `node --check src/js/quran-verses.js` → clean.
- [ ] **Step 4:** Commit — `git add src/js/quran-verses.js && git commit -m "feat(quran): render verse line as per-word spans + data-wi on words + tiles"`

---

### Task 2: Dual-highlight + unified reciter picker (`quran-audio.js`)

**Files:** Edit `src/js/quran-audio.js` (surgical edits — do NOT rewrite).

- [ ] **Step 1: `onTime` word loop** — replace the current `var words = card.querySelectorAll('.wbw-row .wbw-word'); ...toggle('word-active', i === (w-1))...` with a single attribute-matched update over BOTH element types:

```js
    var marks = card.querySelectorAll('[data-wi]');
    Array.prototype.forEach.call(marks, function (el) { el.classList.toggle('word-active', Number(el.getAttribute('data-wi')) === w); });
```

- [ ] **Step 2: `clearHighlights`** — broaden the word-active clear from `.wbw-word.word-active` to any `.word-active`:

```js
    Array.prototype.forEach.call(document.querySelectorAll('.word-active'), function (w) { w.classList.remove('word-active'); });
```
(Keep the `.ayah-card.ayah-playing` clear line as-is.)

- [ ] **Step 3: `populatePicker`** — replace the whole function to fill BOTH pickers + all three labels:

```js
  function populatePicker() {
    ['reciterPicker', 'reciterPickerTop'].forEach(function (pid) {
      var picker = document.getElementById(pid);
      if (!picker) return;
      picker.innerHTML = '';
      reciters.forEach(function (r) {
        var opt = document.createElement('div');
        opt.className = 'reciter-opt' + (r.id === reciterId ? ' on' : '');
        var dot = document.createElement('div'); dot.className = 'reciter-opt-dot'; opt.appendChild(dot);
        opt.appendChild(document.createTextNode(r.name + (r.style ? ' (' + r.style + ')' : '')));
        opt.addEventListener('click', function (e) { if (e && e.stopPropagation) e.stopPropagation(); window.selectReciter(r.id, opt); });
        picker.appendChild(opt);
      });
    });
    setText('#reciterLabel', shortLabel(reciterId));
    setText('#reciterLabelTop', shortLabel(reciterId));
    setText('#apReciterName', reciterStyled(reciterId));
  }
```

- [ ] **Step 4: `selectReciter`** — replace the whole `window.selectReciter = ...` with the version that syncs both pickers via `populatePicker`:

```js
  window.selectReciter = function (id, el) {
    var rid = Number(id);
    if (!(rid > 0)) return;
    reciterId = rid;
    try { localStorage.setItem('ii-quran-reciter', String(reciterId)); } catch (e) {}
    populatePicker();
    Array.prototype.forEach.call(document.querySelectorAll('.reciter-picker.open'), function (p) { p.classList.remove('open'); });
    var wasPlaying = audio && !audio.paused, resumeIdx = idx, s = loadedSurah || currentSurahFromDom();
    var myGen = ++gen, ed = reciterId;
    loadedSurah = null; ayahs = [];
    if (s) fetchSurah(s, ed).then(function (a) {
      if (myGen !== gen) return;
      applyFetched(s, ed, a);
      if (wasPlaying && ayahs.length) playAt(Math.min(resumeIdx, ayahs.length - 1));
    }).catch(function () {});
    toast('Reciter: ' + shortLabel(reciterId));
  };
```

- [ ] **Step 5: `toggleReciterPicker`** — replace the existing `if (typeof window.toggleReciterPicker !== 'function') { … }` block with an UNCONDITIONAL override that toggles the picker inside whichever button was clicked and closes the others:

```js
  window.toggleReciterPicker = function (btn) {
    var target = (btn && btn.querySelector) ? btn.querySelector('.reciter-picker') : document.getElementById('reciterPicker');
    var wasOpen = target && target.classList.contains('open');
    Array.prototype.forEach.call(document.querySelectorAll('.reciter-picker.open'), function (p) { p.classList.remove('open'); });
    if (target && !wasOpen) target.classList.add('open');
  };
```

- [ ] **Step 6:** `node --check src/js/quran-audio.js` → clean.
- [ ] **Step 7:** Commit — `git add src/js/quran-audio.js && git commit -m "feat(quran-audio): dual word-sync via data-wi; unify both reciter pickers + labels"`

---

### Task 3: Wire the toolbar reciter pill + player onclick + CSS (`quran.html`)

**Files:** Edit `quran.html` (targeted).

- [ ] **Step 1: Toolbar pill** — at line ~1514, change the static reciter `ctrl-btn`. Replace `class="ctrl-btn on" onclick="showToast('Reciter: Al-Hussary')"` on that button with `class="ctrl-btn on" id="reciterBtnTop" style="position:relative;" onclick="toggleReciterPicker(this)"`, wrap its ` Al-Hussary ` text in `<span id="reciterLabelTop">Al-Hussary</span>`, and add `<div class="reciter-picker" id="reciterPickerTop"></div>` just before the button's closing `</button>`. (Keep the two SVGs.)

- [ ] **Step 2: Player pill** — at line ~1822, change `onclick="toggleReciterPicker()"` → `onclick="toggleReciterPicker(this)"`.

- [ ] **Step 3: CSS** — add near the existing `.word-active` rule (~line 1224) OR the `.reciter-picker` block (~1256):

```css
.ayah-arabic .al-word{border-radius:6px;padding:0 2px;transition:background .15s;}
.ayah-arabic .al-word.word-active{background:rgba(197,160,89,.18);color:var(--gold-700);}
[data-theme="dark"] .ayah-arabic .al-word.word-active{color:#D7B675;}
#reciterPickerTop{top:calc(100% + 8px);bottom:auto;left:0;right:auto;}
```

- [ ] **Step 4:** Commit — `git add quran.html && git commit -m "feat(quran): wire toolbar reciter dropdown; al-word active + toolbar picker CSS"`

---

### Task 4: jsdom verification

**Files:** scratchpad harnesses (NOT committed).

- [ ] **Step 1: Dual word-sync harness** `<scratchpad>/verify-wordsync.mjs`: build a `#versesCardList` card for `1:6`/`2:6` via the real `quran-verses.js` render path (or a hand-built card matching its output: `.ayah-arabic` with `.al-word[data-wi]` spans + `.wbw-row` with `.wbw-word[data-wi]` tiles, 4+ words incl. one at index 4). Drive `quran-audio.js` `onTime` with a mock `<audio>` + segments where word 4 spans `[tA,tB]`. Assert: currentTime in `[tA,tB]` + `timeupdate` → `.al-word[data-wi="4"]` AND `.wbw-word[data-wi="4"]` BOTH have `.word-active`; advance into word 5's range → both index-4 lose it and both index-5 gain it; zero console errors.

- [ ] **Step 2: Reciter harness** `<scratchpad>/verify-reciter2.mjs`: DOM with `#reciterBtnTop`+`#reciterPickerTop`+`#reciterLabelTop` and `#reciterBtn`+`#reciterPicker`+`#reciterLabel`+`#apReciterName`. Mock listReciters → full list. Assert: `toggleReciterPicker(reciterBtnTop)` opens `#reciterPickerTop` (and closes `#reciterPicker` if open); both pickers list the full set; clicking an opt in the top picker → `selectReciter` updates `#reciterLabel`+`#reciterLabelTop`+`#apReciterName` + persists `ii-quran-reciter`, and BOTH pickers' `.on` reflects the new reciter; default Alafasy; zero console errors.

- [ ] **Step 3: Run both** → each `RESULT: N passed, 0 failed`. Iterate until green. Also run `node --test tests/quran/audio-core.test.js` (must stay green).

- [ ] **Step 4:** Nothing to commit (harnesses not committed).

---

## Final review

Adversarial pass over `git diff main...HEAD`: (a) ONE index (`activeWordAt`) drives both elements via `data-wi`; both highlight/clear together; (b) `.ayah-arabic` textContent still = the verse (spaces between spans) so Modules 4/5 unaffected; (c) both reciter dropdowns share `reciterId`, sync via `populatePicker`, persist, update player name; toggle opens the right picker + closes others; opt clicks `stopPropagation` so they don't re-toggle the button; (d) default Alafasy retained; (e) no console errors; (f) verse-line word uses the existing gold (no style redesign). Then finish via superpowers:finishing-a-development-branch.
