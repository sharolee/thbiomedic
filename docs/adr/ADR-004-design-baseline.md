# ADR-004：设计基线定稿（direction-a-plus 令牌取代 design-spec v1.0）

- **状态**：已接受（Accepted）— 客户 2026-10-09 于 SHAR-51 评论区拍板方向；本文记录基线切换决策
- **日期**：2026-10-09　｜　**决策者**：客户（方向选择）+ 架构师老欧（基线工程化）
- **相关文档**：`docs/design/prototypes/direction-a-plus/styles.css`（令牌事实源）、`docs/design/design-spec.md` v1.0（被取代）、`PROJECT_STANDARDS.md` §5.4（门禁 G4）

## 1. 背景

客户在 `direction-a / b / c / a-plus / b-plus` 五个原型中选定 **direction-a-plus**（专业克制型 + 视频 Hero + 轻粒子）为设计定稿。

随之暴露基线冲突：现行 `design-spec.md` v1.0 主色为传统企业蓝 `#1A5FB4` + 青 `#00B3A6`，与 Logo 识图实测青蓝 `#0D8FB5` 及定稿原型令牌不一致。门禁 G4 以 design-spec 为基准，不切换则实现无所适从。

## 2. 决策

1. **唯一事实源**：设计令牌以 `direction-a-plus/styles.css` 的 `:root` 变量块为准（色板 `#0D8FB5 / #063845 / #E75306` 系、Inter+中文字体栈、字号阶梯、4px 基数间距、1200px 栅格、断点 640/1024、圆角/阴影/动效变量）。
2. **design-spec v1.0 作废**：执行层 R-S6 B0 批次产出 `design-spec.md` v2，将定稿令牌扩写成完整规范（含页面版式与组件样式约定）；G4 门禁基准自 v2 生效起切换。
3. **实现对齐方式**：令牌整块移植至 `src/styles/variables.css`，全站唯一令牌定义点；组件内禁止硬编码色值/断点（G4 可判定检查不变）。
4. **Logo/favicon**：Logo 用已校验本地文件；favicon 新产（原站缺失）。

## 3. 影响与回滚

- 影响：SHAR-50 遗留的「design-spec 与 Logo 色值不一致」问题就此闭环；R-S6 一开工即按 v2 基线执行，不产生二次返工。
- 回滚：客户若推翻方向选择（重新定稿），只需以新原型的 `:root` 块重出 v2 令牌并重跑 B0，实现层改动被令牌体系隔离在 `variables.css` 一处。
