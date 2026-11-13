import { mkdir, rm, readdir, readFile, writeFile, cp } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import { renderMarkdown } from './src/lib/markdown.mjs';
import { renderHome, renderPost, renderNotFound } from './src/layout.mjs';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const POSTS_DIR = path.join(ROOT, 'posts');
const PUBLIC_DIR = path.join(ROOT, 'public');
const DIST_DIR = path.join(ROOT, 'dist');

function resolveSiteUrl() {
  const raw = process.env.SITE_URL
    || (process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`)
    || (process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`)
    || 'http://localhost:3000';
  return raw.replace(/\/+$/, '');
}

function validateSlug(slug, file) {
  if (!slug || slug === '.' || slug === '..' || /[\\/:*?"<>|\s]/.test(slug)) {
    throw new Error(
      `«${file}» نامک نامعتبر دارد: «${slug}». `
      + 'نامک فقط می‌تواند حروف، رقم و خط تیره باشد (یا از نام فایل استفاده کنید).',
    );
  }
}

async function loadPosts() {
  let files;
  try {
    files = await readdir(POSTS_DIR);
  } catch {
    throw new Error('پوشه‌ی «posts/» پیدا نشد.');
  }

  const mdFiles = files.filter((f) => f.toLowerCase().endsWith('.md')).sort();
  const posts = [];

  for (const file of mdFiles) {
    const raw = await readFile(path.join(POSTS_DIR, file), 'utf8');

    let data;
    let content;
    try {
      ({ data, content } = matter(raw));
    } catch (err) {
      throw new Error(`خطا در خواندن frontmatter «${file}»: ${err.message}`);
    }

    if (data.draft === true) {
      continue;
    }

    const title = typeof data.title === 'string' ? data.title.trim() : '';
    if (!title) {
      throw new Error(`«${file}» فاقد «title» معتبر در frontmatter است.`);
    }

    const date = data.date instanceof Date ? data.date : (data.date ? new Date(data.date) : null);
    if (!date || Number.isNaN(date.getTime())) {
      throw new Error(`«${file}» فاقد «date» معتبر است (نمونه‌ی درست: 2026-10-05).`);
    }

    const description = typeof data.description === 'string' ? data.description.trim() : '';
    const tags = Array.isArray(data.tags)
      ? data.tags.map(String)
      : (data.tags == null ? [] : [String(data.tags)]);

    const slug = typeof data.slug === 'string' && data.slug.trim() ? data.slug.trim() : file.replace(/\.md$/i, '');
    validateSlug(slug, file);

    posts.push({
      slug,
      slugUri: encodeURIComponent(slug),
      title,
      date,
      description,
      tags,
      html: renderMarkdown(content),
    });
  }

  posts.sort((a, b) => b.date.getTime() - a.date.getTime() || a.title.localeCompare(b.title, 'fa'));
  return posts;
}

function buildSitemap(siteUrl, posts) {
  const latest = posts[0] ? posts[0].date : null;
  const urls = [
    { loc: `${siteUrl}/`, lastmod: latest },
    ...posts.map((post) => ({ loc: `${siteUrl}/posts/${post.slugUri}/`, lastmod: post.date })),
  ];

  const entries = urls.map(({ loc, lastmod }) => `  <url>
    <loc>${loc}</loc>${lastmod ? `\n    <lastmod>${lastmod.toISOString()}</lastmod>` : ''}
  </url>`).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>
`;
}

function buildRobots(siteUrl) {
  return `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`;
}

async function build() {
  const siteConfig = JSON.parse(await readFile(path.join(ROOT, 'site.config.json'), 'utf8'));
  const siteUrl = resolveSiteUrl();
  const site = { ...siteConfig, url: siteUrl };
  const posts = await loadPosts();

  await rm(DIST_DIR, { recursive: true, force: true });
  await cp(PUBLIC_DIR, DIST_DIR, { recursive: true });
  await mkdir(path.join(DIST_DIR, 'posts'), { recursive: true });

  for (let i = 0; i < posts.length; i += 1) {
    const post = posts[i];
    const postDir = path.join(DIST_DIR, 'posts', post.slug);
    await mkdir(postDir, { recursive: true });
    await writeFile(
      path.join(postDir, 'index.html'),
      renderPost({ site, post, siteUrl, prev: posts[i + 1], next: posts[i - 1] }),
      'utf8',
    );
  }

  await writeFile(path.join(DIST_DIR, 'index.html'), renderHome({ site, posts, siteUrl }), 'utf8');
  await writeFile(path.join(DIST_DIR, '404.html'), renderNotFound({ site }), 'utf8');
  await writeFile(path.join(DIST_DIR, 'sitemap.xml'), buildSitemap(siteUrl, posts), 'utf8');
  await writeFile(path.join(DIST_DIR, 'robots.txt'), buildRobots(siteUrl), 'utf8');

  console.log(`✔ ساخته شد: ${posts.length} نوشته — خروجی در «dist/»`);
  if (siteUrl.startsWith('http://localhost')) {
    console.log('ℹ برای sitemap و نشانی canonical می‌توانید SITE_URL را تنظیم کنید (روی Vercel خودکار است).');
  }
}

try {
  await build();
} catch (err) {
  console.error(`✖ خطا در ساخت: ${err.message}`);
  process.exit(1);
}
