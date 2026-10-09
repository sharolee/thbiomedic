/* ==========================================================================
   内容数据访问（content.ts）— 读取 src/content/{lang}/data/*.json 结构化数据
   依据：docs/i18n/content-model.md（唯一事实来源）、architecture.md §3.3
   当前数据文件为结构空壳（空数组/空对象），条目由 W3-3 内容任务填充；
   组件层通过本模块取数，数据为空时走空态渲染。
   ========================================================================== */

import type { Lang } from '../types/dictionary';
import type {
  Category,
  Certificate,
  ChildCategory,
  ContactInfo,
  Download,
  NewsData,
  Product,
  VideosData,
} from '../types/content';

import zhCategories from '../content/zh/data/categories.json';
import enCategories from '../content/en/data/categories.json';
import zhProducts from '../content/zh/data/products.json';
import enProducts from '../content/en/data/products.json';
import zhNews from '../content/zh/data/news.json';
import enNews from '../content/en/data/news.json';
import zhDownloads from '../content/zh/data/downloads.json';
import enDownloads from '../content/en/data/downloads.json';
import zhVideos from '../content/zh/data/videos.json';
import enVideos from '../content/en/data/videos.json';
import zhCertificates from '../content/zh/data/certificates.json';
import enCertificates from '../content/en/data/certificates.json';
import zhContact from '../content/zh/data/contact.json';
import enContact from '../content/en/data/contact.json';

type DataRecord<T> = Record<Lang, T>;

/** 数据文件当前为空数组/空对象（W3-3 填充），显式标注类型避免 never[] 推断 */
const categories: DataRecord<Category[]> = {
  zh: zhCategories as Category[],
  en: enCategories as Category[],
};

const products: DataRecord<Product[]> = {
  zh: zhProducts as Product[],
  en: enProducts as Product[],
};

const news: DataRecord<NewsData> = {
  zh: zhNews as NewsData,
  en: enNews as NewsData,
};

const downloads: DataRecord<Download[]> = {
  zh: zhDownloads as Download[],
  en: enDownloads as Download[],
};

const videos: DataRecord<VideosData> = {
  zh: zhVideos as VideosData,
  en: enVideos as VideosData,
};

const certificates: DataRecord<Certificate[]> = {
  zh: zhCertificates as Certificate[],
  en: enCertificates as Certificate[],
};

/** 联系信息数据为空对象时视为「未填充」，返回 null（W3-3 填充后返回实体） */
function isContactFilled(value: unknown): value is ContactInfo {
  return typeof value === 'object' && value !== null && Object.keys(value).length > 0;
}

const contact: DataRecord<ContactInfo | null> = {
  zh: isContactFilled(zhContact) ? (zhContact as ContactInfo) : null,
  en: isContactFilled(enContact) ? (enContact as ContactInfo) : null,
};

export function getCategories(lang: Lang): Category[] {
  return categories[lang];
}

export function getProducts(lang: Lang): Product[] {
  return products[lang];
}

export function getNews(lang: Lang): NewsData {
  return news[lang];
}

export function getNewsItems(lang: Lang): NewsData['items'] {
  return news[lang].items;
}

export function getDownloads(lang: Lang): Download[] {
  return downloads[lang];
}

export function getVideos(lang: Lang): VideosData {
  return videos[lang];
}

export function getCertificates(lang: Lang): Certificate[] {
  return certificates[lang];
}

export function getContact(lang: Lang): ContactInfo | null {
  return contact[lang];
}

/** 按 slug 取分类（getStaticPaths 用） */
export function getCategoryBySlug(lang: Lang, slug: string): Category | undefined {
  return categories[lang].find((c) => c.slug === slug);
}

/** 该 slug 是否为一级分类 slug（`[category]` 路由一/二级分流判定用） */
export function isFirstLevelSlug(lang: Lang, slug: string): boolean {
  return categories[lang].some((c) => c.slug === slug);
}

/** 一级分类下的二级子分类（保持 data 中的书写顺序） */
export function getChildCategories(lang: Lang, parentSlug: string): ChildCategory[] {
  return getCategoryBySlug(lang, parentSlug)?.children ?? [];
}

/** 按二级 slug 定位所属分类，返回一级父分类与二级节点 */
export function findChildCategory(
  lang: Lang,
  childSlug: string,
): { parent: Category; child: ChildCategory } | undefined {
  for (const parent of categories[lang]) {
    const child = parent.children?.find((c) => c.slug === childSlug);
    if (child) return { parent, child };
  }
  return undefined;
}

/** 按分类 slug 过滤产品 */
export function getProductsByCategory(lang: Lang, categorySlug: string): Product[] {
  return products[lang].filter((p) => p.categorySlug === categorySlug);
}

/** 按分类+产品 slug 取产品详情 */
export function getProductBySlug(lang: Lang, categorySlug: string, productSlug: string): Product | undefined {
  return products[lang].find((p) => p.slug === productSlug && p.categorySlug === categorySlug);
}
