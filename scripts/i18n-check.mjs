#!/usr/bin/env node
/**
 * 双语字典完整性校验（docs/i18n/key-convention.md §5 实现）
 *
 * 校验规则：
 *  1. 键集合一致：递归比较 zh/en 同名文件键集合，差异即失败
 *  2. 命名合法：点键匹配 ^[a-z0-9_]+(\.[a-z0-9_]+){0,3}$，仅英文小写
 *  3. 无空值/占位：值为 ""、纯空白、待补充/TBD/TODO 即失败
 *  4. 变量一致：同一键双语值中的 {var} 集合一致
 *  5. slug 对齐：data/*.json 双语数组按 slug 集合比较（新增豁免需引用矩阵条目）
 *
 * 用法：node scripts/i18n-check.mjs
 */

import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const contentRoot = path.join(root, 'src', 'content');
const KEY_RE = /^[a-z0-9_]+(\.[a-z0-9_]+){0,3}$/;
const PLACEHOLDER_RE = /^\s*(?:待补充|待翻译|TBD|TODO|N\/A|n\/a)?\s*$/;
const VAR_RE = /\{([a-zA-Z0-9_]+)\}/g;

/** 将嵌套对象拍平为 Map<点键路径, 叶值>（数组元素以 [i] 标记） */
function flatten(value, prefix = '', out = new Map()) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => flatten(item, `${prefix}[${index}]`, out));
  } else if (value !== null && typeof value === 'object') {
    for (const [key, val] of Object.entries(value)) {
      flatten(val, prefix ? `${prefix}.${key}` : key, out);
    }
  } else {
    out.set(prefix, value);
  }
  return out;
}

/** 提取字符串中的 {var} 占位变量集合 */
function collectVars(value) {
  const vars = new Set();
  if (typeof value !== 'string') {
    return vars;
  }
  let match;
  VAR_RE.lastIndex = 0;
  while ((match = VAR_RE.exec(value)) !== null) {
    vars.add(match[1]);
  }
  return vars;
}

/** 递归列出目录下所有 .json 文件（绝对路径） */
function listJsonFiles(dir) {
  const result = [];
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return result;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      result.push(...listJsonFiles(full));
    } else if (entry.name.endsWith('.json')) {
      result.push(full);
    }
  }
  return result;
}

function relativePath(file, langDir) {
  return path.relative(langDir, file).replace(/\\/g, '/');
}

/** 校验 data/*.json 双语数组的 slug 对齐 */
function checkSlugAlignment(rel, zhData, enData, issues) {
  const slugsOf = (data) => (Array.isArray(data) ? data.filter((i) => i && typeof i.slug === 'string').map((i) => i.slug) : []);
  const zhSlugs = slugsOf(zhData);
  const enSlugs = slugsOf(enData);
  const missingInEn = zhSlugs.filter((s) => !enSlugs.includes(s));
  const missingInZh = enSlugs.filter((s) => !zhSlugs.includes(s));
  if (missingInEn.length) {
    issues.push(`[${rel}] en 缺少 slug: ${missingInEn.join(', ')}`);
  }
  if (missingInZh.length) {
    issues.push(`[${rel}] zh 缺少 slug: ${missingInZh.join(', ')}`);
  }
}

function checkEmptyValues(rel, data, issues) {
  for (const [key, value] of flatten(data)) {
    if (typeof value === 'string' && PLACEHOLDER_RE.test(value)) {
      issues.push(`[${rel}] 空值/占位: "${key}"`);
    }
  }
}

function main() {
  const issues = [];
  let checked = 0;

  const zhFiles = listJsonFiles(path.join(contentRoot, 'zh'));
  const enFiles = listJsonFiles(path.join(contentRoot, 'en'));
  const zhDir = path.join(contentRoot, 'zh');
  const enDir = path.join(contentRoot, 'en');
  const enRelSet = new Set(enFiles.map((f) => relativePath(f, enDir)));

  for (const file of zhFiles) {
    const rel = relativePath(file, zhDir);
    const enFile = path.join(contentRoot, 'en', rel);
    if (!enRelSet.has(rel)) {
      issues.push(`zh 存在而 en 缺失的文件: ${rel}`);
      continue;
    }

    let zhData;
    let enData;
    try {
      zhData = JSON.parse(readFileSync(file, 'utf8'));
      enData = JSON.parse(readFileSync(enFile, 'utf8'));
    } catch (err) {
      issues.push(`[${rel}] 读取/解析失败: ${err.message}`);
      continue;
    }
    checked += 1;

    // data/ 目录：只做 slug 对齐 + 空值检查（结构化实体，不走点键）
    if (rel.startsWith('data/')) {
      checkSlugAlignment(rel, zhData, enData, issues);
      checkEmptyValues(rel, zhData, issues);
      checkEmptyValues(rel, enData, issues);
      continue;
    }

    // 字典文件：键集合一致 + 命名合法 + 空值 + 变量一致
    const zhFlat = flatten(zhData);
    const enFlat = flatten(enData);
    const zhKeys = [...zhFlat.keys()];
    const enKeys = [...enFlat.keys()];

    const missingInEn = zhKeys.filter((k) => !enFlat.has(k));
    const missingInZh = enKeys.filter((k) => !zhFlat.has(k));
    if (missingInEn.length) {
      issues.push(`[${rel}] en 缺少键: ${missingInEn.join(', ')}`);
    }
    if (missingInZh.length) {
      issues.push(`[${rel}] zh 缺少键: ${missingInZh.join(', ')}`);
    }

    for (const key of zhKeys) {
      if (!KEY_RE.test(key)) {
        issues.push(`[${rel}] 键命名不合法: "${key}"（仅限 [a-z0-9_.]，最多 4 层）`);
      }
      const zhVal = zhFlat.get(key);
      const enVal = enFlat.get(key);
      if (typeof zhVal === 'string' && PLACEHOLDER_RE.test(zhVal)) {
        issues.push(`[${rel}] zh 空值/占位: "${key}"`);
      }
      if (typeof enVal === 'string' && PLACEHOLDER_RE.test(enVal)) {
        issues.push(`[${rel}] en 空值/占位: "${key}"`);
      }
      const zhVars = collectVars(zhVal);
      const enVars = collectVars(enVal);
      const onlyZh = [...zhVars].filter((v) => !enVars.has(v));
      const onlyEn = [...enVars].filter((v) => !zhVars.has(v));
      if (onlyZh.length || onlyEn.length) {
        issues.push(`[${rel}] "${key}" 变量不一致 zh{${[...zhVars]}} en{${[...enVars]}}`);
      }
    }
  }

  if (issues.length) {
    console.error(`\u2717 双语完整性校验失败（共 ${issues.length} 项）:`);
    for (const issue of issues) {
      console.error(`  - ${issue}`);
    }
    process.exit(1);
  }

  console.log(`\u2713 双语完整性校验通过（${checked} 个双语文件：键集合一致 / 命名合法 / 无空值 / 变量一致）`);
}

main();
