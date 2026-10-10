# AGENTS.md 被清空/改写机制 —— 根因调查报告（SHAR-55）

- 调查对象：`D:\Projects\playground\thbiomedic`（天泓医疗网站项目，分支 `feat/site-v2`）仓库根目录的 `AGENTS.md`
- 调查类型：只读取证（未修改 `AGENTS.md`、未 checkout/reset、未停进程）
- 调查时间：2026-10-10 11:26 ~ 11:45 (+0800)
- 运行时/环境：Multica daemon `0.6.0`（pid 27524，`C:\Users\Administrator\.multica\bin\multica.exe`），源码在 `D:\Projects\multica\server\internal\daemon\`

> 结论标注约定：**【已证实】** = 有源码 / 命令原始输出 / 时间戳直接支撑；**【推测】** = 有间接证据但未完全闭环。

---

## 0. 一句话结论

**`AGENTS.md` 不是被"神秘清空"，而是被 Multica daemon 自己在每次 opencode/pi 任务结束时主动"剪切回原样"（excision）。** 平台在任务开始时把一段"运行时简报"注入 `{工作目录}/AGENTS.md`（用 `<!-- BEGIN/END MULTICA-RUNTIME -->` 包裹），任务结束时又用 `CleanupRuntimeConfig` 把这段简报剪掉。真正的"事故"在于：本项目的工作目录就是**用户自己的仓库**，而某次运行期间有 agent 执行了 `git add -A` 把这份**本应瞬时存在**的简报**提交进了 git**（提交 `a737ac5` / `f1be38d`）。此后每次任务结束的剪切，都会让工作树相对 HEAD 出现"-193 行"——看起来像文件被清空，实际是 daemon 在删除它自己注入、却被误提交的那一块。

与 "idle watchdog 强停" 的同秒相关性是**伴随现象而非因果**：opencode 任务既是被 watchdog 监视的（`idle_watchdog=10m0s`）、又是唯一写 `AGENTS.md` 的 provider；因此 watchdog 强停时刻必然伴随一次 daemon 剪切。**11:28 的一次"清空"是 `agent_error` 失败退出的，并非 watchdog**，直接推翻了"清空由 watchdog 触发"的假设。

---

## 1. 官方语义：`AGENTS.md` 是"带标记的托管块"，可写可剪

平台源码 `server/internal/daemon/execenv/runtime_config.go`：

```go
// runtime_config.go:32
runtimeMarkerBegin = "<!-- BEGIN MULTICA-RUNTIME (auto-managed; do not edit) -->"
runtimeMarkerEnd   = "<!-- END MULTICA-RUNTIME -->"
```

`InjectRuntimeConfig`（`runtime_config.go:182`）→ `writeRuntimeConfigFile`（`:247`）在**任务开始**写入简报；provider→文件名映射（`:197-223`）规定：**opencode / pi / codex / cursor … 写 `AGENTS.md`；codebuddy 写 `CODEBUDDY.md`**。

`CleanupRuntimeConfig`（`:349`）在**任务结束**剪切该块，源码注释（`:339-345`）明确其动机：

> Required for the local_directory flow (WorkDir is the user's own repo): without this pass, a manual `claude` / `codex` run started by the user inside the same directory after a Multica task would pick up the stale brief …

调用点 `server/internal/daemon/daemon.go`：

```go
// daemon.go:8434  任务开始：注入
runtimeBrief, err := execenv.InjectRuntimeConfig(env.WorkDir, provider, taskCtx)

