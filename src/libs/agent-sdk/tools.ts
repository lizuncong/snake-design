import type { DesignFile, FileStore } from './file-store';
import type { SnipRecord, ToolDefinition } from './types';

/** 暂停型工具的返回标记，agent 循环检测到此值后中断执行，等待用户响应 */
export const PAUSE_SIGNAL = '__PAUSE__';

let msgIdCounter = 0;

export function createTools(fileStore: FileStore): ToolDefinition[] {
  const fsTools: ToolDefinition[] = [
    {
      name: 'write_file',
      description: `Write content to a file in the project. Creates parent directories automatically.
Supports all file types: HTML pages, JSX React components, and any text files.

⚠️ MANDATORY DIRECTORY STRUCTURE - you MUST follow this strictly:
- Page components (screen-*.jsx) → path must start with "pages/"  (e.g. "pages/screen-home.jsx")
- UI components (Button, Card, Modal...) → path must start with "components/"  (e.g. "components/Button.jsx")
- IconLibrary → "components/IconLibrary.jsx"
- Entry HTML → "index.html" (root only)

For React projects: write index.html as entry point (with React + Babel CDN scripts), then write components/*.jsx and pages/*.jsx separately.
In index.html, reference files with correct paths: src="./components/Button.jsx" or src="./pages/screen-home.jsx"
Overwrites if file already exists.`,
      input_schema: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'File path relative to project root, e.g. "components/Button.jsx"' },
          content: { type: 'string', description: 'The file content to write' },
        },
        required: ['path', 'content'],
      },
      async execute({ path, content }: Record<string, unknown>) {
        return fileStore.writeFile(path as string, content as string);
      },
    },
    {
      name: 'read_file',
      description: 'Read the content of a file. Returns the full text content. If the file doesn\'t exist, returns an error message.',
      input_schema: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'File path to read' },
        },
        required: ['path'],
      },
      async execute({ path }: Record<string, unknown>) {
        return fileStore.readFile(path as string);
      },
    },
    {
      name: 'list_files',
      description: 'List all files in the project. Returns a flat list of file paths.',
      input_schema: {
        type: 'object',
        properties: {},
      },
      async execute() {
        const files = fileStore.listFiles();
        if (files.length === 0) {
          return '(empty project)';
        }
        return files.join('\n');
      },
    },
  ];

  const snipTool: ToolDefinition = {
    name: 'snip',
    description: `Mark a range of conversation history for deferred removal.

Each user message ends with an [id:mNNNN] tag. Copy the exact tag values as from_id and to_id. Both IDs are inclusive.

Snips is a REGISTRATION system, not immediate deletion. Registering is cheap and non-destructive — messages stay visible until context pressure builds. Register aggressively and early.`,
    input_schema: {
      type: 'object',
      properties: {
        from_id: { type: 'string', description: 'The [id:...] tag of the first user message to snip, inclusive' },
        to_id: { type: 'string', description: 'The [id:...] tag of the last user message to snip, inclusive' },
        reason: { type: 'string', description: 'Brief note on why this range is no longer needed' },
      },
      required: ['from_id', 'to_id'],
    },
    async execute() {
      return ''; // handled in agent loop
    },
  };

  const askUserQuestionTool: ToolDefinition = {
    name: 'ask_user_question',
    description: [
      'Ask the user a set of design-related questions before starting any design work.',
      '',
      'Use this tool when you need to gather design requirements, preferences, or decisions from the user.',
      'All questions must be included in a SINGLE call — do NOT call this tool multiple times.',
      '',
      'The frontend will display an interactive question panel with options for each question.',
      'After the user selects their answers, they will be submitted back to you as a summary.',
      'You should then use those answers to inform your design decisions.',
    ].join('\n'),
    input_schema: {
      type: 'object',
      properties: {
        questions: {
          type: 'array',
          description: 'Array of questions to ask the user. Each question has id, question text, category header, options, and optional multiSelect flag.',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', description: 'Unique identifier for this question (e.g., "product_type", "visual_style")' },
              question: { type: 'string', description: 'The full question text to display to the user' },
              header: { type: 'string', description: 'Short category label shown above the question (e.g., "产品类型", "视觉风格")' },
              options: {
                type: 'array',
                description: 'Available options for the user to choose from (2-6 options recommended)',
                items: {
                  type: 'object',
                  properties: {
                    label: { type: 'string', description: 'Display text for the option' },
                    value: { type: 'string', description: 'Internal value for this option' },
                    description: { type: 'string', description: 'Optional supplementary explanation for the option' },
                  },
                  required: ['label', 'value'],
                },
              },
              multiSelect: { type: 'boolean', description: 'Whether the user can select multiple options for this question. Defaults to false (single select).' },
            },
            required: ['id', 'question', 'header', 'options'],
          },
        },
      },
      required: ['questions'],
    },
    async execute() {
      return PAUSE_SIGNAL;
    },
  };

  return [...fsTools, snipTool, askUserQuestionTool];
}

const registeredSnips: SnipRecord[] = [];

export function registerSnip(fromId: string, toId: string, reason: string): void {
  registeredSnips.push({ fromId, toId, reason });
}

export function executeSnips(
  messages: Array<{ role: string; content: string | Array<Record<string, unknown>> }>,
): Set<string> {
  if (registeredSnips.length === 0) {
    return new Set();
  }

  const idsToRemove = new Set<string>();
  for (const snip of registeredSnips) {
    let removing = false;
    for (const msg of messages) {
      if (msg.role !== 'user') {
        continue;
      }
      const id = extractMsgId(typeof msg.content === 'string' ? msg.content : '');
      if (id === snip.fromId) {
        removing = true;
      }
      if (removing && id !== null) {
        idsToRemove.add(id);
      }
      if (id === snip.toId) {
        removing = false;
        break;
      }
    }
  }
  registeredSnips.length = 0;
  return idsToRemove;
}

export function trimMessages<T extends { role: string; content: string | Array<Record<string, unknown>> }>(
  messages: T[],
  idsToRemove: Set<string>,
): T[] {
  if (idsToRemove.size === 0) {
    return messages;
  }

  let removedCount = 0;
  const result: T[] = [];
  for (const msg of messages) {
    if (msg.role !== 'user') {
      result.push(msg);
      continue;
    }
    const id = extractMsgId(typeof msg.content === 'string' ? msg.content : '');
    if (id && idsToRemove.has(id)) {
      removedCount++;
      continue;
    }
    result.push(msg);
  }

  if (removedCount > 0) {
    result.unshift({
      role: 'user',
      content: `<dropped_messages count="${removedCount}">The preceding ${removedCount} message(s) were removed from the transcript to fit the context window.</dropped_messages>`,
    } as T);
  }
  return result;
}

export function tagUserMessage(content: string): string {
  const id = `m${String(++msgIdCounter).padStart(4, '0')}`;
  return `${content}\n[id:${id}]`;
}

export function extractMsgId(content: string): string | null {
  const match = content.match(/\[id:(m\d+)\]/);
  if (match && match[1]) {
    return match[1];
  }
  return null;
}

export { type DesignFile, FileStore };
