/* ═══════════════════════════════════════════════════════════════════
   IslamicInfo.org — islamic-studies.js  (v1.0 · 2026-06)
   Integration for islamic-studies.html (Islamic Studies).

   No external API calls in v1.
   All data storage uses localStorage key: 'islamicinfo-is-progress'

   Features:
     1. Save / restore lesson progress
     2. Mark lessons complete / incomplete
     3. Progress bar per module
     4. Resume last-visited lesson
     5. Reset progress (with confirm)

   Progress schema (localStorage 'islamicinfo-is-progress'):
   {
     completedLessons: ["aqeedah-1", "aqeedah-2", ...],
     lastVisited:      "fiqh-3",
     updatedAt:        1717000000000
   }

   HTML classes / data attributes expected on islamic-studies.html:
     .lesson-item[data-lesson-id]   ← each lesson row/card
     .lesson-check                  ← toggle complete button inside lesson
     .module-progress[data-module]  ← progress bar element
     #isProgressReset               ← reset all progress button
     #isLastLesson                  ← "Continue where you left off" link
   ═══════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';
  function tr(key, fallback, params) {
    if (window.II && window.II.t) return window.II.t(key, fallback, params);
    let s = fallback !== undefined ? fallback : key;
    if (params) Object.keys(params).forEach(k => { s = s.split('{' + k + '}').join(params[k]); });
    return s;
  }

  const STORAGE_KEY = 'islamicinfo-is-progress';


  /* ─── Load / save state ───────────────────────────────────────── */

  function _loadProgress() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (_) {}
    return { completedLessons: [], lastVisited: null, updatedAt: null };
  }

  function _saveProgress(state) {
    state.updatedAt = Date.now();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (_) {
      if (window.showToast) window.showToast(tr('js.studies.saveFull','Progress could not be saved (storage full).'));
    }
  }


  /* ─── Toggle lesson complete ──────────────────────────────────── */

  function toggleLesson(lessonId) {
    const state = _loadProgress();
    const idx   = state.completedLessons.indexOf(lessonId);

    if (idx === -1) {
      state.completedLessons.push(lessonId);
    } else {
      state.completedLessons.splice(idx, 1);
    }

    state.lastVisited = lessonId;
    _saveProgress(state);
    _applyState(state);
  }


  /* ─── Mark last visited ───────────────────────────────────────── */

  function markVisited(lessonId) {
    const state      = _loadProgress();
    state.lastVisited = lessonId;
    _saveProgress(state);
  }


  /* ─── Apply state to DOM ──────────────────────────────────────── */

  function _applyState(state) {
    const completed = new Set(state.completedLessons);

    /* Mark lesson items */
    document.querySelectorAll('.lesson-item[data-lesson-id]').forEach(item => {
      const id    = item.dataset.lessonId;
      const done  = completed.has(id);
      item.classList.toggle('lesson-complete', done);
      item.setAttribute('aria-checked', String(done));

      const btn = item.querySelector('.lesson-check');
      if (btn) {
        btn.textContent   = done ? '✓' : '○';
        btn.title         = done ? tr('js.studies.markIncomplete','Mark incomplete') : tr('js.studies.markComplete','Mark complete');
        btn.setAttribute('aria-label', done ? tr('js.studies.ariaUnmark','Unmark {id} as complete',{id}) : tr('js.studies.ariaMark','Mark {id} as complete',{id}));
      }
    });

    /* Update module progress bars */
    document.querySelectorAll('.module-progress[data-module]').forEach(bar => {
      const module   = bar.dataset.module;
      const total    = document.querySelectorAll(`.lesson-item[data-module="${module}"]`).length;
      const done     = document.querySelectorAll(`.lesson-item[data-module="${module}"].lesson-complete`).length;
      const pct      = total > 0 ? Math.round((done / total) * 100) : 0;

      bar.style.width           = `${pct}%`;
      bar.setAttribute('aria-valuenow', pct);
      bar.setAttribute('aria-valuetext', tr('js.studies.ariaProgress','{pct}% of {module} complete',{pct,module}));

      const label = bar.closest('[data-module]')?.querySelector('.module-progress-label');
      if (label) label.textContent = tr('js.studies.lessonsCount','{done} / {total} lessons',{done,total});
    });

    /* Overall progress */
    const totalAll = document.querySelectorAll('.lesson-item[data-lesson-id]').length;
    const doneAll  = completed.size;
    const pctAll   = totalAll > 0 ? Math.round((doneAll / totalAll) * 100) : 0;
    _setText('isOverallProgress', tr('js.studies.overallProgress','{pct}% complete ({done} / {total} lessons)',{pct:pctAll,done:doneAll,total:totalAll}));

    /* Resume link */
    const resumeLink = document.getElementById('isLastLesson');
    if (resumeLink && state.lastVisited) {
      const lastEl = document.querySelector(`.lesson-item[data-lesson-id="${state.lastVisited}"]`);
      const href   = lastEl ? `#${state.lastVisited}` : null;
      if (href) {
        resumeLink.href        = href;
        resumeLink.textContent = tr('js.studies.continue','Continue: {id}',{id:state.lastVisited});
        resumeLink.hidden      = false;
      }
    }
  }


  /* ─── Event delegation on lesson list ───────────────────────── */

  function initLessonEvents() {
    const container = document.getElementById('isLessonList') || document.body;

    container.addEventListener('click', e => {
      /* Check/uncheck button */
      const checkBtn = e.target.closest('.lesson-check');
      if (checkBtn) {
        const item = checkBtn.closest('.lesson-item[data-lesson-id]');
        if (item) toggleLesson(item.dataset.lessonId);
        return;
      }

      /* Clicking lesson title marks it visited */
      const lessonLink = e.target.closest('.lesson-link');
      if (lessonLink) {
        const item = lessonLink.closest('.lesson-item[data-lesson-id]');
        if (item) markVisited(item.dataset.lessonId);
      }
    });
  }


  /* ─── Reset progress ──────────────────────────────────────────── */

  function initReset() {
    const btn = document.getElementById('isProgressReset');
    if (!btn) return;

    btn.addEventListener('click', () => {
      if (!confirm(tr('js.studies.resetConfirm','Reset all lesson progress? This cannot be undone.'))) return;
      localStorage.removeItem(STORAGE_KEY);
      _applyState({ completedLessons: [], lastVisited: null });
      if (window.showToast) window.showToast(tr('js.studies.reset','Progress reset.'));
    });
  }


  /* ─── Utility ─────────────────────────────────────────────────── */

  function _setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  }


  /* ─── Boot ────────────────────────────────────────────────────── */

  document.addEventListener('DOMContentLoaded', () => {
    const state = _loadProgress();
    _applyState(state);
    initLessonEvents();
    initReset();
    document.addEventListener('ii:langchange', () => _applyState(_loadProgress()));
  });

}());
