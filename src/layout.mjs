import { escapeHtml, excerptFromHtml } from './lib/utils.mjs';
import {
  formatJalaliDate,
  toIsoDate,
  toJalali,
  toPersianDigits,
} from './lib/dates.mjs';

const BRAND_TAGLINE = 'یادداشت‌ها و تجربه‌ها';

function readingMinutes(html) {
  const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const words = text ? text.split(' ').length : 0;
  return Math.max(1, Math.round(words / 180));
}

function tagsMarkup(tags, listClass, itemClass) {
  if (!tags.length) return '';
  const items = tags
    .map((tag) => `<li><span class="${itemClass}">${escapeHtml(tag)}</span></li>`)
    .join('');
  return `<ul class="tag-list ${listClass}" aria-label="برچسب‌های نوشته">${items}</ul>`;
}

export function layout({
  site,
  pageTitle,
  description,
  canonical = '',
  ogType = 'website',
  isHome = false,
  extraHead = '',
  content,
}) {
  const navPrefix = isHome ? '' : '/';
  const canonicalTags = canonical
    ? `  <link rel="canonical" href="${escapeHtml(canonical)}">\n  <meta property="og:url" content="${escapeHtml(canonical)}">\n`
    : '';

  const extraHeadHtml = extraHead ? `${extraHead}\n` : '';
  const year = toPersianDigits(toJalali(new Date()).jy);

  return `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">

  <title>${escapeHtml(pageTitle)}</title>
  <meta name="description" content="${escapeHtml(description)}">
${canonicalTags}  <meta property="og:type" content="${ogType}">
  <meta property="og:site_name" content="${escapeHtml(site.title)}">
  <meta property="og:title" content="${escapeHtml(pageTitle)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:locale" content="fa_IR">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${escapeHtml(pageTitle)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="theme-color" content="#f7f3ea">
  <script>
    (() => {
      document.documentElement.classList.add('js');

      try {
        const stored = localStorage.getItem('theme');
        const system = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        const theme = stored === 'dark' || stored === 'light' ? stored : system;
        document.documentElement.dataset.theme = theme;
        document.querySelector('meta[name="theme-color"]')
          .setAttribute('content', theme === 'dark' ? '#12140f' : '#f7f3ea');
      } catch {
        /* Keep the light default. */
      }
    })();
  </script>

  <link rel="preload" href="/fonts/AradVF.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/css/style.css">
  <script src="/js/main.js" defer></script>
${extraHeadHtml}</head>

<body>
  <a class="skip-link" href="#main-content">رفتن به محتوای اصلی</a>

  <header class="masthead">
    <div class="container masthead__inner">
      <a class="brand" href="/" aria-label="${escapeHtml(site.title)} — صفحه‌ی اصلی">
        <img class="brand__logo" src="/images/logo.png" alt="" aria-hidden="true" width="40" height="40">
        <span class="brand__text">
          <span class="brand__name">${escapeHtml(site.title)}</span>
          <span class="brand__tag">${BRAND_TAGLINE}</span>
        </span>
      </a>

      <div class="masthead__tools">
        <nav class="nav" aria-label="ناوبری اصلی">
          <a href="${navPrefix}#posts">نوشته‌ها</a>
          <a href="${navPrefix}#about">درباره</a>
          <a href="#contact">ارتباط</a>
        </nav>

        <button class="theme-toggle" type="button" data-theme-toggle aria-label="فعال کردن حالت تاریک" title="فعال کردن حالت تاریک">
          <svg class="theme-toggle__icon theme-toggle__icon--moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M20.4 14.2A8.5 8.5 0 0 1 9.8 3.6 8.5 8.5 0 1 0 20.4 14.2Z"/>
          </svg>
          <svg class="theme-toggle__icon theme-toggle__icon--sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="4.2"/>
            <path d="M12 2.4v2.2M12 19.4v2.2M2.4 12h2.2M19.4 12h2.2M5.2 5.2l1.6 1.6M17.2 17.2l1.6 1.6M18.8 5.2l-1.6 1.6M6.8 17.2l-1.6 1.6"/>
          </svg>
        </button>
      </div>
    </div>
  </header>

  <main id="main-content" role="main">
${content}
  </main>

  <footer id="contact" class="site-footer">
    <div class="container footer__top">
      <div class="footer__brand">
        <p class="footer__name">${escapeHtml(site.title)}</p>
        <p class="footer__desc">${escapeHtml(site.description)}</p>
      </div>

      <nav class="footer__col" aria-label="پیوندهای پانوشت">
        <p class="footer__label">فهرست</p>
        <ul class="footer__links">
          <li><a href="${navPrefix}#posts">نوشته‌ها</a></li>
          <li><a href="${navPrefix}#about">درباره</a></li>
          <li><a href="/">صفحه‌ی اصلی</a></li>
        </ul>
      </nav>

      <div class="footer__col footer__col--contact">
        <p class="footer__label">ارتباط</p>
        <a class="footer__email" href="mailto:${escapeHtml(site.email)}">${escapeHtml(site.email)}</a>
        <p class="footer__note">برای گفت‌وگو، پیشنهاد یا اصلاح نوشته‌ها بنویسید.</p>
      </div>
    </div>

    <div class="container footer__base">
      <p>© ${year} ${escapeHtml(site.title)}</p>
      <p>ساخته‌شده با <span class="footer__tech">Node.js</span> و <span class="footer__tech">Markdown</span></p>
    </div>
  </footer>
</body>
</html>
`;
}

