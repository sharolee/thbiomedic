# 天泓医疗官网重建 · 最终验收报告（R-S7 / SHAR-53）

- **验收人**：审核官小寇（8ece9c40，独立于执行者，符合 PROJECT_STANDARDS §5.6.2）
- **验收时间**：2026-10-09
- **验收对象**：`feat/site-v2` 分支 `src/` 产物（`check:all` 后 `dist/`）
- **依据**：`PROJECT_STANDARDS.md` v2 §5 门禁 G1–G5、§6 证据三件套、§14 验收清单；`docs/plan/build-plan.md` §5 页面覆盖清单、§6 批次计划
- **证据格式**：命令原文 + 完整输出 + 退出码 + 产物路径（§6.3）

---

## 0. 验收结论：**不通过**

| 门禁 | 结论 | 一句话理由 |
|---|---|---|
| G1 页面覆盖度 | **不通过** | 47/50 语义页面/语言，缺视频分类页 3 个/语言 |
| G2 内容完整度 | **不通过** | 中文视频数据集 18 条 vs 盘点 8 条；一级分类卡全无图 |
| G3 素材处理 | **通过（修复后）** | 占位文案已清除、引用 26/26 命中 `assets.ts`、直引冒烟 206 |
| G4 设计基线 | **部分通过** | 令牌与定稿原型 49/49 一致；但 `design-spec.md` 仍为 v1.0 旧蓝，文档与实现不一致 |
| G5 双语一致性 | **通过** | 47/47 页面、16 个双语文件键一致、hreflang 双向 + x-default |
| 构建与预览 | **通过** | `check:all` 退出码 0，preview 13 条抽样全 200 |
| 视觉（像素级/人工目视） | **未验收** | 无可用截图能力；且验收对象本身未完成，不具备目视条件 |

**交付完整性判定**：`docs/plan/build-plan.md` §6 计划的 B3（其余栏目）、B4（门禁自验）**在分支上无提交**。
分支最新提交链为 `762e1c1`(B0) → `3af4c83`(B1) → `e7f32cd`(B2a) → `d0adb94`(B2b) → `736b102`(B2c) → `a1533c9`(本次验收修复)。
R-S6（SHAR-52）仍处于 `in_progress`。**当前产物是 B0–B2 的中间态，不具备"足以替换现有官网"的交付条件**（规范 §1.4）。

---

## 1. 门禁 G1 — 页面覆盖度

### 检查方法（§5.1）

```
cd D:\Projects\playground\thbiomedic
find dist -name "*.html" | wc -l
find dist/zh -name "*.html" | wc -l
find dist/en -name "*.html" | wc -l
```

### 输出

```
total=96 zh=47 en=47
```

退出码 0。产物：`dist/zh/**`、`dist/en/**`、`dist/index.html`、`dist/404.html`。

### 对照（build-plan §5，50 语义页面/语言）

| 页型 | 方案要求 | 实测（每语言） | 差值 |
|---|---|---|---|
| 首页 | 1 | 1 | 0 |
| 关于我们 | 1 | 1 | 0 |
| 产品一级分类 | 10 | 10 | 0 |
| 产品二级列表 | 17 | 17 | 0 |
| 产品详情 | 12 | 12 | 0 |
| 资源-下载 | 1 | 1 | 0 |
| 资源-视频列表 | **1+3** | **1** | **−3** |
| 新闻（空态） | 1 | 1 | 0 |
| 联系我们 | 1 | 1 | 0 |
| 搜索 | 1 | 1 | 0 |
| 404 | 1 | 1 | 0 |
| **合计** | **50** | **47** | **−3** |

### 结论：**不通过**

**阻塞项 B-1**：`src/pages/{zh,en}/resources/videos/` 下无 `[category]/` 动态路由，`/zh/resources/videos/{physical-rehabilitation,patient-immobilization,pet-rehabilitation}/` 三个分类页缺失（共 6 个 HTML）。
`videos.json` 已含 `categories` 字段（3 条），建路由即可闭合。
归属：属 B3 批次未落地，非"原站本就不存在"（原站 `/zn/Videos/list_lcid_*.html` 三页确已抓取，见 `content-inventory.md` §1 行 35-37）。

---

## 2. 门禁 G2 — 内容完整度

### 检查方法（§5.2）

```
node -e "…逐数据集统计 zh/en 条目数…"
```

### 输出

```
categories     zh=10  en=10
products       zh=12  en=12
videos         zh=18  en=18      → items: zh=18 en=18, categories=3
downloads      zh=3   en=3
certificates   zh=10  en=10
news           zh=0   en=0       （items 为空数组）
```

退出码 0。产物：`src/content/{zh,en}/data/*.json`。

### 对照（`docs/content-inventory.md` §0 / §4、`docs/assets/asset-inventory.json`）

| 数据集 | 盘点基线 | 实测 | 判定 |
|---|---|---|---|
| 一级分类 | 10 | 10 | ✅ |
| 二级分类 | 17 | 17 | ✅ |
| 产品详情 | 12 | 12 | ✅ |
| 下载 | 3 | 3 | ✅ |
| 新闻 | 0（原站空） | 0 | ✅ 空态合规，未虚构 |
| **视频 zh** | **列表 8**（asset-inventory 中 `/zn/` 视频 9 条含首页宣传片）／content-inventory §4.4 记 7 | **18** | ❌ |
| 视频 en | 列表 18（+宣传片 19） | 18 | ✅ |
| 证书 | zh 9 / en 8 | **zh 10 / en 10** | ⚠️ |

### 结论：**不通过**

**阻塞项 B-2（中文视频数据集与盘点不符）**
`src/content/zh/data/videos.json` 现有 18 条，其中 `physical-rehabilitation` 16 条 —— 与英文站 `videos.json` 同构同数，判定为**中文站沿用了英文站的 18 支视频**。
实证对照：`docs/assets/asset-inventory.json` 中 pages 含 `/zn/` 的视频仅 9 个文件：

```
20211209094814255.mp4  20211209104947146.mp4  20211209105027396.mp4
20211209112600896.mp4  20211214145246460.mp4  20211215104002648.mp4
20211215104112648.mp4  20211216085643476.mp4  20251112162344793.mp4（首页宣传片）
```

即中文站列表视频应为 8 支；现有数据多出 10 支英文站专属视频，且漏 `20211209105027396.mp4`。
**需内容方决策**：中文站是维持原站 8 支，还是有意与英文站对齐为 18 支（属内容口径，不由验收方代定）。无论哪种，`check-products` 类脚本都未覆盖 videos，需补校验并挂 `check:all`。

**主要项 M-1（一级分类卡全无图）**
`src/content/zh/data/categories.json` 10 条一级分类**均无 `banner` 字段**，`CategoryCard.astro:13` 取 `category.banner` 为空 → 首页 10 个分类卡 + 产品中心页均渲染占位图标：

```
grep -oI "category-card__placeholder" dist/zh/index.html | wc -l   →  11
```

首页同时出现 11 处「筹备中」胶囊（`home.json` `coming_soon`）。盘点 §5.1/§4.3 提供各分类卡图 URL（`20241127150517487.jpg`、`20251111090745331.png` 等），素材齐备但未接线。

**次要项 m-1（证书条目数偏离盘点）**
证书 zh 10 / en 10，盘点为 zh 9 / en 8。多出的 2 条英文侧为「广东省创新型中小企业 / 专精特新中小企业」的英文译文 —— 方向上消除了盘点 §7-4 记录的中英不一致，但属内容口径变更，需人确认后关闭（规范 §9.4）。

---

## 3. 门禁 G3 — 素材处理

### 检查方法（§5.3 + build-plan §7 补充口径）

```
# 1) 产物占位标记扫描（排除合法 HTML placeholder= 属性）
grep -rInE "lorem|待补|占位|pending-asset|TODO:|FIXME|待迁移" dist --include=*.html | grep -vE 'placeholder="'
# 2) 产物素材 URL 是否全部命中 src/utils/assets.ts 映射表
node -e "…解析 assets.ts 映射 vs dist 内素材 URL…"
# 3) 直引可达性冒烟
curl -s -o /dev/null -r 0-1023 -w "%{http_code} %{size_download} %{content_type}" -H "Referer: https://www.thbiomedic.com/zn/index.html" <url>
```

### 输出

修复前：

```
dist/zh/index.html  →  「视频素材待迁移」        （源：src/content/zh/pages/home.json:58）
dist/en/index.html  →  「Video asset pending migration」
```

修复后：

