#!/usr/bin/env node
/**
 * 直引可达性冒烟（build-plan §6 B1 / 风险 R1）
 *
 * 对 asset-inventory.json 抽样 20+ 条素材 URL 发真实 HTTP 请求，验证
 * 「原站防盗链不拦截浏览器跨域直引」这一显式假设。命中防盗链立即阻塞上报，
 * 禁止静默占位（REDLINES v2）。
 *
 * 探测方式：GET + Range: bytes=0-131071（大二进制只取前 128KB，判定不依赖整文件）。
 * 可达判据：2xx/206 + content-type 为媒体类型（非 HTML 拦截页）+ 实际取到字节。
 *
 * 用法：node scripts/smoke-assets.mjs [--n 24] [--no-referer]
 * 输出：控制台逐条结果 + 汇总；退出码 0=全可达，1=存在不可达/被拦截
 */

import { readFileSync, writeFileSync } from 'node:fs';
import process from 'node:process';

// 报告同时落盘为 UTF-8（避免 PowerShell 重定向按系统码页写入导致中文乱码，证据文件须可直接阅读）
const REPORT = new URL('../docs/acceptance/smoke-assets-with-referer.txt', import.meta.url);
const __buffer = [];
const __write = process.stdout.write.bind(process.stdout);
process.stdout.write = (chunk, ...rest) => {
  __buffer.push(String(chunk));
  return __write(chunk, ...rest);
};
process.on('exit', () => writeFileSync(REPORT, __buffer.join(''), 'utf8'));

const ORIGIN = 'https://www.thbiomedic.com';
const REFERER = ORIGIN + '/zn/index.html';
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

const args = process.argv.slice(2);
const N = Number((args.find((a) => a.startsWith('--n=')) ?? '--n=24').split('=')[1]);
const withReferer = !args.includes('--no-referer');

const inv = JSON.parse(readFileSync(new URL('../docs/assets/asset-inventory.json', import.meta.url), 'utf8'));

/** 分层抽样：每类抽配额，覆盖带查询串与不带查询串两种 URL 形态 */
function sample() {
  const take = (arr, quota, preferQuery) => {
    if (arr.length <= quota) return arr;
    const hit = arr.filter((e) => preferQuery === !!e.url.includes('?'));
    const rest = arr.filter((e) => preferQuery !== !!e.url.includes('?'));
    return [...hit, ...rest].slice(0, quota);
  };
  const picked = [
    ...take(inv.images.slice(0, 60), 8, true),
    ...take(inv.images.slice(60, 150), 6, false),
    ...take(inv.images.slice(150), 6, true),
    ...take(inv.videos, 8, false),
    ...inv.files,
  ];
  return [...new Set(picked)].slice(0, N);
}

async function probe(url) {
  const started = Date.now();
  try {
    const res = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        'User-Agent': UA,
        Range: 'bytes=0-131071',
        ...(withReferer ? { Referer: REFERER } : {}),
      },
      signal: AbortSignal.timeout(25_000),
    });
    const ms = Date.now() - started;
    const ct = (res.headers.get('content-type') ?? '').toLowerCase();
    const body = await res.arrayBuffer();

    const okStatus = res.status === 200 || res.status === 206;
    const media =
      ct.startsWith('image/') ||
      ct.startsWith('video/') ||
      ct.includes('pdf') ||
      ct === 'application/octet-stream';
    const verdict = okStatus && media && body.byteLength > 0 ? 'OK' : 'FAIL';

    return {
      url,
      status: res.status,
      ms,
      verdict,
      note:
        verdict === 'OK'
          ? `ct=${ct.split(';')[0]} body=${body.byteLength}B`
          : `ct=${ct || '(none)'} body=${body.byteLength}B`,
    };
  } catch (err) {
    return { url, status: 0, ms: Date.now() - started, verdict: 'FAIL', note: err.message };
  }
}

const picked = sample();
const results = [];
for (const [i, item] of picked.entries()) {
  const r = await probe(item.url);
  results.push(r);
  const mark = r.verdict === 'OK' ? '[ OK ]' : '[FAIL]';
  console.log(
    `${mark} ${String(i + 1).padStart(2, ' ')} ${String(r.status).padStart(3)} ${String(r.ms).padStart(5)}ms ` +
      r.note.padEnd(38) + item.url.replace(ORIGIN, '')
  );
}

const ok = results.filter((r) => r.verdict === 'OK');
const bad = results.filter((r) => r.verdict === 'FAIL');
console.log('');
console.log(
  `直引可达性冒烟：${results.length} 条抽样，${ok.length} 可达 / ${bad.length} 不可达` +
    `（Referer=${withReferer ? REFERER : '无'}）`
);

if (bad.length) {
  console.log('');
  console.log('=== 阻塞上报：以下 URL 直引不可达（REDLINES v2，禁止静默占位）===');
  for (const r of bad) console.log(`  ${r.status} ${r.url}  ${r.note}`);
  process.exit(1);
}
process.exit(0);
