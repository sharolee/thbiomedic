/**
 * 上线检查可视化冒烟（SHAR-58）
 * 用法：node scripts/audit-visual.mjs [baseUrl]
 * 输出：控制台错误 / 页面异常 / 失败请求 / 破图 统计 + 截图到 docs/audit/screenshots/
 *
 * 说明：原站 mp4 直链体积大（单文件最大 31MB），浏览器内统一 abort（可达性由
 * scripts/audit 的 curl 冒烟单独覆盖），其余资源按真实网络加载。
 */
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const BASE = process.argv[2] ?? 'http://localhost:4321';
const OUT = 'docs/audit/screenshots';
mkdirSync(OUT, { recursive: true });

const PAGES = [
  ['home-zh', '/zh/'],
  ['home-en', '/en/'],
  ['about-zh', '/zh/about/'],
  ['about-en', '/en/about/'],
  ['products-zh', '/zh/products/'],
  ['products-en', '/en/products/'],
  ['products-category-zh', '/zh/products/easy-lock/'],
  ['products-category-en', '/en/products/easy-lock/'],
  ['products-empty-zh', '/zh/products/high-temp-thermoplastics/'],
  ['product-detail-zh', '/zh/products/easy-lock/ankle-splint/'],
  ['product-detail-en', '/en/products/easy-lock/ankle-splint/'],
  ['downloads-zh', '/zh/resources/downloads/'],
  ['downloads-en', '/en/resources/downloads/'],
  ['videos-zh', '/zh/resources/videos/'],
  ['videos-en', '/en/resources/videos/'],
  ['videos-cat-zh', '/zh/resources/videos/pet-rehabilitation/'],
  ['news-zh', '/zh/news/'],
  ['news-en', '/en/news/'],
  ['contact-zh', '/zh/contact/'],
  ['contact-en', '/en/contact/'],
  ['search-zh', '/zh/search/'],
  ['search-en', '/en/search/'],
  ['notfound-zh', '/zh/does-not-exist/'],
];

const CORE = [
  ['home-zh', '/zh/'],
  ['home-en', '/en/'],
  ['about-zh', '/zh/about/'],
  ['products-zh', '/zh/products/'],
  ['product-detail-zh', '/zh/products/easy-lock/ankle-splint/'],
  ['downloads-zh', '/zh/resources/downloads/'],
  ['videos-zh', '/zh/resources/videos/'],
  ['news-zh', '/zh/news/'],
  ['contact-zh', '/zh/contact/'],
  ['notfound-zh', '/zh/does-not-exist/'],
];

const VIEWPORTS = [
  ['desktop', { width: 1440, height: 900 }],
  ['mobile', { width: 390, height: 844 }],
];

const report = [];

const browser = await chromium.launch({ channel: 'chrome' });

for (const [vpName, viewport] of VIEWPORTS) {
  const ctx = await browser.newContext({
    viewport,
    deviceScaleFactor: 1,
    locale: vpName === 'desktop' ? 'zh-CN' : 'zh-CN',
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36',
  });
  await ctx.route('**/*.mp4', (r) => r.abort());

  for (const [name, path] of (process.argv[3] === 'core' ? CORE : PAGES)) {
    const url = BASE + path;
    const page = await ctx.newPage();
    const consoleErrors = [];
    const pageErrors = [];
    const failed = [];
    let status = 0;

    page.on('console', (m) => {
      if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 300));
    });
    page.on('pageerror', (e) => pageErrors.push(String(e).slice(0, 300)));
    page.on('response', (r) => {
      if (r.status() >= 400) failed.push(`${r.status()} ${r.url().slice(0, 160)}`);
    });
    page.on('requestfailed', (r) => {
      const u = r.url();
      if (!u.endsWith('.mp4')) failed.push(`FAILED ${u.slice(0, 160)} ${r.failure()?.errorText ?? ''}`);
    });

    try {
      const resp = await page.goto(url, { waitUntil: 'load', timeout: 45000 });
      status = resp?.status() ?? 0;
    } catch (e) {
      pageErrors.push('goto: ' + String(e).split('\n')[0]);
    }
    await page.waitForTimeout(1200);
    // 触发懒加载
    await page.evaluate(async () => {
      await new Promise((res) => {
        let y = 0;
        const step = () => {
          y += 600;
          window.scrollTo(0, y);
          if (y < document.body.scrollHeight) setTimeout(step, 60);
          else res();
        };
        step();
      });
    });
    await page.waitForTimeout(2500);

    const brokenImgs = await page.evaluate(() =>
      Array.from(document.images)
        .filter((i) => i.complete && i.naturalWidth === 0)
        .map((i) => i.currentSrc || i.src)
        .slice(0, 10)
    );
    const imgCount = await page.evaluate(() => document.images.length);
    const noAlt = await page.evaluate(
      () => Array.from(document.images).filter((i) => !i.hasAttribute('alt')).length
    );
    const hOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );

    const file = `${name}-${vpName}.png`;
    await page.screenshot({ path: join(OUT, file), fullPage: false });
    await page.close();

    report.push({
      page: path,
      viewport: vpName,
      status,
      consoleErrors,
      pageErrors,
      failed: failed.slice(0, 10),
      failedCount: failed.length,
      imgCount,
      brokenImgs,
      noAlt,
      hOverflow,
      shot: file,
    });
    console.log(
      `[${vpName}] ${path} status=${status} consoleErr=${consoleErrors.length} pageErr=${pageErrors.length} failed=${failed.length} imgs=${imgCount} broken=${brokenImgs.length} noAlt=${noAlt} overflow=${hOverflow}`
    );
  }
  await ctx.close();
}

await browser.close();
writeFileSync(
  'docs/audit/visual-smoke.json',
  JSON.stringify(report, null, 2),
  'utf8'
);
console.log('report -> docs/audit/visual-smoke.json');
