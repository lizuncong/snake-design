---
name: ui-ux-pro-max
description: "UI/UX design intelligence for web and mobile. Includes 50+ styles, 161 color palettes, 57 font pairings, 161 product types, 99 UX guidelines, and 25 chart types. Actions: plan, build, create, design, implement, review, fix, improve, optimize, enhance, refactor, and check UI/UX code. Projects: website, landing page, dashboard, admin panel, e-commerce, SaaS, portfolio, blog, and mobile app. Elements: button, modal, navbar, sidebar, card, table, form, and chart. Styles: glassmorphism, claymorphism, minimalism, brutalism, neumorphism, bento grid, dark mode, responsive, skeuomorphism, and flat design. Topics: color systems, accessibility, animation, layout, typography, font pairing, spacing, interaction states, shadow, and gradient."
---

# UI/UX Pro Max - Design Intelligence

Comprehensive design guide for web applications. Contains 50+ styles, 161 color palettes, 57 font pairings, 161 product types with reasoning rules, 99 UX guidelines, and 25 chart types. Searchable database with priority-based recommendations.

## When to Use

当任务涉及 **UI 结构、视觉设计决策、交互模式或用户体验质量管控** 时使用本 Skill。

### Must Use（必须使用）

- 设计新页面（Landing Page、Dashboard、Admin、SaaS、Mobile App）
- 创建或重构 UI 组件（按钮、弹窗、表单、表格、图表等）
- 选择配色方案、排版系统、间距标准或布局系统
- 审查 UI 代码的用户体验、无障碍性或视觉一致性
- 实现导航结构、动画或响应式行为
- 做产品级设计决策（风格、信息层级、品牌表达）

### Recommended（推荐使用）

- UI 看起来"不够专业"但原因不明确时
- 收到可用性或体验反馈后
- 上线前 UI 质量优化
- 构建设计系统或可复用组件库

### Skip（跳过）

- 纯后端逻辑开发
- 仅涉及 API 或数据库设计
- 与界面无关的性能优化
- 基础设施或 DevOps 工作
- 非可视化脚本或自动化任务

**判断标准**：如果任务会改变功能的 **外观、感受、运动方式或交互方式**，就应使用本 Skill。

---

## 搜索引擎

### Query 翻译规则（重要）

**调用 eval_skill_js 前，必须将用户原始输入翻译为英文关键词再传入 `query` 参数。**

原因：所有数据文件的索引字段（Keywords、Product Type 等）均为英文，中文查询无法命中任何结果。
搜索引擎使用 BM25 精确匹配，**用词越接近数据中的原始关键词，匹配越准确。**

示例：
| 用户输入 | 传入 query | 关键词来源 |
|---------|-----------|-----------|
| "做一个健身App" | `"fitness gym app workout tracker"` | products.json Keywords |
| "点餐系统/餐厅" | `"restaurant food menu order booking service"` | Restaurant/Food Service 的 Keywords |
| "外卖配送" | `"delivery food order on-demand courier takeout"` | Food Delivery / On-Demand 的 Keywords |
| "电商网站" | `"e-commerce shopping online store"` | products.json Keywords |
| "暗色仪表盘" | `"dark mode dashboard analytics"` | styles.json + charts.json Keywords |
| "科技感渐变风格" | `"tech futuristic gradient glassmorphism"` | styles.json Style Category |
| "简约博客" | `"minimalism blog content-first clean"` | styles.json Best For |
| "数据可视化图表" | `"data visualization chart trend analytics"` | charts.json Data Type |

**翻译原则（按优先级）：**
1. **优先使用数据中的精确关键词** — 搜索引擎做 BM25 精确匹配，用原始词效果最好
2. **避免过度变形的词** — 用 `order` 而非 `ordering`，用 `analytics` 而非 `analytical`
3. **产品类型名直接用** — 如 `Restaurant/Food Service`、`SaaS`、`E-commerce` 是 Product Type 原始值
4. **多维度组合** — 产品 + 行业 + 风格 + 功能动词
5. **同一需求可尝试不同关键词组合** — 搜不到就换词重试

### 工作原理

调用 `eval_skill_js` 执行 `scripts/search.js`，沙箱自动注入以下上下文：

| 注入变量 | 类型 | 说明 |
|---------|------|------|
| `_skillFiles` | `Record<string,string>` | 该 skill 所有文件的完整内容 Map（路径 → 内容字符串） |
| `_params` | `object` | 结构化调用参数：`query`, `design_system`(bool), `project_name`, `domain`, `max_results` |

脚本直接从 `_skillFiles` 中按需解析所需数据，根据 `_params` 分发到对应方法。**每次调用独立执行，无需预先初始化。**

### 一键生成设计系统（最常用）

```javascript
eval_skill_js(
  'ui-ux-pro-max',
  'scripts/search.js',
  { query: 'fitness gym app workout tracker', design_system: true, project_name: 'FitTrack' }
)
```

返回完整的结构化设计系统 JSON：

