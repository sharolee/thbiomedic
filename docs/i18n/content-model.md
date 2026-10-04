# 双语内容模型（Content Model）

> **版本**：v1.0 ｜ **日期**：2026-10-04 ｜ **作者**：架构师老欧（W2-B / SHAR-22）
> **依据**：`docs/content-inventory.md`（W1-B 盘点基线）、`docs/adr/ADR-002-i18n.md`、`docs/architecture.md`
> **用途**：定义新版站点全部内容实体的字段与命名规范，是字典文件（`src/content/{zh,en}/`）与 TypeScript 类型（`src/types/content.d.ts`）的唯一事实来源。内容填充任务按本文逐实体核对。

---

## 1. 实体总览

| 实体 | 存储位置（`src/content/{lang}/`） | 实例数（双语一致） | 盘点依据 |
|---|---|---|---|
| 页面 Page | `pages/*.json` | 7 个页面级字典文件 | 盘点 §1/§2 |
| 区块 Section | 各页面字典内的命名空间 | 见 §3 | 盘点 §4 |
| 产品分类 Category（一级/二级） | `data/categories.json` | 10 一级 + 17 二级 | 盘点 §3.2/§3.3 |
| 产品 Product | `data/products.json` | 12 | 盘点 §4.1 |
| 新闻 News | `data/news.json`（预留） | 0（双站均空） | 盘点 §4.6 |
| 案例 Case | 不建模（原站无案例栏目） | — | — |
| 下载资源 Download | `data/downloads.json` | 3 | 盘点 §4.4 |
| 视频 Video + 视频栏目 VideoCategory | `data/videos.json` | 3 栏目 | 盘点 §4.4 |
| 联系信息 ContactInfo | `data/contact.json` | 1 | 盘点 §4.5 |
| 荣誉资质 Certificate | `data/certificates.json` | 中 9 / 英 8（差异待确认） | 盘点 §4.2 |

> 「案例」实体：原站无案例/客户栏目，本期不建模；后续若客户要求新增，再按本规范扩展。

## 2. 通用字段约定

所有结构化实体（`data/*.json` 中的对象）遵守：

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `slug` | string | 是 | 英文小写 kebab-case，双语同值，是跨语言对齐的主键（ADR-002 §5.1） |
| `name` | string | 是 | 当前语言显示名 |
| `desc` | string | 否 | 当前语言简介；无内容时省略该键，**禁止空字符串** |
| `images` | object[] | 否 | `{ src, alt }`；`src` 为 `public/assets/` 下相对路径（无语言属性），`alt` 为当前语言 |
| `order` | number | 否 | 排序权重，升序；缺省按数组顺序 |

- **对齐主键**：双语文件通过 `slug`（及数组顺序）对齐，不通过 `name`（name 随语言变化）。
- **媒体字段无语言属性**：视频/PDF 文件本身双语共用，仅标题/描述/alt 随语言（ADR-002 §5.5）。文件名字段统一命名 `file`。
- **禁止空值**：字段无内容就省略键；`""`、`"待补充"`、`"TBD"` 均不允许（CI 空值扫描拦截，PROJECT_STANDARDS 6.5）。

## 3. 页面实体（Page / Section）

页面文案存于 `pages/<page>.json`，每个页面文件是一个 JSON 对象，顶层键即**区块（Section）命名空间**。区块划分与 architecture.md §3.2 组件一一对应：

| 页面文件 | 覆盖路由 | 区块命名空间 | 盘点依据 |
|---|---|---|---|
| `home.json` | `/{lang}/` | `hero`（品牌轮播 3 卡）、`about_summary`、`product_entries`、`promo_video` | §4.3 |
| `about.json` | `/{lang}/about/` | `profile`（公司介绍长文）、`history`（发展历程图）、`certificates_intro` | §4.2 |
| `products-index.json` | `/{lang}/products/` | `intro`、`category_nav` | §1-3 |
| `products-category.json` | `/{lang}/products/<slug>/` | `category_intro`、`empty_state` | §3.3 注 |
| `product-detail.json` | `/{lang}/products/<cat>/<prod>/` | `detail`、`specs`、`inquiry_cta` | §4.1 |
| `resources.json` | `/{lang}/resources/**` | `downloads`、`videos` | §4.4 |
| `news.json` | `/{lang}/news/` | `empty_message` | §4.6 |
| `contact.json` | `/{lang}/contact/` | `info`、`form_intro` | §4.5 |

全站通用区块（导航、页脚、面包屑、表单、语言切换器、搜索）不入页面文件，统一在 `common.json`，命名空间：`nav`、`footer`、`breadcrumb`、`form`、`search`、`lang_switcher`、`common`（按钮/分页等）。

## 4. 产品分类（Category）

