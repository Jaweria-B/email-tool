// src/lib/ai-config.js
export const AI_PROVIDERS = {
  GEMINI: 'gemini'
};

export const AI_MODELS = {
  [AI_PROVIDERS.GEMINI]: 'google/gemini-2.0-flash'
};

export const AI_ENDPOINTS = {
  [AI_PROVIDERS.GEMINI]: 'https://api.aimlapi.com/v1/chat/completions'
};

export const AI_PROVIDER_INFO = {
  [AI_PROVIDERS.GEMINI]: {
    name: 'Google Gemini (AIML)',
    description: 'Google\'s Gemini 2.0 Flash via AIML API',
    keyFormat: 'API Key',
    website: 'https://aimlapi.com'
  }
};