// daemon.go:8324  任务退出：剪切（LocalDirectory 或 LocalWorktree 模式）
if env.LocalDirectory || env.LocalWorktree != nil {
    defer func() {
        if cerr := execenv.CleanupRuntimeConfig(env.WorkDir, provider); cerr != nil { ... }
        ...
    }()
}
```

`execenv/local_worktree.go:1638-1640` 的设计假设：

> CLAUDE.md / AGENTS.md are deliberately absent: those are ordinarily the user's own tracked files, and the runtime only injects a marker block into them, which CleanupRuntimeConfig removes.

**即：平台的设计前提是"`AGENTS.md` 是用户自己的已跟踪文件，我们只往里塞一段会被收回的块"。一旦这个前提被打破（文件是被 daemon 新建、又被 agent 提交），剪切就变成了对 git 的"删除"。**

**【已证实】** 源码 + 调用点如上。

---

## 2. 事件时间线（daemon 日志 + 文件时间戳对照）

日志文件：`C:\Users\Administrator\.multica\daemon.log`。工作目录：`D:\Projects\playground\thbiomedic`。所有在此时段运行的任务 `workdir` 均为该仓库（`local_directory` 就地模式，`git worktree list` 仅一条主工作树，无 `.git/worktrees`）。

| 时刻 (+0800) | 事件 | 证据（daemon.log 行号 / 命令输出） | AGENTS.md 现场 |
|---|---|---|---|
| 10-05 10:54:22 | agent 提交 `a737ac5`，**新增** `AGENTS.md`（193 行，仅简报块） | `git show a737ac5 --numstat -- AGENTS.md` → `193 0` | 文件此前不存在；由 daemon 从"缺失"态创建 |
| 10-09 16:56:09 | agent 提交 `f1be38d`，改 `AGENTS.md`（+4/-3：3 空行 + 身份文本 + 技能表） | `git show f1be38d -- AGENTS.md` | 文件被某次运行的注入改写后又被提交 |
| 10-10 11:28:01.991 | **opencode** 任务 `01a123cd` 以 `status=failed / failure_reason=agent_error.unknown` 结束 | `daemon.log:39531` `INF opencode finished pid=25564 status=failed` | 剪切 → 8 字节（4×CRLF），mtime **11:28:02.776** |
| 10-10 11:32:10.030 | **opencode** 任务 `01a123de`（agent 2c6f640d / 全栈小欧）启动 → 注入 | `daemon.log:39699` `starting agent provider=opencode workdir=…` | mtime **11:32:10.029**，size 21516（简报在） |
| 10-10 11:58:01.504 | **watchdog 强停** opencode 任务 `01a11e92` | `daemon.log:13287` `WRN idle watchdog firing … task=01a11e92`；`:13303` `11:58:04.700 opencode finished pid=61952 status=aborted` | 记者观测"清空发生在 11:58:01"（`daemon.log:13410`） |
| 10-10 12:50:12.730 | **watchdog 强停** opencode 任务 `01a11ed5` | `daemon.log:14559`；`:14577` `12:50:14.072 opencode finished pid=60684 status=aborted` | 记者观测"AGENTS.md 又在强停同秒被清空"（`daemon.log:14631`） |

**关键反例（推翻"watchdog 因果论"）**：11:28:01 这次清空发生在 **`failure_reason=agent_error.unknown`**（模型返回 `Bad Request … code:10305`）的任务退出上，**与该次 watchdog 强停无关**。12:50 那次也同样是"任务结束"这一共同事件，而非 watchdog 本身。清空发生在**每一次 opencode/pi 任务结束**，watchdog 只是把"任务结束"变得显眼。

**为什么会"看起来只在 watchdog 时出现"**【已证实】：daemon 给不同 provider 配了不同的空闲阈值——opencode `idle_watchdog=10m0s`，codebuddy `idle_watchdog=0s`（`daemon.log:13504`、`:13308`、`:14581`）。**只有 opencode/pi 任务会被 watchdog 强停，也只有它们会写 `AGENTS.md`**，于是两个集合重合，制造了"同秒"的假相关。

---

## 3. 根因结论

### 3.1 直接机制（谁 / 何时 / 怎么做）【已证实】

1. **写入方 = Multica daemon**（非"神秘第三方"，非运行时 CLI）。
   - 任务开始：`InjectRuntimeConfig` → `writeRuntimeConfigFile` 把简报写入 `D:\Projects\playground\thbiomedic\AGENTS.md`（`runtime_config.go:247`）。
   - 任务结束：defer 里的 `CleanupRuntimeConfig` 剪切该块（`daemon.go:8324-8358`、`runtime_config.go:349`）。
2. **写入方式**：`os.WriteFile`（截断后写，`runtime_config.go:252/266/274`），因此写入瞬间存在"文件被截断"的窗口。**【已证实】** 我在 11:28:02 抓到 8 字节、11:32:10 抓到完整 21516 字节的两个状态。
3. **触发条件**：`env.LocalDirectory || env.LocalWorktree != nil`（就地或工作树模式）。本项目是**就地**模式——工作目录即用户仓库。
4. **"清空"的字节真相**：剪切留下的 `remainder` = 简报块之前的"前缀"（本应是用户原有内容）。实测该前缀 = `\r\n\r\n\r\n\r\n`（4×CRLF，8 字节）。**所谓"清空后只剩框架/更少"，就是这段残余前缀。**

### 3.2 为什么"报告里出现她人 agent 身份"【已证实】

简报内嵌**当时运行的那个 agent 的身份**。`f1be38d` 提交的文件里是 `**You are: 全栈小欧** (ID: 2c6f640d…)`，而该提交的 git 作者是 `全栈老欧`（仓库 `.git/config` 的 `user.name`）。二者是**同一个 agent**（`multica agent get 2c6f640d…` 现名 "全栈小欧"，runtime `c0585f4d…` opencode），期间被改名。提交把运行时注入的身份文本固化进了仓库，于是"看起来像把她人身份写进了托管文件"。

### 3.3 真正的事故链（为什么会"清空 -193 行"）【已证实】

```
仓库最初没有 AGENTS.md
  └─(opencode 任务开始) daemon 从"缺失"态创建 AGENTS.md（仅简报块）
      └─(运行期间) agent 执行 git add -A → AGENTS.md 被暂存
          └─(运行期间) agent git commit → a737ac5 把简报块提交进 HEAD
              └─(之后每次 opencode 任务结束) daemon 剪切简报块
                  → 工作树相对 HEAD 少了整块（194 行）→ git status/diff 显示 "-193 行"
