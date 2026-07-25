# Auth Pages + Header Wiring Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add rebranded sign-in / sign-up / forgot-password pages, wire the header person icon to sign-in on all 14 pages, and connect the header search popup to real search.

**Architecture:** Three new self-contained static HTML pages adapted from the owner-supplied TravellyAi auth templates (rebranded to IslamicInfo fonts/logo/copy, light-default theme, mock/demo behavior kept and labeled honestly). Person-icon routing is centralized: a `data-account` hook on each header button + one `initAccountLink()` in `global.js`. The search popup fix reuses the already-tested `II.homeSearch.dispatchTarget`.

**Tech Stack:** Static HTML/CSS/vanilla JS, existing IslamicInfo design tokens, Google Fonts, Node test suite (`npm test`).

---

## Reference material

- Templates: the two documents the owner pasted (`sign-in.html`, `sign-up.html` from TravellyAi). `forgot-password.html` is derived from the sign-in template (single email field, no password).
- IslamicInfo Google Fonts `<link>` (copy verbatim into each new page `<head>`):
  ```html
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500;1,600&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Shippori+Mincho:wght@400;500;600;700&family=Amiri:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
  ```
- IslamicInfo logo SVG + wordmark (copy verbatim from `index.html` footer L2298-2319) for the auth pages' `.brand` block:
  ```html
  <a class="brand" href="index.html" aria-label="IslamicInfo home">
    <svg width="34" height="34" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="iif-lp" x1="0" x2="1" y1="0" y2="0"><stop offset="0%" stop-color="#00696E"/><stop offset="100%" stop-color="#1A8A91"/></linearGradient>
        <linearGradient id="iif-rp" x1="0" x2="1" y1="0" y2="0"><stop offset="0%" stop-color="#1A8A91"/><stop offset="100%" stop-color="#00696E"/></linearGradient>
        <linearGradient id="iif-gl" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stop-color="#E5C893" stop-opacity=".65"/><stop offset="100%" stop-color="#C5A059" stop-opacity="0"/></linearGradient>
      </defs>
      <path d="M36 18 Q36 18, 22 22 Q14 24, 12 28 L12 50 Q14 46, 22 44 Q30 42, 36 44 Z" fill="url(#iif-lp)"/>
      <path d="M36 18 Q36 18, 50 22 Q58 24, 60 28 L60 50 Q58 46, 50 44 Q42 42, 36 44 Z" fill="url(#iif-rp)"/>
      <path d="M36 18 L36 44" stroke="#C5A059" stroke-width=".9" stroke-linecap="round"/>
      <g transform="translate(36 14)"><path d="M0 -6 L1.5 -1.5 L6 0 L1.5 1.5 L0 6 L-1.5 1.5 L-6 0 L-1.5 -1.5 Z" fill="#C5A059"/><circle cx="0" cy="0" r="1.5" fill="white" opacity=".9"/></g>
    </svg>
    <span class="brand-text">Islamic<em>Info</em></span>
  </a>
  ```
- Pages carrying the header person button (14): `index, quran, hadith, habits, dua, tools, verify, about, contact, inheritance, islamic-studies, knowledge-hub, privacy, terms`.
  - 12 use `aria-label="Admin"`.
  - `islamic-studies.html:513` uses `title="Account"` (no aria-label, inline styles, different person SVG).
  - `knowledge-hub.html` ~L634-637 uses a person SVG (verify exact button open tag in that task).
  - `hadith.html:1277` uses class `ii-icon-btn` (others use `icon-btn`).

---

## Task 1: Create `sign-in.html` (rebranded)

**Files:**
- Create: `sign-in.html`

- [ ] **Step 1: Copy the TravellyAi sign-in template into `sign-in.html` verbatim**, then apply the swaps in Steps 2-7. (Start from the owner-pasted `sign-in.html` document.)

- [ ] **Step 2: Fonts.** In `<head>`, replace the TravellyAi Google Fonts `<link>` with the IslamicInfo one (see Reference). In the `:root` block, change:
  - `--font-sans:'Inter',...` → `--font-sans:'Libre Baskerville',Georgia,serif;`
  - `--font-mono:'JetBrains Mono',monospace;` → `--font-mono:'Shippori Mincho',ui-monospace,monospace;`
  - Leave `--font-serif:'Cormorant Garamond',...` unchanged.

- [ ] **Step 3: Default theme = light.** Change `<html lang="en" data-theme="dark">` → `<html lang="en" data-theme="light">`. Leave the head snippet that reads `localStorage.getItem('islamicinfo-theme')` as-is (it already respects the shared key; a first-time visitor now defaults light to match the site).

