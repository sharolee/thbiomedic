# W3-4a 截图索引（Screenshot Index）

> 生成：2026-10-06 ｜ SHAR-43 ｜ 采集：全栈老欧（opencode）
> 方式：`npm run build` → `npm run preview`（astro preview，端口 4321，真实访问 200）
> 工具：系统 Chrome 无头 + playwright-core（临时目录安装，仓库零依赖改动）；桌面 1440×900、移动 375×812，`deviceScaleFactor=1`，静态页为全页截图（fullPage）
> 用途：视觉验收官（freeVisual）按 `docs/design/acceptance-checklist.md` 逐条比对，本索引提供 编号/路径/页面/语言/断点 → checklist 条目 的对照
>
> **共 59 张**。全部为真实预览产物截图（非设计稿）；交互态截图附验收证据（URL/状态断言），见文件末尾「交互证据」表。

## 截图清单

编号规则：`checklist-<序号>-<页面>-<语言>-<断点>.png`；断点 `desktop`=1440×900、`mobile`=375×812；除交互态外均为**全页截图**。

| # | 截图文件 | 页面 | 语言 | 断点 | 体积 | 对应 checklist 条目 |
|---|---|---|---|---|---|---|
| 001 | checklist-001-home-zh-desktop.png | 首页 | zh | D | 456KB | A1–A7、A11–A18、B1–B7（三分屏见 019） |
| 001 | checklist-001-home-zh-mobile.png | 首页 | zh | M | 200KB | A7、A11–A13、A16、A18、B3、B4、B7 |
| 001 | checklist-001-home-en-desktop.png | 首页 | en | D | 458KB | A6、B1–B7 |
| 001 | checklist-001-home-en-mobile.png | 首页 | en | M | 211KB | A6、B3、B4、B7 |
| 002 | checklist-002-about-zh-desktop.png | 关于我们 | zh | D | 147KB | A4、A8–A10、B8–B12 |
| 002 | checklist-002-about-zh-mobile.png | 关于我们 | zh | M | 70KB | A8、A9、B11 |
| 002 | checklist-002-about-en-desktop.png | 关于我们 | en | D | 152KB | A6、B8–B12 |
| 002 | checklist-002-about-en-mobile.png | 关于我们 | en | M | 78KB | B11 |
| 003 | checklist-003-contact-zh-desktop.png | 联系 | zh | D | 192KB | B28–B30、C1（空态见 015） |
| 003 | checklist-003-contact-zh-mobile.png | 联系 | zh | M | 111KB | B28、B30 |
| 003 | checklist-003-contact-en-desktop.png | 联系 | en | D | 200KB | B29、B30 |
| 003 | checklist-003-contact-en-mobile.png | 联系 | en | M | 123KB | B28、B30 |
| 004 | checklist-004-products-zh-desktop.png | 产品中心（一级） | zh | D | 203KB | B4、B13 |
| 004 | checklist-004-products-zh-mobile.png | 产品中心（一级） | zh | M | 134KB | B13 |
| 004 | checklist-004-products-en-desktop.png | 产品中心（一级） | en | D | 199KB | B13 |
| 004 | checklist-004-products-en-mobile.png | 产品中心（一级） | en | M | 130KB | B13 |
| 005 | checklist-005-products-category-zh-desktop.png | 产品中心（二级·易锁式） | zh | D | 43KB | B14、B16、B18 |
| 005 | checklist-005-products-category-zh-mobile.png | 产品中心（二级·易锁式） | zh | M | 33KB | B15、B16、B18 |
| 005 | checklist-005-products-category-en-desktop.png | 产品中心（二级·易锁式） | en | D | 43KB | B14、B16、B18 |
| 005 | checklist-005-products-category-en-mobile.png | 产品中心（二级·易锁式） | en | M | 33KB | B15、B16、B18 |
| 006 | checklist-006-products-empty-zh-desktop.png | 产品中心（空分类·拉伸支具） | zh | D | 166KB | B17 |
| 006 | checklist-006-products-empty-zh-mobile.png | 产品中心（空分类） | zh | M | 96KB | B15、B17 |
| 006 | checklist-006-products-empty-en-desktop.png | 产品中心（空分类） | en | D | 172KB | B17 |
| 006 | checklist-006-products-empty-en-mobile.png | 产品中心（空分类） | en | M | 101KB | B17 |
| 007 | checklist-007-product-detail-zh-desktop.png | 产品详情（踝关节固定支具） | zh | D | 137KB | B19–B21 |
| 007 | checklist-007-product-detail-zh-mobile.png | 产品详情 | zh | M | 121KB | B19、B20 |
| 007 | checklist-007-product-detail-en-desktop.png | 产品详情（Ankle Splint） | en | D | 120KB | B19–B21 |
| 007 | checklist-007-product-detail-en-mobile.png | 产品详情 | en | M | 107KB | B19、B20 |
| 008 | checklist-008-resources-downloads-zh-desktop.png | 资源（下载） | zh | D | 149KB | B22、B27 |
| 008 | checklist-008-resources-downloads-zh-mobile.png | 资源（下载） | zh | M | 72KB | B22 |
| 008 | checklist-008-resources-downloads-en-desktop.png | 资源（下载） | en | D | 154KB | B22、B27 |
| 008 | checklist-008-resources-downloads-en-mobile.png | 资源（下载） | en | M | 78KB | B22 |
| 009 | checklist-009-resources-videos-zh-desktop.png | 资源（视频） | zh | D | 208KB | B23、B25 |
| 009 | checklist-009-resources-videos-zh-mobile.png | 资源（视频） | zh | M | 153KB | B23、B25 |
| 009 | checklist-009-resources-videos-en-desktop.png | 资源（视频） | en | D | 184KB | B23、B24 |
| 009 | checklist-009-resources-videos-en-mobile.png | 资源（视频） | en | M | 136KB | B23 |
| 010 | checklist-010-news-zh-desktop.png | 新闻 | zh | D | 149KB | B26、B27 |
| 010 | checklist-010-news-zh-mobile.png | 新闻 | zh | M | 71KB | B26 |
| 010 | checklist-010-news-en-desktop.png | 新闻 | en | D | 146KB | B26、B27 |
| 010 | checklist-010-news-en-mobile.png | 新闻 | en | M | 74KB | B26 |
| 011 | checklist-011-search-empty-zh-desktop.png | 搜索（空结果 `?q=zzznomatch`） | zh | D | 126KB | 搜索空态 |
| 011 | checklist-011-search-empty-zh-mobile.png | 搜索（空结果） | zh | M | 63KB | 搜索空态 |
| 011 | checklist-011-search-empty-en-desktop.png | 搜索（空结果） | en | D | 127KB | 搜索空态 |
| 011 | checklist-011-search-empty-en-mobile.png | 搜索（空结果） | en | M | 64KB | 搜索空态 |
| 012 | checklist-012-404-zh-desktop.png | 404 | zh | D | 43KB | C10 |
| 012 | checklist-012-404-zh-mobile.png | 404 | zh | M | 33KB | C10 |
| 012 | checklist-012-404-en-desktop.png | 404 | en | D | 43KB | C10 |
| 012 | checklist-012-404-en-mobile.png | 404 | en | M | 33KB | C10 |
| 013 | checklist-013-lang-switch-en-desktop.png | 语言切换（zh→en 同语义页） | en | D | 152KB | A18、A19 |
| 013 | checklist-013-lang-switch-zh-mobile.png | 语言切换（en→zh 同语义页） | zh | M | 70KB | A18、A19 |
| 014 | checklist-014-nav-drawer-zh-mobile.png | 移动端导航抽屉（展开） | zh | M | 29KB | A16、A18 |
| 015 | checklist-015-form-error-zh-desktop.png | 留言表单·空提交错误态 | zh | D | 191KB | C1、B30 |
| 015 | checklist-015-form-error-en-desktop.png | 留言表单·空提交错误态 | en | D | 199KB | C1、B30 |
| 016 | checklist-016-form-success-zh-desktop.png | 留言表单·提交成功面板 | zh | D | 173KB | C2 |
| 017 | checklist-017-header-scrolled-zh-desktop.png | 页头滚动阴影 | zh | D | 163KB | A16 |
| 018 | checklist-018-search-bar-zh-desktop.png | 站内搜索条（展开） | zh | D | 320KB | C5 |
| 019 | checklist-019-carousel-zh-desktop-a.png | 首页 Hero 轮播·第 1 帧 | zh | D | 328KB | B1、B2 |
| 019 | checklist-019-carousel-zh-desktop-b.png | 首页 Hero 轮播·第 2 帧 | zh | D | 31KB | B1、B2 |
| 019 | checklist-019-carousel-zh-desktop-c.png | 首页 Hero 轮播·第 3 帧 | zh | D | 31KB | B1、B2 |

