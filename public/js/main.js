(() => {
  'use strict';

  const SELECTORS = {
    codeBlocks: '.code-block',
    button: '.copy-button',
  };

  const LABELS = {
    idle: 'کپی',
    copying: 'در حال کپی…',
    success: 'کپی شد!',
    error: 'خطا در کپی!',
  };

  const RESET_DELAY = 1800;

  /**
   * Update button state and accessible label.
   */
  function updateButton(button, state) {
    clearTimeout(button.resetTimer);

    button.dataset.state = state;
    button.textContent = LABELS[state];
    button.setAttribute('aria-label', state === 'idle' ? 'کپی کد' : LABELS[state]);
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
   * Copy code content from the nearest .code-block.
   */
  async function copyCode(button) {
    if (button.disabled) return;

    const block = button.closest(SELECTORS.codeBlocks);
    const code = block?.querySelector('code');

    if (!code) {
      updateButton(button, 'error');
      return;
    }

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
   * Create copy buttons for code blocks that do not already have one.
   */
  function initializeCodeBlocks() {
    document.querySelectorAll(SELECTORS.codeBlocks).forEach((block) => {
      if (!block.querySelector('code')) return;
      if (block.querySelector(SELECTORS.button)) return;

      const button = document.createElement('button');

      button.type = 'button';
      button.className = 'copy-button';
      button.textContent = LABELS.idle;
      button.dataset.state = 'idle';
      button.setAttribute('aria-label', 'کپی کد');
      button.setAttribute('aria-live', 'polite');

      const toolbar = block.querySelector('.code-toolbar');
      if (toolbar) {
        toolbar.appendChild(button);
      } else {
        block.insertBefore(button, block.firstChild);
      }
    });
  }

  /**
   * Handle copy button clicks.
   */
  document.addEventListener('click', (event) => {
    const button = event.target.closest(SELECTORS.button);

    if (!button || button.disabled) return;

    copyCode(button);
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
