#!/usr/bin/env node
/**
 * 生成 sitemap.xml（postbuild）
 * 遍历 dist/ 下所有 .html，排除 404.html 和根路径重定向页，
 * 生成 https://www.thbiomedic.com/ 前缀的 sitemap。
 * 挂入 package.json postbuild。
 */

import { readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const BASE = 'https://www.thbiomedic.com';
const DIST = fileURLToPath(new URL('../dist', import.meta.url));

/** 递归收集所有 .html 文件 */
function* walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walk(path);
    } else if (entry.name.endsWith('.html')) {
      yield path;
    }
  }
}

const urls = [];
for (const path of walk(DIST)) {
  const rel = relative(DIST, path).replace(/\\/g, '/');
  if (rel === '404.html') continue;
  if (rel === 'index.html') {
    // 根路径重定向页：/ → /en/（x-default），不单独索引
    continue;
  }
  const urlPath = '/' + rel.replace(/\/index\.html$/, '/');
  const stat = statSync(path);
  urls.push({ loc: `${BASE}${urlPath}`, lastmod: stat.mtime.toISOString() });
}

// 按路径排序，保证确定性
urls.sort((a, b) => a.loc.localeCompare(b.loc));

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>`).join('\n')}
</urlset>`;

writeFileSync(join(DIST, 'sitemap.xml'), xml, 'utf8');
console.log(`[sitemap] ${urls.length} URLs → dist/sitemap.xml`);
