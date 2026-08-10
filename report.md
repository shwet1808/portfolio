# 📋 Project Report: Shwet Kumar Portfolio Website

This document serves as a comprehensive developer report and guide to help you understand the architecture, logic, and design decisions of your portfolio codebase. Use this as a reference whenever you want to edit, extend, or troubleshoot the website in the future.

---

## 🏗️ Architecture & Project Directory

The project is structured as a high-performance, single-page application (SPA) mimicking a code editor/IDE environment.

```bash
portfolio/
├── assets/                  # Folder for static images, screenshots, icons
│   ├── icons/               # SVGs and vector items
│   └── images/              # Custom application screenshots or profile photos
├── css/
│   └── style.css            # Custom CSS style declarations (tokens, animations, media queries)
├── js/
│   ├── main.js              # Interactivity logic (typing, reveal on scroll, navigation hooks)
│   ├── aiModal.js           # AI assistant terminal modal (UI and API key handling)
│   ├── api.js               # Gemini API request helper
│   └── persona.js           # Persona dataset consumed by the AI assistant
├── index.html               # Semantic HTML structure & CDN framework configuration
└── README.md                # Public presentation of your portfolio
```

---

## 🎨 Design System & CSS Configuration

### 1. Color Palette (IDE Dark Theme)
The color theme is configured in both `index.html` (via Tailwind's CDN configuration script) and `css/style.css` (via standard CSS Variables).

* **Background (`--bg`)**: `#03050a` — Deep void background.
* **Panels (`--panel`)**: `rgba(10, 16, 32, 0.5)` — Glassmorphic dark surfaces mimicking the background of VS Code cards or terminals.
* **Borders (`--border`)**: `rgba(255, 255, 255, 0.06)` — Ultra-fine grid lines for code tabs.
* **Accent (`--accent`)**: `#00f2fe` — Neon cyan representing active files, focus indicators, and buttons.
* **Purple (`--purple`)**: `#bd00ff` — Neon purple for file titles and highlight text (applied through the Tailwind `amber` alias).

### 2. Fonts
* **Space Grotesk** (display font) — Used for modern, bold titles.
* **Inter** (body font) — Highly readable, standard sans-serif font for paragraph texts.
* **JetBrains Mono** (mono font) — Excellent code-editor monospaced typography used for filenames, code tabs, and details.

---

## ⚙️ Interactive Logic & Javascript Explanation

The logic inside `js/main.js` is encapsulated within a `DOMContentLoaded` event block, ensuring scripts only execute after the browser builds the DOM tree.

### 1. Auto-updating Footer Year
```javascript
document.getElementById('year').textContent = new Date().getFullYear();
```
Automatically retrieves the current user system year and updates the footer tag, preventing your copyright text from looking outdated.

### 2. Dynamic Hero Gutter
In the hero banner, a code editor line numbers gutter (`1` to `8`) is injected into the `#hero-gutter` block. This is built dynamically using JavaScript DOM loops to avoid hardcoding repetitive list elements in your HTML.

### 3. Bio Typewriter Animation
The typewriter effect reads the static text summary and appends characters one-by-one with a `setTimeout` loop.
* **Accessibility Rule**: It queries `window.matchMedia('(prefers-reduced-motion: reduce)')`. If a visitor has reduced-motion enabled on their operating system, the animation is bypassed, and the text is loaded instantly to prevent dizziness or eye fatigue.

### 4. Intersection Observers (High Performance)
Instead of monitoring the viewport scroll using expensive `window.addEventListener('scroll')` hooks (which lag the page), the site uses two instances of the high-performance **`IntersectionObserver` API**:
* **Scroll-Reveal Observer**: Looks for elements with the `.reveal` class. Once at least `12%` of the element enters the screen viewport, it injects the `.is-visible` CSS class, triggering a smooth fade-in and slide-up transition.
* **Scroll-Spy Tab Observer**: Triggers when a page section intersects the middle vertical band (`rootMargin: '-45% 0px -45% 0px'`). It maps the section ID (e.g. `#skills`) to the navigation tab links to toggle the `.active-tab` highlight underline.

### 5. AJAX Form Submission
The contact form uses custom AJAX submit handlers:
* Prevent default refresh (`e.preventDefault()`).
* Disable the button and change text to `Sending…` to block double requests.
* Submit variables to **Formspree** via `fetch(..., { method: 'POST' })`.
* Display custom success (`✓`) or error (`✗`) feedback notices in green or red.

---

## 📱 Responsiveness Features

The portfolio is fully responsive and supports all screen resolutions (Phone, Tablet, Laptop, Desktop):
1. **Adaptive Header**: The visual IDE window dots automatically hide on screens smaller than `640px` (using `.hidden .sm:flex`), dedicating the entire narrow header width to scrollable tabs.
2. **Scrollable Tabs Navigation**: Tabs are containerized with horizontal overflow scroll (`overflow-x-auto`) and hidden scrollbar utilities (`.no-scrollbar`), allowing mobile users to swipe through files easily.
3. **Hero Title Clamping**: The primary hero heading scales from `text-2xl` on phones up to `text-6xl` on high-resolution displays to ensure it never overflows page borders or clips text.
4. **Adaptive Padding**: Section spacing dynamically switches from `4rem` (vertical padding on small mobile viewports) to `6rem` on desktop screens to maintain clean whitespace.
5. **Flexible Columns**: Layout containers use responsive utility grids (e.g., `sm:grid-cols-2`, `md:grid-cols-2`) to align side-by-side on wide displays and stack vertically on screens under `768px`.
