// 通过 raw-loader 导入 SKILL.md 和 Level 3 资源文件，
// 构建时全部打包为字符串常量。
// 运行时无需任何 I/O 操作。

// ============ 数据文件（CSV → JSON 转换产物）============
// 生成方式: python3 scripts/convert_csv_to_json.py
// 源目录: .trae/skills/ui-ux-pro-max/data/*.csv

import appInterface from './data/app-interface.json';
import charts from './data/charts.json';
import colors from './data/colors.json';
import design from './data/design.json';
import draft from './data/draft.json';
import googleFonts from './data/google-fonts.json';
import icons from './data/icons.json';
import landing from './data/landing.json';
import products from './data/products.json';
import reactPerformance from './data/react-performance.json';
import htmlTailwind from './data/stacks/html-tailwind.json';
import reactStack from './data/stacks/react.json';
import styles from './data/styles.json';
import typography from './data/typography.json';
import uiReasoning from './data/ui-reasoning.json';
import uxGuidelines from './data/ux-guidelines.json';

// 搜索引擎脚本（search-raw.ts 是 search.js 的字符串包装，供 TS/Webpack 正确导入）
import searchJs from './scripts/search-raw';
import content from './SKILL.md';

export const uiUxProMaxSkill = {
  source: 'builtin' as const,
  content: content as unknown as string, // Level 2: SKILL.md 全文
  files: {
    // === 核心搜索链路数据（6 个）===
    'data/products.json': JSON.stringify(products),
    'data/styles.json': JSON.stringify(styles),
    'data/colors.json': JSON.stringify(colors),
    'data/typography.json': JSON.stringify(typography),
    'data/ui-reasoning.json': JSON.stringify(uiReasoning),
    'data/landing.json': JSON.stringify(landing),

    // === 域搜索扩展数据（4 个）===
    'data/charts.json': JSON.stringify(charts),
    'data/ux-guidelines.json': JSON.stringify(uxGuidelines),
    'data/icons.json': JSON.stringify(icons),
    'data/google-fonts.json': JSON.stringify(googleFonts),

    // === 补充数据（4 个）===
    'data/design.json': JSON.stringify(design),
    'data/draft.json': JSON.stringify(draft),
    'data/react-performance.json': JSON.stringify(reactPerformance),
    'data/app-interface.json': JSON.stringify(appInterface),

    // === 技术栈数据（2 个，浏览器 Agent 的技术栈）===
    'data/stacks/html-tailwind.json': JSON.stringify(htmlTailwind),
    'data/stacks/react.json': JSON.stringify(reactStack),

    // === 搜索引擎脚本 ===
    'scripts/search.js': searchJs as unknown as string,

  } as Record<string, string>,
};
