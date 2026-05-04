/**
 * Navigation Menu Toggle
 * Handles hamburger menu for mobile devices and keyboard navigation
 */

document.addEventListener('DOMContentLoaded', function() {
  const hamburger = document.querySelector('.hamburger');
  const navMenu = document.querySelector('.nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  // Toggle menu on hamburger click
  if (hamburger) {
    hamburger.addEventListener('click', function() {
      hamburger.classList.toggle('active');
      navMenu.classList.toggle('active');
    });
  }

  // Close menu when a link is clicked
  navLinks.forEach(link => {
    link.addEventListener('click', function() {
      hamburger.classList.remove('active');
      navMenu.classList.remove('active');
    });
  });

  // Close menu when clicking outside
  document.addEventListener('click', function(event) {
    const isClickInside = 
      (navMenu && navMenu.contains(event.target)) || 
      (hamburger && hamburger.contains(event.target));
    
    if (!isClickInside && navMenu && navMenu.classList.contains('active')) {
      hamburger.classList.remove('active');
      navMenu.classList.remove('active');
    }
  });

  // Handle escape key
  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && navMenu && navMenu.classList.contains('active')) {
      hamburger.classList.remove('active');
      navMenu.classList.remove('active');
    }
  });

  // Set active link based on current URL
  const currentLocation = location.pathname;
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentLocation || (currentLocation === '/' && href === '/')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // Keyboard navigation for menu
  navLinks.forEach((link, index) => {
    link.addEventListener('keydown', function(event) {
      let nextElement;
      
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        event.preventDefault();
        nextElement = navLinks[index + 1] || navLinks[0];
        nextElement.focus();
      } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        event.preventDefault();
        nextElement = navLinks[index - 1] || navLinks[navLinks.length - 1];
        nextElement.focus();
      } else if (event.key === 'Home') {
        event.preventDefault();
        navLinks[0].focus();
      } else if (event.key === 'End') {
        event.preventDefault();
        navLinks[navLinks.length - 1].focus();
      }
    });
  });
});