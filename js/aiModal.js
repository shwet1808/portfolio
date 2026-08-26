/**
 * AI Chat — Modern chat interface using Gemini API
 */
function initAIChat() {
  const panel = document.getElementById('ai-chat-panel');
  const toggle = document.getElementById('ai-chat-toggle');
  const closeBtn = document.getElementById('ai-close-btn');
  const settingsBtn = document.getElementById('ai-settings-btn');
  const keyPane = document.getElementById('ai-key-pane');
  const keyInput = document.getElementById('ai-key-input');
  const keySave = document.getElementById('ai-key-save');
  const keyCancel = document.getElementById('ai-key-cancel');
  const messages = document.getElementById('ai-chat-messages');
  const suggestions = document.getElementById('ai-suggestions');
  const chatForm = document.getElementById('ai-chat-form');
  const chatInput = document.getElementById('ai-chat-input');

  if (!panel || !toggle || !messages || !chatForm || !chatInput) return;

  const getKey = () => localStorage.getItem('gemini_api_key') || '';

  // Toggle panel
  toggle.addEventListener('click', () => {
    const isOpen = panel.classList.contains('open');
    if (isOpen) {
      panel.classList.remove('open');
    } else {
      panel.classList.add('open');
      if (!getKey() && keyPane) showKeyPane();
      else setTimeout(() => chatInput.focus(), 100);
    }
  });

  closeBtn?.addEventListener('click', () => panel.classList.remove('open'));

  // Key pane
  function showKeyPane() {
    if (!keyPane) return;
    keyPane.classList.remove('hidden');
    keyPane.classList.add('flex');
    if (keyInput) { keyInput.value = getKey(); keyInput.focus(); }
  }

  function hideKeyPane() {
    if (!keyPane) return;
    keyPane.classList.add('hidden');
    keyPane.classList.remove('flex');
  }

  settingsBtn?.addEventListener('click', () => {
    if (keyPane?.classList.contains('hidden')) showKeyPane();
    else hideKeyPane();
  });

  keyCancel?.addEventListener('click', hideKeyPane);

  keySave?.addEventListener('click', () => {
    const val = keyInput?.value.trim();
    if (val) {
      localStorage.setItem('gemini_api_key', val);
      addMessage('system', 'API key saved.');
      hideKeyPane();
      chatInput.focus();
    }
  });

  // Suggestions
  suggestions?.addEventListener('click', e => {
    const btn = e.target.closest('.chat-suggestion');
    if (btn) sendMessage(btn.dataset.q);
  });

  // Form submit
  chatForm.addEventListener('submit', e => {
    e.preventDefault();
    const q = chatInput.value.trim();
    if (q) sendMessage(q);
  });

  // Handle Enter key (not Shift+Enter)
  chatInput.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      chatForm.dispatchEvent(new Event('submit'));
    }
  });

  async function sendMessage(text) {
    chatInput.value = '';
    hideSuggestions();
    addMessage('user', text);

    const key = getKey();
    if (!key) {
      addMessage('system', 'No API key configured. Click settings to add one.');
      return;
    }

    const typing = addTyping();

    try {
      const prompt = `${window.PERSONA_DATA.systemInstruction}\n\nMy portfolio data:\n${JSON.stringify(window.PERSONA_DATA)}\n\nQuestion: ${text}`;
      const reply = await callGemini(prompt);
      typing.remove();
      addMessage('ai', reply);
    } catch (err) {
      typing.remove();
      addMessage('system', err.message || 'Failed to get response.');
    }
  }

  function addMessage(type, text) {
    const div = document.createElement('div');
    if (type === 'user') {
      div.className = 'chat-msg chat-msg-user';
      div.textContent = text;
    } else if (type === 'ai') {
      div.className = 'chat-msg chat-msg-ai';
      div.innerHTML = formatResponse(text);
    } else {
      div.className = 'chat-msg-system';
      div.textContent = text;
    }
    messages.appendChild(div);
    scrollDown();
  }

  function addTyping() {
    const div = document.createElement('div');
    div.className = 'chat-typing';
    div.innerHTML = '<span></span><span></span><span></span>';
    messages.appendChild(div);
    scrollDown();
    return div;
  }

  function scrollDown() {
    messages.scrollTop = messages.scrollHeight;
  }

  function hideSuggestions() {
    if (suggestions) suggestions.style.display = 'none';
  }

  function formatResponse(text) {
    let s = escapeHTML(text);
    s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener" class="text-accent underline">$1</a>');
    s = s.replace(/`([^`]+)`/g, '<code class="bg-white/5 px-1 rounded text-accent text-xs">$1</code>');
    s = s.replace(/^\s*[-*]\s+(.*)$/gm, '• $1');
    return s.replace(/\n/g, '<br>');
  }

  function escapeHTML(str) {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' };
    return str.replace(/[&<>'"]/g, c => map[c]);
  }
}

window.initAIChat = initAIChat;
