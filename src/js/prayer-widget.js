/* ═══════════════════════════════════════════════════════════════════
   IslamicInfo.org — prayer-widget.js  (v1.0 · 2026-06)
   Self-contained controller for the homepage Prayer Times widget.

   Live data sources (free, keyless, browser-friendly):
     Prayer times + Hijri + timezone → https://api.aladhan.com/v1/
     Reverse geocode (My Location)   → https://api.bigdatacloud.net/
     Adhan audio                     → https://cdn.aladhan.com/audio/adhans/

   localStorage keys:
     ii-pw-loc     {type:'city'|'coords', label, city?, lat?, lon?}
     ii-pw-method  AlAdhan calculation method id (default 3 = MWL)
     ii-pw-adhan   selected adhan id (default a9)
     ii-pw-cache-* cached API payloads (24 h, stale-on-failure)

   HTML IDs expected on index.html:
     prayerFajr, prayerSunrise, prayerDhuhr, prayerAsr, prayerMaghrib,
     prayerIsha, prayerLocationLabel, prayerChangeBtn, prayerCityInput,
     prayerDetectBtn, prayerNextBadge, pwCountdown, pwDate,
     pwSunrise, pwSunset, pwDaylight, adhanBtn, adhanMenu,
     methodBtn, methodMenu
   ═══════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ─── Constants ───────────────────────────────────────────────── */

  const METHODS = [
    { id: 3,  label: 'Muslim World League (MWL)',     short: 'MWL' },
    { id: 2,  label: 'ISNA — North America',          short: 'ISNA' },
    { id: 4,  label: 'Umm Al-Qura, Makkah',           short: 'Umm Al-Qura' },
    { id: 5,  label: 'Egyptian General Authority',    short: 'Egypt' },
    { id: 1,  label: 'University of Karachi',         short: 'Karachi' },
    { id: 15, label: 'Moonsighting Committee',        short: 'Moonsighting' },
    { id: 13, label: 'Diyanet (Turkey)',              short: 'Diyanet' },
    { id: 16, label: 'Dubai (UAE)',                   short: 'Dubai' },
    { id: 9,  label: 'Kuwait',                        short: 'Kuwait' },
    { id: 11, label: 'Singapore (MUIS)',              short: 'MUIS' },
  ];

  const ADHANS = [
    { id: 'a9', name: 'Mishary Rashid Alafasy' },
    { id: 'a1', name: 'Ahmad al-Nafees' },
    { id: 'a2', name: 'Hafiz Mustafa Özcan (Turkey)' },
    { id: 'a4', name: 'Mishary Alafasy — Dubai One TV' },
    { id: 'a7', name: 'Mishary Alafasy (Alternate)' },
  ];
  const ADHAN_URL = id => `https://cdn.aladhan.com/audio/adhans/${id}.mp3`;

  const PRAYER_ORDER = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
  const ALL_CARDS    = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

  /* Used only when network + cache both fail */
  const FALLBACK = {
    timings: { Fajr: '04:02', Sunrise: '05:43', Dhuhr: '13:02', Asr: '17:00',
               Sunset: '20:21', Maghrib: '20:21', Isha: '21:55' },
    date: { readable: '', hijri: null },
    meta: { timezone: undefined },
    _fallbackCity: 'London, UK (approx.)',
  };

  const TTL_24H = 24 * 60 * 60 * 1000;


  /* ─── State + persistence ─────────────────────────────────────── */

  function loadState() {
    let loc = null;
    try { loc = JSON.parse(localStorage.getItem('ii-pw-loc')); } catch (_) {}
    if (!loc || !loc.type) {
      /* Migrate legacy key set by the old home.js flow, else default */
      const legacy = localStorage.getItem('ii-prayer-city');
      loc = legacy
        ? { type: 'city', city: legacy, label: legacy }
        : { type: 'city', city: 'London, UK', label: 'London, UK' };
    }
    const method = parseInt(localStorage.getItem('ii-pw-method'), 10) || 3;
    const adhan  = localStorage.getItem('ii-pw-adhan') || 'a9';
    return { loc, method, adhan };
  }

  const state = loadState();
  state.data = null;          // last successful API payload
  state.nextAt = null;        // ms timestamp of next prayer (viewer clock)
  state.nextName = null;
  state.adhanPlayedFor = null;

  function saveLoc()    { localStorage.setItem('ii-pw-loc', JSON.stringify(state.loc)); }
  function saveMethod() { localStorage.setItem('ii-pw-method', String(state.method)); }
  function saveAdhan()  { localStorage.setItem('ii-pw-adhan', state.adhan); }


  /* ─── Cache helpers (pattern mirrors api.js) ──────────────────── */

  function cacheKey() {
    const l = state.loc;
    const locKey = l.type === 'coords'
      ? `${l.lat.toFixed(3)},${l.lon.toFixed(3)}`
      : (l.city || '').toLowerCase().replace(/\s+/g, '');
    return `ii-pw-cache-${locKey}-${state.method}-${_todayLocal()}`;
  }

  function readCache(key, allowStale) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const { data, ts } = JSON.parse(raw);
      if (allowStale || Date.now() - ts < TTL_24H) return data;
    } catch (_) {}
    return null;
  }

  function writeCache(key, data) {
    try { localStorage.setItem(key, JSON.stringify({ data, ts: Date.now() })); }
    catch (_) { /* storage full — skip */ }
  }


  /* ─── Data fetching ───────────────────────────────────────────── */

  function apiUrl() {
    const d = _todayDDMMYYYY();
    const m = state.method;
    if (state.loc.type === 'coords') {
      return `https://api.aladhan.com/v1/timings/${d}?latitude=${state.loc.lat}&longitude=${state.loc.lon}&method=${m}`;
    }
    return `https://api.aladhan.com/v1/timingsByAddress/${d}?address=${encodeURIComponent(state.loc.city)}&method=${m}`;
  }

  async function fetchTimings() {
    const key = cacheKey();
    const cached = readCache(key, false);
    if (cached) return cached;

    try {
      const res = await fetch(apiUrl());
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (!json || json.code !== 200 || !json.data || !json.data.timings) {
        throw new Error('Bad payload');
      }
      writeCache(key, json.data);
      return json.data;
    } catch (err) {
      console.warn('[prayer-widget] fetch failed:', err.message);
      return readCache(key, true);   // stale is better than nothing
    }
  }

  async function refresh() {
    const data = await fetchTimings();
    if (data) {
      state.data = data;
      render(data);
    } else {
      state.data = FALLBACK;
      render(FALLBACK);
      _setText('prayerLocationLabel', FALLBACK._fallbackCity);
      toast('Live prayer times unavailable — showing approximate times');
    }
  }


  /* ─── Rendering ───────────────────────────────────────────────── */

  function render(data) {
    const t = data.timings;

    ALL_CARDS.forEach(name => _setText(`prayer${name}`, _to12h(t[name])));
    _setText('prayerLocationLabel', state.loc.label || '');

    /* Date line: Gregorian · Hijri · method */
    const method = METHODS.find(m => m.id === state.method);
    const parts = [new Date().toLocaleDateString('en-US',
      { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })];
    const h = data.date && data.date.hijri;
    if (h) parts.push(`${h.day} ${h.month.en} ${h.year} AH`);
    if (method) parts.push(`${method.short} Method`);
    _setText('pwDate', parts.join(' · '));

    /* Sun strip */
    const sunset = t.Sunset || t.Maghrib;
    _setText('pwSunrise',  _to12h(t.Sunrise));
    _setText('pwSunset',   _to12h(sunset));
    _setText('pwDaylight', _daylight(t.Sunrise, sunset));

    updateNextPrayer();
  }

  /* "Now" as minutes-since-midnight in the location's timezone */
  function nowInLocTz() {
    const tz = state.data && state.data.meta && state.data.meta.timezone;
    let now = new Date();
    if (tz) {
      try { now = new Date(now.toLocaleString('en-US', { timeZone: tz })); }
      catch (_) { /* invalid tz — use viewer clock */ }
    }
    return now;
  }

  function updateNextPrayer() {
    if (!state.data) return;
    const t = state.data.timings;
    const now = nowInLocTz();
    const nowMins = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;

    let nextName = null;
    for (const name of PRAYER_ORDER) {
      if (_mins(t[name]) > nowMins) { nextName = name; break; }
    }
    const isTomorrow = !nextName;
    if (isTomorrow) nextName = 'Fajr';

    /* Badge + card classes */
    _setText('prayerNextBadge',
      `Next: ${nextName}${isTomorrow ? ' (tomorrow)' : ''} · ${_to12h(t[nextName])}`);

    ALL_CARDS.forEach(name => {
      const el = document.getElementById(`prayer${name}`);
      const card = el && (el.closest('[data-prayer]') || el.parentElement);
      if (!card) return;
      card.classList.toggle('next-prayer', name === nextName && !isTomorrow);
      card.classList.toggle('past',
        !!t[name] && _mins(t[name]) <= nowMins && !(name === nextName && !isTomorrow));
    });

    /* Countdown target in viewer-clock ms (diff computed in location tz) */
    let diffMins = _mins(t[nextName]) - nowMins;
    if (diffMins <= 0) diffMins += 24 * 60;
    state.nextAt = Date.now() + diffMins * 60000;
    state.nextName = nextName;
  }

  function tick() {
    if (!state.nextAt) return;
    let ms = state.nextAt - Date.now();

    if (ms <= 0) {
      /* Prayer time reached: re-highlight, optionally sound the adhan once */
      if (state.adhanPlayedFor !== state.nextName) {
        state.adhanPlayedFor = state.nextName;
        playAdhan(true);
      }
      updateNextPrayer();
      /* Past midnight the cache key changes — refetch tomorrow's data */
      if (state.nextName === 'Fajr') refresh();
      ms = state.nextAt - Date.now();
    }

    const s = Math.max(0, Math.floor(ms / 1000));
    const hh = Math.floor(s / 3600);
    const mm = Math.floor((s % 3600) / 60);
    const ss = s % 60;
    _setText('pwCountdown',
      `${state.nextName} in ${hh ? hh + 'h ' : ''}${mm}m ${String(ss).padStart(2, '0')}s`);
  }


  /* ─── Adhan player ────────────────────────────────────────────── */

  let audio = null;        // shared element — one sound at a time
  let audioCtx = null;     // 'main' | adhan id being previewed

  function stopAudio() {
    if (audio) { audio.pause(); audio.currentTime = 0; }
    audioCtx = null;
    syncAdhanUi();
  }

  function playUrl(url, ctx, silentFail) {
    if (!audio) {
      audio = new Audio();
      audio.addEventListener('ended', () => { audioCtx = null; syncAdhanUi(); });
    }
    audio.src = url;
    audioCtx = ctx;
    audio.play().then(syncAdhanUi).catch(() => {
      audioCtx = null;
      syncAdhanUi();
      if (!silentFail) toast('Could not play audio — tap the page first, then retry');
    });
  }

  function playAdhan(silentFail) {
    playUrl(ADHAN_URL(state.adhan), 'main', silentFail);
  }

  function syncAdhanUi() {
    const btn = document.getElementById('adhanBtn');
    if (btn) btn.innerHTML = audioCtx === 'main' ? '⏹ Stop Adhan' : '🔔 Adhan';
    document.querySelectorAll('#adhanMenu .pw-play-mini').forEach(b => {
      b.textContent = audioCtx === b.dataset.adhan ? '⏸' : '▶';
    });
    const playAll = document.querySelector('#adhanMenu .pw-menu-foot .pw-menu-item');
    if (playAll) playAll.innerHTML = audioCtx === 'main'
      ? '⏹&nbsp; Stop'
      : '▶&nbsp; Play Selected Adhan';
  }


  /* ─── Dropdown menus ──────────────────────────────────────────── */

  function buildAdhanMenu() {
    const menu = document.getElementById('adhanMenu');
    if (!menu) return;
    menu.innerHTML = '<div class="pw-menu-head">Adhan Reciter</div>';

    ADHANS.forEach(a => {
      /* div, not button: rows contain a nested preview <button> */
      const row = document.createElement('div');
      row.setAttribute('role', 'button');
      row.tabIndex = 0;
      row.className = 'pw-menu-item' + (a.id === state.adhan ? ' on' : '');
      row.innerHTML = `<span>${a.name}</span>` +
        (a.id === state.adhan ? '<span class="tick">✓</span>' : '') +
        `<button type="button" class="pw-play-mini" data-adhan="${a.id}" aria-label="Preview">▶</button>`;
      row.addEventListener('click', e => {
        if (e.target.classList.contains('pw-play-mini')) {
          /* Preview toggle */
          e.stopPropagation();
          if (audioCtx === a.id) stopAudio();
          else playUrl(ADHAN_URL(a.id), a.id);
          return;
        }
        state.adhan = a.id;
        saveAdhan();
        buildAdhanMenu();           // re-render ticks
        toast(`Adhan set: ${a.name}`);
      });
      menu.appendChild(row);
    });

    const foot = document.createElement('div');
    foot.className = 'pw-menu-foot';
    const play = document.createElement('button');
    play.type = 'button';
    play.className = 'pw-menu-item';
    play.innerHTML = '▶&nbsp; Play Selected Adhan';
    play.addEventListener('click', () => {
      if (audioCtx === 'main') stopAudio();
      else playAdhan(false);
    });
    foot.appendChild(play);
    menu.appendChild(foot);
    syncAdhanUi();
  }

  function buildMethodMenu() {
    const menu = document.getElementById('methodMenu');
    if (!menu) return;
    menu.innerHTML = '<div class="pw-menu-head">Calculation Method</div>';

    METHODS.forEach(m => {
      const row = document.createElement('button');
      row.type = 'button';
      row.className = 'pw-menu-item' + (m.id === state.method ? ' on' : '');
      row.innerHTML = `<span>${m.label}</span>` +
        (m.id === state.method ? '<span class="tick">✓</span>' : '');
      row.addEventListener('click', () => {
        if (state.method !== m.id) {
          state.method = m.id;
          saveMethod();
          buildMethodMenu();
          refresh();
          toast(`Method: ${m.label}`);
        }
        closeMenus();
      });
      menu.appendChild(row);
    });
  }

  function closeMenus() {
    document.querySelectorAll('.pw-menu.open').forEach(m => m.classList.remove('open'));
  }

  function wireMenu(btnId, menuId) {
    const btn = document.getElementById(btnId);
    const menu = document.getElementById(menuId);
    if (!btn || !menu) return;
    btn.addEventListener('click', e => {
      e.stopPropagation();
      /* Adhan button doubles as Stop while playing */
      if (btnId === 'adhanBtn' && audioCtx === 'main' && !menu.classList.contains('open')) {
        stopAudio();
        return;
      }
      const wasOpen = menu.classList.contains('open');
      closeMenus();
      if (!wasOpen) {
        /* Open upward by default; flip below when the viewport room above
           the button is less than the menu's max height */
        const room = btn.getBoundingClientRect().top;
        menu.classList.toggle('down', room < 340);
        menu.classList.add('open');
      }
    });
    menu.addEventListener('click', e => e.stopPropagation());
  }


  /* ─── Location controls ───────────────────────────────────────── */

  function wireCityInput() {
    const changeBtn = document.getElementById('prayerChangeBtn');
    const input = document.getElementById('prayerCityInput');
    if (!changeBtn || !input) return;

    changeBtn.addEventListener('click', () => {
      const open = input.classList.toggle('open');
      if (open) input.focus();
    });

    input.addEventListener('keydown', e => {
      if (e.key === 'Escape') { input.classList.remove('open'); return; }
      if (e.key !== 'Enter') return;
      const city = input.value.trim();
      if (!city) return;
      state.loc = { type: 'city', city, label: _titleCase(city) };
      saveLoc();
      input.classList.remove('open');
      input.value = '';
      _setText('prayerLocationLabel', state.loc.label);
      refresh();
    });
  }

  function wireDetect() {
    const btn = document.getElementById('prayerDetectBtn');
    if (!btn) return;

    btn.addEventListener('click', () => {
      if (!navigator.geolocation) {
        toast('Geolocation is not supported by this browser');
        return;
      }
      const original = btn.innerHTML;
      btn.innerHTML = '📍 Detecting…';
      btn.disabled = true;
      const done = () => { btn.innerHTML = original; btn.disabled = false; };

      navigator.geolocation.getCurrentPosition(
        async pos => {
          const { latitude: lat, longitude: lon } = pos.coords;
          let label = `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
          try {
            const res = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
            if (res.ok) {
              const g = await res.json();
              const city = g.city || g.locality || g.principalSubdivision;
              if (city) label = g.countryName ? `${city}, ${g.countryName}` : city;
            }
          } catch (_) { /* keep coordinate label */ }
          state.loc = { type: 'coords', lat, lon, label };
          saveLoc();
          _setText('prayerLocationLabel', label);
          await refresh();
          done();
        },
        err => {
          done();
          if (err.code === err.PERMISSION_DENIED) {
            toast('Location permission denied — use Change to search your city');
          } else if (err.code === err.TIMEOUT) {
            toast('Location request timed out — try again');
          } else {
            toast('Could not detect location — use Change to search your city');
          }
        },
        { timeout: 10000, maximumAge: 300000 }
      );
    });
  }


  /* ─── Utilities ───────────────────────────────────────────────── */

  function _setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  function toast(msg) {
    if (window.showToast) window.showToast(msg);
    else console.log('[prayer-widget]', msg);
  }

  /* "17:05" (AlAdhan sometimes appends " (EDT)") → "5:05 PM" */
  function _to12h(raw) {
    if (!raw) return '—';
    const m = String(raw).match(/(\d{1,2}):(\d{2})/);
    if (!m) return '—';
    let h = parseInt(m[1], 10);
    const ap = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${m[2]} ${ap}`;
  }

  function _mins(raw) {
    if (!raw) return -1;
    const m = String(raw).match(/(\d{1,2}):(\d{2})/);
    return m ? parseInt(m[1], 10) * 60 + parseInt(m[2], 10) : -1;
  }

  function _daylight(rise, set) {
    const a = _mins(rise), b = _mins(set);
    if (a < 0 || b < 0 || b <= a) return '—';
    const d = b - a;
    return `${Math.floor(d / 60)}h ${d % 60}m`;
  }

  function _todayLocal() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  function _todayDDMMYYYY() {
    const d = new Date();
    return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
  }

  function _titleCase(s) {
    return s.replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.slice(1));
  }


  /* ─── Boot ────────────────────────────────────────────────────── */

  document.addEventListener('DOMContentLoaded', () => {
    /* Immediate paint before the API answers */
    _setText('pwDate', new Date().toLocaleDateString('en-US',
      { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }));
    _setText('prayerLocationLabel', state.loc.label || '');

    buildAdhanMenu();
    buildMethodMenu();
    wireMenu('adhanBtn', 'adhanMenu');
    wireMenu('methodBtn', 'methodMenu');
    wireCityInput();
    wireDetect();

    document.addEventListener('click', closeMenus);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenus(); });

    refresh();
    setInterval(tick, 1000);
  });

}());
