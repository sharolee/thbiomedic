# 广州天泓医疗科技有限公司新版官网

> 中英双语（`/zh/` / `/en/`）企业官网，基于 **Astro SSG**（ADR-001 推荐栈），构建产出纯静态 `dist/`。

## 技术栈

- **框架**: Astro 7（静态站点生成，ADR-001 方案 B）
- **语言**: TypeScript（严格模式）
- **样式**: 原生 CSS + 设计令牌（`src/styles/variables.css`，design-spec §1-7）
- **双语**: `/zh/` `/en/` 目录前缀 + 单语言字典（ADR-002，`src/content/{zh,en}/`）
- **目录结构**: 见 `docs/architecture.md`

## 快速开始

> Node ≥ 22.12（`engines` 强制；`.nvmrc` 锁定 22.12.0）

```bash
# 安装依赖
npm install

# 开发模式（热更新，默认端口 4321）
npm run dev

# 生产构建（产出 dist/，含 /zh/ /en/ 完整静态站点）
npm run build

# 本地预览构建产物
npm run preview

# 类型检查（astro check）
npm run typecheck

# 双语完整性校验（两语言键集合一致、无空值）
npm run i18n:check

# 完整验收流水线（typecheck → i18n:check → build）
npm run check:all
```

## 项目结构

```
├── astro.config.mjs           # Astro 配置（i18n 路由、alias）
├── src/
│   ├── pages/                 # 文件系统路由（index / zh / en / 404）
│   │   ├── zh/                # 中文站页面
│   │   └── en/                # 英文站页面（结构镜像 zh）
│   ├── components/            # 可复用组件（layout / ui / product / content）
│   ├── content/               # 双语字典与数据
│   │   ├── zh/                # 中文文案
│   │   └── en/                # 英文文案（同键同结构）
│   ├── styles/                # variables / global / utilities / components
│   ├── scripts/               # 客户端交互脚本（岛屿用）
│   ├── utils/                 # i18n / url / seo / content / assets
│   └── types/                 # 字典、内容数据、组件 Props 类型
├── public/assets/             # 静态资源（images / videos / downloads）
├── scripts/                   # 构建/校验辅助脚本（i18n-check 等）
├── docs/                      # 项目文档（ADR / design / i18n / architecture）
└── package.json
```

## 设计规范

见 `docs/design/design-spec.md`、`docs/design/page-structure.md`

## 内容模型

见 `docs/i18n/content-model.md`、`docs/i18n/key-convention.md`、`docs/i18n/translation-matrix.md`

## 验收清单

见 `docs/design/acceptance-checklist.md`、`PROJECT_STANDARDS.md` §10
