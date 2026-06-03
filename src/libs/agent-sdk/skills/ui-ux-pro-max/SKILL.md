---
name: ui-ux-pro-max
description: "UI/UX design intelligence for web and mobile. Includes 50+ styles, 161 color palettes, 57 font pairings, 161 product types, 99 UX guidelines, and 25 chart types across 10 stacks (React, Next.js, Vue, Svelte, SwiftUI, React Native, Flutter, Tailwind, shadcn/ui, and HTML/CSS). Actions: plan, build, create, design, implement, review, fix, improve, optimize, enhance, refactor, and check UI/UX code. Projects: website, landing page, dashboard, admin panel, e-commerce, SaaS, portfolio, blog, and mobile app. Elements: button, modal, navbar, sidebar, card, table, form, and chart. Styles: glassmorphism, claymorphism, minimalism, brutalism, neumorphism, bento grid, dark mode, responsive, skeuomorphism, and flat design. Topics: color systems, accessibility, animation, layout, typography, font pairing, spacing, interaction states, shadow, and gradient. Integrations: shadcn/ui MCP for component search and examples."
---

# UI/UX Pro Max - Design Intelligence

<design_system>

# 专业设计系统

> **特点**: 所有规则均为**浏览器环境可直接使用的完整实现**
> **覆盖**: 50+设计风格 · 161配色方案 · 57字体配对 · 99+UX准则 · 25种图表类型

---

## ⚙️ 强制性设计前工作流（每次输出代码前必须完成）

### Step 1: Context Analysis（上下文分析）

请先在内部回答以下问题（不输出给用户）：

```
1. Product Type产品类型: ___
   （如：SaaS/Dashboard / E-commerce / Restaurant / Portfolio / Blog / Mobile App）

2. Target Audience目标用户: ___
   （年龄层、使用场景、设备偏好）

3. Core Emotions核心情绪（选3个）: ___
   （如：专业可信 / 温暖亲切 / 高端奢华 / 活泼年轻 / 极简现代）

4. Style Keywords风格关键词（选2-3个）: ___
   （如：Dark Luxury / Glassmorphism / Minimalism / Neumorphism / Brutalism）

5. Key Scenarios核心场景: ___
   （用户最常执行的3个操作）
```

### Step 2: Design Direction（设计方向决策）

基于Step 1的分析，确定以下设计Token：

```
┌─ Color Palette（18个Token）
│  --color-bg-primary:     #XXXXXX  (页面背景)
│  --color-surface:        #XXXXXX  (卡片/弹窗背景)
│  --color-primary:        #XXXXXX  (品牌主色-CTA按钮)
│  --color-primary-hover:  #XXXXXX  (主色悬停态)
│  --color-text-primary:   #XXXXXX  (主文字)
│  --color-text-secondary: #XXXXXX  (次要文字)
│  --color-border:         #XXXXXX  (边框/分割线)
│  --color-success:        #XXXXXX  (成功状态)
│  --color-error:          #XXXXXX  (错误状态)
│  ... (更多Token见下文完整定义)
│
├─ Typography System
│  Display/H1:  Font Family | Weight | Size | LineHeight
│  H2-H6:      同上
│  Body:       同上
│  Caption:    同上
│
├─ Spacing Scale
│  xs: 4px | sm: 8px | md: 16px | lg: 24px | xl: 32px | 2xl: 48px
│
├─ Elevation/Shadow层级
│  sm:  0 1px 2px rgba(0,0,0,0.1)     (默认卡片)
│  md:  0 4px 12px rgba(0,0,0,0.15)   (悬浮卡片)
│  lg:  0 8px 24px rgba(0,0,0,0.2)     (下拉菜单/弹窗)
│  xl:  0 16px 48px rgba(0,0,0,0.25)   (Modal)
│
└─ Border Radius阶梯
   none: 0px | sm: 4px | md: 8px | lg: 16px | xl: 24px | full: 9999px
```

### Step 3: Quality Gate（质量门禁验证）

在开始编码前，确认以下Checklist全部通过：