```json
{
  "project_name": "FitTrack",
  "category": "Fitness/Gym App",
  "pattern": { "name": "Hero + Features + CTA", "sections": [...] },
  "style": { "name": "Vibrant & Block-based", "type": "...", "effects": [...], "checklist": [...] },
  "colors": {
    "primary": "#2563EB", "secondary": "#F97316", "accent": "#F97316",
    "background": "#F8FAFC", "foreground": "#1E293B",
    "card": "", "muted": "", "border": "#E2E8F0",
    "destructive": "#EF4444"
  },
  "typography": {
    "heading": "Inter", "body": "Inter",
    "google_fonts_url": "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap",
    "css_import": ""
  },
  "key_effects": ["Gradient borders", "Card hover lift"],
  "anti_patterns": ["Excessive animation", "Small touch targets"],
  "decision_rules": { "color_strategy": "...", "layout": "..." },
  "severity": "HIGH"
}
```

### 按域搜索（按需补充）

```javascript
// 单域搜索 - 风格
eval_skill_js('ui-ux-pro-max', 'scripts/search.js',
  { query: 'dark mode dashboard', domain: 'style' })

// 单域搜索 - 配色
eval_skill_js('ui-ux-pro-max', 'scripts/search.js',
  { query: 'SaaS', domain: 'color' })

// 单域搜索 - 字体
eval_skill_js('ui-ux-pro-max', 'scripts/search.js',
  { query: 'tech futuristic professional modern', domain: 'typography' })

// 自动检测域（根据关键词自动判断）
eval_skill_js('ui-ux-pro-max', 'scripts/search.js',
  { query: 'bar chart data visualization analytics' })
```

### 可用数据文件

| 文件路径 | 记录数 | 用途 | 搜索域 |
|---------|--------|------|--------|
| `data/products.json` | 161 | 产品类型库 | `product` |
| `data/styles.json` | 84 | 设计风格库 | `style` |
| `data/colors.json` | 161 | 配色方案库 | `color` |
| `data/typography.json` | 73 | 字体配对库 | `typography` |
| `data/landing.json` | 34 | 落地页模式库 | `landing` |
| `data/ui-reasoning.json` | 161 | UI 推理规则库 | 内部使用 |
| `data/charts.json` | 25 | 图表类型推荐 | `chart` |
| `data/ux-guidelines.json` | 99 | UX 无障碍准则 | `ux` |
| `data/icons.json` | 105 | 图标库推荐 | `icons` |
| `data/google-fonts.json` | 1923 | Google Fonts 全库 | `googleFonts` |
| `data/design.json` | 1601 | 设计实现细节 | 扩展参考 |
| `data/draft.json` | 1602 | 设计草稿模板 | 扩展参考 |
| `data/react-performance.json` | 44 | React 性能优化 | 扩展参考 |

---

## 规则优先级总览

*以下为优先级排序的完整设计规则。详细内容通过搜索引擎的按域搜索获取。*

| Priority | Category | 影响等级 | 搜索域 | 核心检查点 | 反模式（避免） |
|----------|----------|---------|--------|-----------|--------------|
| 1 | Accessibility | CRITICAL | `ux` | 对比度 4.5:1, Alt text, 键盘导航, Aria-labels | 移除 focus ring, 纯图标按钮无标签 |
| 2 | Touch & Interaction | CRITICAL | `ux` | 最小尺寸 44x44px, 8px+ 间距, 加载反馈 | 仅依赖 hover, 瞬态状态变化(0ms) |
| 3 | Performance | HIGH | `ux` | WebP/AVIF, Lazy loading, 预留空间(CLS<0.1) | 布局抖动, 累积布局偏移 |
| 4 | Style Selection | HIGH | `style`, `product` | 匹配产品类型, 一致性, SVG 图标(不用 emoji) | 随意混搭扁平与拟物, emoji 作图标 |
| 5 | Layout & Responsive | HIGH | `ux` | 移动端优先断点, Viewport meta, 无横向滚动 | 横向滚动, 固定 px 宽度容器, 禁止缩放 |
| 6 | Typography & Color | MEDIUM | `typography`, `color` | 基础字号 16px, 行高 1.5, 语义色彩 token | 正文 <12px, 灰色配灰色, 组件中直接写 hex |
| 7 | Animation | MEDIUM | `ux` | 时长 150-300ms, 动效传达意义, 空间连续性 | 纯装饰动画, 动画 width/height, 无 reduced-motion |
| 8 | Forms & Feedback | MEDIUM | `ux` | 可见 label, 字段旁报错, 辅助文本, 渐进式披露 | 仅 placeholder 当 label, 报错只在顶部, 信息过载 |
| 9 | Navigation Patterns | HIGH | `ux` | 可预测返回, 底部导航 ≤5 项, 深度链接 | 导航过载, 返回行为异常, 无深度链接 |
| 10 | Charts & Data | LOW | `chart` | 图例, 提示框, 无障碍配色 | 仅靠颜色传达含义 |

---

## Quick Reference — 详细设计规则

### 1. Accessibility（无障碍）— CRITICAL

- `color-contrast` - 正常文字最低 4.5:1 对比度，大文字 3:1
- `focus-states` - 交互元素可见 focus ring（2–4px）
- `alt-text` - 有意义的图片必须提供描述性 alt 文本
- `aria-labels` - 纯图标按钮必须有 aria-label
- `keyboard-nav` - Tab 顺序匹配视觉顺序，完整键盘支持
- `form-labels` - 使用 `<label for>` 关联
- `skip-links` - 为键盘用户提供跳转到主内容的链接
- `heading-hierarchy` - h1→h6 连续递进，不可跳跃
- `color-not-only` - 不仅靠颜色传达信息，需配合图标或文字
- `dynamic-type` - 支持系统文字缩放；文字增长时避免截断
- `reduced-motion` - 尊重 `prefers-reduced-motion`，请求时减少/禁用动画
- `escape-routes` - 在 modal 和多步骤流程中提供取消/返回
- `keyboard-shortcuts` - 保留系统和 a11y 快捷键；为拖拽提供键盘替代方案

