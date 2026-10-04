/* ==========================================================================
   字典加载（i18n.ts）— 单语言字典静态加载（ADR-002 §3.2 语言无关键）
   字典文件按语言分目录（src/content/{zh,en}/），键集合一致性由 i18n:check 强制
   新增页面字典文件后，在本文件登记并在 dictionary.d.ts 补类型
   ========================================================================== */

import type { Dict, Lang } from '../types/dictionary';
import zhCommon from '../content/zh/common.json';
import enCommon from '../content/en/common.json';
import zhHome from '../content/zh/pages/home.json';
import enHome from '../content/en/pages/home.json';
import zhProductsIndex from '../content/zh/pages/products-index.json';
import enProductsIndex from '../content/en/pages/products-index.json';
import zhProductsCategory from '../content/zh/pages/products-category.json';
import enProductsCategory from '../content/en/pages/products-category.json';
import zhProductDetail from '../content/zh/pages/product-detail.json';
import enProductDetail from '../content/en/pages/product-detail.json';
import zhNews from '../content/zh/pages/news.json';
import enNews from '../content/en/pages/news.json';
import zhAbout from '../content/zh/pages/about.json';
import enAbout from '../content/en/pages/about.json';
import zhContact from '../content/zh/pages/contact.json';
import enContact from '../content/en/pages/contact.json';
import zhResources from '../content/zh/pages/resources.json';
import enResources from '../content/en/pages/resources.json';

const dicts: Record<Lang, Dict> = {
  zh: {
    common: zhCommon,
    home: zhHome,
    productsIndex: zhProductsIndex,
    productsCategory: zhProductsCategory,
    productDetail: zhProductDetail,
    news: zhNews,
    about: zhAbout,
    contact: zhContact,
    resources: zhResources,
  },
  en: {
    common: enCommon,
    home: enHome,
    productsIndex: enProductsIndex,
    productsCategory: enProductsCategory,
    productDetail: enProductDetail,
    news: enNews,
    about: enAbout,
    contact: enContact,
    resources: enResources,
  },
};

export function getDict(lang: Lang): Dict {
  return dicts[lang];
}

/** W3-1 遗留别名：加载完整字典（含首页） */
export function loadHomeDict(lang: Lang): Dict {
  return dicts[lang];
}
