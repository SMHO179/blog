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

  const THEME = {
    key: 'theme',
    colors: {
      light: '#f7f3ea',
      dark: '#12140f',
    },
  };

  function currentTheme() {
    return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
  }

  /**
   * Apply a theme, update the browser chrome color and button labels.
   */
  function applyTheme(theme, persist) {
    const isDark = theme === 'dark';

    document.documentElement.dataset.theme = isDark ? 'dark' : 'light';

    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) {
      themeColor.setAttribute('content', isDark ? THEME.colors.dark : THEME.colors.light);
    }

    document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
      const label = isDark ? 'فعال کردن حالت روشن' : 'فعال کردن حالت تاریک';

      button.setAttribute('aria-label', label);
      button.setAttribute('title', label);
    });

    if (persist) {
      try {
        localStorage.setItem(THEME.key, theme);
      } catch {
        /* The theme still applies for this page view. */
      }
    }
  }

  /**
   * Wire up the theme switch and follow the system preference when the
   * visitor has not chosen a theme explicitly.
   */
  function initializeTheme() {
    applyTheme(currentTheme(), false);

    document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
      button.addEventListener('click', () => {
        applyTheme(currentTheme() === 'dark' ? 'light' : 'dark', true);
      });
    });

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const syncWithSystem = (event) => {
      let stored = null;

      try {
        stored = localStorage.getItem(THEME.key);
      } catch {
        /* Ignore unavailable storage. */
      }

      if (!stored) {
        applyTheme(event.matches ? 'dark' : 'light', false);
      }
    };

    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', syncWithSystem);
    } else if (typeof media.addListener === 'function') {
      media.addListener(syncWithSystem);
    }
  }

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
    initializeTheme();
    initializeCodeBlocks();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
