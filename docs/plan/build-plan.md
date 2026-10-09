# 天泓医疗官网重建 · 整体建设方案（R-S4 定稿）

- **任务**：SHAR-51（人工关卡 2：开工前整体建设方案）
- **日期**：2026-10-09　｜　**决策者**：架构师老欧（强档决策）
- **设计定稿**：`docs/design/prototypes/direction-a-plus/`（客户 2026-10-09 评论拍板）
- **本文性质**：R-S6（SHAR-52）实施的唯一开工依据；与 `PROJECT_STANDARDS.md` v2、`REDLINES.md` v2 配套生效
- **状态**：**已确认**（客户 2026-10-09 于 SHAR-51 评论区拍板三项遗留决策并批准开工），R-S6 据此实施

---

## 1. 背景

- 上一版实现（`src/` 现状，22 个 `.astro`）经 SHAR-46 复盘判定「产物不可用」：页面覆盖不足（49 个语义页面仅覆盖约半数）、内容稀疏（新闻 0、空分类无内容模型）、素材缺失占位、设计老旧（`design-spec.md` v1.0 传统企业蓝 `#1A5FB4`）。
- 重建管线已完成前置阶段：素材 URL 全量盘点（SHAR-47，256 图 / 28 视频 / 6 PDF）、Logo 识图定色（SHAR-49，青蓝 `#0D8FB5` + 橙红 `#E75306`）、风格原型三选一（SHAR-50），客户已选定 **direction-a-plus**（专业克制型 + 视频 Hero + 轻粒子）。
- 本方案回答：用什么建、目录怎么分、页面/组件怎么切、双语怎么组织、素材怎么引、分几步做、怎么验收、出事怎么回滚。

## 2. 约束（显式标注）

| # | 约束 | 来源 |
|---|---|---|
| C1 | HTML + 现代前端技术；双语一一对应、无未翻译占位 | 项目描述 |
| C2 | 素材**原站 URL 直引**，不批量下载 | SHAR-51 任务描述 |
| C3 | `src/` 推倒重做，`docs/` 保留续用 | SHAR-52 既定 |
| C4 | 质量门禁 G1–G5（PROJECT_STANDARDS §5），证据三件套（§6） | 规范 v2 |
| C5 | 不 push、不建远端；push/合并须人确认 | 规范 §7.6 |
| C6 | 宣传片用原站素材即可，**无须 4K 重制**（客户 2026-10-09 拍板） | SHAR-51 评论 |
| C7 | 部署目标未定（本方案只产出平台无关纯静态产物） | ADR-001 R6 |

**显式假设**（不成立需重评）：
1. 原站静态资源防盗链**不拦截**浏览器跨域直引（爬虫侧带 Referer 可访问，浏览器侧 P1 首日冒烟验证，见 R1）。
2. 原站在新版上线后**短期内不下线**（直引依赖原站可用性，见 R2）。
3. 新闻栏目维持空态（原站本无条目，不虚构内容）。

## 3. 关键决策结论（强档决策，扩写交执行层）

### D1 技术栈与构建 —— **Astro 5 SSG**（ADR-001 → Accepted）

- 构建期出纯静态 HTML，默认零客户端 JS；交互点用岛屿按需加载。
- **不引入** Tailwind / React / Vue / UI 组件库。样式为原生 CSS，设计令牌从 `direction-a-plus/styles.css` 的 `:root` 变量块**整块移植**至 `src/styles/variables.css`，全站只此一处定义（门禁 G4 可判定性）。
- TypeScript；Node 22（沿用 `.nvmrc`）；命令沿用 `npm run build / preview / i18n:check`。
- 依据：内容驱动双语静态站、60+ 页同构模板、SEO/性能要求高、团队门槛要低（ADR-001 §4，理由不赘述）。

### D2 实施方式 —— 推倒重做 `src/`，分支隔离

- 新实现在分支 **`feat/site-v2`** 上分批提交；`main` 保持旧版可构建状态直到新版门禁全过。
- 合并回 `main` 须人确认（规范 §7.6）。回滚 = 放弃分支，`main` 未动，零风险（见 §8）。
- 旧实现中**可回收的资产**：`src/content/**` 双语字典键结构与数据填充、`src/utils/i18n.ts` 校验思路、`docs/i18n/` 内容模型——执行层可参考取材，但代码重写，不直接搬运组件。