```
=== 占位文案残留检查 ===
(空=已清除)

映射表 URL 数=290   产物引用唯一数=26   未命中=0

https://www.thbiomedic.com/uploadfiles/2025/11/20251112162344793.mp4 -> HTTP 206 收到 1024 字节  type=video/mp4
https://www.thbiomedic.com/uploadfiles/2025/11/20251112163145210.mp4 -> HTTP 206 收到 1024 字节  type=video/mp4
```

退出码 0。

### 结论：**通过（本次验收修复后）**

- 产物无占位文案、无第三方图床、无 AI 生成替代图。
- 素材引用 26/26 命中 `src/utils/assets.ts` 唯一出口（ADR-003 合规）。
- 直引可达性抽样 2/2 返回 206 `video/mp4`，R1 防盗链风险不成立（`docs/acceptance/hotlink-verdict.md` 结论一致）。
- 遗留：映射表 290 个素材 key 中仅 26 个被引用 —— 反映内容仍稀薄，随 B3 落地应上升。

### 已修复项（三类小问题，本次验收就地修复并复验）

| # | 位置 | 问题 | 修法 |
|---|---|---|---|
| F-1 | `src/styles/variables.css` | `--grid-columns` / `--grid-gap` / `--leading-display` **三个令牌被引用但未定义** → `.u-card-grid`（5 处使用）`gap: var(--grid-gap)` 声明无效，**全站卡片网格间距实际为 0**；Hero 标题行高失效 | 补 `--grid-columns: 4`（640px→8，1024px→12）、`--grid-gap: var(--sp-4)`（1024px→`--sp-6`）、`--leading-display: var(--lh-title)` |
| F-2 | `src/content/{zh,en}/pages/home.json`、`src/pages/{zh,en}/index.astro`、`src/components/content/PromoVideo.astro`、`src/types/{dictionary,components}.d.ts` | 首页宣传视频区渲染占位文案「视频素材待迁移」，而真实素材（`vid-20251112162344793` / `vid-20251112163145210`）已在 `assets.ts` 中 → **占位文案进入产物，违反 §5.3「占位标记一旦出现在产物中该页面不得置 done」** | 字典改 `video_key` + `fallback`（浏览器不支持降级文案），页面经 `assetUrl()` 传入 `videoSrc`，组件改渲染原生 `<video>`；顺带移除无效 `poster=""` |
| F-3 | `scripts/smoke-referer-matrix.mjs:21` | 未使用变量 `ORIGIN`，typecheck 报 hint | 删除 |

修复提交：`a1533c9 fix(acceptance): 补齐栅格/行高令牌缺失，首页宣传视频改直引原站真实素材（SHAR-53）`
复验：`npm run check:all` 退出码 0（见 §6）；未定义令牌复检 `未定义令牌: 0`；产物 `dist/zh/index.html` 出现 `<video><source src="…/20251112162344793.mp4">`。

---

## 4. 门禁 G4 — 设计基线

### 检查方法（§5.4）

```
npm run check:tokens
node -e "…扫描 src/ 内 var(--x) 引用 vs src/styles/*.css 定义，输出未定义令牌…"
grep -rnE "#[0-9A-Fa-f]{3,6}\b" src/components src/pages src/layouts
grep -rnE "@media[^{]*(640|768|1024|1280|1536)" src/components src/pages src/layouts
```

### 输出

```
[tokens] 原型 :root 令牌 49 项；命中 49；缺失 0
[tokens] 基准=docs/design/prototypes/direction-a-plus/styles.css  被校验=src/styles/variables.css
[tokens] PASS 全部令牌与原型逐项一致        （退出码 0）

修复前：未定义令牌 3 个（--grid-columns / --grid-gap / --leading-display）
修复后：未定义令牌: 0 （无）

硬编码色值：仅出现在注释中（Breadcrumbs.astro:6-7、Footer.astro:8、PromoVideo.astro:8、404.astro:8、ContactForm.astro:160），无实际声明
硬编码断点：15 处 @media (min-width: 640/768/1024px)
```

### 结论：**部分通过**

✅ 令牌数值与定稿原型 direction-a-plus（客户 2026-10-09 于 SHAR-51 拍板）49/49 逐项一致；`--color-*` 旧命名空间以 `var(--c-*)` 别名承接，旧蓝 `#1A5FB4` 已从声明中清除（仅存注释）。

