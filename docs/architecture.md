# 天泓医疗新版官网 - 架构与工程规范

> **适用技术栈**：主选 Astro（ADR-001 推荐），备选 11ty / 纯 HTML + Vite
> **双语架构**：ADR-002（`/zh/`、`/en/` 目录前缀、语言无关键 + 单语言字典）
> **读者**：全栈老欧 / 程序员小欧（页面开发执行者）
> **用途**：直接照做的骨架约定；不包含视觉设计细节（归交互设计师小欧）

---

## 1. 目录结构

```
thbiomedic/                          # 项目根目录（D:\Projects\playground\thbiomedic）
├── .github/                         # GitHub Actions（可选，后续补齐）
├── .vscode/                         # 编辑器共享配置
├── docs/                            # 文档（已有）
│   ├── adr/
│   │   ├── ADR-001-frontend-stack.md
│   │   └── ADR-002-i18n.md
│   ├── architecture.md              # 本文件
│   └── content-inventory.md         # W1-B 盘点基线
├── public/                          # 静态资源（构建后直接复制到 dist/ 根）
│   ├── assets/                      # 图片、视频、PDF（按原站 /uploadfiles/ 结构迁移）
│   │   ├── images/
│   │   ├── videos/
│   │   └── downloads/
│   ├── favicon.ico
│   ├── robots.txt                   # 构建期生成（含 sitemap 引用）
│   └── site.webmanifest             # PWA 清单（可选）
├── src/                             # 源码（核心开发区）
│   ├── content/                     # 双语字典与数据（ADR-002）
│   │   ├── zh/
│   │   │   ├── common.json          # 全站通用：导航、页脚、表单、按钮
│   │   │   ├── pages/               # 页面级文案
│   │   │   │   ├── home.json
│   │   │   │   ├── about.json
│   │   │   │   ├── products-index.json
│   │   │   │   ├── product-detail.json
│   │   │   │   ├── resources.json
│   │   │   │   ├── news.json
│   │   │   │   └── contact.json
│   │   │   └── data/                # 结构化数据（列表渲染用）
│   │   │       ├── categories.json  # 10 个一级分类 + 子分类树
│   │   │       ├── products.json    # 12 个产品详情
│   │   │       └── videos.json      # 视频元数据
│   │   └── en/                      # 英文版（同键、同结构）
│   │       ├── common.json
│   │       ├── pages/...
│   │       └── data/...
│   ├── components/                  # 可复用 UI 组件（Astro 组件 / HTML 片段）
│   │   ├── layout/
│   │   │   ├── Header.astro         # 页头：Logo、导航、语言切换、搜索
│   │   │   ├── Footer.astro         # 页脚：链接、ICP、万户、社交
│   │   │   ├── Banner.astro         # 页横幅（首页轮播 / 内页标题图）
│   │   │   ├── Breadcrumbs.astro    # 面包屑（自动从路由推导）
│   │   │   └── PageLayout.astro     # 页面外壳：<html>、<head>、Header、main、Footer
│   │   ├── ui/
│   │   │   ├── Button.astro
│   │   │   ├── Card.astro           # 产品/视频/下载卡片
│   │   │   ├── Carousel.astro       # 首页品牌轮播（岛屿：client:visible）
│   │   │   ├── Lightbox.astro       # 证书/图片灯箱（岛屿）
│   │   │   ├── VideoPlayer.astro    # 视频播放器（原生 <video> + 海报）
│   │   │   ├── Form.astro           # 在线留言表单（岛屿：client:load）
│   │   │   ├── Search.astro         # 站内搜索（岛屿：client:visible）
│   │   │   ├── LanguageSwitcher.astro # 语言切换器（ADR-002）
│   │   │   └── Icon.astro           # SVG 图标系统
│   │   ├── product/
│   │   │   ├── CategoryNav.astro    # 产品侧边栏分类导航
│   │   │   ├── ProductGrid.astro    # 产品列表网格
│   │   │   └── ProductDetail.astro  # 产品详情页主体
│   │   └── content/
│   │       ├── CertificateCarousel.astro # 荣誉资质轮播（岛屿）
│   │       ├── HistoryTimeline.astro     # 企业发展历程
│   │       └── VideoList.astro           # 视频列表
│   ├── pages/                       # 文件系统路由（Astro）或模板入口（Vite）
│   │   ├── index.astro              # 首页（重定向到 /zh/ 或 /en/）
│   │   ├── zh/                      # 中文站页面
│   │   │   ├── index.astro          # 首页
│   │   │   ├── about/
│   │   │   │   └── index.astro
│   │   │   ├── products/
│   │   │   │   ├── index.astro      # 产品一级分类页
│   │   │   │   ├── [category]/      # 二级分类列表页（动态路由）
│   │   │   │   │   └── index.astro
│   │   │   │   └── [category]/[product]/
│   │   │   │       └── index.astro  # 产品详情页
│   │   │   ├── resources/
│   │   │   │   ├── downloads/
│   │   │   │   │   └── index.astro
│   │   │   │   ├── videos/
│   │   │   │   │   ├── index.astro
│   │   │   │   │   └── [category]/
│   │   │   │   │       └── index.astro
│   │   │   ├── news/
│   │   │   │   └── index.astro
│   │   │   └── contact/
│   │   │       └── index.astro
│   │   └── en/                      # 英文站页面（结构与 zh 完全镜像）
│   │       ├── index.astro
│   │       ├── about/index.astro
│   │       ├── products/...（同 zh）
│   │       ├── resources/...（同 zh）
│   │       ├── news/index.astro
│   │       └── contact/index.astro
│   ├── styles/                      # 全局样式
│   │   ├── global.css               # CSS 变量、Reset、基础排版
│   │   ├── variables.css            # 设计令牌（色值、间距、字体、断点）
│   │   ├── components/              # 组件级样式（按组件名分文件）
│   │   └── utilities.css            # 工具类（如 .sr-only、.container）
│   ├── scripts/                     # 客户端 JS（仅岛屿/交互用）
│   │   ├── carousel.ts
│   │   ├── lightbox.ts
│   │   ├── form-handler.ts
│   │   ├── search.ts
│   │   └── language-switcher.ts
│   ├── utils/                       # 共享工具函数
│   │   ├── i18n.ts                  # 字典加载、键解析、hreflang 生成
│   │   ├── content.ts               # 内容数据查询（分类、产品、视频）
│   │   ├── seo.ts                   # 页面级 meta、JSON-LD、sitemap 生成
│   │   ├── url.ts                   # 路由工具：语言前缀、slug 规范化
│   │   └── assets.ts                # 资源 URL 生成（带 hash/版本）
│   ├── types/                       # TypeScript 类型（字典、内容数据、组件 Props）
│   │   ├── content.d.ts
│   │   ├── dictionary.d.ts
│   │   └── components.d.ts
│   └── env.d.ts                     # 环境变量类型
├── scripts/                         # 构建/部署/校验辅助脚本
│   ├── i18n-check.mjs               # 双语键完整性校验
│   ├── generate-sitemap.mjs         # sitemap.xml + hreflang 生成
│   ├── asset-inventory.mjs          # 素材清单核对
│   └── redirect-map.mjs             # 旧 .aspx URL → 新路径 301 映射表
├── astro.config.mjs                 # Astro 配置（主选栈）
├── vite.config.ts                   # Vite 配置（备选栈/通用）
├── package.json
├── tsconfig.json
├── .gitignore
├── .editorconfig
├── .nvmrc                           # Node 版本锁定（建议 20 LTS）
└── README.md                        # 项目简述 + 快速开始
```