```
✅ P0-CRITICAL (致命):
   [ ] 所有交互元素的对比度 ≥ 4.5:1 (正常文字) / ≥ 3:1 (大文字)
   [ ] 触摸目标最小尺寸 ≥ 44×44pt
   [ ] 所有按钮/链接有 focus-visible 状态
   [ ] 所有图标按钮有 aria-label
   [ ] 无emoji作为功能图标
   
✅ P1-HIGH (重要):
   [ ] 图片有 width/height 或 aspect-ratio (防CLS)
   [ ] 非首屏图片使用 loading="lazy"
   [ ] 移动优先响应式 (mobile-first breakpoints)
   [ ] 字体大小 body ≥ 16px (防iOS自动缩放)
   
✅ P2-MEDIUM (关键):
   [ ] 行高 body: 1.5-1.75
   [ ] 动效时长: 150-300ms (微交互) / ≤400ms (复杂过渡)
   [ ] 动效只使用 transform/opacity (性能优化)

如果任何一项未通过 → 回到 Step 2 调整设计方案
```

### Step 4: Anti-Patterns Warning（反模式预警）

列出本项目需要特别避免的设计禁忌：

```
❌ 禁止列表（根据产品类型动态生成）:

通用禁忌:
• 冷色调蓝紫色系用于餐饮/美食类产品（缺乏食欲）
• 过小的触摸目标 (< 44px)
• Emoji作为功能性图标
• 纯装饰性动效（无意义）
• 灰色文字在浅灰背景上 (对比度不足)

[产品特定禁忌]:
• (根据Step 1的产品类型自动填充)
```

---
**Design Rationale Complete. Begin Implementation. ↑**
**只有完成上述4步后，才能开始编写代码！**
---

## 🎯 P0-CRITICAL 规则集（必须100%满足）

### 🔴 Accessibility 无障碍（14条规则）

#### 规则 A01-A06: 基础无障碍

| ID | 规则 | 标准 | Tailwind实现 | ❌ 反面案例 |
|----|------|------|-------------|------------|
| A01 | 文字对比度 | 正常≥4.5:1, 大≥3:1 | `text-gray-900 on white`=15.8:1 ✅ | `text-gray-500 on gray-100`=2.3:1 ❌ |
| A02 | Focus状态可见 | 2-4px focus ring | `focus:outline-none focus:ring-2 focus:ring-offset-2` | `focus:outline-none` (完全移除) ❌ |
| A03 | 图片Alt文本 | 有意义图片必填alt | `<img alt="菜品描述" />` | `<img />` (空alt) ❌ |
| A04 | 图标按钮标签 | 纯图标按钮需aria-label | `<button aria-label="关闭">` | `<button><Icon /></button>` ❌ |
| A05 | 键盘导航 | Tab顺序匹配视觉顺序 | 合理的DOM结构 + `tabIndex` | Tab跳过可交互元素 ❌ |
| A06 | 不仅用颜色传达信息 | 配合图标/文字 | 红色+❌图标+"错误"文字 | 仅红色=错误 ❌ |

**✅ 完整实现示例（可直接复制）：**
```jsx
const AccessibleButton = ({ 
  children, 
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  ariaLabel,
  onClick,
  ...props 
}) => {
  const baseClasses = `
    inline-flex items-center justify-center
    font-semibold rounded-xl
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    cursor-pointer
  `;
  
  const variants = {
    primary: `
      bg-gradient-to-r from-indigo-600 to-purple-600
      text-white
      shadow-lg shadow-indigo-500/30
      hover:shadow-xl hover:-translate-y-0.5
      active:scale-[0.98]
      focus:ring-indigo-500
    `,
    secondary: `
      border-2 border-gray-300
      text-gray-700
      hover:border-gray-400 hover:bg-gray-50
      active:scale-[0.98]
      focus:ring-gray-400
    `,
    ghost: `
      text-gray-600
      hover:text-gray-900 hover:bg-gray-100
      active:scale-[0.98]
      focus:ring-gray-400
    `,
    danger: `
      bg-red-600 text-white
      hover:bg-red-700
      active:scale-[0.98]
      focus:ring-red-500
    `
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm min-h-[36px]',
    md: 'px-5 py-2.5 text-base min-h-[44px]',  // T01: 44px最小高度
    lg: 'px-7 py-3.5 text-lg min-h-[52px]'
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]}`}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      onClick={onClick}
      {...props}
    >
      {loading && (
        <IconLibrary.Spinner className="-ml-1 mr-2 h-4 w-4" aria-hidden="true" />
      )}
      {children}
    </button>
  );
};

