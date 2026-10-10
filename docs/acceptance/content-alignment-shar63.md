# SHAR-63 原版网站内容逐项对齐对照表

> 执行时间：2026-10-10 ｜ 对照基线：`docs/content-inventory.md` + 原站实测（https://www.thbiomedic.com/zn/index.html 及 /index.aspx，本执行实抓 13 个关键页面全部 HTTP 200）
> 判定口径：已对齐 = 新版有对应页且内容完整、与源语言互为直译（取并集不臆造）；已修复 = 本次执行修复后对齐；仍缺失 = 原站存在但新版未覆盖。

## 0. 本次执行修复项（SHAR-63）

| # | 位置 | 问题（对照原站） | 修法 | 证据 |
|---|---|---|---|---|
| F-1 | `src/pages/{zh,en}/resources/videos/index.astro` + `[category]/index.astro`（4 文件） | 视频卡片 `<video>` 未渲染 `poster`；原站每张视频卡均有缩略图（实抓 `background-image` 17 项），新版 zh/en 视频页均显示灰底 | 模板补 `poster={item.poster ? assetUrl(item.poster) : undefined}`（沿用 ADR-003 assets.ts 唯一出口） | `dist/zh/resources/videos/index.html` posters=7、`dist/en/.../index.html` posters=18；物理康复分类页 zh=6 en=16 |
| F-2 | `src/content/en/data/videos.json` | 18 支英文视频全部缺 `poster` key（原站每支都有缩略图；`assets.ts` 中 18 张图已存在但未接线） | 按原站实抓映射补齐 18 个 `poster` key（img-20211128120507328 等） | `ALL KEYS PRESENT`；check-assets 未命中=0 |
| F-3 | `src/content/en/data/downloads.json` | Polyeasy Pet Catalogue 标注 1.5MB（实 27.7MB）、iFIX 2.0MB（实 1.0MB）——向访客展示错误文件大小 | 按原站 HTTP Content-Range 实测值修正：pet 1.5→26.4MB、ifix 2.0→1.0MB（zh 侧 3 项大小亦实测复核无误） | 实测 bytes：pet-rehab 27685561≈26.4MB、ifix 1040899≈1.0MB、en-ortho 32650324≈31.1MB |
| F-4 | `src/components/product/SubCategoryList.astro` + `src/types/components.d.ts` + 2 个分类页 | 共享组件硬编码英文 `aria-label="Subcategories"`，中文站 DOM 也渲染英文无障碍标签 | 新增 `ariaLabel` prop，传 `page.subcategory_title`（中"子分类"/英"Subcategories"） | typecheck 0 errors；`aria-label="子分类"` 出现在 zh 分类页产物 |
| F-5 | `src/content/{zh,en}/pages/about.json` | 死键 `skeleton_title` / `skeleton_body`（"内容整理中"占位文案）从未被任何组件渲染 | 双语言同步删除（i18n:check 键一致性不受影响） | i18n:check 通过（16 文件键一致） |

## 1. 主栏目逐项对照

| # | 原站页面（中文 / 英文） | 新版页面 | 判定 | 说明 |
|---|---|---|---|---|
| 1 | 首页 `/zn/index.html` / `/index.aspx` | `/zh/` `/en/` | ✅ 已对齐 | 3 品牌卡（宝力易®/固德易®/宝力谊® ↔ Polyeasy®/iFIX®/Polyeasy Pet®）、关于我们摘要、宣传视频（中 20251112162344793 / 英 20251112163145210 各自原站真实文件）、产品入口卡、新闻空态 |
| 2 | 关于我们 `/zn/AboutUs/index.html` / `/AboutUs/index.aspx` | `/zh/about/` `/en/about/` | ✅ 已对齐 | 公司介绍三段、发展历程图（img-20240927092611098 / img-20240925141900944）、荣誉资质网格（实图直引）；对应原站页内内容 |
| 3 | 产品中心 一级 10 分类 `/zn/Products/index.aspx?lcid=58…` / lcid=42… | `/zh/products/{slug}/` 10 个一级分类页 | ✅ 已对齐 | 10+10 分类 slug 完全同构；分类描述为原站抓取文案（如实核对 lcid=58/36/37 desc） |
| 4 | 产品中心 二级 17 列表页 | `/zh/products/{slug}/{child}/` 17 个二级分类页 | ✅ 已对齐 | 17+17 同构；`hasProducts` 与原站一致（仅易锁式/宠物可塑性外固定网膜有产品，其余 15 空分类按原站为空的实际呈现"筹备中"空态，未虚构产品） |
| 5 | 产品详情 12 个/语言 | `/zh/products/{slug}/{product}/` 12 个详情页 | ✅ 已对齐 | 易锁式 6 + 宠物 6；名称/描述与盘点 §4.1 一一对应，图 key 全命中 assets.ts |
| 6 | 资源-下载 `/zn/Downloads/list.aspx`（3 PDF） | `/zh/resources/downloads/`（3 PDF） | ✅ 已修复 | zh/en 各 3 PDF，文件 key 与原站一致；本次修正英文侧 2 项大小标注（F-3），zh 侧 3 项大小已实测复核 |
| 7 | 资源-视频 `/zn/Videos/list.html` + 3 分类 | `/zh/resources/videos/` + 3 分类页 | ✅ 已修复 | 3 分类（低温热塑板材/患者固定/宠物康复）；zh 7 支 / en 18 支 = 原站口径（盘点 §4.4/§5.3）；本次修复全站视频卡 poster（F-1/F-2）——原站每张视频卡有缩略图，修复后一致 |
| 8 | 新闻动态 `/zn/News/list.html`（原站即空） | `/zh/news/`（空态 + CTA） | ✅ 已对齐 | 原站中英文新闻列表均为空（盘点 §4.6 实录），新版保持空态 + 联系我们 CTA，未虚构条目 |
| 9 | 联系我们 `/zn/ContactUs/index.html` / `/ContactUs/index.aspx` | `/zh/contact/` `/en/contact/` | ✅ 已对齐 | 电话（zh 无分机 / en 含 -2018 分机，忠于原站各自口径）、邮箱、地址、公众号二维码（实图直引）、LinkedIn/Facebook、留言表单（mailto，ADR-005） |
| 10 | 搜索（原站 jQuery 站内搜索） | `/zh/search/` `/en/search/` + JSON 端点 | ✅ 已对齐 | 客户端索引搜索，结果覆盖产品/分类/视频/下载 |
| 11 | 404 | `/404.html` | ✅ 已对齐 | 新版优于原站（原站无独立 404 页） |