---

## 2. 构建与本地预览命令

> **所有命令在项目根目录（`D:\Projects\playground\thbiomedic`）运行**
> **Node 版本**：`nvm use`（读取 `.nvmrc`，建议 Node 20 LTS）
> **包管理器**：`npm`（或 `pnpm`，统一用 `package.json` 中的 `packageManager` 字段）

### 2.1 依赖安装（首次/依赖变更后）

```bash
# 推荐：使用 pnpm（速度快、磁盘省）
pnpm install

# 或 npm
npm install
```

### 2.2 开发服务器（热更新）

```bash
# Astro 主选栈
pnpm dev
# 或：npm run dev
# 启动：http://localhost:4321  （Astro 默认端口）
# 支持：热模块替换、TypeScript 检查、内容变更自动重载
```

```bash
# 纯 HTML + Vite 备选栈（如回退方案 A）
pnpm dev:vite
# 启动：http://localhost:5173  （Vite 默认端口）
```

### 2.3 生产构建（产出纯静态 `dist/`）

```bash
# Astro 主选栈
pnpm build
# 或：npm run build
# 产出：dist/ 目录（含 /zh/、/en/ 完整静态站点）
# 包含：HTML、CSS、JS（仅岛屿）、图片（优化后）、sitemap.xml、robots.txt
```

