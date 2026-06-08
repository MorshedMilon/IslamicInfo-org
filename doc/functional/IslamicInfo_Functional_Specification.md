IslamicInfo

Home Page & Global Features

Functional Specifications Document*Functional Specifications Document*

v1.0 \| May 2026*v1.0 \| May 2026*

A Digital Sanctuary for Authentic Islamic Knowledge*A Digital Sanctuary
for Authentic Islamic Knowledge*

**Table of Contents**

1.  1\. Executive Summary

2.  2\. Home Page Overview

3.  3\. Global Language Selector

4.  4\. Dark Mode / Light Mode

5.  5\. Search Functionality

6.  6\. Navigation & Button Linking

7.  7\. Global Features & Content Actions

8.  8\. Card & Component Specifications

9.  9\. Technical Architecture

10. 10\. Implementation Roadmap

1\. Executive Summary

IslamicInfo is a multi-language, accessible digital platform dedicated
to authentic Islamic knowledge. This document specifies the functional
requirements for the home page and site-wide features that enable users
to discover, engage with, and learn from Qur\'anic verses, Hadith, Duas,
and verified Islamic scholarship.

Key Objectives:**Key Objectives:**

- Provide an intuitive entry point for users to access all major
  sections of the website

- Support 10+ languages with a persistent, user-friendly language
  selector

- Enable seamless switching between dark and light modes across the
  entire site

- Empower users with global actions: sharing, note-taking, bookmarking,
  copying, playing audio, and AI explanations

- Maintain visual hierarchy, accessibility, and performance standards

2\. Home Page Overview

2.1 Page Purpose

The home page serves as the primary landing page for IslamicInfo,
guiding users to the platform\'s core offerings: Qur\'an Explorer,
Hadith Library, Islamic Studies, Knowledge Hub, Daily Duas, Islamic
Tools, and Habit Tracker. The page establishes the site\'s brand
identity, showcases key features, and enables quick navigation.

2.2 Layout Structure

The home page follows a responsive, section-based architecture:

11. Header with navigation, search, language selector, and theme toggle

12. Bismillah bar (introductory Islamic element)

13. Hero section with primary CTA (Start Learning)

14. Feature cards with icons, descriptions, and action buttons

15. Prayer times / Islamic calendar section

16. Testimonials or user engagement section

17. Footer with site map, social links, and legal information

3\. Global Language Selector

3.1 Overview

The language selector enables users to switch the entire website UI into
their preferred language. This is NOT merely translating the Qur\'an
text---it translates all interface elements, navigation labels, button
text, help content, and instructional text across the entire site.

3.2 Supported Languages

Initial launch languages:

18. English

19. Bangla

20. Arabic

21. Hindi

22. Urdu

23. Spanish

24. French

25. Turkish

26. Malay

27. Indonesian

3.3 Placement & UI

- Location: Header (top-right area or dedicated settings icon)

- Style: Dropdown menu with flag icons and language names in both
  English and native script

- Default: User\'s browser language (if supported), otherwise English

- Visibility: Always accessible, including on the home page

3.4 Implementation Details

Locale Files

Store all UI text in JSON locale files (e.g., en.json, bn.json, ar.json,
etc.). Each file contains key-value pairs for every UI element:

- Navigation menu labels

- Button text (Start Learning, Read More, etc.)

- Card titles, descriptions, and CTAs

- Form labels and placeholders

- Help text, errors, and success messages

- Footer links and legal text

Arabic Content Handling

Keep Qur\'an text in Arabic (original language, never translated). The
language selector only affects the UI wrapper---navigation, labels,
explanations, and interface text---not the Qur\'anic content itself.

Persistence

- Store the user\'s language choice in localStorage

- Apply the saved language on every page load

- Also sync with user profile if authentication exists

- Handle text direction (RTL for Arabic, Urdu; LTR for others)

4\. Dark Mode / Light Mode

4.1 Overview

The theme toggle (dark/light mode) is a site-wide setting that changes
the visual appearance of every page. The existing implementation uses
data-theme attribute and CSS variables, which must be extended to all
pages.

4.2 Implementation

- Theme toggle button in header (sun icon for dark mode, moon icon for
  light mode)

- Store user preference in localStorage (islamicinfo-theme)

- Apply theme on page load (respect saved preference or default to
  light)

- Use CSS variables to define light and dark color palettes

- Bismillah bar glows in dark mode (gold glow effect via filter:
  drop-shadow)

- Ensure WCAG contrast ratios are met in both modes

5\. Search Functionality

5.1 Overview

