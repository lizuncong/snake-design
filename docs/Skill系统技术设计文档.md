# Snake Design Skill 系统技术文档

## 1. 概述

### 1.1 目标

为 Snake Design 浏览器端 Agent 提供可扩展的 **Skill（技能）加载系统**。采用**渐进式披露（Progressive Disclosure）**策略，参考 [Claude Agent Skills](https://claude.com/blog/skills) 的三层加载架构，让 Agent 按需加载 Skill，在保证能力覆盖的同时最小化 Token 消耗。

### 1.2 核心设计理念

- **渐进式披露（Progressive Disclosure）**：三层加载，按需注入，不把所有内容一次性塞进 prompt
- **Skill 全局共享**：Skill 不属于某个具体项目，所有设计项目共用同一套 Skill
- **双层存储**：内置 Skill（打包在 bundle 中）+ 用户自定义 Skill（IndexedDB 持久化）
- **用户可扩展**：支持创建/编辑/删除自定义 Skill，跨项目生效
- **开箱即用**：预置 `ui-ux-pro-max` 内置 Skill（文件存储 + raw-loader 打包），开箱即可使用

### 1.3 渐进式披露 — 核心架构

这是本系统最关键的设计决策。参考 Claude Agent Skills 的标准，采用**三级渐进加载**：

```
┌─────────────────────────────────────────────────────────────┐
│                     System Prompt 构成                       │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Level 1: 原始 systemPrompt                            │  │
│  │ (main-agent.md: 角色设定、技术栈约束、工具说明)          │  │
│  │ Token 成本: ~2k-5k (固定)                             │  │
│  ├───────────────────────────────────────────────────────┤  │
│  │ Level 1: Skill 元数据索引                              │  │
  │  │ ## Available Skills                                   │  │
  │  │ - ui-ux-pro-max: UI/UX design intelligence for web... │  │
  │  │ - my-custom-skill: User-created skill description...   │  │
  │  │ (内置 Skill + 用户自定义 Skill)                       │  │
  │  │                                                       │  │
  │  │ Token 成本: ~100 × N (N = Skill 数量)                │  │
  │  │ ★ 始终加载 ★                                          │  │
│  └───────────────────────────────────────────────────────┘  │
│                         ▼                                   │
│              LLM 判断哪些 Skill 与当前任务相关                 │
│                         ▼                                   │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Level 2: Skill 完整指令 (通过 load_skill 工具调用)      │  │
│  │ ## Skill: my-skill-1                                  │  │
│  │ {完整 SKILL.md body 内容}                              │  │
│  │                                                       │  │
│  │ Token 成本: <5k / 每个 Skill                          │  │
│  │ ★ LLM 按需调用 ★                                      │  │
│  └───────────────────────────────────────────────────────┘  │
│                         ▼                                   │
│              LLM 需要时读取附属资源                           │
│                         ▼                                   │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Level 3: Skill 附属资源 (通过 read_skill_file 工具)     │  │
│  │ data/colors.csv                                       │  │
│  │ data/styles.csv                                       │  │
│  │                                                       │  │
│  │ Token 成本: 仅读取的文件                                │  │
│  │ ★ 完全按需 ★                                          │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

#### 三级对比

| 层级 | 内容 | Token 成本 | 加载时机 | 触发方式 |
|------|------|-----------|---------|---------|
| **Level 1: 元数据** | `name` + `description` | ~100/skill | **始终** | 自动拼入 system prompt |
| **Level 2: 完整指令** | SKILL.md body 全文 | <5k/skill | LLM 判断相关 | `load_skill` 工具调用 |
| **Level 3: 附属资源** | CSV、脚本、模板等 | 按文件大小 | LLM 需要具体数据时 | `read_skill_file` 工具调用 |

#### 为什么不用全量注入

假设有 5 个 Skill，每个 body 约 10k tokens：

| 方式 | 首轮 Token | 后续每轮 | 问题 |
|------|-----------|---------|------|
| 全量注入 | ~55k (5个全塞) | ~55k | 大量浪费；用户只做 UI 却加载了 code-review |
| 渐进式披露 | ~1k (只有索引) | ~10k (仅加载相关的 1-2 个) | 精准、省 Token、可扩展到几十个 Skill |

### 1.4 与现有架构的关系

```
┌─────────────────────────────────────────────────────────────┐
│                      浏览器 (Client)                          │
│                                                              │
│  ┌──────────────────────┐   ┌─────────────────────────────┐ │
│  │    FileStore          │   │     SkillStore (全局)        │ │
│  │    (每个项目独立)      │   │     (跨项目共享)             │ │
│  │                       │   │                             │ │
│  │  项目 A:              │   │  内置 Skill (import 打包):   │ │
│  │   ├─ App.jsx          │   │   ├─ ui-ux-pro-max          │ │
│  │   ├─ Button.jsx       │   │   └─ ...                    │ │
│  │   └─ index.html       │   │                             │ │
│  │                       │   │  用户自定义 (IndexedDB):     │ │
│  │  项目 B:              │   │   ├─ my-brand-style         │ │
│  │   ├─ Dashboard.jsx    │   │   └─ ...                    │ │
│  │   └─ index.html       │   │                             │ │
│  └──────────────────────┘   └──────────┬──────────────────┘ │
│                                       │                     │
│                              SkillManager 管理               │
│                              (加载/解析/合并)                 │
│                                       ▼                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                    Agent 循环                          │   │
│  │                                                      │   │
│  │  tools: [write_file, read_file, list_files,          │   │
│  │          snip, subagent,                               │   │
│  │          load_skill,           ← 新增: Level 2 加载    │   │
│  │          read_skill_file]      ← 新增: Level 3 加载    │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 1.5 为什么不和 FileStore 混在一起

| 维度 | FileStore | SkillStore |
|------|-----------|------------|
| 作用域 | 单个项目 | 全局共享 |
| 生命周期 | 随项目创建/删除/清空 | 跨项目持久存在 |
| 典型内容 | App.jsx, Button.jsx 等设计产出 | 设计规范、审查规则等知识 |
| 用户操作 | 在文件面板中频繁增删改 | 相对稳定，偶尔调整 |

如果 Skill 存在 FileStore 中：
- 切换项目后 Skill 丢失
- 清空项目时误删 Skill
- 每个项目需要重复配置相同 Skill

---

## 2. 存储架构

### 2.1 双层存储模型

```
                    ┌─────────────────┐
                    │   SkillManager  │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              ▼                             ▼
   ┌──────────────────┐          ┌──────────────────┐
   │   内置 Skill      │          │  用户自定义 Skill  │
   │                  │          │                  │
   │  来源: import    │          │  来源: IndexedDB    │
   │  打包进 bundle   │          │  DB: snake_skills  │
   │                  │          │                  │
   │  特点:           │          │  特点:            │
   │  - 开箱即用      │          │  - 跨会话持久化    │
   │  - 不可被用户删除 │          │  - 用户可自由增删改 │
   │  - 随版本更新    │          │  - 覆盖同名内置 Skill│
   └──────────────────┘          └──────────────────┘
```

### 2.2 内置 Skill（Bundled）

> **本期预置 `ui-ux-pro-max` Skill**，以真实文件存储在 `skills/ui-ux-pro-max/SKILL.md`，通过 raw-loader 在构建时打包进 bundle。

#### 文件结构

内置 Skill 以**独立目录**形式存放在 `src/libs/agent-sdk/skills/` 下，每个 skill 一个目录：

```
src/
└── libs/
    └── agent-sdk/
        └── skills/                          # 内置 Skill 目录
            ├── index.ts                     # 统一导出所有内置 Skill
            └── ui-ux-pro-max/               # 单个 Skill（目录名 = skill name）
                ├── SKILL.md                 # Level 2: 核心指令 (raw-loader 打包)
                ├── data/                    # Level 3: 数据文件（read_skill_file 按需读取）
                │   └── color.json
                └── scripts/                 # Level 3: 脚本文件（read_skill_file 按需读取）
                    └── search.js
```

**目录说明：**
- **SKILL.md** — 唯一的 Level 2 文件，raw-loader 打包进 bundle，作为 Skill 核心指令
- **data/** — Level 3 数据资源（JSON、CSV 等），通过 `read_skill_file("ui-ux-pro-max", "data/color.json")` 读取
- **scripts/** — Level 3 脚本资源（JS 等），通过 `read_skill_file("ui-ux-pro-max", "scripts/search.js")` 读取

**新增内置 Skill 时**：在 `skills/` 下新建 `{skill-name}/SKILL.md`，然后在 `index.ts` 中注册即可。

#### 加载方式：raw-loader

本项目已在 `next.config.ts` 中配置了 `raw-loader` 处理 `.md` 文件。内置 Skill 采用与现有 **prompt 文件完全相同的加载方式**：

```typescript
// 现有模式（prompt 文件）：
// src/app/[locale]/design/prompts/main-agent.ts
import mainAgentPrompt from './main-agent.md';  // raw-loader → 字符串

// 内置 Skill 采用相同模式：
// src/libs/agent-sdk/skills/ui-ux-pro-max/index.ts
import skillContent from './SKILL.md';          // raw-loader → 字符串
```

**构建时**：raw-loader 将 SKILL.md / .js / .json 等资源文件转为字符串常量，打包进 bundle。
**运行时**：直接从内存读取，零网络请求，零 I/O。

> **注意**：需要在 `next.config.ts` 中扩展 raw-loader 规则以支持 `skills/` 目录下的 `.js` 文件：
> ```typescript
> // next.config.ts (需扩展)
> turbopack: {
>   rules: {
>     '*.md': { loaders: ['raw-loader'], as: '*.js' },
>     // 限定 skills/ 目录下的 .js → 字符串，不影响项目其他源码
>     'src/libs/agent-sdk/skills/**/*.js': {
>       loaders: ['raw-loader'],
>       as: '*.js',
>     },
>   },
> },
> ```
>
> **路径范围说明**：glob 模式 `src/libs/agent-sdk/skills/**/*.js` 只匹配内置 Skill 目录下的 `.js` 文件，项目其他源码（components、libs 等）不受影响，正常编译执行。
>
> **用户自定义 Skill 中的 .js**：通过 IndexedDB 存储时本身就是字符串，不存在构建时加载的问题。
>
> `.json` 文件 TypeScript 原生支持 import，无需额外配置。

#### 实现代码

```typescript
// === src/libs/agent-sdk/skills/ui-ux-pro-max/index.ts ===
//
// 通过 raw-loader 导入 SKILL.md 和 Level 3 资源文件，
// 构建时全部打包为字符串常量。
// 运行时无需任何 I/O 操作。