```bash
# 纯 HTML + Vite 备选栈
pnpm build:vite
```

### 2.4 本地预览构建产物（生产模式验收）

```bash
# Astro
pnpm preview
# 启动：http://localhost:4321  （预览 dist/ 静态文件）

# Vite
pnpm preview:vite
# 启动：http://localhost:4173
```

### 2.5 双语完整性校验（CI 必跑 / 本地开发自查）

```bash
# 校验：两语言字典键集合完全一致、无空值
pnpm i18n:check
# 失败即报错，输出缺失键列表
```

### 2.6 素材清单核对（W1-B 基线对齐）

```bash
# 对比 public/assets/ 与 docs/content-inventory.md §5 清单
pnpm asset:inventory
# 输出：缺失文件、多余文件、大小不匹配
```

### 2.7 类型检查（TypeScript）

```bash
pnpm typecheck
# 等价：tsc --noEmit
```

### 2.8 代码风格检查（ESLint + Prettier）

```bash
pnpm lint
pnpm format:check
pnpm format:write   # 自动修复
```

### 2.9 完整验收流水线（本地跑通即可提交）

```bash
pnpm check:all
# 依次执行：typecheck → lint → i18n:check → build → asset:inventory
# 任一失败即阻断
```

### 2.10 package.json scripts 参考（可直接复制）

```json
{
  "scripts": {
    "dev": "astro dev",
    "dev:vite": "vite",
    "build": "astro build",
    "build:vite": "vite build",
    "preview": "astro preview",
    "preview:vite": "vite preview",
    "i18n:check": "node scripts/i18n-check.mjs",
    "asset:inventory": "node scripts/asset-inventory.mjs",
    "generate:sitemap": "node scripts/generate-sitemap.mjs",
    "typecheck": "tsc --noEmit",
    "lint": "eslint \"src/**/*.{ts,tsx,astro}\"",
    "format:check": "prettier --check \"src/**/*.{ts,tsx,astro,css,json,md}\"",
    "format:write": "prettier --write \"src/**/*.{ts,tsx,astro,css,json,md}\"",
    "check:all": "npm run typecheck && npm run lint && npm run i18n:check && npm run build && npm run asset:inventory"
  }
}
```

---

## 3. 页面与组件划分原则

> **核心原则**：**页面即路由入口，组件即复用单元，数据即字典键**。开发按「页面 → 组件 → 字典」三层分工，严禁在页面写业务逻辑、严禁在组件硬编码文案。

### 3.1 页面层（`src/pages/`）

| 职责 | 只做 | 不做 |
|---|---|---|
| 路由入口 | 定义 URL 结构、接收路由参数（`[category]`、`[product]`） | 直接写 HTML 结构 |
| 数据获取 | 从 `src/content/` 读取当前语言字典 + 结构化数据 | 硬编码任何文案、URL、图片路径 |
| 组合 | 引入布局组件（`PageLayout`）、区块组件（`Hero`、`ProductGrid` 等） | 写样式、写交互逻辑 |
| SEO | 设置页面级 `<title>`、`<meta>`、JSON-LD、hreflang（调用 `utils/seo.ts`） | 手写 `<head>` 标签 |

