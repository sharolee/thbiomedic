# 代码审查报告（W3-5）

> 审核日期：2026-10-08 ｜ 审核官寇巴（SHAR-29 / W3-5）｜ 审核对象：`main` @ `f6846a0`（工作副本含未提交变更）
> 依据：`PROJECT_STANDARDS.md` v1.0（§2 / §3 / §4 / §10）、`REDLINES.md` v1.0（16 条）
> 工具边界：只审核不修代码；问题项派回 W3-2（SHAR-27）/ W3-3（SHAR-28）/ W3-1（SHAR-26）修复。

---

## 0. 总体结论

**不通过。**

| 严重度 | 条数 | 编号 |
|---|---|---|
| 阻塞（打回修复） | 5 | B1–B5 |
| 主要 | 5 | M1–M5 |
| 次要 | 5 | m1–m5 |
| 通过项 | — | 见 §4 |

阻塞项分布：`package.json`（B1）、产品路由（B2，W3-2）、素材迁移（B3，无归属任务）、W3-4 继承阻塞（B4）、SEO sitemap（B5，W3-1/W3-2）。

**前置条件说明**：本任务描述要求「W3-1/2/3 全部完成 + W3-4 视觉验收通过**或无阻塞项**」。实际 `docs/acceptance/visual-report.md` 明确记录 **3 条阻塞（V-1/V-2/V-3）+ 1 条主要（B24）**，且 W3-4（SHAR-30）仍为 `in_progress`。前置条件**未满足**，本次审核按用户「开始验收」指令执行，结论为不通过。

---

## 1. 阻塞项（B）

### B1 `check:all` 缺 `lint` 与 `asset:inventory` —— 违反 §4.3【必须】

- **位置**：`package.json:17`
  ```json
  "check:all": "npm run typecheck && npm run i18n:check && npm run build"
  ```
- **规范**：§4.3【必须】「提交前跑通 `pnpm check:all`（typecheck → lint → i18n:check → build → asset:inventory），任一失败即阻断」；§10「`check:all` 真实执行通过（附命令输出）」；§7.2【必须】「`pnpm asset:inventory` 核对通过才算完成」。
- **证据**（真实执行，2026-10-08 09:54/09:55）：
  ```text
  > npm run lint
  npm error Missing script: "lint"
  npm error
  npm error Did you mean this?
  npm error   npm link # Symlink a package folder
  npm error
  npm error To see a list of scripts, run:
  npm error   npm run

  > npm run asset:inventory
  npm error Missing script: "asset:inventory"
  npm error
  npm error To see a list of scripts, run:
  npm error   npm run
  ```
  `package.json` 全量 scripts 仅 `dev / build / preview / typecheck / i18n:check / check:all` 六项。
- **后果**：质量门禁比规范少两道；`asset:inventory`（素材与 `content-inventory.md` 核对）从未存在，`§10` 第 7 条无法判定。
- **建议**：W3-1（SHAR-26）补 `lint`（如 `astro check` 之外的 ESLint 或明确以 `astro check` 兼任并写进规范）+ 补 `scripts/asset-inventory.mjs` 并接入 `check:all`。若认为某项不适用，须走 §14 红线「推翻既有约定须显式标注并上报确认」，不能在 `package.json` 里静默省略。

### B2 12 个产品详情页从主导航不可达（分类→列表→详情链路断裂）——违反 §4.4【必须】