import content from './SKILL.md';
import colorData from './data/color.json';
import searchScript from './scripts/search.js';   // raw-loader 将 JS 文件转为字符串

export const uiUxProMaxSkill = {
  source: 'builtin' as const,
  content: content as unknown as string,   // Level 2: SKILL.md 全文
  files: {
    // Level 3: 所有附属资源（data/ 和 scripts/ 下的文件）
    'data/color.json': JSON.stringify(colorData),
    'scripts/search.js': searchScript as unknown as string,
  } as Record<string, string>,
};
```

```typescript
// === src/libs/agent-sdk/skills/index.ts ===

import { uiUxProMaxSkill } from './ui-ux-pro-max';

/** 所有内置 Skill 的原始内容列表 */
export const BUILTIN_SKILLS = [uiUxProMaxSkill];
```

#### SkillManager 统一管理

SkillManager 用 **Map<string, SkillDefinition>** 维护所有 Skill（内置 + 自定义）：

```typescript
// === src/libs/agent-sdk/skill-manager.ts ===

import { BUILTIN_SKILLS } from './skills';

class SkillManager {
  /** 所有已加载的 Skill（内置 + 自定义合并后的结果） */
  private skills: Map<string, SkillDefinition> = new Map();

  /** 加载所有 Skill：内置（同步 import）+ 自定义（异步 IndexedDB） */
  async loadAll(): Promise<void> {
    this.skills.clear();

    // 1. 加载内置 Skill（同步，从 import 获取）
    for (const raw of BUILTIN_SKILLS) {
      const parsed = this.parseSkillMd(raw.content, raw.files, 'builtin');
      if (parsed) this.skills.set(parsed.name, parsed);
    }

    // 2. 加载用户自定义 Skill（异步，从 IndexedDB）
    const custom = await this.loadCustomSkillsFromIndexedDB();
    for (const [name, skill] of custom) {
      this.skills.set(name, skill);  // 自定义覆盖同名内置
    }
  }

  // ... 其他方法
}
```

#### 为什么这样设计

| 方案 | 问题 |
|------|------|
| TS 字符串常量（content: \`...\`） | SKILL.md 内容混在 TS 代码中，难以编辑和版本管理 |
| 导入 `.trae/skills/.../SKILL.md` | 与项目源码分离，不在版本控制的核心路径 |
| **文件存在 `skills/{name}/SKILL.md` + raw-loader** | ✅ 独立文件便于编辑；构建时打包无运行时开销；与项目 prompt 模式一致 |

#### 新增内置 Skill 步骤

1. 在 `src/libs/agent-sdk/skills/` 下新建目录，如 `my-new-skill/`
2. 创建 `SKILL.md`（含 YAML frontmatter）
3. （可选）添加 `data/` 目录存放附属文件
4. 在 `my-new-skill/` 下创建 `index.ts`，导出 skill 对象
5. 在 `skills/index.ts` 的 `BUILTIN_SKILLS` 数组中注册

### 2.3 用户自定义 Skill（IndexedDB）

用户创建的 Skill 存入 **IndexedDB**，使用 `snake_design` 数据库、`skills` 对象存储：

```typescript
// IndexedDB 配置
const DB_NAME = 'snake_design';
const DB_VERSION = 1;
const STORE_NAME = 'skills';

// 存储结构
interface StoredCustomSkill {
  name: string;           // 主键（IndexedDB keyPath）
  description: string;
  content: string;        // 完整的 SKILL.md 内容（含 frontmatter）
  files?: Record<string, string>;  // 可选：附属文件路径 → 内容映射
  createdAt: number;      // 创建时间戳
  updatedAt: number;      // 更新时间戳
}

// IndexedDB 存储示例
// Database: snake_design
// Object Store: skills (keyPath: "name")
// Records:
//   { name: "my-brand", description: "...", content: "...", ... }
//   { name: "my-code-review", description: "...", content: "...", ... }
```

#### 为什么选 IndexedDB 而非 localStorage

| 维度 | localStorage | IndexedDB |
|------|-------------|-----------|
| **存储容量** | ~5-10 MB | **~50MB+（无硬上限）** |
| **数据结构** | 仅字符串（需 JSON 序列化） | **原生支持对象/二进制** |
| **查询能力** | 无（全量读写） | **按主键/索引精确查询** |
| **异步模型** | 同步（阻塞主线程） | **异步（不阻塞）** |
| **大 Skill 内容** | 容易超限 | **轻松处理** |

对于 Skill 场景，单个 Skill 的 `content` 字段可能达到数 KB 到数十 KB，使用 IndexedDB 更可靠。

### 2.4 合并策略

加载时的优先级：**用户自定义 > 内置**（同名的自定义 Skill 覆盖内置）

```
1. 解析所有内置 Skill → Map<name, ParsedSkill>  (source: 'builtin')
2. 从 IndexedDB 读取自定义 Skill → 逐个解析
3. 同名 Skill：自定义覆盖内置（保留 source 标记区分）
4. 最终合并结果 = 去重后的完整 Skill 列表
```

---

## 3. SKILL.md 格式规范

### 3.1 文件格式

采用 **YAML Frontmatter + Markdown Body** 格式：

```markdown
---
name: ui-ux-pro-max
description: "UI/UX design intelligence for web and mobile..."
---

# UI/UX Pro Max - Design Intelligence

这里是 Skill 的 prompt 内容...

## Rule Categories

详细规则...
```

#### Frontmatter 字段说明

| 字段 | 必填 | 说明 |
|------|------|------|
| `name` | 是 | Skill 唯一标识符（小写字母+连字符），如 `ui-ux-pro-max` |
| `description` | 是 | 一句话描述，用于生成 Skill 索引让 LLM 了解何时使用该 Skill |

#### Body 部分

Markdown 正文即为 **Level 2** 注入内容。可以包含：
- 规则列表
- 设计指南
- 参考模板
- 最佳实践

**建议控制在 5k tokens 以内**。如果内容过长，考虑拆分为多个 focused Skill 或将详细数据移入 Level 3 附属文件。

### 3.2 示例：完整的 ui-ux-pro-max SKILL.md

```markdown
---
name: ui-ux-pro-max
description: "UI/UX design intelligence for web and mobile. Includes 50+ styles, 161 color palettes, 57 font pairings..."
---

