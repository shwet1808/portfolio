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

  // AI Assistant Chatbot Logic
  const aiModal = document.getElementById('ai-modal');
  const aiModalContent = document.getElementById('ai-modal-content');
  const askAiTrigger = document.getElementById('ask-ai-trigger');
  const aiCloseBtn = document.getElementById('ai-close-btn');
  const aiSettingsBtn = document.getElementById('ai-settings-btn');
  const aiKeyPane = document.getElementById('ai-key-pane');
  const aiKeyInput = document.getElementById('ai-key-input');
  const aiKeySave = document.getElementById('ai-key-save');
  const aiKeyCancel = document.getElementById('ai-key-cancel');
  const aiTerminalOutput = document.getElementById('ai-terminal-output');
  const aiTerminalForm = document.getElementById('ai-terminal-form');
  const aiTerminalInput = document.getElementById('ai-terminal-input');

  const PERSONA_DATA = {
    name: "Shwet Kumar",
    role: "Frontend Developer & Data Analytics Specialist",
    location: "Patna, Bihar, India",
    email: "shwetkumar29@gmail.com",
    phone: "+91 6206689448",
    github: "https://github.com/shwet1808",
    linkedin: "https://www.linkedin.com/in/shwet-kumar-518b52339/",
    education: [
      {
        degree: "M.Sc. in Computer Science (Data Analytics)",
        institution: "A.N. College, Patna",
        period: "2026 - 2028",
        details: "Currently pursuing. Specializing in Advanced Data Analytics, Machine Learning, Statistical forecasting, and Big Data technologies."
      },
      {
        degree: "B.Sc. in Information Technology",
        institution: "A.N. College, Patna",
        period: "2023 - 2026",
        details: "Graduated in 2026. Relevant coursework included Data Structures, Web Technologies, Database Management Systems (DBMS), Operating Systems, and Computer Architecture."
      },
      {
        degree: "Class 12 (Science Stream - PCM)",
        institution: "St. Xavier's High School, Patna",
        period: "2021 - 2023",
        details: "Completed Intermediate with Physics, Chemistry, and Mathematics."
      }
    ],
    skills: {
      frontend: ["HTML5", "CSS3", "JavaScript (ES6+)", "React.js", "Next.js", "Bootstrap", "Tailwind CSS", "Responsive Design"],
      backend: ["Node.js", "Express.js", "REST APIs", "JWT Authentication", "bcrypt"],
      database: ["MongoDB", "MySQL", "Parameterized Queries", "Transactions", "Row-level locking"],
      tools: ["Git", "GitHub", "Canva", "Recharts", "Netlify", "Vercel", "AI-Assisted Development"]
    },
    projects: [
      {
        name: "AI Powered Coding Error Finder",
        tech: ["React.js", "Express.js", "Gemini API"],
        details: [
          "Full-stack web application that accepts user-submitted code and returns AI-generated error analysis and improvement suggestions via the Gemini API.",
          "RESTful endpoints handle code input, process Gemini API responses, and return structured feedback to the frontend in real time.",
          "Deployed on Vercel with a clean, responsive React UI for pasting and analyzing code directly in the browser."
        ],
        links: { repo: "https://github.com/shwet1808/error-finder-", live: "https://error-finder.vercel.app" }
      },
      {
        name: "GrocerEase - Full-Stack Grocery ERP",
        tech: ["Next.js", "Tailwind", "Node.js", "MySQL"],
        details: [
          "Full-stack ERP platform supporting separate customer and admin workflows: browsing, order placement, and inventory management.",
          "Role-based access control (Customer, Admin) secured with JWT auth (auto-expiry) and bcrypt password hashing.",
          "Admin analytics dashboard built with Recharts — real-time revenue, profit, order trends, and automated low-stock alerts under 10 units.",
          "Backend engineered with parameterized SQL queries, transactions with rollback support, and row-level locking for concurrent orders."
        ],
        links: { live: "https://grocerease123.netlify.app" }
      }
    ]
  };

  // Helper: Get stored Gemini API key
  const getApiKey = () => localStorage.getItem('gemini_api_key') || '';

  // Open modal
  if (askAiTrigger) {
    askAiTrigger.addEventListener('click', () => {
      aiModal.classList.add('active');
      setTimeout(() => {
        aiTerminalInput.focus();
      }, 100);
      
      // If key is not configured, show key configuration pane first
      if (!getApiKey()) {
        aiKeyPane.classList.remove('hidden');
        aiKeyPane.classList.add('flex');
      }
    });
  }

  // Close modal
  const closeModal = () => {
    aiModal.classList.remove('active');
    aiKeyPane.classList.add('hidden');
    aiKeyPane.classList.remove('flex');
  };

  if (aiCloseBtn) {
    aiCloseBtn.addEventListener('click', closeModal);
  }

  // Close modal on click outside of panel
  if (aiModal) {
    aiModal.addEventListener('click', (e) => {
      if (e.target === aiModal) {
        closeModal();
      }
    });
  }

  // Toggle API Key settings pane
  if (aiSettingsBtn) {
    aiSettingsBtn.addEventListener('click', () => {
      const isHidden = aiKeyPane.classList.contains('hidden');
      if (isHidden) {
        aiKeyPane.classList.remove('hidden');
        aiKeyPane.classList.add('flex');
        aiKeyInput.value = getApiKey();
        aiKeyInput.focus();
      } else {
        aiKeyPane.classList.add('hidden');
        aiKeyPane.classList.remove('flex');
      }
    });
  }

  // Cancel API key configuration
  if (aiKeyCancel) {
    aiKeyCancel.addEventListener('click', () => {
      aiKeyPane.classList.add('hidden');
      aiKeyPane.classList.remove('flex');
    });
  }

  // Save API key
  if (aiKeySave) {
    aiKeySave.addEventListener('click', () => {
      const keyVal = aiKeyInput.value.trim();
      if (keyVal) {
        localStorage.setItem('gemini_api_key', keyVal);
        appendTerminalMsg('system', '✓ Gemini API key saved successfully.');
        aiKeyPane.classList.add('hidden');
        aiKeyPane.classList.remove('flex');
        aiTerminalInput.focus();
      } else {
        alert('Please enter a valid API Key.');
      }
    });
  }

  // Helper: Append messages to the terminal
  function appendTerminalMsg(sender, text) {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'flex items-start gap-2';
    
    if (sender === 'user') {
      msgDiv.innerHTML = `
        <span class="text-[#28C840] select-none">guest:~$</span>
        <span class="text-accent">${escapeHTML(text)}</span>
      `;
    } else if (sender === 'ai') {
      msgDiv.innerHTML = `
        <span class="text-[#28C840] select-none">ai-assistant:~$</span>
        <span class="text-text terminal-ai-msg">${formatAIResponse(text)}</span>
      `;
    } else {
      msgDiv.innerHTML = `
        <span class="text-muted select-none">//</span>
        <span class="terminal-system-msg">${escapeHTML(text)}</span>
      `;
    }
    
    aiTerminalOutput.appendChild(msgDiv);
    aiTerminalOutput.scrollTop = aiTerminalOutput.scrollHeight;
  }

  // Helper: Escape HTML to prevent injection
  function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }

  // Helper: Format AI markdown/code blocks neatly
  function formatAIResponse(text) {
    // Simple markdown link conversion
    let formatted = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener" class="text-accent underline">$1</a>');
    // Code blocks styling
    formatted = formatted.replace(/`([^`]+)`/g, '<code class="bg-white/5 px-1 py-0.5 rounded text-accent font-mono text-xs">$1</code>');
    // Bullet lines styling
    formatted = formatted.replace(/^\s*[-*]\s+(.*)$/gm, '• $1');
    // Line breaks
    return formatted.replace(/\n/g, '<br>');
  }

  // Handle Question Submission
  if (aiTerminalForm) {
    aiTerminalForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const question = aiTerminalInput.value.trim();
      if (!question) return;

      // Append user prompt to logs
      appendTerminalMsg('user', question);
      aiTerminalInput.value = '';

      // Validate API Key
      const key = getApiKey();
      if (!key) {
        appendTerminalMsg('system', 'Error: No Gemini API Key configured. Please click the settings icon at the top right to configure your API key.');
        return;
      }

      // Create loading indicator
      const loaderDiv = document.createElement('div');
      loaderDiv.className = 'flex items-start gap-2 text-muted';
      loaderDiv.innerHTML = `
        <span class="text-[#28C840] select-none">ai-assistant:~$</span>
        <span class="terminal-loading-dots">Analyzing query</span>
      `;
      aiTerminalOutput.appendChild(loaderDiv);
      aiTerminalOutput.scrollTop = aiTerminalOutput.scrollHeight;

      try {
        const systemPrompt = `You are Shwet Kumar, replying directly to a recruiter or visitor on your portfolio website. 
Answer their question concisely, professionally, and naturally in the first person ("I", "my", "me").
Be enthusiastic, highlight my data analytics and frontend skills, and always link back to relevant projects or coursework from my education.
If the question is completely unrelated to my profile, skills, projects, or background, politely steer the conversation back.

Here is my official portfolio persona data:
${JSON.stringify(PERSONA_DATA, null, 2)}

Recruiter's question: ${question}`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: systemPrompt }] }]
          })
        });

        // Remove loading indicator
        loaderDiv.remove();

        if (response.ok) {
          const data = await response.json();
          const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't generate a response. Please try asking in a different way!";
          appendTerminalMsg('ai', reply);
        } else {
          const errData = await response.json().catch(() => ({}));
          const errMsg = errData.error?.message || response.statusText;
          appendTerminalMsg('system', `API Error: ${errMsg}. Please verify your API Key in Settings.`);
        }
      } catch (err) {
        loaderDiv.remove();
        appendTerminalMsg('system', 'Network connection error. Please try again.');
      }
    });
  }

});

