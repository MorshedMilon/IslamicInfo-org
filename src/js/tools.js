/* ═══════════════════════════════════════════════════════════════════
   IslamicInfo.org — tools.js  (v1.0 · 2026-06)
   API integration for tools.html (Islamic Tools).

   Requires: api.js loaded first (window.II.api)

   Features:
     1. Prayer Widget   → GET /api/prayer?city=&method=&date=
     2. Geocode chain   → navigator.geolocation → GET /api/geocode → prayer
     3. Zakat Nisab     → GET /api/nisab?currency=
     4. Qibla Direction → client-side Haversine (no API)
     5. Hijri Date      → client-side calculation (no API in v1)
     6. Mosque Finder   → external link to mosquefinder.net
     7. Inheritance     → internal link to inheritance.html

   Fallbacks:
     Prayer  → London MWL hardcoded times
     Nisab   → $6,180 USD

   HTML IDs expected on tools.html:
     Prayer widget:  #ptCity, #ptMethod, #ptDetectBtn,
                     #ptFajr, #ptSunrise, #ptDhuhr, #ptAsr, #ptMaghrib, #ptIsha,
                     #ptLocationLabel, #ptLastUpdated
     Zakat widget:   #zakatCurrency, #zakatAssetInput, #zakatCalcBtn,
                     #zakatNisab, #zakatResult, #zakatNisabSource
     Qibla widget:   #qiblaCompass, #qiblaDegrees, #qiblaDetectBtn
     Hijri widget:   #hijriDate
   ═══════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  const api = window.II && window.II.api;
  if (!api) { console.error('[tools.js] api.js not loaded'); return; }

  /* ─── Fallbacks ───────────────────────────────────────────────── */

  const FALLBACK_PRAYER = {
    city:    'London',
    timings: { Fajr: '04:02', Sunrise: '05:43', Dhuhr: '13:02', Asr: '17:00', Maghrib: '20:21', Isha: '21:55' },
  };

  const FALLBACK_NISAB_USD = 6180;

  /* Kaaba coordinates */
  const KAABA = { lat: 21.4225, lon: 39.8262 };


  /* ════════════════════════════════════════════════════════════════
     1. PRAYER WIDGET
     ════════════════════════════════════════════════════════════════ */

  function _renderPrayerTimes(data) {
    const t = data.timings || {};
    const map = {
      ptFajr:    t.Fajr,
      ptSunrise: t.Sunrise,
      ptDhuhr:   t.Dhuhr,
      ptAsr:     t.Asr,
      ptMaghrib: t.Maghrib,
      ptIsha:    t.Isha,
    };
    Object.entries(map).forEach(([id, val]) => _setText(id, val || '—'));
    _setText('ptLocationLabel', data.city || '');

    const now = new Date();
    _setText('ptLastUpdated', `Updated ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);

    /* Highlight next prayer */
    const order   = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    const nowMins = now.getHours() * 60 + now.getMinutes();
    let next = 'Fajr';
    for (const name of order) {
      const raw = t[name];
      if (!raw) continue;
      const [h, m] = raw.split(':').map(Number);
      if ((h * 60 + m) > nowMins) { next = name; break; }
    }
    order.forEach(name => {
      const el = document.getElementById(`pt${name}`);
      const card = el && (el.closest('[data-prayer]') || el.parentElement);
      if (card) card.classList.toggle('next-prayer', name === next);
    });
  }

  async function loadPrayerTimes(city, method) {
    const m    = method || document.getElementById('ptMethod')?.value || '3';
    const data = await api.fetchPrayer(city, undefined, m) || { ...FALLBACK_PRAYER, city };
    _renderPrayerTimes(data);
    /* Persist city for next visit */
    localStorage.setItem('ii-prayer-city', data.city || city);
  }

  async function detectAndLoadPrayer() {
    if (!navigator.geolocation) { return loadPrayerTimes('London'); }

    const btn = document.getElementById('ptDetectBtn');
    if (btn) { btn.textContent = 'Detecting…'; btn.disabled = true; }

    navigator.geolocation.getCurrentPosition(
      async pos => {
        const geo  = await api.fetchGeocode(pos.coords.latitude, pos.coords.longitude);
        const city = geo ? geo.city : 'London';
        await loadPrayerTimes(city);
        if (btn) { btn.textContent = '📍 My Location'; btn.disabled = false; }
      },
      async () => {
        await loadPrayerTimes('London');
        if (btn) { btn.textContent = '📍 My Location'; btn.disabled = false; }
      }
    );
  }

  function initPrayerWidget() {
    const cityInput = document.getElementById('ptCity');
    const detectBtn = document.getElementById('ptDetectBtn');
    const methodSel = document.getElementById('ptMethod');

    if (detectBtn) detectBtn.addEventListener('click', detectAndLoadPrayer);

    if (cityInput) {
      cityInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
          const city = cityInput.value.trim();
          if (city) loadPrayerTimes(city);
        }
      });
    }

    if (methodSel) {
      methodSel.addEventListener('change', () => {
        const city = (cityInput && cityInput.value.trim()) ||
                     localStorage.getItem('ii-prayer-city') || 'London';
        loadPrayerTimes(city, methodSel.value);
      });
    }

    /* Auto-load on page open */
    const lastCity = localStorage.getItem('ii-prayer-city');
    if (lastCity) {
      if (cityInput) cityInput.value = lastCity;
      loadPrayerTimes(lastCity);
    } else {
      detectAndLoadPrayer();
    }
  }


  /* ════════════════════════════════════════════════════════════════
     2. ZAKAT / NISAB WIDGET
     ════════════════════════════════════════════════════════════════ */

  let nisabValue = FALLBACK_NISAB_USD;

  async function loadNisab() {
    const currSel   = document.getElementById('zakatCurrency');
    const currency  = currSel ? currSel.value : 'USD';
    const nisabEl   = document.getElementById('zakatNisab');
    const sourceEl  = document.getElementById('zakatNisabSource');

    const data = await api.fetchNisab(currency);

    if (data && data.nisabValue) {
      nisabValue = data.nisabValue;
      if (nisabEl)  nisabEl.textContent  = `${data.currency} ${data.nisabValue.toLocaleString()}`;
      if (sourceEl) sourceEl.textContent = data.source ? `Source: ${data.source} · As of: ${data.asOf || 'today'}` : '';
    } else {
      nisabValue = FALLBACK_NISAB_USD;
      if (nisabEl)  nisabEl.textContent  = `USD ${FALLBACK_NISAB_USD.toLocaleString()} (fallback estimate)`;
      if (sourceEl) sourceEl.textContent = 'Live price unavailable — using conservative fallback.';
    }
  }

  function calcZakat() {
    const assetInput = document.getElementById('zakatAssetInput');
    const resultEl   = document.getElementById('zakatResult');
    if (!assetInput || !resultEl) return;

    const assets = parseFloat(assetInput.value);
    if (isNaN(assets) || assets < 0) {
      if (window.showToast) window.showToast('Please enter a valid asset value.');
      return;
    }

    if (assets < nisabValue) {
      resultEl.innerHTML =
        `<p>Your assets (<strong>${assets.toLocaleString()}</strong>) are below the nisab threshold ` +
        `(<strong>${nisabValue.toLocaleString()}</strong>). Zakat is not obligatory.</p>` +
        `<p class="disclaimer-note">This is a calculation tool only — not a fatwa. Consult a qualified scholar.</p>`;
    } else {
      const zakat = (assets * 0.025).toFixed(2);
      resultEl.innerHTML =
        `<p>Estimated Zakat (2.5%): <strong>${parseFloat(zakat).toLocaleString()}</strong></p>` +
        `<p class="disclaimer-note">This is a calculation tool only — not a fatwa. Consult a qualified scholar for your specific situation.</p>`;
    }
  }

  function initZakatWidget() {
    const currSel  = document.getElementById('zakatCurrency');
    const calcBtn  = document.getElementById('zakatCalcBtn');

    if (currSel) currSel.addEventListener('change', loadNisab);
    if (calcBtn) calcBtn.addEventListener('click', calcZakat);

    loadNisab();
  }


  /* ════════════════════════════════════════════════════════════════
     3. QIBLA DIRECTION  (client-side Haversine — no API)
     ════════════════════════════════════════════════════════════════ */

  function _calcQibla(userLat, userLon) {
    const φ1 = userLat       * Math.PI / 180;
    const φ2 = KAABA.lat     * Math.PI / 180;
    const Δλ = (KAABA.lon - userLon) * Math.PI / 180;
    const y  = Math.sin(Δλ) * Math.cos(φ2);
    const x  = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
    const θ  = Math.atan2(y, x);
    return ((θ * 180 / Math.PI) + 360) % 360;   // bearing 0–360
  }

  function _renderQibla(bearing) {
    const compass = document.getElementById('qiblaCompass');
    const degrees = document.getElementById('qiblaDegrees');

    if (compass) compass.style.transform = `rotate(${bearing}deg)`;
    if (degrees) degrees.textContent = `${Math.round(bearing)}° from North`;
  }

  function detectQibla() {
    const btn = document.getElementById('qiblaDetectBtn');
    if (!navigator.geolocation) {
      if (window.showToast) window.showToast('Geolocation not supported by your browser.');
      return;
    }
    if (btn) { btn.textContent = 'Detecting…'; btn.disabled = true; }

    navigator.geolocation.getCurrentPosition(
      pos => {
        const bearing = _calcQibla(pos.coords.latitude, pos.coords.longitude);
        _renderQibla(bearing);
        if (btn) { btn.textContent = '📍 Find Qibla'; btn.disabled = false; }
      },
      () => {
        if (window.showToast) window.showToast('Location access denied. Please enable location services.');
        if (btn) { btn.textContent = '📍 Find Qibla'; btn.disabled = false; }
      }
    );
  }

  function initQiblaWidget() {
    const btn = document.getElementById('qiblaDetectBtn');
    if (btn) btn.addEventListener('click', detectQibla);
  }


  /* ════════════════════════════════════════════════════════════════
     4. HIJRI DATE  (client-side, no API in v1)
     ════════════════════════════════════════════════════════════════ */

  function initHijriDate() {
    const el = document.getElementById('hijriDate');
    if (!el) return;

    try {
      const hijri = new Intl.DateTimeFormat('en-u-ca-islamic', {
        day: 'numeric', month: 'long', year: 'numeric'
      }).format(new Date());
      el.textContent = hijri;
    } catch (_) {
      /* Intl Islamic calendar not supported in all environments */
      el.textContent = 'Hijri date unavailable';
    }
  }


  /* ─── Utility ─────────────────────────────────────────────────── */

  function _setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }


  /* ─── Boot ────────────────────────────────────────────────────── */

  document.addEventListener('DOMContentLoaded', () => {
    initPrayerWidget();
    initZakatWidget();
    initQiblaWidget();
    initHijriDate();
  });

}());