# UI/UX Pro Max - Design Intelligence

Comprehensive design guide for web and mobile applications.

## When to Apply

This Skill must be invoked when the task involves UI structure, visual design decisions,
interaction patterns, or user experience quality control.

## Quick Reference

### Accessibility (CRITICAL)
- Minimum 4.5:1 contrast ratio for normal text
- Visible focus rings on interactive elements
- Descriptive alt text for meaningful images

### Style Selection
- Match product type with appropriate visual language
- Use SVG icons, never emoji as icons
- Consistency across all components
```

### 3.3 示例：用户自定义品牌 Skill

```markdown
---
name: my-brand-style
description: "My company brand design guidelines with specific colors and typography"
---

# My Brand Style Guide

## Colors
- Primary: #FF6B35 (Orange) — 用于 CTA 按钮、高亮元素
- Secondary: #004E89 (Dark Blue) — 用于标题、导航栏
- Background: #F8F9FA (Light Gray) — 页面背景
- Text: #212529 (Near Black) — 正文文字

## Typography
- Headings: Bold, uppercase, letter-spacing: 0.05em
- Body: System font stack, 16px base size, line-height: 1.6
- Accent text: Primary color, medium weight

## Layout Rules
- Max content width: 1200px
- Section padding: 80px vertical, 24px horizontal
- Card border-radius: 12px, shadow: 0 4px 12px rgba(0,0,0,0.08)

## Do's and Don'ts
- DO use ample whitespace between sections
- DON'T mix more than 3 colors on a single screen
- DO maintain consistent 8px grid spacing
- DON'T use emoji in professional contexts
```

---

## 4. 核心模块设计

### 4.1 类型定义 (`types.ts`)

```typescript
/** 单个 Skill 的定义（解析后的最终形态） */
export type SkillDefinition = {
  name: string;                    // 来自 frontmatter.name
  description: string;             // 来自 frontmatter.description
  prompt: string;                  // SKILL.md body 部分（Level 2 内容）
  source: 'builtin' | 'custom';   // 来源标记
  files: Record<string, string>;   // Level 3 附属文件 (路径 → 内容)
};

/** 用户自定义 Skill 的存储格式（存入 IndexedDB） */
export type StoredCustomSkill = {
  name: string;
  description: string;
  content: string;                // 完整 SKILL.md 原文（含 frontmatter）
  files?: Record<string, string>; // 可选：附属文件
  createdAt: number;
  updatedAt: number;
};
```

### 4.2 SkillManager (`skill-manager.ts`)

核心管理类，负责加载、管理 Skill，并提供 Level 2/3 的数据访问接口。

#### 类接口

```typescript
export class SkillManager {
  private skills: Map<string, SkillDefinition>;

  constructor();

  /**
   * 加载所有 Skill（内置 + 用户自定义）
   * 应在 agent.run() 每次调用前执行，以同步最新的自定义 Skill
   */
  loadAll(): void;

  /** 解析单个 SKILL.md 原始文本为 SkillDefinition */
  private parseSkillMd(rawContent: string, files?: Record<string, string>): SkillDefinition;

  // ---- 内置 Skill 加载 ----

  /** 从 BUILTIN_SKILLS 导入列表加载 */
  private loadBuiltinSkills(): Map<string, SkillDefinition>;

  // ---- 用户自定义 Skill 管理（IndexedDB）----

  /** 从 IndexedDB 加载用户自定义 Skill */
  private loadCustomSkills(): Promise<Map<string, SkillDefinition>>;

  /** 保存用户自定义 Skill 到 IndexedDB */
  saveCustomSkill(content: string, files?: Record<string, string>): Promise<SkillDefinition>;

  /** 删除用户自定义 Skill */
  deleteCustomSkill(name: string): Promise<boolean>;

  /** 获取所有用户自定义 Skill */
  getCustomSkills(): SkillDefinition[];

  // ---- 数据查询（供工具调用使用）----

  /** 获取所有已加载的 Skill（用于生成 Level 1 索引） */
  getAllSkills(): SkillDefinition[];

  /** 按 name 获取单个 Skill（Level 2: load_skill 工具使用） */
  getSkill(name: string): SkillDefinition | undefined;

  /** 获取 Skill 的附属文件内容（Level 3: read_skill_file 工具使用） */
  getSkillFile(skillName: string, filePath: string): string | undefined;

  /** 列出 Skill 的所有附属文件名（Level 3: 让 LLM 知道有哪些文件可读） */
  listSkillFiles(skillName: string): string[];

  // ---- Prompt 生成（仅 Level 1）----

  /**
   * 生成 Skill 元数据索引文本（Level 1）
   * 始终拼入 system prompt，消耗极少 token
   *
   * 输出示例:
   * ## Available Skills
   * Use the "load_skill" tool to activate a skill when needed.
   * - ui-ux-pro-max: UI/UX design intelligence for web and mobile...
   * - my-brand-style: My company brand design guidelines...
   */
  getSkillIndex(): string;
}
```

#### 核心方法实现逻辑

##### `loadAll()` — 完整加载流程

```
1. this.skills.clear()                        // 清空旧数据
2. builtin = this.loadBuiltinSkills()          // 加载内置 Skill（同步）
3. custom = await this.loadCustomSkills()      // 加载用户自定义 Skill（异步 IndexedDB）
4. 合并: this.skills = { ...builtin, ...custom }  // 自定义覆盖同名内置
5. 返回 void（内部更新 this.skills）
```

##### `parseSkillMd(rawContent, files)` — 解析

```
输入: "---\nname: xxx\ndescription: yyy\n---\n# Body Content..."

1. 正则匹配 /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/
   - 第 1 组: YAML frontmatter 内容
   - 第 2 组: Markdown body（即 Level 2 prompt）
2. 从 YAML 中提取 name:
   - 匹配 /^name:\s*(.+)$/m → 取第一行匹配
3. 从 YAML 中提取 description:
   - 匹配 /^description:\s*["']?(.+?)["']?\s*$/m → 处理带引号和不带引号的情况
4. body 部分 trim() 后作为 prompt
5. 如果解析失败（无 frontmatter 或缺少 name），返回 null
6. 返回 SkillDefinition { name, description, prompt, source, files }
```

**完整实现参考：**

```typescript
private parseSkillMd(
  rawContent: string,
  files?: Record<string, string>,
  source: 'builtin' | 'custom' = 'custom',
): SkillDefinition | null {
  const trimmed = rawContent.trim();
  if (!trimmed) return null;

  // 匹配 YAML frontmatter + body
  const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/;
  const match = trimmed.match(frontmatterRegex);

  if (!match) {
    console.warn('[SkillManager] SKILL.md 缺少 frontmatter，跳过');
    return null;
  }

  const yamlPart = match[1];
  const body = match[2].trim();
  if (!body) {
    console.warn('[SkillManager] SKILL.md body 为空，跳过');
    return null;
  }

  // 提取 name（必填）
  const nameMatch = yamlPart.match(/^name:\s*(.+)$/m);
  if (!nameMatch) {
    console.warn('[SkillManager] SKILL.md 缺少 name 字段，跳过');
    return null;
  }
  const name = nameMatch[1].trim();

  // 提取 description（可选，缺省为空字符串）
  const descMatch = yamlPart.match(/^description:\s*["']?([\s\S]+?)["']?\s*$/m);
  const description = descMatch ? descMatch[1].trim() : '';

  return {
    name,
    description,
    prompt: body,
    source,
    files: files ?? {},
  };
}
```

##### `saveCustomSkill(content, files)` — 创建自定义 Skill

```
输入: 完整的 SKILL.md 文本（含 frontmatter）+ 可选附属文件

1. 调用 parseSkillMd(content, files) 解析 → 如果返回 null 则抛错
2. 构造 StoredCustomSkill 对象（含 createdAt/updatedAt 时间戳）
3. 打开 IndexedDB 事务
4. 按 name 查找：存在则 put（更新 updatedAt），不存在则 add
5. 返回解析后的 SkillDefinition
```

**完整实现参考：**

```typescript
async saveCustomSkill(content: string, files?: Record<string, string>): Promise<SkillDefinition> {
  const parsed = this.parseSkillMd(content, files, 'custom');
  if (!parsed) {
    throw new Error('[SkillManager] SKILL.md 格式无效：缺少 frontmatter 或 name 字段');
  }

  const now = Date.now();
  const db = await this.getDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);

  // 检查是否已存在
  const existing = await store.get(parsed.name);
  const stored: StoredCustomSkill = {
    name: parsed.name,
    description: parsed.description,
    content,
    files,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  store.put(stored);  // put = upsert（存在则更新，不存在则插入）

  return new Promise<SkillDefinition>((resolve, reject) => {
    tx.oncomplete = () => resolve(parsed);
    tx.onerror = () => reject(new Error('IndexedDB 写入失败'));
  });
}

/** 内部方法：获取 IndexedDB 连接（单例模式） */
private dbPromise: IDBDatabase | null = null;

private async getDB(): Promise<IDBDatabase> {
  if (this.dbPromise) return this.dbPromise;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'name' });
      }
    };

    request.onsuccess = () => {
      this.dbPromise = request.result;
      resolve(request.result);
    };

    request.onerror = () => {
      console.error('[SkillManager] IndexedDB 打开失败:', request.error);
      reject(new Error('IndexedDB 不可用'));
    };
  });
}

