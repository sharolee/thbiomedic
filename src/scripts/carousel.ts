/* ==========================================================================
   首页品牌轮播（carousel.ts）— design-spec §6.7 / page-structure §1-1
   自动播放 5s、悬停暂停、触摸滑动、指示点/箭头；
   prefers-reduced-motion 关闭自动播放（降级为手动切换）
   无 JS 降级：横向滚动容器（scroll-snap，见 Hero.astro）
   由 Hero.astro 挂载（岛屿 client:visible）
   ========================================================================== */

const AUTOPLAY_MS = 5000;

export function initCarousel(): void {
  const root = document.querySelector<HTMLElement>('[data-carousel]');
  if (!root) {
    return;
  }

  const track = root.querySelector<HTMLElement>('[data-carousel-track]');
  const slides = Array.from(root.querySelectorAll<HTMLElement>('[data-carousel-slide]'));
  const dots = Array.from(root.querySelectorAll<HTMLElement>('[data-carousel-dot]'));
  const prevBtn = root.querySelector<HTMLElement>('[data-carousel-prev]');
  const nextBtn = root.querySelector<HTMLElement>('[data-carousel-next]');
  if (!track || slides.length < 2 || !prevBtn || !nextBtn) {
    return;
  }

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let current = 0;
  let timer: number | undefined;

  const show = (index: number) => {
    current = (index + slides.length) % slides.length;
    track.style.transform = `translateX(-${current * 100}%)`;
    slides.forEach((slide, i) => slide.classList.toggle('is-active', i === current));
    dots.forEach((dot, i) => dot.classList.toggle('is-active', i === current));
    root.setAttribute('aria-live', 'polite');
  };

  const start = () => {
    if (reduced) {
      return;
    }
    stop();
    timer = window.setInterval(() => show(current + 1), AUTOPLAY_MS);
  };

  const stop = () => {
    if (timer !== undefined) {
      window.clearInterval(timer);
      timer = undefined;
    }
  };

  // 触摸滑动（design-spec §6.7）
  let startX = 0;
  let startY = 0;
  track.addEventListener('touchstart', (event) => {
    const touch = event.touches[0];
    if (touch) {
      startX = touch.clientX;
      startY = touch.clientY;
    }
    stop();
  }, { passive: true });

  track.addEventListener('touchend', (event) => {
    const touch = event.changedTouches[0];
    if (!touch) {
      return;
    }
    const dx = touch.clientX - startX;
    const dy = touch.clientY - startY;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) {
        show(current + 1);
      } else {
        show(current - 1);
      }
    }
    start();
  }, { passive: true });

  prevBtn.addEventListener('click', () => {
    show(current - 1);
    start();
  });
  nextBtn.addEventListener('click', () => {
    show(current + 1);
    start();
  });
  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const index = Number(dot.dataset.index ?? '0');
      show(index);
      start();
    });
  });

  // 悬停暂停（design-spec §6.7）
  root.addEventListener('mouseenter', stop);
  root.addEventListener('mouseleave', start);

  // 键盘可达：箭头键切换
  root.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      show(current - 1);
      start();
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      show(current + 1);
      start();
    }
  });

  // JS 激活：切换为 translate 轮播模式（CSS 依据 .is-carousel 调整）
  root.classList.add('is-carousel');
  show(0);
  start();
}
