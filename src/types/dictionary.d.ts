/* ==========================================================================
   字典类型（dictionary.d.ts）— 对应 src/content/{zh,en}/ 字典文件结构
   依据：docs/i18n/key-convention.md（键命名）、content-model.md §3（页面区块）
   修改字典后需同步本文件；typecheck 强制一致（architecture.md C4/C7）
   ========================================================================== */

export type Lang = 'zh' | 'en';

export interface NavDict {
  aria_label: string;
  home: string;
  about: string;
  products: string;
  resources: string;
  news: string;
  contact: string;
}

export interface FooterDict {
  brand: string;
  tagline: string;
  column_about: string;
  column_products: string;
  column_resources: string;
  column_contact: string;
  copyright: string;
  icp: string;
}

export interface LangSwitcherDict {
  label: string;
  /** 中文站当前语言短标签（「中」） */
  zh: string;
  /** 英文站指向中文的链接标签（「CN」） */
  cn: string;
  en: string;
  aria_switch_zh: string;
  aria_switch_en: string;
}

export interface CommonDict {
  nav: NavDict;
  footer: FooterDict;
  lang_switcher: LangSwitcherDict;
  skip_link: string;
  menu_open: string;
  menu_close: string;
  common: {
    not_found_body: string;
    back_home: string;
  };
}

export interface HomeDict {
  hero: {
    title: string;
    subtitle: string;
    cta: string;
  };
}

/** 全量字典：所有语言共用同一结构（键集合一致由 i18n:check 强制） */
export interface Dict {
  common: CommonDict;
  home: HomeDict;
}
