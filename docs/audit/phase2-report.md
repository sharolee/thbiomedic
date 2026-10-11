# P2-2 二期全面上线检查报告（SHAR-58）

- **检查人**：审核官小寇（8ece9c40，独立评审，未修改任何被审代码）
- **检查时间**：2026-10-11
- **检查对象**：`main` 分支 `c05ccd1` 构建产物 `dist/`（本地 `npm run preview`，http://localhost:4321）
- **对照基准**：`docs/content-inventory.md`（2026-09-30 原站盘点）、`docs/design/acceptance-checklist.md` v1.0
- **截图留档**：`docs/audit/screenshots/`（本报告引用 24 张）；数据留档 `docs/audit/visual-smoke.json`

---

## 0. 总体结论：**不可上线（暂缓）**

构建、内容覆盖、双语一致性三项达标；但存在 **2 项阻塞缺陷**（主导航死链、产品卡图片全部不可见）与 **1 项需拍板的高风险依赖**（原站 WAF 直引限流）。修复阻塞项并就素材依赖取得决策后复验。

| 检查域 | 结论 |
|---|---|
| 内容对齐（对照盘点） | **通过**（1 项遗留需人确认） |
| 功能可用 | **通过**（1 项主要缺陷：搜索结果页无搜索框） |
| 视觉（截图比对） | **不通过**（1 项阻塞：产品卡图片不可见） |
| 生产就绪（构建/链接/资源） | **不通过**（1 项阻塞：主导航死链；1 项高风险：WAF 限流） |

---

## 1. 阻塞项（必须修复后复验）

### B-1 主导航「资源 / Resources」指向不存在的页面（全站死链）

- **位置**：页头导航 + 移动抽屉（全站组件）
- **证据**：
  ```
  grep -rhoI 'href="/zh/resources/"' dist --include=*.html | wc -l   →  102
  grep -rhoI 'href="/en/resources/"' dist --include=*.html | wc -l   →  100
  curl http://localhost:4321/zh/resources/   →  404
  curl http://localhost:4321/en/resources/   →  404
  ```
  `dist/` 下 `resources/` 只有 `downloads/`、`videos/` 子目录，无 `resources/index.html`。全站 102 个页面（含 404 页）的每一个都带此死链，桌面导航与移动抽屉各一处。
- **影响**：访客在任意页面点主导航「资源」即 404。
- **建议修法**：导航「资源」项改为不跳转的展开菜单（按钮语义），或直接指向 `/zh/resources/downloads/`；若保留独立落地页则需新增 `resources/index.astro`（中英两页，注意页面覆盖口径会从 100 → 102）。

### B-2 产品卡图片全部不可见（占位块把图片挤出裁剪区）

- **位置**：`src/components/product/ProductCard.astro:19-33`
- **证据**（真实网络，9/9 图片加载成功，naturalWidth>0）：
  ```
  /zh/products/easy-lock/ 页首卡实测盒模型：
  media(y=330,h=203)  placeholder(y=330,h=203)  img(y=532,h=203)  ← 图片被推到容器外
  ```
  `ProductCard` 把占位 `<span>` 与 `<img>` 渲染成**同层普通流兄弟**：占位块占满 `aspect-ratio:16/9` 的媒体盒，`img`（`height:100%`）被顺排到盒子之下，被 `.card__media{overflow:hidden}` 整体裁掉——**图片加载成功也永远不可见**。对比 `CategoryCard.astro:26-32` 用的是 `image ? <img> : <span>` 二选一写法，故产品中心一级分类卡显示正常。
- **影响面**：
  - 产品二级分类页 ×2 语言 ×2 个有产品分类（易锁式、宠物网膜）：6 张产品卡全部只见占位图标；
  - 12×2 个产品详情页的「查看全部」相关产品区：3 张卡同样不可见。
  - 截图：`docs/audit/screenshots/debug-category-realnet.png`（真实网络）、`detail-top.png` / `detail-cards.png`（缓存回放，同样症状）。
- **建议修法**：占位块改 `position:absolute; inset:0`（垫底），或与 `CategoryCard` 一致改为二选一渲染；修后产品卡是全站核心展示面，需全量复验。

---

## 2. 主要项（不阻断复验启动，但上线前应处理）

### M-1 原站素材直引在爆发负载下被 WAF 限流，图片静默消失

- **证据**（2026-10-11 实测）：
  - 单独冒烟：117 个外链图片/视频 + 6 个 PDF 全部 `206`（带 Referer，Range 读取）。
  - 连续浏览（Playwright 真实加载 10 余页、约 200 次素材请求）后，原站开始返回：
    ```
    HTTP/1.1 302 Redirect
    Server: openresty
    Location: http://127.0.0.1
    X-Powered-By: SDWAF
    ```
  - 限流约 3 分钟后自行恢复；恢复后 2s 间隔 40 连发不再触发，但再次连续多页浏览立即复现。
  - 产物内 `onerror="this.remove()"` 共 338 处：素材一旦被限流，图片元素被整块移除，页面不留任何占位（本轮截图多次出现整页无图状态）。
