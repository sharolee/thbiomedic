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
