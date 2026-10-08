#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
crawl_assets.py — 天泓医疗原站素材全量盘点（URL 清单，不下载文件）

任务 SHAR-47：抓全 https://www.thbiomedic.com 原站所有可引用素材的 URL，产出
  docs/assets/asset-inventory.json  （机器可读，供新版站点直接引用）
  docs/assets/asset-inventory.md    （人工可读清单）
新版站点后续直接引用这些原站 URL，不依赖本地下载。

设计（针对上一版“itemid 逐号探测过慢、被 10 分钟上限 kill”的返工，见 SHAR-47 评论）：
  1. 限范围 BFS：从 zh/en 各栏目入口出发，只跟同域页面链接，页数上限 + 时间预算双闸；
  2. 正则抽取：每页直接用正则抓 <img src/srcset>、style url()、<a href> 资产、
     v-src / rel= 播放源、<link rel=icon>；不再对空列表做 itemid 逐号探测；
  3. 并行抓取 + 单页超时，避免串行等待（实测全站 ~1 分钟内跑完）；
  4. 编码：实测页面为 UTF-8（可带 BOM），按 utf-8-sig → utf-8 → gbk → gb18030 → latin1 兜底；
  5. 去重：以“去掉查询串的路径”为键合并同一资源（Wanhu 用 base64 文件名做 query），记录出现页面；
  6. 失败单列：仅记录真实抓取失败（HTTP 非 200 / 超时 / 解码失败），不臆造。

用法：
  python scripts/crawl_assets.py                 # 全量
  python scripts/crawl_assets.py --max-pages 40  # 冒烟：只抓前 40 页
  python scripts/crawl_assets.py --time-budget 240 --workers 12