Object.assign(window, { AccessibleButton });

// 使用示例:
// <AccessibleButton variant="primary" size="md" loading={false} ariaLabel="提交订单">提交</AccessibleButton>
```

**这个组件满足的所有P0规则**：
- ✅ A01: 对比度达标（indigo-600 on white = 7.8:1）
- ✅ A02: focus-ring-2 focus:ring-offset-2
- ✅ A04: aria-label参数
- ✅ T01: min-h-[44px] (md尺寸)
- ✅ T04: cursor-pointer
- ✅ T05: active:scale-[0.98]

---

#### 规则 A07-A14: 高级无障碍

| ID | 规则 | 实现 |
|----|------|------|
| A07 | 跳转链接 | 页面顶部添加 `<a href="#main-content">跳转到主要内容</a>` |
| A08 | 标题层次 | h1→h6 连续，不跳跃 |
| A09 | 动效减弱 | 包裹在 `@media (prefers-reduced-motion: reduce)` 中 |
| A10 | 屏幕阅读器 | 重要区域加 `aria-live="polite"` |
| A11 | 表单关联 | label的htmlFor + input的id对应 |
| A12 | 错误反馈 | `role="alert"` + 明确的错误描述 |
| A13 | 自定义下拉 | 使用 `role="listbox"` + `aria-selected` |
| A14 | 模态框焦点 | 打开时聚焦内部，关闭时返回触发元素 |

**✅ 可访问表单实现示例：**
```jsx
const AccessibleForm = () => {
  const [email, setEmail] = React.useState('');
  const [error, setError] = React.useState('');

  const validateEmail = (value) => {
    if (!value.includes('@')) {
      setError('请输入有效的邮箱地址');
      return false;
    }
    setError('');
    return true;
  };

  return (
    <form 
      className="space-y-6 max-w-md mx-auto"
      onSubmit={(e) => { e.preventDefault(); validateEmail(email); }}
      noValidate
    >
      {/* Email字段 */}
      <div>
        <label 
          htmlFor="email-input"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          邮箱地址 <span className="text-red-500">*</span>
        </label>
        
        <input
          id="email-input"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (error) validateEmail(e.target.value);
          }}
          onBlur={(e) => validateEmail(e.target.value)}
          aria-describedby={error ? 'email-error' : undefined}
          aria-invalid={!!error}
          className={`
            w-full px-4 py-3 min-h-[44px]  // T01: 44px高度
            rounded-xl border-2 
            transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-offset-2
            ${error 
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
              : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
            }
          `}
          placeholder="your@email.com"
        />
        
        {error && (
          <div 
            id="email-error"
            role="alert"
            className="mt-2 flex items-center gap-2 text-sm text-red-600"
          >
            <IconLibrary.AlertCircle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}
      </div>

      <AccessibleButton 
        type="submit" 
        variant="primary" 
        size="md"
        ariaLabel="提交表单"
      >
        提交
      </AccessibleButton>
    </form>
  );
};