### 2. Touch & Interaction（触控与交互）— CRITICAL

- `touch-target-size` - 最小 44×44pt，必要时扩展点击区域超出视觉边界
- `touch-spacing` - 触摸目标之间最少 8px 间距
- `hover-vs-tap` - 使用 click/tap 作为主要交互，不单独依赖 hover
- `loading-buttons` - 异步操作期间禁用按钮并显示 spinner 或进度
- `error-feedback` - 在问题附近显示清晰的错误信息
- `cursor-pointer` - 可点击元素添加 cursor-pointer
- `tap-delay` - 使用 touch-action: manipulation 减少 300ms 延迟
- `press-feedback` - 按压时有视觉反馈（scale/highlight/opacity）
- `gesture-alternative` - 不依赖纯手势交互，关键操作始终提供可见控件
- `safe-area-awareness` - 主触摸目标远离屏幕边缘，移动端注意 safe-area-inset
- `no-precision-required` - 避免要求在小图标或细边上精确点击
- `swipe-clarity` - 滑动手势必须展示清晰的提示（箭头、标签、教程）
- `drag-threshold` - 开始拖拽前使用移动阈值防止误触

### 3. Performance（性能）— HIGH

- `image-optimization` - 使用 WebP/AVIF，响应式图片（srcset/sizes），懒加载非关键资源
- `image-dimension` - 声明 width/height 或 aspect-ratio 防止布局偏移（CLS）
- `font-loading` - font-display: swap/optional 避免不可见文字（FOIT）；预留空间减少偏移
- `font-preload` - 只预加载关键字体；避免对每个变体滥用 preload
- `critical-css` - 优先处理首屏 CSS（内联关键 CSS 或提前加载样式表）
- `lazy-loading` - 通过动态导入 / 路由级拆分懒加载非首屏组件
- `bundle-splitting` - 按路由/功能拆分代码以减少初始加载和 TTI
- `third-party-scripts` - 异步/延迟加载第三方脚本；审计并移除不必要的
- `reduce-reflows` - 避免频繁的 DOM 读/写；批量读取后写入
- `content-jumping` - 为异步内容预留空间避免布局跳动
- `lazy-load-below-fold` - 首屏以下的图片和重量级媒体使用 loading="lazy"
- `virtualize-lists` - 50+ 条目的列表使用虚拟化提升内存效率和滚动性能
- `main-thread-budget` - 每帧工作保持在 ~16ms 以内实现 60fps；重型任务移出主线程
- `progressive-loading` - >1s 操作使用骨架屏/微光替代长时间阻塞 spinner
- `input-latency` - 点击/滚动响应延迟保持在 ~100ms 以内
- `debounce-throttle` - 高频事件（scroll/resize/input）使用 debounce/throttle
- `offline-support` - 提供离线状态消息和基本降级
- `network-fallback` - 为慢网络提供降级模式（低分辨率图片、更少动画）

### 4. Style Selection（风格选择）— HIGH

- `style-match` - 风格匹配产品类型（使用 design_system 获取推荐）
- `consistency` - 全站风格一致，不混用
- `no-emoji-icons` - 使用 SVG 图标（Heroicons/Lucide），禁止 emoji
- `color-palette-from-product` - 从产品/行业属性选择配色（搜索 color 域）
- `effects-match-style` - 阴影/模糊/圆角与选定风格一致（glass/flat/clay 等）
- `state-clarity` - hover/pressed/disabled 状态在保持风格的同时视觉上可区分
- `elevation-consistent` - 卡片/sheet/modal 使用一致的阴影/elevation scale，避免随机值
- `dark-mode-pairing` - 暗色模式成对设计，保持品牌、对比度和风格一致
- `icon-style-consistent` - 全站使用同一图标集/视觉语言（stroke width、圆角半径）
- `system-controls` - 优先使用原生/系统控件，仅在品牌需要时自定义
- `blur-purpose` - blur 用于表示背景可关闭（modal/sheet），非装饰用途
- `primary-action` - 每屏只有一个主要 CTA，次要操作在视觉上从属

### 5. Layout & Responsive（布局与响应式）— HIGH

- `viewport-meta` - width=device-width initial-scale=1（永不禁缩放）
- `mobile-first` - 移动端优先设计，再扩展到平板和桌面
- `breakpoint-consistency` - 使用系统性断点（如 375 / 768 / 1024 / 1440）
- `readable-font-size` - 移动端正文最小 16px（避免 iOS 自动缩放）
- `line-length-control` - 移动端每行 35-60 字符，桌面 60-75 字符
- `horizontal-scroll` - 禁止移动端横向滚动
- `spacing-scale` - 使用 4pt 递增的间距系统
- `container-width` - 桌面端一致的 max-width（max-w-6xl / max-w-7xl）
- `z-index-management` - 定义分层 z-index scale（0 / 10 / 20 / 40 / 100 / 1000）
- `fixed-element-offset` - 固定 navbar/bottom bar 必须预留安全内边距
- `scroll-behavior` - 避免干扰主滚动体验的嵌套滚动区域
- `viewport-units` - 移动端优先使用 min-h-dvh 而非 100vh
- `orientation-support` - 横屏模式下保持布局可读可操作
- `content-priority` - 移动端核心内容优先显示，折叠或隐藏次要内容
- `visual-hierarchy` - 通过大小、间距、对比建立层级——不仅靠颜色

