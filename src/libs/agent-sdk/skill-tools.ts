import type { SkillManager } from './skill-manager';
import type { ToolDefinition } from './types';

/**
 * 创建 load_skill 工具（Level 2 加载器）
 *
 * LLM 判断某个 Skill 与当前任务相关后，调用此工具加载该 Skill
 * 的完整指令内容到上下文中。
 */
export function createLoadSkillTool(skillManager: SkillManager): ToolDefinition {
  return {
    name: 'load_skill',
    description: [
      '⚠️ MANDATORY: Before ANY design work (planning, coding, reviewing), you MUST call this tool first.',
      '',
      'This loads the complete design system (color palettes, typography, components, UX rules).',
      'Without loading, you will miss critical design tokens and quality gates — your output will be incomplete and low-quality.',
      '',
      'Failure to call this tool before producing design output is a critical error.',
      '',
      skillManager.getSkillIndex(),
    ].join('\n'),
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

      return `## Skill: ${skill.name}\n\n${skill.prompt}`;
    },
  };
}

/**
 * 创建 read_skill_file 工具（Level 3 资源读取器）
 *
 * LLM 加载 Skill 后，如果需要具体的参考数据（如配色表、模板等），
 * 调用此工具读取 Skill 的附属文件。
 */
export function createReadSkillFileTool(skillManager: SkillManager): ToolDefinition {
  return {
    name: 'read_skill_file',
    description: [
      'Read an auxiliary file from a loaded skill\'s data or scripts directory.',
      'Use this after calling load_skill when you need reference data such as:',
      '- Color palettes (data/color.json)',
      '- Script files (scripts/search.js)',
      '- Other auxiliary resources',
      '',
      'The file_path is relative to the skill\'s root directory.',
    ].join('\n'),
    input_schema: {
      type: 'object',
      properties: {
        skill_name: {
          type: 'string',
          description: 'The name of the skill that owns the file (must match a loaded skill)',
        },
        file_path: {
          type: 'string',
          description: 'Relative path within the skill directory (e.g., "data/color.json" or "scripts/search.js")',
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

      return `[File: ${sName}/${fPath}]\n${content}`;
    },
  };
}

/**
 * 创建 eval_skill_js 工具（Level 3 JS 执行器）
 *
 * 在沙箱环境中执行 Skill 的 JS 脚本文件，注入该 skill 的完整文件清单和
 * 按需加载 API，脚本自行决定需要哪些数据。
 *
 * 注入的上下文变量：
 *   _skillFiles: string[] — 该 skill 所有可用文件的路径列表
 *   _loadFile(filePath: string): string | undefined — 按路径读取原始内容
 *   _loadJson(filePath: string): any — 按路径读取并 JSON.parse
 */
export function createEvalSkillJsTool(skillManager: SkillManager): ToolDefinition {
  return {
    name: 'eval_skill_js',
    description: [
      'Execute a JavaScript file from a loaded skill in a sandboxed environment.',
      '',
      'Available context in script:',
      '- _skillFiles: list of all file paths in this skill',
      '- _loadFile(path): read raw content of any skill file',
      '- _loadJson(path): read and parse JSON from any skill file',
      '',
      'Usage examples:',
      '- eval_skill_js(\'ui-ux-pro-max\', \'scripts/search.js\') — execute script',
      '- eval_skill_js(\'ui-ux-pro-max\', \'scripts/search.js\', "UIUXSearch.generateDesignSystem(\'健身App\')") — with expression',
    ].join('\n'),
    input_schema: {
      type: 'object',
      properties: {
        skill_name: {
          type: 'string',
          description: 'The name of the skill that owns the script (e.g., "ui-ux-pro-max")',
        },
        file_path: {
          type: 'string',
          description: 'Path to the JS script within the skill (e.g., "scripts/search.js")',
        },
        expression: {
          type: 'string',
          description:
            'Optional: JS expression to evaluate after loading the script. '
            + 'If omitted, returns the result of script execution itself.',
        },
      },
      required: ['skill_name', 'file_path'],
    },
    async execute({ skill_name, file_path, expression }: Record<string, unknown>) {
      const sName = String(skill_name ?? '');
      const fPath = String(file_path ?? '');

      if (!sName || !fPath) {
        return 'Error: Both "skill_name" and "file_path" are required.';
      }

      const skill = skillManager.getSkill(sName);
      if (!skill) {
        return `Error: Skill "${sName}" not found.`;
      }

      // 读取脚本文件
      const scriptContent = skillManager.getSkillFile(sName, fPath);
      if (!scriptContent) {
        const available = skillManager.listSkillFiles(sName);
        return [
          `Error: Script "${fPath}" not found in skill "${sName}".`,
          available.length > 0 ? `Available: ${available.join(', ')}` : 'No files.',
        ].join('\n');
      }

      // 构建沙箱：注入通用 API，不预加载任何数据（脚本自行按需加载）
      const allFiles = skillManager.listSkillFiles(sName);
      const sandbox: Record<string, unknown> = {
        // 文件清单，脚本可据此了解有哪些资源可用
        _skillFiles: allFiles,
        // 按需加载原始内容
        _loadFile: (filePath: string): string | undefined =>
          skillManager.getSkillFile(sName, filePath),
        // 按需加载并解析 JSON
        _loadJson: (filePath: string): unknown => {
          const content = skillManager.getSkillFile(sName, filePath);
          if (!content) {
            return undefined;
          }
          try {
            return JSON.parse(content);
          } catch {
            return content;
          }
        },
      };

      // 捕获 console 输出
      const logs: string[] = [];
      const capturedConsole = {
        log: (...args: unknown[]) => logs.push(args.map(a => formatValue(a)).join(' ')),
        warn: (...args: unknown[]) => logs.push(`[WARN] ${args.map(a => formatValue(a)).join(' ')}`),
        error: (...args: unknown[]) => logs.push(`[ERROR] ${args.map(a => formatValue(a)).join(' ')}`),
      };

      try {
        const injectedCode = [
          '// === Skill context ===',
          `const { _skillFiles, _loadFile, _loadJson } = _sandbox;`,
          '',
          '// === Script source ===',
          scriptContent,
          ...(expression ? ['', `// === User expression ===`, `return (${expression});`] : []),
        ].join('\n');

        // Function 构造器创建隔离作用域（eval_skill_js 的核心能力）
        // eslint-disable-next-line no-new-func
        const fn = new Function('_sandbox', '_console', injectedCode);
        const result = fn(sandbox, capturedConsole);

        // 组装返回结果
        const parts: string[] = [];
        if (logs.length > 0) {
          parts.push('[Console Output]', ...logs);
        }
        if (result !== undefined) {
          parts.push(
            '[Return Value]',
            typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result),
          );
        }
        return parts.length > 0 ? parts.join('\n') : '[OK] Script executed successfully.';
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return `[Execution Error] ${message}`;
      }
    },
  };
}

function formatValue(value: unknown): string {
  if (value === null) {
    return 'null';
  }
  if (value === undefined) {
    return 'undefined';
  }
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  return String(value);
}
