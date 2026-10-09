# 直引可达性冒烟判定（SHAR-52 B1）

- **日期**：2026-10-09　｜　**执行**：全栈小欧
- **问题**：原站是否对非原站来源直引图片/视频/PDF 做防盗链拦截？（build-plan 风险 R1）
- **结论**：**不拦截**（非域名白名单防盗链）。但发现一条确定性的「缺 Referer 即返回空体」行为，已固化为 ADR-003 §5.2 强制工程约束。

## 1. 证据文件

| 文件 | 内容 | 结果 |
|---|---|---|
| `smoke-assets-with-referer.txt` | 26 条抽样，`Range: bytes=0-131071` + 原站 Referer | 首轮 26/26 可达；复测 22/26（4 条 `fetch failed`） |
| `smoke-referer-matrix.txt` | 1 目标 × 10 类 Referer 变量，Range 读取 | 10/10 放行（含无 Referer） |
| `smoke-hotlink.txt` | 2 目标 × 4 类 Referer × 3 轮，**无 Range 全量 GET** | 5 条失败（`fetch failed` / 200 空体） |
| `smoke-hotlink-retest.txt` | 30 次加密采样 + Range 对照 + 汇总分组 | 18/30 失败，失败在 Referer 分组间横跳 |
| 响应头取证（本轮临时脚本） | 全响应头 dump | 定位 WAF 层行为，见下 |

## 2. 判定过程

### 2.1 失败形态不是防盗链

防盗链的标准形态是 **403/401 + HTML 提示页**。本轮与首轮全部请求中 **0 次 403、0 次 401**。失败只有两种：

- `ERR: fetch failed` —— 连接级失败（TLS/连接被切断），根本拿不到 HTTP 响应；
- `200 OK` + `content-length: 0` + 无 `content-type` —— 有响应头但空体。

两种都不是防盗链判定响应。

### 2.2 失败与 Referer 分组无相关性 → 上游抖动

同一目标、同一 Referer 在相邻两轮之间反复横跳：

| 目标 | Referer | 首轮（11:46） | 复测（12:22） |
|---|---|---|---|
| jpg 42KB | `thbiomedic /zh/` | 成功 ×3 | 失败 ×3 |
| jpg 42KB | `example.com` | 成功 ×3 | 成功 ×3 |
| jpg 42KB | `localhost:4321` | 成功 ×3 | 失败 ×3 |
| png 753KB | `localhost:4321` | 失败 ×3 | 成功 ×2 / 失败 ×1 |
| png 753KB | `example.com` | 失败 ×3 | 成功 ×1 / 失败 ×2 |

如果存在 Referer 白名单，失败必须严格落在「非白名单 Referer」分组内，且 `thbiomedic /zh/`（同域）永远成功。实测相反 → 排除定向拦截。

### 2.3 唯一的确定性行为：无 Referer → 空体

响应头取证显示两类响应差异明确：

```
[ 无 Referer，全量 GET ]
status=200  content-length: 0
(无 content-type / 无 cache-control / 无 etag / 无 last-modified)
server: openresty   x-powered-by: SDWAF

[ 任意非空 Referer，全量 GET ]
status=200  content-type: image/jpeg  content-encoding: gzip
cache-control: max-age=31536000  etag: W/"02477380a3d71:0"
transfer-encoding: chunked   server: openresty   x-powered-by: SDWAF
```

即原站 WAF（SDWAF，openresty 层）对「缺 Referer」的请求做静默丢弃：返回 200 但强制 `content-length: 0`，不返回媒体类型。该行为在本轮 6 次采样中 100% 复现，是确定性的。

**任意非空 Referer 都放行**（含 `example.com`、`localhost`、Vercel 域名、scheme-only）→ 只校验「Referer 是否存在」，不校验域名。

### 2.4 全量 GET 比 Range 读取更脆弱

- 带 `Range: bytes=0-1023` / `bytes=0-131071` 的请求：4 轮 33 次采样，成功率显著更高，且 4 类 Referer 全部通过。
- 不带 Range 的全量 GET：失败率 60%（复测）/ 15%（冒烟），且失败集中在「连续快速发起的大文件下载」之后（首轮冒烟第 1 条成功后第 2–5 条连续 `fetch failed`，随后 21 条连续成功）。

符合上游限流/长连接保护特征，不支持防盗链解释。

## 3. 结论

1. **R1 防盗链拦截：不成立，风险关闭。** 不需要人工三选一（原站放行 / 本地化迁移 / 替换素材），直引方案继续。
2. **但必须落地防护**，否则会在真实浏览器里出现空图：原站对「无 Referer」请求 100% 返回空体。已写入 `docs/adr/ADR-003-asset-referencing.md` §5.2 为强制约束：
   - 禁止声明 `Referrer-Policy: no-referrer` 及任何空值 `referrerpolicy`；
   - 禁止用无 Referer 的 `fetch()` 预取或 SSR 抓取素材；
   - 大图/视频不并发全量拉取（Hero `preload="none"` + poster，图片 `loading="lazy"` + 显式宽高）；
   - 所有 `<img>`/`<video>` 必须带 `onerror` 兜底，单张失败不得整块空白。
3. **R2 原站不可用风险上调**：低 → 中。上游存在限流抖动，直引在大图/视频密集页可能出现间歇失败。上线前需人工复核一次全量抽样。
4. **B4 冒烟断言补充**：新增「HTTP 200 + 空 body」检测（当前 `smoke-assets.mjs` 的 OK 判定已含 `bytes > 0`，覆盖此情形）。

## 4. 对浏览器侧实际风险的评价

浏览器默认 `strict-origin-when-cross-origin` 策略下，跨域资源请求会携带 origin-only Referer（`https://new-site.example/`），能过原站 WAF 的存在性校验 → **浏览器端直引可正常工作**。

需注意的三个例外：页面自身设置 `Referrer-Policy: no-referrer`；`<img referrerpolicy="no-referrer">`；Safari 在某些隐私模式下可能不发 Referer。前两项由约束 5.2 禁止，第三项为低概率残余风险，由 `onerror` 兜底承接。
