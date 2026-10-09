#!/usr/bin/env node
/**
 * 防盗链判定（受控实验）：固定同一目标 URL，只改变 Referer 与 Range，各测 3 次。
 * 目的：排除「响应不一致」造成的误判，给出部署域可安全直引的确定结论。
 */
import process from 'node:process';

const target =
  process.argv[2] ??
  'https://www.thbiomedic.com/uploadfiles/2021/09/20210907083344481.jpg';
const second =
  process.argv[3] ??
  'https://www.thbiomedic.com/uploadfiles/2021/11/20211129094722329.png';

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

const refs = [
  ['no-referer', undefined],
  ['thbiomedic /zh/', 'https://www.thbiomedic.com/zh/'],
  ['localhost:4321', 'http://localhost:4321/zh/'],
  ['example.com', 'https://example.com/'],
];

for (const t of [target, second]) {
  console.log('\n### target: ' + t.replace('https://www.thbiomedic.com/', ''));
  for (const [label, referer] of refs) {
    const rows = [];
    for (let i = 0; i < 3; i++) {
      const headers = { 'User-Agent': UA };
      if (referer !== undefined) headers.Referer = referer;
      try {
        const t0 = Date.now();
        const res = await fetch(t, {
          method: 'GET',
          redirect: 'follow',
          headers,
          signal: AbortSignal.timeout(25_000),
        });
        const body = await res.arrayBuffer();
        const ct = (res.headers.get('content-type') ?? '(none)').toLowerCase();
        rows.push(
          `${res.status}/${body.byteLength}/${Date.now() - t0}ms/${ct.split(';')[0] || 'none'}`
        );
      } catch (err) {
        rows.push('ERR:' + err.message.slice(0, 30));
      }
    }
    console.log(`  ${label.padEnd(18)} ${rows.join('   ')}`);
  }
}
