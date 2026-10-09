#!/usr/bin/env node
/**
 * 防盗链 Referer 判定矩阵（build-plan 风险 R1 深度探测）
 *
 * smoke-assets.mjs 已证明「带原站 Referer 可直引」。本脚本回答更尖锐的问题：
 * 服务器到底校验什么？换不同 Referer 后是否仍放行？据此判断新站部署域是否安全。
 */
import process from 'node:process';

// 报告同时落盘为 UTF-8（避免 PowerShell 重定向按系统码页写入导致中文乱码，证据文件须可直接阅读）
import { writeFileSync } from 'node:fs';
const REPORT = new URL('../docs/acceptance/smoke-referer-matrix.txt', import.meta.url);
const __buffer = [];
const __write = process.stdout.write.bind(process.stdout);
process.stdout.write = (chunk, ...rest) => {
  __buffer.push(String(chunk));
  return __write(chunk, ...rest);
};
process.on('exit', () => writeFileSync(REPORT, __buffer.join(''), 'utf8'));

const ORIGIN = 'https://www.thbiomedic.com';
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

const target = process.argv[2] ?? 'https://www.thbiomedic.com/uploadfiles/2021/09/20210907083344481.jpg';

const cases = [
  { label: '无 Referer', referer: undefined },
  { label: '原站中文页 /zn/', referer: 'https://www.thbiomedic.com/zn/index.html' },
  { label: '原站英文页 /', referer: 'https://www.thbiomedic.com/index.aspx' },
  { label: '新站中文首页 /zh/ (同域)', referer: 'https://www.thbiomedic.com/zh/' },
  { label: '新站产品页 /zh/products/ (同域)', referer: 'https://www.thbiomedic.com/zh/products/easy-lock/ankle-splint/' },
  { label: '本地开发 localhost:4321', referer: 'http://localhost:4321/zh/' },
  { label: '本地开发 127.0.0.1', referer: 'http://127.0.0.1:4321/zh/' },
  { label: '无头 Referer (scheme only)', referer: 'https://www.thbiomedic.com' },
  { label: '第三方域名 example.com', referer: 'https://example.com/' },
  { label: 'Vercel 部署域', referer: 'https://thbiomedic.vercel.app/zh/' },
];

for (const c of cases) {
  const headers = {
    'User-Agent': UA,
    Range: 'bytes=0-1023',
  };
  if (c.referer !== undefined) headers.Referer = c.referer;
  const t0 = Date.now();
  try {
    const res = await fetch(target, { method: 'GET', redirect: 'follow', headers, signal: AbortSignal.timeout(20_000) });
    const body = await res.arrayBuffer();
    const ct = (res.headers.get('content-type') ?? '(none)').toLowerCase();
    const ms = Date.now() - t0;
    const bytes = body.byteLength;
    const ok = (res.status === 200 || res.status === 206) && bytes > 0 && !ct.includes('text/html');
    console.log(
      `${ok ? 'ALLOW ' : 'BLOCK '} status=${String(res.status).padStart(3)} bytes=${String(bytes).padStart(5)} ms=${String(ms).padStart(4)} ` +
        `ct=${ct.padEnd(24)} <- ${c.label}`
    );
  } catch (err) {
    console.log(`BLOCK  error=${err.message} <- ${c.label}`);
  }
}