### D3 双语架构 —— 维持 ADR-002（→ Accepted）

- 路由 `/zh/`、`/en/` 目录前缀，slug 英文小写；`src/content/{zh,en}/` 语言无关键 + 单语言字典；构建期 `npm run i18n:check` 强制键一致（脚本已有，保留复用）。
- 根路径 `/` 302 → `/en/`（对应 hreflang `x-default` 指英文版），`Accept-Language` 智能跳转不做（避免缓存层复杂度，如需后续加）。
- 每页 hreflang 双向 + x-default + 双语 sitemap（构建期生成）。

### D4 设计基线 —— direction-a-plus 令牌为唯一事实源（ADR-004）

- 色板：主色青蓝 `#0D8FB5`（600）/ 深底 `#063845`（900）/ 强调橙红 `#E75306`；字体、字号阶梯、间距、圆角、阴影、动效时长一律以原型 `styles.css` `:root` 为准。
- `docs/design/design-spec.md` v1.0（`#1A5FB4` 旧蓝）**作废**，执行层 B0 批次产出 v2 对齐定稿令牌，门禁 G4 基准随之切换到 v2。
- Logo 用本地已校验透明底文件（`docs/assets/logo/` 4 张 → 择一入 `public/`）；favicon 原站缺失，新版自产（青蓝底图形 + 文字缩写）。

### D5 素材引用策略 —— 原站 URL 直引 + 统一映射层（ADR-003）

- 全站素材（图/视频/PDF）直引 `https://www.thbiomedic.com/...` 原站 URL。**不做本地化迁移为最终决策**（客户 2026-10-09 拍板：直接依赖原站）。
- **唯一出口**：`src/utils/assets.ts` 建立素材 key → 原站 URL 映射表；数据文件与组件只引用 key，禁止散落硬编码完整 URL（保留一键本地化能力以备原站变更，映射层成本极低）。
- 例外本地化：Logo（已下载校验）、favicon（自产）。
- P1 首日做直引可达性冒烟：抽样 20+ 条 URL 真实请求验证防盗链假设（证据留档）。

### D6 交互岛屿（最小集，全部渐进增强、无 JS 可降级）

| 岛屿 | 用途 | 降级方案 |
|---|---|---|
| HeroVideo | 首页视频 Hero（原生 `<video>` + poster） | poster 静态图 + 渐变罩层 |
| Reveal / CountUp | 滚动显现、数字滚动（移植 `effects.js`） | `prefers-reduced-motion` / 无 JS 直接显示 |
| Lightbox | 荣誉证书灯箱（关于页） | 图片直开新页 |
| Search | 站内搜索（构建期生成双语索引 JSON） | 提示改用站点地图/导航 |
| Form | 在线留言（前端校验 + `mailto:` 提交，D7） | 直出 mailto 链接 |
| Carousel | 证书/品牌轮播（关于、首页） | 横向滚动列表 |

语言切换器**非岛屿**：纯服务端渲染的同语义页互链（ADR-002 §5.4）。

### D7 表单提交 —— 邮件直达指定邮箱（ADR-005，客户 2026-10-09 拍板）

- 留言表单提交以 **email 方式发送到指定邮箱**，收件邮箱取原站公开销售邮箱 `thsales@biomedichk.com`（中英站同，盘点 §4.5）。
- 实现采用 `mailto:` 结构化邮件（主题+正文由表单字段拼装，沿用原站 7 字段：称呼/公司*/邮箱*/名*/姓*/手机/内容），提交后 UI 提示已唤起邮件客户端；无 JS 降级同样可用。
- 零外部依赖、零成本、与纯静态平台无关定位一致；收件邮箱在 `src/content/*/data/contact.json` 单点维护。若上线后体验不达标，切第三方表单服务只需改一个提交端点常量（ADR-005 已预留）。

## 4. 目录结构与模块边界