The search feature allows users to quickly find content across the
website. The search icon in the header, when clicked, expands into a
search input field with a blurred backdrop.

5.2 User Interaction

28. User clicks search icon

29. Popup overlay appears with blur effect on background

30. Input field auto-focuses

31. User types search query

32. Search results appear (real-time or on Enter)

33. Pressing Escape or clicking outside closes the popup

5.3 Scope

- Search across Qur\'an verses (by Surah name, verse number, keyword)

- Search across Hadith collections

- Search across Duas

- Search across articles and knowledge base

- Support language-aware search (e.g., search in English returns English
  UI, but Qur\'an text remains Arabic)

6\. Navigation & Button Linking

6.1 Main Navigation Items

The header navigation must link to the following pages:

  ----------------- ------------------ -----------------------------------
  **Nav Item**      **URL/Route**      **Description**

  Home              /                  Home page

  Qur\'an Explorer  /quran             Browse and study Qur\'anic verses

  Hadith Library    /hadith            Search and explore authentic Hadith

  Islamic Studies   /islamic-studies   In-depth learning modules

  Knowledge Hub     /knowledge-hub     Articles and scholarship

  Daily Duas        /dua               Collection of authentic Duas

  Islamic Tools     /tools             Prayer times, Hijri calendar, etc.

  Habit Tracker     /habits            Track Islamic practices

  Verify a Claim    /verify            Fact-check Islamic information
  ----------------- ------------------ -----------------------------------

6.2 Home Page Button Linking

All buttons and CTAs on the home page must route to their respective
pages:

  ----------------- -------------------------- --------------------------
  **Button Text**   **Target Page/Route**      **Action**

  Start Learning    /islamic-studies           Navigate to Islamic
                                               Studies

  Explore Qur\'an   /quran                     Open Qur\'an Explorer

  Discover Hadith   /hadith                    Open Hadith Library

  Daily Duas        /dua                       Browse Duas collection

  Track Habits      /habits                    Launch Habit Tracker

  Islamic Tools     /tools                     Access tools (prayer
                                               times, etc.)
  ----------------- -------------------------- --------------------------

6.3 Card Action Routing

Feature cards may display multiple action buttons (Read More, View,
Listen, Explore, Start Tracking, etc.). Each must link correctly to its
respective page or section:

- \'View\' → Opens a dedicated view/detail page

- \'Listen\' → Navigates to audio playback page or opens player

- \'Read\' → Displays text content in full-page view

- \'Explore\' → Opens an exploratory interface (map, timeline, or
  collection view)

- \'Start Tracking\' → Initiates the habit tracker (linking to the Habit
  Tracker page)

- \'Read More\' → Expands the card or navigates to the full content page

7\. Global Features & Content Actions

7.1 Overview

Throughout the website, any Qur\'anic verse, Hadith, Dua, or knowledge
content must support the following actions. These are NOT
page-specific---they are globally available on every relevant content
piece.

7.2 Required Global Actions

  -------------- ---------------------------- ----------------------------
  **Action**     **Purpose**                  **Implementation**

  Share with     Generate and share content   Create PNG with content +
  Image          with decorative Islamic      source; allow
                 image                        download/social share

  Take Notes     Record personal thoughts     Modal with text input; store
                 linked to content            in localStorage/account

  Bookmark       Save content for later       Toggle state; store in
                 access                       collection; accessible in
                                              dedicated view

  Copy           Copy content to clipboard    Copy text; show confirmation
                                              toast

  Play (Audio)   Listen to audio recitations  Inline player with speed
                                              control, timeline, multiple
                                              reciter options

  AI Explanation Provide intelligent          Call Claude API; display in
                 contextual explanation       modal; cache results; cite
                                              sources
  -------------- ---------------------------- ----------------------------

7.3 UI Pattern

- Each verse, Hadith, or Dua is displayed in a card or section with an
  action bar

- The action bar contains icon buttons for each global action

- Hovering over an icon shows a tooltip

- Actions persist within a session; saved items (bookmarks, notes) are
  stored in localStorage or a user account

7.4 Feature Specifications

Share with Image

- Generate a shareable image (PNG) with the content + source attribution

- Allow user to download or share directly to social media

- Include Bismillah or decorative Islamic elements in the image

- Respect user\'s chosen language (UI labels in their language, content
  in original)

Take Notes

- Open a notes modal or sidebar

- Allow free-form text entry

- Auto-link note to the content (verse ID, Hadith ID, Dua ID)

- Store notes in localStorage or user account

- Display note count next to the icon

Bookmark

