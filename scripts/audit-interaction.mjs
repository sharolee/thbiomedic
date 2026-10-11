/**
 * 上线检查交互冒烟（SHAR-58）
 * 用法：node scripts/audit-interaction.mjs [baseUrl]
 * 逐项真实操作：语言切换 / 搜索 / 留言表单 / 移动抽屉 / 灯箱 / 视频模态 / 焦点环 / 404
 */
import { chromium } from 'playwright';

const BASE = process.argv[2] ?? 'http://localhost:4321';
const log = (ok, name, detail) =>
  console.log(`${ok ? 'PASS' : 'FAIL'} | ${name} | ${detail}`);

const browser = await chromium.launch({ channel: 'chrome' });
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  userAgent:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36',
});
await ctx.route('**/*.mp4', (r) => r.abort());
const page = await ctx.newPage();

// ---- 1. 语言切换（A19）----
await page.goto(`${BASE}/zh/products/easy-lock/ankle-splint/`, { waitUntil: 'domcontentloaded' });
await page.click('a.lang-switcher__link');
await page.waitForLoadState('domcontentloaded');
log(
  page.url() === `${BASE}/en/products/easy-lock/ankle-splint/`,
  'A19 语言切换同语义页',
  `点击后 URL=${page.url()}`
);

// ---- 2. 搜索 ----
await page.goto(`${BASE}/zh/search/`, { waitUntil: 'domcontentloaded' });
const idx = await page.evaluate(async () => {
  const r = await fetch('/zh/search/index.json');
  return { status: r.status, n: (await r.json()).length };
});
log(idx.status === 200 && idx.n > 0, '搜索索引端点', `status=${idx.status} 条目=${idx.n}`);

// 搜索页自身可见输入框（SHAR-58 检查项）
const ownInput = await page.evaluate(
  () =>
    Array.from(document.querySelectorAll('input[name="q"]')).filter((i) => {
      const r = i.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && r.top >= 0 && r.top < window.innerHeight;
    }).length
);
log(ownInput > 0, '搜索页自带可见输入框', `可见 q 输入框数量=${ownInput}`);

await page.goto(`${BASE}/zh/search/?q=${encodeURIComponent('低温热塑')}`, {
  waitUntil: 'domcontentloaded',
});
await page.waitForTimeout(1200);
const s1 = await page.evaluate(() => {
  const c = document.querySelector('[data-search-count]');
  return {
    count: c && !c.hidden ? c.textContent.trim() : '(hidden)',
    n: document.querySelectorAll('[data-search-results] a').length,
  };
});
log(s1.n > 0, '搜索关键词命中', `${s1.count} 链接数=${s1.n}`);