只记录 URL，不批量下载。Logo 由后续任务单独下载识图。
"""

from __future__ import annotations

import argparse
import base64
import json
import re
import sys
import time
from collections import deque
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime
from pathlib import Path
from urllib.parse import urljoin, urlparse, urldefrag

import requests

SITE = "https://www.thbiomedic.com"
OWN_HOSTS = ("www.thbiomedic.com", "thbiomedic.com")
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/120.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
}

# 页面入口：zh 站在 /zn/ 前缀下，en 站在根目录下
SEED_PAGES = [
    "/zn/index.html",
    "/zn/AboutUs/index.html",
    "/zn/Products/index.aspx?lcid=58",
    "/zn/Downloads/list.aspx",
    "/zn/Videos/list.html",
    "/zn/News/list.html",
    "/zn/ContactUs/index.html",
    "/index.aspx",
    "/AboutUs/index.aspx",
    "/Products/index.aspx?lcid=42",
    "/Downloads/list.aspx",
    "/Videos/list.aspx",
    "/News/list.aspx",
    "/ContactUs/index.aspx",
]

IMG_EXT = {"png", "jpg", "jpeg", "gif", "webp", "bmp", "svg", "ico", "tif", "tiff", "avif"}
FILE_EXT = {"pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "zip", "rar", "7z", "csv", "txt", "dwg"}
VIDEO_EXT = {"mp4", "flv", "avi", "wmv", "mov", "m4v", "webm", "mkv", "rmvb", "mpg", "mpeg", "ts"}
PAGE_EXT = {"html", "htm", "aspx", "asp", "php", "jsp"}
NON_PAGE_RE = re.compile(
    r'\.(css|js|json|xml|txt|pdf|docx?|xlsx?|pptx?|zip|rar|7z|'
    r'png|jpe?g|gif|webp|bmp|svg|ico|tiff?|mp4|flv|mov|avi|wmv|m4v|webm|mp3|wav)$', re.I)

# 页面内抽取用正则
RE_ANCHOR = re.compile(r'<a\b[^>]*?\bhref\s*=\s*["\']([^"\']+)["\'][^>]*?>(.*?)</a>', re.I | re.S)
RE_ANCHOR_SELF = re.compile(r'<a\b[^>]*?\bhref\s*=\s*["\']([^"\']+)["\'][^>]*/?>', re.I | re.S)
RE_IMG = re.compile(r'<img\b[^>]*>', re.I | re.S)
RE_ATTR = re.compile(r'\b(?:src|data-src|data-original|data-echo|v-src)\s*=\s*["\']([^"\']+)["\']', re.I)
RE_SRCSET = re.compile(r'\bsrcset\s*=\s*["\']([^"\']+)["\']', re.I)
RE_URLFUNC = re.compile(r'url\(\s*["\']?([^)"\']+)["\']?\s*\)', re.I)
RE_SOURCE = re.compile(r'<(?:source|video|embed|iframe|object)\b[^>]*?\bsrc\s*=\s*["\']([^"\']+)["\']', re.I | re.S)
RE_PLAY_REL = re.compile(r'\b(?:rel|v-src|data-video|data-src)\s*=\s*["\']([^"\']+\.(?:mp4|flv|mov|m4v|webm|avi|wmv)[^"\']*)["\']', re.I)
RE_JS_VIDEO = re.compile(r'["\']((?:/|https?://[^"\']*?)/[^"\']+\.(?:mp4|flv|mov|m4v|webm)[^"\']*)["\']', re.I)
RE_LINK = re.compile(r'<link\b[^>]*>', re.I | re.S)
RE_LINK_HREF = re.compile(r'\bhref\s*=\s*["\']([^"\']+)["\']', re.I)
RE_BG = re.compile(r'background(?:-image)?\s*:\s*url\(\s*["\']?([^)"\']+)["\']?\s*\)', re.I)


def strip_query(url: str) -> str:
    return url.split("#", 1)[0].split("?", 1)[0]


def ext_of(path: str) -> str:
    p = urlparse(urljoin(SITE, path)).path
    m = re.search(r'\.([a-z0-9]+)$', p.lower())
    return m.group(1) if m else ""


def is_own_host(url: str) -> bool:
    return urlparse(url).netloc.lower() in OWN_HOSTS


def is_page_url(url: str) -> bool:
    if not is_own_host(url):
        return False
    p = urlparse(url)
    return not NON_PAGE_RE.search(p.path.lower())


def clean_text(html_fragment: str) -> str:
    return re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', '', html_fragment)).strip()


_SECTION_NAMES = {
    "products": "产品中心", "aboutus": "关于我们", "downloads": "资源下载",
    "videos": "视频", "news": "新闻", "contactus": "联系我们",
    "companyprofile": "公司简介", "search": "搜索",
}


def section_of(page: str) -> str:
    p = urlparse(page).path.lower().strip("/")
    parts = p.split("/") if p else []
    lang = "en"
    if parts and parts[0] == "zn":
        lang = "zh"
        parts = parts[1:]
    if not parts or parts[0] in ("index.html", "index.aspx", ""):
        return f"首页({lang})"
    name = _SECTION_NAMES.get(parts[0])
    return f"{name}({lang})" if name else f"其他({lang})"


def decode_b64_query(url: str, maxlen: int = 80):
    """Wanhu 用 base64 编码原文件名做 query（如 ?QmFubmVyMDAyOTIyLmpwZw== -> 'Banner002922.jpg'）。"""
    q = urlparse(url).query
    val = q.split("=", 1)[-1] if "=" in q else q
    if len(val) < 8 or not re.fullmatch(r"[A-Za-z0-9+/=]+", val):
        return None
    try:
        name = base64.b64decode(val + "=" * (-len(val) % 4)).decode("utf-8", errors="replace")
        name = "".join(c for c in name if c.isprintable()).strip()
        if not name:
            return None
        return name[:maxlen] + "…" if len(name) > maxlen else name
    except Exception:
        return None


def infer_usage(rec: dict) -> str:
    """按出现页面的栏目推断用途；图片额外给出类别 + 原文件名线索。"""
    pages = rec.get("pages") or [""]
    secs = [section_of(p) for p in pages]
    main = max(set(secs), key=secs.count) if secs else ""
    kinds = rec["kind"]
    cat = ""
    joined = " ".join(pages)
    if "/Products/" in joined:
        cat = "产品图（列表/详情/分类横幅）"
    elif "/AboutUs/" in joined:
        cat = "关于我们配图（含荣誉资质/证书轮播）"
    elif "/Videos/" in joined:
        cat = "视频封面图"
    elif "/Downloads/" in joined:
        cat = "下载页配图"
    elif "/ContactUs/" in joined:
        cat = "联系页配图"
    elif kinds == "videos":
        cat = "视频"
    elif kinds == "files":
        cat = "下载文件"
    hint = decode_b64_query(rec["url"]) or ""
    parts = [x for x in (main, cat, hint) if x]
    return "；".join(parts)


class Crawler:
    def __init__(self, max_pages: int, time_budget: float, workers: int, timeout: float):
        self.max_pages = max_pages
        self.time_budget = time_budget
        self.workers = workers
        self.timeout = timeout
        self.t0 = time.time()
        self.visited: set[str] = set()
        self.queued: set[str] = set()
        self.failures: list[dict] = []
        self.assets: dict[str, dict] = {}
        self.pages_ok = 0
        self.requests = 0
        self.favicon = None
        self.favicon_note = ""

    # ---------- 素材登记（key = 去查询串的 URL，合并同一资源）----------
    def _ext(self, full: str, page: str, kind: str, usage: str = ""):
        if not full or not full.startswith("http"):
            return
        key = strip_query(full)
        rec = self.assets.get(key)
        if rec is None:
            rec = {"url": full, "kind": kind, "usage": usage or "", "pages": [], "notes": []}
            self.assets[key] = rec
        elif usage and not rec["usage"]:
            rec["usage"] = usage
        # 同一 key 出现多种分类时，资产类优先于 external
        priority = {"images": 3, "videos": 3, "files": 3, "external": 1}
        if priority.get(kind, 0) > priority.get(rec["kind"], 0):
            rec["kind"] = kind
        if page not in rec["pages"]:
            rec["pages"].append(page)

    def _classify_link(self, raw: str, page: str, usage: str = ""):
        if not raw:
            return
        raw = raw.strip()
        if raw.startswith(("data:", "javascript:", "mailto:", "tel:", "#")):
            return
        full = urljoin(page, raw.replace(" ", "%20"))
        if not full.startswith("http"):
            return
        ext = ext_of(full)
        if not is_own_host(full):
            kind = "images" if ext in IMG_EXT else "external"
            self._ext(full, page, kind, usage)
            return
        if ext in VIDEO_EXT:
            self._ext(full, page, "videos", usage)
        elif ext in FILE_EXT:
            self._ext(full, page, "files", usage)
        elif ext in IMG_EXT:
            self._ext(full, page, "images", usage)

    # ---------- 解析一个页面 ----------
    def parse(self, page: str, html: str):
        """产出 ('page', url) 供 BFS；其余链接按类别登记为素材。"""
        # 1) <a href>：页面 → 入队；外链/资产 → 登记
        seen_anchor = set()
        for m in RE_ANCHOR.finditer(html):
            href, inner = m.group(1), m.group(2)
            seen_anchor.add(href)
            u = urljoin(page, href.replace(" ", "%20"))
            if not u.startswith(("http", "//")):
                continue
            if is_page_url(u):
                yield ("page", urldefrag(u)[0])
            else:
                self._classify_link(href, page, clean_text(inner)[:80])
        for m in RE_ANCHOR_SELF.finditer(html):
            href = m.group(1)
            if href in seen_anchor:
                continue
            u = urljoin(page, href.replace(" ", "%20"))
            if u.startswith(("http", "//")) and is_page_url(u):
                yield ("page", urldefrag(u)[0])
            else:
                self._classify_link(href, page)

        # 2) <img>（含 data-src / srcset 懒加载）
        for tag in RE_IMG.finditer(html):
            t = tag.group(0)
            alt = ""
            am = re.search(r'\balt\s*=\s*["\']([^"\']*)["\']', t, re.I)
            if am:
                alt = am.group(1).strip()
            for a in RE_ATTR.finditer(t):
                self._classify_link(a.group(1), page, alt)
            sm = RE_SRCSET.search(t)
            if sm:
                for part in sm.group(1).split(","):
                    self._classify_link(part.strip().split(" ")[0], page, alt)

        # 3) 内联/内嵌样式里的 url()
        for um in RE_URLFUNC.finditer(html):
            self._classify_link(um.group(1), page)
        for bm in RE_BG.finditer(html):
            self._classify_link(bm.group(1), page)

        # 4) <source>/<video>/<embed>/<iframe>
        for sm in RE_SOURCE.finditer(html):
            u = urljoin(page, sm.group(1).replace(" ", "%20"))
            if is_page_url(u):
                yield ("page", urldefrag(u)[0])
            else:
                self._classify_link(sm.group(1), page)

        # 5) 播放页的 rel=/v-src= mp4
        for m in RE_PLAY_REL.finditer(html):
            self._classify_link(m.group(1), page)

        # 6) JS 拼出的视频文件路径（files="/uploadfiles/....mp4"）
        for m in RE_JS_VIDEO.finditer(html):
            self._classify_link(m.group(1), page)

        # 7) favicon
        for tag in RE_LINK.finditer(html):
            t = tag.group(0)
            if re.search(r'rel\s*=\s*["\'][^"\']*icon', t, re.I):
                hm = RE_LINK_HREF.search(t)
                if hm:
                    full = urljoin(page, hm.group(1).replace(" ", "%20"))
                    if full.startswith("http"):
                        self.favicon = self.favicon or full

    # ---------- 抓取 ----------
    def fetch(self, url: str, retries: int = 3):
        """实测原站并发下会间歇返回 502/超时，对可重试错误做退避重试。"""
        last = ("ERR", "unknown")
        for attempt in range(retries):
            self.requests += 1
            try:
                r = requests.get(url, headers=HEADERS, timeout=self.timeout, allow_redirects=True)
            except requests.RequestException as e:
                last = ("ERR", f"{type(e).__name__}: {e}")
                time.sleep(0.4 * (attempt + 1))
                continue
            if r.status_code in (429, 500, 502, 503, 504):
                last = (r.status_code, f"HTTP {r.status_code}")
                time.sleep(0.4 * (attempt + 1))
                continue
            if r.status_code != 200:
                return url, r.status_code, None, f"HTTP {r.status_code}"
            raw = r.content
            for enc in ("utf-8-sig", "utf-8", "gbk", "gb18030", "latin1"):
                try:
                    return url, 200, raw.decode(enc), None
                except UnicodeDecodeError:
                    continue
            return url, 200, None, "decode failed"
        return url, last[0], None, last[1]

    def run(self):
        queue: deque[str] = deque()
        for s in SEED_PAGES:
            u = urldefrag(SITE + s)[0]
            if u not in self.queued:
                self.queued.add(u)
                queue.append(u)

        while queue and self.pages_ok < self.max_pages:
            if time.time() - self.t0 > self.time_budget:
                self.failures.append({"url": "(BFS)", "status": "stopped",
                                      "reason": f"时间预算 {self.time_budget:.0f}s 用尽，剩余 {len(queue)} 页未抓"})
                break
            batch = []
            while queue and len(batch) < self.workers and self.pages_ok + len(batch) < self.max_pages:
                u = queue.popleft()
                if u in self.visited:
                    continue
                self.visited.add(u)
                batch.append(u)
            if not batch:
                continue
            with ThreadPoolExecutor(max_workers=self.workers) as ex:
                futs = {ex.submit(self.fetch, u): u for u in batch}
                for f in as_completed(futs):
                    url, status, html, err = f.result()
                    if err or html is None:
                        self.failures.append({"url": url, "status": status or "ERR", "reason": err or "unknown"})
                        continue
                    self.pages_ok += 1
                    try:
                        for _, lu in self.parse(url, html):
                            if lu not in self.queued:
                                self.queued.add(lu)
                                queue.append(lu)
                    except Exception as e:  # noqa: BLE001
                        self.failures.append({"url": url, "status": "PARSE",
                                              "reason": f"parse error: {type(e).__name__}: {e}"})
            if self.pages_ok and self.pages_ok % 25 < self.workers:
                print(f"  ... pages_ok={self.pages_ok} req={self.requests} queue={len(queue)} assets={len(self.assets)}",
                      file=sys.stderr)

        # favicon 兜底探测
        if not self.favicon:
            try:
                fr = requests.get(SITE + "/favicon.ico", headers=HEADERS, timeout=self.timeout)
                self.requests += 1
                if fr.status_code == 200 and fr.headers.get("content-type", "").lower().startswith("image"):
                    self.favicon = SITE + "/favicon.ico"
                else:
                    self.favicon_note = f"根目录 /favicon.ico 返回 {fr.status_code}；页面也未见 <link rel=icon>"
            except requests.RequestException as e:
                self.favicon_note = f"favicon 探测失败：{e}"

    # ---------- 汇总 ----------
    def aggregate(self, elapsed: float) -> dict:
        buckets = {"images": [], "files": [], "videos": [], "external": []}
        logos = []
        for rec in self.assets.values():
            kind = rec["kind"]
            if not rec.get("usage"):
                rec["usage"] = infer_usage(rec)
            path = strip_query(rec["url"])
            name = Path(path).name.lower()
            if "logo" in name and (path.lower().endswith((".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp"))):
                usage = "头部Logo" if "top" in name else "页脚Logo" if "bottom" in name else "Logo"
                rec = {**rec, "usage": usage}
                logos.append(rec)
                continue
            buckets.setdefault(kind, []).append(rec)

        for v in list(buckets.values()) + [logos]:
            v.sort(key=lambda r: r["url"])

        stats = {
            "pages_crawled_ok": self.pages_ok,
            "requests": self.requests,
            "images": len(buckets["images"]),
            "files": len(buckets["files"]),
            "videos": len(buckets["videos"]),
            "external": len(buckets["external"]),
            "logo": len(logos),
            "favicon": self.favicon or "未发现",
            "failures": len(self.failures),
        }
        return {
            "generated_at": datetime.now().astimezone().strftime("%Y-%m-%dT%H:%M:%S%z"),
            "site": {"zh": SITE + "/zn/index.html", "en": SITE + "/index.aspx"},
            "crawl": {
                "pages_visited": len(self.visited),
                "pages_ok": self.pages_ok,
                "requests": self.requests,
                "elapsed_sec": round(elapsed, 1),
                "max_pages": self.max_pages,
                "time_budget_sec": self.time_budget,
            },
            "stats": stats,
            "logos": logos,
            "favicon": {"url": self.favicon, "note": self.favicon_note},
            "images": buckets["images"],
            "files": buckets["files"],
            "videos": buckets["videos"],
            "external": buckets["external"],
            "failures": sorted(self.failures, key=lambda x: str(x["url"])),
        }


def _pages_cell(pages, n=6):
    if len(pages) <= n:
        return ", ".join(pages)
    return ", ".join(pages[:n]) + f" 等 {len(pages)} 页"


def render_md(data: dict) -> str:
    s, c = data["stats"], data["crawl"]
    L = [
        "# 天泓医疗原站素材资源清单（Asset Inventory）",
        "",
        f"> 生成时间：{data['generated_at']}　｜　脚本：`scripts/crawl_assets.py`（只记录 URL，不下载文件）",
        f"> 中文站：{data['site']['zh']}　｜　英文站：{data['site']['en']}",
        "",
        "## 0. 盘点统计",
        "",
        "| 类别 | 数量 |",
        "|---|---|",
        f"| 图片资源（去重） | {s['images']} |",
        f"| 下载文件（PDF/DOC/ZIP 等） | {s['files']} |",
        f"| 视频 | {s['videos']} |",
        f"| Logo | {s['logo']} |",
        f"| favicon | {s['favicon']} |",
        f"| 外链 / 第三方资源 | {s['external']} |",
        f"| 抓取失败 | {s['failures']} |",
        "",
        f"抓取覆盖：访问 {c['pages_visited']} 页，成功 {c['pages_ok']} 页，共 {c['requests']} 次请求，耗时 {c['elapsed_sec']}s。",
        "",
    ]

    def table(title, rows, with_usage=True):
        L.append(f"## {title}")
        L.append("")
        if not rows:
            L.append("（无）")
            L.append("")
            return
        head = "| URL | 用途 | 出现页面 |" if with_usage else "| URL | 出现页面 |"
        L.append(head)
        L.append("|---|---|---|" if with_usage else "|---|---|")
        for r in rows:
            url = r["url"].replace("|", "\\|")
            pc = _pages_cell(r.get("pages", [])).replace("|", "\\|")
            if with_usage:
                L.append(f"| {url} | {r.get('usage','')} | {pc} |")
            else:
                L.append(f"| {url} | {pc} |")
        L.append("")

    table("1. Logo（后续下载识图）", data["logos"])
    fav = data["favicon"]
    L += ["## 2. favicon", "", f"{fav['url'] or '未发现'}"
          + (f"　（{fav['note']}）" if fav.get("note") else ""), ""]
    table("3. 下载文件", data["files"])
    table("4. 视频", data["videos"])
    table("5. 外链与第三方资源", data["external"], with_usage=False)
    table("6. 图片资源", data["images"])

    L += ["## 7. 抓取失败清单", ""]
    if not data["failures"]:
        L.append("无。")
    else:
        L.append("| URL | 状态 | 原因 |")
        L.append("|---|---|---|")
        for f in data["failures"]:
            L.append(f"| {str(f['url']).replace('|', chr(92)+'|')} | {f['status']} | "
                     f"{str(f['reason']).replace('|', chr(92)+'|')} |")
    L.append("")
    return "\n".join(L)


def main():
    ap = argparse.ArgumentParser(description="天泓医疗原站素材全量盘点")
    ap.add_argument("--out-json", default="docs/assets/asset-inventory.json")
    ap.add_argument("--out-md", default="docs/assets/asset-inventory.md")
    ap.add_argument("--max-pages", type=int, default=300)
    ap.add_argument("--time-budget", type=float, default=420.0)
    ap.add_argument("--workers", type=int, default=6)
    ap.add_argument("--timeout", type=float, default=20.0)
    args = ap.parse_args()

    t0 = time.time()
    c = Crawler(args.max_pages, args.time_budget, args.workers, args.timeout)
    print(f"[crawl] seeds={len(SEED_PAGES)} max_pages={args.max_pages} "
          f"budget={args.time_budget:.0f}s workers={args.workers}", file=sys.stderr)
    c.run()
    data = c.aggregate(time.time() - t0)

    Path(args.out_json).parent.mkdir(parents=True, exist_ok=True)
    Path(args.out_json).write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    Path(args.out_md).write_text(render_md(data), encoding="utf-8")
    print(json.dumps(data["stats"], ensure_ascii=False, indent=2))
    print(f"[crawl] -> {args.out_json} / {args.out_md}")
    print(f"[crawl] elapsed={data['crawl']['elapsed_sec']}s")


if __name__ == "__main__":
    main()
