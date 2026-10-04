# 文案 Key 命名规范（Key Convention）

> **版本**：v1.0 ｜ **日期**：2026-10-04 ｜ **作者**：架构师老欧（W2-B / SHAR-22）
> **依据**：ADR-002 §5.2、PROJECT_STANDARDS §6.2、content-model.md
> **强度**：【必须】——`pnpm i18n:check` 按本规范校验，不符合即构建失败。

---

## 1. 总则

1. 键名**只用英文小写字母、数字、下划线、点**：`[a-z0-9_.]`。
2. 结构：`<命名空间>.<区块>.<语义字段>`，点分层，最多 4 层。
3. **语义化，不结构化**：键描述「这段文案是什么」，不描述「它在页面第几个位置」。
4. **语言无关**：键在 zh/en 两套字典中完全一致（同键不同值），键本身不含 `zh`/`en`。
5. 共享组件（导航、页脚、表单、面包屑、搜索、语言切换器）的键**全局唯一**，只定义在 `common.json`，页面文件不得重复定义。
6. 单段内多词用下划线：`first_name`、`empty_message`。

## 2. 命名空间划分

| 命名空间 | 所在文件 | 覆盖范围 | 示例 |
|---|---|---|---|
| `nav` | `common.json` | 主导航 6 项 + 产品下拉 | `nav.products` |
| `footer` | `common.json` | 页脚栏目、ICP、社交 | `footer.icp` |
| `form` | `common.json` | 在线留言表单（全站通用组件） | `form.email` |
| `breadcrumb` | `common.json` | 面包屑 | `breadcrumb.home` |
| `search` | `common.json` | 站内搜索 | `search.placeholder` |
| `lang_switcher` | `common.json` | 语言切换器 | `lang_switcher.label` |
| `common` | `common.json` | 通用按钮/分页/状态 | `common.learn_more` |
| `home` | `pages/home.json` | 首页区块 | `home.hero_title_1` |
| `about` | `pages/about.json` | 关于我们 | `about.profile_body` |
| `products` | `pages/products-*.json` | 产品中心页面级文案 | `products.empty_state` |
| `resources` | `pages/resources.json` | 下载/视频页面文案 | `resources.downloads_title` |
| `news` | `pages/news.json` | 新闻页 | `news.empty_message` |
| `contact` | `pages/contact.json` | 联系页 | `contact.form_intro` |

> 结构化数据（分类树、产品、视频、证书、联系方式）**不走点键**，走 `data/*.json` 的 `slug` 实体（见 content-model.md）。点键只用于页面/组件文案。

## 3. 正例与反例

### 3.1 命名风格

| ✅ 正例 | ❌ 反例 | 反例问题 |
|---|---|---|
| `nav.products` | `nav.Products` | 大写 |
| `nav.products` | `nav.产品中心` | 非英文 |
| `form.first_name` | `form.firstName` | camelCase（键内统一下划线） |
| `form.first_name` | `form.first-name` | 连字符（键内统一下划线，连字符仅用于 slug） |
| `home.hero_title_1` | `home.h1` | 无语义 |
| `products.empty_state` | `products.div2_text` | 结构化（按 DOM 位置命名） |
| `common.learn_more` | `common.了解更多` | 非英文 |
| `about.profile_body` | `about.profile-body.long-text.p1` | 超过 4 层、冗余层级 |

### 3.2 组织方式

| ✅ 正例 | ❌ 反例 | 反例问题 |
|---|---|---|
| 导航文案放 `common.json` 的 `nav.*` | 在 `home.json` 里重复定义 `home.nav_home` | 共享键必须全局唯一 |
| `product-detail.json` 用 `products.inquiry_cta` | 12 个产品各建 `products.ankle_splint_cta` … | 通用文案按语义复用，不按实例复制 |
| 产品名称放 `data/products.json` 的 `name` 字段 | 产品名写成 `products.ankle_splint_name` 点键 | 结构化数据走实体不走点键 |
| 视频标题放 `data/videos.json` 的 `title` | `resources.video_1_title` | 同上，且数字编号脆弱 |

### 3.3 语言相关

| ✅ 正例 | ❌ 反例 | 反例问题 |
|---|---|---|
| zh/en 两个文件键集合完全一致 | en 少 `home.promo_video_title` | `i18n:check` 拦截 |
| 无内容的键直接不写，由填充任务补 | `"desc": ""` 或 `"desc": "待翻译"` | 禁止空值/占位（PROJECT_STANDARDS 1.3） |
| 键不含语言：`nav.contact` | `nav.contact_zh` | 键语言无关 |

## 4. 复数、日期、单位与占位变量

本站为静态企业官网，**无需要复数规则的文案场景**（无购物车、无计数消息）。约定如下，预留扩展：

| 场景 | 约定 | 示例 |
|---|---|---|
| 复数（预留） | 若未来出现，用 `_zero` / `_one` / `_other` 后缀（ICU MessageFormat 简化集）；中文通常只定义 `_other` | `results_found_other: "共 {count} 条结果"` |
| 占位变量 | 花括号 `{var}`，变量名 camelCase；双语键的变量集合必须一致 | `"搜索结果：{query}"` / `"Results for: {query}"` |
| 日期 | 字典只存展示模板，不存具体日期；格式中文 `YYYY年M月D日`、英文 `MMM D, YYYY`，由 `utils/i18n.ts` 按语言格式化 | `news.published_at: "发布于 {date}"` |
| 单位 | 数值与单位分列：数值进数据字段（如 `size: "32.6MB"`），文案不内嵌单位换算；单位写法随语言（中文「32.6MB」直接附值，英文同），不做自动换算 | 见 `data/downloads.json` |
| 品牌词 | 品牌名不翻译，字典值中原样保留：宝力易®/Polyeasy®、固德易®/iFIX®、宝力谊®/Polyeasy® Pet；对应关系见盘点 §7-5 | — |

## 5. 校验规则（`scripts/i18n-check.mjs` 实现依据）

1. **键集合一致**：递归比较 zh/en 同名文件键集合，差异即失败。
2. **无空值**：值为 `""`、纯空白、`待补充`/`TBD`/`TODO` 即失败。
3. **命名合法**：键不匹配 `^[a-z0-9_]+(\.[a-z0-9_]+){0,3}$` 即失败。
4. **变量一致**：同一键双语值中的 `{var}` 集合一致。
5. **slug 对齐**：`data/*.json` 双语数组按 `slug` 集合比较（数量不一致的已核实差异项在 translation-matrix.md 登记为「待确认」，校验脚本读豁免清单 `scripts/i18n-known-gaps.json`，豁免项必须引用矩阵条目编号）。
