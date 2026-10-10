#!/usr/bin/env node
/**
 * 门禁 G3：素材处理（check-assets.mjs）
 * 依据：PROJECT_STANDARDS §5.3、build-plan §7 补充口径、ADR-003 §2/§5.2
 *
 * 三项检查：
 * 1. 产物占位标记残留扫描（排除合法 placeholder= 属性）
 * 2. 产物素材 URL 是否全部命中 src/utils/assets.ts 映射表（禁止硬编码完整 URL）
 * 3. 数据层引用的素材 key 全部命中 assets.ts（防止 key 漂移产生 404）
 */

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const dist = `${root}/dist`;
const failures = [];
const failuresPush = (msg) => failures.push(msg);

/* 收集 assets.ts 中声明的素材 key */
function assetKeys() {
  const src = readFileSync(`${root}/src/utils/assets.ts`, 'utf8');
  const block = src.slice(src.indexOf('ASSET_PATHS'), src.indexOf('/** 素材 key 集合'));
  return new Set([...block.matchAll(/^\s*'([^']+)':/gm)].map((m) => m[1]));
}

function* walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = `${dir}/${entry.name}`;
    if (entry.isDirectory()) yield* walk(p);
    else if (entry.name.endsWith('.html')) yield p;
  }
}

const keys = assetKeys();

/* 1. 产物占位标记 */
const PLACEHOLDER_RE = /lorem|待补|占位|pending-asset|TODO:|FIXME|待迁移/g;
let placeholderCount = 0;
if (!existsSync(dist)) {
  failuresPush('dist/ 不存在，先运行 npm run build');
} else {
  for (const file of walk(dist)) {
    const html = readFileSync(file, 'utf8');
    // 排除合法 HTML 的 placeholder="..." 属性
    const cleaned = html.replace(/placeholder="[^"]*"/g, '');
    const m = cleaned.match(PLACEHOLDER_RE);
    if (m) {
      placeholderCount += m.length;
      failuresPush(`占位标记残留: ${file.replace(root, '')} → ${m.join(', ')}`);
    }
  }
}
console.log(`占位标记残留: ${placeholderCount}`);

/* 2. 产物素材 URL 全命中映射表 */
const ORIGIN = 'https://www.thbiomedic.com';
const assetUrlSet = new Set();
for (const k of keys) {
  // 从 assets.ts 源码直接提取每个 key 的完整 URL 路径
  const m = readFileSync(`${root}/src/utils/assets.ts`, 'utf8').match(new RegExp(`'${k}':\\s*'([^']+)'`));
  if (m) assetUrlSet.add(ORIGIN + (m[1].startsWith('/') ? m[1] : '/' + m[1]));
}

let distUrlCount = 0;
let missCount = 0;
const missingUrls = [];
if (existsSync(dist)) {
  const URL_RE = /https:\/\/www\.thbiomedic\.com\/uploadfiles\/[^\s"'>]+/g;
  for (const file of walk(dist)) {
    const html = readFileSync(file, 'utf8');
    const urls = html.match(URL_RE);
    if (urls) {
      for (const u of urls) {
        distUrlCount++;
        if (!assetUrlSet.has(u)) { missCount++; missingUrls.push(u); }
      }
    }
  }
}
console.log(`映射表 URL 数=${assetUrlSet.size}  产物引用唯一数=${distUrlCount}  未命中=${missCount}`);
for (const u of [...new Set(missingUrls)]) failuresPush(`产物引用未命中 assets.ts: ${u}`);

/* 3. 数据层 key 全部命中 assets.ts */
const dataDirs = ['zh', 'en'];
for (const lang of dataDirs) {
  const dir = `${root}/src/content/${lang}/data`;
  const files = readdirSync(dir).filter((f) => f.endsWith('.json'));
  for (const f of files) {
    const data = JSON.parse(readFileSync(`${dir}/${f}`, 'utf8'));
    const texts = JSON.stringify(data);
    const used = new Set([...texts.matchAll(/"(img|vid|dl)-[a-z0-9]+"/g)].map((m) => m[0].replace(/"/g, '')));
    for (const k of used) {
      if (!keys.has(k)) failuresPush(`[${lang}] ${f} 引用未命中素材 key: ${k}`);
    }
  }
}

if (failures.length > 0) {
  console.error(`\n✗ check-assets 失败（${failures.length} 项）:`);
  for (const f of failures) console.error('  - ' + f);
  process.exit(1);
}
console.log('✓ check-assets 通过：无占位标记、素材引用全命中 assets.ts、数据 key 无漂移');