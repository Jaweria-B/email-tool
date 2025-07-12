// src/components/ApiSettings.js
import React from 'react';
import { ExternalLink, Key, AlertCircle } from 'lucide-react';
import { AI_PROVIDERS, AI_PROVIDER_INFO } from '../lib/ai-config';

const ApiSettings = ({ selectedProvider, apiKeys, onApiKeyChange }) => {
  const providerInfo = AI_PROVIDER_INFO[selectedProvider];

  const getInstructions = (provider) => {
    switch (provider) {
      case AI_PROVIDERS.QWEN:
        return {
          steps: [
            'Go to aimlapi.com',
            'Sign up for an account',
            'Navigate to your dashboard',
            'Copy your API key (without "Bearer " prefix)'
          ],
          note: 'Enter only your API key without the "Bearer " prefix. The app will add it automatically.'
        };
      case AI_PROVIDERS.OPENAI:
        return {
          steps: [
            'Go to platform.openai.com',
            'Sign up or log in to your account',
            'Navigate to API Keys section',
            'Create a new API key',
            'Copy your API key (starts with sk-)'
          ],
          note: 'Your API key should start with "sk-". Keep it secure and never share it publicly.'
        };
      case AI_PROVIDERS.DEEPSEEK:
        return {
          steps: [
            'Go to platform.deepseek.com',
            'Sign up for an account',
            'Navigate to API Keys section',
            'Create a new API key',
            'Copy your API key (starts with sk-)'
          ],
          note: 'DeepSeek offers competitive pricing and high-quality models. API key starts with "sk-".'
        };
      case AI_PROVIDERS.GEMINI:
        return {
          steps: [
            'Go to ai.google.dev',
            'Sign up with your Google account',
            'Navigate to API Keys section',
            'Create a new API key',
            'Copy your API key (starts with AI)'
          ],
          note: 'Your Gemini API key should start with "AI". Google offers generous free tiers.'
        };
      default:
        return { steps: [], note: '' };
    }
  };

  const instructions = getInstructions(selectedProvider);

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6 shadow-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Key className="h-6 w-6 text-white" />
        <h3 className="text-white text-xl font-semibold">
          {providerInfo.name} API Configuration
        </h3>
      </div>

      <div className="space-y-6">
        {/* API Key Input */}
        <div>
          <label className="block text-purple-100 text-sm font-medium mb-3">
            API Key ({providerInfo.keyFormat})
          </label>
          <input
            type="password"
            placeholder={`Enter your ${providerInfo.name} API key`}
            value={apiKeys[selectedProvider] || ''}
            onChange={(e) => onApiKeyChange(selectedProvider, e.target.value)}
            className="w-full bg-white/20 backdrop-blur-lg border border-white/30 rounded-xl px-4 py-3 text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent"
          />
        </div>

        {/* Instructions */}
        <div className="bg-blue-500/20 rounded-xl border border-blue-300/30 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-300 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-blue-200 text-sm font-medium mb-2">
                How to get your {providerInfo.name} API key:
              </p>
              <ol className="text-blue-200 text-sm space-y-1 list-decimal list-inside">
                {instructions.steps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
              <div className="mt-3 flex items-center gap-2">
                <ExternalLink className="h-4 w-4 text-blue-300" />
                <a 
                  href={providerInfo.website} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-300 hover:text-white text-sm underline"
                >
                  Visit {providerInfo.name} Platform
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Note */}
        {instructions.note && (
          <div className="bg-yellow-500/20 rounded-xl border border-yellow-300/30 p-4">
            <p className="text-yellow-200 text-sm">
              <strong>Note:</strong> {instructions.note}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApiSettings;