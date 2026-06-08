---
name: ui-ux-pro-max
description: "UI/UX design intelligence for web and mobile. Includes 50+ styles, 161 color palettes, 57 font pairings, 161 product types, 99 UX guidelines, and 25 chart types across 10 stacks (React, Next.js, Vue, Svelte, SwiftUI, React Native, Flutter, Tailwind, shadcn/ui, and HTML/CSS). Actions: plan, build, create, design, implement, review, fix, improve, optimize, enhance, refactor, and check UI/UX code. Projects: website, landing page, dashboard, admin panel, e-commerce, SaaS, portfolio, blog, and mobile app. Elements: button, modal, navbar, sidebar, card, table, form, and chart. Styles: glassmorphism, claymorphism, minimalism, brutalism, neumorphism, bento grid, dark mode, responsive, skeuomorphism, and flat design. Topics: color systems, accessibility, animation, layout, typography, font pairing, spacing, interaction states, shadow, and gradient. Integrations: shadcn/ui MCP for component search and examples."
---

# UI/UX Pro Max - Design Intelligence

> **⚡ 加载本 skill 后，第一步必须调用搜索引擎生成设计系统：**
>
> ```javascript
> eval_skill_js('ui-ux-pro-max', 'scripts/search.js',
>   "UIUXSearch.generateDesignSystem('用户的产品描述', '产品名称')")
> ```
>
> 返回的 category / style / colors / typography / anti_patterns / decision_rules 等将作为你后续所有设计决策的数据依据。
>
> **不要跳过这一步。所有设计规则、配色方案、字体配对、反模式清单均通过搜索引擎动态获取，而非本文件内嵌。**

---

## When to Use

This Skill should be used when the task involves **UI structure, visual design decisions, interaction patterns, or user experience quality control**.

### Must Use

- Designing new pages (Landing Page, Dashboard, Admin, SaaS, Mobile App)
- Creating or refactoring UI components (buttons, modals, forms, tables, charts, etc.)
- Choosing color schemes, typography systems, spacing standards, or layout systems
- Reviewing UI code for user experience, accessibility, or visual consistency
- Implementing navigation structures, animations, or responsive behavior
- Making product-level design decisions (style, information hierarchy, brand expression)

### Recommended

- UI looks "not professional enough" but the reason is unclear
- Receiving feedback on usability or experience
- Pre-launch UI quality optimization
- Building design systems or reusable component libraries

### Skip

- Pure backend logic development
- Only involving API or database design
- Performance optimization unrelated to the interface
- Infrastructure or DevOps work
- Non-visual scripts or automation tasks

**Decision criteria**: If the task will change how a feature **looks, feels, moves, or is interacted with**, this Skill should be used.

---

## 搜索引擎使用指南

### 工作原理

调用 `eval_skill_js` 执行 `scripts/search.js`，工具自动注入以下上下文：

| 注入变量 | 类型 | 说明 |
|---------|------|------|
| `_skillFiles` | `string[]` | 该 skill 所有可用文件的路径列表 |
| `_loadFile(path)` | `function` | 按路径读取任意 skill 文件的原始内容 |
| `_loadJson(path)` | `function` | 按路径读取并解析 JSON 文件 |

脚本通过 `_loadJson()` 自行按需加载数据。**每次调用独立执行，无需预先初始化。**

### 一键生成设计系统（最常用）

```javascript
eval_skill_js(
  'ui-ux-pro-max',
  'scripts/search.js',
  "UIUXSearch.generateDesignSystem('健身App 运动追踪', 'FitTrack')"
)
```

返回完整的结构化设计系统 JSON：

```json
{
  "category": "Fitness/Gym App",
  "pattern": { "name": "Hero + Features + CTA" },
  "style": { "name": "Vibrant & Block-based", "effects": [...], "checklist": [...] },
  "colors": {
    "primary": "#2563EB", "accent": "#F97316",
    "bg_primary": "#FFFFFF", "surface": "#F8FAFC",
    "text_primary": "#0F172A", "text_secondary": "#64748B",
    "border": "#E2E8F0", "success": "#22C55E",
    "error": "#EF4444", "warning": "#F59E0B"
  },
  "typography": {
    "heading": "Inter", "body": "Inter",
    "heading_url": "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap",
    "body_url": "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap"
  },
  "key_effects": ["Gradient borders", "Card hover lift", ...],
  "anti_patterns": ["Excessive animation", "Small touch targets", ...],
  "decision_rules": { "color_strategy": "...", "layout": "...", ... }
}
```

### 按域搜索（按需补充）

```javascript
// 单域搜索 - 风格
eval_skill_js('ui-ux-pro-max', 'scripts/search.js',
  "UIUXSearch.search('dark mode dashboard', 'style')")

// 单域搜索 - 配色
eval_skill_js('ui-ux-pro-max', 'scripts/search.js',
  "UIUXSearch.search('SaaS', 'color')")

// 单域搜索 - 字体
eval_skill_js('ui-ux-pro-max', 'scripts/search.js',
  "UIUXSearch.search('科技感 专业', 'typography')")

// 自动检测域（根据关键词自动判断）
eval_skill_js('ui-ux-pro-max', 'scripts/search.js',
  "UIUXSearch.search('柱状图 数据可视化')")
```

### 可用数据文件一览

| 文件路径 | 记录数 | 用途 | 搜索域 |
|---------|--------|------|--------|
| `data/products.json` | 161 | 产品类型库 | `product` |
| `data/styles.json` | 84 | 设计风格库 | `style` |
| `data/colors.json` | 161 | 配色方案库 | `color` |
| `data/typography.json` | 73 | 字体配对库 | `typography` |
| `data/landing.json` | 34 | 落地页模式库 | `landing` |
| `data/ui-reasoning.json` | 161 | UI推理规则库 | 内部使用 |
| `data/charts.json` | 25 | 图表类型推荐 | `chart` |
| `data/ux-guidelines.json` | 99 | UX无障碍准则 | `ux` |
| `data/icons.json` | 105 | 图标库推荐 | `icons` |
| `data/google-fonts.json` | 1923 | Google Fonts 全库 | `googleFonts` |
| `data/design.json` | 1601 | 设计实现细节 | 扩展参考 |
| `data/draft.json` | 1602 | 设计草稿模板 | 扩展参考 |
| `data/react-performance.json` | 44 | React性能优化 | 扩展参考 |
| `data/app-interface.json` | 30 | 原生App准则 | 扩展参考 |
| `data/stacks/html-tailwind.json` | 55 | HTML+Tailwind最佳实践 | 技术栈参考 |
| `data/stacks/react.json` | 53 | React 18最佳实践 | 技术栈参考 |

---

## 设计工作流

### Step 1: 调用搜索引擎获取设计系统

**这是唯一且必须的第一步。** 使用用户的产品描述调用 `generateDesignSystem()`，获得数据驱动的设计决策依据。

### Step 2: 基于搜索结果做 Context Analysis

在内部回答以下问题（结合搜索结果的 category / style / anti_patterns）：

```
1. 产品类型: ___ （来自搜索结果 category）
2. 目标用户与场景: ___
3. 核心情绪（选3个）: ___ （对照搜索结果的 style）
4. 需要特别注意的反模式: ___ （来自搜索结果 anti_patterns）
```

### Step 3: Quality Gate 验证

基于搜索结果的 `decision_rules` 和 `ux-guidelines` 数据，确认以下核心检查项：

```
✅ P0-CRITICAL:
   [ ] 对比度 ≥ 4.5:1（正常文字）/ ≥ 3:1（大文字）— 参考搜索结果的 colors
   [ ] 触摸目标 ≥ 44×44pt — 参考 ux-guidelines 域搜索
   [ ] focus-visible 状态可见
   [ ] 图标按钮有 aria-label
   [ ] 无 emoji 作为功能图标

✅ P1-HIGH:
   [ ] 图片有 width/height 或 aspect-ratio（防 CLS）
   [ ] 非首屏图片 loading="lazy"
   [ ] 移动优先响应式
   [ ] body 字体 ≥ 16px

✅ P2-MEDIUM:
   [ ] 行高 body: 1.5-1.75
   [ ] 动效时长: 150-300ms（微交互）/ ≤400ms（复杂过渡）
   [ ] 动效只使用 transform/opacity
```

如果任何一项未通过，可按域搜索补充信息后调整。

### Step 4: 开始编码

将以下三者作为设计输入：
1. **搜索引擎结果**：category / style / colors / typography / anti_patterns / decision_rules
2. **用户调研答案**：偏好和需求
3. **按需补充的域搜索结果**：如 charts / icons / ux-guidelines 等

所有 CSS token 直接从搜索结果的 `colors` 和 `typography` 字段取值，不要凭空编造。

---

## 规则优先级速查

*以下为规则分类索引，详细内容通过搜索引擎获取。*

| Priority | Category | Domain | 关键检查点 |
|----------|----------|--------|-----------|
| 1 | Accessibility | `ux` | 对比度 4.5:1, Alt text, Keyboard nav, Aria-labels |
| 2 | Touch & Interaction | `ux` | Min 44×44px, 8px+ spacing, Loading feedback |
| 3 | Performance | `ux` | WebP/AVIF, Lazy loading, Reserve space (CLS < 0.1) |
| 4 | Style Selection | `style`, `product` | Match product type, Consistency, SVG icons |
| 5 | Layout & Responsive | `ux` | Mobile-first breakpoints, No horizontal scroll |
| 6 | Typography & Color | `typography`, `color` | Base 16px, Line-height 1.5, Semantic tokens |
| 7 | Animation | `ux` | Duration 150–300ms, Transform only, Motion meaning |
| 8 | Forms & Feedback | `ux` | Visible labels, Error near field, Progressive disclosure |
| 9 | Navigation Patterns | `ux` | Predictable back, Bottom nav ≤5, Deep linking |
| 10 | Charts & Data | `chart` | Legends, Tooltips, Accessible colors |

需要某类规则的详细信息时，使用按域搜索获取。