- [ ] **Step 4: Brand block.** Replace the `<a class="brand" ...>…TravellyAi…</a>` in `<header class="auth-top">` with the IslamicInfo logo+wordmark from Reference. Update `.brand-text em{color:...}` already targets gold — leave CSS as-is.

- [ ] **Step 5: Title + copy.**
  - `<title>` → `Sign in · IslamicInfo`
  - meta description → `Sign in to IslamicInfo.org to save your bookmarks, notes, reading progress, and habits across devices.`
  - `.auth-eyebrow` text `Welcome` → keep `Welcome`.
  - `.auth-title` `Welcome <em>back</em>` → keep.
  - `.auth-sub` → `Sign in to pick up your bookmarks, notes, and reading progress — right where you left them.`

- [ ] **Step 6: Legal + cross-links.**
  - `.legal` links `trust-center.html` (×2) → `terms.html` and `privacy.html` respectively.
  - "New here? Create an account" link already `href="sign-up.html"` — keep.
  - "Forgot password?" already `href="forgot-password.html"` — keep.
  - Footer line `TravellyAi · Part of the IslamicInfo.org family` → `IslamicInfo.org · Authentic Islamic knowledge`.

- [ ] **Step 7: Honesty label.** In the demo success branch of the submit handler, change the message to: `<b>Signed in (demo).</b> Accounts aren't live yet — this is a preview. No password was stored or sent.` Change the Google button demo message similarly: `<b>Continue with Google</b> — sign-in isn't live yet (preview).`

- [ ] **Step 8: Visual check.** Open `sign-in.html` in a browser in both light and dark (toggle via the header moon on any page first, or `localStorage.setItem('islamicinfo-theme','dark')`). Expected: IslamicInfo logo + wordmark, Libre Baskerville body text, teal/gold palette, no TravellyAi strings remain (`grep -i travelly sign-in.html` returns nothing except the intentional none).

- [ ] **Step 9: Commit**
  ```bash
  git add sign-in.html
  git commit -m "feat(auth): add rebranded sign-in page (mock)"
  ```

---

## Task 2: Create `sign-up.html` (rebranded)

**Files:**
- Create: `sign-up.html`

- [ ] **Step 1: Copy the TravellyAi sign-up template into `sign-up.html` verbatim.**

- [ ] **Step 2: Apply the identical head/font/theme/brand/legal swaps from Task 1 Steps 2-4 and Step 6** (fonts, `data-theme="light"`, IslamicInfo brand block, `terms.html`/`privacy.html`, footer line).

- [ ] **Step 3: Title + copy.**
  - `<title>` → `Create your account · IslamicInfo`
  - meta description → `Create your free IslamicInfo.org account to save bookmarks, notes, reading progress, and habits across devices.`
  - `.auth-eyebrow` `Get started` → keep.
  - `.auth-title` `Start <em>free</em>` → keep.
  - `.auth-sub` → `Create your free account to save your bookmarks, notes, reading progress, and habits across devices.`

- [ ] **Step 4: Honesty label.** In the demo success branch: `<b>Account created (demo).</b> Accounts aren't live yet — this is a preview. No password was stored or sent.` Keep the "already exists" demo error branch. Google button message as in Task 1 Step 7.

- [ ] **Step 5: Visual check** (light + dark), `grep -i travelly sign-up.html` returns nothing intentional.

- [ ] **Step 6: Commit**
  ```bash
  git add sign-up.html
  git commit -m "feat(auth): add rebranded sign-up page (mock)"
  ```

---

## Task 3: Create `forgot-password.html` (derived)

**Files:**
- Create: `forgot-password.html`

- [ ] **Step 1: Copy `sign-in.html` (the finished Task 1 file) to `forgot-password.html`** as the base (identical chrome, tokens, fonts, brand, theme).

- [ ] **Step 2: Reduce the form to a single email field.** Remove the password `.field` block and the `.row-between` (Forgot password) row. The form becomes:
  ```html
  <form id="forgotForm" novalidate>
    <div class="field" id="f-email">
      <label for="email">Email</label>
      <div class="input-wrap">
        <svg class="input-ico ico" viewBox="0 0 24 24"><path d="M2 6h20v12H2z"/><path d="M22 6 12 13 2 6"/></svg>
        <input id="email" name="email" type="email" autocomplete="email" placeholder="you@example.com" required />
      </div>
      <div class="field-error">Enter a valid email address.</div>
    </div>
    <button type="submit" class="btn btn-primary btn-lg btn-block" id="submitBtn">
      <span class="spinner" aria-hidden="true"></span>
      <span class="btn-label">Send reset link</span>
      <svg class="ico arr" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
    </button>
  </form>
  ```

