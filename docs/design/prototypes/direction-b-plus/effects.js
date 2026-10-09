/* 方向 B-plus 增强层：
   1) three.js 3D 粒子网络 Hero（WebGL）；不可用/无 three.js 时降级为 2D canvas plexus
   2) 滚动显现 / 数字滚动 / 页头滚动态
   尊重 prefers-reduced-motion */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) document.body.classList.add('reduced-motion');
  document.body.classList.remove('no-js');

  var host = document.getElementById('hero-3d');

  /* ================= three.js 粒子网络 ================= */
  function initThree() {
    var W = host.clientWidth, H = host.clientHeight;
    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch (e) { return false; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(W, H);
    host.appendChild(renderer.domElement);

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(60, W / H, 1, 2000);
    camera.position.z = 420;

    // 粒子云：球形分布，青色为主、8% 橙色
    var N = W < 768 ? 140 : 260;
    var positions = new Float32Array(N * 3);
    var colors = new Float32Array(N * 3);
    var teal = new THREE.Color('#2FB6DC'), orange = new THREE.Color('#FF6B1F');
    var pts = [];
    for (var i = 0; i < N; i++) {
      var r = 190 + Math.random() * 170;
      var theta = Math.random() * Math.PI * 2;
      var phi = Math.acos(2 * Math.random() - 1);
      var x = r * Math.sin(phi) * Math.cos(theta);
      var y = r * Math.sin(phi) * Math.sin(theta) * 0.62;
      var z = r * Math.cos(phi);
      positions[i * 3] = x; positions[i * 3 + 1] = y; positions[i * 3 + 2] = z;
      var c = Math.random() < .08 ? orange : teal;
      colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b;
      pts.push({ x: x, y: y, z: z, ox: x, oy: y, oz: z, sp: .4 + Math.random() * .8, ph: Math.random() * 6.28 });
    }
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    var points = new THREE.Points(geo, new THREE.PointsMaterial({
      size: 3.2, vertexColors: true, transparent: true, opacity: .9,
      sizeAttenuation: true, depthWrite: false
    }));
    scene.add(points);

    // 连接线（每帧按距离重建）
    var MAXL = 96;
    var lineGeo = new THREE.BufferGeometry();
    var linePos = new Float32Array(N * N * 3); // 上界浪费但一次性分配；用 drawRange 控制
    lineGeo.setAttribute('position', new THREE.BufferAttribute(linePos, 3));
    var lines = new THREE.LineSegments(lineGeo, new THREE.LineBasicMaterial({
      color: 0x2FB6DC, transparent: true, opacity: .14, depthWrite: false
    }));
    scene.add(lines);

    var mouseX = 0, mouseY = 0;
    window.addEventListener('pointermove', function (e) {
      mouseX = (e.clientX / window.innerWidth - .5) * 2;
      mouseY = (e.clientY / window.innerHeight - .5) * 2;
    }, { passive: true });

    var visible = true, t = 0;
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }, { threshold: 0 }).observe(host);
    }

    function frame() {
      requestAnimationFrame(frame);
      if (!visible) return;
      t += 0.004;
      var arr = geo.attributes.position.array;
      for (var i = 0; i < N; i++) {
        var p = pts[i];
        arr[i * 3]     = p.ox + Math.sin(t * p.sp + p.ph) * 14;
        arr[i * 3 + 1] = p.oy + Math.cos(t * p.sp * .9 + p.ph) * 12;
        arr[i * 3 + 2] = p.oz + Math.sin(t * p.sp * .7 + p.ph * 2) * 10;
      }
      geo.attributes.position.needsUpdate = true;

      // 重建连线
      var li = 0;
      for (var a = 0; a < N; a++) {
        for (var b = a + 1; b < N; b++) {
          var dx = arr[a * 3] - arr[b * 3];
          var dy = arr[a * 3 + 1] - arr[b * 3 + 1];
          var dz = arr[a * 3 + 2] - arr[b * 3 + 2];
          if (dx * dx + dy * dy + dz * dz < MAXL * MAXL) {
            linePos[li++] = arr[a * 3]; linePos[li++] = arr[a * 3 + 1]; linePos[li++] = arr[a * 3 + 2];
            linePos[li++] = arr[b * 3]; linePos[li++] = arr[b * 3 + 1]; linePos[li++] = arr[b * 3 + 2];
          }
        }
      }
      lineGeo.setDrawRange(0, li / 3);
      lineGeo.attributes.position.needsUpdate = true;

      // 鼠标视差 + 缓旋转
      points.rotation.y += 0.0007; lines.rotation.y += 0.0007;
      camera.position.x += (mouseX * 36 - camera.position.x) * .04;
      camera.position.y += (-mouseY * 22 - camera.position.y) * .04;
      camera.lookAt(scene.position);
      renderer.render(scene, camera);
    }
    frame();

    window.addEventListener('resize', function () {
      W = host.clientWidth; H = host.clientHeight;
      camera.aspect = W / H; camera.updateProjectionMatrix();
      renderer.setSize(W, H);
    });
    return true;
  }

  /* ================= 2D canvas 降级（无 WebGL / 无 three.js） ================= */
  function init2D() {
    var canvas = document.createElement('canvas');
    host.appendChild(canvas);
    var ctx = canvas.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0, pts = [];
    var LINK = 120;
    function resize() {
      W = host.clientWidth; H = host.clientHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.max(40, Math.min(150, Math.round(W * H / 9000)));
      pts = [];
      for (var i = 0; i < n; i++) pts.push({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35,
        orange: Math.random() < .08
      });
    }
    function tick() {
      ctx.clearRect(0, 0, W, H);
      var i, j, p, q, dx, dy, d;
      for (i = 0; i < pts.length; i++) {
        p = pts[i]; p.x += p.vx; p.y += p.vy;
        if (p.x < -10) p.x = W + 10; if (p.x > W + 10) p.x = -10;
        if (p.y < -10) p.y = H + 10; if (p.y > H + 10) p.y = -10;
      }
      for (i = 0; i < pts.length; i++) for (j = i + 1; j < pts.length; j++) {
        p = pts[i]; q = pts[j]; dx = p.x - q.x; dy = p.y - q.y; d = dx * dx + dy * dy;
        if (d < LINK * LINK) {
          ctx.strokeStyle = 'rgba(47,182,220,' + (0.18 * (1 - Math.sqrt(d) / LINK)) + ')';
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
        }
      }
      for (i = 0; i < pts.length; i++) {
        p = pts[i];
        ctx.fillStyle = p.orange ? 'rgba(255,107,31,.9)' : 'rgba(47,182,220,.85)';
        ctx.beginPath(); ctx.arc(p.x, p.y, 1.8, 0, 6.2832); ctx.fill();
      }
      requestAnimationFrame(tick);
    }
    resize(); window.addEventListener('resize', resize); tick();
  }

  if (host && !reduced) {
    var ok = false;
    if (window.THREE) { try { ok = initThree(); } catch (e) { ok = false; } }
    if (!ok) init2D();
  } else if (host) {
    document.body.classList.add('no-webgl');
  }

  /* ================= 滚动显现 ================= */
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

  /* ================= 数字滚动 ================= */
  var counters = document.querySelectorAll('.count');
  function runCounter(el) {
    var to = parseInt(el.getAttribute('data-to'), 10) || 0;
    if (reduced) { el.textContent = to; return; }
    var t0 = null, DUR = 1400;
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
  } else { counters.forEach(runCounter); }

  /* ================= 页头滚动态 ================= */
  var header = document.querySelector('.site-header');
  function onScroll() { header.classList.toggle('scrolled', window.scrollY > 24); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();