❌ **主要项 M-2（`design-spec.md` 未升 v2）**
`docs/design/design-spec.md` 头部仍为 `版本 v1.0 ｜ 2026-10-04`，主色 `#1A5FB4`、深底 `#0B2B52`（旧企业蓝），且标注「品牌取舍待客户确认」。
而 `build-plan.md` §3-D4 与 B0 批次明确要求「`design-spec.md` v1.0 作废，执行层 B0 产出 v2 对齐定稿令牌」。
→ 实现对齐了定稿令牌，但**设计基线文档仍是作废版本**，后续执行者读文档会被引向旧值。属文档与实现不一致，需升 v2 后复验。

⚠️ **次要项 m-2（组件内硬编码断点）**
15 处 `@media (min-width: 640/768/1024px)` 字面量，违反 §3.6「以 `variables.css` 变量为准，禁止组件内自定断点值」（`--bp-*` 已定义但未在组件中使用）。不影响渲染，属规范一致性问题。

---

## 5. 门禁 G5 — 双语一致性

### 检查方法（§5.5）

```
npm run i18n:check
find dist/zh -name "*.html" | wc -l ; find dist/en -name "*.html" | wc -l
grep -oE '<link[^>]*rel="(alternate|canonical)"[^>]*>' dist/zh/index.html
grep -oE '<a[^>]*class="[^"]*lang[^"]*"[^>]*>' dist/zh/products/easy-lock/ankle-splint/index.html
```

### 输出

```
✓ 双语完整性校验通过（16 个双语文件：键集合一致 / 命名合法 / 无空值 / 变量一致）   （退出码 0）

zh=47  en=47

<link rel="canonical" href="https://www.thbiomedic.com/zh/">
<link rel="alternate" hreflang="zh-CN" href="https://www.thbiomedic.com/zh/">
<link rel="alternate" hreflang="en" href="https://www.thbiomedic.com/en/">
<link rel="alternate" hreflang="x-default" href="https://www.thbiomedic.com/en/">

<a class="lang-switcher__link" href="/en/products/easy-lock/ankle-splint/" hreflang="en" …>EN</a>
```

### 结论：**通过**

- zh/en 各 47 页，数量一致。
- 16 个双语文件键集合一致、无空值、变量一致。
- hreflang 双向 + x-default（指向英文版，符合 ADR-002 §3.4）。
- 语言切换器在产品详情页指向同语义英文页，未跳首页（符合 ADR-002 §5.4）。

⚠️ **次要项 m-3（根路径语言默认与 x-default 不一致）**
`dist/index.html` 以 meta refresh + JS 默认跳 `/zh/`（JS 判 `navigator.language`），而 `x-default` 指向 `/en/`。ADR-002 §3.4 要求 x-default 指英文版 —— 二者口径冲突，建议统一（要么根跳 `/en/`，要么 x-default 改 `/zh/`）。

⚠️ **次要项 m-4（404 页 hreflang 自指）**
`dist/404.html` 的 `zh-CN` / `en` / `x-default` 三行均指向 `/404/`，该页无语言变体，hreflang 不具备互指关系。建议 404 页不输出 hreflang。

---

## 6. 构建与预览

### 检查方法（§4.2 / §4.4）

```
cd D:\Projects\playground\thbiomedic
npm run check:all
npm run preview -- --port 4321
curl -s -o /dev/null -w "%{http_code}" http://localhost:4321/<path>
```

### 输出（修复后）

```
npm run check:all    →  EXIT=0
  [tokens] PASS 全部令牌与原型逐项一致
  [zh] 一级=10 二级=17 详情=12 二级空态=15
  [en] 一级=10 二级=17 详情=12 二级空态=15
  [zh] 素材 key 全部命中 assets.ts: true
  [en] 素材 key 全部命中 assets.ts: true
  素材映射表 key 总数: 290
  ✓ check-products 通过
  Result (65 files): 0 errors / 0 warnings / 0 hints
  ✓ 双语完整性校验通过（16 个双语文件）
  [build] 96 page(s) built in 2.51s
```

```
preview 冒烟（13 条）：
200 /          200 /zh/      200 /en/          200 /zh/about/
200 /zh/products/            200 /zh/products/easy-lock/
200 /zh/products/easy-lock/ankle-splint/
200 /zh/resources/downloads/ 200 /zh/resources/videos/
200 /zh/news/  200 /zh/contact/  200 /zh/search/  200 /404.html
```

### 结论：**通过**（构建与静态可达性层面）

