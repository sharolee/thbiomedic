/* 方向 A-plus 增强层：轻量分子粒子 + 滚动显现 + 数字滚动
   纯 vanilla JS，无依赖；尊重 prefers-reduced-motion */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) {
    document.body.classList.add('reduced-motion');
  }
  document.body.classList.remove('no-js');

  /* ---------- 1. Hero 轻粒子（分子点 + 连线，克制不喧宾） ---------- */
  var canvas = document.getElementById('hero-particles');
  if (canvas && !reduced) {
    var ctx = canvas.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0, pts = [], raf = null, visible = true;
    var DENSITY = 14000;   // 每 14000px² 一个粒子
    var LINK = 110;        // 连线距离
    var TEAL = '13,143,181', ORANGE = '231,83,6';

    function resize() {
      var r = canvas.parentElement.getBoundingClientRect();
      W = r.width; H = r.height;
      canvas.width = W * dpr; canvas.height = H * dpr;
      canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.max(18, Math.min(64, Math.round(W * H / DENSITY)));
      pts = [];
      for (var i = 0; i < n; i++) {
        pts.push({
          x: Math.random() * W, y: Math.random() * H,
          vx: (Math.random() - .5) * .22, vy: (Math.random() - .5) * .22,
          r: 1.4 + Math.random() * 1.8,
          orange: Math.random() < .12
        });
      }
    }

    function tick() {
      if (!visible) { raf = null; return; }
      ctx.clearRect(0, 0, W, H);
      var i, j, p, q, dx, dy, d;
      for (i = 0; i < pts.length; i++) {
        p = pts[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < -10) p.x = W + 10; if (p.x > W + 10) p.x = -10;
        if (p.y < -10) p.y = H + 10; if (p.y > H + 10) p.y = -10;
      }
      ctx.lineWidth = 1;
      for (i = 0; i < pts.length; i++) {
        for (j = i + 1; j < pts.length; j++) {
          p = pts[i]; q = pts[j];
          dx = p.x - q.x; dy = p.y - q.y;
          d = dx * dx + dy * dy;
          if (d < LINK * LINK) {
            ctx.strokeStyle = 'rgba(' + TEAL + ',' + (0.16 * (1 - Math.sqrt(d) / LINK)) + ')';
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
          }
        }
      }
      for (i = 0; i < pts.length; i++) {
        p = pts[i];
        ctx.fillStyle = p.orange ? 'rgba(' + ORANGE + ',.5)' : 'rgba(' + TEAL + ',.42)';
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.2832); ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    }

    // 只在新标签 GPU 上启动，离屏暂停
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        visible = es[0].isIntersecting;
        if (visible && !raf) raf = requestAnimationFrame(tick);
      }, { threshold: 0 }).observe(canvas);
    }
    resize();
    window.addEventListener('resize', resize);
    raf = requestAnimationFrame(tick);
  }

  /* ---------- 2. 滚动显现 ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if (!reduced && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- 3. 数据条数字滚动 ---------- */
  var counters = document.querySelectorAll('.count');
  function runCounter(el) {
    var to = parseInt(el.getAttribute('data-to'), 10) || 0;
    if (reduced) { el.textContent = to; return; }
    var t0 = null, DUR = 1200;
    function step(ts) {
      if (!t0) t0 = ts;
      var k = Math.min(1, (ts - t0) / DUR);
      el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3)));
      if (k < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { runCounter(e.target); cio.unobserve(e.target); }
      });
    }, { threshold: 0.4 });
    counters.forEach(function (el) { cio.observe(el); });
  } else {
    counters.forEach(runCounter);
  }

  /* ---------- 4. 视频失效降级：隐藏 video，露出 poster 底图 ---------- */
  var vid = document.querySelector('.hero-media video');
  if (vid) {
    vid.addEventListener('error', function () { vid.style.display = 'none'; }, true);
    if (reduced) { vid.removeAttribute('autoplay'); vid.pause(); }
  }
})();
