document.addEventListener('DOMContentLoaded', () => {

  // Init Lucide icons
  if (window.lucide) lucide.createIcons();

  // Dynamic year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Typing effect
  const typedEl = document.getElementById('typed-text');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const bio = 'Full stack developer building with React, Node.js and MySQL — focused on clean UI, real APIs and scalable systems.';

  if (typedEl) {
    if (prefersReducedMotion) {
      typedEl.textContent = bio;
    } else {
      let i = 0;
      (function type() {
        if (i <= bio.length) {
          typedEl.textContent = bio.slice(0, i++);
          setTimeout(type, 20);
        }
      })();
    }
  }

  // Scroll reveal
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('is-visible');
        revealObserver.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  // Scroll-spy
  const navLinks = document.querySelectorAll('.nav-link');
  const navObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const link = document.querySelector(`.nav-link[data-tab="${e.target.id}"]`);
      if (link) {
        navLinks.forEach(l => l.classList.remove('active-nav'));
        link.classList.add('active-nav');
      }
    });
  }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });
  document.querySelectorAll('main section[id]').forEach(s => navObserver.observe(s));

  // Card spotlight
  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });

  // Mobile menu
  const trigger = document.getElementById('mobile-menu-trigger');
  const dropdown = document.getElementById('mobile-dropdown');
  if (trigger && dropdown) {
    trigger.addEventListener('click', () => {
      dropdown.classList.toggle('active');
      const icon = trigger.querySelector('[data-lucide]');
      if (icon) {
        icon.setAttribute('data-lucide', dropdown.classList.contains('active') ? 'x' : 'menu');
        if (window.lucide) lucide.createIcons();
      }
    });
    document.querySelectorAll('.mobile-nav-link').forEach(link => {
      link.addEventListener('click', () => {
        dropdown.classList.remove('active');
        const icon = trigger.querySelector('[data-lucide]');
        if (icon) {
          icon.setAttribute('data-lucide', 'menu');
          if (window.lucide) lucide.createIcons();
        }
      });
    });
  }

  // Theme toggle
  const themeToggle = document.getElementById('theme-toggle');
  const currentTheme = localStorage.getItem('theme') || 'dark';
  if (currentTheme === 'light') document.body.classList.add('light-theme');
  updateThemeIcon(currentTheme === 'light');

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      document.body.classList.toggle('light-theme');
      const isLight = document.body.classList.contains('light-theme');
      localStorage.setItem('theme', isLight ? 'light' : 'dark');
      updateThemeIcon(isLight);
    });
  }

  function updateThemeIcon(isLight) {
    if (!themeToggle) return;
    const icon = themeToggle.querySelector('[data-lucide]');
    if (icon) {
      icon.setAttribute('data-lucide', isLight ? 'moon' : 'sun');
      if (window.lucide) lucide.createIcons();
    }
  }

  // Contact form
  const form = document.getElementById('contact-form');
  const status = document.getElementById('form-status');
  if (form) {
    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (form.action.includes('YOUR_FORM_ID')) {
        if (status) { status.classList.remove('hidden'); status.textContent = 'Form not configured yet. Email me directly.'; status.style.color = '#F85149'; }
        return;
      }
      const btn = form.querySelector('button[type="submit"]');
      const original = btn.innerHTML;
      btn.disabled = true; btn.innerHTML = 'Sending…';
      try {
        const res = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
        if (status) status.classList.remove('hidden');
        if (res.ok) { if (status) { status.textContent = 'Message sent!'; status.style.color = '#3FB950'; } form.reset(); }
        else { if (status) { status.textContent = 'Something went wrong. Email me directly.'; status.style.color = '#F85149'; } }
      } catch {
        if (status) { status.classList.remove('hidden'); status.textContent = 'Network error. Email me directly.'; status.style.color = '#F85149'; }
      } finally {
        btn.disabled = false; btn.innerHTML = original;
        if (window.lucide) lucide.createIcons();
      }
    });
  }

  // Init AI Chat
  if (typeof window.initAIChat === 'function') window.initAIChat();
});
