# 项目代码规范

## 组件设计原则

### 高内聚、低耦合

组件应尽可能独立，遵循**高内聚、低耦合**原则：

- **高内聚**：相关功能应集中在一个组件内部，组件只做一件事。一个组件应该同时包含其所需的 UI 元素、状态管理和交互逻辑，而不是将这些分散到多个父组件中。

- **低耦合**：组件之间依赖应尽可能少。父组件不应中转子组件的状态或回调函数。如无必要，不应在父组件中声明子组件内部需要的状态。

**示例**：API Key 按钮和弹窗应组合在 `ApiKeyModal` 组件中，而非将按钮放在 `TopBar`、弹窗放在 `DesignLayout`，然后通过大量 props 传递状态和方法。

## 组件文件拆分规范

当单个组件文件超过 150 行或包含多个独立职责时，应按以下规范拆分：

### 目录结构

```
ComponentName/
├── types.ts        # 类型定义（Props、State 相关类型）
├── util.ts         # 纯工具方法与常量（无 React 依赖）
├── SubComponent.tsx # 可复用的子组件
└── index.tsx       # 主组件（组合子组件，管理核心状态）
```

### 拆分原则

1. **types.ts**：集中导出所有类型定义，包括 Props 类型、内部数据类型等

2. **util.ts**：提取纯函数和常量，要求：
   - 不依赖 React Hooks 或组件上下文
   - 可独立测试
   - 包括数据处理、格式化、映射表等逻辑

3. **SubComponent.tsx**：提取独立 UI 子组件，要求：
   - 自包含其需要的交互状态（如展开/收起、选中态）
   - 通过 Props 接收数据和回调，不依赖外部闭包变量
   - 单一职责，一个子组件只负责一块 UI 区域

4. **index.tsx**：主组件只保留：
   - 核心状态管理（跨子组件共享的状态）
   - 子组件的组合与布局
   - 数据获取与副作用（useEffect）

### 示例参考

- `FilePanel/`：TreeNodeItem 独立为子组件，工具方法抽离至 util.ts
- `PreviewPanel/`：Toolbar 独立为子组件，Blob URL 管理逻辑抽离至 util.ts

## 样式管理

- 全局样式（如滚动条）统一放在 `src/styles/global.css`，避免在组件中使用 `dangerouslySetInnerHTML` 内联 style 标签。

---

## Agent 环境边界（关键！修改设计 prompt 时必须遵守）

本项目存在 **两个完全不同的 Agent 运行环境**，绝对不能混淆：

### 1. IDE 编码 Agent（即"我"）

| 属性 | 说明 |
|------|------|
| **运行环境** | Trae IDE 本地终端 |
| **工具体系** | Read / Write / Edit / Grep / Glob / RunCommand / SearchCodebase |
| **文件系统** | 本地路径 `/Users/lzc/Documents/学习/snake-design/...` |
| **技术栈** | TypeScript / React / Next.js（真实项目源码） |
| **产出物** | .ts / .tsx 源代码文件 |

### 2. 浏览器设计 Agent（main-agent.md 的读者）

| 属性 | 说明 |
|------|------|
| **运行环境** | 浏览器内（类似 Claude Artifacts） |
| **工具体系** | `load_skill` / `write_file`(浏览器虚拟项目) / `subagent` / `read_skill_file` / `ask_user_question` / `show_to_user` |
| **文件系统** | 浏览器虚拟文件系统（`pages/`, `components/`, `index.html`） |
| **技术栈** | React 18 + Babel Standalone + Tailwind CSS Play CDN v4（浏览器实时编译） |
| **产出物** | .jsx + index.html 设计稿 |
| **Prompt 文件** | `src/app/[locale]/design/prompts/main-agent.md` 和 `visual-reviewer.md` |

### 核心规则

当我在**编辑** `design/prompts/*.md` 文件时：
- 我是在**给浏览器设计 Agent 写说明书**
- 必须站在**浏览器 Agent 的视角**思考：它有什么工具、能做什么、看到什么
- **绝对不能**在 prompt 中出现本地文件路径 `/Users/lzc/...`
- **必须使用**浏览器 Agent 的工具名称：`load_skill("ui-ux-pro-max")`、`subagent("visual-reviewer")`

### 判断速查表

| 看到 → | 属于 → |
|--------|---------|
| `load_skill(...)` | 浏览器 Agent 的工具，不是我的工具 |
| `subagent("visual-reviewer")` | 浏览器 Agent 调用审查子代理 |
| `ask_user_question(...)` | 浏览器 Agent 向用户提问 |
| `write_file` 在 prompt 中 | 指浏览器虚拟项目的写入，非本地 Write 工具 |
| `/Users/lzc/...` 路径 | **我（本地 Agent）的视角，严禁出现在设计 prompt 中** |
| `design/prompts/main-agent.md` | 我编辑它 = 我在配置另一个 Agent |
| `.trae/rules/project_rules.md` | 项目规则，每次对话自动加载给我 |
