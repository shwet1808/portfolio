document.addEventListener('DOMContentLoaded', () => {

  // ---------- Icons ----------
  if (window.lucide) lucide.createIcons();

  // ---------- Footer year ----------
  document.getElementById('year').textContent = new Date().getFullYear();

  // ---------- Hero line-number gutter ----------
  const gutter = document.getElementById('hero-gutter');
  if (gutter) {
    for (let i = 1; i <= 8; i++) {
      const line = document.createElement('div');
      line.textContent = i;
      line.className = 'leading-8';
      gutter.appendChild(line);
    }
  }

  // ---------- Typing effect ----------
  const typedEl = document.getElementById('typed-text');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const summary = "Full-stack web developer building with React, Node.js and MySQL — focused on clean UI, real APIs and role-based systems.";

  if (typedEl) {
    if (prefersReducedMotion) {
      typedEl.textContent = summary;
    } else {
      let i = 0;
      const speed = 22;
      function type() {
        if (i <= summary.length) {
          typedEl.textContent = summary.slice(0, i);
          i++;
          setTimeout(type, speed);
        }
      }
      setTimeout(type, 400);
    }
  }

  // ---------- Scroll reveal ----------
  const revealEls = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealEls.forEach(el => revealObserver.observe(el));

  // ---------- Active tab highlighting ----------
  const tabLinks = document.querySelectorAll('.tab-link');
  const sections = document.querySelectorAll('main section[id]');

  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const id = entry.target.getAttribute('id');
      const link = document.querySelector(`.tab-link[data-tab="${id}"]`);
      if (!link) return;
      if (entry.isIntersecting) {
        tabLinks.forEach(l => l.classList.remove('active-tab'));
        link.classList.add('active-tab');
      }
    });
  }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });

  sections.forEach(sec => navObserver.observe(sec));

  // ---------- Contact form (Formspree) ----------
  const form = document.getElementById('contact-form');
  const status = document.getElementById('form-status');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalLabel = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = 'Sending…';

      try {
        const response = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { 'Accept': 'application/json' }
        });

        status.classList.remove('hidden');
        if (response.ok) {
          status.textContent = '✓ Message sent — thanks! I\'ll get back to you soon.';
          status.style.color = '#3FB950';
          form.reset();
        } else {
          status.textContent = '✗ Something went wrong. Please email me directly instead.';
          status.style.color = '#F85149';
        }
      } catch (err) {
        status.classList.remove('hidden');
        status.textContent = '✗ Network error. Please email me directly instead.';
        status.style.color = '#F85149';
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalLabel;
        if (window.lucide) lucide.createIcons();
      }
    });
  }

});