/** 内部方法：从 IndexedDB 读取所有自定义 Skill */
private async loadCustomSkills(): Promise<Map<string, SkillDefinition>> {
  try {
    const db = await this.getDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();

    return new Promise<Map<string, SkillDefinition>>((resolve) => {
      request.onsuccess = () => {
        const stored = request.result as StoredCustomSkill[];
        const map = new Map<string, SkillDefinition>();
        for (const s of stored) {
          const parsed = this.parseSkillMd(s.content, s.files, 'custom');
          if (parsed) map.set(parsed.name, parsed);
        }
        resolve(map);
      };
      request.onerror = () => {
        console.warn('[SkillManager] IndexedDB 读取失败，使用空列表');
        resolve(new Map());
      };
    });
  } catch (e) {
    console.warn('[SkillManager] IndexedDB 不可用:', e);
    return new Map();
  }
}
```

##### `deleteCustomSkill(name)` — 删除

```typescript
async deleteCustomSkill(name: string): Promise<boolean> {
  const db = await this.getDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  const request = store.delete(name);

  return new Promise<boolean>((resolve) => {
    request.onsuccess = () => resolve(true);
    request.onerror = () => resolve(false);
  });
}
```

##### `getSkillIndex()` — Level 1 索引生成

```typescript
getSkillIndex(): string {
  const skills = this.getAllSkills();
  if (skills.length === 0) return '';

  const lines = skills.map(s => `- ${s.name}: ${s.description}`);
  return [
    '## Available Skills',
    'Use the "load_skill" tool to load a skill\'s full instructions when relevant to the current task.',
    '',
    ...lines,
    '',
  ].join('\n');
}
```

##### `loadAll()` — 异步加载（因 IndexedDB）

```typescript
async loadAll(): Promise<void> {
  this.skills.clear();
  const builtin = this.loadBuiltinSkills();      // 同步：从 import 加载
  const custom = await this.loadCustomSkills();   // 异步：从 IndexedDB 加载
  for (const [name, skill] of builtin) this.skills.set(name, skill);
  for (const [name, skill] of custom) this.skills.set(name, skill);  // 自定义覆盖内置
}
```

##### `getSkillIndex()` — Level 1 索引文本

```
遍历 this.skills，格式:
## Available Skills
Use the "load_skill" tool to activate a skill when its expertise is relevant to the task.
- {name}: {description}

空时返回 ""。
```

##### `getSkill(name)` — Level 2 数据获取

```
从 this.skills Map 中按 name 查找
返回完整 SkillDefinition（包含 prompt 字段）
未找到返回 undefined
```

##### `getSkillFile(skillName, filePath)` — Level 3 数据获取

```
1. 从 this.skills 获取目标 Skill
2. 从 Skill.files[filePath] 获取内容
3. 返回文件内容字符串
未找到返回 undefined
```

##### `listSkillFiles(skillName)` — Level 3 文件列表

```
1. 从 this.skills 获取目标 Skill
2. 返回 Object.keys(Skill.files)
无附属文件时返回空数组 []
```

### 4.3 Skill 工具定义 (`skill-tools.ts`)

新增两个工具工厂函数，实现 Level 2 和 Level 3 的按需加载。采用**工厂函数**模式（而非静态对象），因为工具的 `description` 需要动态包含当前可用的 Skill 列表。

#### 完整文件：`src/libs/agent-sdk/skill-tools.ts`

```typescript
import type { ToolDefinition } from './types';
import type { SkillManager } from './skill-manager';

/**
 * 创建 load_skill 工具（Level 2 加载器）
 *
 * 职责：LLM 判断某个 Skill 与当前任务相关后，调用此工具加载该 Skill
 *       的完整指令内容到上下文中。
 */
export function createLoadSkillTool(skillManager: SkillManager): ToolDefinition {
  return {
    name: 'load_skill',
    description: () => {
      // 每次调用时动态获取最新索引，确保新添加的 Skill 立即可见
      const index = skillManager.getSkillIndex();
      return [
        'Load the full instructions of a specific skill into context.',
        '',
        index,
        '',
        'Use this tool when you determine a skill is relevant to the current task.',
        'After loading, follow the skill\'s guidelines in your response.',
      ].join('\n');
    },
    input_schema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'The exact skill name to load (e.g., "ui-ux-pro-max")',
        },
      },
      required: ['name'],
    },
    async execute({ name }: Record<string, unknown>) {
      const skillName = String(name ?? '');
      if (!skillName) {
        return 'Error: "name" parameter is required.';
      }

      const skill = skillManager.getSkill(skillName);
      if (!skill) {
        const available = skillManager.getAllSkills().map(s => s.name);
        return [
          `Error: Skill "${skillName}" not found.`,
          available.length > 0
            ? `Available skills: ${available.join(', ')}`
            : 'No skills are currently loaded.',
        ].join('\n');
      }

      // 返回完整 prompt 内容（Level 2 注入）
      return `## Skill: ${skill.name}\n\n${skill.prompt}`;
    },
  };
}

/**
 * 创建 read_skill_file 工具（Level 3 资源读取器）
 *
 * 职责：LLM 加载 Skill 后，如果需要具体的参考数据（如配色表、模板等），
 *       调用此工具读取 Skill 的附属文件。
 */
export function createReadSkillFileTool(skillManager: SkillManager): ToolDefinition {
  return {
    name: 'read_skill_file',
    description: `Read an auxiliary file from a loaded skill's data directory.
Use this after calling load_skill when you need reference data such as:
- Color palettes (data/colors.csv)
- Style definitions (data/styles.csv)
- Typography pairings (data/typography.csv)
- Product-specific guidelines (data/products.csv)

The file_path is relative to the skill's root directory.`,
    input_schema: {
      type: 'object',
      properties: {
        skill_name: {
          type: 'string',
          description: 'The name of the skill that owns the file (must match a loaded skill)',
        },
        file_path: {
          type: 'string',
          description: 'Relative path within the skill directory (e.g., "data/colors.csv")',
        },
      },
      required: ['skill_name', 'file_path'],
    },
    async execute({ skill_name, file_path }: Record<string, unknown>) {
      const sName = String(skill_name ?? '');
      const fPath = String(file_path ?? '');

      if (!sName || !fPath) {
        return 'Error: Both "skill_name" and "file_path" parameters are required.';
      }

      // 先检查 Skill 是否存在
      const skill = skillManager.getSkill(sName);
      if (!skill) {
        return `Error: Skill "${sName}" not found. Please load it first with load_skill.`;
      }

      const content = skillManager.getSkillFile(sName, fPath);
      if (!content) {
        const available = skillManager.listSkillFiles(sName);
        return [
          `Error: File "${fPath}" not found in skill "${sName}".`,
          available.length > 0
            ? `Available files: ${available.join(', ')}`
            : 'This skill has no auxiliary files.',
        ].join('\n');
      }

      // 返回文件内容，附带路径信息方便 LLM 定位
      return `[File: ${sName}/${fPath}]\n${content}`;
    },
  };
}
```

#### 关键设计决策

| 决策 | 原因 |
|------|------|
| **工厂函数而非静态对象** | `description` 需要动态包含当前可用 Skill 列表；每次创建 agent 时注入最新的 `skillManager` |
| **description 使用函数类型** | 允许运行时动态生成；LLM 框架在构建 prompt 时会调用该函数获取最新字符串 |
| **load_skill 返回格式化标题** | `## Skill: {name}` 前缀让 LLM 明确知道这是 Skill 内容的边界 |
| **read_skill_file 要求先 load_skill** | 错误提示中引导 LLM 先加载 Skill，形成正确的使用顺序 |
| **参数防御性校验** | 所有输入参数都做空值检查和类型转换，避免 undefined 导致的异常 |