- **位置**：`src/pages/zh/products/[category]/index.astro`、`src/pages/zh/products/[category]/[product]/index.astro`（en 同构）
- **证据**（真实执行）：
  ```
  # 目录：二级分类目录存在但无 index.html
  $ for d in $(find dist/zh/products -mindepth 1 -type d); do [ -f "$d/index.html" ] || echo "$d"; done
  dist/zh/products/easy-lock
  dist/zh/products/pet-thermoplastic

  # HTTP（npm run preview 后 curl）
  /zh/products/easy-lock/                       404
  /zh/products/low-temp-thermoplastics/         200

  # 5 个一级分类页内「产品详情链接」计数均为 0
  low-temp-thermoplastics   detail-links=0
  high-temp-thermoplastics  detail-links=0
  pet-rehabilitation        detail-links=0
  comfort-orthosis          detail-links=0
  accessory                 detail-links=0

  # 产品中心首页只有 10 张一级分类卡
  $ grep -oE 'href="/zh/products/[a-z-]+/"' dist/zh/products/index.html | sort -u | wc -l
  10
  ```
- **机理**：产品的 `categorySlug` 取二级 slug（`easy-lock` / `pet-thermoplastic`），而分类路由只为一**级**分类生成索引页（10 个）。一级分类页因此为空态、不含任何产品详情链接；详情页面包屑回指的 `/zh/products/easy-lock/` 亦 404。
- **后果**：12 个产品详情页（中英各 12）只能通过直接输入 URL 或详情页互链进入，主导航链路断裂。§4.4 冒烟清单第 2 条「产品分类 → 列表 → 详情链路」不通过；`docs/acceptance/smoke-report.md` C.3 已记录同源问题（主要-1）。
- **建议**：派回 W3-2（SHAR-27）。二选一：① 为二级分类生成索引页（`easy-lock` / `pet-thermoplastic`）；② 把产品挂到一级分类 slug 下，并修正面包屑的 `categorySlug` 取值。修复后须重新跑全站内链爬取证明 0 坏链。

### B3 素材零迁移：`public/assets/` 全空，全站无图/无视频/无 PDF —— 违反 §7.2【必须】、§3.7【必须】、红线 9

- **位置**：`public/assets/{images,videos,downloads}/`
- **证据**（真实执行）：
  ```
  $ ls -la public/assets/images public/assets/videos public/assets/downloads
  # 三个目录均只有 .gitkeep（0 字节），无任何素材文件

  # 构建产物全站资源引用统计（dist/**/*.html）
  $ grep -rohE '(src|href|poster|data-src)="[^"]*\.(png|jpg|jpeg|webp|mp4|pdf|svg|avif)"' dist --include=*.html | sort | uniq -c
       62 href="/favicon.svg"
        1 src="images/contact/20241127090745558.jpg"
        1 src="images/contact/20241126151510724.jpg"

  $ grep -ro '<img'   dist/zh --include=*.html | wc -l   → 1
  $ grep -ro '<video' dist/zh --include=*.html | wc -l   → 0

  # 该唯一图片 HTTP 实测 404
  $ curl -s -o /dev/null -w '%{http_code}' http://localhost:4321/zh/contact/images/contact/20241127090745558.jpg
  404
  $ curl -s -o /dev/null -w '%{http_code}' http://localhost:4321/assets/images/contact/20241127090745558.jpg
  404
  ```
- **规范对照**：§7.2【必须】「素材迁移（原站图片/视频/PDF）以 `docs/content-inventory.md` 清单为准，`pnpm asset:inventory` 核对通过才算完成；禁止线上直链原站资源」；§3.7【必须】「图片必须经构建管线优化」；红线 9「线上产物直链原站图片/视频/PDF，未完成本地化迁移」。
- **判定**：**红线 9 部分命中** —— 未发现直链 `thbiomedic.com` 静态资源（内容层无 `https://www.thbiomedic.com/...` 素材 URL，全站仅 `src/utils/seo.ts:14` 作为 canonical/hreflang 域名、页脚 ICP 外链），但**本地化迁移完成度为 0**：`content-inventory.md` 盘点 119 个图片资源 / 6 PDF / 27 MP4，实际入库 0。
- **归属**：阶段 1–4 的 10 个子任务中**没有素材迁移任务**，属范围缺口，需新建任务（详见 §5 建议）。医疗企业官网无产品图/资质图/视频，不具备交付条件。
- **建议**：新建「W3-6 素材迁移与本地化」任务，以 `content-inventory.md` §资源清单为基准抓取 `/uploadfiles/` 素材落 `public/assets/{images,videos,downloads}/`，并实现 `scripts/asset-inventory.mjs` 做清单核对（B1 一并闭环）。迁移前需人确认父任务人工介入点 3（素材来源：复用原站 vs 生图补齐）。

