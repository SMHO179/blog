import { escapeHtml, excerptFromHtml } from './lib/utils.mjs';
import { formatJalaliDate, toIsoDate } from './lib/dates.mjs';

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
    ? `<h1 class="site-title">${escapeHtml(site.title)}</h1>`
    : `<p class="site-title"><a href="/">${escapeHtml(site.title)}</a></p>`;

  const navPrefix = isHome ? '' : '/';
  const canonicalTags = canonical
    ? `  <link rel="canonical" href="${escapeHtml(canonical)}">\n  <meta property="og:url" content="${escapeHtml(canonical)}">\n`
    : '';

  const extraHeadHtml = extraHead ? `${extraHead}\n` : '';

  return `<!DOCTYPE html>
<html lang="fa" dir="rtl" data-theme="dark">
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
  <meta name="theme-color" content="#121416">

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/css/style.css">
  <script src="/js/main.js" defer></script>
${extraHeadHtml}</head>

<body>
  <a class="skip-link" href="#main-content">گزیردن به محتوای اصلی</a>

  <div class="container">

    <header class="site-header">
      <div class="site-brand">
        <img class="brand-logo" src="/images/logo.png" alt="" aria-hidden="true" width="34" height="34">
        ${siteTitle}
        <span class="brand-note">نوشته‌ها · کد</span>
      </div>

      <nav class="site-nav" aria-label="منوی اصلی">
        <a href="${navPrefix}#posts">نوشته‌ها</a>
        <a href="${navPrefix}#about">درباره‌ی من</a>
        <a href="${navPrefix}#contact">ارتباط</a>
      </nav>
    </header>

    <main id="main-content" role="main">
${content}
    </main>

    <footer id="contact" class="site-footer">
      <div class="footer-inner">
        <div class="footer-brand">
          ${siteTitle}
          <span class="footer-note">وبلاگ استاتیک فارسی · مارک‌داون · Node.js</span>
        </div>

        <div class="footer-contact">
          <span class="footer-label">ارتباط</span>
          <a class="footer-email" href="mailto:${escapeHtml(site.email)}">${escapeHtml(site.email)}</a>
        </div>

        <nav class="footer-nav">
          <a href="/">صفحه‌ی اصلی</a>
          <a href="#posts">نوشته‌ها</a>
        </nav>
      </div>

      <div class="footer-bottom">
        <p class="footer-credit">
          ساخته‌شده با <span class="tech">Node.js</span> و <span class="tech">Markdown</span> ·
          ${site.title}
        </p>
      </div>
    </footer>

  </div>
</body>
</html>
`;
}

