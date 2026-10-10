# 天泓医疗官网（thbiomedic）开发基线

> 作用域：仅 `D:\Projects\playground\thbiomedic`。
> 状态：基线已锁定，后续会话直接复用；改动需显式声明。

## 1. 构建 / 校验命令（全部前台执行，勿后台化）

| 命令 | 作用 |
|------|------|
| `npm run typecheck` | `astro check`，必须 0 error |
| `npm run i18n:check` | 双语 16 文件键一致性 |
| `npm run check:products` | 产品域 10 一级 + 17 二级 + 12 详情核验 |
| `npm run build` | Astro 构建（当前 102 页：zh/en × 50 + root/404） |
| `npm run check:all` | typecheck + i18n + check:products + build 串联 |
| `npm run check:tokens` | design token 一致性（variables.css ↔ 原型） |

- 工作分支：`feat/site-v2`，**不 push**（C5 约束）。
- Node ≥ 22.12（`.nvmrc`）。

## 2. 页面覆盖口径（验收基线，共 50 语义页/语言）

| 页型 | 数量 | 路由 |
|------|------|------|
| 首页 | 1 | `/zh/` `/en/` |
| 关于 | 1 | `about/` |
| 一级分类 | 10 | `products/[一级]/` |
| 二级列表 | 17（含 15 空态） | `products/[一级]/[二级]/` |
| 详情 | 12 | `products/[一级]/[二级]/[product]/` |
| 资源下载 | 1 | `resources/downloads/` |
| 资源视频 | 1 + 3 分类 | `resources/videos/` + `[category]/` |
| 新闻 | 1（空态） | `news/` |
| 联系 | 1 | `contact/` |
| 搜索 | 1 | `search/` |
| 404 | 1 | `404` |

构建总页数 = 50×2 + 2（root/404）= 102。缺 1 页即门禁不通过。

## 3. 数据层约束（ADR-003 唯一出口）

- 数据文件 `src/content/{zh,en}/data/*.json` 只存 **素材 key**（`img-*` / `vid-*` / `dl-*`），**禁止**硬编码原站完整 URL。
- 组件通过 `import { assetUrl } from '../../utils/assets'` 解析 key → 原站 URL。
- `src/utils/assets.ts` = 256 图 / 28 视频 / 6 PDF 的 key 映射表，唯一事实源。
- 例外本地化：`public/logo.png`、`public/favicon.svg`。

## 4. 双语约束（ADR-002）

- `/zh/` `/en/` 目录前缀路由，slug 英文小写。
- `src/content/{lang}/` 单语言字典；`pages/*.json` + `data/*.json` 键集合中英必须一致。
- 构建期 `i18n:check` 强制校验，键漂移即 fail。

## 5. 设计基线（ADR-004，direction-a-plus 定稿）

- 色板：青蓝 `#0D8FB5`(600) / 深底 `#063845`(900) / 强调橙红 `#E75306`。
- 所有色值/字号/间距/圆角/动效一律引用 `src/styles/variables.css` 令牌（`--color-*` / `--space-*` / `--text-*` / `--radius-*` / `--duration-*`），**组件内禁止硬编码**。
- `docs/design/design-spec.md` v1.0（旧蓝 `#1A5FB4`）已作废。

## 6. 红线（REDLINES v2）

- 禁止删改托管文件 `AGENTS.md`。
- 禁止 push / 建远端（合并须人确认）。
- 缺素材必须阻塞上报，**禁止留占位符**进产物。
- 禁止删测试绕过。
- 占位标记（lorem / 待补 / 占位 / pending-asset / 待迁移）出现在 `dist/` 即该页面不得 done。

## 7. 已完成的批次状态（截至 2026-10-09）

| 批次 | 内容 | 状态 |
|------|------|------|
| B0 | 设计令牌整块移植 + `assets.ts` 映射层 + `check-tokens` | ✅ `762e1c1` |
| B1 | 直引可达性冒烟（防盗链不成立）+ ADR-003 追加 4 约束 | ✅ `3af4c83` |
| B2a | 中文产品域数据（12 详情补实拍素材 key） | ✅ `e7f32cd` |
| B2b | 英文产品域数据同键镜像 | ✅ `d0adb94` |
| B2c | 产品域页面模板（一级/二级 17 含 15 空态/详情动态路由） | ✅ `736b102` |
| R-S7 修复 | 栅格令牌缺失 + 首页宣传视频直引 + 3 项小修 | ✅ `a1533c9` |
| B-1 | 视频分类路由（3 分类 ×2 语言） | ✅ `f1be38d` |
| B-2 | 中文视频数据集按原站 7 支重写 | ✅ `f1be38d` |
| M-1 | 一级分类配图（3 张首页卡） | ✅ `f1be38d` |
| m-3/4/5 | 根路径 /en/ 统一、404 去 hreflang、首页 h1 收敛 | ✅ `f1be38d` |

## 8. 待办（R-S7 报告未闭环项）

- M-2：`docs/design/design-spec.md` 升 v2（对齐 direction-a-plus 定稿令牌）
- M-3：`check:all` 补 `check-pages` / `check-content` / `check-assets` 三个门禁脚本
- M-4：`sitemap.xml` + `robots.txt` Sitemap 行
- B-3：B3 其余栏目（about/contact/news/resources/search）随新基线重建
- m-1：证书条目数 zh 9/en 8 vs 现行 10/10（需人确认内容口径）

## 9. 运维注意

- 平台托管 `AGENTS.md` 每次 watchdog 强停会被清空（平台机制），**不要读/写/恢复它**。
- 单条命令控制在几分钟内，避免 10 分钟无输出触发 idle watchdog。
- 进度评论是保命符：每完成一小步先评论再继续。
- 路径含 `[` `]` 的目录（`[category]`）在 PowerShell 里要用引号包裹，Select-String 需 `-LiteralPath`。
