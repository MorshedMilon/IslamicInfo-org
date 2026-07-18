# quranly-ai-integration.md — QuranlyAI Frontend Integration
**Per-page integration guide · v1.0 · 2026-07-18**

> QuranlyAI is a vanilla-JS module: a self-mounting floating action button plus a
> lazy-loaded, Shadow-DOM panel (`quranly-ai-panel.js` + `src/css/quranly-ai.css`)
> that fetches from `POST /api/quranlyai/ask` (see `API-SPEC.md`). It **coexists**
> with the older per-verse `.ai-card` (`/api/ask-claude`) — this doc does not
> replace that; migration is a separate future task.

---

## Add it to a page

Load core, then the controller, then init — at the bottom of `<body>`:

```html
<!-- At the bottom of any page: load core then controller, then init -->
<script src="src/js/quranly-ai-core.js"></script>
<script src="src/js/quranly-ai.js"></script>
<script>QuranlyAI.init();</script>
```

The panel component and its CSS (`quranly-ai-panel.js`, `quranly-ai.css`) are **not**
included by the page — they lazy-load on first open (first click of the floating
button or an inline context button).

### Init options

```js
QuranlyAI.init({
  apiBase: 'https://api.islamicinfo.org', // optional — Worker base URL
  maxPerDay: 3,                            // optional — guest quota shown in UI
  cssUrl: undefined,                       // optional — auto-derived from script src
});
```

- **`apiBase`** — default `https://api.islamicinfo.org`. Override for local/staging testing.
- **`maxPerDay`** — default `3`. Client-side display only; the real limit is enforced server-side (`API-SPEC.md` §quota).
- **`cssUrl`** — default auto-derived from the `<script src="...quranly-ai.js">` location. Override only if the CSS is served from a different path.
- **`ii-anon-id`** (localStorage) — anonymous id `QuranlyAI.init()` generates on first run and reuses across sessions to identify the guest for quota + cache purposes. Registered in `DATA.md`.

---

## Per-page context + inline buttons

Call `QuranlyAI.setContext(ctx)` to tell QuranlyAI what the user is currently
viewing, then `QuranlyAI.renderContextButton(targetElementId, label, defaultAction)`
to inject an inline ✨ button into an existing element on the page. Clicking it
opens the panel pre-loaded with the current context and the given action.

### Quran reader

```html
<script>
QuranlyAI.setContext({ type:'quran', surah:2, ayah:255, translationId:'en-saheeh',
  tafsirSource:'ibn-kathir', language:'en', rawText: currentAyahText });
QuranlyAI.renderContextButton('ayah-255-ai-btn', '✨', 'explain');
</script>
```

### Hadith page

```html
<script>
QuranlyAI.setContext({ type:'hadith', hadithBook:'Sahih al-Bukhari', hadithNumber:50,
  language:'en', rawText: currentHadithText });
QuranlyAI.renderContextButton('hadith-ai-btn', '✨ Explain this Hadith', 'explain');
</script>
```

### Dua page

```html
<script>
QuranlyAI.setContext({ type:'dua', duaId:'morning-dua-1', rawText: currentDuaText });
QuranlyAI.renderContextButton('dua-ai-btn', '✨ Explain this Dua', 'explain');
</script>
```

### Article page

```html
<script>
QuranlyAI.setContext({ type:'article', articleId:'the-meaning-of-tawakkul', rawText: articleExcerpt });
QuranlyAI.renderContextButton('article-ai-btn', '✨ Summarize with QuranlyAI', 'summarize_tafsir');
</script>
```

### Search results (only when low/no results)

```html
<script>
QuranlyAI.setContext({ type:'search', rawText: searchQuery });
QuranlyAI.renderContextButton('search-ai-btn',
  'Didn’t find what you’re looking for? ✨ Ask QuranlyAI', 'custom');
</script>
```

---

## Chips per context type

The panel shows quick-action chips based on the active context's `type`:

| Context type | Chips shown |
|---|---|
| `quran` | Explain this Ayah, Explain Simply, Key Lessons, Related Verses, Related Hadith |
| `hadith` | Explain this Hadith, Related Verses |
| `dua` | Explain this Dua |
| `article` | Summarize this Article |
| `search` | Explain these Results |

Full action set (used by chips and `QuranlyAI.ask(action, customQuestion?)`):
`explain`, `simple`, `summarize_tafsir`, `key_lessons`, `related_verses`,
`related_hadith`, `asbab_al_nuzul`, `compare_translations`, `vocabulary`, `custom`.

---

## Public API reference

- `QuranlyAI.init(config?)` — mounts the floating button, generates/reuses `ii-anon-id`.
- `QuranlyAI.setContext(ctx)` — registers what the user is currently viewing.
- `QuranlyAI.open(prefilledAction?)` — opens the panel, optionally pre-selecting an action.
- `QuranlyAI.close()` — closes the panel.
- `QuranlyAI.ask(action, customQuestion?)` — fires a request for the active context.
- `QuranlyAI.renderContextButton(targetElementId, label, defaultAction)` — injects an inline ✨ button into an existing page element.

---

## Prerequisites / status

- **Backend:** requires `POST /api/quranlyai/ask` (Worker) to be deployed and
  reachable at `apiBase`. Live use needs the `api.islamicinfo.org` route enabled —
  an infra prerequisite tracked with backend go-live, not yet done.
- **Content gate:** all generated output is 🕌 **human-review gated** before it
  ships to real users (`CONTENT-POLICY.md` §5), same as Modules 2 & 3.
- **Local testing:** no live Worker needed — see below.

## Demo / local testing

```bash
node tools/quranly-ai-mock.mjs
```

Then open `tools/quranly-ai-demo.html` in a browser — it points `apiBase` at
`http://localhost:8788` so the panel talks to the mock server instead of the
real Worker.