## 交互证据（真实断言，非目测）

| 截图 | 断言结果 |
|---|---|
| 013-lang-switch-en-desktop | 从 `/zh/about/` 点击 EN → 落地 `http://localhost:4321/en/about/`（同语义页 ✓） |
| 013-lang-switch-zh-mobile | 从 `/en/about/` 点击 中 → 落地 `http://localhost:4321/zh/about/`（同语义页 ✓） |
| 014-nav-drawer-zh-mobile | `[data-drawer]` 含 `is-open` = true（抽屉展开 ✓） |
| 015-form-error | 空提交后 `.form-error:not([hidden])` 计数 = 4（公司/邮箱/名/姓，✓ C1 错误态触发） |
| 016-form-success | 有效填写提交 → `[data-form-success]` visible=true 且表单 hidden=true（演示态成功面板 ✓ C2） |
| 017-header-scrolled | 滚动 300px 后 `[data-header]` 含 `is-scrolled` = true（✓ A16 阴影态） |
| 018-search-bar | `[data-search-bar]` hidden=false（搜索条展开 ✓） |
| 019-carousel | 三帧活动 slide 索引 = 0 / 1 / 2（轮播可切换，B1 品牌卡三张状态可对照） |

## 采集备注 / 观察点（供验收官重点核对，本轮不修）

