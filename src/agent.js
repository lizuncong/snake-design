// agent.js — Agent Loop 核心逻辑（智谱原生格式）
// 直接使用 OpenAI function calling 格式，零转换

import { registerTool } from './tools/index.js';
import fsTools from './tools/filesystem.js';
import snipTool, {
  tagUserMessage,
  executeSnips,
  trimMessages,
} from './tools/snip.js';
import { callZhipuAPI } from './llm.js';

// 注册所有工具
for (const tool of Object.values(fsTools)) registerTool(tool);
registerTool(snipTool);

const SYSTEM_PROMPT = `你是一名专家级前端设计师，运行在浏览器端的设计工具环境中。你将根据用户需求生成高质量的前端设计产物。

## 核心要求：所有设计产物必须是 HTML 文件

**这是最重要的规则：你生成的每一个可预览的设计产物，必须是一个完整、独立、可直接在浏览器中运行的 HTML 文件。**

具体要求：
- 所有页面、组件、原型、设计稿都必须输出为 .html 或 .htm 文件
- HTML 文件必须自包含（CSS 内联在 <style> 标签中，JS 内联在 <script> 标签中）
- HTML 文件不需要任何外部依赖，可以直接用浏览器打开预览
- 如果需要图标，使用内联 SVG 或 CSS 绘制
- 如果需要图片，使用 data URI 或占位符色块

## 工作流程

1. **理解需求**：明确用户想要什么类型的设计（网页、组件、原型、仪表盘等）
2. **规划结构**：决定产出哪些 HTML 文件，文件如何组织
3. **编写代码**：使用 write_file 工具逐个创建 HTML 文件
4. **确认质量**：用 read_file 确认文件内容正确
5. **交付结果**：确保主 HTML 文件可以被直接预览

## 设计规范

- **视觉质量优先**：追求高保真、专业级的设计效果
- **响应式设计**：页面应适配不同屏幕尺寸
- **现代审美**：避免陈旧的 AI 风格模板（不要过度渐变、不要左侧边框强调、慎用 emoji 作为装饰）
- **善用 CSS 高级特性**：Grid、Flexbox、变量、动画等都是你的武器
- **代码整洁**：HTML 结构语义化，CSS 命名清晰，有适当的注释
- **交互体验**：添加合理的 hover 效果、过渡动画、微交互
- **单文件原则**：每个设计产物尽量保持在一个 HTML 文件中，便于预览和管理

## 工具使用规则

- 使用 write_file 创建或修改 .html 文件（主要产物）及必要的辅助文件
- 使用 read_file 读取已创建的文件内容以确认正确性
- 使用 list_files 查看当前项目中的所有文件
- 使用 snip 清理不再需要的对话上下文（传入消息的 [id:mNNNN] 标签）

## 迭代调整

用户可能会对已生成的文件提出修改意见。你应该：
- 先读取现有文件了解当前状态
- 在原有基础上进行针对性修改
- 保留好的部分，只改动需要调整的部分
- 修改后创建新版本文件或覆盖原文件

请用中文回复用户。`;

const MAX_TOKENS = 64000;
const TOKEN_PER_CHAR = 0.25;

function estimateTokens(messages, systemPrompt) {
  let chars = systemPrompt.length;
  for (const msg of messages) {
    if (typeof msg.content === 'string') {
      chars += msg.content.length;
    } else if (Array.isArray(msg.content)) {
      for (const block of msg.content) {
        if (block.type === 'text') chars += block.text.length;
        else if (block.type === 'tool_use') chars += JSON.stringify(block.input).length;
        else if (block.type === 'tool_result') {
          chars += typeof block.content === 'string'
            ? block.content.length
            : JSON.stringify(block.content).length;
        }
      }
    }
  }
  return Math.ceil(chars * TOKEN_PER_CHAR);
}

/**
 * 核心：Agent Loop（智谱原生格式）
 */
export async function runAgent(userInput, {
  onText = () => {},
  onToolCall = () => {},
  onToolResult = () => {},
  onDone = () => {},
  onSnip = () => {},
} = {}, existingMessages = []) {
  const messages = existingMessages.length > 0 ? [...existingMessages] : [];
  const { getToolDefinitions } = await import('./tools/index.js');
  const rawTools = getToolDefinitions();

  // 将工具定义转为 OpenAI function calling 格式
  const tools = rawTools.map(t => ({
    type: 'function',
    function: {
      name: t.name,
      description: t.description,
      parameters: t.input_schema,
    },
  }));

  let turnCount = 0;
  const MAX_TURNS = 10;

  while (turnCount < MAX_TURNS) {
    turnCount++;

    // 1. 追加 user 消息（带 [id:mNNNN] 标签）
    if (userInput) {
      const taggedContent = tagUserMessage(userInput);
      messages.push({ role: 'user', content: taggedContent });
    }

    // 2. Token 预算检查
    const estimated = estimateTokens(messages, SYSTEM_PROMPT);
    if (estimated > MAX_TOKENS * 0.8) {
      const idsToRemove = executeSnips(messages);
      if (idsToRemove.size > 0) {
        const before = messages.length;
        const trimmed = trimMessages([...messages], idsToRemove);
        messages.length = 0;
        messages.push(...trimmed);
        onSnip(before, messages.length);
      }
    }

    // 3. 调用 LLM（智谱原生格式，返回原始响应）
    onText(`\n[Turn ${turnCount}] 正在思考...\n`);
    const apiResp = await callZhipuAPI(messages, tools, SYSTEM_PROMPT);

    const choice = apiResp.choices[0];
    const msg = choice.message;
    const usage = apiResp.usage || { prompt_tokens: 0, completion_tokens: 0 };
    const finishReason = choice.finish_reason; // "tool_calls" | "stop" | "length"

    // 4. 追加 assistant 消息到历史（保留完整结构供多轮复用）
    const assistantMsg = { role: 'assistant', content: msg.content || '' };
    if (msg.tool_calls) assistantMsg.tool_calls = msg.tool_calls;
    messages.push(assistantMsg);

    // 5. 输出文本内容
    if (msg.content) {
      onText(msg.content + '\n');
    }

    // 6. 根据 finish_reason 决定下一步
    if (finishReason !== 'tool_calls' || !msg.tool_calls || msg.tool_calls.length === 0) {
      onDone(usage);
      return messages;
    }

    // 7. 有 tool_calls → 执行工具
    for (const tc of msg.tool_calls) {
      const fn = tc.function;
      const input = typeof fn.arguments === 'string' ? JSON.parse(fn.arguments) : fn.arguments;
      onToolCall(fn.name, input);

      const { dispatchTool } = await import('./tools/index.js');
      try {
        const result = await dispatchTool(fn.name, input, {});
        onToolResult(fn.name, result);
        messages.push({
          role: 'tool',
          tool_call_id: tc.id,
          content: typeof result === 'string' ? result : JSON.stringify(result),
        });
      } catch (err) {
        const errContent = `Error: ${err.message}`;
        onToolResult(fn.name, errContent);
        messages.push({
          role: 'tool',
          tool_call_id: tc.id,
          content: errContent,
        });
      }
    }

    // 8. 后续轮次不再追加新 user 消息
    userInput = '';
  }

  onText('\n[Agent] 达到最大轮次限制\n');
  return messages;
}