#### 工具描述的动态更新问题

`load_skill` 的 `description` 包含了当前所有 Skill 的列表。由于 LLM 的 system prompt 在对话开始时构建，有两种策略处理动态更新：

**策略 A：每次 runAgent 时重建工具（推荐）**

```typescript
// 在 createAgent 或 runAgent 入口处
const loadSkillTool = createLoadSkillTool(skillManager);
const readSkillFileTool = createReadSkillFileTool(skillManager);

// 每次 agent.run() 调用时，工具的 description 都是最新的
```

优点：用户中途添加了新 Skill，下次对话立即可见。
缺点：每次都要重新创建工具对象（开销极小，可忽略）。

**策略 B：缓存工具对象**

```typescript
// 只在 createAgent 时创建一次
const loadSkillTool = createLoadSkillTool(skillManager);  // 此时捕获的索引是固定的
```

优点：对象复用。
缺点：运行期间新增的 Skill 不会出现在工具描述中（直到刷新页面）。

**本设计采用策略 A**，因为：
1. Skill 数量通常很少（<20 个），重建开销可忽略
2. 用户期望添加 Skill 后立即生效
3. 与 `loadAll()` 每次 run 前调用的设计一致

### 4.4 集成点

#### 4.4.1 Agent 层集成 (`agent.ts`)

**修改策略：最小侵入**。`runAgent()` 函数签名不变，通过 `options` 扩展参数传入 `skillManager`，在函数内部构建增强的 system prompt。

**完整修改后的 `runAgent` 函数关键变化：**

```typescript
// === 新增 import ===
import type { SkillManager } from './skill-manager';

// === options 类型扩展 ===
interface RunAgentOptions {
  maxTokens?: number;
  maxTurns?: number;
  model?: string;
  skillManager?: SkillManager;    // ← 新增
}

// === runAgent 函数内部变化（仅标注新增/修改部分）===

export async function runAgent(
  userInput: string,
  callbacks: AgentCallbacks,
  llmClient: LlmClient,
  systemPrompt: string,            // 原始 systemPrompt（来自 main-agent.md）
  tools: ToolDefinition[],
  existingMessages: LlmMessage[] = [],
  options: RunAgentOptions = {},   // ← 类型扩展
): Promise<LlmMessage[]> {

  // ====== 新增：构建增强 system prompt（Level 1 索引）======
  let enhancedSystemPrompt = systemPrompt;

  if (options.skillManager) {
    // 每次运行前重新加载，确保自定义 Skill 的最新状态
    options.skillManager.loadAll();

    const skillIndex = options.skillManager.getSkillIndex();
    if (skillIndex) {
      // 在原始 prompt 后追加 Level 1 索引（元数据 only）
      enhancedSystemPrompt = systemPrompt.trimEnd() + '\n\n' + skillIndex;
    }
  }

  // ====== 后续逻辑使用 enhancedSystemPrompt 替代 systemPrompt ======

  // ... 原有的消息循环、token 估算、API 调用等逻辑完全不变 ...
  // 唯一的变化: 传给 llmClient.chatStream 的 systemPrompt 参数使用 enhancedSystemPrompt

  apiResp = await llmClient.chatStream(
    messages,
    openAiTools,
    enhancedSystemPrompt,     // ← 这里改用增强版
    { onTextChunk, onReasoningChunk },
    { model: options.model, maxTokens },
  );

  // ... 其余代码不变 ...
}
```

**变更清单（agent.ts）：**

| 变更点 | 类型 | 说明 |
|--------|------|------|
| 新增 `import` | 新增 | `import type { SkillManager } from './skill-manager'` |
| `RunAgentOptions` 接口 | 修改 | 新增可选字段 `skillManager?: SkillManager` |
| `enhancedSystemPrompt` | 新增变量 | 基于原始 prompt + Level 1 索引拼接 |
| `skillManager.loadAll()` | 新增调用 | 在循环开始前执行一次 |
| `llmClient.chatStream` 参数 | 修改 | 使用 `enhancedSystemPrompt` |

**不变更的部分：**
- 消息循环逻辑（turn 管理、工具调度、snip 等）
- Token 估算逻辑
- 错误处理机制
- 工具执行流程（`load_skill` 和 `read_skill_file` 作为普通工具参与调度）

#### 4.4.2 创建入口集成 (`index.ts` / `createAgent()`)

**完整修改后的 `createAgent` 函数：**

```typescript
import type { DesignFile } from './file-store';
import type { AgentCallbacks, AgentConfig, LlmMessage, ToolDefinition } from './types';
import { runAgent } from './agent';
import { FileStore } from './file-store';
import { createLlmClient } from './llm';
import { createSubAgentTool } from './subagent-tool';
import { createTools } from './tools';
// ★ 新增导入
import { SkillManager } from './skill-manager';
import { createLoadSkillTool, createReadSkillFileTool } from './skill-tools';

export type { AgentCallbacks, AgentConfig, LlmMessage, ToolDefinition };
export type { SubAgentDefinition } from './types';
export type { SkillDefinition, StoredCustomSkill } from './types';  // ★ 新增导出
export { type DesignFile, FileStore };

/** AgentInstance 新增 skillManager 属性 */
export type AgentInstance = {
  run: (
    userInput: string,
    callbacks: AgentCallbacks,
    existingMessages?: LlmMessage[],
  ) => Promise<LlmMessage[]>;
  fileStore: FileStore;
  skillManager: SkillManager;  // ★ 新增：暴露给 UI 层用于管理面板操作
};

export function createAgent(config: AgentConfig): AgentInstance {
  if (!config.systemPrompt) {
    throw new Error('[Agent SDK] systemPrompt is required');
  }

  const fileStore = new FileStore();
  const llmClient = createLlmClient(config.apiKey, config.baseUrl);
  const systemPrompt = config.systemPrompt;

  // ★ 新建：SkillManager 实例（与 FileStore 平级，独立管理）
  const skillManager = new SkillManager();

  const coreTools = createTools(fileStore);
  let allTools: ToolDefinition[] = [...coreTools];

  // ---- SubAgent 注册（原有逻辑不变）----
  if (config.subAgents && Object.keys(config.subAgents).length > 0) {
    const subAgentTool = createSubAgentTool(
      llmClient,
      fileStore,
      coreTools,
      config.subAgents,
      config.model,
    );
    allTools = [...allTools, subAgentTool];
  }

  // ★ 新增：注册 Skill 工具（每次 run 时重建以获取最新索引）
  // 注意：这里不缓存工具对象，因为 description 需要动态更新
  // 实际重建发生在 run() 方法内部

  return {
    fileStore,
    skillManager,  // ★ 暴露：UI 层可通过此对象管理 Skill

    async run(userInput, callbacks, existingMessages = []) {
      // ★ 每次 run 前重新加载 Skill（IndexedDB 异步加载最新状态）
      skillManager.loadAll();

      // ★ 动态创建 Skill 工具（确保 description 包含最新列表）
      const loadSkillTool = createLoadSkillTool(skillManager);
      const readSkillFileTool = createReadSkillFileTool(skillManager);

      // ★ 将 Skill 工具加入工具集
      const toolsWithSkills = [...allTools, loadSkillTool, readSkillFileTool];

      return runAgent(
        userInput,
        callbacks,
        llmClient,
        systemPrompt,       // 原始 prompt；runAgent 内部会拼接 Level 1 索引
        toolsWithSkills,
        existingMessages,
        {
          model: config.model,
          maxTokens: config.maxTokens,
          maxTurns: config.maxTurns,
          skillManager,      // ← 传入 SkillManager，runAgent 用它构建增强 prompt
        },
      );
    },
  };
}
```

**关键设计说明：**

