# Quran Module — Functional Document v2.0

> Maintained by: IslamicInfo founding team  
> Updated: 2026-05-16  
> Changes from v1: Renamed Arabic Only → Mushaf Mode · Added multilingual translation · Added futuristic reader features (§15–§22)

---

## 1. Product Purpose

The Quran module is a full-featured Quran reading experience that supports Surah browsing, live verse reading, audio recitation, translation, word-by-word study, Tajweed coloring, Tafsir, bookmarks, notes, comparison mode, reading mode, study mode, and AI explanation. The main goal is to let users read the Quran in a traditional or study-oriented way without losing access to supporting tools.

---

## 2. Primary User Goals

- Choose a Surah quickly from the sidebar or search.
- Read Quran text in a traditional page-style or study-style layout.
- Listen to recitation while following the text.
- See word-by-word meaning and grammar.
- Open Tafsir and related study tools without leaving the page.
- Save bookmarks, notes, and reading progress.

---

## 3. Main Layouts

The interface has two major reading experiences: the standard study reader and the Mushaf page reader.

The **study reader** shows ayahs as cards with Arabic text, word-by-word rows, translation, and compare panels.

The **Mushaf reader** shows the Quran in a page-based Uthmani style layout with grouped lines, a page header, a page counter, and page navigation. This is the "reading it like a real book" experience.

---

## 4. Surah Selection

The user starts by selecting a Surah from the left sidebar or from search results. When a Surah is selected, the header updates with the Surah name, type, verse count, and Juz information. The verse area updates to show the selected Surah's content, and audio controls reset to the current Surah.

---

## 5. Reading Modes

### 5.1 Study Mode
Study mode is the default detailed reading layout. It shows each ayah as a card with Arabic text, word-by-word breakdown, translation, and compare content. It supports verse actions: play, bookmark, copy, share, note, AI explain, and trace view.

### 5.2 Mushaf Mode *(formerly "Arabic Only")*
This is the traditional page-by-page reading layout. In this mode, the Quran looks like a real Mushaf page, with grouped lines, page numbering, surah/page headers, and the familiar book-like reading format. The page supports word-by-word, translation, compare, and Tafsir access from the same view.

**Naming decision:**  
Use **"Mushaf Mode"** as the primary button label (in the reader toolbar). This is the most recognized term for a traditional Quran layout, familiar to Arabic readers and non-Arabic readers alike. "Page-by-Page" may be used as a subtitle or tooltip for clarity.

### 5.3 Word-by-Word Mode
This mode breaks the Arabic text into individual words with English gloss and part-of-speech labels. It works in both study mode and Mushaf mode. When recitation is active, the current word is highlighted in sync with audio playback.

### 5.4 Line-by-Line Mode
Groups Arabic text into semantic lines and shows meaning and grammar below each line. Useful for a more readable Quran study experience while keeping the Mushaf rhythm.

### 5.5 Translation and Compare Modes
Translation mode shows the selected translation for the verse or line. Compare mode shows multiple translations stacked together, such as Sahih International, Pickthall, and Yusuf Ali. Both modes remain available from study mode and Mushaf mode.

---

## 6. Multi-Language Translation Support

Translation mode is multilingual. Users can choose the translation language from a dropdown, including English, Bangla, Hindi, Urdu, Arabic, Spanish, French, Turkish, Malay, Indonesian, and other supported editions. The selected translation applies across study mode and Mushaf mode. Compare mode should support multiple translation editions, including across languages, when available.

### 6.1 Translation Behavior
- The user selects a language from the translation dropdown.
- The app loads the corresponding translation edition for the selected Surah or verse.
- The selected translation works in both study mode and Mushaf mode.
- Compare mode can show multiple translations, possibly in different languages when supported.
- The translation dropdown is accessible in the reader toolbar, not buried in settings.

### 6.2 Supported Translation Languages (initial set)
English · Bangla · Hindi · Urdu · Arabic (tafsir edition) · Spanish · French · Turkish · Malay · Indonesian

---

## 7. Audio and Recitation

The audio player supports play/pause, progress scrubbing, speed control, reciter selection, repeat, and verse navigation. While audio is playing, the active ayah and word are visually highlighted. The player shows a now-playing badge and waveform animation. Supported reciters include Al-Hussary, Al-Minshawi, Al-Afasy, Al-Ghamdi, and Al-Sudais (minimum 5; targeting 50+).

---

## 8. Tafsir Behavior

Tafsir is available as a dedicated reading aid and appears in a panel or trace view depending on context. Sources include Ibn Kathir, al-Tabari, and al-Qurtubi. Tafsir loads lazily when opened and does not interrupt reading flow.

---

## 9. Study Tools

