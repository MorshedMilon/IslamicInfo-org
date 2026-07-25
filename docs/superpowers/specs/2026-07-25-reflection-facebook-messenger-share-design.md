# Facebook + Messenger share buttons — Today's Reflection modal

**Date:** 2026-07-25
**Status:** Approved (design) — ready for implementation plan
**Surface:** Homepage "Today's Reflection" share modal (`src/js/reflection-actions.js`)

---

## 1. Goal

Add **Facebook** and **Messenger** buttons to the reflection share modal, alongside
the existing Download PNG / Share / Copy text / WhatsApp buttons, so users can push a
reflection to Facebook and Messenger (including groups) with the image, the text, and
the website link.

## 2. Hard platform constraint (drives the whole design)

Facebook and Messenger share **endpoints accept a URL only**. They cannot receive the
locally-generated PNG or custom text through a web share link:

- **Facebook** (`sharer.php?u=<URL>`) builds its own preview by scraping the linked
  page's Open Graph tags. It ignores any `quote`/text param (deprecated) and any image.
- **Messenger** web dialog (`dialog/send`) requires a registered Facebook **App ID**,
  which this project does **not** have. Only the mobile app deep link
  (`fb-messenger://share?link=<URL>`) works without one, and it carries a link only.
- **"Facebook groups" / "Messenger groups"** have **no** dedicated share URL — a group
  is chosen inside Facebook/Messenger *after* a normal share opens. Separate "groups"
  buttons would trigger the identical action, so they are **not** added (owner decision).

The only web path that sends the actual PNG to Messenger/FB/groups is the existing
**native "Share" button** (`navigator.share` with files) on mobile — unchanged here.

## 3. Chosen approach (owner-approved): "download PNG + copy text + open dialog"

Each new button, in a single user gesture, does three things so a share still feels
complete on both desktop and mobile:

1. **Copy** the share text to the clipboard. The text already includes the website link
   (built by `reflection-actions-core.buildShareText(model, SITE)` → label, Arabic,
   translation, `— ref · grade`, then the URL).
2. **Open** the platform share dialog with the link.
3. **Download** the PNG (reusing the modal's existing `downloadPNG`), attach-ready.
4. **Toast:** "Image saved & text copied — attach the image in your post."

The user attaches the downloaded image and pastes the text in the composer. This is the
honest maximum the web platform allows for FB/Messenger.

### Ordering (correctness — must be exactly this)
Within the click handler, synchronously and in this order:
1. `copyShareText()` — initiate `navigator.clipboard.writeText(text)` **while the
   document still has focus** (before any new window steals it).
2. `window.open(<platform href>, '_blank')` — synchronous, in-gesture, so it is **not**
   caught by the popup blocker (an `await`/async gap before `window.open` would be).
3. `downloadPNG()` — async canvas `toBlob` → anchor download; focus-independent, fine
   to run after.

## 4. Platform URLs

- **Facebook:** `https://www.facebook.com/sharer/sharer.php?u=<encodeURIComponent(link)>`
  (works desktop + mobile web).
- **Messenger:**
  - Mobile UA → `fb-messenger://share?link=<encodeURIComponent(link)>` (opens the app).
  - Desktop → `https://www.messenger.com/` (best-effort landing; no pre-fill possible
    without an App ID — user picks a chat/group and pastes text + attaches the image).
  - Mobile detection: a small UA check (`/Android|iPhone|iPad|iPod|Mobile/i` on
    `navigator.userAgent`), or `navigator.userAgentData.mobile` when present.

`link` = `SITE` = `https://islamicinfo.org` (the value already used by the modal).

## 5. Documented limitation (honest)

The shared link is the bare homepage, so Facebook's auto-preview shows the site's
**generic** OG card, not the specific reflection — which is precisely why the real PNG
is downloaded for manual attachment. Auto-previewing the reflection itself would require
per-reflection **permalinks + dynamic Open Graph images** (a Cloudflare Worker route);
that is explicitly **out of scope** here and noted as a possible future upgrade.

## 6. Files & responsibilities

- **`src/js/quran-share-core.js`** — add two pure builders (this core is already reused
  by the reflection modal as `shareCore`, e.g. `shareCore.waHref`):
  - `fbSharerHref(url)` → `'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(String(url||''))`
  - `messengerHref(url, mobile)` → mobile: `'fb-messenger://share?link=' + encodeURIComponent(String(url||''))`; desktop: `'https://www.messenger.com/'`
  - Export both in the returned object.
- **`src/js/reflection-actions.js`**:
  - Two buttons in `.refl-share-acts` markup: `<button class="refl-fb">Facebook</button>`
    and `<button class="refl-msgr">Messenger</button>`, after `.refl-wa`.
  - Handlers `shareFacebook()` / `shareMessenger()` implementing §3 ordering; a
    `copyShareText()` helper (silent variant of the existing `copyText`, no "Copied"
    toast since these show their own combined toast); an `isMobileUA()` helper.
  - Wire the two buttons in `injectModal()` next to the existing `.refl-wa` wiring.
  - No new CSS needed — the buttons inherit `.refl-share-acts button` (monochrome
    teal-outline). The 2-col grid reflows to: [Share|Copy] [WhatsApp|Facebook]
    [Messenger|·]. (Download PNG keeps `grid-column:1/-1`.) No brand colors (consistent
    with the existing "monochrome, not brand-green" convention).
- **`tests/quran/share-core.test.js`** — unit tests for `fbSharerHref` and
  `messengerHref` (both branches).

## 7. Testing

- **TDD (unit):** `fbSharerHref` encodes the URL correctly; `messengerHref(url, true)`
  returns the `fb-messenger://` deep link with encoded link; `messengerHref(url, false)`
  returns the `messenger.com` desktop URL. Run: `node --test tests/quran/share-core.test.js`.
- **Manual browser:** open the reflection share modal; click Facebook → FB sharer opens,
  PNG downloads, text is on the clipboard, toast shows; click Messenger on desktop →
  messenger.com opens, PNG downloads, text copied. Verify the 6-button grid layout in
  light + dark.

## 8. Non-goals / out of scope

- Per-reflection permalinks and dynamic Open Graph images (auto FB preview).
- Registering a Facebook App ID / Messenger web Send dialog.
- Separate "Facebook Groups" / "Messenger Groups" buttons (redundant — no distinct URL).
- Mirroring these buttons into the Quran-page share modal (`quran-share.js`) — an easy
  follow-up once this is validated, but not part of this change.

## 9. Authenticity / charter

No religious-content generation. Attribution (reference + grade) and the website link
are preserved by the existing `buildShareText`. No fabrication surface. Design system
untouched (no new colors/fonts).
