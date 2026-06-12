/* ═══════════════════════════════════════════════════════════════════
   IslamicInfo.org — habits.js  (v1.0 · 2026-06)
   API integration for habits.html (Habit Tracker).

   Requires: api.js loaded first (window.II.api)

   v1 state: all tracking is in localStorage key 'ii-habits'.
   API integration: wires live prayer times from GET /api/prayer
   for the prayer countdown and fasting Suhoor/Iftar widgets.

   Fallback: hardcoded estimated windows (London MWL) if API fails.

   HTML IDs expected on habits.html:
     Prayer countdown: #nextPrayerName, #prayerCountdown
     Fasting widget:   #suhoorTime, #iftarTime, #fastingLocation
     Location:         #habitsPrayerCity, #habitsDetectBtn
   ═══════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* i18n helper (i18n.js loads first; safe fallback if it didn't) */
  function tr(key, fallback, params) {
    if (window.II && window.II.t) return window.II.t(key, fallback, params);
    let s = fallback !== undefined ? fallback : key;
    if (params) Object.keys(params).forEach(k => { s = s.split('{' + k + '}').join(params[k]); });
    return s;
  }

  const api = window.II && window.II.api;
  if (!api) { console.error('[habits.js] api.js not loaded'); return; }

  /* ─── Fallback times (London MWL approximate) ────────────────── */
  const FALLBACK = {
    city:    'London',
    timings: {
      Fajr:    '04:02',
      Sunrise: '05:43',
      Dhuhr:   '13:02',
      Asr:     '17:00',
      Maghrib: '20:21',
      Isha:    '21:55',
    },
  };

  let countdownTimer = null;
  let prayerTimings  = null;


  /* ─── Parse "HH:MM" to today's Date object ───────────────────── */

  function _timeToDate(hhmm) {
    const [h, m] = hhmm.split(':').map(Number);
    const d = new Date();
    d.setHours(h, m, 0, 0);
    return d;
  }


  /* ─── Find next prayer from current time ─────────────────────── */

  function _getNextPrayer(timings) {
    const order = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    const now   = Date.now();

    for (const name of order) {
      const t = timings[name];
      if (!t) continue;
      const prayerMs = _timeToDate(t).getTime();
      if (prayerMs > now) return { name, time: prayerMs };
    }

    /* Past Isha → next is Fajr tomorrow */
    const fajr = timings['Fajr'];
    if (fajr) {
      const d = _timeToDate(fajr);
      d.setDate(d.getDate() + 1);
      return { name: 'Fajr', time: d.getTime() };
    }
    return null;
  }


  /* ─── Prayer countdown ticker ────────────────────────────────── */

  function _startCountdown(timings) {
    if (countdownTimer) clearInterval(countdownTimer);

    function tick() {
      const next = _getNextPrayer(timings);
      if (!next) return;

      const diff = Math.max(0, next.time - Date.now());
      const h    = Math.floor(diff / 3600000);
      const m    = Math.floor((diff % 3600000) / 60000);
      const s    = Math.floor((diff % 60000)   / 1000);

      _setText('nextPrayerName', tr('pw.prayer.' + next.name.toLowerCase(), next.name));
      _setText('prayerCountdown',
        `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
      );
    }

    tick();
    countdownTimer = setInterval(tick, 1000);
  }


  /* ─── Render Suhoor / Iftar ──────────────────────────────────── */

  function _renderFastingTimes(timings, city) {
    /* Suhoor ends at Fajr; Iftar starts at Maghrib */
    _setText('suhoorTime',     timings.Fajr    || '—');
    _setText('iftarTime',      timings.Maghrib  || '—');
    _setText('fastingLocation', city || '');
  }


  /* ─── Load prayer data and wire both widgets ─────────────────── */

  async function loadPrayerData(city) {
    const data = await api.fetchPrayer(city) || { ...FALLBACK, city };

    prayerTimings = data.timings;
    _startCountdown(data.timings);
    _renderFastingTimes(data.timings, data.city || city);

    localStorage.setItem('ii-prayer-city', data.city || city);
  }

  async function detectAndLoad() {
    const btn = document.getElementById('habitsDetectBtn');
    if (btn) { btn.textContent = tr('js.habits.detecting','Detecting…'); btn.disabled = true; }

    if (!navigator.geolocation) {
      await loadPrayerData('London');
      if (btn) { btn.textContent = '📍 Detect'; btn.disabled = false; }
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async pos => {
        const geo  = await api.fetchGeocode(pos.coords.latitude, pos.coords.longitude);
        const city = geo ? geo.city : 'London';
        const inp  = document.getElementById('habitsPrayerCity');
        if (inp) inp.value = city;
        await loadPrayerData(city);
        if (btn) { btn.textContent = tr('js.habits.detectBtn','📍 Detect'); btn.disabled = false; }
      },
      async () => {
        await loadPrayerData('London');
        if (btn) { btn.textContent = tr('js.habits.detectBtn','📍 Detect'); btn.disabled = false; }
      }
    );
  }


  /* ─── Wire location input controls ──────────────────────────── */

  function initLocationControls() {
    const cityInput = document.getElementById('habitsPrayerCity');
    const detectBtn = document.getElementById('habitsDetectBtn');

    if (detectBtn) detectBtn.addEventListener('click', detectAndLoad);

    if (cityInput) {
      cityInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
          const city = cityInput.value.trim();
          if (city) loadPrayerData(city);
        }
      });
    }

    const savedCity = localStorage.getItem('ii-prayer-city');
    if (savedCity) {
      if (cityInput) cityInput.value = savedCity;
      loadPrayerData(savedCity);
    } else {
      detectAndLoad();
    }
  }


  /* ─── Utility ─────────────────────────────────────────────────── */

  function _setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  }


  /* ─── Boot ────────────────────────────────────────────────────── */

  document.addEventListener('DOMContentLoaded', initLocationControls);

  document.addEventListener('ii:langchange', () => {
    if (prayerTimings) _startCountdown(prayerTimings);
  });

  /* Cleanup on tab close */
  window.addEventListener('beforeunload', () => {
    if (countdownTimer) clearInterval(countdownTimer);
  });

}());