**页面文件命名规范**：
- 静态页：`index.astro`（目录即路由）
- 动态列表：`[category]/index.astro` → 生成 `/zh/products/easy-lock/`
- 动态详情：`[category]/[product]/index.astro` → 生成 `/zh/products/easy-lock/ankle-splint/`
- **中英文目录结构完全镜像**，仅语言前缀不同

### 3.2 组件层（`src/components/`）

| 组件类型 | 复用范围 | Props 设计 | 交互方式 |
|---|---|---|---|
| **布局类**（`layout/`） | 全站 | 最小化：仅传「当前语言、当前路径、字典片段」 | 无（纯展示） |
| **UI 基础类**（`ui/`） | 全站 | 语义化 Props：`variant`、`size`、`href`、`label`、`icon` | 岛屿按需 `client:visible/load` |
| **业务区块类**（`product/`、`content/`） | 多页面 | 数据驱动：传「类型化数据对象」（来自 `utils/content.ts`） | 交互委托岛屿组件 |
| **岛屿组件**（标记 `client:*`） | 局部 | 自包含：自身管理状态、事件、生命周期 | 原生 TS/JS，无框架运行时 |

**组件编写规范**：
1. **零硬编码文案**——所有可见文本从 Props 接收的字典对象取值（`dict.hero.title`）
2. **零硬编码路径**——链接、图片、视频 URL 均由 `utils/assets.ts`、`utils/url.ts` 生成
3. **单一职责**——一个组件只渲染一个语义区块；复杂页面由多个区块组件组合
4. **类型优先**——Props 定义在 `types/components.d.ts`，字典键在 `types/dictionary.d.ts`
5. **样式隔离**——Astro `<style>` 作用域 / CSS Modules / BEM 命名，不污染全局

### 3.3 数据/字典层（`src/content/` + `src/utils/content.ts`）

| 数据类型 | 存储位置 | 访问方式 | 更新流程 |
|---|---|---|---|
| **页面文案**（标题、段落、按钮、Alt） | `content/{zh,en}/pages/*.json` | `getDict(lang).pages.home.hero.title` | 修改 JSON → `pnpm i18n:check` → 提交 |
| **结构化列表**（分类树、产品列表、视频列表） | `content/{zh,en}/data/*.json` | `getProducts(lang)`、`getCategories(lang)` | 同上；结构变更需同步 TS 类型 |
| **全站通用**（导航、页脚、表单、按钮） | `content/{zh,en}/common.json` | `getDict(lang).common.nav.products` | 同上 |
| **媒体元数据**（视频标题/描述/封面、PDF 标题） | `content/{zh,en}/data/videos.json` 等 | `getVideos(lang)` | 同上 |

**字典键命名**：见 ADR-002 §5.2（语义化、点分层、英文小写）。

**类型同步**：修改 JSON 后，运行 `pnpm typecheck` 会提示类型不匹配；在 `types/dictionary.d.ts` 中维护字典类型定义（可用工具自动生成，见脚本）。

### 3.4 样式架构（`src/styles/`）

| 层级 | 文件 | 作用 | 规范 |
|---|---|---|---|
| **设计令牌** | `variables.css` | 色值、字体、间距、断点、阴影、圆角、z-index、过渡时长 | 仅 CSS 变量（`--color-primary`、`--space-md`），不写规则 |
| **全局基础** | `global.css` | Reset、HTML/Body 基础、排版默认、无障碍基类 | 仅元素选择器、通用工具类 |
| **组件样式** | `components/*.css` | 每个组件对应一个同名 CSS 文件 | BEM 命名（`.card__image`、`.card--featured`），不跨组件引用 |
| **工具类** | `utilities.css` | 布局、显隐、间距、文本对齐等原子类 | 以 `u-` 前缀（`.u-flex`、`.u-mt-lg`） |

**引入顺序**（在 `PageLayout.astro` 或全局入口）：
```astro
---
import '../styles/variables.css';
import '../styles/global.css';
import '../styles/utilities.css';
---
<!-- 组件样式由各组件自行 <style> 引入或 scoped -->
```

**响应式断点**（移动优先，`variables.css` 定义）：
```css
--bp-sm: 640px;   /* 平板竖屏 */
--bp-md: 768px;   /* 平板横屏 */
--bp-lg: 1024px;  /* 桌面 */
--bp-xl: 1280px;  /* 大屏 */
--bp-2xl: 1536px; /* 超宽 */
```

