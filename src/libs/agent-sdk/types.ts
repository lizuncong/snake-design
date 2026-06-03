export type AgentCallbacks = {
  onText: (text: string) => void;
  onStreamText: (chunk: string) => void;
  onReasoningText?: (chunk: string) => void;
  onToolCall: (name: string, input: Record<string, unknown>) => void;
  onToolResult: (name: string, result: string) => void;
  onDone: (usage: { prompt_tokens: number; completion_tokens: number }) => void;
  onSnip?: (before: number, after: number) => void;
};

export type LlmMessage = {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | LlmContentBlock[];
  tool_calls?: LlmToolCall[];
  tool_call_id?: string;
};

export type LlmContentBlock
  = | { type: 'text'; text: string }
    | { type: 'tool_use'; id: string; name: string; input: Record<string, unknown> }
    | { type: 'tool_result'; content: string };

export type LlmToolCall = {
  id: string;
  type: 'function';
  function: { name: string; arguments: string };
};

export type ToolDefinition = {
  name: string;
  description: string;
  input_schema: Record<string, unknown>;
  execute: (input: Record<string, unknown>) => Promise<string>;
};

export type SnipRecord = { fromId: string; toId: string; reason: string };

export type SubAgentDefinition = {
  name: string;
  description: string;
  prompt: string;
  tools?: string[];
  model?: string;
  maxTurns?: number;
};

export type AgentConfig = {
  apiKey: string;
  baseUrl: string;
  model: string;
  systemPrompt: string;
  maxTokens?: number;
  temperature?: number;
  maxTurns?: number;
  subAgents?: Record<string, SubAgentDefinition>;
};

/** 单个 Skill 的定义（解析后的最终形态） */
export type SkillDefinition = {
  name: string; // 来自 frontmatter.name
  description: string; // 来自 frontmatter.description
  prompt: string; // SKILL.md body 部分（Level 2 内容）
  content: string; // SKILL.md 完整原文（含 frontmatter，用于预览）
  source: 'builtin' | 'custom'; // 来源标记
  files: Record<string, string>; // Level 3 附属文件 (路径 → 内容)
};

/** 用户自定义 Skill 的存储格式（存入 IndexedDB） */
export type StoredCustomSkill = {
  name: string; // 主键（IndexedDB keyPath）
  description: string;
  content: string; // 完整 SKILL.md 原文（含 frontmatter）
  files?: Record<string, string>; // 可选：附属文件路径 → 内容映射
  createdAt: number; // 创建时间戳
  updatedAt: number; // 更新时间戳
};
