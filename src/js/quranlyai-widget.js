/* QuranlyAI — one-tag global widget loader.
   Drop a SINGLE tag on any page to get the floating "✨ Ask QuranlyAI" assistant:

     <script src="src/js/quranlyai-widget.js"></script>

   It loads the core + controller from its own folder, then auto-mounts the floating
   button (the panel + CSS lazy-load on first open). Override the backend with a
   data-api-base attribute:

     <script src="src/js/quranlyai-widget.js" data-api-base="https://api.islamicinfo.org"></script>

   NOTE: only origins in the Worker's ALLOWED_ORIGINS can call the API (CORS). */
(function () {
  'use strict';
  var self = document.currentScript;
  var src = (self && self.src) || '';
  var ver = (src.match(/[?&]v=([^&]+)/) || [])[1];       // cache-buster, propagated to all assets
  var q = ver ? ('?v=' + ver) : '';
  var dir = src.replace(/[?#].*$/, '').replace(/[^/]*$/, ''); // .../src/js/  (query stripped)
  var apiBase = (self && self.getAttribute('data-api-base')) ||
    'https://islamicinfo-api.islamicinfo.workers.dev';

  function inject(url, cb) {
    if (document.querySelector('script[data-qai="' + url + '"]')) { cb(); return; }
    var s = document.createElement('script');
    s.src = url;
    s.async = false; // preserve execution order (core before controller)
    s.setAttribute('data-qai', url);
    s.onload = cb;
    s.onerror = function () { console.error('[QuranlyAI] failed to load ' + url); };
    document.head.appendChild(s);
  }

  function boot() {
    if (!window.QuranlyAI) { console.error('[QuranlyAI] core did not load'); return; }
    // betaUnlimited: 30-day testing phase — per-user unlimited, IP-capped server-side.
    window.QuranlyAI.init({ apiBase: apiBase, betaUnlimited: true });
  }

  inject(dir + 'quranly-ai-core.js' + q, function () {
    inject(dir + 'quranly-ai.js' + q, boot);
  });
})();