⚠️ **主要项 M-3（`check:all` 与规范 §4.3 / build-plan B4 口径不符）**
`package.json` 的 `check:all` = `check:tokens && check:products && typecheck && i18n:check && build`，
**缺少 B4 计划中的 `check-pages.mjs` / `check-content.mjs` / `check-assets.mjs` 三个门禁脚本**（规范 §12.1 亦列为未完成项）。
后果：G1/G2/G3 无脚本化门禁，本次验收全部靠手工命令核对 —— 与「门禁可脚本化」要求不符。

⚠️ **主要项 M-4（sitemap 缺失）**
`dist/` 下无 `sitemap.xml`；`dist/robots.txt` 自述「Sitemap 行待接入 @astrojs/sitemap 后补充」。
ADR-002 §3.4 与 build-plan §3-D3 要求「双语 sitemap + robots」，属 B4 交付项，未落地。

---

## 7. 视觉验收（像素级比对 / 人工目视）

### 结论：**未验收（能力缺失 + 对象未完成）** —— 依规范 §4.8 如实标注，不写"通过"

- 本运行时无可用浏览器/截图链路（SHAR-46 已记录截图能力三次失败；本次未再尝试，避免制造"看起来通过"的伪证据）。
- 且验收对象（B3/B4 未落地、首页与其余栏目仍为旧实现）尚未定型，此时像素级比对无意义。
- 建议：B3/B4 完成后，由具备视觉能力的运行时（`deepseek-v4.1-flash` 档）按 `docs/acceptance/screenshot-index.md` 既有矩阵（12 页面 × 中英 × 双断点）重跑，并交人目视。

---

## 8. 交付完整性补充判定（非门禁，但决定能否交付）

`git log` 显示分支 `feat/site-v2` 上：

```
736b102 B2c 产品域页面模板落地（2026-10-09）
d0adb94 B2b 英文产品域数据镜像
e7f32cd B2a 中文产品域数据对齐盘点
3af4c83 B1  直引可达性冒烟判定
762e1c1 B0  设计令牌整块移植 + 素材映射层
```

**阻塞项 B-3：B3、B4 批次在分支上无提交**

逐文件核对最后修改提交：

| 文件 | 最后提交 | 判定 |
|---|---|---|
| `src/pages/zh/index.astro`（首页） | `1961db3`（2026-10-04 W3-2） | **旧实现** |
| `src/pages/zh/about/index.astro` | `1961db3` | **旧实现** |
| `src/pages/zh/contact/index.astro` | `1961db3` | **旧实现** |
| `src/pages/zh/news/index.astro` | `1961db3` | **旧实现** |
| `src/pages/zh/resources/{downloads,videos}/index.astro` | `1961db3` | **旧实现** |
| `src/pages/zh/search/index.astro` | `1961db3` | **旧实现** |
| `src/pages/zh/products/**`（产品域） | `736b102`（B2c） | ✅ 已重建 |

即：`build-plan` §3-D2 承诺的「`src/` 推倒重做」除产品域外**尚未发生**；首页/关于/联系/新闻/资源/搜索 六类页面仍是 SHAR-46 判定「产物不可用」的 2026-10-04 版本，只是被新的 `variables.css` 换肤。B1 声称的「首页 zh+en」在分支上无对应提交。

---

## 9. 问题分级汇总

### 阻塞项（Blocking）—— 必须修复后复验，未过不得置 done

| # | 位置 | 问题 | 建议修法 |
|---|---|---|---|
| **B-1** | `src/pages/{zh,en}/resources/videos/` | 缺视频分类页 3 个/语言（共 6 个 HTML），G1 覆盖 47/50 | 增 `[category]/index.astro` 动态路由，取 `videos.json` 的 `categories` |
| **B-2** | `src/content/zh/data/videos.json` | 中文视频 18 条 vs 盘点 8 条，实为英文站数据集，**内容口径错误** | 人确认口径（维持原站 8 支 / 对齐英文 18 支）后按结论重写，并补 videos 条目数校验进 `check:all` |
| **B-3** | `feat/site-v2` 分支 | B3（其余栏目重建）、B4（门禁自验）**未落地**；首页等 6 类页面仍为 2026-10-04 旧实现 | 由 R-S6（SHAR-52）执行层按 `build-plan` §6 继续推进 B3→B4 |

### 主要项（Major）—— 不阻断但显著影响"足以替换现有官网"

