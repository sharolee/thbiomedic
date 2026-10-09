# ADR-003：素材引用策略（原站 URL 直引 + 统一映射层）

- **状态**：已接受（Accepted）且为**最终决策**——客户 2026-10-09 于 SHAR-51 评论拍板「素材不迁移，直接依赖原站」
- **日期**：2026-10-09　｜　**决策者**：架构师老欧
- **相关文档**：`docs/assets/asset-inventory.md`（素材基线）、`PROJECT_STANDARDS.md` §5.3（门禁 G3）、`docs/plan/build-plan.md` §3-D5

## 1. 背景

上一版因素材（PDF/视频/图片）无法批量获取而大量留占位，被判不可用。重建期改为「先盘点 URL、新版直接引用原站 URL，不下载文件」（SHAR-47/51 既定方向）。素材基线：图片 256、视频 28、PDF 6、Logo 4（已下载校验）、favicon 缺失、抓取失败 8（原站真实 404）。

## 2. 决策

1. **直引**：全站图片/视频/PDF 一律引用原站 URL（`https://www.thbiomedic.com/uploadfiles/...`），本期不做批量下载迁移。
2. **唯一出口**：新建 `src/utils/assets.ts`，维护「素材 key → 原站 URL」映射表（key 沿用盘点清单命名）。数据文件与组件只引用 key；**禁止在数据/模板中散落硬编码完整 URL**。
3. **例外本地化**：Logo（`docs/assets/logo/` 已下载、透明底、已校验）放入 `public/`；favicon 原站缺失，新版自产。
4. **可达性核查**：`scripts/check-assets.mjs` 检查产物中所有 `thbiomedic.com` 引用均命中映射表，并对映射表抽样真实请求验证可达。
5. **迁移触发条件的最终裁定**（客户 2026-10-09）：**不迁移**。原站变更/下线风险被显式接受；`assets.ts` 单点映射仅作为低成本应急能力保留，若原站变更导致断链，届时再升级人工决策。

## 3. 备选方案对比（结论级）

| 方案 | 优势 | 劣势 | 结论 |
|---|---|---|---|
| A. 原站 URL 直引 | 零下载成本、素材即取即用、URL 与盘点一一可核对 | 依赖原站可用性；跨域防盗链待验证；带宽由原站承担 | ✅ 本期采用 |
| B. 全量本地化迁移 | 自主可控、性能可控 | 需先解决批量下载与存储；与「不下载」的任务方向冲突 | 备选（触发条件 5） |
| C. 第三方图床/占位服务 | — | 引入外部依赖，违反门禁 G3「禁止第三种形态」 | ❌ 禁止 |

## 4. 风险与回滚

- 防盗链风险由 P1 首日冒烟（20+ URL 抽样真实请求）前置暴露；命中即阻塞上报，禁止占位降级（REDLINES v2）。
- 回滚成本极低：映射层单点切换，本地化迁移仅需把映射表 URL 换成 `public/assets/` 路径并补文件，业务代码零改动。

---

## 5. 修订 R1（2026-10-09 直引冒烟结论，SHAR-52 B1）

**冒烟证据**：`docs/acceptance/smoke-assets-with-referer.txt`、`smoke-referer-matrix.txt`、`smoke-hotlink.txt`、`smoke-hotlink-retest.txt`，判定详见 `docs/acceptance/hotlink-verdict.md`。

### 5.1 结论：build-plan 风险 R1「防盗链拦截」不成立

- 三轮共 60+ 次请求，**0 次 403/401**；失败形态仅为连接被切断（`fetch failed`）与 `200 + content-length:0` 空体。
- 同一 URL、同一 Referer 在相邻轮次间反复横跳（成功/失败互转），失败与 Referer 分组无相关性 → 判定为原站上游（`openresty` + SDWAF）限流/抖动，非定向拦截。
- 任意非空 Referer 均放行，包括 `example.com`、`localhost`、Vercel 域名 → **不存在域名白名单**。

### 5.2 但发现一条确定性行为，须固化为工程约束

无 Referer 请求 **100% 返回 `200 + content-length:0` 空体**（无 `content-type`、无 `cache-control`、无 `etag`），即原站 WAF 对「缺 Referer」的请求做静默丢弃。这是软性防盗链，不是 403，但会直接导致空图。

因此本 ADR 追加**强制约束（实现层必须遵守）**：

1. **禁止**在站点声明 `Referrer-Policy: no-referrer` 或空值 `referrerpolicy`（含 `<meta name="referrer">`、CSP `referrer-policy`、以及 `<img>/<video>/<link>` 上的 `referrerpolicy="no-referrer"`）。默认 `strict-origin-when-cross-origin` 已足够：跨域资源请求仍携带 origin-only Referer，可过 WAF。
2. **禁止**主动删除素材请求的 Referer（例如用 `fetch()` 预取素材、或 SSR 端抓取素材写死进 HTML 时，必须带 Referer）。
3. 全量 GET 比 `Range` 部分读取更容易触发上游切断（实测 131KB 分片读取成功率显著更高）。大图/视频不得并发全量拉取：Hero 视频用 `preload="none"` + poster，图片走 `loading="lazy"` + 显式宽高占位。
4. `<img>`/`<video>` 一律带失败兜底（`onerror` 降级为品牌色占位块或 poster），不得因单张素材失败整块空白。

### 5.3 风险重估

- **R1（防盗链拦截）→ 关闭**，判定为非拦截。
- **R2（原站不可用）→ 概率由「低」上调至「中」**：原站对长传输存在限流抖动，直引在大图/视频密集页面上可能出现间歇性加载失败。上线前须人工复核一次全量抽样，并确认约束 5.2 已落实。

