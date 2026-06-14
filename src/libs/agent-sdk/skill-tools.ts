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
          description: 'The exact skill name to load',
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
 * 在沙箱环境中执行 Skill 的 JS 脚本文件，注入该 skill 的完整文件内容 Map
 * 和调用参数，脚本自行决定需要哪些数据、如何处理。
 *
 * 注入的上下文变量：
 *   _skillFiles: Record<string, string> — 该 skill 所有文件的完整内容 Map（路径 → 内容）
 *   _params: object — 结构化调用参数（对齐 Python CLI 参数名）
 */
export function createEvalSkillJsTool(skillManager: SkillManager): ToolDefinition {
  return {
    name: 'eval_skill_js',
    description: [
      'Execute a JavaScript file from a loaded skill in a sandboxed environment.',
      '',
      'Injected context variables:',
      '- _skillFiles: Record<string, string> — full file content map (path → content) for this skill',
      '- _params: object — structured call parameters (query, design_system, project_name, domain, max_results)',
      '',
      'Usage examples:',
      '- eval_skill_js(\'my-skill\', \'scripts/search.js\', { query: \'fitness app\' })',
      '- eval_skill_js(\'my-skill\', \'scripts/search.js\', { query: \'SaaS\', domain: \'color\' })',
    ].join('\n'),
    input_schema: {
      type: 'object',
      properties: {
        skill_name: {
          type: 'string',
          description: 'The name of the skill that owns the script',
        },
        file_path: {
          type: 'string',
          description: 'Path to the JS script within the skill (e.g., "scripts/search.js")',
        },
        params: {
          type: 'object',
          description:
            'Optional: Structured parameters passed to the script as _params. '
            + 'The actual fields depend on the target skill and script.',
        },
      },
      required: ['skill_name', 'file_path'],
    },
    async execute({ skill_name, file_path, params }: Record<string, unknown>) {
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

      // 构建沙箱：注入该 skill 的完整文件内容 Map（路径 → 内容字符串）和调用参数
      const allFiles = skillManager.getSkillFiles(sName);
      const sandbox: Record<string, unknown> = {
        _skillFiles: allFiles, // Record<string, string>
        _params: params, // 结构化参数（对齐 Python CLI）
      };

      // 捕获 console 输出
      // const logs: string[] = [];
      // const capturedConsole = {
      //   log: (...args: unknown[]) => logs.push(args.map(a => formatValue(a)).join(' ')),
      //   warn: (...args: unknown[]) => logs.push(`[WARN] ${args.map(a => formatValue(a)).join(' ')}`),
      //   error: (...args: unknown[]) => logs.push(`[ERROR] ${args.map(a => formatValue(a)).join(' ')}`),
      // };

      try {
        const injectedCode = [
          '// === Skill context ===',
          `const { _skillFiles, _params } = _sandbox;`,
          '',
          '// === Script source ===',
          scriptContent,
        ].join('\n');

        // 后续可以拦截console，或者监听js error，将错误信息也返回给LLM s
        // const fn = new Function('_sandbox', '_console', injectedCode);
        // Function 构造器创建隔离作用域（eval_skill_js 的核心能力）
        // eslint-disable-next-line no-new-func
        const fn = new Function('_sandbox', injectedCode);
        console.log('fn...', fn);
        const result = fn(sandbox);
        console.log('result...', result);
        return result;
        // 组装返回结果
        // const parts: string[] = [];
        // if (logs.length > 0) {
        //   parts.push('[Console Output]', ...logs);
        // }
        // if (result !== undefined) {
        //   parts.push(
        //     '[Return Value]',
        //     typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result),
        //   );
        // }
        // return parts.length > 0 ? parts.join('\n') : '[OK] Script executed successfully.';
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return `[Execution Error] ${message}`;
      }
    },
  };
}