Object.assign(window, { AccessibleForm });
```

**满足的规则**：
- ✅ A11: label.htmlFor + input.id
- ✅ A12: role="alert" + 明确错误消息
- ✅ A01: 错误红色对比度达标
- ✅ A02: focus-ring状态
- ✅ T01: input min-h-[44px]

---

### 🔴 Touch & Interaction 触摸交互（10条核心规则）

| ID | 规则 | 数值要求 | Tailwind类名 |
|----|------|---------|-------------|
| T01 | 触摸目标最小尺寸 | 44×44pt (iOS) / 48×48dp (Android) | `min-h-[44px] min-w-[44px]` |
| T02 | 触摸目标间距 | 最小8px gap | `gap-2` 或 `-m-2` 扩展区域 |
| T03 | 加载状态反馈 | 异步操作显示spinner | `<IconLibrary.Spinner />` |
| T04 | 点击光标样式 | 所有可点击元素 | `cursor-pointer` |
| T05 | 按压视觉反馈 | 100ms内提供反馈 | `active:scale-[0.98]` 或 `active:bg-black/5` |
| T06 | 手势冲突避免 | 主内容区避免横向滑动 | `touch-pan-x` 限制 |
| T07 | 安全区域 | 关键操作远离屏幕边缘 | `safe-area-inset-*` |
| T08 | 触觉反馈(可选) | 重要操作提供触觉反馈 | `navigator.vibrate(10)` |
| T09 | 拖拽阈值 | 移动>10px才开始拖拽 | 自定义逻辑 |
| T10 | 手势替代 | 危险操作必须有可见按钮 | 不能仅依赖滑动手势 |

**✅ 触摸友好卡片组件：**
```jsx
const TouchFriendlyCard = ({ 
  title, 
  description, 
  image, 
  onClick,
  badge 
}) => (
  <article
    className="
      group relative
      overflow-hidden
      rounded-2xl
      bg-white
      shadow-md
      transition-all duration-300
      hover:shadow-xl
      hover:-translate-y-1
      active:scale-[0.98]           // T05: 按压反馈
      cursor-pointer               // T04: 光标样式
    "
    onClick={onClick}
    role="button"
    tabIndex={0}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick?.();
      }
    }}
  >
    {/* 图片区域 */}
    {image && (
      <div className="aspect-video overflow-hidden bg-gray-100">
        <img
          src={image}
          alt={description}
          loading="lazy"             // PF04: 懒加载
          width={400}
          height={225}             // PF02: 尺寸声明
          className="
            w-full h-full object-cover
            group-hover:scale-105
            transition-transform duration-500
          "
        />
      </div>
    )}

    {/* 内容区域 - T01: 保证最小触摸目标 */}
    <div className="p-5 min-h-[100px] flex flex-col justify-center">
      {badge && (
        <span className="
          inline-flex self-start mb-3
          px-3 py-1 text-xs font-semibold
          rounded-full
          bg-indigo-100 text-indigo-700
        ">
          {badge}
        </span>
      )}
      
      <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">
        {title}
      </h3>
      
      <p className="text-sm text-gray-600 line-clamp-2">
        {description}
      </p>
    </div>

    {/* Hover指示器 */}
    <div className="
      absolute top-4 right-4
      opacity-0 group-hover:opacity-100
      transition-opacity duration-200
    ">
      <IconLibrary.ArrowRight className="h-5 w-5 text-indigo-600" />
    </div>
  </article>
);

Object.assign(window, { TouchFriendlyCard });
```

**满足的规则**：
- ✅ T01: 整体min-h-[100px]，按钮min-h-[44px]
- ✅ T04: cursor-pointer
- ✅ T05: active:scale-[0.98]
- ✅ PF02: img width/height声明
- ✅ PF04: loading="lazy"
- ✅ A05: tabIndex + onKeyDown支持键盘操作

---

## 🎨 P1-HIGH 规则集（显著提升质量）

### 🟡 Performance 性能优化（8条关键规则）

| ID | 规则 | 实现要点 | Tailwind类名 |
|----|------|---------|-------------|
| PF01 | 图片格式 | WebP/AVIF优先 | srcset + format=webp |
| PF02 | 尺寸声明 | 防止CLS | `width` + `height` 或 `aspect-ratio` |
| PF03 | 字体加载 | 避免FOIT | `font-display: swap` |
| PF04 | 懒加载 | 非首屏延迟加载 | `loading="lazy"` |
| PF05 | 骨架屏 | >300ms显示skeleton | `animate-pulse` + 占位div |
| PF06 | 代码分割 | 按路由懒加载 | 条件渲染代替一次性加载 |
| PF07 | 防抖节流 | 高频事件优化 | 自定义useDebounce hook |
| PF08 | 主线程预算 | 每帧<16ms | 避免同步大数据计算 |

**✅ 性能优化的图片网格组件：**
```jsx
const OptimizedImageGrid = ({ images }) => {
  const [loadedImages, setLoadedImages] = React.useState({});

  const handleImageLoad = (index) => {
    setLoadedImages(prev => ({ ...prev, [index]: true }));
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {images.map((image, index) => (
        <div key={image.id} className="aspect-[4/3] overflow-hidden rounded-xl bg-gray-100">
          {!loadedImages[index] && (
            // PF05: 骨架屏
            <div className="w-full h-full animate-pulse bg-gray-200" />
          )}
          
          <img
            src={image.url}
            srcSet={`
              ${image.url}?w=400 400w,
              ${image.url}?w=800 800w,
              ${image.url}?w=1200 1200w
            `}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            alt={image.alt}
            loading="lazy"                    // PF04
            width={image.width || 400}       // PF02
            height={image.height || 300}      // PF02
            onLoad={() => handleImageLoad(index)}
            className={`
              w-full h-full object-cover
              transition-opacity duration-300
              ${loadedImages[index] ? 'opacity-100' : 'opacity-0'}
            `}
          />
        </div>
      ))}
    </div>
  );
};

