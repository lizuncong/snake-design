import type { ModelOption } from './types';

export const MODEL_LIST: ModelOption[] = [
  { id: 'glm-4-flash', label: 'GLM-4 Flash (快速)' },
  { id: 'glm-4-air', label: 'GLM-4 Air (轻量)' },
  { id: 'glm-4-plus', label: 'GLM-4 Plus (增强)' },
  { id: 'glm-4', label: 'GLM-4 (标准)' },
  { id: 'glm-4-alltools', label: 'GLM-4 AllTools' },
  { id: 'glm-5v-turbo', label: 'GLM-5V-Turbo' },
];

export const ZHIPU_API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';

export const STORAGE_KEYS = {
  API_KEY: 'zhipu_api_key',
  MODEL: 'zhipu_model',
} as const;

export const MAX_TOKENS = 96000;
export const TOKEN_PER_CHAR = 0.3;
export const MAX_TURNS = 100;
