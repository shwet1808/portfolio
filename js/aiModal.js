// aiModal.js - AI Assistant implementation
// This module sets up the AI assistant terminal UI, handles the API key UI,
// and processes user questions using the Gemini API via the helper in api.js.

/**
 * Initialise all event listeners for the AI assistant modal.
 * Call this function after the DOMContentLoaded event (handled in main.js).
 */
function initAIAssistant() {
  // Grab UI elements
  const aiModal = document.getElementById('ai-modal');
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

  if (!aiModal || !askAiTrigger || !aiTerminalOutput || !aiTerminalForm || !aiTerminalInput) {
    return;
  }

  const getApiKey = () => localStorage.getItem('gemini_api_key') || '';

  // Open modal
  askAiTrigger.addEventListener('click', () => {
    aiModal.classList.add('active');
    if (!getApiKey() && aiKeyPane && aiKeyInput) {
      // No API key saved yet: show the setup pane and focus its input instead of the terminal behind it
      aiKeyPane.classList.remove('hidden');
      aiKeyPane.classList.add('flex');
      aiKeyInput.value = '';
      setTimeout(() => aiKeyInput.focus(), 100);
    } else {
      setTimeout(() => aiTerminalInput.focus(), 100);
    }
  });

  const closeModal = () => {
    aiModal.classList.remove('active');
    if (aiKeyPane) {
      aiKeyPane.classList.add('hidden');
      aiKeyPane.classList.remove('flex');
    }
  };

  if (aiCloseBtn) aiCloseBtn.addEventListener('click', closeModal);

  // Click outside to close
  if (aiModal) {
    aiModal.addEventListener('click', e => {
      if (e.target === aiModal) closeModal();
    });
  }

  // Settings pane toggle
  if (aiSettingsBtn && aiKeyPane && aiKeyInput) {
    aiSettingsBtn.addEventListener('click', () => {
      const hidden = aiKeyPane.classList.contains('hidden');
      if (hidden) {
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

  if (aiKeyCancel && aiKeyPane) {
    aiKeyCancel.addEventListener('click', () => {
      aiKeyPane.classList.add('hidden');
      aiKeyPane.classList.remove('flex');
    });
  }

  if (aiKeySave && aiKeyPane && aiKeyInput) {
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

  // Helper to append messages
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

  function escapeHTML(str) {
    // Build entity strings via concatenation to prevent auto-formatting from converting them
    const entities = {
      '&': '&' + 'amp;',
      '<': '&' + 'lt;',
      '>': '&' + 'gt;',
      "'": '&#' + '39;',
      '"': '&' + 'quot;'
    };
    return str.replace(/[&<>'"]/g, tag => entities[tag] || tag);
  }

  function formatAIResponse(text) {
    // First escape all HTML to prevent XSS
    let formatted = escapeHTML(text);
    // Convert markdown links [text](url) to anchor tags
    formatted = formatted.replace(/\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener" class="text-accent underline">$1</a>');
    // Convert inline code `code` to styled code elements
    formatted = formatted.replace(/`([^`]+)`/g,
      '<code class="bg-white/5 px-1 py-0.5 rounded text-accent font-mono text-xs">$1</code>');
    // Convert markdown bullet points to • symbols
    formatted = formatted.replace(/^\s*[-*]\s+(.*)$/gm, '• $1');
    // Convert newlines to line breaks
    return formatted.replace(/\n/g, '<br>');
  }

  // Question submission handling
  aiTerminalForm.addEventListener('submit', async e => {
    e.preventDefault();
    const question = aiTerminalInput.value.trim();
    if (!question) return;
    appendTerminalMsg('user', question);
    aiTerminalInput.value = '';

    const key = getApiKey();
    if (!key) {
      appendTerminalMsg('system', 'Error: No Gemini API Key configured. Click the settings icon to add one.');
      return;
    }

    const loaderDiv = document.createElement('div');
    loaderDiv.className = 'flex items-start gap-2 text-muted';
    loaderDiv.innerHTML = `
      <span class="text-[#28C840] select-none">ai-assistant:~$</span>
      <span class="terminal-loading-dots">Analyzing query</span>
    `;
    aiTerminalOutput.appendChild(loaderDiv);
    aiTerminalOutput.scrollTop = aiTerminalOutput.scrollHeight;

    try {
      if (!window.PERSONA_DATA) {
        throw new Error('Persona data is not loaded.');
      }
      if (typeof window.callGemini !== 'function') {
        throw new Error('Gemini API helper is not loaded.');
      }
      const systemPrompt = `${window.PERSONA_DATA.systemInstruction}\n\nHere is my official portfolio persona data:\n${JSON.stringify(window.PERSONA_DATA, null, 2)}\n\nRecruiter's question: ${question}`;
      const reply = await window.callGemini(systemPrompt);
      loaderDiv.remove();
      appendTerminalMsg('ai', reply);
    } catch (err) {
      loaderDiv.remove();
      appendTerminalMsg('system', `API Error: ${err.message}. Please verify your API Key in Settings.`);
    }
  });
}

window.initAIAssistant = initAIAssistant;