```jsonc
// data/categories.json —— 数组，10 个一级分类，children 为二级分类
{
  "slug": "low-temp-thermoplastics",   // 一级分类 slug，双语同值
  "name": "低温热塑系列",               // 随语言
  "desc": "……",                        // 有简介文案的分类必填（如低温热塑支具系列）
  "banner": { "src": "images/banner/xxx.jpg", "alt": "……" },
  "order": 1,
  "children": [
    {
      "slug": "easy-lock",
      "name": "易锁式低温热塑系列",
      "hasProducts": true               // 盘点 §3.3：17 个二级中仅 2 个有产品
    }
  ]
}
```

- 一级分类 10 个、二级 17 个，slug 与盘点 §3.2/§3.3 的 lcid 映射表另存于 `scripts/redirect-map.mjs` 的数据源，字典内**不记录 lcid**（lcid 是旧站实现细节）。
- 空分类（15 个二级无产品）仍保留实体与双语页，通过 `hasProducts: false` + 页面字典 `empty_state` 渲染占位。

## 5. 产品（Product）

```jsonc
// data/products.json —— 数组，12 个产品
{
  "slug": "ankle-splint",
  "categorySlug": "easy-lock",          // 归属二级分类，跨语言同值
  "name": "踝关节拉链型支具",
  "desc": "用于踝关节软组织、跟腱损伤及矫形术后的固定",
  "images": [{ "src": "images/products/ankle-splint.jpg", "alt": "……" }],
  "video": "20211209094814255.mp4",     // 可选，文件名（无语言属性）
  "order": 1
}
```

- 12 个产品 = 易锁式 6 + 宠物网膜 6（盘点 §4.1），中英一一对应，描述为直译关系。
- 详情页富文本（若后续客户补充规格表、适应症列表）扩展 `sections: [{ heading, body }]`，本期不启用。

## 6. 新闻（News，预留）

```jsonc
// data/news.json —— 预留结构，当前为空数组
{ "categories": ["company", "industry", "exhibition"], "items": [] }
```

- 双站新闻列表均为空、三个子栏目 404（盘点 §4.6）。**该栏目去留待客户确认**（见 translation-matrix.md 待确认项 N-1），确认前只建模不上内容。

## 7. 下载资源（Download）与视频（Video）

```jsonc
// data/downloads.json —— 3 项
{ "slug": "ortho-rehab-solutions", "title": "骨科康复解决方案", "file": "20251112135837464.pdf", "size": "32.6MB" }

// data/videos.json
{
  "categories": [
    { "slug": "physical-rehabilitation", "name": "低温热塑板材" }
  ],
  "items": [
    { "slug": "adjustable-knee-demo", "categorySlug": "physical-rehabilitation",
      "title": "可调膝关节支具演示", "file": "20211209094814255.mp4",
      "poster": "images/videos/adjustable-knee.jpg" }
  ]
}
```

- ⚠️ 中英文下载 PDF 是**不同文件**（盘点 §7-4），因此 `file` 字段允许随语言不同；这与「媒体无语言属性」的一般约定不同，是已核实现状的例外，在矩阵中标「待确认」。
- 中英视频数量不一致（中 7 / 英 19，盘点 §4.4）：以 `slug` 对齐，缺的一侧在矩阵中逐条标「待确认」。

## 8. 联系信息（ContactInfo）

```jsonc
// data/contact.json —— 单对象
{
  "phone": "+86 020-82350336",
  "phoneExt": "+86 020-82350336-2018",   // 仅英文站有分机（待确认，矩阵 C-3）
  "email": "thsales@biomedichk.com",
  "address": "广州市黄埔区连云路8号好莱客高新技术产业园12栋2楼",
  "wechatQr": { "src": "images/contact/wechat-qr.png", "alt": "天泓医疗公众号" },
  "social": { "linkedin": "…", "facebook": "…" }   // 无语言属性
}
```

## 9. 荣誉资质（Certificate）

```jsonc
// data/certificates.json —— 数组
{ "slug": "high-tech-enterprise", "title": "高新技术企业",
  "image": { "src": "images/certs/20211128141430515.jpg", "alt": "……" }, "order": 3 }
```

- 中文 9 项 / 英文 8 项，差异项（广东省创新型中小企业）在矩阵标「待确认」（盘点 §7-4）。
- 证书图按语言分文件（同证书不同语言版图），`image.src` 允许随语言不同。

## 10. 命名规范汇总

| 对象 | 规则 | 示例 |
|---|---|---|
| slug | 英文小写 kebab-case，双语同值 | `easy-lock`、`ankle-splint` |
| 字段名 | camelCase | `categorySlug`、`hasProducts` |
| 字典键 | 英文小写、点分层 | 见 `key-convention.md` |
| 媒体文件名 | 保留原站时间戳文件名或语义 slug，二者取一并在 assets 清单登记 | `20251112135837464.pdf` |
| 数组对齐 | 双语数组同序同长，靠 `slug` 交叉校验 | — |
