#!/usr/bin/env node
/**
 * G4 设计令牌一致性校验：`src/styles/variables.css` 必须逐项命中 direction-a-plus 原型 :root 令牌。
 *
 * 依据：build-plan §3-D4「原型 :root 变量块整块移植，全站只此一处定义」。
 * 用法：node scripts/check-tokens.mjs   退出码 0 = 全量命中；1 = 存在缺失/偏差
 */
import fs from 'node:fs';
import process from 'node:process';

const PROTO = 'docs/design/prototypes/direction-a-plus/styles.css';
const VARS = 'src/styles/variables.css';

const proto = fs.readFileSync(PROTO, 'utf8');
const vars = fs.readFileSync(VARS, 'utf8');

const rootMatches = [...proto.matchAll(/:root\s*\{[\s\S]*?\n\}/g)].map((m) => m[0]);
if (rootMatches.length === 0) {
  console.error('[tokens] 原型未找到 :root 块：' + PROTO);
  process.exit(1);
}

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// 一个 :root 块可能声明在同一行（--a: x; --b: y;），故不锚定行首。
// 同名令牌跨块重复出现时按「任意一处命中即通过」判定（基础块 + 响应式升档块）。
const tokens = [];
for (const block of rootMatches) {
  for (const m of block.matchAll(/(--[A-Za-z0-9-]+)\s*:\s*([^;]+);/g)) {
    tokens.push({
      name: m[1].trim(),
      value: m[2].trim().replace(/\s+/g, ' '),
    });
  }
}

const missing = [];
for (const { name, value } of tokens) {
  const re = new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*:\\s*' + escapeRe(value) + '\\s*;');
  if (!re.test(vars)) missing.push({ name, value });
}

console.log(`[tokens] 原型 :root 令牌 ${tokens.length} 项；命中 ${tokens.length - missing.length}；缺失 ${missing.length}`);
console.log(`[tokens] 基准=${PROTO}  被校验=${VARS}`);

if (missing.length > 0) {
  console.error('\n[tokens] 缺失或不一致：');
  for (const { name, value } of missing) console.error(`  ${name} = ${value}`);
  process.exit(1);
}
console.log('[tokens] PASS 全部令牌与原型逐项一致');
