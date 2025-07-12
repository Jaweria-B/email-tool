// src/lib/ai-config.js
export const AI_PROVIDERS = {
  QWEN: 'qwen',
  OPENAI: 'openai',
  DEEPSEEK: 'deepseek',
  GEMINI: 'gemini'
};

export const AI_MODELS = {
  [AI_PROVIDERS.QWEN]: 'google/gemma-3n-e4b-it',
  [AI_PROVIDERS.OPENAI]: 'gpt-4o-mini',
  [AI_PROVIDERS.DEEPSEEK]: 'deepseek-chat',
  [AI_PROVIDERS.GEMINI]: 'gemini-2.0-flash-exp'
};

export const AI_ENDPOINTS = {
  [AI_PROVIDERS.QWEN]: 'https://api.aimlapi.com/v1/chat/completions',
  [AI_PROVIDERS.OPENAI]: 'https://api.openai.com/v1/chat/completions',
  [AI_PROVIDERS.DEEPSEEK]: 'https://api.deepseek.com/v1/chat/completions',
  [AI_PROVIDERS.GEMINI]: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent'
};

export const AI_PROVIDER_INFO = {
  [AI_PROVIDERS.QWEN]: {
    name: 'QWEN (AIML)',
    description: 'Powered by QWEN-Max via AIML API',
    keyFormat: 'API Key (without Bearer prefix)',
    website: 'https://aimlapi.com'
  },
  [AI_PROVIDERS.OPENAI]: {
    name: 'OpenAI GPT-4o Mini',
    description: 'OpenAI\'s efficient GPT-4o Mini model',
    keyFormat: 'API Key (sk-...)',
    website: 'https://platform.openai.com'
  },
  [AI_PROVIDERS.DEEPSEEK]: {
    name: 'DeepSeek',
    description: 'DeepSeek\'s latest chat model',
    keyFormat: 'API Key (sk-...)',
    website: 'https://platform.deepseek.com'
  },
  [AI_PROVIDERS.GEMINI]: {
    name: 'Google Gemini',
    description: 'Google\'s Gemini 2.0 Flash model',
    keyFormat: 'API Key (AI...)',
    website: 'https://ai.google.dev'
  }
};