- Toggle bookmark state (filled/unfilled icon)

- Store bookmarks in localStorage or user account

- Enable user to view all bookmarks in a dedicated section

Copy

- Copy content (verse text, Hadith text, Dua) to clipboard

- Show \'Copied!\' confirmation toast

- Optionally include source attribution in copied text

Play (Audio)

- Display an inline audio player

- Support multiple audio recitations (e.g., different Quran reciters)

- Allow speed adjustment (0.75x, 1x, 1.5x, 2x)

- Show current time / duration

AI Explanation

- Provide an intelligent, contextual explanation of the content

- Use Claude API or another AI service to generate explanations

- Display explanation in a modal or sidebar

- Include source citations and scholarly context

- Cache explanations to reduce API calls

8\. Card & Component Specifications

8.1 Feature Cards

Feature cards on the home page present major sections of the website.
Each card includes:

- Icon (meaningful and representative of the section)

- Title

- Brief description

- CTA button (e.g., \'Explore\', \'View\', \'Start Learning\')

- Hover effect: Scale (1.02) + translateY (-6px)

- Background: Light teal or gold accent (adapt to light/dark mode)

8.2 Prayer Time Cards

Prayer cards display prayer times and are interactive:

- Display prayer name (Fajr, Dhuhr, Asr, Maghrib, Isha)

- Show time in user\'s local timezone

- Highlight next upcoming prayer

- Hover effect: Lift 8px + rotateX(5deg) + teal glow border

- Responsive grid: 5 columns on desktop, 3 columns at 768px, stack on
  mobile

9\. Technical Architecture

9.1 Frontend Stack

- HTML5 for semantic structure

- CSS3 with CSS variables for theming (dark/light mode)

- JavaScript (Vanilla or lightweight framework)

- Responsive design (mobile-first approach)

9.2 Localization

- i18n library (e.g., i18next) for managing translations

- Locale JSON files: src/locales/en.json, bn.json, ar.json, etc.

- Language selector stores choice in localStorage

- RTL support for Arabic and Urdu (CSS direction property)

9.3 Data Storage

- localStorage for: theme preference, language choice, bookmarks, notes

- Backend API for: user accounts (if authenticated), synchronized
  bookmarks, notes history

- Static content: Qur\'an, Hadith, Duas served from CDN

9.4 Performance

- Lazy load images and content sections

- Minimize JavaScript bundle size

- Cache translations and content

- Use Web Workers for heavy computations (e.g., AI explanations)

9.5 Accessibility

- WCAG 2.1 AA compliance

- Semantic HTML (nav, main, section, article)

- ARIA labels for interactive elements

- Keyboard navigation support

- Screen reader optimization

- Sufficient color contrast in both light and dark modes

10\. Implementation Roadmap

10.1 Phase 1: Foundation (Weeks 1-2)

34. Set up project structure and build tools

35. Implement language selector with 10 languages

36. Create locale JSON files for all UI text

37. Extend dark/light mode to all pages

38. Build home page layout with feature cards

10.2 Phase 2: Global Features (Weeks 3-4)

39. Implement global action buttons (Share, Note, Bookmark, Copy, Play,
    AI Explain)

40. Build note-taking modal and bookmark management

41. Create audio player component with playback controls

42. Implement image generation and sharing

43. Integrate AI explanation service

10.3 Phase 3: Content Pages (Weeks 5-8)

44. Build Qur\'an Explorer page

45. Build Hadith Library page

46. Build Islamic Studies page

47. Build Daily Duas page

48. Build Habit Tracker page

49. Integrate global actions into all content pages

10.4 Phase 4: Testing & Optimization (Week 9)

50. Cross-browser testing

51. Mobile responsiveness testing

52. Accessibility audit (WCAG 2.1 AA)

53. Performance optimization

54. User testing with multilingual users

10.5 Phase 5: Launch (Week 10)

55. Deploy to production

56. Set up monitoring and analytics

57. Create user documentation

58. Begin gathering user feedback

Conclusion

This functional specification outlines the complete requirements for
IslamicInfo\'s home page and global features. By implementing
multi-language support, theme persistence, global content actions, and
seamless navigation, the platform will deliver an exceptional user
experience for millions of users seeking authentic Islamic knowledge.

The features described---language selection, dark mode, search,
bookmarking, note-taking, audio playback, and AI explanations---create
an engaging, accessible, and comprehensive digital sanctuary for Islamic
learning.

For questions or clarifications, refer to the implementation roadmap and
consult the existing HTML mockup (home_fixed.html) for design reference.
