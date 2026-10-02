# 天泓医疗官网内容盘点（Content Inventory）

> 盘点日期：2026-09-30 ｜ 盘点对象：https://www.thbiomedic.com （中文站 `/zn/`，英文站根目录）
> 目的：作为新版网站内容覆盖的验收基线。本文所有内容均来自真实抓取，未抓到的页面一律如实标注。

---

## 0. 盘点统计（验收证据）

| 指标 | 中文站（/zn/） | 英文站（根目录） |
|---|---|---|
| 抓取到的页面总数（HTML） | 64 页（另含 5 个加密分页 URL） | 68 页 |
| 成功抓取（HTTP 200） | 56 | 63 |
| 404 / 抓取失败 | 3（新闻子栏目）+ 5（加密视频分页链接解析失败） | 5（公司简介/文化 2 + 新闻子栏目 3） |
| 主栏目数 | 6（首页/关于我们/产品中心/资源/新闻动态/联系我们） | 6（Home/About Us/Products/Resources/News/Contact Us） |
| 产品分类：一级 | 10 | 10 |
| 产品分类：二级（列表页） | 17（含分页共 21 个 URL） | 17（含分页共 20 个 URL） |
| 产品详情页 | 12 | 12 |
| 有实际产品内容的分类 | 仅 2 个（易锁式低温热塑系列、宠物可塑性外固定网膜） | 仅 2 个（Easy-to-lock、Pet thermoplastic） |
| 新闻列表 | 空（无任何条目） | 空（无任何条目） |
| 下载文件（PDF） | 3 | 3 |
| 视频文件（MP4） | 8（7 列表视频 + 首页宣传片） | 19（18 列表视频 + 首页宣传片） |
| 图片资源（去重） | 119 个 /uploadfiles/ 资源（含 6 PDF + 27 MP4） | 同左共用 |

**抓取命令（真实执行）与返回片段：**

```powershell
# 首页（中文）
curl.exe -s -L --max-time 30 -o .multica/home_zh.html -w "HTTP_CODE:%{http_code} SIZE:%{size_download} URL:%{url_effective}" "https://www.thbiomedic.com/zn/index.html"
# -> HTTP_CODE:200 SIZE:16629 URL:https://www.thbiomedic.com/zn/index.html

# 英文站首页
# -> 200, <title>Guangzhou Tian Hong Medical Technology Co.,LTD</title>

# 全站 BFS 爬虫（种子=中/英首页，逐层跟链接）
python .multica/tools/bfs.py .multica/urls_seeds.json .multica/report_bfs.json 200
# -> CRAWLED 156 pages, 143 ok, 13 failed

# 抽取单个分类页面包包屑实测（低温热塑支具系列 lcid=37）
# -> 首页 > 产品中心 > 低温热塑支具系列 …（含简介文案 + 在线留言表单）
```

**抓取失败清单**（如实标注）：

| URL | 状态 | 原因 |
|---|---|---|
| /zn/CompanyNews/list.html、/zn/IndustryInformation/list.html、/zn/ExhibitionInformation/list.html | 404 | 新闻子栏目页面不存在（导航/页脚有入口但未建站） |
| /CompanyNews/list.html、/IndustryInformation/list.html、/ExhibitionInformation/list.html | 404 | 同上（英文站） |
| /CompanyProfile/info.aspx?itemid=1（Company Culture） | 404 | 英文站"关于我们"子页，链接存在但页面未建成 |
| /CompanyProfile/info.aspx?itemid=2（Company Profile） | 404 | 同上 |
| /zn/videos/list.aspx?ezeip=…&page=1/2（5 个） | URL 解析失败 | 视频列表分页采用加密参数（ezeip），链接内含空格导致无法直接抓取；但有等价静态页 /zn/Videos/list_lcid_*.html 已抓全，无信息损失 |
| /robots.txt、/sitemap.xml、/sitemap.html | 404 | 站点未提供 |

无其他抓不到的情况。**未发现整站 JS 渲染 / 反爬墙问题**，静态 HTML 均可直接抓取（仅 /uploadfiles/ 静态资源需带 Referer，见 5.4）。

---

## 1. 页面清单（中文站）

站点入口：https://www.thbiomedic.com/zn/index.html

| # | 栏目 | 页面标题（正文标题） | URL | 说明 |
|---|---|---|---|---|
| 1 | 首页 | （无正文 H1，轮播） | /zn/index.html | 3 张品牌卡 + 关于我们摘要 + 公司宣传视频 |
| 2 | 关于我们 | 公司介绍 | /zn/AboutUs/index.html | 公司简介长文 + 企业发展历程（1 张图）+ 荣誉资质（9 张证书图轮播） |
| 3 | 产品中心 | 产品中心 | /zn/Products/index.aspx?lcid=58 | 一级分类导航页（10 个分类）+ 本类子项 |
| 4 | 产品中心 | 低温热塑系列 | /zn/Products/index.aspx?lcid=58 | 子类：低温热塑板(59)/易锁式(62)/预裁型(61)/亲肤(60) |
| 5 | 产品中心 | 低温网格系列 | /zn/Products/index.aspx?lcid=36 | 子类：低温网格板(75)/低温网格胸腰支具(76) |
| 6 | 产品中心 | 低温热塑支具系列 | /zn/Products/index.aspx?lcid=37 | 有简介文案；子类：胸腰(38)/头颈胸(39)/骨盆(66)/腰围(65)支具 |
| 7 | 产品中心 | 可调节支具 | /zn/Products/index.aspx?lcid=64 | 子类：可调膝关节(68)/可调肘关节(67)支具 |
| 8 | 产品中心 | 动力支具 | /zn/Products/index.aspx?lcid=72 | 无产品 |
| 9 | 产品中心 | 配件 | /zn/Products/index.aspx?lcid=74 | 无产品 |
| 10 | 产品中心 | 高温板 | /zn/Products/index.aspx?lcid=63 | 无产品 |
| 11 | 产品中心 | 空气能姿势垫 | /zn/Products/index.aspx?lcid=73 | 无产品 |
| 12 | 产品中心 | IFIX体位固定方案 | /zn/Products/index.aspx?lcid=14 | 子类：网纹易撕胶贴(18)/高分子绷带(17)/适配器(16) |
| 13 | 产品中心 | 宠物康复 | /zn/Products/index.aspx?lcid=13 | 子类：宠物可塑性外固定网膜(20)/宠物保健衣(19) |
| 14-20 | 产品中心 | 二级列表页 | /zn/Products/list.aspx?lcid=59,62,61,60,75,76,38,39,66,65,68,67,16,17,18,19,20 | 其中 62 与 20 有产品卡片（6+6 个）；其余为空占位（仅横幅图） |
| 21-32 | 产品中心 | 产品详情页 | /zn/Products/info.aspx?itemid=190~195, 239~244 | 共 12 个真实产品详情，见 §4.1 |
| 33 | 资源 | 下载 | /zn/Downloads/list.aspx | 3 个 PDF 下载 |
| 34 | 资源 | 视频 | /zn/Videos/list.html | 视频列表（3 个栏目） |
| 35 | 资源 | 视频-低温热塑板材 | /zn/Videos/list_lcid_30.html | 6 个视频 |
| 36 | 资源 | 视频-患者固定 | /zn/Videos/list_lcid_26.html | 1 个视频（固德易） |
| 37 | 资源 | 视频-宠物康复 | /zn/Videos/list_lcid_25.html | 空（无内容） |
| 38 | 新闻动态 | 新闻动态 | /zn/News/list.html | **空列表**（无任何新闻条目） |
| 39 | 联系我们 | 联系我们 | /zn/ContactUs/index.html | 联系方式 + 天泓医疗公众号二维码 + 在线留言表单 |

## 2. 页面清单（英文站）

站点入口：https://www.thbiomedic.com/index.aspx

| # | 栏目 | 页面标题（正文标题） | URL | 说明 |
|---|---|---|---|---|
| 1 | Home | （无正文 H1，轮播） | /index.aspx | 3 张品牌卡（Polyeasy/iFIX/Polyeasy Pet）+ About 摘要 |
| 2 | About Us | Company Overview | /AboutUs/index.aspx | 英文公司简介 + Enterprise Development History（1 图）+ Honor（8 张证书图） |
| 3-4 | About Us | Company Profile / Company Culture | /CompanyProfile/info.aspx?itemid=2 / itemid=1 | **404，链接存在页面未建** |
| 5 | Products | Products | /Products/index.aspx?lcid=42 | 一级分类导航页（10 个分类） |
| 6 | Products | Low temperature thermoplastics | /Products/index.aspx?lcid=42 | 子类：Sheets(43)/Skin-friendly(44)/Pre-Cut(45)/Easy-to-lock(46) |
| 7 | Products | Air Mesh Thermoplastic Series | /Products/index.aspx?lcid=77 | 子类：Sheets & Splints(48)/Thoracolumbar Orthosis(78) |
| 8 | Products | Thermoplastic Comfort Orthosis Series | /Products/index.aspx?lcid=49 | 有简介；子类：胸腰/头颈胸/腰围/骨盆支具(52,53,54,55) |
| 9 | Products | Adjustable Orthosis & Supports | /Products/index.aspx?lcid=50 | 子类：Adjustable Elbow(56)/Knee(57) |
| 10 | Products | Extension Tendon Splints | /Products/index.aspx?lcid=69 | 无产品 |
| 11 | Products | Accessory | /Products/index.aspx?lcid=71 | 无产品 |
| 12 | Products | High Temperature Thermoplastics | /Products/index.aspx?lcid=51 | 无产品 |
| 13 | Products | Cushion for Rehabilitation | /Products/index.aspx?lcid=70 | 无产品 |
| 14 | Products | Patient Immobilization | /Products/index.aspx?lcid=7 | 子类：Patch(10)/Strap(9)/Adapter(8) |
| 15 | Products | Pet Rehabilitation | /Products/index.aspx?lcid=6 | 子类：Pet thermoplastic(12)/Pet health clothes(11) |
| 16-22 | Products | 二级列表页 | /Products/list.aspx?lcid=43,44,45,46,48,78,52,53,54,55,56,57,8,9,10,11,12 | 其中 46 与 12 有产品卡片（6+6 个）；其余为空占位 |
| 23-34 | Products | 产品详情页 | /Products/info.aspx?itemid=98~103, 222~227 | 共 12 个真实产品详情，见 §4.1 |
| 35 | Resources | Downloads | /Downloads/list.aspx | 3 个 PDF 下载 |
| 36 | Resources | Videos | /Videos/list.aspx | 视频列表（3 个栏目 + 全量 3 页） |
| 37-39 | Resources | Videos 子栏目 | /Videos/list.aspx?lcid=27（Physical Rehabilitation，3 页）、lcid=28（Patient Immobilization）、lcid=29（Pet Rehabilitation） | 27 类 16 个视频；28 类 1 个（iFIX Operation）；29 类 1 个（Hock Thermoplastic） |
| 40 | News | News | /news/list.aspx | **空列表**（无任何新闻条目） |
| 41 | Contact Us | Contact Us | /ContactUs/index.aspx | 联系方式 + Onesky Medical 公众号二维码 + Feedback 表单 |

## 3. 导航 / 栏目结构

### 3.1 主导航（页头，中英一致结构）

```
中文站：首页 | 关于我们 | 产品中心 ▾ | 资源 ▾ | 新闻动态 | 联系我们   [EN]
                  └ 10 个一级产品分类        └ 下载 / 视频
英文站：Home | About Us | Products ▾ | Resources ▾ | News | Contact Us   [CN]
```

- 页头右侧：搜索框（jQuery 站内搜索）、语言切换（中 ↔ EN，/zn/ 与根目录互链）。
- 顶部通栏固定结构组件：`Top002742`（页头）、`Banner002922`（页横幅）、`Location002087`（面包屑）、`Menu001093`（子栏目 Tab）、`PicList002797`（产品/视频卡片列表）、`RighInfo002923`（内容区）、`Form002802`（留言表单）、`Bottom003112`（页脚）。

### 3.2 产品一级分类（中 ↔ 英对应，lcid 完全同构）

| 中文分类（lcid） | 英文分类（lcid） |
|---|---|
| 低温热塑系列（58） | Low temperature thermoplastics（42） |
| 低温网格系列（36） | Air Mesh Thermoplastic Series（77） |
| 低温热塑支具系列（37） | Thermoplastic Comfort Orthosis Series（49） |
| 可调节支具（64） | Adjustable Orthosis & Supports（50） |
| 动力支具（72） | Extension Tendon Splints（69） |
| 配件（74） | Accessory（71） |
| 高温板（63） | High Temperature Thermoplastics（51） |
| 空气能姿势垫（73） | Cushion for Rehabilitation（70） |
| IFIX体位固定方案（14） | Patient Immobilization（7） |
| 宠物康复（13） | Pet Rehabilitation（6） |

### 3.3 产品二级分类（列表页 lcid 对应）

| 中文二级（lcid） | 英文二级（lcid） | 是否有产品 |
|---|---|---|
| 低温热塑板（59） | Low Temperature Thermoplastic Sheets（43） | ❌ 空 |
| 易锁式低温热塑系列（62） | Easy-to-lock Thermoplastic Splint（46） | ✅ 6 个 |
| 低温热塑预裁型系列（61） | Pre-Cut Thermoplastic Splints（45） | ❌ 空 |
| 热塑亲肤系列（60） | Skin-friendly Thermoplastics（44） | ❌ 空 |
| 低温网格板（75） | Air Mesh Thermoplastic Sheets & Splints（48） | ❌ 空 |
| 低温网格胸腰支具（76） | Air Mesh Thermoplastic Thoracolumbar Orthosis（78） | ❌ 空 |
| 胸腰支具（38） | Thoracolumbar Orthosis（52） | ❌ 空 |
| 头颈胸支具（39） | Cervico-Thoracic-Lumbar Orthosis（53） | ❌ 空 |
| 腰围支具（65） | Lumbar Orthosis（54） | ❌ 空 |
| 骨盆支具（66） | Pelvic Orthosis（55） | ❌ 空 |
| 可调膝关节支具（68） | Adjustable Knee Orthosis（57） | ❌ 空 |
| 可调肘关节支具（67） | Adjustable Elbow Orthosis（56） | ❌ 空 |
| 网纹易撕胶贴（18） | Patch（10） | ❌ 空 |
| 高分子绷带（17） | Strap（9） | ❌ 空 |
| 适配器（16） | Adapter（8） | ❌ 空 |
| 宠物可塑性外固定网膜（20） | Pet thermoplastic（12） | ✅ 6 个 |
| 宠物保健衣（19） | Pet health clothes（11） | ❌ 空 |

> 注：表格中"空"指列表页无产品卡片；抓取到的 HTML 显示仅有横幅/占位图 + 留言表单。**这是新版需要决策的重点**（是补齐产品还是维持现状）。

### 3.4 页脚（中英结构相同）

- **关于我们**：公司简介 / 企业理念 / 荣誉资质（中文站为页内锚点 `#?itemid=50/49`；英文站 Company Profile/Company Culture 指向不存在的 404 页）
- **产品中心**：10 个一级分类全列
- **资源**：下载 / 视频
- 页脚底部：`ICP证0301`（`//beian.miit.gov.cn`）、`Wanhu`（`http://www.wanhu.com.cn`，建站商）
- 页脚上方另有社交链接：LinkedIn（carol-xia）/ Facebook（THcarol.xia）

## 4. 逐页内容摘要

### 4.1 产品详情（12 个/语言，中英一一对应）

产品名（中文详情页 itemid） ↔ 产品名（英文）｜ 描述文案

**易锁式低温热塑系列 → Easy-to-lock Thermoplastic Splint**（中文属"低温热塑系列"下级 lcid=62；英文属 Low temperature thermoplastics 下级 lcid=46）：

| 中文（itemid） | 英文（itemid） | 中文描述要点（真实抓取） |
|---|---|---|
| 踝关节拉链型（239） | Ankle Splint（224） | 用于踝关节软组织、跟腱损伤及矫形术后的固定 |
| 腕关节拉链型（240） | Wrist Splint（222） | 腕关节/前臂远端骨折、腕关节成形术功能固定、月骨脱位及 colles 骨折固定 |
| 膝踝关节拉链型（244） | Knee and Ankle Splint（223） | 膝、踝关节损伤固定，术后制动及矫形术后固定 |
| 腰背心拉链型（241） | Lumbar Splint（226） | 脊柱术后、脑瘫及儿童脊柱侧弯矫正、脊柱损伤外固定，保持生理弯曲 |
| 足托拉链型（243） | Drop Foot Splint（225） | 踝关节软组织、跟腱损伤及矫形术后固定，双拉链设计更易操作 |
| 肘关节拉链型（242） | Elbow Splint（227） | 肘、腕关节肌腱/软组织/神经损伤及肘关节术后固定，双拉链设计 |

**宠物可塑性外固定网膜 → Pet thermoplastic**（宠物康复一级分类下）：

| 中文（itemid） | 英文（itemid） | 中文描述要点（真实抓取） |
|---|---|---|
| 跗关节（190） | Hock Thermoplastic（98） | 关节炎症、肌肉肌腱/软组织/韧带受损后康复期辅助矫正 |
| 桡尺骨（191） | Radioulna Thermoplastic（101） | 同上类文案 |
| 膝关节（192） | Knee Thermoplastic（102） | 同上类文案 |
| 肘关节（193） | Elbow Thermoplastic（103） | 同上类文案 |
| 脚掌（194） | Feet Thermoplastic（99） | 韧带损伤、趾骨/腕关节炎症辅助治疗、神经损伤致脚掌外翻矫正 |
| 颈部（195） | Neck Thermoplastic（100） | 寰枢椎脱位、颈椎间盘突出/增生术后固定 |

> 英文描述为中文的直译（如 Lumbar Splint 与腰背心拉链型、Ankle Splint 与踝关节拉链型为同款产品中英版本；英文描述内容完整直译，无实质差异）。

### 4.2 关于我们（中英）

- **公司介绍（中文，全文要点）**：天泓医疗是一家集研发、生产、销售及售后服务于一体的专业医疗器械企业；总部设于香港，中国大陆设多家全资子公司；聚焦自有品牌研发生产与国际高端产品总经销两大核心板块；深耕放疗、康复及辅助生殖领域，"自研+代理"双轮驱动；自有品牌核心产品通过 NMPA、FDA、CE、TGA 认证，远销北美、欧洲、中东、中亚、澳洲等 30 余国；总经销引入欧美十余个国际知名医疗器械品牌，覆盖中国大陆及港澳；全国营销网络服务 400+ 三甲及高端医院、200+ 区域核心代理商；2017 年起连续获评国家高新技术企业，2023 年省级专精特新企业，累计 30+ 专利；通过 ISO13485、ISO14001；销售团队驻扎沈阳、北京、济南、西安、郑州、南京、合肥、武汉、长沙、成都等十余个城市。
- **英文版**：内容完全对应（Guangzhou Tianhong Medical Technology Co., Ltd / Onesky 品牌），无缺失。
- **企业发展历程**：单张图片（`20240927092611098.jpg`，banner），非时间轴列表。
- **荣誉资质（中文 9 项，英文 8 项）**：
  - 中文：广东省创新型中小企业 / 广东省专精特新中小企业 / 高新技术企业 / 守合同重信用 / 希望之光创新性潜力企业 / 品牌认证（四星）/ ISO13485 / CE certificate / FDA / 专利证书
  - 英文：National High-Tech Enterprise / Observing Contract and Valuing Credit / China Ligh of Hope / 4 Stars Brand Certification / ISO 13485 / CE certificate / FDA Listing / Patents

> ⚠️ 中英文荣誉项基本对齐（中文含"广东省创新型中小企业"1 项英文版无对应图；这是中英不一致点之一，见 §7）。

### 4.3 首页

- **中文**：轮播 3 张品牌卡——① 宝力易® 低温热塑板·骨科康复（图 `20211129183559782.jpg`→"脚部1.jpg"）② 固德易® 一次性固定器组件·革命性固定系统（图 `20211209131904240.jpg`）③ 宝力谊® 低温热塑·宠物康复（图 `20210729165156840.jpg`→"Banner003086-01.jpg"）；"关于我们"摘要段 + 了解更多；产品中心各区入口卡贴（每分类一张图）；**公司宣传视频**（`/uploadfiles/2025/11/20251112162344793.mp4`，Floor003044 区块）。
- **英文**：同上结构——Polyeasy® Thermoplastic Splints·Physical Rehabilitation / iFIX® Immobilization Revolution·Patient Immobilization and Fixation System / Polyeasy® Thermoplastic Pet Rehabilitation；About Us 摘要 + Learn More；**公司宣传视频**（`/uploadfiles/2025/11/20251112163145210.mp4`，与中文站是不同文件；配图 `20240925090842872.jpg` 品牌合作-企业荣誉）。
- 首页底部各栏目标题卡图：低温柔塑系列卡图 `2024/11 20241127150517487.jpg`、空气能垫 `2025/11 20251111090745331.png` 等（资源清单见 §5）。

### 4.4 资源

- **下载（中文 3 项）**：骨科康复解决方案（PDF `20251112135837464.pdf`，约 32.6MB）；宠物康复彩页（PDF `20211205220208456.pdf`，约 2.6MB）；固德易彩页（PDF `20211128142232031.pdf`）。
- **下载（英文 3 项）**：Onesky Medical Orthopedic Rehabilitation Solutions（`20251112134647962.pdf`）；Polyeasy Pet Catalogue（`20211229131734923.pdf`）；iFIX Catalogue（`20211011094045981.pdf`）。
  - 中↔英主题对应：骨科康复解决方案 ↔ Onesky Medical Orthopedic Rehabilitation（**注意是两个不同的 PDF 文件，内容待确认是否一致**）；宠物康复彩页 ↔ Polyeasy Pet Catalogue；固德易彩页 ↔ iFIX Catalogue。
- **视频：中文 3 栏**：低温热塑板材（6 支：可调膝关节支具、手指固定支具、踝关节支具、腰背心支具、伸肌腱动力支具、覆布腰围支具）；患者固定（1 支：固德易）；宠物康复（空）。
- **视频：英文 3 栏**：Physical Rehabilitation（16 支：Finger Splint / Thumb / Knee Splint / Body Splint / Soft cloth type chest and waist / Soft Cloth Type Waist / Elbow and Wrist / Wrist / Tibiofibular / Shoulder and elbow / Drop foot / Ankle / Angle Adjustable Knee / Intrinsic Plus Positioning / Extension Tendon Dynamic / Rest Hand Splint）；Patient Immobilization（1 支：iFIX Operation）；Pet Rehabilitation（1 支：Hock Thermoplastic）。

### 4.5 联系我们

| 项 | 中文站 | 英文站 |
|---|---|---|
| 电话 | +86 020-82350336 | +86 020-82350336-2018（分机）+ +86 020-82350336 |
| 邮箱 | thsales@biomedichk.com | thsales@biomedichk.com |
| 地址 | 广州市黄埔区连云路8号好莱客高新技术产业园12栋2楼 | 2nd floor, Building 12, Haolaike High-tech Industrial Park, No. 8 Lianyun Road, Huangpu District, Guangzhou |
| 公众号 | 天泓医疗公众号（二维码） | Onesky Medical Public Account（二维码） |
| 留言表单字段 | 称呼 / 您的公司* / 邮箱* / 名* / 姓* / 手机 / 内容 | Salutation / Your Company* / Email* / First name* / Last name* / Phone / Comments |
| 表单机制 | `whirform`（form id=whir_2，字段 id 18257/18256/17864/18255/17862/18254） | `whirform`（form id=whir_1，字段 id 相同） |

