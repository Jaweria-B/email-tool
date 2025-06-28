"use client"
import React, { useState } from 'react';
import { Send, Copy, Mail, Settings, Sparkles, User, Building, MessageSquare, Clock, Heart, Briefcase, Shield, Smile } from 'lucide-react';

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
  const [generatedEmail, setGeneratedEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

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

  const generateEmail = async () => {
    if (!apiKey) {
      alert('Please enter your AIML API key in settings');
      return;
    }

    if (!formData.rawThoughts.trim()) {
      alert('Please enter your thoughts about what you want to say');
      return;
    }

    setIsLoading(true);
    
    try {
      const prompt = `Transform the following raw thoughts into a well-written email:

Raw thoughts: ${formData.rawThoughts}

Email Details:
- Tone: ${formData.tone}
- Recipient: ${formData.recipient || 'Not specified'}
- Subject context: ${formData.subject || 'Not specified'}
- Relationship: ${formData.relationship}
- Purpose: ${formData.purpose}
- Priority: ${formData.priority}
- Desired length: ${formData.length}
- Additional context: ${formData.context || 'None'}
${formData.replyingTo ? `- Replying to this email: ${formData.replyingTo}` : ''}

Please write a ${formData.tone} email that is ${formData.length} in length. Make it appropriate for the relationship type (${formData.relationship}) and purpose (${formData.purpose}). ${formData.priority === 'urgent' ? 'This is urgent, so make that clear.' : ''} ${formData.priority === 'high' ? 'This has high priority.' : ''}

Return only the email content without any additional commentary.`;

      // Correct AIML API implementation
      const response = await fetch('https://api.aimlapi.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}` // Remove 'Bearer ' prefix if it's already in the API key
        },
        body: JSON.stringify({
          model: 'google/gemma-3n-e4b-it', // Using qwen-max model
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1000,
          temperature: 0.7,
          top_p: 0.7,
          frequency_penalty: 0.5
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        throw new Error(`API request failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      // Check if response has the expected structure
      if (data.choices && data.choices[0] && data.choices[0].message) {
        setGeneratedEmail(data.choices[0].message.content);
      } else {
        console.error('Unexpected API response:', data);
        throw new Error('Unexpected response format from API');
      }
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
            Transform your thoughts into perfectly crafted emails with AI-powered writing assistance
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
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6 mb-8 shadow-2xl">
            <h3 className="text-white text-xl font-semibold mb-4">AIML API Configuration</h3>
            <input
              type="password"
              placeholder="Enter your AIML API key (without 'Bearer ' prefix)"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full bg-white/20 backdrop-blur-lg border border-white/30 rounded-xl px-4 py-3 text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent"
            />
            <div className="mt-4 p-4 bg-blue-500/20 rounded-xl border border-blue-300/30">
              <p className="text-blue-200 text-sm mb-2">
                <strong>How to get your API key:</strong>
              </p>
              <ol className="text-blue-200 text-sm space-y-1 list-decimal list-inside">
                <li>Go to <a href="https://aimlapi.com" target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:text-white underline">aimlapi.com</a></li>
                <li>Sign up for an account</li>
                <li>Navigate to your dashboard</li>
                <li>Copy your API key (just the key, not including "Bearer ")</li>
              </ol>
            </div>
            <p className="text-purple-200 text-xs mt-2">
              Note: Enter only your API key without the "Bearer " prefix. The app will add it automatically.
            </p>
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
                    Crafting your email...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    Generate Email
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
              {generatedEmail && (
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
              )}
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
                    <p className="text-sm opacity-75">Fill in the details and click "Generate Email"</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-purple-200 text-sm">
            Powered by QWEN-Max AI via AIML API • 
            <a href="https://aimlapi.com" target="_blank" rel="noopener noreferrer" className="text-purple-300 hover:text-white ml-1">
              Get your API key
            </a>
          </p>
          <p className="text-purple-300 text-xs mt-2">
            Using qwen-max model for high-quality email generation
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailWriter;