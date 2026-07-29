/* Dua Library — renders the real dua corpus into the page.
   Data: src/data/dua/search-corpus.json (see its meta for sources + attribution).
   Owns search, category filtering, pagination and the live counts, so the page
   never ships hardcoded dua content. Never fabricates a source line: a card
   shows a Qur'an reference, a hadith citation, or the compilation name — the
   only three things the data actually carries. */
(function () {
  'use strict';

  var CORPUS_URL = 'src/data/dua/search-corpus.json';
  var PAGE_SIZE = 12;

  var all = [];        // published duas only
  var view = [];       // current filtered set
  var shown = 0;
  var activeCat = 'all';
  var query = '';

  var grid, searchEl, loadMoreBtn;

  /* ---------- helpers ---------- */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function normLatin(s) {
    return String(s || '').toLowerCase().replace(/[^a-z0-9\s]+/g, ' ').replace(/\s+/g, ' ').trim();
  }
  function normArabic(s) {
    return String(s || '')
      .replace(/[ً-ٰٕۖ-ۭـ]/g, '')
      .replace(/[آأإٱى]/g, 'ا')
      .replace(/ء/g, '')
      .replace(/ة/g, 'ه')
      .replace(/\s+/g, ' ').trim();
  }
  function hasArabic(s) { return /[؀-ۿ]/.test(s); }

  /* Source line — only ever states what the record carries. */
  function sourceLine(d) {
    if (d.verseRef) return "Qur'an · " + d.verseRef;
    var c = d.hadithCitation;
    if (c && typeof c === 'object') {          // Phase-2 entries store a citation object
      return c.book + ' ' + c.number + (c.narrator ? ' · ' + c.narrator : '');
    }
    if (c) return String(c);
    return 'Hisn al-Muslim';
  }

  var CAT_ICON = [
    [/qur'?an/i, '📖'], [/morning|evening/i, '🌅'], [/sleep|bed|wake/i, '🛌'],
    [/prayer|salah|athan|adhan|ruki|sujood|tash|mosque/i, '🕌'],
    [/forgive|repent/i, '🤲'], [/travel|journey|vehicle|riding/i, '🧳'],
    [/food|eat|drink|meal|fast/i, '🍽️'], [/rain|wind|thunder|moon/i, '🌧️'],
    [/ill|sick|pain|cure/i, '💊'], [/dead|funeral|grave|calamity/i, '🤍'],
    [/hajj|umrah|kaaba|safa|pilgrim/i, '🕋'], [/anguish|worry|grief|distress|debt/i, '⚡'],
    [/protect|refuge|evil|enemy/i, '🛡️'], [/marriage|child|family|wedding/i, '👶'],
    [/knowledge|study/i, '📚']
  ];
  function iconFor(cat) {
    for (var i = 0; i < CAT_ICON.length; i++) if (CAT_ICON[i][0].test(cat)) return CAT_ICON[i][1];
    return '🤲';
  }

  /* Slug -> category matcher. The page's slugs (morning-evening, food-drink, …)
     don't appear literally in the compilation's chapter titles, so each maps to
     the words those titles actually use. 'quran' keys off verseRef, not the word
     "Qur'an", which also occurs in hadith chapter titles (e.g. prostration of
     recitation). */
  var CAT_RULES = {
    'morning':        /morning|evening/,
    'morning-evening': /morning|evening/,
    'prayer':         /prayer|salah|athan|adhan|ruki|sujood|tash-?ahhud|mosque|witr|qunut/,
    'sleep':          /sleep|bed|wake|waking|night/,
    'protection':     /protect|refuge|evil|enemy|harm|jinn|satan|devil/,
    'forgiveness':    /forgive|repent|istighfar/,
    'food-drink':     /food|eat|drink|meal|host|guest|milk|breaking the fast/,
    'illness':        /ill|sick|pain|cure|patient|ruqyah/,
    'travel':         /travel|journey|vehicle|riding|returning/,
    'family':         /marriage|child|family|wedding|newborn|spouse|parent|birth/,
    'knowledge':      /knowledge|study|learning/,
    'anxiety':        /anguish|worry|grief|distress|debt|anxiety|sorrow|hardship|difficult/,
    'ramadan':        /fast|ramadan|laylat|decree/,
    'hajj-umrah':     /hajj|umrah|kaaba|safa|marwah|pilgrim|talbiyah|ihram|stoning|arafah|tawaf/
  };
  function matchesCat(d, cat) {
    if (!cat || cat === 'all') return true;
    if (cat === 'quran') return !!d.verseRef;
    // The compilation has no "knowledge" chapter; the duas that actually ask for
    // knowledge are identified by their text, not their chapter title.
    if (cat === 'knowledge') return /beneficial knowledge/i.test(d.translation || '');
    var c = (d.category || '').toLowerCase();
    var re = CAT_RULES[cat];
    if (re) return re.test(c);
    return c.indexOf(String(cat).replace(/-/g, ' ')) !== -1;
  }

  /* Other narrations of the same core supplication. Every one keeps its own full
     text and citation — this only collapses the browse view. */
  function variantBlock(d) {
    var sibs = all.filter(function (x) {
      return x.variantGroup === d.variantGroup && x.variantRole === 'variant';
    });
    if (!sibs.length) return '';
    // A family can span collections, so each variant carries its OWN citation and
    // edition — the lead's edition note must not be read as covering them.
    var items = sibs.map(function (v) {
      var ed = v.edition ? ' · ' + v.edition.replace(/^.*\(standard /, '').replace(/ English edition\)$/, ' edition') : '';
      return '<li><p>' + esc(v.translation) + '</p><cite>' + esc(sourceLine(v) + ed) + '</cite></li>';
    }).join('');
    return '<details class="dua-variants">' +
      '<summary>' + sibs.length + ' further narration' + (sibs.length === 1 ? '' : 's') +
      ' of this supplication</summary>' +
      (d.variantNote ? '<p class="dv-note">' + esc(d.variantNote) + '</p>' : '') +
      '<ul>' + items + '</ul></details>';
  }

  /* ---------- rendering ---------- */
  function cardHTML(d) {
    var cat = d.category || '';
    var translit = d.transliteration
      ? '<div class="dua-transliteration">' + esc(d.transliteration) + '</div>' : '';
    // Contextual entries are quoted in the Qur'an as examples, not as supplications
    // to recite — say so on the card rather than letting it read as a recommendation.
    var note = d.contextNote
      ? '<div class="dua-context-note"><span class="dcn-label">⚠ ' +
        esc(d.contextLabel || 'Context') + '</span>' + esc(d.contextNote) + '</div>' : '';
    // The lead card of a variant group carries its other narrations, so the grid
    // shows one supplication instead of a run of near-identical cards.
    var variants = d.variantLead ? variantBlock(d) : '';
    return '' +
      '<div data-ai-selectable="dua" class="card dua-card' + (d.entryType === 'contextual' ? ' is-contextual' : '') + '" data-id="' + esc(d.id) + '">' +
        '<div class="dua-card-header">' +
          '<div class="dua-tag">' + iconFor(cat) + ' <span>' + esc(cat) + '</span></div>' +
          '<div class="dua-card-actions-top">' +
            '<button class="dua-icon-btn" data-act="save" title="Save to bookmarks" aria-label="Save to bookmarks">' +
              '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>' +
            '</button>' +
          '</div>' +
        '</div>' +
        note +
        '<div class="dua-arabic">' + esc(d.arabic) + '</div>' +
        translit +
        '<p class="dua-translation">' + esc(d.translation) + '</p>' +
        variants +
        // Which English edition this reading comes from. Phrased as an attribution,
        // never as "translated by" — the dataset names only the collection's author.
        (d.editionNote ? '<p class="dua-edition">' + esc(d.editionNote) + '</p>' : '') +
        '<div class="dua-footer">' +
          '<div class="dua-source"><span class="dua-source-dot"></span>' + esc(sourceLine(d)) + '</div>' +
          '<div class="dua-actions">' +
            '<button class="dua-btn" data-act="copy">' +
              '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>' +
              '<span>Copy</span></button>' +
            '<button class="dua-btn" data-act="share">' +
              '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>' +
              '<span>Share</span></button>' +
          '</div>' +
        '</div>' +
      '</div>';
  }

  function renderPage(reset) {
    if (!grid) return;
    if (reset) { grid.innerHTML = ''; shown = 0; }
    if (!view.length) {
      grid.innerHTML = '<p class="dua-empty" style="grid-column:1/-1;text-align:center;padding:32px 0;color:var(--ink-muted);">' +
        'No duas match that search yet. Try a different word, or clear the filter.</p>';
      if (loadMoreBtn) loadMoreBtn.style.display = 'none';
      return;
    }
    var next = view.slice(shown, shown + PAGE_SIZE);
    var html = '';
    for (var i = 0; i < next.length; i++) html += cardHTML(next[i]);
    grid.insertAdjacentHTML('beforeend', html);
    shown += next.length;
    if (loadMoreBtn) loadMoreBtn.style.display = shown < view.length ? '' : 'none';
  }

  function applyFilters() {
    var q = query.trim();
    var qa = hasArabic(q) ? normArabic(q) : '';
    var ql = qa ? '' : normLatin(q);
    view = all.filter(function (d) {
      if (!matchesCat(d, activeCat)) return false;
      // Browsing shows one card per supplication; a search is intent-driven, so
      // variant narrations become findable again.
      if (!q && d.variantRole === 'variant') return false;
      if (!q) return true;
      if (qa) return normArabic(d.arabic).indexOf(qa) !== -1;
      var hay = normLatin((d.translation || '') + ' ' + (d.category || '') + ' ' + (d.transliteration || '') + ' ' + sourceLine(d));
      return hay.indexOf(ql) !== -1;
    });
    renderPage(true);
    updateResultCount();
  }

  function updateResultCount() {
    var el = document.getElementById('duaResultCount');
    if (el) el.textContent = view.length + (view.length === 1 ? ' dua' : ' duas');
  }

  /* ---------- live counts (never hardcoded) ---------- */
  function paintCounts() {
    var total = all.length;
    var cats = {};
    all.forEach(function (d) { cats[d.category] = (cats[d.category] || 0) + 1; });
    var occasions = Object.keys(cats).length;

    var s1 = document.getElementById('statDuaCount');       if (s1) s1.textContent = total;
    var s2 = document.getElementById('statOccasionCount');  if (s2) s2.textContent = occasions;
    var sb = document.getElementById('sidebarAllCount');    if (sb) sb.textContent = total;

    // sidebar + category cards: replace invented counts with real ones
    document.querySelectorAll('.dsb-item[href*="cat="]').forEach(function (a) {
      var slug = (a.getAttribute('href').split('cat=')[1] || '').split('&')[0];
      var n = all.filter(function (d) { return matchesCat(d, slug); }).length;
      var c = a.querySelector('.dsb-count');
      if (c) c.textContent = n;
    });
    document.querySelectorAll('.cat-card[href*="cat="]').forEach(function (a) {
      var slug = (a.getAttribute('href').split('cat=')[1] || '').split('&')[0];
      var n = all.filter(function (d) { return matchesCat(d, slug); }).length;
      var c = a.querySelector('.cat-count');
      if (c) c.textContent = n + (n === 1 ? ' dua' : ' duas');
    });
  }

  /* ---------- Dua of the Day ----------
     Rotates once per UTC day so every visitor sees the same dua on a given day
     (matching the site's other daily rotations), and prev/next step through the
     pool from that day's position. Contextual/guidance entries are excluded —
     the featured slot is a recommendation. */
  var fd = { pool: [], i: 0 };

  function fdRender() {
    var d = fd.pool[((fd.i % fd.pool.length) + fd.pool.length) % fd.pool.length];
    if (!d) return;
    var host = document.querySelector('.featured-dua');
    if (!host) return;
    var set = function (sel, text) {
      var el = host.querySelector(sel);
      if (!el) return;
      el.removeAttribute('data-i18n');      // stop i18n re-writing live data
      el.removeAttribute('data-i18n-html');
      el.textContent = text;
      el.style.display = text ? '' : 'none';
    };
    set('.fd-badge', '✦ ' + (d.category || 'Supplication'));
    set('.fd-arabic', d.arabic || '');
    set('.fd-transliteration', d.transliteration || '');
    set('.fd-trans', d.translation || '');
    set('.fd-source', '📖 ' + sourceLine(d));
    host.dataset.duaId = d.id;
  }

  function fdInit() {
    var host = document.querySelector('.featured-dua');
    if (!host) return;
    fd.pool = all.filter(function (x) { return !x.entryType && x.arabic && x.translation; });
    if (!fd.pool.length) return;
    fd.i = Math.floor(Date.now() / 86400000) % fd.pool.length;   // UTC-daily
    fdRender();

    var nav = host.querySelectorAll('.fd-nav-btn');
    if (nav.length >= 2) {
      nav[0].addEventListener('click', function (e) { e.preventDefault(); fd.i--; fdRender(); });
      nav[1].addEventListener('click', function (e) { e.preventDefault(); fd.i++; fdRender(); });
    }
    // featured copy / share / save act on whichever dua is showing
    host.querySelectorAll('.fd-action-btn').forEach(function (btn, idx) {
      btn.addEventListener('click', function (e) {
        e.preventDefault(); e.stopPropagation();
        var d = all.find(function (x) { return x.id === host.dataset.duaId; });
        if (!d) return;
        if (idx === 0) {
          navigator.clipboard.writeText(copyText(d))
            .then(function () { toast('Dua copied with source ✦'); })
            .catch(function () { toast('Could not copy'); });
        } else if (idx === 1) {
          if (navigator.share) navigator.share({ title: 'Dua — IslamicInfo', text: copyText(d) }).catch(function () {});
          else navigator.clipboard.writeText(copyText(d)).then(function () { toast('Dua copied to share ✦'); }).catch(function () {});
        } else {
          try {
            var key = 'ii-dua-bookmarks';
            var saved = JSON.parse(localStorage.getItem(key) || '[]');
            var at = saved.indexOf(d.id);
            if (at === -1) { saved.push(d.id); toast('Saved ✦'); } else { saved.splice(at, 1); toast('Removed from saved'); }
            localStorage.setItem(key, JSON.stringify(saved));
          } catch (err) { toast('Could not save (storage full)'); }
        }
      }, true);
    });
  }

  /* ---------- interactions (delegated: cards are dynamic) ---------- */
  function toast(msg) {
    var t = document.getElementById('dua-toast');
    if (!t) { t = document.createElement('div'); t.id = 'dua-toast'; document.body.appendChild(t); }
    t.textContent = msg; t.classList.add('show');
    clearTimeout(toast._t); toast._t = setTimeout(function () { t.classList.remove('show'); }, 2000);
  }

  function copyText(d) {
    var parts = [d.arabic];
    if (d.transliteration) parts.push(d.transliteration);
    parts.push(d.translation, '— ' + sourceLine(d));
    // the caveat travels with the text, so a copied contextual verse is never
    // mistaken for a recommended supplication
    if (d.contextNote) parts.push('[' + (d.contextLabel || 'Context') + '] ' + d.contextNote);
    return parts.filter(Boolean).join('\n\n');
  }

  function wireDelegates() {
    if (!grid) return;
    grid.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-act]');
      if (!btn || !grid.contains(btn)) return;
      var card = btn.closest('.dua-card');
      if (!card) return;
      var d = all.find(function (x) { return String(x.id) === card.dataset.id; });
      if (!d) return;
      var act = btn.dataset.act;

      if (act === 'copy') {
        navigator.clipboard.writeText(copyText(d))
          .then(function () { toast('Dua copied with source ✦'); })
          .catch(function () { toast('Could not copy'); });
      } else if (act === 'share') {
        var text = copyText(d);
        if (navigator.share) navigator.share({ title: 'Dua — IslamicInfo', text: text }).catch(function () {});
        else navigator.clipboard.writeText(text).then(function () { toast('Dua copied to share ✦'); }).catch(function () {});
      } else if (act === 'save') {
        try {
          var key = 'ii-dua-bookmarks';
          var saved = JSON.parse(localStorage.getItem(key) || '[]');
          var i = saved.indexOf(d.id);
          if (i === -1) { saved.push(d.id); btn.classList.add('saved'); toast('Saved ✦'); }
          else { saved.splice(i, 1); btn.classList.remove('saved'); toast('Removed from saved'); }
          localStorage.setItem(key, JSON.stringify(saved));
        } catch (err) { toast('Could not save (storage full)'); }
      }
    });
  }

  function wireControls() {
    if (searchEl) {
      var t;
      searchEl.addEventListener('input', function () {
        query = this.value;
        clearTimeout(t); t = setTimeout(applyFilters, 140);
      });
    }
    document.querySelectorAll('.cat-chip').forEach(function (chip) {
      chip.addEventListener('click', function () {
        document.querySelectorAll('.cat-chip').forEach(function (x) { x.classList.remove('active'); });
        this.classList.add('active');
        activeCat = this.dataset.cat || 'all';
        applyFilters();
      });
    });
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', function (e) { e.preventDefault(); renderPage(false); });
    }
    // sidebar + category cards filter in place instead of reloading the page
    document.querySelectorAll('.dsb-item[href*="cat="], .cat-card[href*="cat="]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        activeCat = (a.getAttribute('href').split('cat=')[1] || 'all').split('&')[0];
        document.querySelectorAll('.dsb-item').forEach(function (x) { x.classList.remove('active'); });
        if (a.classList.contains('dsb-item')) a.classList.add('active');
        document.querySelectorAll('.cat-chip').forEach(function (x) {
          x.classList.toggle('active', (x.dataset.cat || '') === activeCat);
        });
        applyFilters();
        var sec = document.getElementById('duas-section');
        if (sec) sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  /* ---------- boot ---------- */
  function fail(msg) {
    if (!grid) return;
    grid.innerHTML = '<p class="dua-empty" style="grid-column:1/-1;text-align:center;padding:32px 0;color:var(--ink-muted);">' + esc(msg) + '</p>';
    if (loadMoreBtn) loadMoreBtn.style.display = 'none';
  }

  function init() {
    grid = document.querySelector('.dua-grid');
    searchEl = document.getElementById('duaSearch');
    loadMoreBtn = document.querySelector('.load-more-btn');
    if (!grid) return;

    grid.innerHTML = '<p class="dua-empty" style="grid-column:1/-1;text-align:center;padding:32px 0;color:var(--ink-muted);">Loading duas…</p>';

    var params = new URLSearchParams(location.search);
    var cat = params.get('cat'); if (cat) activeCat = cat;
    var q = params.get('q'); if (q) { query = q; if (searchEl) searchEl.value = q; }

    fetch(CORPUS_URL)
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (doc) {
        var list = (doc && doc.duas) || [];
        // entryType 'guidance' = narration about practice or virtue with no
        // supplication text; kept in the data, never shown as a dua to recite.
        all = list.filter(function (d) {
          return d && d.translation && String(d.translation).trim() && d.entryType !== 'guidance';
        });
        if (!all.length) return fail('Dua library is unavailable right now.');
        paintCounts();
        document.querySelectorAll('.cat-chip').forEach(function (x) {
          x.classList.toggle('active', (x.dataset.cat || '') === activeCat);
        });
        wireDelegates();
        wireControls();
        fdInit();
        applyFilters();
      })
      .catch(function () { fail('Could not load the dua library. Please refresh to try again.'); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