1. **为什么 `createLoadSkillTool` 放在 `run()` 内部而非 `createAgent()` 中？**
   - 用户可能在两次对话之间添加了新 Skill（通过 UI 管理面板）
   - 放在 `run()` 中确保每次对话都使用最新的 Skill 列表
   - 开销极小（两个轻量对象的创建）

2. **为什么暴露 `skillManager` 给外部？**
   - UI 层的管理面板需要调用 `saveCustomSkill()`、`deleteCustomSkill()` 等方法
   - 避免再创建一个独立的 SkillManager 实例导致状态不一致

3. **`systemPrompt` 为什么不在 `createAgent` 中直接拼接？**
   - `systemPrompt` 是配置时确定的静态值
   - Level 1 索引是动态的（随 Skill 增删变化）
   - 分离关注点：`createAgent` 管配置，`runAgent` 管运行时拼接
```

---

## 5. System Prompt 结构

集成 Skill 后，发送给 LLM 的 system prompt 结构如下（注意与 v1 全量注入方案的区别）：

```
┌──────────────────────────────────────────────────────────┐
│ [原始 systemPrompt]                                     │  ← main-agent.md 内容
│ （角色设定、技术栈约束、工具说明等）                       │
├──────────────────────────────────────────────────────────┤
│ [Skill Index — Level 1]                                 │  ← getSkillIndex()
│                                                          │
│ ## Available Skills                                      │
│ Use the "load_skill" tool to activate a skill when its   │
│ expertise is relevant to the task.                       │
│                                                          │
│ - ui-ux-pro-max: UI/UX design intelligence for web...   │
│ - code-review: Code review and quality analysis...       │
│ - my-brand-style: My company brand design guidelines...  │
│                                                          │
│ ★ 只有这一部分始终存在于 prompt 中 (~100 tokens/skill)  │
│                                                          │
│ ★ Level 2/3 通过工具调用按需加载，不在 prompt 中          │
└──────────────────────────────────────────────────────────┘
```

**与全量注入方案的对比**：

| | 全量注入 (v1) | 渐进式披露 (v2, 本文档) |
|--|-------------|---------------------|
| Prompt 中始终存在的内容 | 索引 + 所有激活 Skill 的完整 body | **仅索引（Level 1）** |
| Skill 完整内容何时出现 | 第一轮就全部塞进去 | LLM 调用 `load_skill` 后才出现 |
| 5 个 Skill 的首轮 Token | ~55k | ~1k |
| 可扩展性 | >3 个 Skill 就开始臃肿 | 几十个 Skill 也无压力 |
| 复杂度 | 低 | 中（多两个工具） |

---

## 6. 用户交互场景

### 6.1 场景一：使用内置 Skill（开箱即用）

1. 用户打开 Snake Design 页面（任何项目）
2. 系统初始化 `createAgent()` → `new SkillManager()` → `loadAll()`
3. 自动加载内置的 `ui-ux-pro-max` Skill（从 `skills/ui-ux-pro-max/SKILL.md` raw-loader 加载）
4. System prompt 中出现 Level 1 索引：`- ui-ux-pro-max: UI/UX design intelligence...`
5. 用户输入「生成一个登录页面」
6. LLM 在 system prompt 中看到 Skill 索引，判断 `ui-ux-pro-max` 相关
7. LLM 调用 `load_skill({ name: "ui-ux-pro-max" })`
8. 工具返回完整的 Skill 指令（Level 2）：设计工作流、技术栈约束、无障碍规则等
9. LLM 在后续回复中遵循 Skill 中的规则

### 6.2 场景二：添加自定义品牌 Skill

1. 用户进入「Skill 管理面板」（未来 UI 功能）
2. 点击「新建 Skill」，输入内容：

```markdown
---
name: my-brand-style
description: "My company brand design guidelines"
---

# My Brand Style Guide

## Colors
- Primary: #FF6B35
- Secondary: #004E89
...
```

3. 调用 `skillManager.saveCustomSkill(content)`
4. 内容写入 IndexedDB（store: `skills`）
5. 下一次对话时，`loadAll()` 自动加载新的 Skill
6. Level 1 索引中出现 `- my-brand-style: My company brand guidelines...`
7. LLM 可根据任务需要调用 `load_skill` 加载

### 6.3 场景三：跨项目共享验证

```
时间线:
  T1: 用户在「项目 A」中创建了 my-brand Skill
  T2: 切换到「项目 B」（FileStore 完全不同的一组文件）
  T3: 发起对话 → SkillManager.loadAll()
  T4: my-brand Skill 仍然可用（来自 IndexedDB，不依赖 FileStore）
  T5: LLM 在 Level 1 索引中发现它 → 按需加载 → 项目 B 同样遵循品牌规范 ✓
```

### 6.4 场景四：LLM 多 Skill 协作

```
用户输入: "帮我设计一个电商 Dashboard"

  LLM 分析任务:
    ├── 需要设计 UI → load_skill("ui-ux-pro-max")      ← Level 2
    │      └── 需要配色参考 → read_skill_file("ui-ux-pro-max", "data/colors.csv")  ← Level 3 (本期返回"无附件")
    │
    └── 编写代码 ...

  结果: 加载了内置 ui-ux-pro-max Skill
  Token 消耗: 按需加载（而非全量注入）
```

### 6.5 场景五：动态启停 Skill

未来可在设置页面提供 Skill 开关：

```
Skill 管理
━━━━━━━━━━━━━━━━━━━━━━━
[✓] ui-ux-pro-max    UI/UX 设计智能        (内置)
[✓] my-brand-style   我的品牌风格          (自定义)  [编辑] [删除]
[ ] code-review      代码审查              (自定义)  [编辑] [删除]

+ 新建 Skill
```

启停控制的是 Level 1 索引中是否展示该 Skill：
- **启用**：出现在索引中，LLM 可以发现并调用 `load_skill`
- **停用**：不出现在索引中，LLM 不知道它的存在

---

## 7. 数据流图

### 7.1 完整请求流程（渐进式披露）

```
用户输入消息
    │
    ▼
Design Page (React Component)
    │
    ├─→ agent.run(userInput, callbacks, messages)
    │       │
    │       ├─→ skillManager.loadAll()
    │       │       │
    │       │       ├─→ ① 加载内置 Skill (import)
    │       │       │    → parseSkillMd() → Map<name, SkillDef>
    │       │       │
    │       │       ├─→ ② 加载用户自定义 Skill (IndexedDB)
    │       │       │    → JSON.parse → 遍历 → parseSkillMd()
    │       │       │    → Map<name, SkillDef>
    │       │       │
    │       │       └─→ ③ 合并（自定义覆盖同名内置）
    │       │
    │       ├─→ 构建 enhancedSystemPrompt
    │       │       │
    │       │       ├─→ originalPrompt (main-agent.md)
    │       │       └─→ + skillManager.getSkillIndex()   ← 仅 Level 1!
    │       │
    │       ├─→ 更新 load_skill 工具描述（最新 Skill 列表）
    │       │
    │       └─→ runAgent(enhancedSystemPrompt, allTools, ...)
    │               │
    │               └─→ LLM API Call
    │                       │
    │                       ▼
    │               LLM 分析任务，决定是否调用 load_skill
    │                       │
    │              ┌────────┴────────┐
    │              ▼                 ▼
    │        需要 Skill            不需要
    │              │                 │
    │              ▼                 │
    │    load_skill({name})         │
    │              │                 │
    │              ▼                 │
    │    返回完整 prompt (Level 2)   │
    │              │                 │
    │              ▼                 │
    │    LLM 可能继续调用            │
    │    read_skill_file (Level 3)   │
    │              │                 │
    │              ▼                 ▼
    │           继续循环 ─────→ 最终响应
    │
    ▼
返回 assistant message
```

### 7.2 三级加载时序图

```
时间 →

