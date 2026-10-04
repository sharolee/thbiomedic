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

const dicts: Record<Lang, Dict> = {
  zh: { common: zhCommon, home: zhHome },
  en: { common: enCommon, home: enHome },
};

export function getDict(lang: Lang): Dict {
  return dicts[lang];
}

export function loadHomeDict(lang: Lang) {
  return dicts[lang];
}