### 6. Typography & Color（排版与色彩）— MEDIUM

- `line-height` - 正文行高 1.5-1.75
- `line-length` - 每行限制 65-75 字符
- `font-pairing` - 标题/正文字体气质匹配
- `font-scale` - 一致的字阶（如 12 / 14 / 16 / 18 / 24 / 32 / 40 / 48）
- `contrast-readability` - 浅色背景上使用深色文字（如 slate-900 on white）
- `weight-hierarchy` - 用字重强化层级：标题 Bold(600-700)，正文 Regular(400)，标签 Medium(500)
- `color-semantic` - 定义语义色彩 token（primary/secondary/error/surface/on-surface），不在组件中直接写 hex
- `color-dark-mode` - 暗色模式使用去饱和/浅色调变体，非简单反色；单独测试对比度
- `color-accessible-pairs` - 前景/背景配对必须满足 4.5:1 (AA) 或 7:1 (AAA)
- `truncation-strategy` - 优先折行，截断时用省略号并提供 tooltip/展开
- `number-tabular` - 数据列、价格、计时器使用等宽数字防止布局抖动
- `whitespace-balance` - 有意识地使用留白分组相关项，避免视觉杂乱

### 7. Animation（动画）— MEDIUM

- `duration-timing` - 微交互 150-300ms；复杂过渡 ≤400ms；避免 >500ms
- `transform-performance` - 仅使用 transform/opacity，避免动画 width/height/top/left
- `loading-states` - 加载超 300ms 显示 skeleton 或进度指示器
- `excessive-motion` - 每个视图最多动画 1-2 个关键元素
- `easing` - 进入用 ease-out，退出用 ease-in；UI 过渡避免 linear
- `motion-meaning` - 每个动画必须表达因果关系，非纯装饰
- `state-transition` - 状态变化（hover/active/expanded/collapsed/modal）平滑过渡，不突变
- `continuity` - 页面/屏幕转场保持空间连续性（共享元素、方向滑动）
- `spring-physics` - 优先使用 spring/物理曲线而非 linear 或 cubic-bezier 获得自然感
- `exit-faster-than-enter` - 退出动画比进入短（~60-70% 进入时长）以感觉灵敏
- `stagger-sequence` - 列表/网格交错入场每项 30-50ms，避免同时出现或过慢
- `interruptible` - 动画必须可中断；用户操作立即取消进行中动画
- `no-blocking-animation` - 动画期间永不阻塞用户输入；UI 保持可交互
- `scale-feedback` - 可点击卡片/按钮按压时微妙缩放 (0.95-1.05)，释放时恢复
- `navigation-direction` - 导航方向一致性：前进左/上，后退右/下
- `layout-shift-avoid` - 动画不得引起布局回流或 CLS；位置变化使用 transform

### 8. Forms & Feedback（表单与反馈）— MEDIUM

- `input-labels` - 每个输入有可见 label（非仅 placeholder）
- `error-placement` - 报错显示在对应字段下方
- `submit-feedback` - 提交后显示 loading → success/error 状态
- `required-indicators` - 必填字段标记（星号等）
- `empty-states` - 有帮助信息和行动指引
- `toast-dismiss` - Toast 自动消失 3-5s
- `confirmation-dialogs` - 破坏性操作前确认
- `input-helper-text` - 复杂输入下方提供持久辅助文本
- `disabled-states` - disabled 降低 opacity(0.38-0.5) + cursor 变化 + 语义属性
- `progressive-disclosure` - 逐步展示复杂选项，不要一开始就信息过载
- `inline-validation` - 失焦验证（非逐字），用户输入完再报错
- `input-type-keyboard` - 语义 input type（email/tel/number）触发正确键盘
- `password-toggle` - 密码字段提供 show/hide 切换
- `autofill-support` - 支持 autocomplete/autofill
- `undo-support` - 允许撤销破坏性/批量操作
- `success-feedback` - 完成操作后提供简短视觉反馈（勾选、toast、颜色闪烁）
- `error-recovery` - 错误消息必须包含清晰的恢复路径（重试、编辑、帮助链接）
- `multi-step-progress` - 多步骤流程显示进度指示器和返回能力
- `error-clarity` - 错误消息必须说明原因 + 如何解决（不仅是"输入无效"）
- `focus-management` - 提交出错后自动聚焦第一个无效字段
- `destructive-emphasis` - 破坏性操作使用语义危险色（红色）且在视觉上与主要操作分离
- `toast-accessibility` - Toast 不得抢夺焦点；使用 aria-live="polite" 向屏幕阅读器公告

### 9. Navigation Patterns（导航模式）— HIGH

