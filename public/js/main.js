(() => {
  'use strict';

  const SELECTORS = {
    codeBlocks: '.post-content pre',
    code: 'code',
    button: '.copy-btn',
  };

  const LABELS = {
    idle: 'کپی',
    copying: 'در حال کپی...',
    success: 'کپی شد!',
    error: 'خطا در کپی!',
  };

  const RESET_DELAY = 1800;

  /**
   * Update button state.
   */
  function updateButton(button, state) {
    clearTimeout(button.resetTimer);

    button.dataset.state = state;
    button.textContent = LABELS[state];
    button.disabled = state === 'copying';

    if (state !== 'copying') {
      button.resetTimer = setTimeout(() => {
        updateButton(button, 'idle');
      }, RESET_DELAY);
    }
  }

  /**
   * Copy using Clipboard API.
   */
  async function copyModern(text) {
    if (!navigator.clipboard || !window.isSecureContext) {
      throw new Error('Clipboard API unavailable');
    }

    await navigator.clipboard.writeText(text);
  }

  /**
   * Legacy clipboard fallback.
   */
  function copyFallback(text) {
    const textarea = document.createElement('textarea');

    textarea.value = text;
    textarea.readOnly = true;
    textarea.setAttribute('aria-hidden', 'true');

    textarea.style.cssText = `
      position: fixed;
      top: 0;
      left: -9999px;
      opacity: 0;
      pointer-events: none;
    `;

    document.body.appendChild(textarea);

    try {
      textarea.focus();
      textarea.select();
      textarea.setSelectionRange(0, text.length);

      if (!document.execCommand('copy')) {
        throw new Error('Copy failed');
      }
    } finally {
      textarea.remove();
    }
  }

  /**
   * Copy code content.
   */
  async function copyCode(button, code) {
    if (button.disabled) return;

    const text = code.textContent.replace(/\n$/, '');

    if (!text.trim()) {
      updateButton(button, 'error');
      return;
    }

    updateButton(button, 'copying');

    try {
      try {
        await copyModern(text);
      } catch {
        copyFallback(text);
      }

      updateButton(button, 'success');
    } catch (error) {
      console.error('Clipboard error:', error);
      updateButton(button, 'error');
    }
  }

  /**
   * Create copy buttons for code blocks.
   */
  function initializeCodeBlocks() {
    document.querySelectorAll(SELECTORS.codeBlocks).forEach((pre) => {
      if (!pre.querySelector(SELECTORS.code)) return;
      if (pre.querySelector(SELECTORS.button)) return;

      const button = document.createElement('button');

      button.type = 'button';
      button.className = 'copy-btn';
      button.textContent = LABELS.idle;
      button.dataset.state = 'idle';
      button.setAttribute('aria-label', 'کپی کد');
      button.setAttribute('aria-live', 'polite');

      pre.appendChild(button);
    });
  }

  /**
   * Handle copy button clicks.
   */
  document.addEventListener('click', (event) => {
    const button = event.target.closest(SELECTORS.button);

    if (!button || button.disabled) return;

    const pre = button.closest('pre');
    const code = pre?.querySelector(SELECTORS.code);

    if (code) {
      copyCode(button, code);
    }
  });

  /**
   * Initialize application.
   */
  function init() {
    initializeCodeBlocks();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
