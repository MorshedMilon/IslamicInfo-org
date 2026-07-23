/* ═══════════════════════════════════════════════════════════════════
   IslamicInfo.org — narrator-panel.js  (Module 8)
   DOM + data layer for the narrator reliability panel. Pure HTML comes from
   II.narratorPanel; this only does lazy-fetch + toggle + delegated wiring.
   Host (api/ui) injected by hadith.js via II.narratorPanelDom.init(host).

   The panel nests INSIDE the clicked row (works for both the feed card's
   `.isnad-link` div and the deep-view `<li>`), so no invalid sibling markup.
   Reachable only when an isnad node carries data-narrator-id — live chains are
   empty (narrators:[]), so this is build-ahead of curated data (ADR-029).
   ═══════════════════════════════════════════════════════════════════ */
(function (root) {
  'use strict';

  var II = root.II = root.II || {};
  var core = II.narratorPanel;
  var host = null;                 // { api, ui }
  var CACHE = {};                  // id -> narrator object | null (session-scoped)

  function init(h) { host = h; }

  async function loadNarrator(id) {
    if (Object.prototype.hasOwnProperty.call(CACHE, id)) return CACHE[id];
    var data;
    try { data = await host.api.fetchNarrator(id); } catch (_) { data = null; }
    CACHE[id] = data || null;      // null = unavailable/unknown (honest)
    return CACHE[id];
  }

  async function toggleNarratorPanel(row, id) {
    if (!row) return;
    var existing = row.querySelector(':scope > .narrator-panel');
    // A pending first-open fetch still writes into this panel if it's since been
    // toggled closed — harmless (content is correct when re-opened; the id is
    // cached so no re-fetch).
    if (existing) {
      var open = existing.classList.toggle('open');
      row.setAttribute('aria-expanded', open ? 'true' : 'false');
      return;
    }
    var panel = document.createElement('div');
    panel.className = 'narrator-panel open';
    panel.innerHTML = '<div class="dv-empty dv-empty--compact">Loading…</div>';
    row.appendChild(panel);
    row.setAttribute('aria-expanded', 'true');
    if (window.II && II.track) II.track('narrator_panel_opened', { narrator_id: String(id) });

    var data = id ? await loadNarrator(id) : null;
    if (!panel.isConnected) return;                 // row/panel removed mid-fetch
    panel.innerHTML = data
      ? core.buildNarratorPanelHTML(data)
      : '<div class="dv-empty dv-empty--compact" role="note">Reliability data unavailable for this narrator</div>';
  }

  // Delegated: a click on any isnad node carrying data-narrator-id toggles its
  // panel. Wire ONCE on a persistent container (document) to avoid leaks.
  function wire(container) {
    container = container || document;
    if (container.__narratorWired) return;
    container.__narratorWired = true;
    container.addEventListener('click', function (e) {
      var row = e.target.closest && e.target.closest('[data-narrator-id]');
      if (!row || !container.contains(row)) return;
      var id = row.getAttribute('data-narrator-id');
      if (!id) return;                              // unknown narrator (no id) → not clickable
      toggleNarratorPanel(row, id).catch(function () {});
    });
    container.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      var row = e.target.closest && e.target.closest('[data-narrator-id]');
      if (!row || !row.getAttribute('data-narrator-id')) return;
      e.preventDefault();
      toggleNarratorPanel(row, row.getAttribute('data-narrator-id')).catch(function () {});
    });
  }

  II.narratorPanelDom = { init: init, loadNarrator: loadNarrator, toggleNarratorPanel: toggleNarratorPanel, wire: wire };

}(typeof globalThis !== 'undefined' ? globalThis : window));
