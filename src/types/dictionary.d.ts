/* ==========================================================================
   字典类型（dictionary.d.ts）— 对应 src/content/{zh,en}/ 字典文件结构
   依据：docs/i18n/key-convention.md（键命名）、content-model.md §3（页面区块）
   修改字典后需同步本文件；typecheck 强制一致（architecture.md C4/C7）
   注意：字典内禁止数组（i18n:check 键名校验只允许 [a-z0-9_.]），
   多实例文案用编号键（slide_1 / item_1，见 key-convention §3.1 正例）。
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
  /** 产品中心下拉「全部产品」 */
  products_all: string;
  /** 资源下拉「下载资料」 */
  resources_downloads: string;
  /** 资源下拉「视频中心」 */
  resources_videos: string;
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
  /** 公众号二维码占位文案 */
  qr_label: string;
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

export interface BreadcrumbDict {
  home: string;
}

export interface CommonButtonsDict {
  learn_more: string;
  view_all: string;
  load_more: string;
  loading: string;
  retry: string;
  not_found_title: string;
  not_found_body: string;
  back_home: string;
  load_failed_title: string;
  load_failed_body: string;
}

export interface SearchDict {
  aria_label: string;
  placeholder: string;
  open_label: string;
  close_label: string;
  submit: string;
  results_title: string;
  empty_title: string;
  /** 含 {query} 占位变量 */
  empty_body: string;
  no_js_hint: string;
}

export interface FormDict {
  salutation: string;
  company: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  message: string;
  submit: string;
  /** 必填提示（带 * 说明） */
  note: string;
  error_required: string;
  error_email: string;
  error_submit: string;
  success_title: string;
  success_body: string;
}

export interface PaginationDict {
  prev: string;
  next: string;
  /** 含 {page} 占位变量 */
  page: string;
}

export interface CommonDict {
  nav: NavDict;
  footer: FooterDict;
  lang_switcher: LangSwitcherDict;
  breadcrumb: BreadcrumbDict;
  search: SearchDict;
  form: FormDict;
  pagination: PaginationDict;
  skip_link: string;
  menu_open: string;
  menu_close: string;
  common: CommonButtonsDict;
}

/* ── 首页（pages/home.json） ─────────────────────────────── */
export interface HeroSlideDict {
  brand: string;
  title: string;
  subtitle: string;
  cta: string;
  /** 语义路径（无语言前缀，渲染时经 utils/url.ts 套前缀） */
  href: string;
}

export interface HomeDict {
  meta: {
    title: string;
    description: string;
  };
  hero: {
    aria_label: string;
    /** 含 {current}/{total} 占位变量（轮播指示点 aria-label） */
    slide_label: string;
    slide_1: HeroSlideDict;
    slide_2: HeroSlideDict;
    slide_3: HeroSlideDict;
  };
  trust_bar: {
    title: string;
    item_1: string;
    item_2: string;
    item_3: string;
    item_4: string;
    item_5: string;
    item_6: string;
    item_7: string;
  };
  product_entries: {
    title: string;
    subtitle: string;
    coming_soon: string;
    empty_title: string;
    empty_body: string;
    cta: string;
    view_all: string;
  };
  about_summary: {
    title: string;
    body: string;
    cta: string;
  };
  promo_video: {
    title: string;
    subtitle: string;
    /** 视频素材缺失时的占位文案 */
    placeholder: string;
    play_label: string;
  };
  contact_cta: {
    title: string;
    body: string;
    cta: string;
  };
}

/* ── 产品中心一级页（pages/products-index.json） ─────────── */
export interface ProductsIndexDict {
  meta: {
    title: string;
    description: string;
  };
  banner: {
    title: string;
    subtitle: string;
  };
  intro: string;
  coming_soon: string;
  empty_title: string;
  empty_body: string;
  cta: string;
}

/* ── 产品二级分类页（pages/products-category.json） ───────── */
export interface ProductsCategoryDict {
  meta: {
    title: string;
    description: string;
  };
  empty_title: string;
  empty_body: string;
  cta: string;
  brochure_link: string;
  inquiry_title: string;
}

/* ── 产品详情页（pages/product-detail.json） ──────────────── */
export interface ProductDetailDict {
  meta: {
    title: string;
    description: string;
  };
  empty_title: string;
  empty_body: string;
  cta: string;
  inquiry_title: string;
}

/* ── 新闻页（pages/news.json） ────────────────────────────── */
export interface NewsDict {
  meta: {
    title: string;
    description: string;
  };
  banner: {
    title: string;
    subtitle: string;
  };
  empty_title: string;
  empty_body: string;
  contact_link: string;
}

/* ── 关于我们（pages/about.json，骨架） ───────────────────── */
export interface AboutDict {
  meta: {
    title: string;
    description: string;
  };
  banner: {
    title: string;
    subtitle: string;
  };
  skeleton_title: string;
  skeleton_body: string;
  cta: string;
}

/* ── 联系我们（pages/contact.json） ───────────────────────── */
export interface ContactDict {
  meta: {
    title: string;
    description: string;
  };
  banner: {
    title: string;
    subtitle: string;
  };
  form_intro: string;
  info_intro: string;
  social_title: string;
  linkedin: string;
  facebook: string;
}

/* ── 资源（pages/resources.json） ─────────────────────────── */
export interface ResourcesDict {
  downloads: {
    banner: {
      title: string;
      subtitle: string;
    };
    empty_title: string;
    empty_body: string;
  };
  videos: {
    banner: {
      title: string;
      subtitle: string;
    };
    empty_title: string;
    empty_body: string;
  };
}

/** 全量字典：所有语言共用同一结构（键集合一致由 i18n:check 强制） */
export interface Dict {
  common: CommonDict;
  home: HomeDict;
  productsIndex: ProductsIndexDict;
  productsCategory: ProductsCategoryDict;
  productDetail: ProductDetailDict;
  news: NewsDict;
  about: AboutDict;
  contact: ContactDict;
  resources: ResourcesDict;
}
