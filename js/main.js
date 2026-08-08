/**
 * Portfolio Interactivity & Logic Script
 * Author: Shwet Kumar
 * Description: Handles UI interactions including Lucide icon loading, dynamic footer year, 
 *              IDE-style line number generation, animated typing effect, scroll-reveal observer, 
 *              scroll-spy tab navigation highlighting, and async contact form submission.
 */

// Wait until the HTML document has been fully loaded and parsed before running any scripts
document.addEventListener('DOMContentLoaded', () => {

  // Icons Initialization
  // Check if the Lucide icon library is loaded globally from the CDN
  if (window.lucide) {
    // Replace all elements with the 'data-lucide' attribute with their corresponding SVG icons
    lucide.createIcons();
  }

  // Footer Auto-Updating Year
  // Find the HTML element with the ID 'year' and set its text content to the current calendar year
  const yearElement = document.getElementById('year');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  // Hero Editor Line-Number Gutter
  // Select the container where line numbers will be injected to mimic an IDE editor gutter
  const gutter = document.getElementById('hero-gutter');
  if (gutter) {
    // Loop from 1 to 8 to generate line numbers for the hero display layout
    for (let i = 1; i <= 8; i++) {
      // Create a new 'div' element for the current line number
      const line = document.createElement('div');
      // Set the text content of the div to the current loop number
      line.textContent = i;
      // Apply Tailwind CSS leading-8 class to match the line height of the adjacent code text
      line.className = 'leading-8';
      // Append the newly created line number div to the gutter container
      gutter.appendChild(line);
    }
  }

  // Typing Effect for Bio Summary
  // Locate the HTML element where the typing bio will render
  const typedEl = document.getElementById('typed-text');
  // Check if the user has requested reduced motion in their system/browser settings (accessibility best practice)
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // The full text content to be typed out character-by-character
  const summary = "Full-stack web developer building with React, Node.js and MySQL — focused on clean UI, real APIs and role-based systems.";

  if (typedEl) {
    if (prefersReducedMotion) {
      // If the user prefers reduced motion, skip the animation and display the full text immediately
      typedEl.textContent = summary;
    } else {
      // Otherwise, start the typing animation
      let i = 0; // Pointer tracking the current character index to type
      const speed = 22; // Speed interval in milliseconds between typing each character
      
      // Recursive typing function
      function type() {
        // Continue typing if the pointer hasn't reached the end of the text
        if (i <= summary.length) {
          // Slice the summary text from index 0 to the current character index and assign to textContent
          typedEl.textContent = summary.slice(0, i);
          // Increment the pointer index for the next character
          i++;
          // Trigger the next character type after the specified speed duration
          setTimeout(type, speed);
        }
      }
      // Start the typing animation after a brief initial delay of 400ms to allow layout settle
      setTimeout(type, 400);
    }
  }

  // Scroll Reveal Animations
  // Select all DOM elements with the 'reveal' class to participate in scroll fade-in
  const revealEls = document.querySelectorAll('.reveal');
  
  // Set up an IntersectionObserver to detect when elements enter the browser viewport
  const revealObserver = new IntersectionObserver((entries) => {
    // Loop through each observed entry
    entries.forEach(entry => {
      // Check if the element has entered the viewport (based on threshold)
      if (entry.isIntersecting) {
        // Add the 'is-visible' class which triggers the CSS transition (fade in and slide up)
        entry.target.classList.add('is-visible');
        // Stop observing this element since it has already performed its entry animation
        revealObserver.unobserve(entry.target);
      }
    });
  }, { 
    // Trigger the entry callback when at least 12% of the element is visible in the viewport
    threshold: 0.12 
  });
  
  // Register each scroll-reveal element with the IntersectionObserver
  revealEls.forEach(el => revealObserver.observe(el));

  // Scroll-Spy Active Tab Highlighting
  // Select all tab links in the header navigation bar
  const tabLinks = document.querySelectorAll('.tab-link');
  // Select all main sections of the page that have an ID attribute
  const sections = document.querySelectorAll('main section[id]');

  // Set up an IntersectionObserver to detect which section is currently centered in the viewport
  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      // Get the ID of the section that triggered the intersection change
      const id = entry.target.getAttribute('id');
      // Find the corresponding navigation link that matches this section's ID
      const link = document.querySelector(`.tab-link[data-tab="${id}"]`);
      
      // If no matching navigation link is found, exit early
      if (!link) return;
      
      // If the section occupies the center threshold area of the screen
      if (entry.isIntersecting) {
        // Remove the active status styling class from all tab links
        tabLinks.forEach(l => l.classList.remove('active-tab'));
        // Add the active status styling class to the current section's tab link
        link.classList.add('active-tab');
      }
    });
  }, { 
    // rootMargin defines bounds to match when sections cross the middle 10% vertical band of the screen
    rootMargin: '-45% 0px -45% 0px', 
    threshold: 0 
  });

  // Register each page section with the navigation scroll-spy observer
  sections.forEach(sec => navObserver.observe(sec));

  // Contact Form Submission (Formspree Integration)
  // Find the contact form element by its ID
  const form = document.getElementById('contact-form');
  // Find the element reserved for showing form submission status messages
  const status = document.getElementById('form-status');

  if (form) {
    // Add a listener for the form's submit event
    form.addEventListener('submit', async (e) => {
      // Prevent the default browser form submission (which reloads the page)
      e.preventDefault();
      
      // Find the submit button inside the form
      const submitBtn = form.querySelector('button[type="submit"]');
      // Save the original label of the submit button to restore it later
      const originalLabel = submitBtn.innerHTML;
      
      // Disable the button to prevent double submissions and update the label
      submitBtn.disabled = true;
      submitBtn.innerHTML = 'Sending…';

      try {
        // Send the form data asynchronously via fetch using the form's action URL and method
        const response = await fetch(form.action, {
          method: 'POST', // Submit data via HTTP POST
          body: new FormData(form), // Automatically packages all form input fields and values
          headers: { 'Accept': 'application/json' } // Instruct the server to return JSON responses
        });

        // Make the status text container visible by removing the 'hidden' class
        status.classList.remove('hidden');
        
        // Check if the server accepted the submission successfully
        if (response.ok) {
          // Display success message and style it green
          status.textContent = '✓ Message sent — thanks! I\'ll get back to you soon.';
          status.style.color = '#3FB950'; // GitHub/GitLab-style success green color
          // Reset all form input fields to their default empty states
          form.reset();
        } else {
          // If response status was not OK, display error message and style it red
          status.textContent = '✗ Something went wrong. Please email me directly instead.';
          status.style.color = '#F85149'; // Error red color
        }
      } catch (err) {
        // Handle any network-level errors (e.g. offline, connection timeout)
        status.classList.remove('hidden');
        status.textContent = '✗ Network error. Please email me directly instead.';
        status.style.color = '#F85149';
      } finally {
        // Re-enable the submit button so the user can try again if they want
        submitBtn.disabled = false;
        // Restore the original label of the submit button
        submitBtn.innerHTML = originalLabel;
        // Re-render any icons inside the button/form that might have been reset
        if (window.lucide) lucide.createIcons();
      }
    });
  }

  // Mouse movement tracker for dynamic glass spotlights on cards
  const panels = document.querySelectorAll('.panel');
  panels.forEach(panel => {
    panel.addEventListener('mousemove', (e) => {
      const rect = panel.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      panel.style.setProperty('--mouse-x', `${x}px`);
      panel.style.setProperty('--mouse-y', `${y}px`);
    });
  });

});