```
├── docs/                          # 保留续用（盘点/规范/设计/ADR）
├── public/
│   ├── logo.png                   # 本地已校验 Logo
│   ├── favicon.*                  # 新产
│   └── robots.txt                 # 构建期生成（含 sitemap）
├── src/
│   ├── content/{zh,en}/           # 双语字典与数据（同键镜像）
│   │   ├── common.json            # 导航/页脚/表单/按钮
│   │   ├── pages/*.json           # home/about/products-index/product-detail/
│   │   │                          #   downloads/videos/news/contact/search/404
│   │   └── data/*.json            # categories(10+17树)/products(12)/videos/
│   │                              #   downloads(3)/certificates(zh9·en8)/news(0)
│   ├── layouts/Base.astro         # <head>：meta/hreflang/sitemap/JSON-LD
│   ├── components/
│   │   ├── layout/                # Header/Footer/Breadcrumbs/LanguageSwitcher/PageHero
│   │   ├── ui/                    # Button/Card/SectionHead/TrustBar/StatBar/岛屿组件
│   │   ├── product/               # CategoryNav/ProductGrid/ProductCard/ProductDetail
│   │   └── content/               # CertificateLightbox/HistoryTimeline/VideoList/NewsList
│   ├── pages/
│   │   ├── index.astro            # / → 302 /en/
│   │   ├── 404.astro（+en 镜像）
│   │   └── {zh,en}/               # 完全镜像：index/about/products/**/resources/**/news/contact
│   ├── styles/                    # variables.css(唯一令牌源)/global.css/components/
│   ├── scripts/                   # 岛屿 TS：reveal/countup/lightbox/search/form
│   ├── utils/                     # i18n.ts/content.ts/seo.ts/url.ts/assets.ts(素材唯一出口)
│   └── types/                     # 内容数据类型定义
└── scripts/                       # check-pages.mjs / check-assets.mjs / check-content.mjs（新实现，挂 check:all）
```

**接口边界**：
- 数据流单向：`content/data/*.json` → `utils/content.ts` 查询 → 页面取数 → 组件只收 props。
- 组件不得自行 import 双语字典（由页面注入当前语言词典）；不得硬编码原站 URL（一律经 `assets.ts`）；不得在组件内写死色值/断点（一律引用令牌变量）——三条均为 G3/G4 可判定检查项。

## 5. 页面覆盖清单（对照 G1：49 个语义页面）

| 页型 | 条目 | zh | en | 路由形态 |
|---|---|---|---|---|
| 首页 | 1 | 1 | 1 | `/zh/` `/en/` |
| 关于我们 | 1 | 1 | 1 | `about/`（含历程+证书） |
| 产品一级分类 | 10 | 10 | 10 | `products/` + `[category]/` |
| 产品二级列表 | 17 | 17 | 17 | `[category]/`（15 空态页照建，含横幅+引导+表单） |
| 产品详情 | 12 | 12 | 12 | `[category]/[product]/` 动态路由 |
| 资源-下载 | 1 | 1 | 1 | `resources/downloads/` |
| 资源-视频列表 | 1+3 | 4 | 4 | `resources/videos/` + `[category]/` |
| 新闻 | 1（空态） | 1 | 1 | `news/`（原站无条目，不虚构） |
| 联系我们 | 1 | 1 | 1 | `contact/` |
| 搜索 | 1 | 1 | 1 | `search/` |
| 404 | 1 | 1 | 1 | `404` |
| **合计** | | **50** | **50** | ≈ 盘点 49 语义页面口径（G1 脚本逐项核对） |

缺口归属预声明：英文站 Company Profile / Company Culture 两页原站即 404（盘点 §2 行 3-4），新版**不建**，归属「原站本就不存在」。

## 6. 分阶段实施计划（R-S6 内 5 批，每批可构建、可预览、独立提交）

| 批次 | 内容 | 完成标志（证据） |
|---|---|---|
| **B0 基线** | 建 `feat/site-v2`；Astro 骨架重初始化；令牌移植 `variables.css`；`design-spec.md` v2；素材映射表 `assets.ts`；check 脚本骨架 | `npm run build` 退出码 0；令牌文件 diff 对齐原型 |
| **B1 布局+首页** | Base/Header/Footer/LanguageSwitcher/HeroVideo/TrustBar/StatBar；首页 zh+en；**直引可达性冒烟（20+ URL 抽样）** | 双语首页可预览；冒烟输出留档 |
| **B2 产品域** | categories/products 数据集（对齐盘点条目数）；一级 10×2、二级 17×2（含空态）、详情 12×2 | `check-pages` 产品域 100%；条目数输出与盘点一致 |
| **B3 其余栏目** | about（历程+证书灯箱）、downloads、videos（zh 8/en 19）、news 空态、contact+Form、search、404 | `check-pages` 全量 100%；`i18n:check` 通过 |
| **B4 门禁自验** | 三个 check 脚本实现并挂 `check:all`；hreflang+sitemap+robots；构建/预览冒烟；截图（能力可用才做，否则如实标注未执行）；G1–G5 自查留档 `docs/acceptance/` | `check:all` 退出码 0 + 门禁记录三件套 |

