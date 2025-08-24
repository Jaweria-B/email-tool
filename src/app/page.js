"use client"
import React, { useState } from 'react';
import { Send, Copy, Mail, Settings, Sparkles, User, Building, MessageSquare, Clock, Heart, Briefcase, Shield, Smile, LogOut, UserPlus, LogIn, Users } from 'lucide-react';
import { EmailGenerationService, createPrompt } from '../lib/ai-services';
import { AI_PROVIDERS, AI_PROVIDER_INFO } from '../lib/ai-config';
import ProviderSelector from '../components/ProviderSelector';
import ApiSettings from '../components/ApiSettings';
import EmailSender from '../components/EmailSender';
import { useRouter } from 'next/navigation';
import { useEffect, useCallback  } from 'react';
import Footer from '@/components/Footer';
import EmailGenerationFeedback from '@/components/EmailGenerationFeedback';
import EmailSenderFeedback from '@/components/EmailSenderFeedback';
import FloatingGenerationGuide from '@/components/GenerationGuide';
import EmailOpener from '@/components/EmailOpener';
import AnimatedEmailStats from '@/components/AnimatedEmailStats';

const EmailWriter = () => {
  const [user, setUser] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const router = useRouter();

  const [formData, setFormData] = useState({
    rawThoughts: '',
    tone: 'professional',
    recipient: '',
    senderName: '',
    subject: '',
    context: '',
    replyingTo: '',
    priority: 'normal',
    relationship: 'professional',
    purpose: 'general',
    length: 'medium'
  });
  
  const loadUserData = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setIsLoadingUser(false);
    }
  };

  // Load user data on mount, but don't redirect
  useEffect(() => {
    loadUserData();
  }, []);

  const [selectedProvider, setSelectedProvider] = useState(AI_PROVIDERS.GEMINI);
  const [apiKeys, setApiKeys] = useState({
    [AI_PROVIDERS.QWEN]: '',
    [AI_PROVIDERS.OPENAI]: '',
    [AI_PROVIDERS.DEEPSEEK]: '',
    [AI_PROVIDERS.GEMINI]: ''
  });
  
  const [generatedEmail, setGeneratedEmail] = useState({
    subject: '',
    body: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [showEmailSender, setShowEmailSender] = useState(false);
  const [showGenerationFeedback, setShowGenerationFeedback] = useState(false);
  const [showSenderFeedback, setShowSenderFeedback] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

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
    // Check if user is authenticated before generating email
    if (!user) {
      if (confirm('You need to sign in to generate emails. Would you like to sign in now?')) {
        router.push('/login');
      }
      return;
    }

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
      // Result contains { subject: "...", body: "..." }
      setGeneratedEmail(result);
      // Save activity to database
      await saveEmailActivity(result);
      setTimeout(() => {
        setShowGenerationFeedback(true);
      }, 1500);
    } catch (error) {
      console.error('Error generating email:', error);
      alert(`Error generating email: ${error.message}. Please check your API key and try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      const fullEmail = `Subject: ${generatedEmail.subject}\n\n${generatedEmail.body}`;
      await navigator.clipboard.writeText(fullEmail);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const openEmailSender = () => {
    if (!generatedEmail.subject || !generatedEmail.body) {
      alert('Please generate an email first before sending');
      return;
    }
    setShowEmailSender(true);
  };

  const saveEmailActivity = async (emailData) => {
    try {
      await fetch('/api/email-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: emailData.subject,
          body: emailData.body,
          recipient: formData.recipient,
          tone: formData.tone,
          ai_provider: selectedProvider,
          purpose: formData.purpose,
          priority: formData.priority,
          status: 'generated'
        }),
      });
    } catch (error) {
      console.error('Failed to save email activity:', error);
    }
  };

  const handleGenerationFeedback = async (feedbackData) => {
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'email_generation',
          feedback: feedbackData,
          ai_provider: selectedProvider,
          user_id: user?.id
        }),
      });
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    }
  };

  const handleSenderFeedback = async (feedbackData) => {
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'email_sender',
          feedback: feedbackData,
          email_sent: emailSent,
          user_id: user?.id
        }),
      });
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null); // Clear user state
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (showEmailSender) {
    return (
      <>
        <EmailSender 
          subject={generatedEmail.subject}
          body={generatedEmail.body}
          onBack={() => setShowEmailSender(false)}
          onEmailSent={(success) => {
          setEmailSent(success);
            // Show feedback after email sending attempt
            setTimeout(() => {
              setShowSenderFeedback(true);
            }, 1000);
          }}
        />
        <Footer/>
        {/* Render sender feedback on top of sender page */}
        {showSenderFeedback && (
          <EmailSenderFeedback
            onClose={() => setShowSenderFeedback(false)} // Only close feedback
            emailSent={emailSent}
            onSubmit={handleSenderFeedback}
          />
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800">
      <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            {/* Profile/Auth Section - Top Right */}
            <div className="fixed top-6 right-6 z-50">
              {!isLoadingUser && user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowProfile(!showProfile)}
                    className="bg-white/20 backdrop-blur-lg text-white px-4 py-2 rounded-full border border-white/30 hover:bg-white/30 transition-all duration-300 flex items-center gap-2"
                  >
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">{user.name}</span>
                  </button>
                  
                  {/* Profile Dropdown */}
                  {showProfile && (
                    <div className="absolute right-0 mt-2 w-64 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-4 shadow-2xl">
                      <div className="text-white space-y-3">
                        <div className="border-b border-white/20 pb-3">
                          <p className="font-semibold">{user.name}</p>
                          <p className="text-sm text-purple-200">{user.email}</p>
                          {user.company && <p className="text-xs text-purple-300">{user.company}</p>}
                          {user.job_title && <p className="text-xs text-purple-300">{user.job_title}</p>}
                        </div>
                        <button
                          onClick={() => router.push('/dashboard')}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2"
                        >
                          <Building className="h-4 w-4" />
                          Dashboard
                        </button>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2 text-red-200"
                        >
                          <LogOut className="h-4 w-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : !isLoadingUser ? (
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => router.push('/login')}
                    className="bg-white/20 backdrop-blur-lg text-white px-4 py-2 rounded-full border border-white/30 hover:bg-white/30 transition-all duration-300 flex items-center gap-2 justify-center"
                  >
                    <LogIn className="h-4 w-4" />
                    Sign In
                  </button>
                  <button
                    onClick={() => router.push('/register')}
                    className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white px-4 py-2 rounded-full transition-all duration-300 flex items-center gap-2 justify-center"
                  >
                    <UserPlus className="h-4 w-4" />
                    Register
                  </button>
                </div>
              ) : null}
            </div>

            <div className="flex items-center justify-center mb-6">
              <div className="bg-white/20 backdrop-blur-lg rounded-full p-4 border border-white/30">
                <Mail className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
              Email<span className="bg-gradient-to-r from-pink-300 to-purple-300 bg-clip-text text-transparent">Craft</span>
            </h1>
            <p className="text-purple-100 text-xl max-w-2xl mx-auto leading-relaxed mb-6">
              Transform your thoughts into perfectly crafted emails with multiple AI providers
            </p>
            
            <AnimatedEmailStats />
            <div className="flex justify-center mb-8">
              <button
                onClick={() => router.push('/personalized-emails')}
                className="group bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl border border-white/20 backdrop-blur-lg flex items-center gap-3 text-lg"
              >
                <Users className="h-6 w-6 group-hover:animate-pulse" />
                <span>Send Personalized Emails</span>
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              </button>
            </div>
          </div>

          <ApiSettings
            selectedProvider={selectedProvider}
            apiKeys={apiKeys}
            onApiKeyChange={handleApiKeyChange}
          />

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

              {/* Sender Name */}
              <div>
                <label className="block text-purple-100 text-sm font-medium mb-3">
                  <User className="h-4 w-4 inline mr-1" />
                  Your Name
                </label>
                <input
                  type="text"
                  value={formData.senderName}
                  onChange={(e) => handleInputChange('senderName', e.target.value)}
                  placeholder="e.g., John Doe, Sarah Johnson"
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
              {!user && (
                <div className="flex items-center justify-center gap-2 mt-3 text-red-300 text-sm">
                  <div className="w-4 h-4 bg-red-600 rounded-full animate-pulse"></div>
                  <span className="font-medium">Sign in required to generate emails</span>
                  <div className="w- h-4 bg-red-600 rounded-full animate-pulse"></div>
                </div>
              )}
            </div>
          </div>

          {/* Output Section */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl sm:rounded-3xl border border-white/20 p-4 sm:p-6 lg:p-8 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 sm:gap-3">
                <Send className="h-5 w-5 sm:h-6 sm:w-6" />
                Generated Email
              </h2>
              
              {/* Action buttons - responsive layout */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
                {(generatedEmail.subject || generatedEmail.body) && (
                  <>
                    <button
                      onClick={copyToClipboard}
                      className={`flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-2 rounded-xl transition-all duration-300 text-sm sm:text-base min-w-0 ${
                        copySuccess
                          ? 'bg-green-500/50 text-green-100'
                          : 'bg-white/20 hover:bg-white/30 text-white'
                      }`}
                    >
                      <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="xs:inline">{copySuccess ? 'Copied!' : 'Copy'}</span>
                    </button>
                    <button
                      onClick={openEmailSender}
                      className="flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white transition-all duration-300 text-sm sm:text-base min-w-0"
                    >
                      <Send className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="xs:inline">Send Email</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Email content area */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl sm:rounded-2xl border border-white/20 p-3 sm:p-4 lg:p-6 min-h-[300px] sm:min-h-[400px]">
              {generatedEmail.subject || generatedEmail.body ? (
                <div className="text-white space-y-3 sm:space-y-4">
                  {/* Subject section */}
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-purple-200 mb-2">Subject:</h3>
                    <div className="bg-white/10 rounded-lg p-2 sm:p-3 border border-white/20 break-words">
                      <p className="text-sm sm:text-base leading-relaxed">{generatedEmail.subject}</p>
                    </div>
                  </div>
                  
                  {/* Email body section */}
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-purple-200 mb-2">Email Body:</h3>
                    <div className="bg-white/10 rounded-lg p-2 sm:p-3 border border-white/20 overflow-hidden">
                      <div className="whitespace-pre-wrap leading-relaxed text-sm sm:text-base break-words overflow-wrap-anywhere">
                        {generatedEmail.body}
                      </div>
                    </div>
                  </div>
                  
                  {/* Email opener component */}
                  <div className="pt-2">
                    <EmailOpener
                      subject={generatedEmail.subject}
                      body={generatedEmail.body}
                      recipient={formData.recipient}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-purple-200 px-4">
                  <div className="text-center max-w-sm">
                    <Mail className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-3 sm:mb-4 opacity-50" />
                    <p className="text-base sm:text-lg mb-2">Your generated email will appear here</p>
                    <p className="text-xs sm:text-sm opacity-75 leading-relaxed">
                      Select an AI provider, fill in the details and click "Generate Email"
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center my-12">
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
        <Footer/>
      </div>
      {/* Feedback Modals */}
      {showGenerationFeedback && (
        <EmailGenerationFeedback
          onClose={() => setShowGenerationFeedback(false)}
          emailData={generatedEmail}
          provider={selectedProvider}
          onSubmit={handleGenerationFeedback}
        />
      )}
      <FloatingGenerationGuide />
    </div>
  );
};

export default EmailWriter;