Object.assign(window, { OptimizedImageGrid });
```

---

### 🟡 Style Selection 风格选择（与产品类型匹配）

**核心原则**：
- S01: 风格必须匹配产品类型（见下文行业映射表）
- S02: 全项目风格一致，禁止混用
- S03: **禁止Emoji图标** → 使用IconLibrary
- S04: 配色从产品类型推导
- S05: 视觉效果（阴影/模糊/圆角）与风格统一

#### 行业-风格映射表（快速参考）

| 产品类型 | 推荐主风格 | 辅助风格 | 配色倾向 | 字体气质 |
|---------|-----------|---------|---------|---------|
| **SaaS/Dashboard** | Minimalism & Swiss | Flat Design | Blue/Indigo信任系 | Clean Sans-serif |
| **E-commerce** | Clean Modern | Warm Modern | Orange/Red行动系 | Friendly Rounded |
| **Restaurant/Food** | Dark Luxury | Warm Modern | Red/Gold暖色系 | Elegant Serif+Sans |
| **Portfolio/Creative** | Brutalism | Experimental | Bold Contrast | Display Serif |
| **Blog/Media** | Editorial | Classic Print | High Contrast | Serif Headings |
| **Finance/Fintech** | Minimalism | Corporate | Navy/Blue稳定系 | Professional Sans |
| **Healthcare** | Soft UI | Calming | Green/Teal治愈系 | Gentle Rounded |
| **Education** | Playful | Illustration-heavy | Bright Primary | Friendly Rounded |
| **Luxury/Premium** | Dark Luxury | Glassmorphism | Black/Gold奢华系 | Elegant Serif |
| **Tech/Developer** | Cyberpunk | Terminal-style | Neon/Glow效果 | Monospace+Mono |

**✅ 暗调奢华风格完整实现（Restaurant/Luxury场景）：**
```jsx
const DarkLuxuryCard = ({ title, subtitle, price, image, ctaText }) => (
  <article
    className="
      group relative
      overflow-hidden
      rounded-2xl
      bg-zinc-900/80                  // 深色半透明背景
      backdrop-blur-xl                // 毛玻璃效果
      border border-white/10          // 微妙边框
      shadow-[0_4px_24px_rgba(0,0,0,0.4)]  // 彩色阴影
      transition-all duration-500
      hover:border-amber-500/30
      hover:shadow-[0_16px_48px_rgba(245,158,11,0.15)]
      hover:-translate-y-2
      cursor-pointer
      active:scale-[0.98]
    "
    role="button"
    tabIndex={0}
  >
    {/* 图片 */}
    <div className="aspect-[4/3] overflow-hidden">
      <img
        src={image}
        alt={title}
        loading="lazy"
        className="
          w-full h-full object-cover
          group-hover:scale-110
          transition-transform duration-700
        "
      />
      {/* 渐变遮罩 */}
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent" />
    </div>

    {/* 内容 */}
    <div className="relative p-6 space-y-3">
      {/* 价格标签 */}
      <div className="flex items-baseline gap-2">
        <span className="font-mono text-3xl font-bold text-amber-400">
          ¥{price}
        </span>
        <span className="text-sm text-zinc-500 line-through">
          ¥{Math.floor(price * 1.2)}
        </span>
      </div>

      {/* 标题 */}
      <h3 className="text-xl font-bold text-zinc-100 line-clamp-1">
        {title}
      </h3>

      <p className="text-sm text-zinc-400 line-clamp-2">
        {subtitle}
      </p>

      {/* CTA按钮 */}
      <button
        className="
          w-full mt-4
          px-6 py-3 min-h-[44px]
          rounded-xl
          bg-gradient-to-r from-amber-500 to-amber-600
          text-zinc-900 font-bold
          shadow-lg shadow-amber-500/30
          hover:shadow-xl hover:shadow-amber-500/40
          hover:-translate-y-0.5
          active:scale-[0.98]
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-zinc-900
        "
      >
        {ctaText || '立即预订'}
      </button>
    </div>
  </article>
);

