import type { DesignFile } from './file-store';
import type { AgentCallbacks, AgentConfig, LlmMessage, ToolDefinition } from './types';
import { runAgent } from './agent';
import { FileStore } from './file-store';
import { createLlmClient } from './llm';
import { SkillManager } from './skill-manager';
import { createEvalSkillJsTool, createLoadSkillTool, createReadSkillFileTool } from './skill-tools';
import { createSubAgentTool } from './subagent-tool';
import { createTools } from './tools';

export type { AgentCallbacks, AgentConfig, LlmMessage, ToolDefinition };
export type { SkillDefinition, StoredCustomSkill, SubAgentDefinition } from './types';
export { type DesignFile, FileStore, SkillManager };

export type AgentInstance = {
  run: (
    userInput: string,
    callbacks: AgentCallbacks,
    existingMessages?: LlmMessage[],
  ) => Promise<LlmMessage[]>;
  fileStore: FileStore;
  skillManager: SkillManager;
};

export function createAgent(config: AgentConfig): AgentInstance {
  if (!config.systemPrompt) {
    throw new Error('[Agent SDK] systemPrompt is required');
  }

  const fileStore = new FileStore();
  const llmClient = createLlmClient(config.apiKey, config.baseUrl);
  const systemPrompt = config.systemPrompt;

  const skillManager = new SkillManager();
  skillManager.loadAll(); // 初始化时立即加载内置 + 自定义 Skill

  const coreTools = createTools(fileStore);
  let allTools: ToolDefinition[] = [...coreTools];

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

  return {
    fileStore,
    skillManager,

    async run(userInput, callbacks, existingMessages = []) {
      // 动态创建 Skill 工具（确保 description 包含最新列表）
      const loadSkillTool = createLoadSkillTool(skillManager);
      const readSkillFileTool = createReadSkillFileTool(skillManager);
      const evalSkillJsTool = createEvalSkillJsTool(skillManager);

      const toolsWithSkills = [...allTools, loadSkillTool, readSkillFileTool, evalSkillJsTool];

      return runAgent(
        userInput,
        callbacks,
        llmClient,
        systemPrompt,
        toolsWithSkills,
        existingMessages,
        {
          model: config.model,
          maxTokens: config.maxTokens,
          maxTurns: config.maxTurns,
          skillManager,
        },
      );
    },
  };
}