System Prompt (固定):
  ┃ [main-agent.md 内容]
  ┃ [## Available Skills]
  ┃ [- ui-ux-pro-max: ...]        ← Level 1: 始终存在
  ┃ [- code-review: ...]
  ┃ [- my-brand: ...]

Turn 1: LLM 首次响应
  ┃ LLM: "我来帮你设计登录页面..."
  ┃ LLM 决定需要 ui-ux-pro-max
  ┃ 🔧 load_skill("ui-ux-pro-max")
  ┃ ✅ 返回: "## Skill: ui-ux-pro-max\n{完整prompt...}"   ← Level 2 注入

Turn 2: LLM 继续（已拥有 Skill 内容）
  ┃ LLM: "基于设计规范，我先选择配色..."
  ┃ 🔧 read_skill_file("ui-ux-pro-max", "data/colors.csv")
  ┃ ✅ 返回: "color,name,hex\nPrimary,#FF6B35\n..."       ← Level 3 注入

Turn 3: LLM 完成
  ┃ LLM: "好的，我为你生成了登录页面..."
  ┃ 🔧 write_file("App.jsx", ...)
  ┃ ✅ 完成
```

### 7.3 自定义 Skill 生命周期

```
创建:
  用户在 Skill 管理面板输入 SKILL.md 内容 + 可选附件
    ↓
  skillManager.saveCustomSkill(rawContent, files)
    ↓
  parseSkillMd(rawContent, files) → SkillDefinition
    ↓
  构造 StoredCustomSkill 对象
    ↓
  IndexedDB put() 操作（upsert：存在则更新，不存在则插入）
    ↓
  loadAll() 重新合并
    ↓
  下次对话的 Level 1 索引中自动出现

删除:
  skillManager.deleteCustomSkill(name)
    ↓
  IndexedDB delete(name) 操作
    ↓
  下次 loadAll() 时不再出现
```

### 7.4 数据存储关系图

```
┌─────────────────────────────────────────────────────┐
│                   IndexedDB                          │
│                                                      │
│  Database: snake_design                              │
│  Object Store: skills (keyPath: name)               │
│                                                      │
│  Records:                                           │
│      name: "my-brand-style",                        │
│      description: "...",                            │
│      content: "---\nname:...\n---\n#...",           │  ← Level 2 原文
│      files: {                                       │  ← Level 3 附件
│        "palette.json": "{...}",                     │
│        "typography.css": "..."                      │
│      },                                             │
│      createdAt: 1700000000000,                      │
│      updatedAt: 1700000000000                       │
│    },                                               │
│    { ... }                                          │
│  ]                                                  │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│               Bundle (编译时确定)                     │
│                                                      │
│  BUILTIN_SKILLS = [                                  │
│    {                                                │
│      source: 'builtin',                             │
│      content: "---\nname: ui-ux-pro-max\n---\n...", │  ← Level 2 原文
│      files: {                                       │  ← Level 3 附件
│        "data/colors.csv": "...",                    │
│        "data/styles.csv": "..."                     │
│      }                                              │
│    }                                                │
│  ]                                                  │
└─────────────────────────────────────────────────────┘

运行时合并 → SkillManager.skills (Map<string, SkillDefinition>)
```

---

## 8. 边界情况处理

| 场景 | 处理策略 |
|------|---------|
| IndexedDB 不可用（隐私模式等） | `try/catch` 包裹，降级为仅使用内置 Skill |
| IndexedDB 数据异常 | catch 后返回空 Map，从内置重新开始 |
| SKILL.md 格式错误（无 frontmatter） | `parseSkillMd` 返回 null，`console.warn`，跳过该 Skill |
| SKILL.md 为空字符串 | 跳过，不注册 |
| 用户自定义 Skill 与内置同名 | 自定义覆盖内置（`source` 标记为 `'custom'`） |
| Frontmatter 缺少 name 字段 | 跳过，不注册 |
| Frontmatter 缺少 description 字段 | description 设为空字符串，正常注册 |
| `load_skill` 调用了不存在的 name | 工具返回错误提示 + 列出可用 Skill 名字 |
| `read_skill_file` 路径不存在 | 工具返回错误提示 + 列出该 Skill 的可用文件 |
| LLM 从未调用 `load_skill` | 正常行为 — Skill 是可选增强，不影响基础功能 |
| LLM 重复调用同一个 `load_skill` | 正常返回内容（幂等操作）；未来可加缓存优化 |
| 多个标签页同时操作 IndexedDB | IndexedDB 事务保证一致性；每次 `run` 前 `loadAll` 重新加载最新状态 |
| Skill prompt 极长（>50k tokens） | 正常返回，由 token 限制自然约束；可在 `parseSkillMd` 时打印警告 |

---

## 9. 文件变更清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/libs/agent-sdk/types.ts` | 修改 | 新增 `SkillDefinition`（含 `files` 字段）、`StoredCustomSkill` 类型 |
| `src/libs/agent-sdk/skill-manager.ts` | **新建** | `SkillManager` 类（核心模块） |
| `src/libs/agent-sdk/skill-tools.ts` | **新建** | `load_skill` 和 `read_skill_file` 工具定义工厂 |
| `src/libs/agent-sdk/skills/index.ts` | **新建** | 内置 Skill 统一导出 |
| `src/libs/agent-sdk/skills/ui-ux-pro-max/index.ts` | **新建** | 内置 ui-ux-pro-max Skill 定义（raw-loader 导入 SKILL.md） |
| `src/libs/agent-sdk/agent.ts` | 修改 | `runAgent()` 接收 `skillManager`，构建 Level 1 索引 prompt |
| `src/libs/agent-sdk/index.ts` | 修改 | `createAgent()` 创建并暴露 `skillManager`，注册 Skill 工具 |

---

## 10. 未来扩展方向

### 10.1 Skill 依赖声明

允许 Skill 声明依赖其他 Skill：

```yaml
---
name: dashboard-design
description: "Dashboard design specialist"
depends_on:
  - ui-ux-pro-max
  - chart-skill
---
```

`SkillManager` 加载时自动将依赖也加入可用列表。

### 10.2 Skill 版本管理

```yaml
---
name: ui-ux-pro-max
version: "2.0.0"
description: "..."
---
```

支持多版本共存和升级迁移提示。

### 10.3 Skill 共享与导入导出

- **导出**：将自定义 Skill 打包为 JSON 文件下载
- **导入**：从 JSON 文件批量导入 Skill
- **分享**：生成分享链接或代码片段，方便团队间同步 Skill 配置

### 10.4 Skill Marketplace（远期）

从远程仓库拉取社区 Skill 到本地存储，类似 VS Code 插件市场。用户可浏览、安装、评分社区贡献的 Skill。

### 10.5 Skill 加载缓存

当同一轮对话中多次 `load_skill` 同一个 Skill 时，可缓存结果避免重复返回。可在 `agent.ts` 的工具执行层增加内存缓存：

```typescript
const skillCache = new Map<string, string>();

// 在 load_skill execute 中:
if (skillCache.has(name)) return skillCache.get(name)!;
const result = skillManager.getSkill(name)?.prompt ?? '';
skillCache.set(name, result);
return result;
```

### 10.6 自动激活（关键词预匹配）

作为渐进式补充，可根据用户输入的关键词预加载 Skill，减少一轮工具调用：

```yaml
# SKILL.md frontmatter 扩展
---
name: ui-ux-pro-max
trigger_keywords:
  - 设计
  - UI
  - 页面
  - 样式
  - 组件
  - layout
  - button
---
```

匹配时直接将 Level 2 内容拼入 prompt（跳过 `load_skill` 工具调用），不匹配时仍走标准渐进流程。

---

## 11. Token 估算与性能分析

### 11.1 各层级 Token 消耗实测（以 ui-ux-pro-max 为例）

基于当前 `ui-ux-pro-max` Skill 的实际文件大小进行估算：

