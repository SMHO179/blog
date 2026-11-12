/**
 * بهبودهای کوچک سمت مرورگر (بدون وابستگی):
 * - toggling حالت نمایش (روشن / تاریک) با ذخیره‌ی ترجیح در localStorage
 * - افزودن دکمه‌ی «کپی» روی بلوک‌های کد.
 * بقیه‌ی سایت (حالت تاریک، کارت‌های بازشو و…) بدون جاوااسکریپت هم کار می‌کند.
 */

(function () {
  'use strict';

  const THEME_KEY = 'blog-theme';
  var html = document.documentElement;
  var toggle = document.getElementById('theme-toggle');

  function isDark() {
    return html.hasAttribute('data-theme');
  }

  function setTheme(dark) {
    if (dark) {
      html.setAttribute('data-theme', 'dark');
    } else {
      html.removeAttribute('data-theme');
    }

    if (toggle) {
      toggle.textContent = dark ? 'روشن' : 'تاریک';
      toggle.setAttribute('aria-pressed', dark ? 'true' : 'false');
    }

    try {
      localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light');
    } catch (e) {
      /* localStorage ممکن در حالتهای خصوصی یا مرورگرهای محدود در دسترس نباشد. */
    }
  }

  function initTheme() {
    var saved;
    try { saved = localStorage.getItem(THEME_KEY); } catch (e) { saved = null; }

    var dark;
    if (saved) {
      dark = saved === 'dark';
    } else {
      dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    setTheme(dark);
  }

  function toggleTheme() {
    setTheme(!isDark());
  }

  initTheme();

  if (toggle) {
    toggle.addEventListener('click', toggleTheme);
  }

  /* ── دکمه‌ی کپی بلوک‌های کد (حفظ‌شده از نسخه قبل) ── */

  function markCopied(button) {
    button.textContent = 'کپی شد';
    setTimeout(function () {
      button.textContent = 'کپی';
    }, 1600);
  }

  function copyWithClipboard(text, button) {
    navigator.clipboard.writeText(text).then(
      function () {
        markCopied(button);
      },
      function () {
        copyWithFallback(text, button);
      },
    );
  }

  function copyWithFallback(text, button) {
    var area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    try {
      document.execCommand('copy');
      markCopied(button);
    } catch (err) {
      /* کپی در مرورگرهای بسیار قدیمی ممکن نیست؛ بی‌صدا رد می‌شویم. */
    }
    document.body.removeChild(area);
  }

  function attachCopyButton(pre) {
    var code = pre.querySelector('code');
    if (!code || pre.querySelector('.copy-btn')) {
      return;
    }

    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'copy-btn';
    button.textContent = 'کپی';
    button.setAttribute('aria-label', 'کپی کد');
    button.setAttribute('aria-live', 'polite');

    button.addEventListener('click', function () {
      var text = code.innerText.replace(/\n$/, '');
      if (navigator.clipboard && window.isSecureContext) {
        copyWithClipboard(text, button);
      } else {
        copyWithFallback(text, button);
      }
    });

    pre.appendChild(button);
  }

  document.querySelectorAll('.post-content pre').forEach(attachCopyButton);
})();
