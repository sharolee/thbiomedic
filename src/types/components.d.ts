/* ==========================================================================
   组件 Props 类型（components.d.ts）— architecture.md §3.2 组件规范
   C4：组件 Props 必须有 TypeScript 接口，严格模式，禁止 any
   ========================================================================== */

import type { Category, Product, NewsItem } from './content';
import type { Dict, Lang, HeroSlideDict } from './dictionary';

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

/** 图标名（见 Icon.astro 内 SVG 集合） */
export type IconName =
  | 'menu'
  | 'close'
  | 'search'
  | 'chevron-down'
  | 'arrow-right'
  | 'check'
  | 'phone'
  | 'mail'
  | 'map-pin'
  | 'play'
  | 'download'
  | 'file'
  | 'image'
  | 'external'
  | 'linkedin'
  | 'facebook'
  | 'alert'
  | 'refresh'
  | 'calendar'
  | 'shield';

export interface IconProps {
  name: IconName;
  /** 尺寸，默认 24（design-spec §8：16/20/24/40 四档） */
  size?: 16 | 20 | 24 | 40;
  title?: string;
  /** 附加类名（仅图标旋转等装饰性场景） */
  class?: string;
}

export interface ButtonProps {
  /** 变体（design-spec §6.1） */
  variant?: 'primary' | 'secondary' | 'gradient' | 'link';
  /** 传入则渲染 <a>，否则渲染 <button> */
  href?: string;
  type?: 'button' | 'submit';
  disabled?: boolean;
  loading?: boolean;
  /** 外链：target=_blank + rel=noopener */
  external?: boolean;
  icon?: IconName;
  /** 附加类名（与变体类合并） */
  class?: string;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbsProps {
  lang: Lang;
  homeLabel: string;
  ariaLabel: string;
  trail: BreadcrumbItem[];
}

export interface BannerProps {
  lang: Lang;
  title: string;
  subtitle?: string;
  homeLabel: string;
  ariaLabel: string;
  trail: BreadcrumbItem[];
  /** 可选背景图（public/assets 下相对路径） */
  image?: string;
}

export interface EmptyStateProps {
  title: string;
  body?: string;
  icon?: IconName;
}

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  linkHref?: string;
  linkLabel?: string;
}

export interface PaginationProps {
  current: number;
  total: number;
  /** 已含语言前缀的基础路径 */
  baseHref: string;
  prevLabel: string;
  nextLabel: string;
  /** 含 {page} 占位变量的页码标签 */
  pageLabel: string;
}

export interface ProductCardProps {
  product: Product;
  lang: Lang;
}

export interface CategoryCardProps {
  category: Category;
  lang: Lang;
  /** 空分类「筹备中」标签文案 */
  comingSoonLabel: string;
}

export interface NewsCardProps {
  item: NewsItem;
}

export interface HeroProps {
  lang: Lang;
  slides: HeroSlideDict[];
  ariaLabel: string;
  /** 含 {current}/{total} 占位变量的指示点标签 */
  slideLabel: string;
}

export interface TrustBarProps {
  title: string;
  items: string[];
}

export interface PromoVideoProps {
  title: string;
  subtitle: string;
  /** 素材缺失占位文案 */
  placeholder: string;
  playLabel: string;
  /** 视频文件路径（public/assets 下），缺失则不渲染 <video> */
  videoSrc?: string;
}

export interface ContactFormProps {
  dict: Dict;
  /** 来源记录（分类/产品 slug），写入表单隐藏字段 */
  sourceSlug?: string;
}

export interface NewsListProps {
  items: NewsItem[];
  emptyTitle: string;
  emptyBody: string;
  emptyActionLabel?: string;
  emptyActionHref?: string;
}

export interface CategoryGridProps {
  categories: Category[];
  lang: Lang;
  comingSoonLabel: string;
  emptyTitle: string;
  emptyBody: string;
  emptyActionLabel: string;
  emptyActionHref: string;
}

export interface ProductGridProps {
  products: Product[];
  lang: Lang;
  emptyTitle: string;
  emptyBody: string;
  emptyActionLabel: string;
  emptyActionHref: string;
}

export interface SearchProps {
  lang: Lang;
  dict: Dict;
}
