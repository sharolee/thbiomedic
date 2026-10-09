# 交付清单报告（W3-5）

> 生成：2026-10-08 ｜ 审核官寇巴（SHAR-29 / W3-5）｜ 审核对象：`main` @ `f6846a0`（工作副本含 11 项未提交变更）
> 配套：`docs/audit/code-review.md`（代码审查报告，含阻塞/主要/次要分级与红线逐条比对）
> 结论：**不通过**（阻塞 5 / 主要 5 / 次要 5，红线第 9 条部分命中）。本清单为交付物盘点，验收结论以 `code-review.md` 为准。

---

## 1. 交付物统计

| 类别 | 文件数 | 体积 | 说明 |
|---|---|---|---|
| `src/` | 93 | — | `.astro` 43 / `.ts` 12 / `.css` 3 / `.json` 32 / `.gitkeep` 3 |
| `src/` 源码行数 | — | 6011 行 | 仅 `.astro` + `.ts` + `.css` |
| `public/` | 5 | — | `favicon.svg`、`robots.txt` + 3 个空素材目录占位 |
| `public/assets/` | 0 | 0 B | `images/` `videos/` `downloads/` 均只有 `.gitkeep` → **素材未迁移（阻塞 B3）** |
| `scripts/` | 2 | — | `i18n-check.mjs` + `i18n-known-gaps.json` |
| `docs/` | 73 | 8.2 MB | 非图片 14 个；验收截图 59 张占 8.0 MB |
| `dist/`（构建产物） | 69 | 1.8 MB | `zh/` 888 KB + `en/` 888 KB + `_astro/` 32 KB + `404.html` + `index.html` + `robots.txt` |
| git 提交 | 11 | — | `86356b8` → `f6846a0`，回滚点 tag `rollback/w3-2-start`；无远端、无 PR |
| 工作副本未提交项 | 11 | — | 含 6 个根目录临时文件（主要 M3）+ 本报告 2 个文件 |

### 构建产物页面构成（62 页）

| 语言 | 页数 | 构成 |
|---|---|---|
| `/zh/` | 30 | 首页 / 关于 / 联系 / 新闻 / 产品中心 / 10 个一级分类 / 12 个产品详情 / 资源-下载 / 资源-视频 / 搜索 |
| `/en/` | 30 | 与 zh 路径镜像一致（`Compare-Object` 相对路径集合相等） |
| 其他 | 2 | 根 `index.html`（语言跳转）、`404.html` |
| **缺失索引页** | 2 | `dist/zh/products/easy-lock/`、`dist/zh/products/pet-thermoplastic/`（en 同）→ 404（阻塞 B2） |

### 双语字典规模

| 语言 | 文件数 | 叶子键数（数组计 1） |
|---|---|---|
| `src/content/zh/` | 16 | 186 |
| `src/content/en/` | 16 | 187 |

差值 1 = en 专属 `phoneExt`，已在 `scripts/i18n-known-gaps.json`（R-50）登记为「待客户确认」，非缺键。

---

## 2. 构建与检查结果汇总

| 检查项 | 命令 | 结果 | 耗时 |
|---|---|---|---|
| 类型检查 | `npm run typecheck`（`astro check`） | **通过** 0 errors / 0 warnings / 0 hints（57 files） | 642 ms（类型生成） |
| 双语校验 | `npm run i18n:check` | **通过** 16 个双语文件：键集合一致 / 命名合法 / 无空值 / 变量一致 | <1 s |
| 生产构建 | `npm run build` | **通过** 62 page(s) built | astro 报告 1.58–4.20 s；端到端实测 7.83 s（`rm -rf dist` 后重建） |
| `check:all` | `npm run check:all` | **通过（但只有 3 项）** typecheck → i18n:check → build | — |
| Lint | `npm run lint` | **无法执行** — `npm error Missing script: "lint"` | — |
| 素材核对 | `npm run asset:inventory` | **无法执行** — `npm error Missing script: "asset:inventory"` | — |
| 预览冒烟 | `npm run preview` + `curl` | 12 条 URL 中 10 条 200，2 条 404 | — |

### HTTP 冒烟实测（`npm run preview`，端口 4321）