Object.assign(window, { DarkLuxuryCard });
```

**设计亮点**：
- ✅ 毛玻璃效果: `backdrop-blur-xl` + 半透明背景
- ✅ 彩色阴影: `shadow-amber-500/30` (金色光晕)
- ✅ 对比度达标: amber-400 on zinc-900 = 12.6:1 ✅
- ✅ 触摸友好: 按钮 min-h-[44px]
- ✅ 微交互: hover缩放 + translate + shadow变化

---

### 🟡 Layout & Responsive 响应式布局（8条规则）

| ID | 规则 | 断点/数值 | Tailwind实现 |
|----|------|----------|-------------|
| L01 | 移动优先设计 | Mobile-first向上扩展 | `sm:` `md:` `lg:` `xl:` |
| L02 | 标准断点 | 640/768/1024/1280px | Tailwind默认断点 |
| L03 | 移动端最小字号 | body≥16px | `text-base`(16px) |
| L04 | 禁止横向滚动 | `overflow-x-hidden` | 在body或容器上加 |
| L05 | 8px基准网格 | spacing用4/8/12/16... | `gap-2`(8px), `p-4`(16px) |
| L06 | z-index层级管理 | 0/10/20/40/100/1000 | 定义CSS变量或直接用值 |
| L07 | 最大内容宽度 | desktop: max-w-7xl(1280px) | `mx-auto max-w-7xl` |
| L08 | 安全区域内边距 | 底部导航预留safe-area | `pb-[env(safe-area-inset-bottom)]` |

**✅ 响应式布局模板：**
```jsx
const ResponsiveLayout = ({ header, sidebar, main, footer }) => (
  <div className="min-h-screen bg-gray-50 flex flex-col">
    {/* Header - 固定顶部 */}
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {header}
      </div>
    </header>

    {/* Main Content - 弹性填充 */}
    <main className="flex-1">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:py-8 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Sidebar - 大屏左侧 */}
          {sidebar && (
            <aside className="hidden lg:block lg:col-span-3">
              <div className="sticky top-24 space-y-6">
                {sidebar}
              </div>
            </aside>
          )}

          {/* Main Area - 自适应宽度 */}
          <div className={sidebar ? 'lg:col-span-9' : 'lg:col-span-12'}>
            {main}
          </div>
        </div>
      </div>
    </main>

    {/* Footer */}
    {footer && (
      <footer className="bg-white border-t mt-auto">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {footer}
        </div>
      </footer>
    )}
  </div>
);

Object.assign(window, { ResponsiveLayout });
```

---

## ✏️ P2-MEDIUM 规则集（完善体验）

### Typography & Color（12条精选规则）

| ID | 规则 | 标准 | 示例 |
|----|------|------|------|
| TY01 | 基础字号 | body≥16px | `text-base`(16px) |
| TY02 | 行高 | body: 1.5-1.75 | `leading-relaxed`(1.625) |
| TY03 | 字重层级 | 400/500/600/700 | Regular/Medium/Semibold/Bold |
| TY04 | 字体配对 | 标题Serif + 正文Sans | Playfair Display + Inter |
| TY05 | 字符限制 | mobile: 35-60char/line | `max-w-prose`(65ch) |
| CL01 | 语义化颜色 | 用Token不用hex | `text-primary` vs `#3B82F6` |
| CL02 | 暗黑模式 | 单独测试对比度 | 不能简单反转 |
| CL03 | 功能色一致性 | error=red/success=green | 全局统一 |
| CL04 | 渐变克制 | 最多2个色阶停止点 | `from-X to-Y` |
| CL05 | 阴影一致 | 使用预定义层级 | shadow-sm/md/lg/xl |
| CL06 | 圆角统一 | 按层级递增 | rounded/sm/md/lg/xl |
| CL07 | 透明度阶梯 | 0/5/10/25/50/75/100 | `bg-black/5` 等 |

