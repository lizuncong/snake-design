export type ToolCallInfo = {
  id: string;
  name: string;
  arguments: string;
  result?: string;
};

export type QuestionOption = {
  label: string;
  description?: string;
  value: string;
  isOther?: boolean;
};

export type QuestionItem = {
  id: string;
  question: string;
  header: string;
  options: QuestionOption[];
  multiSelect?: boolean;
};

export type QuestionPanelData = {
  questions: QuestionItem[];
  onAnswer: (answers: Record<string, string | string[]>) => void;
};

export type ChatMessage = {
  id: string;
  type: 'user' | 'assistant' | 'thinking' | 'tool-call' | 'tool-result' | 'system' | 'error' | 'done';
  content: string;
  toolName?: string;
  toolArgs?: string;
  isStreaming?: boolean;
  isExpanded?: boolean;
  timestamp: number;
};

export type ModelOption = {
  id: string;
  label: string;
  free?: boolean;
  context?: string;
  output?: string;
  desc?: string;
};
