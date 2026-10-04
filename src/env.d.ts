/// <reference types="astro/client" />

interface ImportMetaEnv {
  /** 生产站点根域名（sitemap / hreflang 绝对 URL，architecture.md §6） */
  readonly PUBLIC_SITE_URL?: string;
  /** 默认语言（hreflang x-default 指向，ADR-002 §3.4） */
  readonly PUBLIC_DEFAULT_LANG?: string;
  /** 构建时间戳（注入页面注释） */
  readonly BUILD_TIMESTAMP?: string;
  /** 表单后端端点（独立决策，预留） */
  readonly PUBLIC_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