| # | 位置 | 问题 | 建议修法 |
|---|---|---|---|
| **M-1** | `src/content/{zh,en}/data/categories.json` | 10 个一级分类均无 `banner` 字段 → 首页/产品中心 11 处占位图标 + 11 处「筹备中」 | 按盘点 §4.3/§5.1 补 `banner:{key,alt}`，key 取自 `assets.ts` |
| **M-2** | `docs/design/design-spec.md` | 仍为 v1.0 旧蓝 `#1A5FB4`，与已定稿 direction-a-plus 令牌冲突 | 升 v2，数值以 `direction-a-plus/styles.css` `:root` 为准，标注定稿 |
| **M-3** | `package.json` → `check:all` | 缺 `check-pages` / `check-content` / `check-assets` 三个门禁脚本 | B4 实现并挂载，同步更新规范 §4.3 与 §12.1 |
| **M-4** | `dist/` | 无 `sitemap.xml`；`robots.txt` 未含 Sitemap 行 | 接入 sitemap 生成（ADR-002 §3.4） |

### 次要项（Minor）—— 记录，可随后续批次处理

| # | 位置 | 问题 |
|---|---|---|
| m-1 | `certificates.json` | zh 10 / en 10 vs 盘点 zh 9 / en 8（方向为消除中英差异，需人确认） |
| m-2 | 15 处组件/页面 | `@media` 断点字面量，未走 `--bp-*` 变量（§3.6） |
| m-3 | `dist/index.html` | 根路径默认跳 `/zh/`，与 `x-default` 指 `/en/` 冲突 |
| m-4 | `dist/404.html` | hreflang 三行自指 `/404/`，无互指关系 |
| m-5 | `dist/zh/index.html` | 3 个 `<h1>`（品牌卡标题），且无站点级主 h1 |

---

## 10. 修复前后对照（本次验收已修复项）

| 项 | 修复前 | 修复后 | 证据 |
|---|---|---|---|
| 卡片网格间距 | `gap: var(--grid-gap)` 令牌未定义 → 间距 0 | `--grid-gap` 定义并响应式升档 | `dist/_astro/*.css` 含 `--grid-gap:var(--sp-4)` / `--grid-gap:var(--sp-6)` |
| Hero 标题行高 | `--leading-display` 未定义 → 行高失效 | `--leading-display: var(--lh-title)` | 未定义令牌复检 = 0 |
| 首页宣传视频 | 占位文案「视频素材待迁移」 | 真实 `<video>` + 原站 mp4 | `dist/zh/index.html` 含 `<source src="…/20251112162344793.mp4">`；冒烟 206 `video/mp4` |
| typecheck hint | `smoke-referer-matrix.mjs:21` ORIGIN 未使用 | 已删除 | `Result (65 files): 0 errors / 0 warnings / 0 hints` |

提交：`a1533c9`（未 push，符合规范 §7.6）。

---

## 11. 建议下一步

1. **R-S6（SHAR-52）继续 B3**：视频分类页路由（B-1）+ 其余栏目随新基线重建（B-3）+ 一级分类配图（M-1）。
2. **人就 B-2 内容口径拍板**：中文站视频维持原站 8 支，或与英文站对齐 18 支。
3. **B4 门禁自验**：三个 check 脚本落地并挂 `check:all`（M-3）、sitemap（M-4）、`design-spec.md` 升 v2（M-2）。
4. **复验**：上述阻塞项闭合后，由独立验收者重跑 G1–G5；视觉验收交具备视觉能力的运行时并留人目视结论。

---

### 附：本报告全部证据命令（可复跑）

```bash
cd D:\Projects\playground\thbiomedic

npm run check:all                      # 退出码 0，96 page(s)
npm run check:tokens                   # 49/49 PASS
npm run check:products                 # 一级=10 二级=17 详情=12 空态=15（zh/en）
npm run i18n:check                     # 16 个双语文件通过
npm run typecheck                      # 0 errors / 0 warnings / 0 hints
npm run preview -- --port 4321         # 13 条抽样全 200

find dist -name "*.html" | wc -l                     # 96
find dist/zh -name "*.html" | wc -l                  # 47
find dist/en -name "*.html" | wc -l                  # 47
grep -rInE "lorem|待补|占位|pending-asset|待迁移" dist --include=*.html | grep -vE 'placeholder="'   # 空
grep -rlI "category-card__placeholder" dist          # 8 个页面
grep -oI "category-card__placeholder" dist/zh/index.html | wc -l   # 11
find dist -iname "*sitemap*"                         # 空
```
