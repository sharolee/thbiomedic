/* ==========================================================================
   页头交互（header-drawer.ts）— 移动抽屉导航 + 滚动阴影 + 搜索条滑出
   design-spec §6.2 / page-structure §0.3
   渐进增强：无 JS 时抽屉/搜索条隐藏，导航链接始终可见（架构 §3.5）
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

  // ── 站内搜索条（page-structure §0.3） ──
  const searchBar = document.querySelector<HTMLElement>('[data-search-bar]');
  const searchToggle = document.querySelector<HTMLElement>('[data-search-toggle]');
  const searchClose = document.querySelector<HTMLElement>('[data-search-close]');
  const searchInput = document.querySelector<HTMLInputElement>('[data-search-input]');

  if (searchBar && searchToggle && searchClose && searchInput) {
    const openSearch = () => {
      searchBar.hidden = false;
      searchToggle.setAttribute('aria-expanded', 'true');
      searchInput.focus();
    };
    const closeSearch = () => {
      searchBar.hidden = true;
      searchToggle.setAttribute('aria-expanded', 'false');
    };

    searchToggle.addEventListener('click', (event) => {
      event.preventDefault();
      if (searchBar.hidden) {
        openSearch();
      } else {
        closeSearch();
      }
    });
    searchClose.addEventListener('click', closeSearch);

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !searchBar.hidden) {
        closeSearch();
        searchToggle.focus();
      }
    });
  }
}