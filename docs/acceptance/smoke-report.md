# W3-4 轻量验收报告（Smoke Report）— 构建 + HTTP 冒烟 + 双语一致性

> 验收日期：2026-10-06 ｜ 验收对象：`main` @ `518a4cd` ｜ 执行：全栈老欧（SHAR-44）
> 性质：**不依赖截图的验收**。像素级视觉比对未执行（截图链路三次尝试不可用），见文末「遗留项」。
> 边界遵守：只检查不改代码；未触碰 `AGENTS.md` / `PROJECT_STANDARDS.md` / `REDLINES.md` / `docs/design/`；不 push、不建远端。

---

## 概览

| 检查项 | 结论 |
|---|---|
| A. 构建 | ✅ 通过（exit 0，62 页，dist/ 重新生成） |
| B. 产物完整性 | ⚠️ 通过（zh=en=30 页镜像一致；与 content-inventory 的 64/68 页为站点重构差异，非缺陷，见 B.2） |
| C. HTTP 冒烟 | ⚠️ 通过（必需 URL 全 200；全站内链爬取发现 7 条坏链，见 C.3） |
| D. 内容存在性 | ✅ 通过（公司名 / 导航 / 页脚，中英全页面覆盖） |
| E. 双语一致性 | ⚠️ 通过（`i18n:check` 绿；zh 463 / en 464 个叶子 key，差 1 个为 en 专属 `phoneExt`，与原始站一致） |
| F. 设计规范数值落地 | ✅ 通过（主色 / 科技青 / 断点 / 字体档位全部出现在构建产物） |
| G. 静态结构检查 | ⚠️ 通过（60 页 lang/title/description/hreflang 全对；404 页与根索引页有 2 处次要问题） |

**发现缺陷：无阻塞级；主要 2 项；次要 3 项**（详见 §C.3 / §G.2）。

---

## A. 构建

### A.1 `npm run build` 完整输出

```powershell
> thbiomedic@0.1.0 build
> astro build

18:18:35 [types] Generated 223ms
18:18:35 [build] output: "static"
18:18:35 [build] mode: "static"
18:18:35 [build] directory: D:\Projects\playground\thbiomedic\dist\
18:18:35 [build] Collecting build info...
18:18:35 [build] ✔ Completed in 265ms.
18:18:35 [build] Building static entrypoints...
18:18:36 [vite] ✔ built in 675ms
18:18:36 [vite] ✔ built in 88ms
18:18:36 [build] Rearranging server assets...

 generating static routes
18:18:36   ├─ /404.html (+20ms)
18:18:36   ├─ /en/about/index.html (+6ms)
18:18:36   ├─ /en/contact/index.html (+7ms)
18:18:36   ├─ /en/news/index.html (+6ms)
18:18:36   ├─ /en/products/easy-lock/ankle-splint/index.html (+4ms)
18:18:36   ├─ /en/products/easy-lock/wrist-splint/index.html (+4ms)
18:18:36   ├─ ...（共 62 条路由，中英对称）
18:18:36   ├─ /zh/search/index.html (+4ms)
18:18:36   ├─ /zh/index.html (+4ms)
18:18:36   ├─ /index.html (+3ms)
18:18:36 [build] ✔ Completed in 269ms.
18:18:36 [build] ✔ Completed in 1.10s.
18:18:36 [build] 62 page(s) built in 1.40s
18:18:36 [build] Complete!
```

- 退出码：0（无报错、无警告积压）。
- `dist/` 重新生成（构建目录时间戳 18:18:36，覆盖旧产物）。

### A.2 `dist/` 顶层清单

```text
_astro/   404.html   assets/   en/   favicon.svg   fonts/   index.html   robots.txt   zh/
```

---

## B. 产物完整性

### B.1 dist/zh 与 dist/en HTML 清单与计数

`dist/zh/`（30 个 HTML）与 `dist/en/`（30 个 HTML）**路径完全镜像一致**：