### B4 继承 W3-4 阻塞项：V-1 轮播帧空白 / V-2 发展历程灯箱 / V-3 产品图灯箱

- **位置**：`docs/acceptance/visual-report.md` §阻塞项
- **独立复核结论**：
  - V-2 / V-3 **属实**：`grep -rin "lightbox|<dialog|dialog" src/` → **0 命中**，确无灯箱实现。
  - V-1 **需 W3-2 复核**：`src/content/zh/pages/home.json` 的 `hero.slide_2`（固德易®/一次性固定器组件）、`slide_3`（宝力谊®/低温热塑）数据**完整非空**；`src/components/content/Hero.astro:18-35` 对 `slides` 全量 map 渲染，未发现按 index 隐藏的 CSS 规则。数据层与模板层均看不出「2/3 帧空白」的成因，**不能排除是截图采集时机（transform 过渡中）造成的假象**。
- **建议**：V-2/V-3 派回 W3-2 实现 Lightbox（含焦点圈禁 + Esc 关闭）；V-1 由 W3-4 用 DevTools 在过渡结束后复采一帧再定性，不要直接按「数据为空」修。

### B5 双语 sitemap 未生成 —— 违反 §6.4【必须】

- **证据**（真实执行）：
  ```
  $ find dist -name "sitemap*"     → （无输出）
  $ cat public/robots.txt
  User-agent: *
  Allow: /
  # Sitemap 行待接入 @astrojs/sitemap 后补充（architecture.md §6，属后续 SEO 阶段）
  ```
  `astro.config.mjs:20` `integrations: []`。
- **规范**：§6.4【必须】「每页输出 hreflang 双向链接 + x-default（指向英文版），**并纳入双语 sitemap**」；§10 未单列但 hreflang 项已过。
- **判定**：作者已在 `robots.txt` 中显式标注为遗留（不构成红线 16「隐瞒未完成项」），但按 §6.4【必须】仍属阻塞。
- **建议**：W3-1/W3-2 接入 `@astrojs/sitemap` 并在 `robots.txt` 补 `Sitemap:` 行；或由任务方显式裁决「sitemap 不在本次范围」并写入规范例外。

---

## 2. 主要项（M）

### M1 缺 `src/utils/assets.ts`，README 与实际不符 —— 违反 §3.2【必须】C2 / §8.1【必须】

- **位置**：`src/utils/` 实际只有 `content.ts / i18n.ts / seo.ts / url.ts`；`README.md:54` 却写 `│   └── utils/    # i18n / url / seo / content / assets`
- **证据**（真实执行）：`find src/utils -type f` → 4 个文件，无 `assets.ts`。
- **规范**：§3.2【必须】「所有链接与资源 URL 必须由 `utils/url.ts`、`utils/assets.ts` 生成，禁止字符串拼接路径（C2）」。
- **后果**：资源 URL 无统一出口，直接导致 M4（联系页二维码裸相对路径）。
- **建议**：W3-2 补 `src/utils/assets.ts`（导出 `assetUrl(path)` / `imageUrl()` / `downloadUrl()`），并让所有 `src=` 走该工具；同时修正 `README.md` 结构说明。

### M2 页头「资源」主导航父项 404

- **证据**：`curl -o /dev/null -w '%{http_code}' http://localhost:4321/zh/resources/` → **404**（`/zh/resources/downloads/`、`/zh/resources/videos/` 均 200）。
- **来源**：`Header.astro` 导航项 `href="/zh/resources/"`，但站点未建 `/resources/` 索引页。
- **建议**：W3-2 二选一：建 `/resources/` 索引页，或把「资源」改为无跳转的下拉触发器（`<button>` + aria-expanded）。