- `bottom-nav-limit` - 底部导航最多 5 项，图标+文字标签
- `drawer-usage` - Drawer/sidebar 用于二级导航，非主要操作
- `back-behavior` - 返回行为可预测且一致，保留滚动/状态
- `deep-linking` - 所有关键页面支持深度链接
- `nav-label-icon` - 导航项必须有图标+文字，纯图标导航损害可发现性
- `nav-state-active` - 当前位置必须在导航中视觉高亮（颜色、字重、指示器）
- `nav-hierarchy` - 主导航（tabs/bottom bar） vs 二级导航（drawer/settings）必须清晰分离
- `modal-escape` - Modal/sheet 必须提供明确的关闭/退出方式；移动端支持下滑关闭
- `breadcrumb-web` - Web：3 层以上层级使用面包屑辅助定位
- `state-preservation` - 返回导航必须恢复之前的滚动位置、筛选状态和输入
- `overflow-menu` - 操作超出可用空间时使用 overflow/more menu，不要硬塞
- `bottom-nav-top-level` - 底部导航仅用于顶级页面，内部不嵌套子导航
- `adaptive-navigation` - 大屏（≥1024px）偏好侧边栏；小屏使用底部/顶部导航
- `back-stack-integrity` - 不静默重置导航栈或意外跳转首页
- `navigation-consistency` - 导航位置在所有页面保持一致，不因页面类型改变
- `avoid-mixed-patterns` - 不要在同一层级混合 Tab + Sidebar + Bottom Nav
- `persistent-nav` - 核心导航从深层页面必须可达，不在子流程中完全隐藏
- `destructive-nav-separation` - 危险操作（删除账号、登出）必须在视觉和空间上与正常导航项分离

### 10. Charts & Data（图表与数据）— LOW

- `chart-type` - 图表类型匹配数据类型：趋势→线图，比较→柱状图，比例→饼/环形图
- `color-guidance` - 使用无障碍配色；色盲用户避免仅红/绿配对
- `data-table` - 提供表格替代方案以保证无障碍；图表本身对屏幕阅读器不友好
- `pattern-texture` - 用图案/纹理/形状补充颜色，使数据在不依赖颜色时可区分
- `legend-visible` - 始终显示图例；位置靠近图表，不要放在需要滚动才能看到的地方
- `tooltip-on-interact` - 交互时提供 tooltip/数据标签显示精确值
- `axis-labels` - 坐标轴标注单位和可读刻度；移动端避免截断或旋转标签
- `responsive-chart` - 图表必须在小屏上重排或简化（如水平柱代替垂直柱）
- `empty-data-state` - 无数据时显示有意义的空状态（"暂无数据"+ 引导），不是空白图表
- `loading-chart` - 图表数据加载中使用 skeleton 或微光占位，不要显示空坐标轴
- `animation-optional` - 图表入场动画必须尊重 prefers-reduced-motion；数据立即可读
- `large-dataset` - 1000+ 数据点时聚合或抽样；提供下钻查看详情
- `number-formatting` - 坐标轴和标签上的数字/日期/货币使用本地化格式
- `touch-target-chart` - 可交互图表元素（点/段）必须有 ≥44pt 点击区域或在触摸时扩展
- `no-pie-overuse` - 饼/环形图避免 >5 分类；改用柱状图更清晰
- `contrast-data` - 数据线/柱 vs 背景 ≥3:1；数据文字标签 ≥4.5:1
- `legend-interactive` - 图例应可点击切换系列可见性
- `direct-labeling` - 小数据集直接在图表上标注值以减少视线移动
- `gridline-subtle` - 网格线应为低对比度（如 gray-200），不与数据竞争
- `focusable-elements` - 可交互图表元素（点/柱/扇区）必须可键盘导航
- `screen-reader-summary` - 为屏幕阅读者提供文本摘要或 aria-label 描述图表关键洞察
- `error-state-chart` - 数据加载失败必须显示错误消息+重试操作，不是破碎/空图表
- `trend-emphasis` - 强调数据趋势而非装饰；避免遮挡数据的重度渐变/阴影

---

## How to Use

### 场景 → 起始步骤映射

| 场景 | 触发示例 | 从哪开始 |
|------|---------|---------|
| **新项目/页面** | "Build a landing page"、"Build a dashboard" | Step 1 → Step 2（设计系统） |
| **新组件** | "Create a pricing card"、"Add a modal" | Step 3（域搜索：style, ux） |
| **选择风格/配色/字体** | "What style fits a fintech app?"、"Recommend palette" | Step 2（设计系统） |
| **审查现有 UI** | "Review this page for UX issues"、"Check accessibility" | 上方 Quick Reference checklist |
| **修复 UI bug** | "Button hover is broken"、"Layout shifts on load" | Quick Reference → 相关章节 |
| **改进/优化** | "Make this faster"、"Improve mobile experience" | Step 3（域搜索：ux） |
| **实现暗色模式** | "Add dark mode support" | Step 3（domain: style "dark mode"） |
| **添加图表/数据可视化** | "Add an analytics dashboard chart" | Step 3（domain: chart） |

### Step 1: 分析用户需求

