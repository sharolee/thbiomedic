/* ==========================================================================
   搜索索引构建（search-index.ts）— build-plan §3-D3 / page-structure §0.3
   构建期为每语言生成全站索引（页面/分类/产品/下载/视频），由搜索页端点
   输出为静态 JSON，客户端按 query 过滤渲染。文案一律来自字典（C1），
   URL 一律经 utils/url.ts 生成（C2）。
   ========================================================================== */

import type { Lang } from '../types/dictionary';
import { getDict } from './i18n';
import { getCategories, getProducts, getDownloads, getVideos } from './content';
import {
  getHomePath,
  getAboutPath,
  getProductsPath,
  getCategoryPath,
  getProductPath,
  getNewsPath,
  getDownloadsPath,
  getVideosPath,
  getVideoCategoryPath,
  getContactPath,
} from './url';

export interface SearchEntry {
  url: string;
  title: string;
  desc?: string;
  /** 结果分组标签（构建期从字典取值） */
  sectionLabel: string;
}

export function buildSearchIndex(lang: Lang): SearchEntry[] {
  const dict = getDict(lang);
  const t = dict.common;
  const entries: SearchEntry[] = [];

  /* 主导航页面 */
  entries.push({ url: getHomePath(lang), title: t.nav.home, sectionLabel: t.nav.home });
  entries.push({ url: getAboutPath(lang), title: dict.about.banner.title, desc: dict.about.profile.para_1, sectionLabel: t.nav.about });
  entries.push({ url: getProductsPath(lang), title: dict.productsIndex.banner.title, desc: dict.productsIndex.intro, sectionLabel: t.nav.products });
  entries.push({ url: getDownloadsPath(lang), title: dict.resources.downloads.banner.title, desc: dict.resources.downloads.banner.subtitle, sectionLabel: t.nav.resources_downloads });
  entries.push({ url: getVideosPath(lang), title: dict.resources.videos.banner.title, desc: dict.resources.videos.banner.subtitle, sectionLabel: t.nav.resources_videos });
  entries.push({ url: getNewsPath(lang), title: dict.news.banner.title, sectionLabel: t.nav.news });
  entries.push({ url: getContactPath(lang), title: dict.contact.banner.title, desc: dict.contact.banner.subtitle, sectionLabel: t.nav.contact });

  /* 产品分类：一级 + 二级 */
  for (const cat of getCategories(lang)) {
    entries.push({ url: getCategoryPath(cat.slug, lang), title: cat.name, desc: cat.desc, sectionLabel: t.nav.products });
    for (const child of cat.children ?? []) {
      entries.push({ url: getCategoryPath(child.slug, lang), title: child.name, sectionLabel: t.nav.products });
    }
  }

  /* 产品详情 */
  for (const p of getProducts(lang)) {
    entries.push({ url: getProductPath(p.categorySlug, p.slug, lang), title: p.name, desc: p.desc, sectionLabel: t.nav.products });
  }

  /* 下载资料 */
  for (const d of getDownloads(lang)) {
    entries.push({ url: getDownloadsPath(lang), title: d.title, desc: d.size, sectionLabel: t.nav.resources_downloads });
  }

  /* 视频 */
  for (const v of getVideos(lang).items) {
    entries.push({ url: getVideoCategoryPath(v.categorySlug, lang), title: v.title, sectionLabel: t.nav.resources_videos });
  }

  return entries;
}