- **判定**：`hotlink-verdict.md`（SHAR-52 B1）结论"按 Referer 存在性放行、无防盗链"仍成立，但其 §3-R2"原站不可用风险：中"在实测中已具现为**确定性可复现的限流**。单人浏览多页即可触发，多访客并发风险更高。浏览器 Referer 为新站域名（跨域 origin-only），不影响放行，与限流无关。
- **建议**：这是素材策略的**内容/成本决策，需人拍板**——(a) 素材本地化迁移（一次性抓取 119 项 /uploadfiles/，约 40MB 图片 + 27 视频）；(b) 维持直引并接受偶发掉图；(c) 折中：仅首屏关键素材（logo、Hero poster、品牌图）本地化。无论哪种，建议把 `onerror="this.remove()"` 改为"保留占位块 + 降级样式"，单图失败不再出现空白区（ADR-003 §5.2 约束 4 的本意）。

### M-2 搜索结果页没有可见搜索框

- **证据**：`/zh/search/` 与 `/en/search/` 的 `<main>` 内 `input[name=q]` 数量为 0（DOM 中仅有的两个输入框分别藏在页头折叠搜索条与移动抽屉内，桌面视口下 `x=1464` 位于屏幕外）。用户到达 `?q=` 结果页后无法直接改关键词，必须再点页头放大镜。
- **建议**：搜索页内补一个搜索输入框（可复用 `search__form`），或至少在空态面板内提供。

---

## 3. 次要项（记录，可随后续批次处理）

| # | 位置 | 问题 |
|---|---|---|
| m-1 | `dist/404.html` | 语言切换链接指向 `/en/404/`（不存在），canonical 指向 `https://www.thbiomedic.com/404/` |
| m-2 | 首页数据一览 | 无 JS 时四个统计数字显示 `0`（有 JS 时正常动画到 20/30/400/5），与 C9 降级要求不符 |
| m-3 | 英文联系页 | 第二个号码 `+86 020-82350336-2018` 为纯文本，无 `tel:` 链接（B28 部分不满足） |
| m-4 | 联系页 | 地址卡 label 复用「联系我们」而非「地址」（SHAR-53 遗留，未修） |
| m-5 | Banner 区块 | 首页/关于/视频/下载等页 kicker 与 Banner 标题文案重复出现两次（SHAR-53 遗留，未修） |
| m-6 | 页脚公众号二维码 | 80×80，checklist A20 要求 96×96 白底圆角 |
| m-7 | 证书数据 | zh 10 / en 10 ≠ 盘点 zh 9 / en 8（多出"广东省创新型中小企业/专精特新"英文条目），沿用 SHAR-53 m-1，**需人确认口径后关闭** |
| m-8 | acceptance-checklist | 仍是 v1.0（基于作废的旧蓝设计稿）：B4/B6/B10/B24 等多条与已定稿的 direction-a-plus 实现不一致（见 §4 差异表），建议升版与 design-spec v2 对齐 |

---

## 4. 与原站逐项对齐核对（对照 content-inventory）

| 对齐项 | 盘点基线 | 新版实测 | 判定 |
|---|---|---|---|
| 主导航结构 | 首页/关于/产品▾/资源▾/新闻/联系 + 语言切换 + 搜索 | 一致（资源项死链见 B-1） | ✅ |
| 产品一级分类 | 10（中英同构，lcid 对应） | 10/10，中英名对应准确，导航下拉 = 全部产品 + 10 分类 | ✅ |
| 产品二级分类 | 17 | 17/17（check-pages：二级=17，空态 15） | ✅ |
| 产品详情 | 12（中英一一对应） | 12/12，名称逐字对齐（踝/腕/膝踝/腰背心/足托/肘 + 跗/桡尺/膝/肘/脚掌/颈 ↔ Ankle…Neck） | ✅ |
| 产品详情文案 | §4.1 描述要点 | 抽查踝关节拉链型："用于踝关节软组织、跟腱损伤及矫形术后的固定" 一致 | ✅ |
| 视频分布 | zh：板材 6 + 患者固定 1 + 宠物空；en：16 + 1 + 1 | zh 6/1/0=7，en 16/1/1=18，逐分类一致 | ✅ |
| 下载 PDF | zh 3 / en 3，6 个不同文件 | URL 与盘点 §4.4 逐一吻合；页面标注大小与实测 Content-Length 一致（zh 6.5/2.5/1.0MB，en 31.1/26.4/1.0MB） | ✅ |
| 联系方式 | zh 无分机 / en 有 -2018 分机 | 一致；邮箱、中英地址一致 | ✅ |
| 新闻 | 中英均空 | 双语空态 + 无三个 404 子栏目入口（B26/B27 过） | ✅ |
| 页脚 | 4 列 + ICP证0301 + LinkedIn/Facebook + 公众号二维码 | 一致（二维码尺寸见 m-6） | ✅ |
| 荣誉资质 | zh 9 / en 8 | zh 10 / en 10 | ⚠️ m-7 |
| 首页结构 | 旧版：3 品牌卡轮播+关于摘要+宣传视频 | a-plus 版：视频 Hero+信任条+三品牌线+数据+新闻空态（品牌名/商标 ® 与盘点 §4.3 一致） | ✅（按新设计稿） |

### acceptance-checklist v1.0 差异表（实现 vs 清单，均属设计定稿变更，非缺陷）

| 条目 | 清单要求 | 实际 | 
|---|---|---|
| B4 | 首页 10 个分类入口卡 | 三大品牌线卡（a-plus 版式） |
| B6 | 首页无新闻预览区块 | 有新闻空态区块 |
| B10/B11 | 历程图灯箱、证书轮播（zh9/en8、一屏4张） | 无灯箱；证书为静态网格 10/10 |
| B24 | 视频点击页内模态播放 | 内联原生 `<video controls>`（可用） |
| B19 | 面包屑四级 | 五级（含一级+二级分类，信息更完整） |

---

## 5. 生产就绪核验（真实执行输出）

```
npm run check:all                      → EXIT 0
  [tokens] PASS 全部令牌与原型逐项一致（49/49）
  [zh]  一级=10 二级=17 详情=12 二级空态=15；素材 key 全部命中 assets.ts: true
  [en]  同上
  [zh] 视频=7 [en] 视频=18（原站即不同）；[warn] 证书 10 ≠ 盘点 9/8（m-7）
  Result (76 files): 0 errors / 0 warnings / 0 hints
  [build] 102 page(s) built；[sitemap] 100 URLs → dist/sitemap.xml

页面覆盖   check-pages：语义页面 100（方案 100）
冒烟       sitemap 100 URL 全部 200（.audit-smoke 全绿）
站内链接   106 个唯一 href，非 200 共 3：/zh/resources/、/en/resources/、/en/404/（见 B-1、m-1）
外链素材   117 个图片/视频 + 6 个 PDF 全部 206（带 Referer 单发冒烟）
hreflang   100/100 页 canonical + alternate 双向互指；语言切换 100/100 指向同语义页（真实点击验证）
alt        24 页截图批查 noAlt=0；broken=0（素材未被限流时）
横向溢出   1440 与 390 视口 12 页 overflow=0
控制台     无 JS 报错；404 页有预期 404 资源记录
```

---

## 6. 结论与下一步

**结论：不可上线（暂缓）。** 内容与双语层面已达到替换原站的水准；阻塞上线的是两个工程缺陷（B-1 导航死链、B-2 产品卡图片不可见）和一个素材依赖决策（M-1）。

**下一步由执行者（全栈老欧，经产品老派派回）接手：**

1. 修 B-1（资源导航）与 B-2（ProductCard 占位层叠）——均为小改动，建议同一批次完成并附截图复验；
2. 顺带修 m-1/m-2/m-3（404 语言切换、无 JS 统计、英文分机号 tel:）；
3. **人就 M-1 拍板素材策略**（本地化 / 维持直引 / 部分本地化），结论回写 ADR-003；
4. m-7 证书口径请人确认后关闭；
5. 上述闭合后由审核官复验（G1–G5 + 截图目视），再交视觉验收官做全量 62 条比对与人工目视。

---

## 附：本轮检查工具与可复跑命令

```bash
npm run check:all                                   # 门禁全量，EXIT 0
npm run preview                                      # localhost:4321
node scripts/audit-visual.mjs                        # 23 页×双视口 冒烟+截图（docs/audit/visual-smoke.json）
node scripts/audit-interaction.mjs                   # 语言切换/搜索/表单/抽屉/Esc 交互冒烟
grep -rhoI 'href="/zh/resources/"' dist --include=*.html | wc -l    # 102（B-1）
# B-2 盒模型复现：/zh/products/easy-lock/ 下 product-card__media(y=330,h=203) vs img(y=532,h=203)
```

新增审计脚本 `scripts/audit-visual.mjs`、`scripts/audit-interaction.mjs` 为本次检查工具（未触碰任何站点源码），执行者可复用或删除。
