/* ═══════════════════════════════════════════════════════════════════
   IslamicInfo.org — analytics.js  (Module 18, DoD-17) — DOM layer.
   Thin GA4 wrapper. Exposes window.II.track(name, params). Privacy by
   default: loads NO gtag and sends NOTHING until BOTH (a) a GA4
   measurement id is configured — set `window.II_GA4_ID = 'G-XXXXXXX'`
   (e.g. injected by a served config) — AND (b) the visitor has granted
   consent (localStorage 'islamicinfo-analytics-consent' === 'granted',
   set via II.analytics.grantConsent() from a future consent banner).
   All gating/allowlist decisions delegate to II.analyticsCore. With
   neither configured, every call is a safe no-op and no third-party
   script is ever requested.
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var core = (window.II && window.II.analyticsCore);
  if (!core) return;

  var CONSENT_KEY = 'islamicinfo-analytics-consent';

  // IslamicInfo GA4 property (Module 18). Measurement IDs are public (they ship in the
  // page), so hardcoding is fine; window.II_GA4_ID still overrides if ever needed.
  var GA4_ID = 'G-JMH3Q4XTNY';
  function measurementId() {
    return (typeof window.II_GA4_ID === 'string' && window.II_GA4_ID) || GA4_ID;
  }
  function consent() {
    // On by default (product decision 2026-07-23: no consent banner). A future banner can
    // still opt a visitor out via II.analytics.revokeConsent() → stored 'denied' wins.
    try { return window.localStorage.getItem(CONSENT_KEY) || 'granted'; }
    catch (_) { return 'granted'; }
  }
  function config() { return { measurementId: measurementId(), consent: consent() }; }

  var loaded = false;
  function ensureGtag(id) {
    if (loaded) return;
    loaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(id);
    document.head.appendChild(s);
    window.gtag('js', new Date());
    window.gtag('config', id, { anonymize_ip: true });
  }

  // Emit a KPI event. No-op (and loads nothing) unless enabled + on the allowlist.
  function track(name, params) {
    var cfg = config();
    var ev = core.prepareEvent(name, params, cfg);
    if (!ev) return;
    ensureGtag(cfg.measurementId);
    try { window.gtag('event', ev.name, ev.params); } catch (_) {}
  }

  function grantConsent() { try { window.localStorage.setItem(CONSENT_KEY, 'granted'); } catch (_) {} }
  function revokeConsent() { try { window.localStorage.setItem(CONSENT_KEY, 'denied'); } catch (_) {} }

  window.II = window.II || {};
  window.II.analytics = { track: track, grantConsent: grantConsent, revokeConsent: revokeConsent, _config: config };
  // Convenience shorthand for call sites: `II.track && II.track('event', {...})`.
  window.II.track = track;

  // Fire the initial GA4 page_view on load (gtag('config') auto-sends it) so site-wide
  // visitor / traffic-source / geo reports populate on EVERY page — not only pages that
  // emit a custom KPI event. No-op when disabled (no id / consent 'denied').
  (function initPageView() {
    var cfg = config();
    if (core.isEnabled(cfg)) ensureGtag(cfg.measurementId);
  })();
})();