## 2. 页头 / 页脚逐项对照

| 组件 | 原站 | 新版 | 判定 |
|---|---|---|---|
| 主导航 | 首页/关于我们/产品中心▾(10)/资源▾(下载·视频)/新闻动态/联系我们 + 搜索 + 中EN | 同构（`common.json` nav） | ✅ 已对齐 |
| 页头 Logo | Top002908_logo（原站 CDN，已失效过） | 本地化 `localAsset('logo')`（SHAR-61 已修复） | ✅ 已对齐 |
| 页脚栏目 | 关于我们/产品中心(10)/资源/新闻动态/联系我们 + LinkedIn/Facebook | 品牌块+公众号QR+关于/产品(10)/资源/联系 + LinkedIn/Facebook | ✅ 已对齐 |
| 页脚 ICP | ICP证0301 → beian.miit.gov.cn | 同链路 | ✅ 已对齐 |
| 页脚建站商 | Wanhu | 保留 Wanhu 署名 | ✅ 已对齐 |

## 3. 素材逐项核实

| 类别 | 原站 | 新版 | 判定 |
|---|---|---|---|
| 图片 | 119 项 /uploadfiles/ | assets.ts 映射 290 key，产物引用全命中，未命中=0 | ✅ 已对齐 |
| 实存性 | — | 本次实测 97 个被引用素材 URL 全部 HTTP 200 | ✅ 无破损图 |
| 视频 MP4 | 27 个（zh 8 / en 19） | zh 7 列表+1 宣传片=8 / en 18 列表+1 宣传片=19 | ✅ 已对齐 |
| PDF | 6 个 | zh 3 + en 3，文件 key 一一对应 | ✅ 已对齐 |
| 公众号二维码 | 天泓医疗 / Onesky Medical | `localAsset('wechat-qr')` 本地实图（SHAR-61） | ✅ 已对齐 |

## 4. 待人工确认项（非缺失，口径决策）

| # | 事项 | 现状 | 建议 |
|---|---|---|---|
| m-1 | 证书条目 zh 10 / en 10 vs 盘点 zh 9 / en 8 | 新版按"取并集"补齐了英文侧 2 项广东省级认证译文，中英差异已消除（R-S7 记录 m-1） | 内容方确认后关闭 check-content 的 warn |
| m-2 | 中英文首页宣传片是两个不同 mp4（20251112162344793 vs 20251112163145210） | 各自指向原站真实文件 | 内容方确认两片内容口径 |
| m-3 | 中英骨科康复解决方案 PDF 是两个不同文件 | 各自指向原站真实文件 | 内容方确认内容一致性 |
| m-4 | 15 个空二级分类 | 与原站一致（原站即无产品），呈"筹备中"空态 | 若后续补产品数据，接入 products.json 即可 |

## 5. 验收命令与输出

```
> npm run check:all
[tokens] 原型 :root 令牌 49 项；命中 49；缺失 0        → PASS
[zh] 一级=10 二级=17 详情=12 二级空态=15
[en] 一级=10 二级=17 详情=12 二级空态=15
[check-products 通过：条目数对齐盘点，中英同键镜像，素材 key 全命中]
[zh] 一级分类=10 二级分类=17 产品详情=12 视频=7 下载=3 证书=10 新闻=0
[en] 一级分类=10 二级分类=17 产品详情=12 视频=18 下载=3 证书=10 新闻=0
[warn] [zh/en] 证书条目 10 ≠ 原站盘点 9/8（m-1 内容口径，需人确认）
[check-assets 通过：无占位标记、素材引用全命中 assets.ts]
typecheck: 0 errors / 0 warnings / 0 hints
i18n:check 通过（16 个双语文件）
[build] 102 page(s) built in 1.30s；[sitemap] 100 URLs → dist/sitemap.xml
退出码 0

> dist 实测（修复后）
dist/zh/resources/videos/index.html  posters=7
dist/en/resources/videos/index.html  posters=18
dist/zh/resources/videos/physical-rehabilitation/index.html  posters=6
dist/en/resources/videos/physical-rehabilitation/index.html  posters=16
dist/zh/resources/downloads/ 6.5MB / 2.5MB / 1.0MB（与服务器实测一致）
dist/en/resources/downloads/ 31.1MB / 26.4MB / 1.0MB（与服务器实测一致）
grep -rInE "lorem|待补|占位|pending-asset|TODO:|FIXME|待迁移" dist → 空（CLEAN）
```