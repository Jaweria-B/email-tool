// src/lib/ai-config.js
export const AI_PROVIDERS = {
  QWEN: 'qwen',
  OPENAI: 'openai',
  DEEPSEEK: 'deepseek',
  GEMINI: 'gemini'
};

export const AI_MODELS = {
  [AI_PROVIDERS.QWEN]: 'alibaba/qwen-turbo',
  [AI_PROVIDERS.OPENAI]: 'openai/gpt-5-chat-latest',
  [AI_PROVIDERS.DEEPSEEK]: 'deepseek/deepseek-r1',
  [AI_PROVIDERS.GEMINI]: 'google/gemini-2.0-flash'
};

export const AI_ENDPOINTS = {
  [AI_PROVIDERS.QWEN]: 'https://api.aimlapi.com/v1/chat/completions',
  [AI_PROVIDERS.OPENAI]: 'https://api.aimlapi.com/v1/chat/completions',
  [AI_PROVIDERS.DEEPSEEK]: 'https://api.aimlapi.com/v1/chat/completions',
  [AI_PROVIDERS.GEMINI]: 'https://api.aimlapi.com/v1/chat/completions'
};

export const AI_PROVIDER_INFO = {
  [AI_PROVIDERS.QWEN]: {
    name: 'QWEN (AIML)',
    description: 'Powered by QWEN3-235B via AIML API',
    keyFormat: 'API Key',
    website: 'https://aimlapi.com'
  },
  [AI_PROVIDERS.OPENAI]: {
    name: 'OpenAI GPT-5 (AIML)',
    description: 'OpenAI\'s GPT-5 model via AIML API',
    keyFormat: 'API Key',
    website: 'https://aimlapi.com'
  },
  [AI_PROVIDERS.DEEPSEEK]: {
    name: 'DeepSeek R1 (AIML)',
    description: 'DeepSeek R1 model via AIML API',
    keyFormat: 'API Key',
    website: 'https://aimlapi.com'
  },
  [AI_PROVIDERS.GEMINI]: {
    name: 'Google Gemini (AIML)',
    description: 'Google\'s Gemini 2.0 Flash via AIML API',
    keyFormat: 'API Key',
    website: 'https://aimlapi.com'
  }
};