### 3.5 客户端脚本（`src/scripts/`）

仅用于**岛屿组件**的交互增强，原则：
- **无框架运行时**——原生 TypeScript（ESM），编译后直接给浏览器跑
- **单一职责**——一个文件一个交互（轮播、灯箱、表单提交、搜索建议、语言切换记忆）
- **渐进增强**——无 JS 也能基本可用（表单可降级为原生提交、轮播可降级为滚动容器）
- **事件委托**——尽量用 `document.addEventListener` 而非每实例绑定
- **无副作用导入**——脚本只导出函数/类，不自执行；由岛屿组件在 `onMount` 中初始化

---

## 4. 关键约定（开发必读，违者构建失败）

| # | 约定 | 校验方式 |
|---|---|---|
| C1 | **所有可见文案必须来自字典**，禁止在 `.astro`/`.tsx`/`.ts` 中写死中文/英文 | `i18n:check` 扫描源码中的中文字符串（排除字典文件） |
| C2 | **所有链接/资源 URL 必须用工具函数生成**，禁止拼字符串 | ESLint 规则 `no-hardcoded-urls`（自定义） |
| C3 | **每页面必须输出 hreflang 双向链接 + x-default** | 单元测试 `seo.test.ts` 覆盖 `PageLayout` |
| C4 | **组件 Props 必须定义 TypeScript 接口**，禁止 `any` | `tsc --noEmit` 严格模式 |
| C5 | **岛屿组件必须显式标记 `client:visible` 或 `client:load`**，无标记视为纯静态 | Astro 编译期报错 |
| C6 | **图片必须经构建管线优化**（`astro:assets` 或 Vite 插件），禁止直链 `public/` 大图 | `asset:inventory` 核对体积与格式 |
| C7 | **新增页面/修改结构化数据必须同步更新两语言字典**，键集合不一致构建失败 | `i18n:check` 强制校验 |
| C8 | **语言切换器必须链接到同语义页面**，不得跳首页 | Playwright E2E 测试全站切换器 |
| C9 | **CSS 变量仅在 `variables.css` 定义**，组件内不定义新变量 | Stylelint 规则 |
| C10 | **提交前必须跑通 `pnpm check:all`**，CI 同步跑同一流水线 | Git Hook（husky）或 CI 配置 |

---

## 5. 新增页面/修改内容的标准操作步骤（SOP）

### 5.1 新增一个产品详情页

1. **确认 slug**：在 `src/content/zh/data/products.json` 与 `en/data/products.json` 同步添加产品对象（同 `slug`、同 `categorySlug`）。
2. **补充字典**：在 `zh/pages/product-detail.json`、`en/pages/product-detail.json` 补充该产品专用文案键（如 `product.ankle-splint.title`）。
3. **放入素材**：图片/视频置入 `public/assets/images/`、`public/assets/videos/`，文件名建议用 slug（`ankle-splint.jpg`）。
4. **跑校验**：`pnpm i18n:check` → 通过。
5. **本地验收**：`pnpm dev` 访问 `/zh/products/easy-lock/ankle-splint/` 与 `/en/...`，核对文案、图片、面包屑、语言切换。
6. **提交**：PR 描述关联盘点条目编号（如 W1-B §4.1 产品详情第 1 项）。

### 5.2 修改全站通用文案（如导航「产品中心」→「产品与方案」）

1. 编辑 `src/content/zh/common.json` 与 `en/common.json` 对应键（`nav.products`）。
2. `pnpm i18n:check` → 通过。
3. `pnpm dev` 任意页核对导航文案、语言切换。
4. 提交。

### 5.3 新增一个二级产品分类

1. 在 `zh/data/categories.json`、`en/data/categories.json` 同步添加分类对象（含 `slug`、`name`、`desc`、`children[]`）。
2. 字典如需新增键（如分类页独有文案），同步 `pages/products-index.json`。
3. `pnpm i18n:check` → 通过。
4. `pnpm dev` 核对产品中心页、分类列表页、面包屑、语言切换。
5. 提交。