```text
/zh/                                          200
/en/                                          200
/zh/about/                                    200
/zh/products/                                 200
/zh/products/easy-lock/                       404   ← 阻塞 B2
/zh/products/low-temp-thermoplastics/         200
/zh/resources/                                404   ← 主要 M2
/zh/contact/                                  200
/zh/search/                                   200
/zh/news/                                     200
/zh/resources/downloads/                      200
/zh/resources/videos/                         200
/zh/contact/images/contact/20241127090745558.jpg  404   ← 阻塞 B3 / 主要 M4
/assets/images/contact/20241127090745558.jpg      404   ← 阻塞 B3 / 主要 M4
```

### 静态资源引用全站统计（`dist/**/*.html`）

```text
62  href="/favicon.svg"
 1  src="images/contact/20241127090745558.jpg"
 1  src="images/contact/20241126151510724.jpg"

<video> 标签数（dist/zh）：0
<img>   标签数（dist/zh）：1
```

---

## 3. 文件树（交付范围，已排除 `node_modules/` `.git/` `.multica/` `.opencode/` `.codebuddy/`）

```text
D:\Projects\playground\thbiomedic
├── PROJECT_STANDARDS.md        规范基线 v1.0（审核依据）
├── REDLINES.md                 红线 16 条（审核依据）
├── README.md                   快速开始（§8.1，结构图标注了不存在的 utils/assets.ts → M1）
├── package.json                6 个 scripts（缺 lint / asset:inventory → B1）
├── astro.config.mjs            Astro 7 配置，i18n zh/en 前缀路由，integrations 为空（→ B5）
├── tsconfig.json
├── .env.example / .nvmrc / .editorconfig / .gitignore
│
├── src/                        93 文件
│   ├── pages/                  43 个 .astro 中：index + zh/* + en/*（镜像）+ 404
│   ├── components/
│   │   ├── layout/             PageLayout Header Footer Banner Breadcrumbs
│   │   ├── ui/                 Button Icon LanguageSwitcher SectionHeader EmptyState Pagination ContactForm
│   │   ├── product/            CategoryCard CategoryGrid ProductCard ProductGrid
│   │   └── content/            Hero TrustBar PromoVideo NewsCard NewsList
│   ├── content/{zh,en}/        各 16 个 JSON（9 组页面字典 + 7 组 data/*.json）
│   ├── styles/                 variables.css(154) global.css(375) utilities.css(96)
│   ├── scripts/                carousel form-handler header-drawer language-switcher
│   ├── utils/                  content i18n seo url   ← 缺 assets.ts（M1）
│   └── types/                  components.d.ts(202) content.d.ts dictionary.d.ts(301)
│
├── public/
│   ├── favicon.svg  robots.txt（Sitemap 行待补 → B5）
│   └── assets/{images,videos,downloads}/   仅 .gitkeep，0 素材（→ B3）
│
├── scripts/                    i18n-check.mjs  i18n-known-gaps.json
│
├── docs/                       73 文件（含 59 张验收截图）
│   ├── adr/                    ADR-001-frontend-stack  ADR-002-i18n
│   ├── architecture.md  content-inventory.md
│   ├── design/                 design-spec  page-structure  acceptance-checklist
│   ├── i18n/                   content-model  key-convention  translation-matrix
│   ├── acceptance/             visual-report  smoke-report  screenshot-index  screenshots/(59)
│   └── audit/                  code-review.md  delivery-report.md   ← 本次产出
│
└── dist/                       69 文件 / 1.8 MB（构建产物，已 gitignore）
```

---

## 4. 已知问题清单

### 阻塞（5）

| # | 问题 | 位置 | 归属 |
|---|---|---|---|
| B1 | `check:all` 缺 `lint` 与 `asset:inventory` | `package.json:17` | W3-1 |
| B2 | 12 个产品详情页从主导航不可达；`/products/easy-lock/`、`/products/pet-thermoplastic/` 无索引页 → 404 | 产品路由 + 面包屑 | W3-2 |
| B3 | 素材零迁移：`public/assets/` 全空，全站 1 张图且 404、0 视频、0 PDF | `public/assets/` | **无归属任务，需新建** |
| B4 | 继承 W3-4 阻塞：V-2/V-3 灯箱未实现（已复核属实）；V-1 轮播 2/3 帧空白（数据层未见成因，待复采） | `docs/acceptance/visual-report.md` | W3-2 / W3-4 |
| B5 | 双语 sitemap 未生成，`robots.txt` 无 Sitemap 行 | `astro.config.mjs:20` | W3-1 / W3-2 |

### 主要（5）

