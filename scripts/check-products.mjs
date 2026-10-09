#!/usr/bin/env node
/* ==========================================================================
   产品域数据/页面核对（check-products.mjs）
   依据：docs/plan/build-plan.md §5 页面覆盖清单 + §6 B2 完成标志、
        docs/content-inventory.md §3.2 / §3.3 / §4.1
   核对口径：10 一级分类、17 二级分类（15 空态 + 2 有产品）、12 产品详情，
            中英同键镜像，素材 key 全部命中 assets.ts 映射表。
   ========================================================================== */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const read = (rel) => JSON.parse(readFileSync(`${root}/src/${rel}`, 'utf8'));

const EXPECTED = { firstLevel: 10, secondLevel: 17, products: 12, emptySecond: 15 };
const LANGS = ['zh', 'en'];

/** 收集 assets.ts 中声明的素材 key（只取 key，不解析 URL） */
function assetKeys() {
  const src = readFileSync(`${root}/src/utils/assets.ts`, 'utf8');
  const block = src.slice(src.indexOf('ASSET_PATHS'), src.indexOf('/** 素材 key 集合'));
  return new Set([...block.matchAll(/^\s*'([^']+)':/gm)].map((m) => m[1]));
}

const failures = [];
const failuresPush = (msg) => failures.push(msg);

const keys = assetKeys();
const data = {};

for (const lang of LANGS) {
  data[lang] = {
    categories: read(`content/${lang}/data/categories.json`),
    products: read(`content/${lang}/data/products.json`),
  };
}

// ── 条目数（对照 content-inventory §3.2 / §3.3 / §4.1）──────────────────
for (const lang of LANGS) {
  const { categories, products } = data[lang];
  const secondTotal = categories.reduce((n, c) => n + (c.children?.length ?? 0), 0);
  const withProducts = new Set(products.map((p) => p.categorySlug));

  const rows = [
    ['一级分类', categories.length, EXPECTED.firstLevel],
    ['二级分类', secondTotal, EXPECTED.secondLevel],
    ['产品详情', products.length, EXPECTED.products],
    ['二级空态', secondTotal - withProducts.size, EXPECTED.emptySecond],
  ];
  for (const [label, actual, expected] of rows) {
    if (actual !== expected) failuresPush(`[${lang}] ${label} 条目数 ${actual} ≠ 盘点 ${expected}`);
  }
  console.log(`[${lang}] 一级=${categories.length} 二级=${secondTotal} 详情=${products.length} 二级空态=${secondTotal - withProducts.size}`);

  // ── 分类结构 ────────────────────────────────────────────────────────
  const firstSlugs = new Set(categories.map((c) => c.slug));
  const secondSlugs = new Map();
  for (const cat of categories) {
    for (const child of cat.children ?? []) {
      if (secondSlugs.has(child.slug)) failuresPush(`[${lang}] 二级 slug 重复: ${child.slug}`);
      secondSlugs.set(child.slug, cat.slug);
      // hasProducts 标记必须与实际产品归属一致（G2 空态口径）
      const real = products.some((p) => p.categorySlug === child.slug);
      if (Boolean(child.hasProducts) !== real) {
        failuresPush(`[${lang}] 二级 ${child.slug} hasProducts=${child.hasProducts} 与实际产品归属(${real})不符`);
      }
    }
  }
  for (const slug of secondSlugs.keys()) {
    if (firstSlugs.has(slug)) failuresPush(`[${lang}] 一/二级 slug 冲突: ${slug}`);
  }

  // ── 产品归属与素材 key ──────────────────────────────────────────────
  for (const p of products) {
    if (!secondSlugs.has(p.categorySlug)) failuresPush(`[${lang}] 产品 ${p.slug} 归属未知二级分类: ${p.categorySlug}`);
    if (!p.name || !p.desc) failuresPush(`[${lang}] 产品 ${p.slug} 缺 name/desc`);
    for (const img of p.images ?? []) {
      if (!keys.has(img.key)) failuresPush(`[${lang}] 产品 ${p.slug} 素材 key 未命中映射表: ${img.key}`);
      if (!img.alt) failuresPush(`[${lang}] 产品 ${p.slug} 素材缺 alt: ${img.key}`);
    }
  }
  console.log(`[${lang}] 素材 key 全部命中 assets.ts: ${products.every((p) => (p.images ?? []).every((i) => keys.has(i.key)))}`);
}

// ── 中英同键镜像（ADR-002：键集合一致）────────────────────────────────
const keysOf = (lang) => ({
  first: data[lang].categories.map((c) => c.slug).sort().join('|'),
  second: data[lang].categories.flatMap((c) => (c.children ?? []).map((c) => c.slug)).sort().join('|'),
  product: data[lang].products.map((p) => p.slug).sort().join('|'),
  // 只核对条数，不核对 key：中英产品实拍图为不同语言版本的文件
  // （同 ADR-002 例外口径：Certificate.image / Download.file 中英可不同），
  // key 存在性已在上方逐项校验
  imageCount: data[lang].products.map((p) => `${p.slug}=[${(p.images ?? []).length}]=`).join('|'),
});
const kz = keysOf('zh');
const ke = keysOf('en');
for (const [field, a, b] of [
  ['一级 slug', kz.first, ke.first],
  ['二级 slug', kz.second, ke.second],
  ['产品 slug', kz.product, ke.product],
  ['产品素材条数', kz.imageCount, ke.imageCount],
]) {
  if (a !== b) failuresPush(`中英镜像不一致（${field}）:\n  zh=${a}\n  en=${b}`);
}

// ── 结论 ────────────────────────────────────────────────────────────────
console.log(`\n素材映射表 key 总数: ${keys.size}`);
if (failures.length > 0) {
  console.error(`\n✗ check-products 失败（${failures.length} 项）:`);
  for (const f of failures) console.error('  - ' + f);
  process.exit(1);
}
console.log('\n✓ check-products 通过：条目数对齐盘点，中英同键镜像，素材 key 全命中');