> 表单在**每个产品分类页、详情页**也会出现（在线留言 / Feedback），是全站通用组件。

### 4.6 新闻动态

中英文站新闻列表均为空页面（只有面包屑，无条目、无分页）。页脚/首页存在三个子栏目入口（CompanyNews 公司新闻 / IndustryInformation 行业信息 / ExhibitionInformation 展会信息），全部 404。

## 5. 资源清单

> `/uploadfiles/` 资源 URL 常带 base64 文件名后缀（如 `?6ISa6YOoMS5qcGc=` = "脚部1.jpg"），下载需带 Referer（见 5.4）。

### 5.1 必需素材（新版大概率要复用）

| 素材 | 路径 | 性质 |
|---|---|---|
| 公司 Logo | /zn/uploadfiles/Top002908_logo.png、Bottom002909_logo.png（英文站同文件在 /cn/uploadfiles/） | ★ Logo 设计 |
| 公司宣传视频（首页） | /uploadfiles/2025/11/20251112162344793.mp4 | ★ 2025.11 新版 |
| 企业发展历程图 | /uploadfiles/2024/09/20240927092611098.jpg | ★ 时间线图 |
| 荣誉资质证书 9 张（中） | 2024/09 20240927093543317（创新型中小）、20240927093426650（专精特新）、2021/11 20211128141430515（高新）、20211128141511171（守合同重信用）、20211128141538312（希望之光）、20240927093914649（品牌认证四星）、20240816091750406（ISO13485）、20211128141703781（CE）、20211128141726171（FDA），另有专利 20240927101556651 | ★ 必须 |
| 公司及产品介绍图 | /uploadfiles/2024/09/20240927101556651.jpg（"中文-企业及产品介绍-ONESKY-202402"） | 宣传图 |
| 6 支产品组装/演示视频（中文） | /uploadfiles/2021/12/20211209094814255.mp4 等 9 支，见 videos_map | 产品演示 |

### 5.2 PDF 下载附件（6 个）

见 §4.4，URL 前缀均为 `https://www.thbiomedic.com/uploadfiles/`，共 6 个 PDF。

### 5.3 视频 MP4（27 个去重，详见 `videos_map_all.txt`）

- 中文视频：7 支列表视频 + 中文首页宣传片（20251112162344793.mp4）
- 英文视频：18 支列表视频（2021-12 ~ 2022-01 上传为主）+ 英文首页宣传片（20251112163145210.mp4）
- 都在 `/uploadfiles/YYYY/MM/xxxxxxxx.mp4`。

### 5.4 图片（全站 /uploadfiles/ 去重 119 项）

- 首页品牌卡、产品占位图、证书图、横幅、公司简介配图等，全清单见 `.multica/asset_names.txt`（本次抓取留档）。
- ⚠️ **静态资源防盗链**：直接 GET 返回 200 但 `Content-Length: 0`；带 `Referer: https://www.thbiomedic.com/...` 后可正常下载（实测 mp4 7.1MB、PDF 32.6MB 均成功）。新版迁移素材时需绕过或提供 Referer。

## 6. 原站技术栈线索

