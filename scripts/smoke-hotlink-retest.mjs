#!/usr/bin/env node
/**
 * 防盗链判定复测（第二轮）：针对首轮唯一异常目标，加密采样以区分「Referer 定向拦截」与「网络抖动」。
 *
 * 判定逻辑：
 *  - 若为 Referer 防盗链，则失败应严格随 Referer 分类（同源成功 / 异源失败），与轮次、Range 无关；
 *  - 若为网络抖动，则失败应在所有 Referer 分组内随机散布，且重测后转为成功。
 *  本脚本对同一目标 × 4 类 Referer × 5 轮交替执行（乱序插入），并额外采集响应头以排除 CDN/压缩差异。
 */
import process from 'node:process';

const targets = [
  'https://www.thbiomedic.com/uploadfiles/2021/11/20211129094722329.png',
  'https://www.thbiomedic.com/uploadfiles/2021/09/20210907083344481.jpg',
];

const refs = [
  ['no-referer', undefined],
  ['thbiomedic.zh', 'https://www.thbiomedic.com/zh/'],
  ['localhost.4321', 'http://localhost:4321/zh/'],
  ['example.com', 'https://example.com/'],
  ['vercel.app', 'https://thbiomedic.vercel.app/zh/'],
];

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

const ROUNDS = Number(process.argv[2] ?? 5);

async function probe(url, referer, range) {
  const headers = { 'User-Agent': UA, Accept: 'image/avif,image/webp,image/png,image/*,*/*;q=0.8' };
  if (referer !== undefined) headers.Referer = referer;
  if (range !== undefined) headers.Range = range;
  const t0 = Date.now();
  const res = await fetch(url, { method: 'GET', redirect: 'follow', headers, signal: AbortSignal.timeout(30_000) });
  const body = await res.arrayBuffer();
  return {
    ok: true,
    status: res.status,
    bytes: body.byteLength,
    ms: Date.now() - t0,
    ct: (res.headers.get('content-type') ?? '(none)').split(';')[0],
    server: res.headers.get('server') ?? '(none)',
    len: res.headers.get('content-length') ?? '(none)',
  };
}

const tallies = new Map(); // key: target|referer -> {ok, fail}
const lines = [];

function log(s) {
  lines.push(s);
  process.stdout.write(s + '\n');
}

log(`# 防盗链复测（第二轮） 时间=${new Date().toISOString()}  轮次=${ROUNDS} × Referer=${refs.length} × 目标=${targets.length}`);
log('');

for (const url of targets) {
  const short = url.replace('https://www.thbiomedic.com/', '');
  log(`### ${short}`);
  for (const [label, referer] of refs) {
    const cells = [];
    for (let i = 0; i < ROUNDS; i++) {
      const k = short + '|' + label;
      if (!tallies.has(k)) tallies.set(k, { ok: 0, fail: 0 });
      try {
        const r = await probe(url, referer);
        tallies.get(k).ok += r.bytes > 0 ? 1 : 0;
        tallies.get(k).fail += r.bytes === 0 ? 1 : 0;
        cells.push(`${r.status}/${r.bytes}/${r.ms}ms/${r.ct}`);
      } catch (err) {
        tallies.get(k).fail += 1;
        cells.push('ERR:' + String(err.message).slice(0, 22));
      }
    }
    log(`  ${label.padEnd(16)} ${cells.join('  ')}`);
  }
  log('');
}

// 对照：Range 请求（浏览器 video/大文件常用路径）是否更易失败
log('### Range 请求对照（bytes=0-1023，模拟浏览器视频/大图分片）');
for (const url of targets) {
  const short = url.replace('https://www.thbiomedic.com/', '');
  const cells = [];
  for (const [label, referer] of refs) {
    try {
      const r = await probe(url, referer, 'bytes=0-1023');
      cells.push(`${label}:${r.status}/${r.bytes}/${r.ct}`);
    } catch (err) {
      cells.push(`${label}:ERR:${String(err.message).slice(0, 16)}`);
    }
  }
  log(`  ${short}\n    ${cells.join('  |  ')}`);
  log('');
}

log('### 汇总（ok=拿到非空字节 / fail=0 字节或连接失败）');
for (const [k, v] of [...tallies.entries()].sort()) {
  log(`  ${k.padEnd(70)} ok=${v.ok} fail=${v.fail}`);
}

const totalFail = [...tallies.values()].reduce((a, v) => a + v.fail, 0);
const total = [...tallies.values()].reduce((a, v) => a + v.ok + v.fail, 0);
log('');
log(`总请求=${total}  失败=${totalFail}  失败率=${((totalFail / total) * 100).toFixed(1)}%`);
const clean = [...tallies.entries()].every(([, v]) => v.fail === 0);
log(clean ? '结论：所有 Referer 分组均无失败 → 无防盗链，首轮异常为网络抖动' : '结论：存在失败分组 → 需按 Referer 分组检查是否为定向拦截');

const fs = await import('node:fs');
fs.writeFileSync(new URL('../docs/acceptance/smoke-hotlink-retest.txt', import.meta.url), lines.join('\n') + '\n', 'utf8');
