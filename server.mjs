/**
 * سرور ایستای صفر-وابستگی برای پیش‌نمایش محلی:
 * - سرو پوشه‌ی dist/ با URLهای تمیز (پشتیبانی از /posts/<slug>/)
 * - هدایت دایرکتوری‌های بدون اسلش پایانی (هم‌رفتار با Vercel)
 * - سرو dist/404.html با کد وضعیت 404
 *
 * حالت توسعه (node server.mjs --dev):
 * - پیش از شروع، یک‌بار build می‌گیرد
 * - روی posts/، src/ و public/ گوش می‌دهد و با هر تغییر دوباره build می‌گیرد
 * - با SSE مرورگر را خودکار تازه می‌کند (بدون هیچ وابستگی npm)
 */

import { createServer } from 'node:http';
import { stat, readFile } from 'node:fs/promises';
import { watch } from 'node:fs';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(ROOT, 'dist');
const IS_DEV = process.argv.includes('--dev');
const BASE_PORT = Number(process.env.PORT) || 3000;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.map': 'application/json; charset=utf-8',
};

function runBuild() {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [path.join(ROOT, 'build.mjs')], { stdio: 'inherit' });
    child.on('close', (code) => resolve(code === 0));
  });
}

/** تشخیص فایل برای یک مسیر URL؛ با پشتیبانی از index.html و مسیرهای تمیز. */
async function resolveTarget(rawPathname) {
  let pathname;
  try {
    pathname = decodeURIComponent(rawPathname);
  } catch {
    pathname = rawPathname;
  }
  if (pathname.includes('\0')) {
    return null;
  }

  const abs = path.normalize(path.join(DIST, pathname));
  if (abs !== DIST && !abs.startsWith(DIST + path.sep)) {
    return null;
  }

  // هم‌رفتار با trailingSlash: true روی Vercel
  if (!pathname.endsWith('/')) {
    try {
      const info = await stat(abs);
      if (info.isDirectory()) {
        return { redirect: `${pathname}/` };
      }
    } catch {
      // مسیر دایرکتوری نیست؛ در ادامه به‌عنوان فایل بررسی می‌شود.
    }
  }

  const candidates = pathname.endsWith('/')
    ? [path.join(abs, 'index.html')]
    : [abs, path.join(abs, 'index.html'), `${abs}.html`];

  for (const candidate of candidates) {
    try {
      const info = await stat(candidate);
      if (info.isFile()) {
        return { file: candidate };
      }
    } catch {
      // این گزینه وجود ندارد؛ گزینه‌ی بعدی.
    }
  }

  return null;
}

const clients = new Set();

function handleLiveReload(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-store',
    Connection: 'keep-alive',
  });
  res.write('retry: 1000\n\n');
  clients.add(res);
  req.on('close', () => clients.delete(res));
}

function broadcastReload() {
  for (const client of clients) {
    client.write('data: reload\n\n');
  }
}

const LIVE_RELOAD_SNIPPET = '<script>(function(){try{var s=new EventSource("/__lr");'
  + 's.onmessage=function(e){if(e.data==="reload"){location.reload()}};}catch(e){}})();</script>';

function injectLiveReload(html) {
  return html.replace(/<\/body>/i, (match) => `${LIVE_RELOAD_SNIPPET}${match}`);
}

async function sendNotFound(res) {
  try {
    const html = await readFile(path.join(DIST, '404.html'), 'utf8');
    res.writeHead(404, { 'Content-Type': MIME['.html'], 'Cache-Control': 'no-store' });
    res.end(IS_DEV ? injectLiveReload(html) : html);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('404 Not Found');
  }
}

const server = createServer(async (req, res) => {
  try {
    const { pathname } = new URL(req.url, 'http://localhost');

    if (IS_DEV && pathname === '/__lr') {
      handleLiveReload(req, res);
      return;
    }

    const target = await resolveTarget(pathname);

    if (target && target.redirect) {
      res.writeHead(308, { Location: encodeURI(target.redirect) });
      res.end();
      return;
    }

    if (!target) {
      await sendNotFound(res);
      return;
    }

    const ext = path.extname(target.file).toLowerCase();
    const data = await readFile(target.file);
    const headers = { 'Content-Type': MIME[ext] || 'application/octet-stream' };
    if (IS_DEV && ext === '.html') {
      headers['Cache-Control'] = 'no-store';
    }
    res.writeHead(200, headers);
    if (IS_DEV && ext === '.html') {
      res.end(injectLiveReload(data.toString('utf8')));
    } else {
      res.end(data);
    }
  } catch {
    await sendNotFound(res);
  }
});

function listenOn(port, attemptsLeft = 10) {
  return new Promise((resolve, reject) => {
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE' && attemptsLeft > 0) {
        resolve(listenOn(port + 1, attemptsLeft - 1));
      } else {
        reject(err);
      }
    });
    server.listen(port, () => resolve(port));
  });
}

let rebuildTimer = null;

function scheduleRebuild() {
  clearTimeout(rebuildTimer);
  rebuildTimer = setTimeout(async () => {
    console.log('↺ تغییر شنیده شد؛ بازساخت…');
    const ok = await runBuild();
    if (ok) {
      console.log('✓ بازساخت کامل شد؛ مرورگر تازه می‌شود.');
      broadcastReload();
    } else {
      console.error('✖ بازساخت ناموفق بود؛ خطای بالا را برطرف کنید.');
    }
  }, 180);
}

function startWatching() {
  const dirs = [
    'posts',
    'src',
    'src/lib',
    'public',
    'public/css',
    'public/js',
    'public/images',
  ].map((dir) => path.join(ROOT, dir));

  for (const dir of dirs) {
    try {
      watch(dir, { persistent: false }, () => scheduleRebuild());
    } catch (err) {
      if (err.code !== 'ENOENT') {
        throw err;
      }
    }
  }
}

async function start() {
  if (IS_DEV) {
    console.log('▸ ساخت اولیه…');
    const ok = await runBuild();
    if (!ok) {
      console.error('✖ ساخت اولیه ناموفق بود؛ سرور بدون خروجی کامل شروع نمی‌شود.');
      process.exit(1);
    }
    startWatching();
  } else {
    try {
      await stat(path.join(DIST, 'index.html'));
    } catch {
      console.error('خروجی «dist/» پیدا نشد. ابتدا «npm run build» را اجرا کنید.');
      process.exit(1);
    }
  }

  const port = await listenOn(BASE_PORT);
  console.log(`▸ پیش‌نمایش روی http://localhost:${port}/ ${IS_DEV ? '(حالت توسعه: بازساخت خودکار فعال است)' : ''}`);
}

start().catch((err) => {
  console.error(`✖ راه‌اندازی سرور ناموفق بود: ${err.message}`);
  process.exit(1);
});