- Word-by-word meaning
- Grammar tags (part of speech)
- Tajweed color highlighting (6 rules)
- Translation comparison
- Verse trace view
- AI explanation (QuranlyAI-powered)
- Notes and bookmarks
- Copy with attribution
- Share image generation

---

## 10. Reading Progress

The app tracks progress as the user reads and highlights the current ayah in the visible area. It restores the last-read location when the user returns. The sidebar progress bar and per-Surah read indicators show reading history. A 7-day streak tracker in the sidebar motivates daily reading habits.

---

## 11. Preferences and Persistence

User preferences persist across sessions: Arabic font size, translation font size, reading mode, compare mode, Tajweed state, bookmarks, notes, and last-read position. This makes the reader feel personal and continuous.

---

## 12. Mobile and Reading Mode

Reading mode removes distractions and focuses on the Quran text. The site navigation and other content are hidden, while the reader becomes the main focus. A floating exit button and keyboard escape restore the full page.

---

## 13. Search and Discovery

The app includes Quran search with filters for Arabic, translation, and topic content. Search results highlight matching text and let users jump directly to the relevant verse. The sidebar supports Surah filtering by Makki and Madani categories.

---

## 14. Share and Community Actions

The verse share flow supports share links and share image generation in square (1:1) and story (9:16) formats. Users can copy verses with attribution, save bookmarks in categories, and add notes to an ayah. These are part of the reading workflow.

---

## 15. AI Explanation and Trace View

AI explanation provides a short plain-language explanation of a verse, powered by QuranlyAI. Trace view is a deeper research mode that focuses on one verse with Tafsir, related verses, grammar, and topic links. These tools help users move from simple reading into deeper study.

---

## 16. 🆕 Futuristic Features — Reader Pain Points Solved

The features in this section go beyond what most Quran apps offer. They solve real reader pain points and make IslamicInfo distinctly valuable.

---

### 16.1 Verse Memorization Mode (Hifz Assistant)

**Pain solved:** Memorizing verses is hard without structured progressive recall. Most apps just show the text.

**How it works:**
- A dedicated "Hifz Mode" button appears in the toolbar.
- The verse is shown fully first for reading.
- Then words are progressively hidden one at a time, starting from the end.
- The user taps a hidden word to reveal it or types it in to test recall.
- A score and streak track daily memorization progress.
- Milestone badges appear at 10%, 25%, 50%, and 100% of a Surah memorized.

**Rule:** Hifz mode applies per-ayah in study mode. In Mushaf mode, it hides lines progressively.

---

### 16.2 Reading Pace Timer (Deep Reading Mode)

**Pain solved:** Rushing through verses without reflection. Users speed-read and retain nothing.

**How it works:**
- An optional timer in the reader controls area lets users set a minimum reading time per ayah.
- When the timer is active, the next-ayah button is locked until the time passes.
- A soft gold ring around the verse card acts as a countdown indicator.
- At the end of a session, a reflection prompt appears: "Which ayah stayed with you today?"

---

### 16.3 Daily Verse Journey (Personalized Reading Path)

**Pain solved:** Not knowing where to start, or reading randomly without continuity.

**How it works:**
- On first visit, the user selects a goal: Complete the Quran · Study a Juz per month · Learn Al-Fatihah deeply · Explore by theme.
- The sidebar shows a recommended "today's reading" based on their goal and past progress.
- Progress toward the goal is shown as a subtle arc in the sidebar.
- Completing a day's reading adds to a 7-day and 30-day streak.

**Note for mobile app:** The Daily Verse Journey syncs across web and app, so a user can read on mobile and continue on web without losing place.

---

### 16.4 Root Word Explorer (Linguistic Deep Dive)

**Pain solved:** Arabic learners want to understand the root system but can't look it up mid-reading.

**How it works:**
- When word-by-word mode is active, tapping/clicking any word opens a root tooltip.
- The tooltip shows: the 3-letter root · root meaning in English · all other Quran verses containing that root (count + links) · verb forms.
- This turns every Quran reading session into a passive Arabic vocabulary lesson.

**Example:** Tapping رَحِيمِ shows root ر-ح-م, meaning "mercy", and reveals that this root appears 339 times across the Quran.

---

### 16.5 Verse Emotion Tags (Community Reflection Layer)

**Pain solved:** The Quran is deeply personal. Users have no way to see how others relate to a verse.

**How it works:**
- Each verse has a small emotion tag strip: 🤲 Grateful · 💭 Reflecting · 💛 Comforting · 🌟 Inspiring · 🙏 Seeking
- Users can tap one tag per verse per session. Tags are anonymous.
- The dominant tag for each verse appears subtly in the verse footer as a warm indicator.
- This creates a shared spiritual layer across the community without personal data exposure.

**Privacy rule:** No accounts required. Tags are aggregated anonymously. No individual user data is stored.

---