---

## 6. 部署与环境变量

| 环境变量 | 说明 | 示例 |
|---|---|---|
| `PUBLIC_SITE_URL` | 生产站点根域名（用于 sitemap、hreflang 绝对 URL） | `https://www.thbiomedic.com` |
| `PUBLIC_DEFAULT_LANG` | 默认语言（x-default 指向） | `en` |
| `BUILD_TIMESTAMP` | 构建时间戳（注入页面注释，便于缓存刷新核对） | 自动注入 |

**部署产物**：`dist/` 目录整体上传至静态托管（Nginx、对象存储+CDN、Vercel、Netlify、GitHub Pages 等）。
**Nginx 关键配置**：
```nginx
# 语言前缀重写（可选，视托管平台）
location / {
    try_files $uri $uri/ /index.html;
}
# 旧 .aspx URL 301 重定向（由 scripts/redirect-map.mjs 生成映射表）
# 示例：
rewrite ^/zn/Products/list\.aspx\?lcid=62$ /zh/products/easy-lock/ permanent;
```

---

## 7. 质量门禁（Definition of Done）

| 门禁 | 命令 | 通过标准 |
|---|---|---|
| 类型检查 | `pnpm typecheck` | 0 errors |
| 代码风格 | `pnpm lint` | 0 errors / 0 warnings |
| 双语完整性 | `pnpm i18n:check` | 两语言键集合完全一致、无空值 |
| 构建成功 | `pnpm build` | 产出 `dist/zh/`、`dist/en/`，无报错 |
| 素材完整 | `pnpm asset:inventory` | 与盘点清单核对通过 |
| 本地预览 | `pnpm preview` | 首页、分类、详情、资源、联系、语言切换全通 |
| E2E 语言切换 | `pnpm test:e2e`（后续补） | 全站每页点击切换器 → 同语义页面、语言匹配 |

---

## 8. 常见问题与避坑指南

| 问题 | 症状 | 解决 |
|---|---|---|
| 语言切换器跳 404 | 点「EN」进入 `/en/products/...` 但页面不存在 | 检查 `en/` 目录下对应页面文件是否存在；动态路由参数名是否一致（`[category]` vs `[cat]`） |
| hreflang 指向错误 | Search Console 报「hreflang 标记无效」 | 核对 `utils/seo.ts` 生成的 URL 是否带尾斜杠、是否与 `PUBLIC_SITE_URL` 一致 |
| 字典键缺失构建报错 | `i18n:check` 报 `Missing keys in en: hero.cta` | 补齐 `en/pages/home.json` 对应键；键名必须与 zh 完全一致 |
| 图片不显示/体积巨大 | 线上图片加载慢、未 WebP | 确认图片放在 `src/assets/`（经构建优化）而非 `public/`；或配置 `astro:assets`/`vite-imagetools` |
| 样式污染 | 修改某组件样式导致别处错乱 | 检查是否用了全局选择器；改用 scoped `<style>` 或 BEM + CSS Modules |
| 表单提交无响应 | 点提交无请求、无提示 | 检查 `Form.astro` 是否标记 `client:load`；`form-handler.ts` 是否正确绑定 `fetch` 到表单后端端点 |
| 视频无法播放 | 点播放黑屏/报错 | 确认 `public/assets/videos/` 下文件存在；`VideoPlayer.astro` 正确设置 `preload="metadata"`、`poster`；服务器支持 Range 请求 |

---

## 9. 版本与变更记录

| 版本 | 日期 | 变更 | 作者 |
|---|---|---|---|
| 0.1.0 | 2026-09-30 | 初版：目录结构、命令、组件划分、SOP、约定 | 架构师老欧 |

---

## 10. 参考

- ADR-001：`docs/adr/ADR-001-frontend-stack.md`
- ADR-002：`docs/adr/ADR-002-i18n.md`
- 内容盘点：`docs/content-inventory.md`
- Astro 文档：https://docs.astro.build/
- Vite 文档：https://vitejs.dev/
- 语义化版本：https://semver.org/lang/zh-CN/