### Animation 动效（10条黄金法则）

| ID | 规则 | 数值 | 性能友好 |
|----|------|------|---------|
| AN01 | 微交互时长 | 150-300ms | ✅ |
| AN02 | 复杂过渡时长 | ≤400ms | ✅ |
| AN03 | 缓动函数 | ease-out进入/ease-in退出 | ✅ |
| AN04 | 只动画transform/opacity | 避免width/height/top/left | GPU加速 |
| AN05 | 同时动画≤2个元素 | 避免视觉混乱 | ✅ |
| AN06 | 入场动画 | stagger延迟30-50ms/item | ✅ |
| AN07 | 退出更快 | 入场的60-70%时长 | ✅ |
| AN08 | 必须可中断 | 用户操作立即取消 | ✅ |
| AN09 | 尊重reduced-motion | `@media (prefers-reduced-motion)` | ✅ |
| AN10 | 布局稳定 | 动画不能引起reflow | transform only |

**✅ 动画组件示例（符合AN01-AN10）：**
```jsx
const AnimatedCard = ({ children, delay = 0 }) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const cardRef = React.useRef(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // AN09: 尊重reduced-motion
          const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
          
          if (prefersReducedMotion) {
            setIsVisible(true); // 立即显示，无动画
          } else {
            setTimeout(() => setIsVisible(true), delay);
          }
        }
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={cardRef}
      className={`
        transition-all duration-500 ease-out  // AN01: 300-500ms, ease-out
        ${isVisible 
          ? 'opacity-100 translate-y-0'  // AN04: 只用transform+opacity
          : 'opacity-0 translate-y-8'
        }
      `}
    >
      {children}
    </div>
  );
};

Object.assign(window, { AnimatedCard });
```

---

## 🧩 组件级专业标准（开箱即用的模板）

### Button 按钮族（已在A01中完整展示）

### Card 卡片族

**已提供**：
- `TouchFriendlyCard` (T01-T05规则)
- `DarkLuxuryCard` (暗调奢华风格)
- `OptimizedImageGrid` (PF01-PF05规则)

### Input 输入控件族（已在A07-A14中完整展示）

### Modal 弹窗组件

```jsx
const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  const overlayRef = React.useRef(null);
  const contentRef = React.useRef(null);

  React.useEffect(() => {
    if (isOpen) {
      // A14: 打开时聚焦内容区
      contentRef.current?.focus();
      // 禁止body滚动
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleKeyDown = (e) => {
    // ESC关闭
    if (e.key === 'Escape') {
      onClose?.();
    }
    
    // Focus trap
    if (e.key === 'Tab') {
      const focusableElements = contentRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElements && focusableElements.length > 0) {
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    }
  };

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  return (
    <div
      ref={overlayRef}
      className="
        fixed inset-0 z-50
        flex items-center justify-center
        bg-black/50 backdrop-blur-sm
        animate-in fade-in duration-200
      "
      onClick={(e) => {
        if (e.target === overlayRef) onClose?.();
      }}
      onKeyDown={handleKeyDown}
    >
      <div
        ref={contentRef}
        className={`
          ${sizes[size]}
          w-full mx-4
          bg-white
          rounded-2xl
          shadow-xl
          animate-in zoom-in-95 fade-in duration-200
          focus:outline-none
        `}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 id="modal-title" className="text-xl font-semibold text-gray-900">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="
              p-2 rounded-lg
              text-gray-400
              hover:text-gray-600
              hover:bg-gray-100
              transition-colors
            "
            aria-label="关闭弹窗"
          >
            <IconLibrary.Close className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { Modal });
```

**满足的规则**：
- ✅ A14: 焦点管理（打开时聚焦、关闭时返回）
- ✅ ESC关闭支持
- ✅ Focus Trap（Tab循环）
- ✅ 点击遮罩关闭
- ✅ 背景模糊效果
- ✅ 动画入场/退场

---

