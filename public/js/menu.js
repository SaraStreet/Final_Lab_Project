/**
 * menu.js — Tab panel switching for the Menu page
 *
 * Manages ARIA roles (tablist / tab / tabpanel) and shows/hides panels.
 * Keyboard accessible: arrow keys navigate between tabs.
 */
(function () {
  'use strict';

  const tabs   = document.querySelectorAll('[role="tab"]');
  const panels = document.querySelectorAll('[role="tabpanel"]');

  if (!tabs.length) return;

  function activateTab(tab) {
    // Deactivate all
    tabs.forEach(function (t) {
      t.classList.remove('active');
      t.setAttribute('aria-selected', 'false');
    });
    panels.forEach(function (p) { p.hidden = true; });

    // Activate selected
    tab.classList.add('active');
    tab.setAttribute('aria-selected', 'true');
    const panelId = tab.getAttribute('aria-controls');
    const panel = document.getElementById(panelId);
    if (panel) panel.hidden = false;
  }

  tabs.forEach(function (tab, index) {
    tab.addEventListener('click', function () { activateTab(tab); });

    // Arrow key navigation within tablist
    tab.addEventListener('keydown', function (e) {
      let newIndex = index;
      if (e.key === 'ArrowRight') newIndex = (index + 1) % tabs.length;
      if (e.key === 'ArrowLeft')  newIndex = (index - 1 + tabs.length) % tabs.length;
      if (newIndex !== index) {
        activateTab(tabs[newIndex]);
        tabs[newIndex].focus();
      }
    });
  });
})();