从用户请求中提取关键信息：
- **产品类型**：娱乐（社交、视频、音乐、游戏）、工具（扫描器、编辑器、转换器）、生产力（任务管理、笔记、日历）或混合型
- **目标受众**：C 端消费者用户；考虑年龄段、使用场景（通勤、休闲、工作）
- **风格关键词**：playful、vibrant、minimal、dark mode、content-first、immersive 等
- **技术栈**：浏览器环境（React 18 + Babel Standalone + Tailwind CSS v4）

### Step 2: 生成设计系统（必须）

**始终以 `design_system: true` 开始**获取综合推荐及推理依据：

```javascript
eval_skill_js('ui-ux-pro-max', 'scripts/search.js', {
  query: 'beauty spa wellness service relaxation',
  design_system: true,
  project_name: 'Serenity Spa'
})
```

此命令：
1. 并行搜索多域（product、style、color、landing、typography）
2. 应用 ui-reasoning 数据中的推理规则选择最佳匹配
3. 返回完整设计系统：pattern、style、colors、typography、effects
4. 包含必须避免的反模式

### Step 3: 按需补充详细搜索

获得设计系统后，使用域搜索获取更多细节：

```javascript
// 需要更多风格选项
eval_skill_js('ui-ux-pro-max', 'scripts/search.js',
  { query: 'glassmorphism dark', domain: 'style' })

// 需要配色方案
eval_skill_js('ui-ux-pro-max', 'scripts/search.js',
  { query: 'entertainment vibrant', domain: 'color' })

// 需要字体配对
eval_skill_js('ui-ux-pro-max', 'scripts/search.js',
  { query: 'playful modern', domain: 'typography' })

// 需要图表推荐
eval_skill_js('ui-ux-pro-max', 'scripts/search.js',
  { query: 'real-time dashboard', domain: 'chart' })

// 需要 UX 最佳实践
eval_skill_js('ui-ux-pro-max', 'scripts/search.js',
  { query: 'animation accessibility', domain: 'ux' })

// 需要 Google Fonts
eval_skill_js('ui-ux-pro-max', 'scripts/search.js',
  { query: 'sans serif popular variable', domain: 'googleFonts' })

// 需要落地页结构
eval_skill_js('ui-ux-pro-max', 'scripts/search.js',
  { query: 'hero social-proof', domain: 'landing' })

// 需要图标推荐
eval_skill_js('ui-ux-pro-max', 'scripts/search.js',
  { query: 'linear icons', domain: 'icons' })
```

### 可用搜索域速查

| 域 | 用途 | 示例关键词 |
|----|------|-----------|
| `product` | 产品类型推荐 | SaaS, e-commerce, portfolio, healthcare, beauty, service |
| `style` | UI 风格、色彩、特效 | glassmorphism, minimalism, dark mode, brutalism |
| `typography` | 字体配对、Google Fonts | elegant, playful, professional, modern |
| `color` | 按产品类型的配色方案 | saas, ecommerce, healthcare, beauty, fintech |
| `landing` | 页面结构、CTA 策略 | hero, hero-centric, testimonial, pricing, social-proof |
| `chart` | 图表类型、库推荐 | trend, comparison, timeline, funnel, pie |
| `ux` | 最佳实践、反模式 | animation, accessibility, z-index, loading |
| `google-fonts` | 单个 Google Fonts 查询 | sans serif, monospace, japanese, variable font, popular |
| `icons` | 图标库推荐 | lucide, heroicons, linear, outline |

---

## Query Strategy — 搜索技巧

### 关键词策略

- 使用**多维关键词**——组合产品 + 行业 + 风格 + 密度：`"entertainment social vibrant content-dense"` 而非只是 `"app"`
- 同一需求尝试不同关键词：`"playful neon"` → `"vibrant dark"` → `"content-first minimal"`
- 始终先用 `design_system: true` 获取完整推荐，再用 `domain` 深入不确定的维度

### 常见问题排查

| 问题 | 解决方案 |
|------|---------|
| 无法决定风格/配色 | 用不同关键词重新运行 `design_system: true` |
| 暗色模式对比度问题 | Quick Reference §6: `color-dark-mode` + `color-accessible-pairs` |
| 动画感觉不自然 | Quick Reference §7: `spring-physics` + `easing` + `exit-faster-than-enter` |
| 表单 UX 差 | Quick Reference §8: `inline-validation` + `error-clarity` + `focus-management` |
| 导航混乱 | Quick Reference §9: `nav-hierarchy` + `bottom-nav-limit` + `back-behavior` |
| 小屏布局崩坏 | Quick Reference §5: `mobile-first` + `breakpoint-consistency` |
| 性能/卡顿 | Quick Reference §3: `virtualize-lists` + `main-thread-budget` + `debounce-throttle` |

### 交付前 Checklist

- 按 `domain: ux` 搜索 `"animation accessibility z-index loading"` 做 UX 验证
- 通读 Quick Reference **§1–§3**（CRITICAL + HIGH）做最终审查
- 在 375px（小屏手机）和横屏模式下验证
- 验证 **reduced-motion** 启用时的行为
- 独立测试暗色模式对比度（不要假设亮模式的值适用）
- 确认所有触摸目标 ≥44pt 且内容不被安全区域遮挡

---

## Common Rules for Professional UI

以下是经常被忽视但会让 UI 显得不专业的问题：

### Icons & Visual Elements

