# IslamicInfo — A Digital Sanctuary

IslamicInfo is a premium, lightweight, and responsive web application built with vanilla HTML, CSS, and JavaScript. It serves as an authentic, source-cited digital sanctuary for Islamic knowledge, including Qur'an Explorer, Hadith Library, Daily Duas, Habit Trackers, and Islamic Inheritance Calculators.

All content on the platform is strictly source-cited and verified, free of external opinion, advertisements, or sectarian bias.

---

## 📂 Project Structure

```text
islamicinfo-org/
├── mockups/                # Raw reference mockup files (read-only)
└── site/                   # Production site folder (deployed to GitHub Pages)
    ├── index.html          # Homepage with prayer times & daily reminders
    ├── quran.html          # Quran Explorer (Mushaf and Study modes, audio, word-by-word)
    ├── hadith.html         # Hadith Library (9 major collections, authentication grades)
    ├── habits.html         # Habit Tracker (sincerity dashboard, streak calendar)
    ├── dua.html            # Daily Duas (categorized, audio, counter, translations)
    ├── tools.html          # Islamic Tools (inheritance calculator, zakat, qibla, prayer times)
    ├── verify.html         # Claim Verification (cross-referencing engine)
    ├── about.html          # Mission and core principles
    ├── knowledge-hub.html  # Interactive library (seerah, fiqh, theology)
    ├── islamic-studies.html# Staggered learning paths
    ├── inheritance.html    # Islamic Inheritance Calculator
    ├── assets/             # Assets directory
    │   ├── css/            # Custom CSS stylesheets
    │   ├── js/             # Custom JS scripts
    │   └── images/         # Custom graphic resources
    ├── .nojekyll           # Prevents Jekyll processing on GitHub Pages
    └── README.md           # Project documentation (this file)
```

---

## 🚀 How to Deploy on GitHub Pages

You can deploy this site directly to GitHub Pages. Follow these steps:

1. **Create a GitHub Repository**: Create a new public or private repository on GitHub (e.g., `islamicinfo-org`).
2. **Push the Code**: Initialize git in the root folder (`islamicinfo-org/`) and push the code:
   ```bash
   git init
   git add .
   git commit -m "Initialize project structure and import mockups"
   git remote add origin https://github.com/your-username/islamicinfo-org.git
   git branch -M main
   git push -u origin main
   ```
3. **Configure Pages**:
   - Go to your repository page on GitHub.
   - Click on the **Settings** tab.
   - In the left sidebar, click on **Pages** (under the "Code and automation" section).
   - Under **Build and deployment**:
     - **Source**: Select `Deploy from a branch`.
     - **Branch**: Select `main` (or `master`) and change the folder from `/ (root)` to `/site`.
     - Click **Save**.
4. **Access the Site**: After a few minutes, GitHub Actions will finish compiling the site. You will see a banner at the top of the Pages settings page showing your custom URL: `https://your-username.github.io/islamicinfo-org/`.

---

## 🛠 Features Included

- **Sanctuary Design System**: Elegant light/dark themes with harmonized HSL teal and gold color palettes, Cormorant Garamond display fonts, and premium micro-animations.
- **Mushaf & Study Modes**: The Quran Explorer features a digital Mushaf layout alongside a standard translations view with page-by-page audio synchronization.
- **Authentication Grading**: Hadiths include prominent visual tags indicating grading (Sahih, Hasan, Da'if) according to classical scholarship.
- **Privacy-First**: No ads, no tracking, and no cookie banners. All user preferences (theme, streaks, notes) are stored locally in the browser (`localStorage`).
