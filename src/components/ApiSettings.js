import React, { useState } from 'react';
import { Settings, X, ExternalLink, Star, Crown, Zap, Cpu, Eye, EyeOff } from 'lucide-react';


const AI_PROVIDER_DETAILS = {
  gemini: {
    name: 'Google Gemini',
    label: 'FREE ⭐',
    subtitle: 'Recommended for Beginners',
    bestFor: 'General purpose emails, quick responses, everyday communication',
    strengths: 'Fast processing, reliable performance, multilingual support',
    freeInfo: '60 requests per minute, 1500 requests per day',
    pricing: 'FREE',
    buttonText: 'Get Free API Key',
    website: 'https://aistudio.google.com/app/apikey',
    icon: Star,
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-500/20',
    borderColor: 'border-green-400'
  },
  qwen: {
    name: 'QWEN (AIML)',
    label: 'PROFESSIONAL',
    subtitle: 'Professional Business Communications',
    bestFor: 'Professional business communications, technical content',
    strengths: 'Highly accurate, context-aware responses',
    freeInfo: null,
    pricing: 'Subscription-based service',
    buttonText: 'Visit AIML Platform',
    website: 'https://aimlapi.com',
    icon: Crown,
    color: 'from-purple-500 to-indigo-500',
    bgColor: 'bg-purple-500/20',
    borderColor: 'border-purple-400'
  },
  openai: {
    name: 'OpenAI GPT-4o Mini',
    label: 'CREATIVE',
    subtitle: 'Creative Writing & Versatile Content',
    bestFor: 'Creative writing, casual communications, versatile content',
    strengths: 'Natural language processing, creative flexibility',
    freeInfo: null,
    pricing: '~$0.00015 per 1K input tokens',
    buttonText: 'Visit OpenAI Platform',
    website: 'https://platform.openai.com',
    icon: Zap,
    color: 'from-pink-500 to-rose-500',
    bgColor: 'bg-pink-500/20',
    borderColor: 'border-pink-400'
  },
  deepseek: {
    name: 'DeepSeek',
    label: 'TECHNICAL',
    subtitle: 'Technical Writing & Analysis',
    bestFor: 'Technical writing, analytical content, detailed responses',
    strengths: 'Deep reasoning capabilities, structured responses',
    freeInfo: null,
    pricing: 'Credit-based system',
    buttonText: 'Visit DeepSeek Platform',
    website: 'https://platform.deepseek.com',
    icon: Cpu,
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-500/20',
    borderColor: 'border-blue-400'
  }
};

const ApiSettings = ({ selectedProvider, apiKeys, onApiKeyChange }) => {
  const [showSettings, setShowSettings] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  
  const currentProvider = AI_PROVIDER_DETAILS[selectedProvider] || AI_PROVIDER_DETAILS.gemini;
  const IconComponent = currentProvider.icon;

  const handleApiKeyChange = (value) => {
    onApiKeyChange(selectedProvider, value);
  };

  if (!showSettings) {
    return (
      <div className="fixed top-6 left-6 z-40">
        <button
          onClick={() => setShowSettings(true)}
          className="bg-white/20 backdrop-blur-lg text-white px-4 py-2 rounded-full border border-white/30 hover:bg-white/30 transition-all duration-300 flex items-center gap-2 shadow-lg"
        >
          <Settings className="h-4 w-4" />
          <span className="hidden sm:inline">API Settings</span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed top-6 left-6 z-50">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6 shadow-2xl w-96 max-w-[90vw]">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Settings className="h-5 w-5" />
            API Settings
          </h3>
          <button
            onClick={() => setShowSettings(false)}
            className="p-1 rounded-lg hover:bg-white/20 transition-colors text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Current Provider Info */}
        <div className={`${currentProvider.bgColor} backdrop-blur-lg rounded-xl border ${currentProvider.borderColor} p-4 mb-6`}>
          <div className="flex items-start gap-3 mb-3">
            <div className={`p-2 rounded-lg bg-gradient-to-r ${currentProvider.color}`}>
              <IconComponent className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-bold text-white">{currentProvider.name}</h4>
                <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                  currentProvider.label === 'FREE ⭐' 
                    ? 'bg-green-500 text-white' 
                    : currentProvider.label === 'DEFAULT'
                    ? 'bg-purple-500 text-white'
                    : currentProvider.label === 'CREATIVE'
                    ? 'bg-pink-500 text-white'
                    : 'bg-blue-500 text-white'
                }`}>
                  {currentProvider.label}
                </span>
              </div>
              <p className="text-purple-200 text-sm font-medium">{currentProvider.subtitle}</p>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            {/* <div>
              <span className="text-purple-200 font-medium">Best For:</span>
              <p className="text-white">{currentProvider.bestFor}</p>
            </div>
            <div>
              <span className="text-purple-200 font-medium">Strengths:</span>
              <p className="text-white">{currentProvider.strengths}</p>
            </div> */}
            {currentProvider.freeInfo && (
              <div>
                <span className="text-green-300 font-medium">Free Tier:</span>
                <p className="text-green-100">{currentProvider.freeInfo}</p>
              </div>
            )}
            <div>
              <span className="text-purple-200 font-medium">Pricing:</span>
              <p className={`font-semibold ${currentProvider.pricing === 'FREE' ? 'text-green-300' : 'text-white'}`}>
                {currentProvider.pricing}
              </p>
            </div>
          </div>

          {/* Visit Provider Button */}
          <a
            href={currentProvider.website}
            target="_blank"
            rel="noopener noreferrer"
            className={`mt-4 w-full bg-gradient-to-r ${currentProvider.color} hover:shadow-lg text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-md`}
          >
            <ExternalLink className="h-4 w-4" />
            {currentProvider.buttonText}
          </a>
        </div>

        {/* API Key Input */}
        <div className="space-y-3">
          <label className="block text-purple-100 text-sm font-medium">
            Enter your {currentProvider.name} API Key
          </label>
          <div className="relative">
            <input
              type={showApiKey ? "text" : "password"}
              value={apiKeys[selectedProvider] || ''}
              onChange={(e) => handleApiKeyChange(e.target.value)}
              placeholder="Paste your API key here..."
              className="w-full bg-white/20 backdrop-blur-lg border border-white/30 rounded-lg px-4 py-2.5 pr-12 text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent text-sm"
            />
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-200 hover:text-white transition-colors"
            >
              {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Generation Guide Link */}
        <div className="mt-6 pt-4 border-t border-white/20">
          <a
            href="https://uinfo.org/email-craft/emailcraft-sending-guide/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-white/20 hover:bg-white/30 text-white py-2.5 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 text-sm font-medium border border-white/30"
          >
            <ExternalLink className="h-4 w-4" />
            Complete Email Generation Guide
          </a>
        </div>

        {/* Quick Status */}
        <div className="mt-4 text-center">
          <p className="text-xs text-purple-200">
            {apiKeys[selectedProvider] ? (
              <span className="text-green-300">✓ API Key configured</span>
            ) : (
              <span className="text-yellow-300">⚠ API Key required</span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ApiSettings;