### M3 根目录临时产物残留未清理 —— 违反 §2.2 / §2.3 / §10 第 1 条

- **证据**（真实执行 `git status --short`）：
  ```
  ?? .b29.ps1
  ?? .gaps.ps1
  ?? .srv.ps1
  ?? .preview-err.log
  ?? .preview-out.log
  ?? .preview-pid.txt
  ```
  且 `.gitignore` 未覆盖这些文件。
- **规范**：§2.2【必须】「新增文件必须落入上述对应目录……不在根目录随手堆放」；§2.3【必须】「禁止在 `src/` 与 `public/` 内堆放临时产物」（根目录虽不在字面范围，但 §2.2 已覆盖）；§10 第 1 条「无越界文件、无临时产物残留」。
- **建议**：W3-1/W3-4 清理这批抓图/起服务的临时脚本与日志；需保留的移入 `scripts/` 并在 `.gitignore` 登记 `*.log` / `.preview-*`。

### M4 联系页二维码图为裸相对路径且文件不存在（404）

- **位置**：`dist/zh/contact/index.html` → `src="images/contact/20241127090745558.jpg"`（en 侧同理）
- **证据**：两处 URL 实测均 404（见 B3 证据块）。
- **规范**：§3.2【必须】C2（禁止字符串拼接路径）+ §7.2（素材本地化）。
- **建议**：随 B3 素材迁移一并处理，并把路径生成收敛到 M1 的 `assets.ts`。

### M5 404 页语言切换指向 `/en/404/` → 404

- **证据**：`docs/acceptance/smoke-report.md` C.3「次要-1」记录 `dist/404.html` 内 EN 切换链接指向 `/en/404/`（404）；404 页为单一中文页无英文变体。
- **规范**：§6.3【必须】「语言切换器必须链接到对应语言的同语义页面，禁止跳首页」。
- **判定**：跳的是同语义页路径（非首页），但目标不存在 → 实效上仍是坏链。
- **建议**：W3-2 为 404 页生成中英两个变体，或在 404 页隐藏语言切换器。

---

## 3. 次要项（m）

| 编号 | 位置 | 问题 | 规范 |
|---|---|---|---|
| m1 | `Hero.astro:10`、`ContactForm.astro:10`、`src/pages/zh/contact/index.astro:12` | 注释声明「交互岛屿（`client:load` / `client:visible`，页面使用处标记）」，但全仓 `grep -rn "client:" src/` **零命中**。Astro 组件本不支持 `client:*` 指令，实际用内联 `<script>` 模块加载。注释与实现不符，易误导后续维护者 | §3.4【必须】C5（条款本身因无框架岛屿而不适用，但注释须改正） |
| m2 | `src/components/layout/Header.astro`（579 行） | 单文件超 300 行 | §3.9【建议】 |
| m3 | `src/components/ui/ContactForm.astro:14,21` | `action={import.meta.env.PUBLIC_API_URL}`，而 `.env.example:14` 中该项被注释（`# PUBLIC_API_URL=`）→ 未配置时 `action` 为空，无 JS 降级时原生 POST 提交到自身页；另有 `novalidate` + 硬编码字段 `id`（`cf-company` 等），同页多表单会 id 冲突 | §6.6【必须】渐进增强（降级路径当前不可用） |
| m4 | 仓库 | 无远端、无 PR，10 个子任务产物全部直推 `main`（10 次提交） | §5 明确「需人确认」，不计命中；但 §5.2/§5.5 的分支与评审前置条件未生效 |
| m5 | `src/components/content/Hero.astro:28` | 组件内使用全局工具类 `u-container`（非纯 scoped） | §3.5 —— 属设计系统工具类，判合规，仅登记 |

