/* ==========================================================================
   SEO 工具（seo.ts）— 页面级 meta、canonical、hreflang 生成（architecture.md C3）
   每页输出 hreflang 双向链接 + x-default（指向英文版，ADR-002 §3.4）
   ========================================================================== */

import type { Lang } from '../types/dictionary';

export interface HreflangLink {
  hreflang: string;
  href: string;
}

export function getSiteUrl(): string {
  return import.meta.env.PUBLIC_SITE_URL || 'https://www.thbiomedic.com';
}

/** 从页面路径生成全量 hreflang 链接（含 x-default → 英文版） */
export function getHreflangLinks(pathname: string, lang: Lang): HreflangLink[] {
  const site = getSiteUrl();
  const zhPath = lang === 'zh' ? pathname : pathname.replace(/^\/en/, '/zh');
  const enPath = lang === 'en' ? pathname : pathname.replace(/^\/zh/, '/en');
  return [
    { hreflang: 'zh-CN', href: `${site}${zhPath}` },
    { hreflang: 'en', href: `${site}${enPath}` },
    { hreflang: 'x-default', href: `${site}${enPath}` },
  ];
}

/** 当前页 canonical 绝对 URL */
export function getCanonicalUrl(pathname: string): string {
  return `${getSiteUrl()}${pathname}`;
}
