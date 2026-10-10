# 天泓医疗官网重建 · 现场交接（BASELINE）
>
> 作用域：仅 D:\Projects\playground\thbiomedic。状态：B0–B4 全批已落地，R-S7 复验由独立验收方执行。
> 视觉唯一基准：docs/design/prototypes/direction-a-plus/（客户 2026-10-09 拍板）。

## 构建 / 校验

| 命令 | 结果 |
|---|---|
| `npm run check:all` | 退出码 0（tokens/products/content/assets/typecheck/i18n/build/sitemap 串联） |
| `npm run build` | 102 pages（zh/en × 50 + root/404） |
| `npm run check:pages` | G1 页面覆盖 50/语言 ✅ |
| `npm run check:content` | G2 条目数 vs 盘点 ✅（证书 zh10/en10 属 m-1 内容口径，warn 不阻断） |
| `npm run check:assets` | G3 占位 0 / 素材 URL 全命中映射表 / 数据 key 无漂移 ✅ |
| `npm run i18n:check` | 16 双语文件键一致 ✅（videos zh7/en18 豁免登记） |

## 分支

`feat/site-v2`，不 push（C5）。HEAD 提交链：`762e1c1`(B0) → `3af4c83`(B1) → `e7f32cd/d0adb94/736b102`(B2) → `a1533c9/0d7b801`(R-S7 修复+报告) → `f1be38d`(B-1/B-2/M-1/m-3/4/5) → `746b8f1`(B4 收尾) → `b3c5bb0`(B3 首页) → `409a300`(B3 关于+分类 banner) → `f901aa3`(B3 资源)。

## 关键事实

- **一/二级分类路由**：`products/[category]/` 单路由双形态（一级 → 子分类导航；二级 → 产品网格/空态）。一级/二级 slug 不重叠，由 `isFirstLevelSlug` 判定。
- **素材 key 唯一出口**：`src/utils/assets.ts`（290 key）。数据文件只存 key，组件经 `assetUrl()` 解析。`Category.banner` / `Product.images` / `Certificate.image` / `VideoItem.file` / `Download.file` / `about.json image_src` 均为 key。
- **视频口径（B-2 已复核）**：zh 7 支（热塑板材 6 + 患者固定 1，宠物康复空）＝盘点 §4.4；en 18 支。第 8 支 `20211209105027396.mp4` 存在于原站加密分页第 2 页（asset-inventory 记录），静态页未展示、标题不可得，未臆造加入。slug 差异登记 `scripts/i18n-known-gaps.json` exemptions。
- **首页结构（direction-a-plus）**：Hero 视频背景（`vid-20251112162344793` zh / `vid-20251112163145210` en + poster + 浅色罩层 + 轻粒子 canvas `#hero-particles`）→ 信任条（7 项）→ 三大品牌线（POLYEASY/iFIX/POLYEASY PET）→ 数据条（深底 4 项 count-up）→ 新闻（空态）。交互由 `src/scripts/effects.ts`（粒子/reveal/countup）驱动，尊重 prefers-reduced-motion。
- **Astro 7 坑**：`getStaticPaths` 顶层额外键不进 `Astro.props`，必须包 `props:`。
- **dist 全文搜 class 名会误判**：Astro 把所有组件 CSS 内联进 `<head>`，核验只查 `<body>`。
- **面包屑首页重复缺陷（R-S7 未列入，待裁决）**：`Breadcrumbs.astro` 先渲染 `homeLabel`，各页面模板 trail 第一项又是 home → 全站 `首页 | 首页 | X`。修法一行，涉及全部页面模板。
- **证书 zh10/en10 vs 盘点 zh9/en8（m-1）**：属消除中英差异的内容口径变更，需人确认。

## 平台托管文件

`AGENTS.md` 每次 watchdog 强停会被平台清空，**不要读/写/恢复**，架构师/编排者会在续派前恢复。

## 运维

单条命令控制在几分钟内；每完成一大块先评论一条进度再继续（idle watchdog 10 分钟无输出即强停）。
