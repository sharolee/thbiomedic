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

/** 产品分类：一级含 children 二级（content-model.md §4） */
export interface Category {
  slug: string;
  name: string;
  desc?: string;
  banner?: MediaRef;
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
  images?: MediaRef[];
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
  social?: {
    linkedin?: string;
    facebook?: string;
  };
}

/** 荣誉资质（content-model.md §9；image.src 中英可不同） */
export interface Certificate {
  slug: string;
  title: string;
  image: MediaRef;
  order?: number;
}
