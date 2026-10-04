/* ==========================================================================
   组件 Props 类型（components.d.ts）— architecture.md §3.2 组件规范
   C4：组件 Props 必须有 TypeScript 接口，严格模式，禁止 any
   ========================================================================== */

import type { Dict, Lang } from './dictionary';

export interface PageLayoutProps {
  lang: Lang;
  dict: Dict;
  title: string;
  description?: string;
}

export interface HeaderProps {
  lang: Lang;
  pathname: string;
  dict: Dict;
}

export interface FooterProps {
  lang: Lang;
  dict: Dict;
}

export interface LanguageSwitcherProps {
  lang: Lang;
  pathname: string;
  dict: Dict;
}

export interface IconProps {
  /** 图标名（见 Icon.astro 内 SVG 集合） */
  name: 'menu' | 'close';
  /** 尺寸，默认 24（design-spec §8：16/20/24/40 四档） */
  size?: 16 | 20 | 24 | 40;
  title?: string;
}