```text
zh/about/index.html              en/about/index.html
zh/contact/index.html            en/contact/index.html
zh/index.html                    en/index.html
zh/news/index.html               en/news/index.html
zh/products/[10 个一级分类]/index.html      en/products/[...]/index.html
zh/products/easy-lock/[6 个产品]/index.html en/products/easy-lock/[...]/index.html
zh/products/pet-thermoplastic/[6 个产品]/index.html  en/products/pet-thermoplastic/[...]
zh/products/index.html           en/products/index.html
zh/resources/downloads/index.html  en/resources/downloads/index.html
zh/resources/videos/index.html   en/resources/videos/index.html
zh/search/index.html             en/search/index.html
```

```powershell
$zh=(Get-ChildItem -Recurse dist\zh -Filter *.html).Count; $en=(Get-ChildItem -Recurse dist\en -Filter *.html).Count
# zh=30 en=30
```

- **zh = en = 30**，逐一比对相对路径集合 `Compare-Object` → `PATH MIRROR OK: zh == en (30 paths)`。

### B.2 与 `docs/content-inventory.md` 对账

| 维度 | 原站盘点 | 新版 | 说明 |
|---|---|---|---|
| 中文 HTML 页数 | 64（抓取成功 56） | 30 | 新版为重构站点：原站的空二级分类列表页、加密分页 URL、404 子页等被收敛/移除 |
| 英文 HTML 页数 | 68（成功 63） | 30 | 同上 |
| 主导航 6 栏目 | 首页/关于/产品/资源/新闻/联系 | 全部覆盖 | 新增搜索页 `/search/` |
| 产品一级分类 | 10 | 10 | ✅ 对齐 |
| 产品详情页 | 12（中）/12（英） | 12（中）/12（英） | ✅ 对齐（易锁式 6 + 宠物可塑性 6） |
| 下载 | 3 PDF | downloads 页 | ✅ |
| 视频 | 8（中）/19（英） | videos 页 | 列表页聚合，未逐条建页（合理简化） |
| 新闻 | 空列表 | 保留空态页 | ✅ 与原站一致（空） |

> **差异说明**：页数 30 vs 64/68 是**重构收敛**，非内容缺失；全部 6 大栏目、10 个一级分类、12 个产品详情均已在。原站大量的「空分类占位页 / 视频分页 / 新闻子栏目 404 入口」不再单独建页。

---

## C. HTTP 冒烟（核心）

### C.1 起服务

```powershell
> npm run preview
> astro preview
astro  v7.3.5 ready in 167 ms
┃ Local    http://localhost:4321/
```

- 端口：**4321**（`Get-NetTCPConnection -LocalPort 4321 -State Listen` 确认监听）。

### C.2 必需页面 URL 请求（curl，真实请求）

| URL | 状态码 | 响应字节 |
|---|---|---|
| `/zh/` | 200 | 35579 |
| `/en/` | 200 | 36082 |
| `/zh/about/` | 200 | 16866 |
| `/en/about/` | 200 | 16891 |
| `/zh/contact/` | 200 | 28147 |
| `/en/contact/` | 200 | 28407 |
| `/zh/products/` | 200 | 27060 |
| `/en/products/` | 200 | 25993 |
| `/zh/products/low-temp-thermoplastics/`（分类页） | 200 | 27541 |
| `/en/products/low-temp-thermoplastics/`（分类页） | 200 | 27717 |
| `/zh/products/easy-lock/ankle-splint/`（产品详情） | 200 | 32009 |
| `/zh/products/pet-thermoplastic/hock-thermoplastic/`（产品详情） | 200 | 32176 |
| `/zh/news/` | 200 | 17051 |
| `/en/news/` | 200 | 17036 |
| `/zh/resources/downloads/` | 200 | 18570 |
| `/zh/resources/videos/` | 200 | 33258 |
| `/zh/search/` | 200 | 17216 |
| `/en/search/` | 200 | 17215 |
| `/favicon.svg` | 200 | 228 |
| `/404.html` | 200 | 13285 |
| `/robots.txt` | 200 | 122 |
| `/index.html`（语言跳转页） | 200 | 507 |

```powershell
curl.exe -s -o NUL -w "%{http_code} %{size_download}" "http://localhost:4321/zh/"
# -> 200 35579
```

- **必需 URL 全部 200**，逐条 curl 实测（上表为完整记录）。