| Rule | Standard | Avoid | Why It Matters |
|------|----------|-------|----------------|
| **No Emoji as Structural Icons** | 使用矢量图标（Lucide、Heroicons）。 | 用 emoji（🎨 🚀 ⚙️）做导航、设置或系统控件 | Emoji 依赖字体、跨平台不一致、无法通过 design token 控制 |
| **Vector-Only Assets** | 使用 SVG 或平台矢量图标，干净缩放并支持主题化。 | 光栅 PNG 图标模糊或像素化 | 保证可缩放性、清晰渲染、暗/亮模式适配 |
| **Stable Interaction States** | 使用 color/opacity/elevation 过渡表达 press 状态，不改变布局边界 | 布局偏移的 transform 导致周围内容移动或抖动 | 防止不稳定交互，保持移动端流畅运动和感知质量 |
| **Correct Brand Logos** | 使用官方品牌资产并遵循其使用规范（间距、颜色、留白） | 猜测 logo 路径、非官方重着色、修改比例 | 防止品牌误用，确保法律/平台合规 |
| **Consistent Icon Sizing** | 将图标尺寸定义为 design token（icon-sm, icon-md = 24pt, icon-lg） | 随机混合 20pt / 24pt / 28pt 等任意值 | 维持节奏感和跨界面视觉层级 |
| **Stroke Consistency** | 在同一视觉层使用一致的 stroke width（如 1.5px 或 2px） | 任意混合粗细 stroke 风格 | 不一致的 stroke 降低感知精致度和凝聚力 |
| **Filled vs Outline Discipline** | 在每个层级使用一种图标风格 | 在同一层级混合填充和轮廓图标 | 保持语义清晰度和风格连贯性 |
| **Touch Target Minimum** | 最小 44×44pt 交互面积（图标更小时用 padding 扩展） | 小图标没有扩展点击区域 | 满足无障碍和平台可用性标准 |
| **Icon Alignment** | 图标对齐文字基线并保持一致 padding | 未对齐图标或周围间距不一致 | 防止细微视觉不平衡降低感知质量 |
| **Icon Contrast** | 遵循 WCAG 对比度标准：小元素 4.5:1，较大 UI 图标最低 3:1 | 低对比度图标融入背景 | 确保亮暗模式下的无障碍性 |

### Interaction（Web）

| Rule | Do | Don't |
|------|----|-----|
| **Tap feedback** | 80-150ms 内提供清晰按压反馈（ripple/opacity/elevation） | 点击无视觉响应 |
| **Animation timing** | 微交互保持 150-300ms + 平台原生 easing | 瞬间过渡或慢动画 (>500ms) |
| **Accessibility focus** | 屏幕阅读器焦点顺序匹配视觉顺序，标签具有描述性 | 未标记控件或混乱焦点遍历 |
| **Disabled state clarity** | 使用 disabled 语义、降低强调、无点击动作 | 控件看起来可点击但无反应 |
| **Touch target minimum** | 点击区域 >=44x44pt，图标更小时扩展点击区域 | 微小点击区域或纯图标点击区无 padding |
| **Gesture conflict prevention** | 每个区域一个主手势，避免嵌套 tap/drag 冲突 | 重叠手势导致误操作 |
| **Semantic native controls** | 优先使用语义化交互原素（button/a）+ 正确 a11y 角色 | 通用容器作为主控件而无语义 |

### Light/Dark Mode Contrast

| Rule | Do | Don't |
|------|----|-----|
| **Surface readability (light)** | 卡片/surface 与背景间有足够 opacity/elevation 区分 | 过于透明的 surface 导致层级模糊 |
| **Text contrast (light)** | 正文对比度 >=4.5:1 against 浅色 surface | 低对比度灰色正文 |
| **Text contrast (dark)** | 主文字对比度 >=4.5:1，次级 >=3:1 on dark surface | 暗色模式文字融入背景 |
| **Border and divider visibility** | 分隔线在两种主题都可见（不只是亮色模式） | 特定主题边框在另一模式消失 |
| **State contrast parity** | pressed/focused/disabled 状态在亮暗主题下同样可区分 | 只为一个主题定义交互状态 |
| **Token-driven theming** | 使用语义色彩 token 映射到各主题的 app surface/text/icons | 每屏硬编码 hex 值 |
| **Scrim and modal legibility** | Modal scrim 够强以隔离前景内容（通常 40-60% 黑色） | 弱 scrim 导致背景视觉竞争 |

### Layout & Spacing

| Rule | Do | Don't |
|------|----|-----|
| **Safe-area compliance** | 所有固定 header/tab bar/CTA bar 尊重上下安全区域 | 固定 UI 放在 notch/status bar/手势区域下 |
| **System bar clearance** | 为 status/navigation bars 和手势 home indicator 添加间距 | 可点击内容与 OS chrome 碰撞 |
| **Consistent content width** | 每设备类别保持可预测的内容宽度（phone/tablet） | 屏幕间混合任意宽度 |
| **8dp spacing rhythm** | 对 padding/gap/section spacing 使用一致的 4/8dp 间距系统 | 随机无节奏的间距增量 |
| **Readable text measure** | 大设备上长文本保持可读（避免平板上边缘到边缘段落） | 全宽长文本损害可读性 |
| **Section spacing hierarchy** | 定义清晰的垂直 rhythm 层级（如 16/24/32/48）按层级 | 相似 UI 级别间距不一致 |
| **Adaptive gutters by breakpoint** | 更宽的宽度和横屏时增加水平 inset | 所有设备尺寸/方向使用相同窄 gutter |
| **Scroll and fixed element coexistence** | 添加 bottom/top content inset 使列表不被固定条遮挡 | 滚动内容被 sticky header/footer 遮挡 |