```

即：**"清空"是 daemon 正常收回它自己注入的块的副作用；之所以造成破坏，是因为这份"本应瞬时存在"的文件被 agent 误提交进了版本库。**`AGENTS.md` 未列入 `.gitignore`（`.gitignore` 只忽略了 `.opencode/`、`.multica/`、`.pi/`），daemon 在就地模式下也无法用 `.git/info/exclude` 遮蔽它（`execenv/local_worktree.go:484-492` 明确说明该文件不该被 exclude，因为它"通常是用户自己的已跟踪文件"）。

### 3.4 次要缺陷：Windows CRLF 与 LF 剪切的混用【推测（有源码与字节依据）】

标记块与分隔符是用 `\n`（LF）写入/识别的：
- `block := runtimeMarkerBegin + "\n" + … + runtimeMarkerEnd + "\n"`（`runtime_config.go:248`）
- 剪切时 `locateMarkerBlock` 只在 `content[end] == '\n'` 时多吞一个换行（`:311-313`）。

而 Windows 上 git `core.autocrlf=true`（仓库实测为 `true`）会把检出的文本文件转成 CRLF。两者混用时，块尾的 `\r\n` 不会被 `== '\n'` 识别，会被当成"用户内容"留在文件里，逐次累积空行。这能解释 HEAD 是 3 个前导空行、而当前工作树变成 6 个前导空行（`git diff` 显示 `+3`）。**此点未做闭环复现，标注为推测。**

---

## 4. 证据链（真实命令 + 原始输出）

### 4.1 文件在两个状态间振荡（工作目录 = 仓库）

```
$ stat -c '%s %y' /d/Projects/playground/thbiomedic/AGENTS.md     # 11:28 抓取
8 2026-10-10 11:28:02.776263700 +0800
$ od -c AGENTS.md | head
0000000  \r  \n  \r  \n  \r  \n  \r  \n            # 8 字节：4×CRLF，无任何标记
...
$ stat -c '%s %y' AGENTS.md                                      # 11:32 再抓取
21516 2026-10-10 11:32:10.029649600 +0800        # 完整简报（含 BEGIN/END 标记）
```

### 4.2 git 历史：`AGENTS.md` 被"创建"和"改写"

```
$ git log --all --pretty=format:'%h|%ai|%an|%s' -- AGENTS.md
f1be38d3547b79135a54c69317f7a69078067529|2026-10-09 16:56:09 +0800|全栈老欧|feat(videos): …(SHAR-52)
a737ac5ffbe36847f55ecaa175a2f82fe98f5cea|2026-10-05 10:54:22 +0800|全栈老欧|docs+content: 批次1公共文案…(SHAR-40)

$ git show a737ac5 --numstat -- AGENTS.md
193     0       AGENTS.md           # 新增 193 行 = 整个简报块

$ git show a737ac5:AGENTS.md | head -1
<!-- BEGIN MULTICA-RUNTIME (auto-managed; do not edit) -->     # 第 1 行即标记 → 从"缺失"态创建

$ git show f1be38d -- AGENTS.md | head -30
@@ -1,3 +1,6 @@
+
+
+
 <!-- BEGIN MULTICA-RUNTIME (auto-managed; do not edit) -->