### C.3 全站内链爬取（追加检查，发现坏链）

对全部 62 个构建页提取 `href/src` 内链，去重后逐条请求（70 条唯一内链），**7 条返回非 200**：

| 坏链 URL | 状态 | 来源 |
|---|---|---|
| `/zh/products/easy-lock/` | 404 | 产品详情页**面包屑**「分类」链接 |
| `/en/products/easy-lock/` | 404 | 同上（英） |
| `/zh/products/pet-thermoplastic/` | 404 | 产品详情页面包屑（宠物可塑性 6 个产品） |
| `/en/products/pet-thermoplastic/` | 404 | 同上（英） |
| `/zh/resources/` | 404 | 每个页面页头「资源」主导航（无下拉点击时） |
| `/en/resources/` | 404 | 同上（英） |
| `/en/404/` | 404 | 404 页的语言切换「EN」链接 |

```python
# 爬取逻辑（python + urllib，base=http://localhost:4321）
# crawled 70 internal URLs, 7 broken
```

**缺陷分级：**

- **[主要-1] 12 个产品详情页全部无导航可达性**：产品数据的 `categorySlug` 是二级分类 slug（`easy-lock`、`pet-thermoplastic`），而分类路由 `getStaticPaths` 只生成**一级**分类页（10 个）。后果：
  1. 产品详情页面包屑的「分类」链接 `→ /zh/products/easy-lock/` **404**；
  2. 产品中心首页只列 10 个一级分类卡片，一级分类页（如低温热塑系列）因产品挂在二级 slug 下而显示**空态** → **12 个产品详情从主导航无法触达**（只能通过详情页互链或直接输入 URL）。
  - 证据：`/zh/products/` 页面内所有内链仅 10 个一级分类；`/zh/products/low-temp-thermoplastics/` 内链仅 `products/` 与语言切换，无任何产品卡。
- **[主要-2] 页头「资源」主导航链接 404**：所有页面页头 `<a class="header__nav-link" href="/zh/resources/">资源</a>`（移动抽屉同），而站点未生成 `/resources/` 索引页（仅 downloads/videos 子页）。下拉菜单两项本身可达，但**导航父项直链 404**。
- **[次要-1] 404 页语言切换失效**：`dist/404.html` 内「EN」切换链接指向 `/en/404/` → 404（404 页为单一中文页，未做英文化/英文 404 变体）。

---

## D. 内容存在性

对全部 60 个语言页（30 zh + 30 en）grep 关键文案（公司名、主导航栏目名、页脚信息）：

```python
# 逐页检查：zh 页需含 [天泓医疗, 产品中心, 联系我们, 首页导航]；en 页需含 [Tianhong/Guangzhou, Products, Contact, Home]
# 结果：ALL PASS（60/60 页面导航/页脚/公司名齐全）
```

抽样输出（首页/关于/联系 中英各一轮）：

| 页面 | 公司名 | 主导航 | 页脚 |
|---|---|---|---|
| `zh/index.html` | ✅ 广州天泓医疗/天泓医疗 | ✅ 首页/关于我们/产品中心/资源/新闻动态/联系我们 | ✅ 4 栏 + ICP |
| `en/index.html` | ✅ Guangzhou Tianhong | ✅ Home/About Us/Products/Resources/News/Contact | ✅ 4 栏 + ICP |
| `zh/about/` `/en/about/` | ✅ | ✅ | ✅ |
| `zh/contact/` `/en/contact/` | ✅ | ✅ | ✅ |

**结论：通过**（60/60 无缺失）。

---

## E. 双语一致性

### E.1 字典 key 总数比对（`src/content/zh` vs `src/content/en`）

```powershell
npm run i18n:check
# ✓ 双语完整性校验通过（16 个双语文件：键集合一致 / 命名合法 / 无空值 / 变量一致）
# exit 0
```

叶子 key 统计（递归展平，脚本实测）：

| 语言 | 文件数 | 叶子 key 总数 |
|---|---|---|
| zh | 16 | **463** |
| en | 16 | **464** |

