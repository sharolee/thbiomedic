# Logo 原站资产（下载与校验）

> 下载时间：**2026-10-08 18:44 +0800**
> URL 来源：`docs/assets/asset-inventory.json` 的 `logos[]`（4 条，未重新猜测路径，下载前做了精确断言）
> 下载工具：Python 3.12 `urllib`（真实执行，命令与输出见 SHAR-49 评论）

## 0. 结论速览

- 4 条 URL 全部 HTTP 200 且**字节完全一致**（同 SHA256、同 ETag、同 Last-Modified）——原站实际只有 **1 张 Logo 图**，同时充当中文/英文站的头部 Logo 与页脚 Logo。已按约定去重合并为 **1 个文件**（映射见 §2）。
- 唯一文件 `logo.png`：PNG，188×54 px，5 408 B，RGBA，**透明底**（67.2% 像素 alpha=0）。
- 原站**没有 favicon**（`/favicon.ico` 404；14 个采样页面无任何 `<link rel=icon>` / `.ico` / `apple-touch-icon` / `manifest` 引用），属站点缺失而非抓取遗漏。新版站点需自行提供，见 §4。

## 1. 文件清单

| 文件 | 原站 URL | 文件大小 | 图片格式 | 是否透明底 | 下载时间 |
|---|---|---|---|---|---|
| `logo.png` | 见 §2（4 条 URL 指向同一份内容） | 5 408 B | PNG（RGBA，PNG 签名 `89 50 4E 47`） | **是**，真透明（alpha=0 占 67.2%，另有 23.4% 半透明抗锯齿像素） | 2026-10-08 18:44 +0800 |

单文件校验（Python + Pillow，逐像素统计，非推断）：

| 项 | 值 |
|---|---|
| 尺寸 | 188 × 54 px（长宽比 3.48:1 横版） |
| 内容包围盒 `getbbox()` | `(1, 2, 188, 50)` → 实际内容 187 × 48 px |
| 色彩模式 | RGBA |
| alpha 不同取值数 | 250（说明边缘做了抗锯齿，非硬边裁切） |
| alpha=0 像素 | 6 819 / 10 152 = **67.2%** |
| alpha=255 像素 | 969 / 10 152 = 9.5% |
| 半透明像素（0<α<255） | 2 364 = 23.3% |
| 不透明像素合计（含半透明） | 3 333 |
| PNG 附加元数据 | `srgb`（sRGB 伽马）、`dpi` = 144×144（≈72dpi 的 2 倍声明，仅供浏览器参考，不是矢量） |
| 四角像素 RGBA | `(0,0,0,0)` × 4（全透明） |
| SHA-256 | `867a7aaf80461f0a7e9e7ba4649fab17d902f07ae2f123cb508a130a00dcfe25` |
| 服务端 ETag | `W/"80d06bb1a6ded81:0"` |
| 服务端 Last-Modified | Thu, 13 Oct 2022 01:54:13 GMT |

## 2. 4 条 URL → 1 个文件的对应关系

| 原站 URL | 站点/页面 | 响应 | 与 `logo.png` 是否同图 |
|---|---|---|---|
| https://www.thbiomedic.com/cn/uploadfiles/Top002908_logo.png | 头部 Logo（`/index.aspx` 等 7 页） | 200 / image/png | 是（SHA-256 相同） |
| https://www.thbiomedic.com/cn/uploadfiles/Bottom002909_logo.png | 页脚 Logo（同上 7 页） | 200 / image/png | 是 |
| https://www.thbiomedic.com/zn/uploadfiles/Top002908_logo.png | 头部 Logo（`/zn/index.html` 等 7 页） | 200 / image/png | 是 |
| https://www.thbiomedic.com/zn/uploadfiles/Bottom002909_logo.png | 页脚 Logo（同上 7 页） | 200 / image/png | 是 |

两点值得记录的事实：

1. **头部与页脚用的是同一张图**。文件名 `Top…/Bottom…` 不同，但服务端返回同 ETag、同字节。
2. **`/cn/` 目录名不等于"中文站"**：实测 `/index.aspx`（页面标题 `Guangzhou Tian Hong Medical Technology Co.,LTD`，英文站）引用的是 `/cn/uploadfiles/…`，而 `/zn/index.html`（标题 `广州天泓医疗科技有限公司`，中文站）引用的是 `/zn/uploadfiles/…`。两条路径只是上传目录不同，文件内容相同，因此去重后不影响任何用途。
3. 页面 HTML 里是裸 `<img src="…">`，**没有 `alt` 属性**，也没有 `width`/`height`——新站需要自行补 `alt`（原站缺失，不是抓取遗漏）。

## 3. 抓取注意（给后续下载脚本用）

该站点由 `openresty + SDWAF` 托管，静态图片响应**只有带 `Accept-Encoding` 头时才返回真实字节**：

```
curl -I https://www.thbiomedic.com/cn/uploadfiles/Top002908_logo.png
  → HTTP/1.1 200 OK, Content-Length: 0          # 不带 Accept-Encoding

curl -D - -o NUL 同上URL -H "Accept-Encoding: gzip"
  → HTTP/1.1 200 OK, Content-Type: image/png, Content-Encoding: gzip
```

即：请求需带浏览器式头（`Accept-Encoding: gzip, deflate` 等），并把响应体 gunzip 后再落盘——否则拿到 0 字节或一坨 gzip 字节流（首轮就踩到了：4 个 0 字节文件）。`scripts/crawl_assets.py` 只记 URL 不下载，所以 asset-inventory 本身没暴露这个问题。

## 4. favicon 结论（新版站点需自行提供）

原站本身就没有 favicon，属站点缺失、非抓取遗漏，已独立复核：

| 端点 | 结果 |
|---|---|
| `/favicon.ico` | HTTP 404 Not Found |
| `/manifest.json`、`/site.webmanifest` | HTTP 404 Not Found |
| `/favicon.png`、`/apple-touch-icon.png` | HTTP 200 但 **Content-Length: 0、无 Content-Type**（伪响应，不是真图标文件） |

另抓取 14 个页面（中英各 7：首页 / 关于我们 / 产品中心 / 下载 / 视频 / 新闻 / 联系我们）做全文匹配 `rel="icon"`、`shortcut icon`、`*.ico`、`apple-touch-icon`、`manifest`：**0 命中**。

→ 新版站点（`/zh/` `/en/`）需要自己提供 favicon，建议在 `public/` 下放 favicon.ico + PNG 版 + manifest，并在布局组件里显式 `<link rel="icon">`。素材可直接从 `logo.png` 派生（透明底 PNG，适合裁方）。