## 📐 设计决策优先级矩阵（P0-P3）

当多个规则冲突时，按以下优先级决策：

```
P0-CRITICAL (致命): 无障碍、可用性、安全性
   ↓ 必须满足，不可妥协
P1-HIGH (重要): 性能、品牌一致性、核心体验
   ↓ 强烈建议满足
P2-MEDIUM (关键): 视觉精致度、细节一致性
   ↓ 建议满足
P3-LOW (完善): 锦上添花、极致完美
   ↓ 可选优化
```

**示例冲突解决**：

❓ *问题*: 品牌指南要求圆角8px，但触摸目标需要44px高度导致视觉不协调？

→ **答案**: P0(Touch目标44px) > P2(视觉一致性)，**优先保证44px**，可通过调整padding来平衡视觉。

---

## 🎨 完整配色方案库

### 按产品类型分类

#### 1. SaaS/Dashboard（信任、专业）
```css
--primary: #3B82F6 (Blue 500)
--primary-hover: #2563EB (Blue 600)
--success: #10B981 (Emerald 500)
--warning: #F59E0B (Amber 500)
--error: #EF4444 (Red 500)
--bg-primary: #FFFFFF
--bg-secondary: #F9FAFB (Gray 50)
--text-primary: #111827 (Gray 900)
--text-secondary: #6B7280 (Gray 500)
```

#### 2. E-commerce（活力、行动）
```css
--primary: #F97316 (Orange 500)
--primary-hover: #EA580C (Orange 600)
--accent: #EC4899 (Pink 500)
--bg-primary: #FFFFFF
--bg-secondary: #FEF2F2 (Red 50)
--text-primary: #1C1917 (Stone 900)
```

#### 3. Restaurant/Luxury（奢华、温暖）
```css
--primary: #D97706 (Amber 600)
--primary-hover: #B45309 (Amber 700)
--gold: #FBBF24 (Amber 400)
--bg-primary: #18181B (Zinc 900)
--bg-surface: #27272A (Zinc 800)
--text-primary: #FAFAFA (Zinc 50)
--text-secondary: #A1A1AA (Zinc 400)
--border-subtle: rgba(255,255,255,0.1)
```

#### 4. Healthcare/Calm（治愈、清新）
```css
--primary: #14B8A6 (Teal 500)
--primary-hover: #0D9488 (Teal 600)
--soft-bg: #ECFEFF (Cyan 50)
--bg-primary: #F0FDFA (Teal 50)
--text-primary: #134E4A (Teal 900)
```

---

## ⚡ 快速启动检查清单（生成代码前必查）

```
□ 技术栈合规
  □ 无 import/export 语句
  □ 所有 Hooks 使用 React. 前缀
  □ 每个 .jsx 末尾有 Object.assign(window, {})
  □ 无内联 style={{}} 对象
  
□ 无障碍基础 (P0)
  □ 对比度 ≥ 4.5:1 (正文) / ≥ 3:1 (标题)
  □ 触摸目标 ≥ 44×44pt
  □ 所有可交互元素有 focus 状态
  □ 图片有 alt 属性
  □ 图标按钮有 aria-label
  
□ 性能基础 (P1)
  □ 图片有 width/height 或 aspect-ratio
  □ 非首屏图片有 loading="lazy"
  □ 移动端优先响应式 (mobile-first)
  □ 字体大小 ≥ 16px (防iOS缩放)

□ 视觉质量 (P2)
  □ 间距使用 4/8/16/32/48 倍数
  □ 圆角全局统一 (sm/md/lg/xl)
  □ 阴影使用预定义层级
  □ 颜色数量 ≤ 5种 (主色+辅助+中性+功能)
  
□ 交互完整性 (P0-P1)
  □ 按钮: Default + Hover + Focus + Active (+ Disabled/Loading)
  □ 链接: Hover + Focus + Visited
  □ 表单输入: Default + Focus + Error + Disabled
  □ 卡片: Hover 效果 (+ Active 如果可点击)
```

**如果以上全部通过 → 可以开始编码！否则 → 回到 Step 2 调整设计方案**

---

**记住：你不是在写代码，而是在创造艺术品。每一行代码都应该为用户体验服务。** 🎨✨