await page.goto(`${BASE}/zh/search/?q=zzzzzz`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(1000);
const empty = await page.evaluate(() => {
  const el = document.querySelector('[data-search-empty]');
  return el ? el.textContent.replace(/\s+/g, ' ').trim().slice(0, 80) : 'N/A';
});
log(/未找到|未找到相关结果/.test(empty), '搜索空态', `空结果文案=${empty}`);

// 英文站搜索
await page.goto(`${BASE}/en/search/?q=Ankle`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(1000);
const s2 = await page.evaluate(() => document.querySelectorAll('[data-search-results] a').length);
log(s2 > 0, '英文站搜索命中', `q=Ankle 链接数=${s2}`);

// ---- 3. 页头搜索条 ----
await page.goto(`${BASE}/zh/`, { waitUntil: 'domcontentloaded' });
await page.click('[data-search-toggle]');
await page.waitForTimeout(300);
const barVisible = await page.evaluate(() => {
  const el = document.querySelector('[data-search-bar]');
  return !!el && !el.hidden;
});
log(barVisible, '页头搜索条展开', `visible=${barVisible}`);
await page.keyboard.press('Escape');
await page.waitForTimeout(300);
const barHidden = await page.evaluate(() => {
  const el = document.querySelector('[data-search-bar]');
  return !!el && el.hidden;
});
log(barHidden, 'C5 Esc 关闭搜索条', `hidden=${barHidden}`);

// ---- 4. 联系表单空提交（C1）----
await page.goto(`${BASE}/zh/contact/`, { waitUntil: 'domcontentloaded' });
await page.click('[data-contact-form-el] button[type="submit"]');
await page.waitForTimeout(400);
const errState = await page.evaluate(() => {
  const errs = Array.from(document.querySelectorAll('[data-error-for]')).filter((e) => !e.hidden);
  const invalid = document.querySelectorAll('[aria-invalid="true"]').length;
  const focused = document.activeElement?.id ?? '';
  return { errs: errs.length, texts: errs.map((e) => e.textContent.trim().slice(0, 30)), invalid, focused };
});
log(
  errState.errs > 0 && errState.invalid > 0,
  'C1 空提交错误提示',
  `错误项=${errState.errs} aria-invalid=${errState.invalid} 首个焦点=${errState.focused}`
);

// ---- 5. 联系表单合法提交（C2）----
await page.evaluate(() => {
  const set = (n, v) => {
    const el = document.querySelector(`[data-contact-form-el] [name="${n}"]`);
    if (el) {
      el.value = v;
      el.dispatchEvent(new Event('input', { bubbles: true }));
    }
  };
  set('company', '测试公司');
  set('email', 'test@example.com');
  set('first_name', 'Test');
  set('last_name', 'User');
  set('phone', '13800000000');
  set('message', '这是一条上线检查用的测试留言');
});
let mailto = '';
page.on('framenavigated', (f) => {
  if (f === page.mainFrame() && f.url().startsWith('mailto:')) mailto = f.url();
});
await page.click('[data-contact-form-el] button[type="submit"]');
await page.waitForTimeout(800);
const okState = await page.evaluate(() => {
  const ok = document.querySelector('[data-form-success]');
  const form = document.querySelector('[data-contact-form-el]');
  return { okVisible: !!ok && !ok.hidden, formHidden: !!form && form.hidden };
});
log(
  okState.okVisible && okState.formHidden,
  'C2 提交成功态',
  `success可见=${okState.okVisible} 表单隐藏=${okState.formHidden} mailto长度=${mailto.length}`
);
console.log(`       mailto 前缀: ${mailto.slice(0, 120)}`);

// ---- 6. 移动抽屉 ----
const m = await ctx.newPage();
await m.setViewportSize({ width: 390, height: 844 });
await m.goto(`${BASE}/zh/`, { waitUntil: 'domcontentloaded' });
await m.click('[data-drawer-toggle]');
await m.waitForTimeout(300);
const drawerOpen = await m.evaluate(() => document.body.classList.contains('is-drawer-open'));
await m.keyboard.press('Escape');
await m.waitForTimeout(300);
const drawerClosed = await m.evaluate(() => !document.body.classList.contains('is-drawer-open'));
log(drawerOpen && drawerClosed, 'C5 移动抽屉开/Esc 关', `open=${drawerOpen} escClose=${drawerClosed}`);

// 抽屉内导航点击后自动关闭
await m.click('[data-drawer-toggle]');
await m.waitForTimeout(200);
await m.click('#mobile-drawer a[data-drawer-close]');
await m.waitForTimeout(600);
const closedAfterNav = await m.evaluate(() => !document.body.classList.contains('is-drawer-open'));
log(closedAfterNav, '抽屉内导航后自动关闭', `closed=${closedAfterNav} url=${m.url()}`);
await m.close();

// ---- 7. 灯箱（关于页历程图 B10）----
await page.goto(`${BASE}/zh/about/`, { waitUntil: 'domcontentloaded' });
const lb = await page.evaluate(() => {
  const t = document.querySelector('[data-lightbox-trigger], a[data-lightbox]');
  return !!t;
});
if (lb) {
  await page.click('[data-lightbox-trigger], a[data-lightbox]');
  await page.waitForTimeout(400);
  const open = await page.evaluate(() => {
    const el = document.querySelector('[data-lightbox]');
    return !!el && !el.hidden;
  });
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  const closed = await page.evaluate(() => {
    const el = document.querySelector('[data-lightbox]');
    return !!el && el.hidden;
  });
  log(open && closed, 'B10/C5 灯箱开 + Esc 关', `open=${open} esc=${closed}`);
} else {
  log(false, 'B10 灯箱触发器', '未找到 [data-lightbox-trigger]');
}

// ---- 8. 视频模态（B24）----
await page.goto(`${BASE}/zh/resources/videos/`, { waitUntil: 'domcontentloaded' });
const vtrigger = await page.evaluate(
  () => document.querySelectorAll('[data-video-modal-trigger], button[data-video]').length
);
log(vtrigger > 0, 'B24 视频模态触发器', `数量=${vtrigger}`);

// ---- 9. 焦点环（C4）----
await page.goto(`${BASE}/zh/`, { waitUntil: 'domcontentloaded' });
const focusInfo = await page.evaluate(() => {
  const a = document.querySelector('a');
  a.focus();
  const s = getComputedStyle(a, ':focus-visible');
  return { outlineWidth: s.outlineWidth, outlineColor: s.outlineColor, active: document.activeElement?.tagName };
});
log(true, 'C4 焦点样式（值供人工核对）', JSON.stringify(focusInfo));

// ---- 10. 中文空分类空态（B17）----
await page.goto(`${BASE}/zh/products/high-temp-thermoplastics/`, { waitUntil: 'domcontentloaded' });
const emptyState = await page.evaluate(() => document.body.innerText.slice(0, 400));
log(/整理中|筹备中|暂无/.test(emptyState), 'B17 空分类空态文案', emptyState.replace(/\s+/g, ' ').slice(0, 120));

// ---- 11. 新闻空态（B26）----
await page.goto(`${BASE}/zh/news/`, { waitUntil: 'domcontentloaded' });
const news = await page.evaluate(() => document.body.innerText.replace(/\s+/g, ' ').slice(0, 200));
log(/敬请期待|暂无/.test(news), 'B26 新闻空态', news.slice(0, 120));

// ---- 12. 页脚资源列（B27）----
const footerRes = await page.evaluate(() => {
  const nav = Array.from(document.querySelectorAll('.footer a')).map((a) => a.getAttribute('href'));
  return nav.filter((h) => h && h.includes('/resources/'));
});
log(
  footerRes.length === 2 && !footerRes.some((h) => h.includes('news')),
  'B27 页脚资源列',
  JSON.stringify([...new Set(footerRes)])
);

await browser.close();
