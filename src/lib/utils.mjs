/**
 * ابزارهای کوچک مشترک بین اسکریپت ساخت و قالب‌ها.
 */

/** فرار دادن کاراکترهای خاص HTML برای درج امن در قالب‌ها و ویژگی‌ها. */
export function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, (ch) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]
  ));
}

/** استخراج متن ساده از HTML خروجی مارک‌داون (برای توضیحات متا در نبود frontmatter). */
export function excerptFromHtml(html, limit = 157) {
  const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  return text.slice(0, limit) + (text.length > limit ? '…' : '');
}
