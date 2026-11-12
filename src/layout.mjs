/**
 * قالب‌های صفحه: چیدمان مشترک (سرصفحه، ناوبری، پابرگ)، صفحه‌ی اصلی،
 * صفحه‌ی نوشته و صفحه‌ی ۴۰۴.
 *
 * ساختار و ظاهر دقیقاً از index.html اصلی حفظ شده است؛
 * فقط بخش محتوایی بسته به نوع صفحه عوض می‌شود.
 */

import { escapeHtml, excerptFromHtml } from './lib/utils.mjs';
import { formatJalaliDate, toIsoDate } from './lib/dates.mjs';

/** قالب مشترک همه‌ی صفحه‌ها. */
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
  const siteTitle = isHome
    ? `      <h1 class="site-title">${escapeHtml(site.title)}</h1>`
    : `      <p class="site-title"><a href="/">${escapeHtml(site.title)}</a></p>`;

  // در صفحه‌ی اصلی لینک‌های ناوبری به لنگرهای همین صفحه اشاره می‌کنند.
  const navPrefix = isHome ? '' : '/';
  const canonicalTags = canonical
    ? `  <link rel="canonical" href="${escapeHtml(canonical)}">\n  <meta property="og:url" content="${escapeHtml(canonical)}">\n`
    : '';

  return `<!DOCTYPE html>
<html lang="fa" dir="rtl" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">

  <title>${escapeHtml(pageTitle)}</title>
  <meta
    name="description"
    content="${escapeHtml(description)}"
  >
${canonicalTags}  <meta property="og:type" content="${ogType}">
  <meta property="og:site_name" content="${escapeHtml(site.title)}">
  <meta property="og:title" content="${escapeHtml(pageTitle)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:locale" content="fa_IR">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${escapeHtml(pageTitle)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="theme-color" content="#121416">

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link
    href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap"
    rel="stylesheet"
  >
  <link rel="stylesheet" href="/css/style.css">
  <script src="/js/main.js" defer></script>
${extraHead ? `${extraHead}\n` : ''}</head>

<body>
  <div class="container">

    <header class="site-header">
${siteTitle}

      <p class="site-description">
        ${escapeHtml(site.description)}
      </p>
    </header>

    <nav class="site-nav" aria-label="منوی اصلی">
      <a href="${navPrefix}#posts">نوشته‌ها</a>
      <a href="${navPrefix}#about">درباره‌ی من</a>
      <a href="${navPrefix}#contact">تماس</a>
    </nav>

    <main>
${content}
    </main>

    <footer id="contact" class="site-footer">
      <h2 class="section-title">ارتباط</h2>

      <p>
        برای گفتگو می‌توانید به نشانی
        <a class="email" href="mailto:${escapeHtml(site.email)}">
          ${escapeHtml(site.email)}
        </a>
        ایمیل بزنید.
      </p>
    </footer>

  </div>
</body>
</html>
`;
}

/** لیست برچسب‌ها (درباره‌ی کارت نوشته یا سربرگ صفحه‌ی نوشته). */
function tagsMarkup(post) {
  if (!post.tags.length) {
    return '';
  }
  const items = post.tags.map((tag) => `        <li>#${escapeHtml(tag)}</li>`).join('\n');
  return `\n        <ul class="post-tags" aria-label="برچسب‌های نوشته">\n${items}\n        </ul>`;
}

/** صفحه‌ی اصلی: فهرست همه‌ی نوشته‌ها به شکل کارت‌های بازشو. */
export function renderHome({ site, posts, siteUrl }) {
  let postsSection;

  if (!posts.length) {
    postsSection = `      <p class="empty-posts">هنوز نوشته‌ای منتشر نشده است.</p>`;
  } else {
    const cards = posts.map((post) => {
      const description = post.description
        ? `\n          <p>${escapeHtml(post.description)}</p>`
        : '';

      return `      <details class="post">
        <summary class="post-title">${escapeHtml(post.title)}
          <span class="post-date"><time datetime="${toIsoDate(post.date)}">${formatJalaliDate(post.date)}</time></span>
        </summary>

        <div class="post-content">${description}${tagsMarkup(post)}
          <p><a href="/posts/${post.slugUri}/">ادامه‌ی مطلب…</a></p>
        </div>
      </details>`;
    }).join('\n\n');

    postsSection = cards;
  }

  return layout({
    site,
    pageTitle: site.title,
    description: site.description,
    canonical: `${siteUrl}/`,
    ogType: 'website',
    isHome: true,
    content: `      <section id="posts" aria-labelledby="posts-title">
        <h2 id="posts-title" class="section-title">آخرین نوشته‌ها</h2>

${postsSection}
      </section>

      <section id="about" aria-labelledby="about-title">
        <h2 id="about-title" class="section-title">درباره‌ی من</h2>

        <p>
          به نرم‌افزارهای آزاد و توسعه‌ی پروژه‌های متن‌باز علاقه‌مندم.
        </p>
      </section>`,
  });
}

/** صفحه‌ی اختصاصی هر نوشته. */
export function renderPost({ site, post, siteUrl }) {
  const url = `${siteUrl}/posts/${post.slugUri}/`;
  const description = post.description || excerptFromHtml(post.html);
  const tags = tagsMarkup(post);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description,
    datePublished: toIsoDate(post.date),
    inLanguage: 'fa-IR',
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
  };

  const extraHead = [
    `  <script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>`,
  ].join('\n');

  return layout({
    site,
    pageTitle: `${post.title} — ${site.title}`,
    description,
    canonical: url,
    ogType: 'article',
    isHome: false,
    extraHead,
    content: `      <article class="post-page" aria-labelledby="post-title">
        <p class="back-link"><a href="/">→ همه‌ی نوشته‌ها</a></p>

        <header class="post-header">
          <h1 id="post-title" class="post-page-title">${escapeHtml(post.title)}</h1>

          <div class="post-meta">
            <time datetime="${toIsoDate(post.date)}">${formatJalaliDate(post.date)}</time>${tags}
          </div>
        </header>

        <div class="post-content">
${post.html}
        </div>
      </article>`,
  });
}

/** صفحه‌ی ۴۰۴ (روی Vercel به‌طور خودکار برای مسیرهای ناموجود سرو می‌شود). */
export function renderNotFound({ site }) {
  return layout({
    site,
    pageTitle: `صفحه پیدا نشد — ${site.title}`,
    description: 'صفحه‌ای که دنبالش بودید در این وبلاگ وجود ندارد.',
    isHome: false,
    extraHead: '  <meta name="robots" content="noindex">',
    content: `      <section class="not-found" aria-labelledby="nf-title">
        <h1 id="nf-title" class="post-page-title">صفحه پیدا نشد</h1>

        <p class="empty-posts">
          خطای ۴۰۴ — نشانی‌ای که دنبالش بودید وجود ندارد یا جابه‌جا شده است.
        </p>

        <p><a href="/">بازگشت به خانه</a></p>
      </section>`,
  });
}