差异：**en 多 1 个 key —— `data/contact.json` 的 `phoneExt`**（`+86 020-82350336-2018`，英文站电话含分机号，与 content-inventory §4.5「英文电话多一分机号」**一致**，属预期差异，非缺 key）。其余 15 个文件 key 集合完全一致，`i18n:check` 亦验证了：

- 键命名合法（`^[a-z0-9_](\.[a-z0-9_]+){0,3}$`）
- 无空值/占位（TBD/TODO/待补充）
- `{var}` 变量集合双语一致

### E.2 `dist/zh` vs `dist/en` 页面数比对

- **30 vs 30**（B.1 已证路径镜像一致）。

### E.3 缺 key / 多 key 明细

- 缺 key：**0**
- 多 key：**1** → `en/data/contact.json:phoneExt`（预期，与原始站英文分机号对应）

---

## F. 设计规范数值落地（grep 构建产物 CSS）

对 `dist/_astro/*.css`（i18n.vZFnEzRx.css 20,961 B + PromoVideo.DDBM3ZwS.css 5,166 B）grep：

| 设计规范项（design-spec.md） | 期望值 | 构建产物中 | 结论 |
|---|---|---|---|
| 主色 primary-600 | `#1A5FB4` | `--color-primary-600:#1a5fb4` ✅（:root 令牌 + 多处应用） | ✅ |
| 科技青 accent-500 | `#00B3A6` | `--color-accent-500:#00b3a6` ✅ | ✅ |
| 品牌渐变 | `linear-gradient(120deg, #1A5FB4 0%, #00B3A6 100%)` | `--gradient-brand:linear-gradient(120deg,#1a5fb4 0%,#00b3a6 100%)` ✅ | ✅ |
| 断点 | 640/768/1024/1280/1536 | `@media (width>=640px)` / `768px` / `1024px` / `1536px` + `--container-max:1280px` ✅ | ✅（1280 作为容器上限令牌，非媒体查询，符合规范表述） |
| prefers-reduced-motion | 动效降级 | `@media (prefers-reduced-motion:reduce)` ✅ | ✅ |
| 字体阶梯 | display 32→48 / h1 28→40 / h2 24→32 / h3 20→24 / h4 17→19 / body-lg 16→18 / body 15→16 / small 13→14 / caption 12 | 移动档 + `@media(width>=1024px)` 桌面档全部命中 ✅ | ✅ |
| 间距/圆角/阴影 | space-3xs~3xl / radius-sm~pill / shadow-sm~lg | 令牌全集出现 ✅ | ✅ |

```css
/* 实测片段（构建产物 :root） */
--color-primary-900:#0b2b52;--color-primary-600:#1a5fb4;--color-accent-500:#00b3a6;
--gradient-brand:linear-gradient(120deg,#1a5fb4 0%,#00b3a6 100%);
--text-display:32px;--text-h1:28px;...@media(width>=1024px){:root{--text-display:48px;--text-h1:40px;...}}
```

**结论：通过**（主色、科技青、5 断点、9 档字号全部落地到构建产物）。

---

## G. 静态结构检查

### G.1 lang / title / meta description（60 页全检）

- **lang**：34 个 zh 页（含根 `index.html` 与 `404.html`，lang=`zh-CN`）+ 30 个 en 页（lang=`en`）——**全部正确**。
- **`<title>`**：60/60 存在（含页面差异化，如 `踝关节拉链型 - 产品中心 - 广州天泓医疗科技有限公司`；原站为全站同名 title，新版已按页差异化，优于原站）。
- **`meta description`**：59/60 存在。例外：根 `index.html`（语言跳转页）无 description —— **次要**（该页为 `<meta http-equiv="refresh">` 跳转壳，无 SEO 诉求，可接受但记录）。

### G.2 hreflang / 语言互指

- 60/60 页均含 `<link rel="alternate" hreflang="zh-CN">`、`hreflang="en"`、`hreflang="x-default"`，且互指 URL 语义正确（`/zh/ ↔ /en/`、产品详情 `/zh/products/easy-lock/ankle-splint/ ↔ /en/...` —— 实测多页）。
- **次要-2**：`dist/404.html` 的 hreflang 指向 `/404/`（单一中文 404 页），且页内「EN」语言切换链接 `/en/404/` → 404（同 C.3 次要-1）。

