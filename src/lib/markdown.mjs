import { Marked } from 'marked';
import hljs from 'highlight.js';
import { escapeHtml } from './utils.mjs';

const marked = new Marked({ gfm: true });

marked.use({
  renderer: {
    code(token) {
      const info = (token.lang || '').trim();
      const lang = info.split(/\s+/)[0].toLowerCase();
      const known = lang && Boolean(hljs.getLanguage(lang));

      let body;
      if (known) {
        body = hljs.highlight(token.text, { language: lang, ignoreIllegals: true }).value;
      } else if (!lang) {
        body = hljs.highlightAuto(token.text).value;
      } else {
        body = escapeHtml(token.text);
      }

      const cls = known ? `hljs language-${escapeHtml(lang)}` : 'hljs';
      return `<pre dir="ltr"><code class="${cls}">${body}</code></pre>\n`;
    },

    image(token) {
      const { href = '', title = '', text = '' } = token;
      const titleAttr = title ? ` title="${escapeHtml(title)}"` : '';
      return `<img src="${escapeHtml(href)}" alt="${escapeHtml(text)}"${titleAttr} loading="lazy" decoding="async">`;
    },
  },
});

export function renderMarkdown(source) {
  return marked.parse(source);
}
