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
