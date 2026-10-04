/* ==========================================================================
   语言切换偏好记忆（language-switcher.ts）— ADR-002 §3.3「显式选择优先」
   点击语言切换链接时记录偏好，后续首访按偏好直跳（不覆盖显式选择）
   渐进增强：无 JS 时切换器仍是普通链接，功能完整（page-structure §0.2）
   ========================================================================== */

const PREF_KEY = 'thb:lang';

export function initLanguageSwitcher(): void {
  document.addEventListener('click', (event) => {
    const link = (event.target as Element).closest<HTMLAnchorElement>('[data-lang-switch]');
    if (!link) {
      return;
    }
    const lang = link.dataset.langSwitch;
    if (lang === 'zh' || lang === 'en') {
      try {
        localStorage.setItem(PREF_KEY, lang);
      } catch {
        /* 隐私模式等场景下忽略 */
      }
    }
  });
}
