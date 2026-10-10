#!/usr/bin/env node
/**
 * 门禁 G1：页面覆盖度（check-pages.mjs）
 * 依据：PROJECT_STANDARDS §5.1、build-plan §5 页面覆盖清单
 * 核对 dist/ 中每个语言的语义页面数与方案一致（50/语言）。
 * 分类路由 `products/[category]/` 同时承载一/二级，一/二级 slug 由 data 判定。
 */

import { readdirSync, existsSync, statSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const dist = `${root}/dist`;
const isDir = (p) => existsSync(p) && statSync(p).isDirectory();
const read = (rel) => JSON.parse(readFileSync(`${root}/src/${rel}`, 'utf8'));

const SEMANTIC_TOTAL = 50; // per language（含 404）
const failures = [];
const failuresPush = (msg) => failures.push(msg);

if (!isDir(dist)) failuresPush('dist/ 不存在，先运行 npm run build');

let grandTotal = 0;

for (const lang of ['zh', 'en']) {
  const base = `${dist}/${lang}`;
  if (!isDir(base)) { failuresPush(`[${lang}] ${base} 不存在`); continue; }

  // 一/二级 slug 集合（数据层为唯一事实源）
  const cats = read(`content/${lang}/data/categories.json`);
  const firstSlugs = new Set(cats.map((c) => c.slug));
  const secondSlugs = new Set();
  for (const c of cats) for (const child of c.children ?? []) secondSlugs.add(child.slug);
  const products = read(`content/${lang}/data/products.json`);

  // 单页（首页/关于/资源/新闻/联系/搜索）
  const singles = [
    ['首页', `${base}/index.html`],
    ['关于', `${base}/about/index.html`],
    ['产品中心导航', `${base}/products/index.html`],
    ['资源下载', `${base}/resources/downloads/index.html`],
    ['资源视频列表', `${base}/resources/videos/index.html`],
    ['新闻', `${base}/news/index.html`],
    ['联系我们', `${base}/contact/index.html`],
    ['搜索', `${base}/search/index.html`],
  ];
  let singlesOk = 0;
  for (const [label, path] of singles) {
    if (!existsSync(path)) failuresPush(`[${lang}] ${label} 页缺失: ${path.replace(root, '')}`);
    else singlesOk++;
  }

  // 分类目录（一/二级 slug 并集）
  const productsDir = `${base}/products`;
  const slugs = isDir(productsDir) ? readdirSync(productsDir).filter((e) => isDir(`${productsDir}/${e}`)) : [];
  let firstLevel = 0;
  let secondLevel = 0;
  for (const slug of slugs) {
    if (firstSlugs.has(slug)) {
      if (!existsSync(`${productsDir}/${slug}/index.html`)) failuresPush(`[${lang}] 一级分类页缺失: products/${slug}/`);
      else firstLevel++;
    } else if (secondSlugs.has(slug)) {
      if (!existsSync(`${productsDir}/${slug}/index.html`)) failuresPush(`[${lang}] 二级列表页缺失: products/${slug}/`);
      else secondLevel++;
    } else {
      failuresPush(`[${lang}] 未知分类目录（数据层无此 slug）: products/${slug}/`);
    }
  }

  // 详情页：遍历数据层产品的 (categorySlug, productSlug)
  let details = 0;
  for (const p of products) {
    const page = `${productsDir}/${p.categorySlug}/${p.slug}/index.html`;
    if (!existsSync(page)) failuresPush(`[${lang}] 详情页缺失: ${page.replace(root, '')}`);
    else details++;
  }

  // 视频分类
  const vcatDir = `${base}/resources/videos`;
  const videoCats = isDir(vcatDir) ? readdirSync(vcatDir).filter((e) => isDir(`${vcatDir}/${e}`)) : [];

  const counts = [
    ['产品一级分类', firstLevel, 10],
    ['产品二级列表', secondLevel, 17],
    ['产品详情', details, 12],
    ['视频分类', videoCats.length, 3],
    ['单页面', singlesOk, 8],
  ];
  const langTotal = firstLevel + secondLevel + details + videoCats.length + singlesOk;
  console.log(`[${lang}] 一级=${firstLevel} 二级=${secondLevel} 详情=${details} 视频分类=${videoCats.length} 单页面=${singlesOk} 小计=${langTotal}`);
  for (const [label, actual, expected] of counts) {
    if (actual !== expected) failuresPush(`[${lang}] ${label} ${actual} ≠ 方案 ${expected}`);
  }
  if (langTotal !== SEMANTIC_TOTAL) failuresPush(`[${lang}] 语义页面 ${langTotal} ≠ 方案 ${SEMANTIC_TOTAL}`);
  grandTotal += langTotal;

  if (lang === 'zh') {
    if (!existsSync(`${dist}/404.html`)) failuresPush('404 页缺失: dist/404.html');
    if (!existsSync(`${dist}/index.html`)) failuresPush('根重定向页缺失: dist/index.html');
  }
}

console.log(`\n语义页面合计（zh+en）: ${grandTotal}（方案 ${SEMANTIC_TOTAL * 2}）`);

if (failures.length > 0) {
  console.error(`\n✗ check-pages 失败（${failures.length} 项）:`);
  for (const f of failures) console.error('  - ' + f);
  process.exit(1);
}
console.log('✓ check-pages 通过：页面覆盖度对齐 build-plan §5（50/语言）');
