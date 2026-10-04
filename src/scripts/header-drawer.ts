/* ==========================================================================
   页头交互（header-drawer.ts）— 移动抽屉导航 + 滚动阴影（design-spec §6.2）
   渐进增强：无 JS 时抽屉按钮隐藏、导航链接始终可见（架构 §3.5）
   单一职责、事件委托、无副作用导入（由 Header.astro 挂载）
   ========================================================================== */

const SCROLL_THRESHOLD = 8;

export function initHeader(): void {
  const header = document.querySelector<HTMLElement>('[data-header]');
  const toggle = document.querySelector<HTMLButtonElement>('[data-drawer-toggle]');
  const drawer = document.querySelector<HTMLElement>('[data-drawer]');
  const backdrop = document.querySelector<HTMLElement>('[data-drawer-backdrop]');

  if (!header || !toggle || !drawer) {
    return;
  }

  const setOpen = (open: boolean) => {
    drawer.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? (toggle.dataset.labelClose ?? '') : (toggle.dataset.labelOpen ?? ''));
    backdrop?.classList.toggle('is-visible', open);
    document.body.classList.toggle('is-drawer-open', open);
  };

  toggle.addEventListener('click', () => {
    setOpen(!drawer.classList.contains('is-open'));
  });

  backdrop?.addEventListener('click', () => setOpen(false));

  drawer.addEventListener('click', (event) => {
    const target = (event.target as Element).closest('a[data-drawer-close]');
    if (target) {
      setOpen(false);
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && drawer.classList.contains('is-open')) {
      setOpen(false);
      toggle.focus();
    }
  });

  // 滚动超过 8px 后加阴影（design-spec §6.2）
  const onScroll = () => {
    header.classList.toggle('is-scrolled', window.scrollY > SCROLL_THRESHOLD);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}