### 16.6 Surah-by-Surah Thematic Map (Discovery Mode)

**Pain solved:** Most users know only a few Surahs. Discovering the Quran thematically is not possible in text-only indexes.

**How it works:**
- A visual map view (toggled from the sidebar) shows all 114 Surahs as a warm-toned grid.
- Each Surah tile is color-coded by primary theme: Theology · Law · Stories · Prayer · Eschatology · Ethics.
- Hovering or tapping a tile shows a 2-line summary, verse count, and "Open in Reader" link.
- Users can filter by theme, Juz, or revelation type (Makki/Madani).

---

### 16.7 Side-by-Side Language Reading (Multilingual Immersion)

**Pain solved:** Non-Arabic speakers want to follow Arabic and translation simultaneously, but the layouts always stack or switch.

**How it works:**
- A new layout mode: Arabic on the right, selected translation on the left, displayed in a 2-column card per verse.
- Both sides scroll together and stay in sync.
- The Arabic column maintains the Amiri font at full reading size.
- The translation side supports the full multilingual translation list (§6.2).
- This layout is available in Study Mode only (not Mushaf mode, which maintains its traditional format).

---

### 16.8 Verse of the Moment (Contextual AI Suggestion)

**Pain solved:** Users who come to the Quran in a difficult moment don't know where to turn.

**How it works:**
- A subtle "I need a verse for…" input appears below the hero section.
- The user types a feeling or situation: "I'm anxious about my future" · "I feel ungrateful" · "I'm grieving".
- The AI (QuranlyAI-powered) surfaces 2–3 contextually relevant verses with a short note on why each applies.
- Each suggested verse links directly to the reader at that verse.
- No data is stored. The suggestion is entirely ephemeral.

**Rule:** The AI never gives fatwa-style rulings. It surfaces thematic resonance only.

---

### 16.9 Offline Reading Package (Download & Go)

**Pain solved:** Users in areas with poor connectivity cannot rely on live API fetches for Quran text.

**How it works:**
- A "Download for offline" button appears in the sidebar.
- The user selects which Surahs to cache (individual, by Juz, or all 114).
- Cached data includes Arabic text, the currently selected translation, and WBW data.
- Audio files are streamed (not cached) unless the user opts into audio download via a mobile app subscription.
- A small offline indicator (teal dot) appears in the sidebar when the reader is operating from cache.

---

### 16.10 Reading Analytics (Personal Insights — Privacy First)

**Pain solved:** Users have no sense of how much of the Quran they've actually engaged with.

**How it works:**
- A private "My Quran Stats" view shows:
  - Surahs fully read (this month / all time)
  - Total verses read
  - Most-visited Surah
  - Average reading session length
  - 7-day and 30-day reading streaks
  - Languages used for translation
- All analytics are local (localStorage) by default, with no server upload.
- An optional sync to account allows cross-device access (subscription feature).

---

## 17. Mobile App Extension Notes

These features are planned for the mobile app and extend the web experience:

| Feature | Web | Mobile App |
|---|---|---|
| Hifz Mode | ✅ Basic | ✅ Full with audio testing |
| Daily Verse Journey | ✅ | ✅ Push notifications |
| Offline Reading | ✅ Surah cache | ✅ Full Quran + audio |
| Reading Analytics | ✅ Local | ✅ Cloud sync |
| Verse Emotion Tags | ✅ | ✅ |
| Root Word Explorer | ✅ | ✅ |
| Side-by-Side Language | ✅ | ✅ |
| Verse of the Moment | ✅ | ✅ |
| Surah Thematic Map | ✅ | ✅ |
| Pace Timer | ✅ | ✅ with haptic feedback |

**Subscription model note:** The free tier covers all reading, WBW, Tafsir, and audio. The subscription (mobile app) covers: cloud sync, audio download, advanced Hifz testing, and cross-device analytics.

---

## 18. Functional Rules Summary

1. **Mode naming:** "Study Mode" for verse-card layout. "Mushaf Mode" for traditional page layout. Never "Arabic Only."
2. **Translation:** Multilingual dropdown. Available in both Study and Mushaf mode. Default is English (Sahih International).
3. **WBW:** Works in both Study Mode and Mushaf Mode. Highlights in sync with audio when playing.
4. **AI tools:** QuranlyAI-powered. Never fabricate. Never give fatwa. Explain and contextualize only.
5. **Privacy:** Emotion tags are anonymous. Analytics are local by default. No personal data stored without explicit opt-in.
6. **Offline:** Arabic text and translation cacheable. Audio streams only.
7. **Performance:** Tafsir loads lazily. WBW data loads per-Surah. Never block reading UI for network.
8. **Design:** All new features follow CLAUDE.md design system. No new colors, no shimmer, no redesign without explicit instruction.

---

*End of Quran Module Functional Document v2.0*