B4 完成后转 R-S7（SHAR-53）独立验收。模型分档按规范 §11.2：执行层普通档批量实现，强档只做关键复核与本方案修订。

## 7. 验收方式

- 依据：`PROJECT_STANDARDS.md` §5 门禁 G1–G5 + §6 证据三件套，全部通过才可交付；结论由独立于执行者的成员给出。
- G4 基准切换：自 `design-spec.md` v2 生效起，以 direction-a-plus 令牌数值为准（本方案 §3-D4 即定稿依据）。
- G3 补充口径：直引形态下，`check-assets` 检查「产物中的 `thbiomedic.com` 引用必须全部命中 `assets.ts` 映射表 + 抽样可达」，替代「不得直链原站」旧条款（本地化迁移未启动前）。
- 视觉验收：B4 截图（zh/en × 桌面/移动 × 关键页型）；像素级比对依能力可用性如实标注，禁止写「通过」。

## 8. 风险与回滚

| # | 风险 | 概率 | 影响 | 缓解 / 预案 |
|---|---|---|---|---|
| R1 | 原站防盗链拦截浏览器跨域直引（图/视频不出图） | 中 | 高 | P1 首日冒烟前置暴露；命中则升级人工三选一（原站放行 / 本地化迁移 / 替换素材），阻塞上报不静默降级 |
| R2 | 原站下线/改版导致直引断链 | 低（短期）/高（长期） | 高 | `assets.ts` 单点映射，一键切本地路径；上线前人工决策是否整体本地化 |
| R3 | Hero 视频为大文件，首屏加载慢 | 高 | 中 | `preload=none` + poster 先行 + `prefers-reduced-motion` 降级静态图；体积数据 B1 实测后复核 |
| R4 | 空分类/空新闻被判「内容不完整」 | 中 | 中 | 空态页照建有内容（引导+表单），归属预声明（§5），G2 检查按盘点口径 |
| R5 | 表单无后端 | 确定 | 低 | D7 显式降级 + 上线前人工拍板，不阻塞 |
| R6 | 推倒重做期间质量回退 | 中 | 中 | 分支隔离 + 分批提交 + 每批构建门禁；`main` 旧版始终可用 |
| R7 | 强档/执行层协作走样（决策与扩写混淆） | 中 | 低 | 本方案即决策快照；执行层只按 §6 批次扩写，偏离需回本 issue 评审 |

**回滚方式**：全程分支隔离，`main` 不动。任一批次失败 → 丢弃该批次提交即可；整版失败 → 关闭 `feat/site-v2`，`main` 旧版继续可用，无数据迁移、无不可逆操作。唯一沉没成本为分支上的工时。

## 9. 决策摘要（TL;DR)

1. **技术栈**：Astro 5 SSG + 原生 CSS 令牌（direction-a-plus 整块移植），零框架依赖（ADR-001 Accepted）。
2. **双语**：`/zh/` `/en/` 前缀 + 单语言字典 + 构建期键校验（ADR-002 Accepted）。
3. **设计基线**：direction-a-plus 令牌为唯一事实源，design-spec 升 v2（ADR-004）。
4. **素材**：原站 URL 直引，经 `assets.ts` 唯一出口；Logo/favicon 本地（ADR-003）。
5. **实施**：`feat/site-v2` 分支 5 批次（B0–B4），每批可构建可预览；门禁 G1–G5 全过后转 R-S7 独立验收。
6. **已拍板项**（客户 2026-10-09）：表单以 email 方式发指定邮箱（`mailto:` → `thsales@biomedichk.com`）；素材不迁移、直引原站为最终方案；宣传片无须 4K 重制。详见 ADR-003 / ADR-005。

## 10. 参考

- `docs/adr/ADR-001..004`、`docs/architecture.md`、`docs/design/prototypes/direction-a-plus/`
- `docs/content-inventory.md`（49 语义页面基线）、`docs/assets/asset-inventory.md`（素材基线）
- `PROJECT_STANDARDS.md` v2（G1–G5）、`REDLINES.md` v2