- [ ] **Step 3: Copy.**
  - `<title>` → `Reset your password · IslamicInfo`
  - `.auth-eyebrow` → `Reset`
  - `.auth-title` → `Forgot your <em>password?</em>`
  - `.auth-sub` → `Enter your email and we'll send you a reset link.`
  - Remove the divider + Google button block (`.divider` and `#googleBtn`) — not relevant to reset.
  - `.auth-foot-line` → `Remembered it? <a class="link" href="sign-in.html">Back to sign in</a>`

- [ ] **Step 4: Replace the script's submit handler** with an email-only validate + demo confirmation (no password logic, no Google handler):
  ```html
  <script>
    (function(){ var root=document.documentElement, KEY='islamicinfo-theme';
      document.getElementById('themeToggle').addEventListener('click',function(){
        var next=root.getAttribute('data-theme')==='dark'?'light':'dark';
        root.setAttribute('data-theme',next); try{localStorage.setItem(KEY,next);}catch(e){} }); })();
    (function(){
      var form=document.getElementById('forgotForm'), emailEl=document.getElementById('email'),
          fEmail=document.getElementById('f-email'), btn=document.getElementById('submitBtn'),
          strip=document.getElementById('verifyStrip'), msg=document.getElementById('verifyMsg');
      var emailRe=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      form.addEventListener('submit',function(e){ e.preventDefault();
        fEmail.classList.remove('invalid');
        if(!emailRe.test(emailEl.value.trim())){ fEmail.classList.add('invalid'); return; }
        btn.classList.add('loading'); btn.disabled=true;
        setTimeout(function(){ btn.classList.remove('loading'); btn.disabled=false;
          strip.classList.add('show','ok');
          msg.innerHTML='<b>Reset link sent (demo).</b> Accounts aren\'t live yet — this is a preview.';
          window.scrollTo({top:0,behavior:'smooth'}); },900);
      });
    })();
  </script>
  ```
  (Keep the `verifyStrip`/`verifyMsg` markup that came from sign-in; it's reused here.)

- [ ] **Step 5: Visual check** (light + dark): single email field, no password/Google elements, reset copy, IslamicInfo brand.

- [ ] **Step 6: Commit**
  ```bash
  git add forgot-password.html
  git commit -m "feat(auth): add rebranded forgot-password page (mock)"
  ```

---

## Task 4: Add `initAccountLink()` to `global.js`

**Files:**
- Modify: `src/js/global.js` (add function + call in `boot()`)

- [ ] **Step 1: Add the function** near the other init helpers (after `initHeaderScroll`):
  ```js
  /* ─────────────────────────────────────────────────────────────────
     initAccountLink()
     Routes the header person/account button to the sign-in page.
     Each page's header button carries data-account; there is no
     session system yet, so it always goes to sign-in.html.
     ───────────────────────────────────────────────────────────────── */
  function initAccountLink() {
    var btns = document.querySelectorAll('[data-account]');
    for (var i = 0; i < btns.length; i++) {
      btns[i].style.cursor = 'pointer';
      btns[i].addEventListener('click', function () {
        window.location.assign('sign-in.html');
      });
    }
  }
  ```

- [ ] **Step 2: Call it in `boot()`** — add `initAccountLink();` alongside `initHeaderScroll();`:
  ```js
  (function boot() {
    initHeaderScroll();
    initAccountLink();
    initReveal();
    loadAnalytics();
  })();
  ```

- [ ] **Step 3: Commit**
  ```bash
  git add src/js/global.js
  git commit -m "feat(header): route data-account button to sign-in"
  ```

---

## Task 5: Add `data-account` + aria-label to the person button on all 14 pages

**Files (modify each header person button):** `index.html`, `quran.html`, `hadith.html`, `habits.html`, `dua.html`, `tools.html`, `verify.html`, `about.html`, `contact.html`, `inheritance.html`, `islamic-studies.html`, `knowledge-hub.html`, `privacy.html`, `terms.html`

- [ ] **Step 1: The 12 `aria-label="Admin"` pages.** For each of `index, quran, hadith, habits, dua, tools, verify, about, contact, inheritance, privacy, terms`, change the button open tag `aria-label="Admin"` → `aria-label="Sign in" data-account`. (Preserve existing class — `icon-btn` on most, `ii-icon-btn` on `hadith.html`. Only the attributes change.)

- [ ] **Step 2: `islamic-studies.html:513`.** Change `<button class="icon-btn" title="Account" style="border:none;cursor:pointer;">` → `<button class="icon-btn" title="Sign in" aria-label="Sign in" data-account style="border:none;cursor:pointer;">`.

- [ ] **Step 3: `knowledge-hub.html`.** Locate the person button (the `<button …>` wrapping the person SVG at ~L634-637). Add `aria-label="Sign in" data-account` to its open tag (and change any existing `aria-label`/`title` "Admin"/"Account" to "Sign in").

- [ ] **Step 4: Verify hooks present.** Run:
  ```bash
  grep -l 'data-account' index.html quran.html hadith.html habits.html dua.html tools.html verify.html about.html contact.html inheritance.html islamic-studies.html knowledge-hub.html privacy.html terms.html | wc -l
  ```
  Expected: `14`.

- [ ] **Step 5: Confirm no stray `aria-label="Admin"` remains:**
  ```bash
  grep -rl 'aria-label="Admin"' *.html
  ```
  Expected: no output.

- [ ] **Step 6: Manual check.** Open `index.html` and `islamic-studies.html`; click the person icon → lands on `sign-in.html`.

- [ ] **Step 7: Commit**
  ```bash
  git add index.html quran.html hadith.html habits.html dua.html tools.html verify.html about.html contact.html inheritance.html islamic-studies.html knowledge-hub.html privacy.html terms.html
  git commit -m "feat(header): wire person icon to sign-in across all pages"
  ```

---

## Task 6: Connect the header search popup to real search (`index.html`)

**Files:**
- Modify: `index.html` inline script (the search popup block ~L2250)

- [ ] **Step 1: Replace the popup Search button handler.** Find:
  ```js
  searchPopup.querySelector('.search-popup-btn').addEventListener('click', () => {
    const q = searchInput.value.trim();
    if (q) console.log('Search:', q); // hook your search logic here
    searchPopup.classList.remove('open');
  });
  ```
  Replace with a submit routine that reuses the hero's dispatch (defaults to the Hadith route, matching the hero's default tab):
  ```js
  function runPopupSearch() {
    const q = searchInput.value.trim();
    if (!q) return;                              // empty → no-op
    const target = (window.II && II.homeSearch)
      ? II.homeSearch.dispatchTarget('hadith', q)
      : { kind: 'navigate', url: 'hadith.html?q=' + encodeURIComponent(q) };
    searchPopup.classList.remove('open');
    if (target.kind === 'navigate') window.location.assign(target.url);
  }
  searchPopup.querySelector('.search-popup-btn').addEventListener('click', runPopupSearch);
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); runPopupSearch(); }
  });
  ```
  (Note: `home-search-core.js` is already loaded on `index.html`, exposing `II.homeSearch.dispatchTarget`. The fallback covers load-order safety.)

