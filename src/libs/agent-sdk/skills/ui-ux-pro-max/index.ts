// 通过 raw-loader 导入 SKILL.md 和 Level 3 资源文件，
// 构建时全部打包为字符串常量。
// 运行时无需任何 I/O 操作。
// 注意：.js 文件因 export default 与 raw-loader 交互问题，
// 原始内容直接内联为字符串。

import colorData from './data/color.json';
import content from './SKILL.md';

export const uiUxProMaxSkill = {
  source: 'builtin' as const,
  content: content as unknown as string, // Level 2: SKILL.md 全文
  files: {
    // Level 3: 所有附属资源（data/ 和 scripts/ 下的文件）
    'data/color.json': JSON.stringify(colorData),
    'scripts/search.js': `// Example: UI component search utility
function searchComponents(query, components) {
  const lower = query.toLowerCase();
  return components.filter(c =>
    c.name.toLowerCase().includes(lower) ||
    c.description?.toLowerCase().includes(lower)
  );
}
`,
  } as Record<string, string>,
};