@@ -15,7 +18,7 @@
-**You are: 全栈老欧** (ID: `2c6f640d-27dc-4b58-bd81-cc71cebac9d8`)
+**You are: 全栈小欧** (ID: `2c6f640d-27dc-4b58-bd81-cc71cebac9d8`)
@@ … skills …
-- **api-patterns**
-- **cli-env-baseline**
```

### 4.3 daemon 日志：注入 / 剪切与任务生命周期对齐

```
$ grep -an "idle watchdog\|opencode finished\|starting agent\|lock acquired" daemon.log
13287:11:58:01.504 WRN idle watchdog firing … task=01a11e92 … threshold=10m0s
13303:11:58:04.700 INF opencode finished component=daemon pid=61952 status=aborted duration=1h5m3s
13410:12:02:46.221 DBG agent … text="…`AGENTS.md` 清空发生在 11:58:01——与 watchdog 强停时刻一致…"
14559:12:50:12.730 WRN idle watchdog firing … task=01a11ed5 … threshold=10m0s
14577:12:50:14.072 INF opencode finished component=daemon pid=60684 status=aborted
14631:12:52:09.728 DBG agent … text="…AGENTS.md 又在强停同秒被清空——机械性模式确认…"
39531:11:28:01.991 INF opencode finished component=daemon pid=25564 status=failed duration=13m26s
39535:11:28:02.798 INF task did not complete … status=blocked failure_reason=agent_error.unknown   # ← 非 watchdog
39699:11:32:10.030 INF starting agent … provider=opencode workdir=D:\Projects\playground\thbiomedic
```

### 4.4 provider → 文件名 与 阈值差异

```
$ grep -an "idle_watchdog" daemon.log | head
13308:… provider=codebuddy … idle_watchdog=0s      # codebuddy 无 watchdog，写 CODEBUDDY.md
13504:… provider=opencode  … idle_watchdog=10m0s   # opencode 有 watchdog，写 AGENTS.md
```

### 4.5 就地模式与 gitignore

```
$ git -C /d/Projects/playground/thbiomedic worktree list
D:/Projects/playground/thbiomedic f1be38d [feat/site-v2]     # 仅主工作树 → 就地
$ git -C … config --get core.autocrlf
true
$ grep -n "opencode\|multica\|pi" .gitignore
.opencode/
.multica/
.pi/                       # 注意：AGENTS.md 未被忽略
```

---

## 5. 复现步骤（最小路径）【已证实，可用日志内任务复现】

1. 保证目标是"就地（in_place）local_directory"资源，即 daemon 不会另建工作树：`daemon.log` 出现 `local_directory: lock acquired … local_directory=<仓库路径>` 且 `git worktree list` 只有主工作树。
2. 触发一次 **opencode**（或 pi）任务，`workdir` 指向该仓库。
   - 任务开始时观察 `AGENTS.md`：出现 `<!-- BEGIN MULTICA-RUNTIME --> … <!-- END MULTICA-RUNTIME -->` 整块（注入）。
3. 让该任务结束（正常结束、失败结束、或被 idle watchdog 强停，均可）。
   - 任务结束时再观察 `AGENTS.md`：块被剪切，只剩块前的前缀字节（本例为若干空行）。
4. 若在步骤 2 的运行期间执行过 `git add -A && git commit`，则块被固化进 HEAD；之后每次剪切都会让 `git diff -- AGENTS.md` 呈现大段删除（本例 -193 行）。

> 备注：opencode 任务可被 `kill`/超时强停，剪切 defer 仍在进程回收后执行，故"强停也会剪切"。

---

## 6. 排除项

| 对象 | 结论 | 依据 |
|---|---|---|
| 运行时 CLI（opencode / pi / codebuddy）主动清空 | **排除**【已证实】 | opencode/pi 只**读** `AGENTS.md`；codebuddy 的托管文件是 `CODEBUDDY.md`（`runtime_config.go:209-215`），本仓库 `CODEBUDDY.md` 长期存在未被清空。文件"清空/恢复"时刻与 daemon 的任务开始/结束严格对齐（§4.3）。 |
| 命令行 agent 手工编辑 | **排除** | 现场字节是"整块剪切"而非编辑；时刻与任务生命周期一致。 |
| checkout / reset / reflog 造成 | **排除**【已证实】 | `git reflog` 中 `AGENTS.md` 仅在 `a737ac5`、`f1be38d` 两次提交中被改动；无针对该文件的 reset/checkout。 |
| "multica 平台不会主动清空"（用户判断） | **推翻**（就 daemon 而言）【已证实】 | daemon 的 `CleanupRuntimeConfig` **确实主动剪切**该文件的托管块——但这是"收回自己注入的内容"的设计行为，非破坏用户数据。用户判断在"运行时 CLI 不会清空"上成立，在"multica 平台不会清空"上不成立。 |
| watchdog 强停是**根因** | **推翻**（是伴随现象）【已证实】 | 11:28 那次清空发生在 `agent_error.unknown` 退出上，非 watchdog。 |
| 第三方进程/脚本 | **未发现**【已证实-负向】 | 未在 daemon 之外发现写该文件的进程证据；所有状态变化都能用 daemon 的注入/剪切解释。 |

---

## 7. 修复与预防建议（**均未实施**，供决策）

> 原则：`AGENTS.md` 的"托管块"设计本身是合理的（幂等、可回滚）。问题出在"**被 agent 提交**"与"**就地模式下无遮蔽**"两点。

### 方案 A：把 daemon 托管文件从版本控制中排除（最小改动，推荐）
- **做法**：项目级把 `AGENTS.md`（及 `CLAUDE.md`/`CODEBUDDY.md` 等 provider 托管文件）纳入 `.gitignore`，或在仓库放 `.gitattributes`/`.git/info/exclude` 遮蔽；并在 agent 的作业规范里禁止 `git add -A` 一把梭（改为显式列文件或先 `git status` 核对）。
- **优点**：改动小、立刻止血；不动平台。
- **代价**：需约束所有 agent 的提交习惯；已提交的历史块仍需一次人工 `git rm --cached AGENTS.md` 并提交。
- **注意**：`.git/info/exclude` 在本仓库可用（就地模式、非 linked worktree），但会影响用户自己的 `git status`，需用户同意。

### 方案 B：平台侧——就地模式把托管文件写到被忽略的路径（根治）
- **做法**：对 `local_directory` 就地模式，把简报写到 `.multica/`（已被忽略）或写入 `.agent_context/` 下的文件，而不是仓库根 `AGENTS.md`；或让 daemon 在写入前确保该路径被 `.git/info/exclude` 覆盖。
- **优点**：从源头消除"平台文件进版本库"。
- **代价**：需适配各 provider 的"原生上下文文件名"发现机制（opencode 只认 `AGENTS.md`），改动面较大；需回归测试。

### 方案 C：收紧剪切/写入实现（配合 A/B）
- **做法**：
  1. `locateMarkerBlock` 同时识别 `\r\n`，消除 Windows 下的空行累积（§3.4）；
  2. `writeRuntimeConfigFile` 改为"临时文件 + 原子 rename"，避免 `os.WriteFile` 截断窗口被采样/提交；
  3. 在 block 末尾加入稳定哨兵，使 `git diff` 更易识别"平台块"。
- **优点**：消除次要缺陷与竞态窗口。
- **代价**：平台代码改动 + 测试；单靠它不能让"误提交"消失（仍需 A 或 B）。

**建议组合：A（立即止血）+ C-windows 换行修复（消除漂移）；中期评估 B。**

---

## 8. 未完成项 / 待核实

1. **§3.4 的 CRLF 空行累积**未做闭环复现（仅源码 + 字节推断，标【推测】）。建议用 `runtime_config_test.go` 构造 CRLF 文件做单元复现。
2. **"-193 行"的当日现场**未能在 10-10 上午直接截屏（该时段状态已过）；已用机制 + 当前 `git diff`（`+3`，即"注入态"）与历史 diff 佐证。
3. 未逐一核对 10-08~10-10 **每一次** watchdog 事件，仅核实 3 个代表时刻（11:28 / 11:58 / 12:50）。
4. 历史已提交的 `AGENTS.md` 块尚未清理（属修复动作，本次按要求不做）。

---

## 9. 建议下一步

1. 由人确认 §7 方案取向；若选 A，可另开一张"提交清理 + 规范约束"的任务（`git rm --cached AGENTS.md` + `.gitignore` 增补 + agent 作业规范）。
2. 若采纳平台侧修复（B/C），转入 multica 仓库 `server/internal/daemon/execenv/` 另开改单，附本报告 §3.4 的单元测试用例。
3. 在站点重建的 agent 作业规范（`REDLINES.md`/`PROJECT_STANDARDS.md`）中加入一条红线：**禁止 `git add -A` 提交平台托管文件**，并把 `AGENTS.md` 明确标注为"平台瞬时文件、不可提交"。
