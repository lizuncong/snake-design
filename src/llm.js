// llm.js — 智谱 AI (GLM) 原生调用
// 直接使用 OpenAI 兼容协议，不做任何格式转换

const ZHIPU_API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';

export const MODEL_LIST = [
  { id: 'glm-4-flash', label: 'GLM-4 Flash (快速)' },
  { id: 'glm-4-air', label: 'GLM-4 Air (轻量)' },
  { id: 'glm-4-plus', label: 'GLM-4 Plus (增强)' },
  { id: 'glm-4', label: 'GLM-4 (标准)' },
  { id: 'glm-4-alltools', label: 'GLM-4 AllTools' },
];

const STORAGE_KEY = 'zhipu_api_key';
const MODEL_STORAGE_KEY = 'zhipu_model';

export function getApiKey() {
  return localStorage.getItem(STORAGE_KEY) || '';
}

export function setApiKey(key) {
  localStorage.setItem(STORAGE_KEY, key);
}

export function hasApiKey() {
  return !!getApiKey();
}

export function getModel() {
  return localStorage.getItem(MODEL_STORAGE_KEY) || 'glm-4-flash';
}

export function setModel(model) {
  localStorage.setItem(MODEL_STORAGE_KEY, model);
}

/**
 * 调用智谱 AI API（非流式）
 * @param {Array} messages - OpenAI 格式消息数组
 * @param {Array} tools - 工具定义数组（OpenAI function calling 格式 [{type:"function",function:{name,description,parameters}}]）
 * @param {string} systemPrompt - 系统提示词
 * @returns {Promise<object>} 原始 API 响应
 */
export async function callZhipuAPI(messages, tools, systemPrompt, options = {}) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('未设置智谱 AI API Key，请先在页面顶部设置');
  }

  const body = {
    model: options.model || getModel(),
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages,
    ],
    max_tokens: options.maxTokens || 64000,
    temperature: options.temperature ?? 0.7,
  };

  if (tools && tools.length > 0) {
    body.tools = tools;
    body.tool_choice = 'auto';
  }

  const resp = await fetch(ZHIPU_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const errorBody = await resp.text();
    let errorMsg = `API 请求失败 (${resp.status})`;
    try {
      const errJson = JSON.parse(errorBody);
      errorMsg = errJson.error?.message || errJson.message || errorMsg;
    } catch {}
    throw new Error(errorMsg);
  }

  return await resp.json();
}
