/**
 * nav.js — Mobile navigation toggle
 *
 * Handles the hamburger menu on small screens.
 * Fully keyboard-accessible: Escape closes the menu.
 */
(function () {
  'use strict';

  const toggle = document.querySelector('.nav__toggle');
  const links  = document.querySelector('.nav__links');

  if (!toggle || !links) return;

  toggle.addEventListener('click', function () {
    const isOpen = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  // Close on Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && links.classList.contains('open')) {
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.focus();
    }
  });

  // Close when a nav link is clicked (smooth single-page feel)
  links.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
})();