| 维度 | 观察（真实抓取依据） |
|---|---|
| CMS/建站系统 | 万户网络 **ezEip v5.3.0(0649)**（页面源码注释 "Powered By wanhu"，建站方 www.wanhu.com.cn，页面组件类名 Top002742/Bottom003112 等即为 ezEip 模板 ID；生成时间注释 2026.06.18） |
| 后端 | ASP.NET（.aspx 后缀页面，Products/News/Downloads 等均 .aspx）；无 Node/PHP 痕迹 |
| 前端框架 | jQuery 3.3.1 + jQuery Slick（首页轮播）+ Swiper（荣誉资质轮播）+ fancybox（证书灯箱）+ 自研 a.whir.menu.js / a.whir.search.js（站内搜索） |
| 响应式 | ✅ 有（viewport meta + responsive.css/responsive2.0.css + IE8 shiv/respond.js 兼容层） |
| 多语言 | ✅ 中英双站，**物理分目录**（/zn/ 中文、根目录英文），URL 结构同构、lcid 完全对应 |
| 服务器/防护 | openresty（nginx）+ SDWAF；静态资源防盗链（需 Referer） |
| 编码 | UTF-8（meta）、GBK 历史文件混用（部分旧 wanghu 页面 GB2312 头） |
| 表单 | whirform 系统（form id whir_1/whir_2），无验证码 |
| 首页视频 | 原生 `<video>` 播放（Floor003044 区块），MP4 直链 |
| SEO | 全站 title 均为公司名（无页面级 title 差异化）；无 robots.txt/sitemap |

## 7. 待确认 / 缺失项（供新版决策）

1. **新闻动态为空**：中英文站新闻栏目均无任何内容（可能故意下线，或 CMS 迁移丢数据）。新版是否保留"新闻/动态/资讯"栏目？子栏目（公司新闻/行业信息/展会信息）入口全部 404 → 建议新版重设计栏目时移除或补内容。
2. **17 个二级产品分类中的 15 个为空**：只有易锁式低温热塑系列、宠物可塑性外固定网膜两个分类有产品卡片。其他分类（低温热塑板、预裁型、亲肤、网格板×2、支具×4、可调节×2、动力支具、配件、高温板、空气能姿势垫、IFIX 配件×3、宠物保健衣）有分类页、简介、占位图、表单，但**没有产品**。需与客户确认：是缺产品数据，还是这些分类本就不需要产品详情（如"配件"做清单即可）？
3. **英文站公司子页 404**：About Us 下方的 Company Profile / Company Culture 链接 404（中文站对应是页内锚点）。英文站需补齐或改为锚点。
4. **中英一致性差异**：
   - 中文首页宣传视频（20251112162344793.mp4）与英文首页宣传视频（20251112163145210.mp4）是**两个不同的文件**，内容是否一致需人工确认。
   - 中文荣誉含"广东省创新型中小企业"（2024），英文版无对应；英文版含 "FDA Listing"，中文版同位置为 FDA 图。证书图中文用中文版图、英文用英文版图（同证书不同语言文件）。
   - 电话：中文 020-82350336 无分机；英文 020-82350336-2018（多一个分机号）。
   - 下载 PDF：中英文"骨科康复解决方案"分别指向不同 PDF 文件（20251112135837464 vs 20251112134647962），内容是否一致需人工确认。
5. **品牌命名需统一**：中文"宝力易® / 固德易® / 宝力谊®" ↔ 英文 "Polyeasy® / iFIX® / Polyeasy®（宠物）"。其中固德易=iFIX、宝力易=Polyeasy（骨科）、宝力谊=Polyeasy 宠物线。新版需确认品牌词与商标标注。
6. **技术债务**：全站 title/keywords/description 未做页面级 SEO；无 sitemap；视频均为 2021-2022 年上传（除 2025.11 两段）；图片大量残留 base64 中文文件名。
7. **Logo 路径怪癖**：英文站 logo 引用 `/cn/uploadfiles/` 路径（与 `/zn/uploadfiles/` 为同一文件镜像），迁移时只需一份资产。

---

### 附：中间产物（本次抓取留档目录）

- `D:\Projects\playground\thbiomedic\.multica\fetch\` — 全部 143 个成功页面的解码 HTML
- `.multica/report_bfs.json` — 全站 156 URL 抓取报告（状态/标题/资源）
- `.multica/videos_map_all.txt` — 视频标题↔URL 全映射
- `.multica/asset_names.txt` — 119 项 /uploadfiles/ 资源
- `.multica/sitemap.txt`、`cat_tree.txt`、`content_rich2.txt` — 页面/栏目/产品摘要
- `.multica/tools/` — 本次使用的爬虫与分析脚本（bfs.py / crawl.py / content.py 等）