---

## Pre-Delivery Checklist

交付 UI 代码前验证以下项目：

### Visual Quality
- [ ] 不使用 emoji 作为图标（使用 SVG 替代）
- [ ] 所有图标来自一致的图标家族和风格
- [ ] 官方品牌资产使用正确比例和 clear space
- [ ] Pressed-state 视觉效果不偏移布局边界或引起抖动
- [ ] 语义 theme token 一致使用（无临时每屏硬编码颜色）

### Interaction
- [ ] 所有可点击元素提供清晰 pressed feedback（ripple/opacity/elevation）
- [ ] 触摸目标满足最小尺寸（>=44x44pt）
- [ ] 微交互时机保持在 150-300ms 范围 + 原生感 easing
- [ ] Disabled 状态视觉清晰且不可交互
- [ ] 屏幕阅读器焦点顺序匹配视觉顺序，交互标签具有描述性
- [ ] 手势区域避免嵌套/冲突交互（tap/drag/back-swipe conflicts）

### Light/Dark Mode
- [ ] 亮暗模式下主文字对比度 >=4.5:1
- [ ] 亮暗模式下次级文字对比度 >=3:1
- [ ] 分隔线/borders 和交互状态在两种模式下都可区分
- [ ] Modal/drawer scrim opacity 足够强以保持前景可读性（通常 40-60% black）
- [ ] 两个主题都在交付前测试（不是只测单一主题推断）

### Layout
- [ ] Header、tab bar 和 bottom CTA bar 尊重 safe areas
- [ ] 滚动内容不被 fixed/sticky 条遮挡
- [ ] 在小屏手机、大屏手机和平板（竖屏 + 横屏）上验证
- [ ] Horizontal insets/gutters 按设备尺寸和方向正确适配
- [ ] 4/8dp spacing rhythm 在组件、section 和页面级别保持
- [ ] 长文本 measure 在较大设备上保持可读（无 edge-to-edge 段落）

### Accessibility
- [ ] 所有有意义的图片/图标有 accessibility labels
- [ ] 表单字段有 labels、hints 和清晰的 error messages
- [ ] 颜色不是唯一指示器
- [ ] 支持 reduced motion 和动态文字大小而不破坏布局
- [ ] Accessibility traits/roles/states（selected, disabled, expanded）正确公告

---

## 设计工作流

### Step 1: 调用搜索引擎获取设计系统

**唯一且必须的第一步。** 使用用户的产品描述调用搜索引擎，获得数据驱动的设计决策依据。

### Step 2: 展示方案并确认关键点

搜索引擎已输出完整方案（风格/配色/字体/布局）。**不要把已回答的问题重新问一遍。**

1. 向用户展示搜索结果摘要（风格名、配色预览、字体、布局模式）
2. 仅询问搜索引擎无法判断的关键约束：
   - **必问**：品牌硬性约束（logo、固定品牌色、已有设计规范）、具体页面/功能范围
   - **可选**：用户描述模糊且搜索置信度低时补充调研
   - **跳过**：搜索引擎已确定且用户无异议的字段不再重复问
3. 数量控制在 2-5 个问题，根据场景动态调整（不是固定模板）

### Step 3: 开始编码

设计输入 = 三者结合：
1. **搜索引擎结果**：category / style / colors / typography / anti_patterns / decision_rules —— 作为**基准**
2. **用户确认/调整**：品牌约束、功能范围、对方案的修改意见 —— **覆盖默认值**
3. **按需补充的域搜索结果**：charts / icons / ux-guidelines 等

所有 CSS token 直接从搜索结果的 `colors` 和 `typography` 字段取值，不要凭空编造。

### Step 4: Quality Gate 验证 + 交付审查

编码完成后：
1. 自检以下核心检查项（来自 `decision_rules` 和 UX 准则）：

```
P0-CRITICAL:
  [ ] 对比度 ≥ 4.5:1（正常文字）/ ≥ 3:1（大文字）
  [ ] 触摸目标 ≥ 44×44pt
  [ ] focus-visible 状态可见
  [ ] 图标按钮有 aria-label
  [ ] 无 emoji 作为功能图标
  [ ] **无动态属性访问组件**（禁止 `IconLibrary[var]`、`Components[name]` 等，必须 switch/case 或直接用具体组件名）

P1-HIGH:
  [ ] 图片有 width/height 或 aspect-ratio（防 CLS）
  [ ] 非首屏图片 loading="lazy"
  [ ] 移动优先响应式
  [ ] body 字体 ≥ 16px
  [ ] 底部导航 ≤ 5 项

P2-MEDIUM:
  [ ] 行高 body: 1.5-1.75
  [ ] 动效时长: 150-300ms（微交互）/ ≤400ms（复杂过渡）
  [ ] 动效只使用 transform/opacity
  [ ] 表单有可见 label（非 placeholder-only）
```

2. 调用 visual-reviewer sub-agent 进行专业审查（将 design system JSON 一并传入用于一致性校验）