- [ ] **Step 2: Manual check.** Open `index.html`, click the search (magnifier) icon, type `prayer`, press Enter (and separately click the Search button). Expected: navigates to `hadith.html?q=prayer`. Empty query + Enter does nothing.

- [ ] **Step 3: Commit**
  ```bash
  git add index.html
  git commit -m "feat(header): wire search popup to hadith search like hero"
  ```

---

## Task 7: Regression + finish

- [ ] **Step 1: Run the test suite.**
  ```bash
  npm test
  ```
  Expected: green (no core logic changed; search reuses existing tested `dispatchTarget`).

- [ ] **Step 2: Final grep sweep for leftover template strings in the new pages:**
  ```bash
  grep -rin 'travelly\|trust-center\|JetBrains\|Inter' sign-in.html sign-up.html forgot-password.html
  ```
  Expected: no output (all rebranded).

- [ ] **Step 3: Update `docs/DATA.md` note (optional)** — no new localStorage keys are introduced (auth is mock), so no schema change. Skip unless a key is added.

- [ ] **Step 4: Finalize** via the finishing-a-development-branch skill (merge/PR decision).

---

## Self-review notes

- **Spec coverage:** sign-in (T1), sign-up (T2), forgot-password (T3), person-icon all-14 (T4+T5), search popup fix (T6), verification (T7) — all spec sections covered.
- **No real auth:** every submit path is explicitly labeled demo/preview; no credentials stored/sent — matches the honesty constraint.
- **Type/name consistency:** `data-account` hook (T5) matches selector in `initAccountLink()` (T4); `II.homeSearch.dispatchTarget('hadith', q)` (T6) matches the real signature in `src/js/home-search-core.js`.
