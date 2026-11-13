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
      const label = lang || 'text';
      return `<div class="code-block" dir="ltr">
  <div class="code-toolbar">
    <span class="code-lang">${escapeHtml(label)}</span>
  </div>
  <div class="code-body"><pre><code class="${cls}">${body}</code></pre></div>
</div>\n`;
    },

    image(token) {
      const { href = '', title = '', text = '' } = token;
      const titleAttr = title ? ` title="${escapeHtml(title)}"` : '';
      return `<img src="${escapeHtml(href)}" alt="${escapeHtml(text)}"${titleAttr} loading="lazy" decoding="async">`;
    },
  },
});

export function renderMarkdown(source) {
  let html = marked.parse(source);

  // Keep article heading levels semantic: the post title is the page h1, so
  // content must start at h2. Some posts are written with ### only.
  if (!/<h2[\s>]/.test(html) && /<h3[\s>]/.test(html)) {
    html = html.replace(/<(\/?)h([3-6])([\s>])/g, (match, closing, level, rest) => (
      `<${closing}h${Number(level) - 1}${rest}`
    ));
  }

  // Tables need a scroll container on narrow screens.
  html = html
    .replace(/<table>/g, '<div class="table-scroll"><table>')
    .replace(/<\/table>/g, '</table></div>');

  return html;
}
