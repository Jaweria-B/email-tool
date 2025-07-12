"use client"
import React, { useState } from 'react';
import { Send, Copy, Mail, Settings, Sparkles, User, Building, MessageSquare, Clock, Heart, Briefcase, Shield, Smile } from 'lucide-react';
import { EmailGenerationService, createPrompt } from '../lib/ai-services';
import { AI_PROVIDERS, AI_PROVIDER_INFO } from '../lib/ai-config';
import ProviderSelector from '../components/ProviderSelector';
import ApiSettings from '../components/ApiSettings';
import EmailSender from '../components/EmailSender';

const EmailWriter = () => {
  const [formData, setFormData] = useState({
    rawThoughts: '',
    tone: 'professional',
    recipient: '',
    subject: '',
    context: '',
    replyingTo: '',
    priority: 'normal',
    relationship: 'professional',
    purpose: 'general',
    length: 'medium'
  });
  
  const [selectedProvider, setSelectedProvider] = useState(AI_PROVIDERS.QWEN);
  const [apiKeys, setApiKeys] = useState({
    [AI_PROVIDERS.QWEN]: '',
    [AI_PROVIDERS.OPENAI]: '',
    [AI_PROVIDERS.DEEPSEEK]: '',
    [AI_PROVIDERS.GEMINI]: ''
  });
  
  const [generatedEmail, setGeneratedEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [showEmailSender, setShowEmailSender] = useState(false);

  const tones = [
    { value: 'professional', label: 'Professional', icon: Briefcase },
    { value: 'friendly', label: 'Friendly', icon: Smile },
    { value: 'formal', label: 'Formal', icon: Shield },
    { value: 'warm', label: 'Warm', icon: Heart },
    { value: 'concise', label: 'Concise', icon: Clock },
    { value: 'enthusiastic', label: 'Enthusiastic', icon: Sparkles }
  ];

  const priorities = [
    { value: 'low', label: 'Low Priority' },
    { value: 'normal', label: 'Normal' },
    { value: 'high', label: 'High Priority' },
    { value: 'urgent', label: 'Urgent' }
  ];

  const relationships = [
    { value: 'professional', label: 'Professional Colleague' },
    { value: 'client', label: 'Client/Customer' },
    { value: 'manager', label: 'Manager/Boss' },
    { value: 'friend', label: 'Friend' },
    { value: 'unknown', label: 'First Contact' }
  ];

  const purposes = [
    { value: 'general', label: 'General Communication' },
    { value: 'request', label: 'Making a Request' },
    { value: 'follow-up', label: 'Follow-up' },
    { value: 'thank-you', label: 'Thank You' },
    { value: 'apology', label: 'Apology' },
    { value: 'invitation', label: 'Invitation' },
    { value: 'complaint', label: 'Complaint/Issue' },
    { value: 'proposal', label: 'Proposal/Pitch' }
  ];

  const lengths = [
    { value: 'short', label: 'Short (1-2 paragraphs)' },
    { value: 'medium', label: 'Medium (3-4 paragraphs)' },
    { value: 'long', label: 'Long (5+ paragraphs)' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleProviderChange = (provider) => {
    setSelectedProvider(provider);
  };

  const handleApiKeyChange = (provider, apiKey) => {
    setApiKeys(prev => ({
      ...prev,
      [provider]: apiKey
    }));
  };

  const generateEmail = async () => {
    const currentApiKey = apiKeys[selectedProvider];
    
    if (!currentApiKey) {
      alert(`Please enter your ${AI_PROVIDER_INFO[selectedProvider].name} API key in settings`);
      return;
    }

    if (!formData.rawThoughts.trim()) {
      alert('Please enter your thoughts about what you want to say');
      return;
    }

    setIsLoading(true);
    
    try {
      const emailService = new EmailGenerationService(selectedProvider, currentApiKey);
      const prompt = createPrompt(formData);
      const result = await emailService.generateEmail(prompt);
      setGeneratedEmail(result);
    } catch (error) {
      console.error('Error generating email:', error);
      alert(`Error generating email: ${error.message}. Please check your API key and try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedEmail);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const openEmailSender = () => {
    if (!generatedEmail) {
      alert('Please generate an email first before sending');
      return;
    }
    setShowEmailSender(true);
  };

  if (showEmailSender) {
    return (
      <EmailSender 
        generatedEmail={generatedEmail}
        onBack={() => setShowEmailSender(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-white/20 backdrop-blur-lg rounded-full p-4 border border-white/30">
              <Mail className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
            Email<span className="bg-gradient-to-r from-pink-300 to-purple-300 bg-clip-text text-transparent">Craft</span>
          </h1>
          <p className="text-purple-100 text-xl max-w-2xl mx-auto leading-relaxed">
            Transform your thoughts into perfectly crafted emails with multiple AI providers
          </p>
          
          {/* Settings Button */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="mt-6 bg-white/20 backdrop-blur-lg text-white px-6 py-2 rounded-full border border-white/30 hover:bg-white/30 transition-all duration-300 flex items-center gap-2 mx-auto"
          >
            <Settings className="h-4 w-4" />
            API Settings
          </button>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="mb-8">
            <ApiSettings
              selectedProvider={selectedProvider}
              apiKeys={apiKeys}
              onApiKeyChange={handleApiKeyChange}
            />
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Input Section */}
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
              <MessageSquare className="h-6 w-6" />
              Email Details
            </h2>
            
            <div className="space-y-6">
              {/* AI Provider Selection */}
              <ProviderSelector
                selectedProvider={selectedProvider}
                onProviderChange={handleProviderChange}
              />

              {/* Raw Thoughts */}
              <div>
                <label className="block text-purple-100 text-sm font-medium mb-3">
                  What do you want to say? *
                </label>
                <textarea
                  value={formData.rawThoughts}
                  onChange={(e) => handleInputChange('rawThoughts', e.target.value)}
                  placeholder="e.g., Need to follow up on the project deadline, want to sound professional but not pushy..."
                  rows={4}
                  className="w-full bg-white/20 backdrop-blur-lg border border-white/30 rounded-xl px-4 py-3 text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent resize-none"
                />
              </div>

              {/* Recipient */}
              <div>
                <label className="block text-purple-100 text-sm font-medium mb-3">
                  <User className="h-4 w-4 inline mr-1" />
                  Recipient
                </label>
                <input
                  type="text"
                  value={formData.recipient}
                  onChange={(e) => handleInputChange('recipient', e.target.value)}
                  placeholder="e.g., John Smith, Sarah from Marketing"
                  className="w-full bg-white/20 backdrop-blur-lg border border-white/30 rounded-xl px-4 py-3 text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent"
                />
              </div>

              {/* Subject Context */}
              <div>
                <label className="block text-purple-100 text-sm font-medium mb-3">
                  Subject Context
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                  placeholder="e.g., Project update, Meeting request, Follow-up"
                  className="w-full bg-white/20 backdrop-blur-lg border border-white/30 rounded-xl px-4 py-3 text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent"
                />
              </div>

              {/* Tone Selection */}
              <div>
                <label className="block text-purple-100 text-sm font-medium mb-3">
                  Tone
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {tones.map((tone) => {
                    const IconComponent = tone.icon;
                    return (
                      <button
                        key={tone.value}
                        onClick={() => handleInputChange('tone', tone.value)}
                        className={`p-3 rounded-xl border transition-all duration-300 flex items-center gap-2 ${
                          formData.tone === tone.value
                            ? 'bg-purple-500/50 border-purple-300 text-white'
                            : 'bg-white/10 border-white/20 text-purple-100 hover:bg-white/20'
                        }`}
                      >
                        <IconComponent className="h-4 w-4" />
                        <span className="text-sm font-medium">{tone.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Relationship */}
              <div>
                <label className="block text-purple-100 text-sm font-medium mb-3">
                  Relationship with Recipient
                </label>
                <select
                  value={formData.relationship}
                  onChange={(e) => handleInputChange('relationship', e.target.value)}
                  className="w-full bg-white/20 backdrop-blur-lg border border-white/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent"
                >
                  {relationships.map((rel) => (
                    <option key={rel.value} value={rel.value} className="bg-purple-800">
                      {rel.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Purpose */}
              <div>
                <label className="block text-purple-100 text-sm font-medium mb-3">
                  Email Purpose
                </label>
                <select
                  value={formData.purpose}
                  onChange={(e) => handleInputChange('purpose', e.target.value)}
                  className="w-full bg-white/20 backdrop-blur-lg border border-white/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent"
                >
                  {purposes.map((purpose) => (
                    <option key={purpose.value} value={purpose.value} className="bg-purple-800">
                      {purpose.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority and Length */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-purple-100 text-sm font-medium mb-3">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => handleInputChange('priority', e.target.value)}
                    className="w-full bg-white/20 backdrop-blur-lg border border-white/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent"
                  >
                    {priorities.map((priority) => (
                      <option key={priority.value} value={priority.value} className="bg-purple-800">
                        {priority.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-purple-100 text-sm font-medium mb-3">
                    Length
                  </label>
                  <select
                    value={formData.length}
                    onChange={(e) => handleInputChange('length', e.target.value)}
                    className="w-full bg-white/20 backdrop-blur-lg border border-white/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent"
                  >
                    {lengths.map((length) => (
                      <option key={length.value} value={length.value} className="bg-purple-800">
                        {length.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Additional Context */}
              <div>
                <label className="block text-purple-100 text-sm font-medium mb-3">
                  Additional Context
                </label>
                <textarea
                  value={formData.context}
                  onChange={(e) => handleInputChange('context', e.target.value)}
                  placeholder="Any additional context, background information, or specific requirements..."
                  rows={3}
                  className="w-full bg-white/20 backdrop-blur-lg border border-white/30 rounded-xl px-4 py-3 text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent resize-none"
                />
              </div>

              {/* Replying To (Optional) */}
              <div>
                <label className="block text-purple-100 text-sm font-medium mb-3">
                  Replying to this email (optional)
                </label>
                <textarea
                  value={formData.replyingTo}
                  onChange={(e) => handleInputChange('replyingTo', e.target.value)}
                  placeholder="Paste the email you're replying to here..."
                  rows={4}
                  className="w-full bg-white/20 backdrop-blur-lg border border-white/30 rounded-xl px-4 py-3 text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent resize-none"
                />
              </div>

              {/* Generate Button */}
              <button
                onClick={generateEmail}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3 shadow-lg"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Crafting with {AI_PROVIDER_INFO[selectedProvider].name}...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    Generate Email with {AI_PROVIDER_INFO[selectedProvider].name}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Output Section */}
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <Send className="h-6 w-6" />
                Generated Email
              </h2>
              <div className="flex gap-2">
                {generatedEmail && (
                  <>
                    <button
                      onClick={copyToClipboard}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                        copySuccess
                          ? 'bg-green-500/50 text-green-100'
                          : 'bg-white/20 hover:bg-white/30 text-white'
                      }`}
                    >
                      <Copy className="h-4 w-4" />
                      {copySuccess ? 'Copied!' : 'Copy'}
                    </button>
                    <button
                      onClick={openEmailSender}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white transition-all duration-300"
                    >
                      <Send className="h-4 w-4" />
                      Send Email
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6 min-h-[400px]">
              {generatedEmail ? (
                <div className="text-white whitespace-pre-wrap leading-relaxed">
                  {generatedEmail}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-purple-200">
                  <div className="text-center">
                    <Mail className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">Your generated email will appear here</p>
                    <p className="text-sm opacity-75">Select an AI provider, fill in the details and click "Generate Email"</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-purple-200 text-sm">
            Powered by {AI_PROVIDER_INFO[selectedProvider].name} • 
            <a href={AI_PROVIDER_INFO[selectedProvider].website} target="_blank" rel="noopener noreferrer" className="text-purple-300 hover:text-white ml-1">
              Get your API key
            </a>
          </p>
          <p className="text-purple-300 text-xs mt-2">
            Multi-AI email generation with professional quality results
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailWriter;