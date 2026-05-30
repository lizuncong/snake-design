import type { FileStore } from './file-store';
import type { LlmClient } from './llm/types';
import type { SubAgentDefinition, ToolDefinition } from './types';
import { runAgent } from './agent';

export function createSubAgentTool(
  llmClient: LlmClient,
  _fileStore: FileStore,
  allTools: ToolDefinition[],
  subAgents: Record<string, SubAgentDefinition>,
  defaultModel: string,
): ToolDefinition {
  return {
    name: 'subagent',
    description: `Invoke a specialized sub-agent to handle specific tasks.

Available sub-agents:
${Object.entries(subAgents).map(([key, def]) => `- ${key}: ${def.description}`).join('\n')}

Use this tool when you need expert assistance for a specific domain (e.g., code review, testing, security audit).
The sub-agent operates in an isolated context and returns structured results.`,
    input_schema: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: Object.keys(subAgents),
          description: 'The sub-agent type to invoke',
        },
        prompt: {
          type: 'string',
          description: 'Specific instructions or context for this invocation',
        },
      },
      required: ['type', 'prompt'],
    },
    async execute(input) {
      const { type, prompt } = input as { type: string; prompt: string };
      const def = subAgents[type];

      if (!def) {
        return JSON.stringify({ error: `Unknown sub-agent type: ${type}` });
      }

      const subAgentModel = def.model || defaultModel;
      const subAgentTools = allTools.filter(tool => !def.tools || def.tools.includes(tool.name));

      console.warn(`[SubAgent] ${type} start, model=${subAgentModel}, maxTurns=${def.maxTurns ?? 10}`);

      const messages = await runAgent(
        prompt,
        {
          onText: text => console.warn(`[SubAgent:${type}]`, text),
          onStreamText: () => {},
          onToolCall: (name, input) => console.warn(`[SubAgent:${type}] 🔧 ${name}`, input),
          onToolResult: (name, result) => console.warn(`[SubAgent:${type}] ✅ ${name}`, typeof result === 'string' ? result.slice(0, 100) : result),
          onDone: usage => console.warn(`[SubAgent:${type}] done, usage=`, usage),
        },
        llmClient,
        def.prompt,
        subAgentTools,
        [],
        {
          model: subAgentModel,
          maxTurns: def.maxTurns ?? 10,
        },
      );

      const allAssistant = messages.filter(m => m.role === 'assistant');
      const lastAssistantMsg = allAssistant.pop();
      const content = lastAssistantMsg?.content;

      console.warn(`[SubAgent] ${type} result: type=${typeof content}, len=${typeof content === 'string' ? content.length : 'N/A'}, value=`, content);
      console.warn(`[SubAgent] ${type} assistant msgs=${allAssistant.length + 1}, all roles=`, messages.map(m => m.role));

      if (typeof content === 'string') {
        return content;
      }

      return JSON.stringify(content);
    },
  };
}