export function renderHome({ site, posts, siteUrl }) {
  const latest = posts[0] || null;
  const count = toPersianDigits(posts.length);

  const latestAction = latest
    ? `<a class="action action--quiet" href="/posts/${latest.slugUri}/">تازه‌ترین یادداشت</a>`
    : '';

  let postsSection;

  if (!posts.length) {
    postsSection = '<p class="empty">هنوز نوشته‌ای منتشر نشده است.</p>';
  } else {
    postsSection = posts.map((post, index) => {
      const number = toPersianDigits(String(index + 1).padStart(2, '0'));
      const isLead = index === 0;
      const description = post.description
        ? `<p class="entry__desc">${escapeHtml(post.description)}</p>`
        : '';
      const tags = tagsMarkup(post.tags, 'entry__tags', 'entry__tag');

      return `        <article class="entry${isLead ? ' entry--lead' : ''}">
          <a class="entry__link" href="/posts/${post.slugUri}/">
            <span class="entry__num" aria-hidden="true">${number}</span>
            <div class="entry__body">
              ${isLead ? '<p class="entry__kicker">تازه‌ترین یادداشت</p>' : ''}
              <h3 class="entry__title">${escapeHtml(post.title)}</h3>
              ${description}
              ${tags}
            </div>
            <time class="entry__date" datetime="${toIsoDate(post.date)}">${formatJalaliDate(post.date)}</time>
          </a>
        </article>`;
    }).join('\n');
  }

  return layout({
    site,
    pageTitle: site.title,
    description: site.description,
    canonical: `${siteUrl}/`,
    ogType: 'website',
    isHome: true,
    content: `    <section id="about" class="intro" aria-labelledby="intro-title">
      <div class="container intro__grid">
        <div class="intro__main">
          <p class="eyebrow">وبلاگ شخصی</p>
          <h1 id="intro-title" class="intro__title">${escapeHtml(site.title)}</h1>
          <p class="intro__lead">${escapeHtml(site.description)}</p>
          <div class="intro__actions">
            <a class="action" href="#posts">فهرست نوشته‌ها <span class="action__arrow" aria-hidden="true">←</span></a>
            ${latestAction}
          </div>
        </div>
        <aside class="intro__aside" aria-label="درباره‌ی این دفتر">
          <p class="aside__label">درباره‌ی این دفتر</p>
          <p class="aside__text">
            اینجا یادداشت‌هایی از مسیر یادگیری، تجربه‌های کار با ابزارها و
            چیزهایی که هر روز یاد می‌گیرم منتشر می‌شود؛ بیشتر درباره‌ی
            برنامه‌نویسی، گیت، لینوکس و ساختن چیزهای کوچک.
          </p>
          <a class="aside__link" href="mailto:${escapeHtml(site.email)}">برای گفت‌وگو بنویسید</a>
        </aside>
      </div>
    </section>

    <section id="posts" class="index" aria-labelledby="index-title">
      <div class="container">
        <div class="index__head">
          <h2 id="index-title" class="index__title">نوشته‌ها</h2>
          <p class="index__meta">${count} یادداشت <span aria-hidden="true">·</span> از تازه به قدیم</p>
        </div>

        <div class="index__list">
${postsSection}
        </div>
      </div>
    </section>`,
  });
}

