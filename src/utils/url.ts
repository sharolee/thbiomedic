/* ==========================================================================
   路由工具（url.ts）— 语言前缀、同语义路径换算（ADR-002 §5.1/§5.4）
   C2：所有链接/资源 URL 必须经工具函数生成，禁止字符串拼接
   ========================================================================== */

import type { Lang } from '../types/dictionary';

const LANG_PREFIX_RE = /^\/(zh|en)(?=\/|$)/;

export function getLangFromPath(pathname: string): Lang {
  const match = pathname.match(LANG_PREFIX_RE);
  return match?.[1] === 'en' ? 'en' : 'zh';
}

/** 去掉语言前缀后的路径，如 /zh/products/ → /products/ */
export function stripLangPrefix(pathname: string): string {
  return pathname.replace(LANG_PREFIX_RE, '');
}

/** 为给定路径套上语言前缀：/products/ + zh → /zh/products/ */
export function withLangPrefix(pathname: string, lang: Lang): string {
  const rest = stripLangPrefix(pathname);
  return `/${lang}${rest === '/' ? '/' : rest}`;
}

/** 切换到另一语言的同语义路径（语言切换器核心逻辑，ADR-002 §5.4） */
export function getOtherLangPath(pathname: string, lang: Lang): string {
  const other: Lang = lang === 'zh' ? 'en' : 'zh';
  return withLangPrefix(pathname, other);
}

/** 当前语言首页路径 */
export function getHomePath(lang: Lang): string {
  return `/${lang}/`;
}

/** 产品中心一级页路径 */
export function getProductsPath(lang: Lang): string {
  return `/${lang}/products/`;
}

/** 产品二级分类列表页路径 */
export function getCategoryPath(categorySlug: string, lang: Lang): string {
  return `/${lang}/products/${categorySlug}/`;
}

/** 产品详情页路径 */
export function getProductPath(categorySlug: string, productSlug: string, lang: Lang): string {
  return `/${lang}/products/${categorySlug}/${productSlug}/`;
}

/** 新闻列表页路径 */
export function getNewsPath(lang: Lang): string {
  return `/${lang}/news/`;
}

/** 搜索页路径（query 以 `?q=...` 拼接到路径） */
export function getSearchPath(lang: Lang, query?: string): string {
  const base = `/${lang}/search/`;
  return query ? `${base}?q=${encodeURIComponent(query)}` : base;
}

/** 资源-下载页路径 */
export function getDownloadsPath(lang: Lang): string {
  return `/${lang}/resources/downloads/`;
}

/** 资源-视频页路径 */
export function getVideosPath(lang: Lang): string {
  return `/${lang}/resources/videos/`;
}

/** 资源-视频分类页路径（如 /zh/resources/videos/physical-rehabilitation/） */
export function getVideoCategoryPath(categorySlug: string, lang: Lang): string {
  return `/${lang}/resources/videos/${categorySlug}/`;
}

/** 联系我们页路径 */
export function getContactPath(lang: Lang): string {
  return `/${lang}/contact/`;
}

/** 关于我们页路径 */
export function getAboutPath(lang: Lang): string {
  return `/${lang}/about/`;
}
