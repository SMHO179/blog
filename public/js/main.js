/**
 * بهبودهای کوچک سمت مرورگر (بدون وابستگی):
 * افزودن دکمه‌ی «کپی» روی بلوک‌های کد.
 * بقیه‌ی سایت (حالت تاریک، کارت‌های بازشو و…) بدون جاوااسکریپت هم کار می‌کند.
 */

(function () {
  'use strict';

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