| # | 问题 | 位置 |
|---|---|---|
| M1 | 缺 `src/utils/assets.ts`；`README.md:54` 却标注了它 | `src/utils/`、`README.md` |
| M2 | 页头「资源」导航父项 `/zh/resources/` 404（子页均 200） | `Header.astro` |
| M3 | 根目录 6 个临时产物残留且未 gitignore：`.b29.ps1` `.gaps.ps1` `.srv.ps1` `.preview-err.log` `.preview-out.log` `.preview-pid.txt` | 仓库根 |
| M4 | 联系页二维码图为裸相对路径 `images/contact/*.jpg`，无 `assets.ts` 生成且文件不存在 | `ContactForm`/联系页数据 |
| M5 | 404 页语言切换指向 `/en/404/` → 404 | `dist/404.html` |

### 次要（5）

| # | 问题 | 位置 |
|---|---|---|
| m1 | 三处注释声明 `client:load` / `client:visible`，全仓 `client:` 零命中（Astro 组件不支持该指令，实际用内联 `<script>`） | `Hero.astro:10`、`ContactForm.astro:10`、`zh/contact/index.astro:12` |
| m2 | `Header.astro` 579 行，超 300 行建议线 | `src/components/layout/` |
| m3 | 表单 `action` 依赖未配置的 `PUBLIC_API_URL`，无 JS 时原生 POST 提交到自身页；字段 `id` 硬编码（同页多表单会冲突） | `ContactForm.astro:14,21,29-105` |
| m4 | 无远端仓库、无 PR，10 次提交直推 `main`（§5 待确认项） | 仓库 |
| m5 | `Hero.astro:28` 使用全局工具类 `u-container`（非纯 scoped）——属设计系统工具类，判合规仅登记 | `src/components/content/` |

### 内容层遗留（需客户确认，9 条）

`scripts/i18n-known-gaps.json` 已登记且不影响校验通过：R-02 首页宣传片、R-03 荣誉资质图跨语言暂用、R-37 Elbow Splint 英文描述、R-44 康复方案 PDF 中英不同文件、R-46 视频栏目取并集、R-47 患者固定视频文件不同、R-48 宠物康复视频中文侧补齐、R-49 新闻栏目空、R-50 联系方式差异（`phoneExt`）。

---

## 5. 回滚方式

- 当前 HEAD：`f6846a0`（docs: W3-4 轻量验收报告）。
- 回滚点 tag：`rollback/w3-2-start`（W3-2 开工前状态）。
- 分阶段回滚：`git revert` 对应提交即可（`9d89ab9` W3-1 / `142f40c`+`3866516`+`1961db3` W3-2 / `a737ac5`+`2ef69bd` W3-3 / `3645800`+`518a4cd`+`f6846a0` W3-4）。
- 本次审核产物（`docs/audit/`）为纯新增文档，删除不影响站点。
- 工作副本 11 项未提交变更（含 6 个临时文件），回滚前需先 `git stash -u` 或清理临时文件。

---

## 6. 回传格式

| 项 | 内容 |
|---|---|
| 做了什么 | 盘点全部交付物（93 源文件 / 73 文档 / 69 构建产物 / 11 提交），统计体积与构建耗时，汇总 4 项通过检查 + 2 项无法执行检查 + 14 条 URL 冒烟结果，列出 15 条已知问题与回滚方式 |
| 产物路径 | `docs/audit/delivery-report.md`（本报告）、`docs/audit/code-review.md`（审查报告） |
| 验收命令与真实输出 | `npm run check:all`（typecheck 0 errors / i18n:check ✓ / build 62 pages）、`npm run lint` 与 `npm run asset:inventory`（均 Missing script）、`npm run preview` + curl 14 条、全站资源引用统计 |
| 未完成项 | 被审对象的 B1–B5 / M1–M5 / m1–m5，及 9 条待客户确认内容差异；无远端仓库与 PR |
| 建议下一步 | ① W3-1 补 `lint` + `asset:inventory` + sitemap、清理临时文件；② W3-2 修产品路由（B2）、补 `assets.ts`（M1）、实现灯箱（B4）、修资源导航与 404 语言切换（M2/M5）；③ 新建素材迁移任务承接 B3（需人先确认素材来源）；④ W3-4 复采 V-1 定性；⑤ 全部闭环后重跑五项齐全的 `check:all` + 全站内链爬取（目标 0 坏链），再复核 |