---

## 4. 通过项（真实输出）

### 4.1 `npm run check:all` 完整真实输出（2026-10-08 09:32 / 09:40）

```text
> thbiomedic@0.1.0 typecheck
> astro check
09:32:41 [types] Generated 642ms
09:32:41 [check] Getting diagnostics for Astro files in D:\Projects\playground\thbiomedic...
Result (57 files):
- 0 errors
- 0 warnings
- 0 hints

> thbiomedic@0.1.0 i18n:check
> node scripts/i18n-check.mjs
✓ 双语完整性校验通过（16 个双语文件：键集合一致 / 命名合法 / 无空值 / 变量一致）

> thbiomedic@0.1.0 build
> astro build
09:32:14 [build] ✓ Completed in 4.20s.
09:32:14 [build] 62 page(s) built in 5.65s
09:32:14 [build] Complete!

# 独立计时（rm -rf dist 后重建）
EXIT=0   WALL_MS=7831
09:40:38 [build] ✓ Completed in 848ms.
09:40:38 [build] 62 page(s) built in 1.58s
```

> 注：`check:all` 现有三项**全部通过且为零错误**，但它只是规范 §4.3 五项的**子集**（缺 lint / asset:inventory，见 B1）。「check:all 通过」不等于「§4.3 通过」。

### 4.2 逐条规范核对表

| 规范条目 | 结论 | 证据 |
|---|---|---|
| §2.1 目录骨架沿用 architecture.md | 通过 | `src/{pages,components,content,styles,scripts,utils,types}` + `public/assets/{images,videos,downloads}` + `docs/adr/` 齐备 |
| §2.2 新增文件落入对应目录 | **不通过** | 根目录 6 个临时文件残留（M3） |
| §2.3 `src/`/`public/` 无临时产物 | 通过 | `find src public -name '*.bak' -o -name '*.log'` 无输出；`src/styles/components/.gitkeep`、`src/content/*/data/.gitkeep` 为占位文件，可接受 |
| §2.4 未把脚手架当产物 | 通过 | `.multica/` `.opencode/` `.codebuddy/` 未被引入构建；`astro.config.mjs` integrations 为空 |
| §2.5 命名（PascalCase / kebab-case） | 通过 | 组件 `Header.astro`、脚本 `i18n-check.mjs`、字典 `product-detail.json` 均合规 |
| §3.1 文案全来自字典 | 通过 | `i18n-check` 规则 6（模板区 CJK 扫描）零命中（2 条白名单：`pages/index.astro` 品牌 title、`Header.astro` logo「天」字形，理由已注明） |
| §3.2 URL 由工具生成 | **不通过** | 缺 `utils/assets.ts`（M1）+ 联系页裸路径（M4） |
| §3.3 Props TS 接口 / 禁 any | 通过 | `grep -rnE "as any\|@ts-ignore\|@ts-expect-error\|: any" src/` → **0 命中**；`src/types/components.d.ts`（202 行）定义全量 Props |
| §3.4 组件划分 / 岛屿标记 | **部分** | 页面-组件分层合规；`client:*` 零使用（m1） |
| §3.5 样式分层 | 通过 | `variables.css`（154 行）为唯一令牌源；断点/色值/字号全部以 `var(--*)` 引用 |
| §3.6 断点基线 640/768/1024/1280/1536 | 通过 | `variables.css:108-112` 定义 `--bp-sm..--bp-2xl` 五档；组件内 grep 未见自定断点数值 |
| §3.7 图片经构建管线优化 | **不通过** | 素材 0 迁移（B3），条款无适用对象 |
| §4.1 交付附真实证据 | 通过 | 本报告全部结论均附命令与输出 |
| §4.2 dev 可起、build 产出 `dist/zh` `dist/en` | 通过 | `preview` 实测 12 条 URL；`dist/zh` 30 页 / `dist/en` 30 页 |
| §4.3 `check:all` 五项 | **不通过** | 仅三项存在（B1） |
| §4.4 冒烟清单 | **不通过** | 分类→详情链路断（B2）；首页/双语切换/搜索/资源子页/联系页均 200 |
| §4.5 双语完整性 `i18n:check` | 通过 | 16 个双语文件，zh 186 / en 187 叶子键（差 1 为 en 专属 `phoneExt`，与 `i18n-known-gaps.json` R-50 登记一致）；`exemptions: []` **为空**，未用豁免掩盖差异 |
| §4.7 未删/跳/注释测试 | 通过 | 全仓仅 `scripts/i18n-check.mjs` 一个校验脚本，无被注释或跳过的用例 |
| §6.1 语言路由 `/zh/`/`/en/`、slug 英文小写 | 通过 | 62 条路由，zh/en 各 30 页路径镜像一致 |
| §6.3 语言切换同语义页 | **部分** | 主站页面通过（`getOtherLangPath`）；404 页失效（M5） |
| §6.4 hreflang 双向 + x-default | **部分** | `dist/zh/index.html` 实测三向齐全：`<link rel="alternate" hreflang="zh-CN" href="https://www.thbiomedic.com/zh/">` / `hreflang="en"` / `hreflang="x-default" → /en/`；**sitemap 缺**（B5） |
| §6.5 译文标注「需人校对」 | 通过 | `i18n-known-gaps.json` 登记 9 条待客户确认项（R-02…R-50），W3-2 交付评论亦明确「专业医疗术语译文需人校对，未冒充定稿」 |
| §8.1 README 快速开始 | **部分** | install/dev/build/preview/typecheck/i18n:check/check:all 齐全可照做；但项目结构图标注了不存在的 `utils/assets.ts`（M1） |
| §8.4 交付说明回传格式 | 通过（本任务） | 见 §6 |

