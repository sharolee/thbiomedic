/* ==========================================================================
   组件 Props 类型（components.d.ts）— architecture.md §3.2 组件规范
   C4：组件 Props 必须有 TypeScript 接口，严格模式，禁止 any
   ========================================================================== */

import type { Category, Product, NewsItem } from './content';
import type { Dict, Lang, BrandCardDict, StatItemDict } from './dictionary';

export interface PageLayoutProps {
  lang: Lang;
  dict: Dict;
  title: string;
  description?: string;
  /** 无语言变体的页面（如 404）置 false 以不输出 hreflang（R-S7 m-4） */
  hreflangLinks?: boolean;
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
    /** 额外透传到根元素的自定义 data-* 属性（如搜索页的 data-search-empty） */
    [key: `data-${string}`]: string | boolean | undefined;
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

export interface SubCategoryItem {
  slug: string;
  name: string;
  /** 该二级分类下的产品条数（0 = 空态页） */
  productCount: number;
}

export interface SubCategoryListProps {
  lang: Lang;
  items: SubCategoryItem[];
  /** 导航 aria-label（本地化文案） */
  ariaLabel: string;
  /** 产品条数标签模板，含 {count} 占位 */
  countLabel: string;
  /** 空分类「筹备中」标签文案 */
  comingSoonLabel: string;
  emptyTitle: string;
  emptyBody: string;
  emptyActionLabel: string;
  emptyActionHref: string;
}

export interface NewsCardProps {
  item: NewsItem;
}

export interface HeroProps {
  lang: Lang;
  eyebrow: string;
  title: string;
  lead: string;
  ctaPrimary: string;
  ctaPrimaryHref: string;
  ctaSecondary: string;
  ctaSecondaryHref: string;
  badge: string;
  /** 视频素材完整 URL（经 utils/assets.ts 映射，ADR-003 原站直引） */
  videoSrc: string;
  /** 视频 poster 完整 URL（assets.ts 映射） */
  posterSrc: string;
  /** 视频失效时露出的品牌色兜底底文案说明（a11y） */
  ariaLabel: string;
}

export interface BrandLinesProps {
  lang: Lang;
  kicker: string;
  title: string;
  subtitle: string;
  cards: BrandCardDict[];
  moreLabel: string;
}

export interface StatsBarProps {
  kicker: string;
  items: StatItemDict[];
}

export interface TrustBarProps {
  title: string;
  items: string[];
}

export interface PromoVideoProps {
  title: string;
  subtitle: string;
  /** 浏览器不支持 <video> 时的降级文案 */
  placeholder: string;
  playLabel: string;
  /** 视频素材完整 URL（经 utils/assets.ts 映射，ADR-003 原站直引）；缺失则渲染占位块 */
  videoSrc?: string;
}

export interface ContactFormProps {
  dict: Dict;
  /** 来源记录（分类/产品 slug），写入表单隐藏字段 */
  sourceSlug?: string;
  /** 收件邮箱（ADR-005 mailto 方案；缺省则渲染无收件人的降级态） */
  email?: string;
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
