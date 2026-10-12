/* ==========================================================================
   内容数据实体类型（content.d.ts）— 对应 src/content/{lang}/data/*.json
   依据：docs/i18n/content-model.md（唯一事实来源）
   当前仅为骨架定义；字段填充由 W3-3 内容任务按 content-model 逐实体核对
   ========================================================================== */

/** 通用媒体引用（src 为 public/assets/ 下相对路径，无语言属性） */
export interface MediaRef {
  src: string;
  alt: string;
}

/**
 * 素材 key 引用（ADR-003 §2：数据文件只引 assets.ts 的 key，禁止散落完整 URL）。
 * key -> 原站 URL 由 assetUrl(key) 在页面/组件层解析。
 */
export interface AssetRef {
  key: string;
  alt: string;
}

/** 产品分类：一级含 children 二级（content-model.md §4） */
export interface Category {
  slug: string;
  name: string;
  desc?: string;
  /** 素材 key 引用（ADR-003 §2），由组件经 assetUrl 解析 */
  banner?: AssetRef;
  order?: number;
  children?: ChildCategory[];
}

export interface ChildCategory {
  slug: string;
  name: string;
  hasProducts: boolean;
}

/** 产品（content-model.md §5） */
export interface Product {
  slug: string;
  categorySlug: string;
  name: string;
  desc?: string;
  images?: AssetRef[];
  video?: string;
  order?: number;
}

/** 新闻（预留，当前为空数组） */
export interface NewsItem {
  slug: string;
  title: string;
  date: string;
  summary?: string;
  category?: string;
}

/** 新闻数据（预留，当前为空；content-model.md §6） */
export interface NewsData {
  categories: string[];
  items: NewsItem[];
}

/** 视频数据（content-model.md §7） */
export interface VideosData {
  categories: VideoCategory[];
  items: VideoItem[];
}

/** 下载资源（content-model.md §7；file 字段中英可不同，已核实例外） */
export interface Download {
  slug: string;
  title: string;
  file: string;
  size: string;
}

/** 视频栏目与视频（content-model.md §7） */
export interface VideoCategory {
  slug: string;
  name: string;
}

export interface VideoItem {
  slug: string;
  categorySlug: string;
  title: string;
  desc?: string;
  /** assets.ts 素材 key（ADR-003 §2：数据只引 key，经 assetUrl 解析） */
  file: string;
  poster?: string;
}

/** 联系信息（content-model.md §8） */
export interface ContactInfo {
  phone: string;
  phoneExt?: string;
  email: string;
  address: string;
  wechatQr?: MediaRef;
}

/** 荣誉资质（content-model.md §9；证书图 key 中英可不同，已核实例外） */
export interface Certificate {
  slug: string;
  title: string;
  image: AssetRef;
  order?: number;
}