1. **005 分类页体积异常**：zh/en 桌面同 43KB、移动同 33KB，页面内容偏少——易锁式分类下 6 个产品卡的渲染是否符合 B16（标题/摘要双行截断），建议放大核对；zh/en 字节数完全一致疑似中英文案差异未体现或截图截断。
2. **019 轮播第 2/3 帧仅 31KB**：与前帧 328KB 差距大，疑似后两帧画面元素较少或背景近纯色；请核验 B1 三张品牌卡（宝力易/固德易/宝力谊）是否都正常渲染（无缺图/白屏）。
3. **灯箱/视频模态未捕获**：B10（发展历程灯箱）、B20（产品图灯箱）、B24（视频页内模态）在 `src/components/` 中**未找到 lightbox/dialog/modal 实现**（grep 零命中），对应交互态本轮无法采集。属实现缺口观察项，不属截图采集遗漏。
4. **视频页 B24 中文站为空态**（B25 预期）：009-zh 截图应为「视频制作中」空态，英文站有视频卡，据此 B23/B25 可判。
5. **体积**：总 7.6MB，最大单张 458KB（首页全页 zh/en），无超 1MB 大图；已按 `.gitignore` 规则入库（未忽略 docs/acceptance/）。

## 复现方式

```powershell
cd D:\Projects\playground\thbiomedic
npm run build && npm run preview   # 端口 4321
# 截图：临时目录安装 playwright-core，executablePath 指向系统 Chrome
```