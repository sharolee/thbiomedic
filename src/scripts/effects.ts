/* ==========================================================================
   direction-a-plus 增强层（effects.ts）— 移植自原型 effects.js
   1. Hero 轻粒子（分子点 + 连线，克制不喧宾）
   2. 滚动显现（.reveal → .in）
   3. 数据条数字滚动（.count[data-to]）
   纯 vanilla TS，无依赖；尊重 prefers-reduced-motion；离屏自动暂停。
   ========================================================================== */

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (reduced) {
  document.body.classList.add('reduced-motion');
}

/* ---------- 1. Hero 轻粒子 ---------- */
function initParticles(canvas: HTMLCanvasElement): void {
  if (reduced) return;
  const maybeCtx = canvas.getContext('2d');
  if (!maybeCtx) return;
  const ctx = maybeCtx;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let W = 0;
  let H = 0;
  let pts: { x: number; y: number; vx: number; vy: number; r: number; orange: boolean }[] = [];
  let raf: number | null = null;
  let visible = true;
  const DENSITY = 14000;
  const LINK = 110;
  const TEAL = '13,143,181';
  const ORANGE = '231,83,6';

  function resize(): void {
    const r = canvas.parentElement?.getBoundingClientRect();
    if (!r) return;
    W = r.width;
    H = r.height;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.max(18, Math.min(64, Math.round((W * H) / DENSITY)));
    pts = [];
    for (let i = 0; i < n; i++) {
      pts.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        r: 1.4 + Math.random() * 1.8,
        orange: Math.random() < 0.12,
      });
    }
  }

  function tick(): void {
    if (!visible) {
      raf = null;
      return;
    }
    ctx.clearRect(0, 0, W, H);
    let i: number;
    let j: number;
    let dx: number;
    let dy: number;
    let d: number;
    for (i = 0; i < pts.length; i++) {
      const p = pts[i]!;
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < -10) p.x = W + 10;
      if (p.x > W + 10) p.x = -10;
      if (p.y < -10) p.y = H + 10;
      if (p.y > H + 10) p.y = -10;
    }
    ctx.lineWidth = 1;
    for (i = 0; i < pts.length; i++) {
      for (j = i + 1; j < pts.length; j++) {
        const p = pts[i]!;
        const q = pts[j]!;
        dx = p.x - q.x;
        dy = p.y - q.y;
        d = dx * dx + dy * dy;
        if (d < LINK * LINK) {
          ctx.strokeStyle = `rgba(${TEAL},${0.16 * (1 - Math.sqrt(d) / LINK)})`;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.stroke();
        }
      }
    }
    for (i = 0; i < pts.length; i++) {
      const p = pts[i]!;
      ctx.fillStyle = p.orange ? `rgba(${ORANGE},.5)` : `rgba(${TEAL},.42)`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, 6.2832);
      ctx.fill();
    }
    raf = requestAnimationFrame(tick);
  }

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(
      (es) => {
        visible = es[0]!.isIntersecting;
        if (visible && !raf) raf = requestAnimationFrame(tick);
      },
      { threshold: 0 },
    ).observe(canvas);
  }
  resize();
  window.addEventListener('resize', resize);
  raf = requestAnimationFrame(tick);
}

/* ---------- 2. 滚动显现 ---------- */
function initReveal(): void {
  const reveals = Array.from(document.querySelectorAll<HTMLElement>('.reveal'));
  if (!reduced && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (es) => {
        es.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('in'));
  }
}

/* ---------- 3. 数据条数字滚动 ---------- */
function runCounter(el: HTMLElement): void {
  const to = parseInt(el.getAttribute('data-to') ?? '0', 10) || 0;
  if (reduced) {
    el.textContent = String(to);
    return;
  }
  let t0: number | null = null;
  const DUR = 1200;
  function step(ts: number): void {
    if (!t0) t0 = ts;
    const k = Math.min(1, (ts - t0) / DUR);
    el.textContent = String(Math.round(to * (1 - Math.pow(1 - k, 3))));
    if (k < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function initCounters(): void {
  const counters = Array.from(document.querySelectorAll<HTMLElement>('.count'));
  if ('IntersectionObserver' in window) {
    const cio = new IntersectionObserver(
      (es) => {
        es.forEach((e) => {
          if (e.isIntersecting) {
            runCounter(e.target as HTMLElement);
            cio.unobserve(e.target);
          }
        });
      },
      { threshold: 0.4 },
    );
    counters.forEach((el) => cio.observe(el));
  } else {
    counters.forEach(runCounter);
  }
}

/** 全站 a-plus 交互增强（Astro island 入口） */
export function initAplusEffects(): void {
  const canvas = document.getElementById('hero-particles') as HTMLCanvasElement | null;
  if (canvas) initParticles(canvas);
  initReveal();
  initCounters();
}

/* 供语言切换等全局脚本复用 */
export { initReveal, initCounters };