### 4.3 红线 16 条逐条比对

| # | 红线 | 结论 | 证据 / 说明 |
|---|---|---|---|
| 1 | 无真实执行证据声明「完成/已验证」 | **未命中** | 各任务交付评论均附命令输出；本报告所有结论附真实输出 |
| 2 | 伪造/拼接/复用旧输出冒充本次结果 | **未命中** | 本报告输出均为本次（2026-10-08 09:32–09:46）现场执行 |
| 3 | 把未真实运行的命令写进验收结论 | **未命中（但需澄清）** | W3-2 的**交付评论**只声明了 typecheck/i18n:check/build/preview，未声明 lint；但 **SHAR-27 任务描述**把「`npm run lint` 通过」列为验收证据，而该脚本不存在 → 属任务描述缺陷，已并入 B1，不判执行者命中 |
| 4 | 删除/跳过/注释测试让流程变绿 | **未命中** | 无测试用例被删/跳/注释；`i18n-known-gaps.json` 的 `exemptions` 为空数组（9 条 `notes` 仅登记内容层差异，不影响校验通过与否），未用豁免掩盖失败 |
| 5 | 绕过 `check:all` 失败项强行交付 | **未命中** | `check:all` 现有三项零错误；但门禁被缩水为三项（B1），不构成「绕过失败项」 |
| 6 | `as any` / `@ts-ignore` / `@ts-expect-error` 压制类型错误 | **未命中** | `grep -rnE "as any\|@ts-ignore\|@ts-expect-error" src/` → 0 命中 |
| 7 | 硬编码密钥/令牌/账号密码/内网地址 | **未命中** | `grep -rInE "password\|secret\|token\|api[_-]?key\|AKIA\|Bearer"` 全仓仅 1 处误报（visual-report.md 中的 "token" 指 CSS 设计令牌）；内网地址仅出现在 `docs/`、`architecture.md` 的本地开发命令示例中 |
| 8 | 硬编码中英文案 / 未翻译占位文本 | **未命中** | `i18n-check` 规则 6 零命中；`PLACEHOLDER_RE`（空/待补充/TBD/TODO/N\/A）零命中 |
| 9 | 直链原站素材、未完成本地化迁移 | **部分命中** | 无直链 `thbiomedic.com` 素材 URL，但本地化迁移完成度 0（B3）——按红线原文「未完成本地化迁移」判命中，列入阻塞 |
| 10 | 越界改动范围外模块 / 夹带无关改动 | **未命中** | 10 次提交按 W3-1/2/3/4 阶段推进，`git log` 无跨任务夹带 |
| 11 | 擅自变更需求/数值/内容口径/对外契约 | **未命中** | URL 结构（`/zh/`、`/en/`）、字典键结构均按 ADR-002 落地；`i18n-known-gaps.json` 的 9 条差异均标注「待客户确认」，未自行拍定 |
| 12 | 删除/改动平台协作脚手架并当交付物 | **未命中** | `.multica/` `.opencode/` `.codebuddy/` `AGENTS.md` 未被引入构建；`AGENTS.md` 有本地修改（`M AGENTS.md`）但属运行时管理，非交付物 |
| 13 | 破坏性改动前不备份 | **未命中** | 建仓后每次改动均有提交，W3-2 另打 `rollback/w3-2-start` 回滚点 |
| 14 | 推翻既有约定不标注不上报 | **未命中** | 无推翻项；`check:all` 缩水属遗漏而非推翻，已在 B1 标注并要求上报 |
| 15 | 该问不问 | **未命中** | 9 条内容差异已登记待客户确认；素材来源（父任务人工介入点 3）尚无人确认，已在 B3 提出 |
| 16 | 交付说明缺项 / 隐瞒遗留问题 | **未命中** | W3-2/W3-4 交付评论均按五段式回传并明列未完成项（`robots.txt` 亦显式标注 sitemap 遗留） |