export function renderHome({ site, posts, siteUrl }) {
  const readingTime = (text) => Math.max(1, Math.round(text.length / 400));
  const latest = posts[0] || null;

  const latestBlock = latest
    ? `
    <div class="feature-card">
      <span class="feature-label">آخرین نوشته</span>
      <h3 class="feature-title"><a href="/posts/${latest.slugUri}/">${escapeHtml(latest.title)}</a></h3>
      <p class="feature-description">${escapeHtml(latest.description || '')}</p>
      <div class="feature-meta">
        <time>${formatJalaliDate(latest.date)}</time>
        <span class="sep">·</span>
        <span class="tech">${readingTime(latest.description || latest.title)} دقیقه‌ی خواندن</span>
      </div>
    </div>`
    : '';

  let postsSection;

  if (!posts.length) {
    postsSection = `
      <p class="empty-state">هنوز نوشته‌ای منتشر نشده است.</p>`;
  } else {
    const rows = posts.map((post, index) => {
      const number = String(index + 1).padStart(2, '0');
      const description = post.description
        ? `\n        <p class="post-excerpt">${escapeHtml(post.description)}</p>`
        : '';

      return `      <article class="post-list-item">
        <a class="post-link" href="/posts/${post.slugUri}/">
          <span class="post-number">${number}</span>
          <div class="post-info">
            <h3 class="post-list-title">${escapeHtml(post.title)}</h3>
            <div class="post-list-meta">
              <time datetime="${toIsoDate(post.date)}">${formatJalaliDate(post.date)}</time>
              ${post.tags.length ? `<span class="sep">·</span> ${post.tags.length} برچسب` : ''}
            </div>
          </div>
        </a>
        ${description}
        <ul class="post-tags" aria-label="برچسب‌های نوشته">${post.tags.map((tag) => `<li><span class="post-tag">#${escapeHtml(tag)}</span></li>`).join('')}</ul>
      </article>`;
    }).join('\n');

    postsSection = rows;
  }

  return layout({
    site,
    pageTitle: site.title,
    description: site.description,
    canonical: `${siteUrl}/`,
    ogType: 'website',
    isHome: true,
    content: `
      <section class="hero" aria-labelledby="hero-title">
        <div class="hero-intro">
          <p class="hero-label">
            <span class="dot" aria-hidden="true"></span>
            وبلاگ
          </p>
          <h1 id="hero-title" class="hero-title">${escapeHtml(site.title)}</h1>
          <p class="hero-description">${escapeHtml(site.description)}</p>
          <div class="hero-actions">
            <a href="#posts" class="hero-button primary">خواندن نوشته‌ها</a>
            <a href="#about" class="hero-button secondary">درباره‌ی من</a>
          </div>
        </div>
        ${latestBlock ? `<aside class="feature-panel">${latestBlock}</aside>` : ''}
      </section>

      <section id="posts" aria-labelledby="posts-title">
        <div class="section-group">
          <h2 id="posts-title" class="section-title">آخرین نوشته‌ها</h2>
          <p class="section-note">${posts.length} نوشته</p>
        </div>

${postsSection}
      </section>

      <section id="about" aria-labelledby="about-title">
        <div class="about-block">
          <h2 id="about-title" class="section-title">درباره‌ی من</h2>
          <p class="about-text">
            به نرم‌افزارهای آزاد و توسعه‌ی پروژه‌های متن‌باز علاقه‌مندم.
            این وبلاگ، یادداشت‌هایی از مسیر یادگیری است.
          </p>
        </div>
      </section>`,
  });
}

function postTagsMarkup(posts) {
  const tagCounts = {};
  for (const post of posts) {
    for (const tag of post.tags) {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    }
  }
  const entries = Object.entries(tagCounts).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'fa'));
  if (!entries.length) return '';
  const items = entries.map(([tag]) => `<span class="cloud-tag">${escapeHtml(tag)}</span>`).join(' ');
  return `<div class="tag-cloud" aria-label="برچسب‌ها">${items}</div>`;
}

export function renderPost({ site, post, siteUrl, prev, next }) {
  const url = `${siteUrl}/posts/${post.slugUri}/`;
  const description = post.description || excerptFromHtml(post.html);
  const readingTime = Math.max(1, Math.round(post.html.length / 400));

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

  const prevLink = prev
    ? `<a class="nav-link nav-prev" href="/posts/${prev.slugUri}/"><span class="nav-dir">قبلی</span> ${escapeHtml(prev.title)}</a>`
    : '';
  const nextLink = next
    ? `<a class="nav-link nav-next" href="/posts/${next.slugUri}/"><span class="nav-dir">بعدی</span> ${escapeHtml(next.title)}</a>`
    : '';
  const paginationMarkup = prevLink || nextLink
    ? `<nav class="article-pagination" aria-label="نوشته قبلی و بعدی">
        <div class="pagination-inner">
          ${prevLink}
          ${nextLink}
        </div>
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
    content: `      <article class="post-page" aria-labelledby="post-title">
        <p class="back-link"><a href="/">← همه‌ی نوشته‌ها</a></p>

        <header class="article-header">
          <div class="article-kicker">
            <time class="article-date" datetime="${toIsoDate(post.date)}">${formatJalaliDate(post.date)}</time>
            <span class="article-reading">${readingTime} دقیقه</span>
          </div>
          <h1 id="post-title" class="article-title">${escapeHtml(post.title)}</h1>
          <p class="article-description">${description}</p>
          <ul class="post-tags" aria-label="برچسب‌های نوشته">${post.tags.map((tag) => `<li><span class="post-tag">#${escapeHtml(tag)}</span></li>`).join('')}</ul>
        </header>

        <div class="article-content">
${post.html}
        </div>

        ${paginationMarkup}
      </article>`,
  });
}

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