export function renderPost({ site, post, siteUrl, prev, next }) {
  const url = `${siteUrl}/posts/${post.slugUri}/`;
  const description = post.description || excerptFromHtml(post.html);
  const minutes = toPersianDigits(readingMinutes(post.html));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description,
    datePublished: toIsoDate(post.date),
    inLanguage: 'fa-IR',
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    publisher: {
      '@type': 'Organization',
      name: site.title,
    },
  };

  const extraHead = [
    `  <script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>`,
    post.tags.length ? `  <meta property="article:tag" content="${post.tags.join(', ')}">` : '',
  ].filter(Boolean).join('\n');

  const tags = tagsMarkup(post.tags, 'article__tags', 'tag');

  const prevLink = prev
    ? `<a class="pager__link pager__link--prev" href="/posts/${prev.slugUri}/">
            <span class="pager__label">نوشته‌ی قبلی</span>
            <span class="pager__title">${escapeHtml(prev.title)}</span>
          </a>`
    : '';
  const nextLink = next
    ? `<a class="pager__link pager__link--next" href="/posts/${next.slugUri}/">
            <span class="pager__label">نوشته‌ی بعدی</span>
            <span class="pager__title">${escapeHtml(next.title)}</span>
          </a>`
    : '';
  const pagerMarkup = prevLink || nextLink
    ? `<nav class="pager" aria-label="نوشته‌های قبلی و بعدی">
          ${prevLink}
          ${nextLink}
        </nav>`
    : '';

  return layout({
    site,
    pageTitle: `${post.title} — ${site.title}`,
    description,
    canonical: url,
    ogType: 'article',
    isHome: false,
    extraHead,
    content: `    <div class="container">
      <article class="article" aria-labelledby="post-title">
        <nav class="article__back" aria-label="بازگشت">
          <a href="/"><span class="article__back-arrow" aria-hidden="true">→</span> فهرست نوشته‌ها</a>
        </nav>

        <header class="article__header">
          <p class="article__kicker">
            <span class="article__kind">یادداشت</span>
            <span class="article__kicker-sep" aria-hidden="true">/</span>
            <span>${minutes} دقیقه مطالعه</span>
          </p>
          <h1 id="post-title" class="article__title">${escapeHtml(post.title)}</h1>
          <p class="article__lead">${escapeHtml(description)}</p>
          <div class="article__meta">
            <time datetime="${toIsoDate(post.date)}">${formatJalaliDate(post.date)}</time>
            ${tags}
          </div>
        </header>

        <div class="prose">
${post.html}
        </div>

        <footer class="article__footer">
          <p class="endmark">پایان یادداشت</p>
          ${pagerMarkup}
        </footer>
      </article>
    </div>`,
  });
}

export function renderNotFound({ site }) {
  return layout({
    site,
    pageTitle: `صفحه پیدا نشد — ${site.title}`,
    description: 'صفحه‌ای که دنبالش بودید در این وبلاگ وجود ندارد.',
    isHome: false,
    extraHead: '  <meta name="robots" content="noindex">',
    content: `    <div class="container">
      <section class="error" aria-labelledby="error-title">
        <p class="error__code" aria-hidden="true">۴۰۴</p>
        <h1 id="error-title" class="error__title">صفحه پیدا نشد</h1>
        <p class="error__text">
          نشانی‌ای که دنبالش بودید وجود ندارد یا جابه‌جا شده است.
        </p>
        <a class="action" href="/">بازگشت به فهرست نوشته‌ها <span class="action__arrow" aria-hidden="true">←</span></a>
      </section>
    </div>`,
  });
}