**红线命中合计：1 条（第 9 条，部分命中）。**

---

## 5. 派回建议（按责任任务）

| 任务 | 需修复项 | 严重度 |
|---|---|---|
| W3-2（SHAR-27） | B2 产品路由链路、B4 的 V-2/V-3 灯箱、M2 资源导航父项、M5 404 语言切换、M1 `assets.ts`、m1 注释、m3 表单降级 | 阻塞 + 主要 |
| W3-1（SHAR-26） | B1 `lint` + `asset:inventory`、B5 sitemap、M3 临时产物清理 | 阻塞 + 主要 |
| W3-4（SHAR-30） | B4 的 V-1 复采确认 | 阻塞（待定性） |
| **新建任务** | B3 素材迁移与本地化（当前无归属） | 阻塞 |

---

## 6. 回传格式

| 项 | 内容 |
|---|---|
| 做了什么 | 按 `PROJECT_STANDARDS.md` §2/§3/§4/§10 逐条核对 93 个源文件 + 62 页构建产物；`REDLINES.md` 16 条逐条比对；真实执行 `npm run check:all` / 独立 `preview` + curl 冒烟 / 内链可达性统计 / 素材与密钥扫描 |
| 产物路径 | `docs/audit/code-review.md`（本报告）、`docs/audit/delivery-report.md`（交付清单） |
| 验收命令与真实输出 | 见 §4.1（check:all 完整输出）、§1/§2 各条内嵌命令与返回 |
| 未完成项 | 无（本次审核范围已全部覆盖）；**被审对象**的未完成项即 B1–B5 / M1–M5 / m1–m5 |
| 建议下一步 | ① 派 B1/B5/M3 回 W3-1、B2/M1/M2/M5 回 W3-2；② 新建「W3-6 素材迁移与本地化」承接 B3（需人先确认素材来源）；③ W3-4 复采 V-1 定性；④ 全部阻塞项闭环后重跑 `check:all`（五项齐全版）+ 内链爬取 0 坏链，再复核 |