### G.3 favicon

- `/favicon.svg` → **200**（228 B）；全部页面 `<link rel="icon" href="/favicon.svg">` 存在。

---

## 缺陷汇总

| # | 严重度 | 位置 | 描述 | 影响 |
|---|---|---|---|---|
| F1 | **主要** | 产品分类路由 + 数据 `categorySlug` | 产品挂二级 slug，分类页只生成一级 → 面包屑「分类」链接 404（12 产品 × 中英） | 产品详情**导航不可达**；面包屑坏链 |
| F2 | **主要** | 页头/抽屉导航 | 「资源」主导航直链 `/resources/` 未生成 → 404（全站每页） | 主导航父项失效（子项下拉可用） |
| F3 | **次要** | `404.html` | 「EN」切换链 `/en/404/` 404；hreflang 指向 `/404/` | 404 页语言切换失效 |
| F4 | **次要** | 根 `index.html` | 无 meta description | 跳转壳页，SEO 无实际影响 |

**无阻塞级缺陷**；阻塞 0 / 主要 2 / 次要 2。

---

## 统计

| 检查项 | 通过 | 失败（主要） | 失败（次要） | 覆盖率 |
|---|---|---|---|---|
| A 构建 | 1 | 0 | 0 | 100% |
| B 产物完整性 | 1 | 0 | 0 | 100%（30×2 页全检） |
| C HTTP 冒烟 | 1 | 2（F1/F2） | 1（F3） | 必需 URL 100%；内链 70/70 爬取 |
| D 内容存在性 | 1 | 0 | 0 | 60/60 页 |
| E 双语一致性 | 1 | 0 | 0 | 16 文件 key 全比 + 30×2 页 |
| F 设计数值 | 1 | 0 | 0 | 产物全部 CSS |
| G 静态结构 | 1 | 0 | 2（F3/F4） | 60 页 + favicon |
| **合计** | **7** | **2** | **3** | — |

- 通过项：**7/7**（A–G 全部执行完成）
- 失败缺陷：阻塞 **0** / 主要 **2** / 次要 **3**（F3 在 C、G 各计一次，实际独立问题 4 个）
- 修复建议：F1 见下方「建议下一步」之 1；F2/F3/F4 均为一两行级修复，交回开发。

---

## 遗留项（重要声明）

- ⚠️ **本次为无截图验收，像素级视觉比对未执行**。截图链路（Playwright 截图）经三次尝试不可用，已按任务方指示跳过。**本文所有「通过」均不包含视觉层面结论**，不得视为「视觉验收通过」。
- 视觉遗留项：首页/关于/产品/联系等页面在桌面（≥1024px）与移动断点的实际渲染、配色观感、字体阶梯视觉表现、卡片/表单在浏览器中的真实显示 —— 需人工目视或后续修复截图环境后补做（对应 `docs/acceptance/visual-report.md` 待补批次）。
- 未执行：真实网络部署环境（https、CDN、防盗链）验证；表单提交后端端点（渐进增强无 JS 降级目标）未在无后端环境下实测。

---

## 建议下一步

1. **（主要）修复产品可达性**：二选一 —— ① 为 `easy-lock` / `pet-thermoplastic` 生成二级分类页（`getStaticPaths` 改为展平全部分类含二级，或按产品 `categorySlug` 聚合）；② 把产品 `categorySlug` 改挂到一级分类并把产品卡渲染到一级分类页。同时补全产品详情面包屑分类链接目标。
2. **（主要）补 `/resources/` 索引页** 或将页头「资源」导航直链改为 `/resources/downloads/`（或生成 `/resources/` 聚合页），移除全站 404 导航项。
3. **（次要）** 404 页：英文切换改为 zh 页自身或补 `/en/404/` 变体；根 `index.html` 补 description（可选）。
4. **（视觉遗留）** 修复截图环境后，按 `visual-report.md` 待补批次补拍中英 × 双断点截图，完成像素级比对。
5. 上述修复后回归：`npm run check:all`（typecheck + i18n:check + build）→ 重新跑本报告 C 节内链爬取，确认 7 条坏链归零。