| 层级 | 内容 | 文件大小 | 估算 Tokens | 说明 |
|------|------|---------|------------|------|
| **Level 1** | 元数据索引 (name + description) | ~200 B | ~50-100 | 仅 frontmatter 的 name + description |
| **Level 2** | SKILL.md 完整 body | ~15 KB / 650 行 | ~4,000-5,000 | 含所有规则分类、Quick Reference 等 |
| **Level 3a** | data/colors.csv | ~8 KB | ~2,000 | 161 组配色方案 |
| **Level 3b** | data/styles.csv | ~5 KB | ~1,200 | 50+ 种设计风格 |
| **Level 3c** | data/typography.csv | ~4 KB | ~1,000 | 57 组字体配对 |
| **Level 3d** | data/stacks/react.csv | ~6 KB | ~1,500 | React 组件库清单 |
| **Level 3e** | 单个 stacks/*.csv (平均) | ~3-8 KB | ~800-2,000 | 各技术栈组件 |

### 11.2 场景化 Token 消耗对比

#### 场景 A：简单 UI 调整（仅改按钮颜色）

```
全量注入方式:
  System Prompt:     ~5k (原始) + ~5k (ui-ux-pro-max body) = ~10k
  每轮重复:          ~10k
  总消耗 (3轮):      ~30k
  浪费:              ~15k (Skill 内容未被充分利用)

渐进式披露:
  System Prompt:     ~5k (原始) + ~0.1k (索引) = ~5.1k    ← Level 1
  Turn 1:            LLM 可能不调用 load_skill (任务太简单)
  或 Turn 1:         +~5k (load_skill ui-ux-pro-max)        ← Level 2 (可选)
  总消耗 (3轮):      ~15-20k
  节省:              ~33%-50%
```

#### 场景 B：完整 Dashboard 设计

```
渐进式披露:
  System Prompt:     ~5.1k                                      ← Level 1
  Turn 1:            +~5k (load_skill ui-ux-pro-max)            ← Level 2
  Turn 2:            +~2k (read_skill_file colors.csv)          ← Level 3
  Turn 2:            +~1.5k (read_skill_file charts.csv)         ← Level 3
  Turn 3:            +~1.5k (read_skill_file stacks/react.csv)   ← Level 3
  累计注入:          ~15k (按需加载，精准覆盖)
  
全量注入 (假设打包全部 Skill):
  System Prompt:     ~5k + ~5k (body) + ~30k (所有 data files) = ~40k
  每轮重复:          ~40k
  总消耗 (5轮):      ~200k
  浪费:              大量数据文件在多轮中重复传递
```

#### 场景 C：多 Skill 协作（未来扩展）

```
假设有 5 个 Skill，每个 body ~5k:

全量注入:
  首轮 System Prompt: ~5k (原始) + ~25k (5个Skill) = ~30k
  每轮重复:           ~30k
  
渐进式披露:
  首轮 System Prompt: ~5k (原始) + ~0.5k (5个索引) = ~5.5k
  通常只加载 1-2 个:   +~5-10k (Level 2)
  按需读取附件:         +~2-5k (Level 3)
  有效节省:            ~50-70% per turn
```

### 11.3 Bundle 体积影响分析

将内置 Skill 打包进 bundle 对前端资源的影响：

| 文件 | 原始大小 | gzip 后估算 | 影响 |
|------|---------|------------|------|
| SKILL.md | ~15 KB | ~4 KB | 必须打包 |
| 核心data 文件 (6个) | ~35 KB | ~10 KB | 推荐打包 |
| stacks 文件 (5个选装) | ~30 KB | ~8 KB | 可选 |
| **合计（推荐配置）** | **~80 KB** | **~22 KB** | 相当于一张小图片 |

**结论：**
- 即使打包完整的 `ui-ux-pro-max`（含核心数据），gzip 后仅约 22KB
- 对于现代 Web 应用来说，这个增量完全可以接受
- Level 3 文件采用按需加载策略后，实际传输的体积更小

### 11.4 运行时性能开销

| 操作 | 耗时 | 频率 | 说明 |
|------|------|------|------|
| `skillManager.loadAll()` | < 20ms | 每次 `agent.run()` | 解析内置 Skill (内存) + IndexedDB 查询 (异步) |
| `parseSkillMd()` | < 1ms | 每个 Skill 一次 | 正则解析，无 IO |
| `getSkillIndex()` | < 1ms | 每次 `agent.run()` | Map 遍历拼接字符串 |
| `IndexedDB` 读写 | < 5ms | 创建/删除 Skill 时 | 异步事务，数据量通常 < 1MB |
| `createLoadSkillTool()` | < 1ms | 每次 `agent.run()` | 创建闭包对象 |

**关键发现：**
- 所有 Skill 相关操作都在毫秒级完成
- IndexedDB 为异步操作，不阻塞主线程
- 对 Agent 循环的性能影响可忽略不计

### 11.5 扩展性极限估算

基于渐进式披露架构，系统可支持的 Skill 数量上限：

| Skill 数量 | Level 1 索引大小 | 最大 Level 2/3 消耗 | 适用场景 |
|-----------|-----------------|---------------------|---------|
| 1-5 个 | ~500 tokens | ~10k tokens | 当前阶段，开箱即用 |
| 6-10 个 | ~1k tokens | ~20k tokens | 丰富功能覆盖 |
| 11-20 个 | ~2k tokens | ~40k tokens | 专业领域深度支持 |
| 21-50 个 | ~5k tokens | ~100k tokens | 企业级知识库（需要分页/搜索） |

**建议：**
- 当 Skill 数量超过 20 个时，考虑对 Level 1 索引做**分组展示**：
  ```
  ## Available Skills
  ### Design & UI
  - ui-ux-pro-max: ...
  - brand-guidelines: ...
  ### Code Quality
  - code-review: ...
  - security-audit: ...
  ```
- 当单个 Skill body 超过 10k tokens 时，考虑拆分为多个 focused Skill

---

## 12. 本期实现范围（MVP）

### 12.1 目标

**让 Skill 系统跑通**：Agent 能发现、加载并使用内置的 `ui-ux-pro-max` Skill（文件存储在 `skills/ui-ux-pro-max/SKILL.md`，raw-loader 打包）。

### 12.2 本期包含

| # | 功能 | 说明 |
|---|------|------|
| 1 | **内置 Skill（ui-ux-pro-max）** | 文件存储在 `skills/ui-ux-pro-max/`，raw-loader 打包 SKILL.md |
| 2 | **SkillManager 核心类** | 解析 SKILL.md frontmatter + body，管理内置/自定义 Skill 合并 |
| 3 | **Level 1 索引** | 自动拼入 system prompt（name + description），包含 ui-ux-pro-max |
| 4 | **load_skill 工具** | LLM 按需加载完整 Skill 指令（Level 2） |
| 5 | **read_skill_file 工具** | 接口预留（本期 files 为空，调用时返回"无附件"提示） |
| 6 | **agent.ts 集成** | runAgent 接收 skillManager，构建 enhancedSystemPrompt |
| 7 | **index.ts 集成** | createAgent 创建 skillManager 并暴露给外部 |
| 8 | **用户自定义 Skill CRUD** | IndexedDB 存储的增删查（UI 面板后续再做） |

### 12.3 本期不包含

| 功能 | 原因 | 后续期次 |
|------|------|---------|
| Level 3 附属文件打包 | data/*.csv 文件较多，本期先验证 Level 1+2 流程 | 下期 |
| 完整版 SKILL.md（更多 Level 3 数据） | 当前 SKILL.md 已包含核心内容，后续可在 `data/` 目录下扩展 | 按需添加 |
| UI 管理面板 | Skill 列表展示、创建/编辑表单 | 下期 |
| Skill 启停控制 | 管理面板功能依赖 | 下期 |
| Skill 导入导出 | 用户需求不明确 | 远期 |

### 12.4 新建文件清单

```
src/libs/agent-sdk/
├── skills/                          # 新建目录
│   ├── index.ts                     # 内置 Skill 统一导出
│   └── ui-ux-pro-max/               # ui-ux-pro-max 目录（raw-loader 导入 SKILL.md）
├── skill-manager.ts                 # 新建：SkillManager 类
└── skill-tools.ts                   # 新建：工具工厂函数
```

### 12.5 修改文件清单

| 文件 | 变更内容 |
|------|---------|
| `types.ts` | 新增 `SkillDefinition`、`StoredCustomSkill` 类型 |
| `agent.ts` | options 扩展 skillManager；构建 enhancedSystemPrompt |
| `index.ts` | 创建 SkillManager 实例；注册 load_skill / read_skill_file 工具；暴露 skillManager |

### 12.6 验证标准

完成实现后，通过以下方式验证 Skill 系统正常工作：

1. **Level 1 索引可见**：发送任意消息，检查 system prompt 中是否包含 `## Available Skills\n- ui-ux-pro-max: ...`
2. **LLM 主动调用 load_skill**：发送 UI 相关任务（如"设计一个登录页面"），LLM 应自动调用 `load_skill({ name: "ui-ux-pro-max" })`
3. **Level 2 内容注入**：load_skill 返回后，LLM 的后续响应应遵循 ui-ux-pro-max 的设计规则（工作流、技术栈约束、无障碍等）
4. **read_skill_file 降级处理**：如果 LLM 调用 read_skill_file，应得到友好的"该 Skill 暂无附件"提示而非报错
5. **无 Skill 时正常工作**：即使停用所有 Skill，Agent 基础功能不受影响
