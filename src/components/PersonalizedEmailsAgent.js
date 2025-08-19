"use client"
import React, { useState, useEffect } from 'react';
import { 
  Upload, 
  Users, 
  Bot, 
  Send, 
  Play, 
  Pause, 
  BarChart3, 
  FileText, 
  Settings,
  CheckCircle,
  AlertCircle,
  Clock,
  Mail,
  User,
  Building,
  LogOut
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const BulkEmailAgent = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [csvData, setCsvData] = useState([]);
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [smtpConfig, setSmtpConfig] = useState({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: '',
      pass: ''
    },
    fromName: ''
  });
  
  // Agent Configuration State
  const [agentConfig, setAgentConfig] = useState({
    name: 'Email Outreach Agent',
    systemPrompt: `You are an expert email outreach specialist. Your goal is to create personalized, engaging emails that feel authentic and human. 

Key Instructions:
- Use the provided person's information to create relevant, personalized content
- Maintain a professional yet approachable tone
- Keep emails concise but compelling
- Include a clear call-to-action
- Avoid generic or spammy language`,
    
    emailTemplate: `Write a personalized email using the following information:

Person's Details: {person_info}
Company: {company}
Role: {role}
Industry: {industry}
Additional Info: {additional_info}

Email Purpose: {email_purpose}
Call-to-Action: {call_to_action}

Create an email that:
1. Addresses them personally
2. Shows you've researched their background
3. Provides clear value proposition
4. Includes the specified call-to-action
5. Maintains professional tone

Generate both subject line and email body.`,
    
    emailPurpose: 'Professional outreach for partnership opportunities',
    callToAction: 'Schedule a brief 15-minute call to discuss potential collaboration',
    temperature: 0.7,
    maxTokens: 500
  });

  // Email Campaign State
  const [campaignState, setCampaignState] = useState({
    status: 'idle', // idle, processing, paused, completed
    processed: 0,
    total: 0,
    successful: 0,
    failed: 0,
    currentBatch: []
  });

  // Field Mapping State
  const [fieldMapping, setFieldMapping] = useState({
    email: '',
    name: '',
    company: '',
    role: '',
    industry: '',
    additional_info: ''
  });

  // Generated emails storage
  const [generatedEmails, setGeneratedEmails] = useState([]);
  const [currentStep, setCurrentStep] = useState(1); // 1: Upload, 2: Configure, 3: Preview, 4: Send

  // Load user data
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

  useEffect(() => {
    loadUserData();
  }, []);

  // Handle logout
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Handle CSV upload
  const handleCsvUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('csv', file);

    try {
      const response = await fetch('/api/csv/parse', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setCsvData(data.rows);
        setCsvHeaders(data.headers);
        setCurrentStep(2);
      } else {
        alert('Failed to parse CSV file');
      }
    } catch (error) {
      console.error('CSV upload error:', error);
      alert('Error uploading CSV file');
    }
  };

  // Generate single email
  const generateEmailForPerson = async (person) => {
    const personInfo = Object.entries(person)
      .filter(([key, value]) => value && value.trim())
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');

    const prompt = agentConfig.emailTemplate
      .replace('{person_info}', personInfo)
      .replace('{company}', person[fieldMapping.company] || 'their company')
      .replace('{role}', person[fieldMapping.role] || 'their role')
      .replace('{industry}', person[fieldMapping.industry] || 'their industry')
      .replace('{additional_info}', person[fieldMapping.additional_info] || '')
      .replace('{email_purpose}', agentConfig.emailPurpose)
      .replace('{call_to_action}', agentConfig.callToAction);

    try {
      const response = await fetch('/api/ai/generate-bulk-emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemPrompt: agentConfig.systemPrompt,
          userPrompt: prompt,
          temperature: agentConfig.temperature,
          maxTokens: agentConfig.maxTokens
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return {
          person,
          email: data.email,
          subject: data.subject,
          status: 'generated'
        };
      } else {
        throw new Error('Failed to generate email');
      }
    } catch (error) {
      console.error('Email generation error:', error);
      return {
        person,
        email: null,
        subject: null,
        status: 'failed',
        error: error.message
      };
    }
  };

  // Start bulk email generation
  const startBulkGeneration = async () => {
    setCampaignState({
      status: 'processing',
      processed: 0,
      total: csvData.length,
      successful: 0,
      failed: 0,
      currentBatch: []
    });

    const batchSize = 5; // Process 5 emails at a time
    const results = [];

    for (let i = 0; i < csvData.length; i += batchSize) {
      const batch = csvData.slice(i, i + batchSize);
      
      const batchPromises = batch.map(generateEmailForPerson);
      const batchResults = await Promise.all(batchPromises);
      
      results.push(...batchResults);
      
      setCampaignState(prev => ({
        ...prev,
        processed: results.length,
        successful: results.filter(r => r.status === 'generated').length,
        failed: results.filter(r => r.status === 'failed').length,
        currentBatch: batchResults
      }));

      // Add delay between batches to avoid rate limits
      if (i + batchSize < csvData.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    setGeneratedEmails(results);
    setCampaignState(prev => ({ ...prev, status: 'completed' }));
    setCurrentStep(4);
  };

  // Send emails
const sendBulkEmails = async () => {
  const successfulEmails = generatedEmails.filter(email => email.status === 'generated');
  
  if (successfulEmails.length === 0) {
    alert('No emails to send');
    return;
  }

  // Validate SMTP configuration
  if (!smtpConfig.auth.user || !smtpConfig.auth.pass) {
    alert('Please configure your SMTP settings first');
    return;
  }

  // Show loading state
  setCampaignState(prev => ({ 
    ...prev, 
    status: 'sending',
    processed: 0,
    successful: 0,
    failed: 0
  }));

  try {
    const results = [];
    
    for (let i = 0; i < successfulEmails.length; i++) {
      const emailItem = successfulEmails[i];
      
      try {
        const response = await fetch('/api/send-emails', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            emails: [emailItem.person[fieldMapping.email]], // Send one at a time for personalization
            subject: emailItem.subject,
            body: emailItem.email,
            smtpConfig: smtpConfig
          }),
        });

        if (response.ok) {
          const result = await response.json();
          results.push(...result.results);
          console.log(`Email ${i + 1}/${successfulEmails.length} sent successfully`);
          
          // Update progress
          setCampaignState(prev => ({ 
            ...prev, 
            processed: i + 1,
            successful: prev.successful + 1
          }));
        } else {
          const errorData = await response.json();
          console.error(`Failed to send email ${i + 1}:`, errorData.message);
          results.push({
            email: emailItem.person[fieldMapping.email],
            success: false,
            error: errorData.message
          });
          
          // Update progress
          setCampaignState(prev => ({ 
            ...prev, 
            processed: i + 1,
            failed: prev.failed + 1
          }));
        }
      } catch (error) {
        console.error(`Error sending email ${i + 1}:`, error);
        results.push({
          email: emailItem.person[fieldMapping.email],
          success: false,
          error: error.message
        });
        
        // Update progress
        setCampaignState(prev => ({ 
          ...prev, 
          processed: i + 1,
          failed: prev.failed + 1
        }));
      }

      // Add delay between sends to avoid rate limits
      if (i < successfulEmails.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1200)); // 1.2 second delay
      }
    }

    // Final update
    setCampaignState(prev => ({ 
      ...prev, 
      status: 'completed'
    }));

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    alert(`Bulk email campaign completed!\n✅ Sent: ${successful}\n❌ Failed: ${failed}`);
    
  } catch (error) {
    console.error('Bulk send error:', error);
    setCampaignState(prev => ({ ...prev, status: 'failed' }));
    alert('Error sending bulk emails: ' + error.message);
  }
};
  
  // Render different steps
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return renderUploadStep();
      case 2:
        return renderConfigureStep();
      case 3:
        return renderPreviewStep();
      case 4:
        return renderSendStep();
      default:
        return renderUploadStep();
    }
  };

  const renderUploadStep = () => (
    <div className="bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 p-8 shadow-2xl">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
        <Upload className="h-6 w-6" />
        Upload Contact List
      </h2>
      
      <div className="space-y-6">
        <div className="border-2 border-dashed border-white/30 rounded-xl p-8 text-center hover:border-white/50 transition-colors">
          <input
            type="file"
            accept=".csv"
            onChange={handleCsvUpload}
            className="hidden"
            id="csv-upload"
          />
          <label htmlFor="csv-upload" className="cursor-pointer">
            <FileText className="h-16 w-16 text-white/50 mx-auto mb-4" />
            <p className="text-white text-lg mb-2">Upload your CSV file</p>
            <p className="text-purple-200 text-sm">
              Include columns for email, name, company, role, and any additional info
            </p>
          </label>
        </div>

        {csvData.length > 0 && (
          <div className="bg-white/10 rounded-xl p-4">
            <p className="text-white font-semibold mb-2">
              ✅ {csvData.length} contacts loaded
            </p>
            <p className="text-purple-200 text-sm">
              Headers: {csvHeaders.join(', ')}
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const renderConfigureStep = () => (
    <div className="space-y-6">
      {/* Field Mapping - Keep your existing code */}
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 p-8 shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <Settings className="h-6 w-6" />
          Map CSV Fields
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.keys(fieldMapping).map((field) => (
            <div key={field}>
              <label className="block text-purple-100 text-sm font-medium mb-2">
                {field.replace('_', ' ').toUpperCase()}
                {field === 'email' && <span className="text-red-300"> *</span>}
              </label>
              <select
                value={fieldMapping[field]}
                onChange={(e) => setFieldMapping(prev => ({ ...prev, [field]: e.target.value }))}
                className="w-full bg-white/20 backdrop-blur-lg border border-white/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-300"
              >
                <option value="" className="bg-purple-800">Select column</option>
                {csvHeaders.map(header => (
                  <option key={header} value={header} className="bg-purple-800">
                    {header}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>

      {/* SMTP Configuration */}
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 p-8 shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <Mail className="h-6 w-6" />
          Email Configuration
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-purple-100 text-sm font-medium mb-2">
              SMTP Host
            </label>
            <input
              type="text"
              value={smtpConfig.host}
              onChange={(e) => setSmtpConfig(prev => ({ ...prev, host: e.target.value }))}
              placeholder="smtp.gmail.com"
              className="w-full bg-white/20 backdrop-blur-lg border border-white/30 rounded-xl px-4 py-3 text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
          </div>
          
          <div>
            <label className="block text-purple-100 text-sm font-medium mb-2">
              Port
            </label>
            <input
              type="number"
              value={smtpConfig.port}
              onChange={(e) => setSmtpConfig(prev => ({ ...prev, port: parseInt(e.target.value) }))}
              placeholder="587"
              className="w-full bg-white/20 backdrop-blur-lg border border-white/30 rounded-xl px-4 py-3 text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
          </div>
          
          <div>
            <label className="block text-purple-100 text-sm font-medium mb-2">
              Email Address <span className="text-red-300">*</span>
            </label>
            <input
              type="email"
              value={smtpConfig.auth.user}
              onChange={(e) => setSmtpConfig(prev => ({ 
                ...prev, 
                auth: { ...prev.auth, user: e.target.value }
              }))}
              placeholder="your-email@gmail.com"
              className="w-full bg-white/20 backdrop-blur-lg border border-white/30 rounded-xl px-4 py-3 text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
          </div>
          
          <div>
            <label className="block text-purple-100 text-sm font-medium mb-2">
              App Password <span className="text-red-300">*</span>
            </label>
            <input
              type="password"
              value={smtpConfig.auth.pass}
              onChange={(e) => setSmtpConfig(prev => ({ 
                ...prev, 
                auth: { ...prev.auth, pass: e.target.value }
              }))}
              placeholder="App-specific password"
              className="w-full bg-white/20 backdrop-blur-lg border border-white/30 rounded-xl px-4 py-3 text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-purple-100 text-sm font-medium mb-2">
              From Name
            </label>
            <input
              type="text"
              value={smtpConfig.fromName}
              onChange={(e) => setSmtpConfig(prev => ({ ...prev, fromName: e.target.value }))}
              placeholder="Your Company Name"
              className="w-full bg-white/20 backdrop-blur-lg border border-white/30 rounded-xl px-4 py-3 text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
          </div>
        </div>

        <div className="mt-4 p-4 bg-blue-500/20 border border-blue-500/30 rounded-xl">
          <p className="text-blue-200 text-sm">
            💡 <strong>For Gmail:</strong> Use your Gmail address and an App Password (not your regular password). 
            <br />Generate an App Password at: Google Account → Security → 2-Step Verification → App passwords
          </p>
        </div>
      </div>

      {/* Agent Configuration - Keep your existing code */}
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 p-8 shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <Bot className="h-6 w-6" />
          Configure AI Agent
        </h2>
        
        <div className="space-y-6">
          <div>
            <label className="block text-purple-100 text-sm font-medium mb-3">
              Agent Name
            </label>
            <input
              type="text"
              value={agentConfig.name}
              onChange={(e) => setAgentConfig(prev => ({ ...prev, name: e.target.value }))}
              className="w-full bg-white/20 backdrop-blur-lg border border-white/30 rounded-xl px-4 py-3 text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
          </div>

          <div>
            <label className="block text-purple-100 text-sm font-medium mb-3">
              Email Purpose
            </label>
            <input
              type="text"
              value={agentConfig.emailPurpose}
              onChange={(e) => setAgentConfig(prev => ({ ...prev, emailPurpose: e.target.value }))}
              className="w-full bg-white/20 backdrop-blur-lg border border-white/30 rounded-xl px-4 py-3 text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
          </div>

          <div>
            <label className="block text-purple-100 text-sm font-medium mb-3">
              Call-to-Action
            </label>
            <textarea
              value={agentConfig.callToAction}
              onChange={(e) => setAgentConfig(prev => ({ ...prev, callToAction: e.target.value }))}
              rows={2}
              className="w-full bg-white/20 backdrop-blur-lg border border-white/30 rounded-xl px-4 py-3 text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none"
            />
          </div>

          <div>
            <label className="block text-purple-100 text-sm font-medium mb-3">
              System Prompt (Advanced)
            </label>
            <textarea
              value={agentConfig.systemPrompt}
              onChange={(e) => setAgentConfig(prev => ({ ...prev, systemPrompt: e.target.value }))}
              rows={6}
              className="w-full bg-white/20 backdrop-blur-lg border border-white/30 rounded-xl px-4 py-3 text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none"
            />
          </div>
        </div>

        <div className="flex gap-4 mt-8">
          <button
            onClick={() => setCurrentStep(1)}
            className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-all duration-300"
          >
            Back
          </button>
          <button
            onClick={() => setCurrentStep(3)}
            disabled={!fieldMapping.email || !smtpConfig.auth.user || !smtpConfig.auth.pass}
            className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Preview & Generate
          </button>
        </div>
      </div>
    </div>
  );
  const renderPreviewStep = () => (
    <div className="space-y-6">
      {/* Campaign Overview */}
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 p-8 shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <Users className="h-6 w-6" />
          Campaign Preview
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/10 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-white mb-2">{csvData.length}</div>
            <div className="text-purple-200 text-sm">Total Recipients</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">{campaignState.successful}</div>
            <div className="text-purple-200 text-sm">Generated</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-red-400 mb-2">{campaignState.failed}</div>
            <div className="text-purple-200 text-sm">Failed</div>
          </div>
        </div>

        {/* Progress Bar */}
        {campaignState.status === 'processing' && (
          <div className="mb-6">
            <div className="flex justify-between text-sm text-purple-200 mb-2">
              <span>Generating emails...</span>
              <span>{campaignState.processed} / {campaignState.total}</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-pink-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(campaignState.processed / campaignState.total) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => setCurrentStep(2)}
            className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-all duration-300"
          >
            Back to Configure
          </button>
          
          {campaignState.status === 'idle' && (
            <button
              onClick={startBulkGeneration}
              disabled={!user}
              className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="h-5 w-5" />
              Start Generating Emails
            </button>
          )}

          {campaignState.status === 'completed' && (
            <button
              onClick={() => setCurrentStep(4)}
              className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Send className="h-5 w-5" />
              Review & Send
            </button>
          )}
        </div>

        {!user && (
          <div className="mt-4 p-4 bg-red-500/20 border border-red-500/30 rounded-xl">
            <p className="text-red-200 text-center">
              ⚠️ Please sign in to generate and send bulk emails
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const renderSendStep = () => (
    <div className="space-y-6">
      {/* Results Overview */}
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 p-8 shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <BarChart3 className="h-6 w-6" />
          Campaign Results
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-blue-500/20 rounded-xl p-4 text-center border border-blue-500/30">
            <div className="text-2xl font-bold text-blue-300 mb-1">{generatedEmails.length}</div>
            <div className="text-purple-200 text-sm">Total Processed</div>
          </div>
          <div className="bg-green-500/20 rounded-xl p-4 text-center border border-green-500/30">
            <div className="text-2xl font-bold text-green-300 mb-1">
              {generatedEmails.filter(e => e.status === 'generated').length}
            </div>
            <div className="text-purple-200 text-sm">Successfully Generated</div>
          </div>
          <div className="bg-red-500/20 rounded-xl p-4 text-center border border-red-500/30">
            <div className="text-2xl font-bold text-red-300 mb-1">
              {generatedEmails.filter(e => e.status === 'failed').length}
            </div>
            <div className="text-purple-200 text-sm">Failed</div>
          </div>
          <div className="bg-purple-500/20 rounded-xl p-4 text-center border border-purple-500/30">
            <div className="text-2xl font-bold text-purple-300 mb-1">
              {Math.round((generatedEmails.filter(e => e.status === 'generated').length / generatedEmails.length) * 100)}%
            </div>
            <div className="text-purple-200 text-sm">Success Rate</div>
          </div>
        </div>

        {/* Email Preview */}
        <div className="bg-white/10 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">Sample Generated Email</h3>
          {generatedEmails.filter(e => e.status === 'generated')[0] && (
            <div className="space-y-3">
              <div>
                <span className="text-purple-200 text-sm">Subject: </span>
                <span className="text-white">
                  {generatedEmails.filter(e => e.status === 'generated')[0].subject}
                </span>
              </div>
              <div>
                <span className="text-purple-200 text-sm">Body Preview: </span>
                <div className="bg-white/10 rounded-lg p-3 mt-2">
                  <p className="text-white text-sm whitespace-pre-wrap">
                    {generatedEmails.filter(e => e.status === 'generated')[0].email?.substring(0, 300)}...
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Send Actions */}
        <div className="flex gap-4">
          <button
            onClick={() => setCurrentStep(3)}
            className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-all duration-300"
          >
            Back to Preview
          </button>
          
          <button
            onClick={sendBulkEmails}
            disabled={generatedEmails.filter(e => e.status === 'generated').length === 0}
            className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-5 w-5" />
            Send {generatedEmails.filter(e => e.status === 'generated').length} Emails
          </button>
        </div>
      </div>
    </div>
  );

  // Auth check
  if (!user && !isLoadingUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 p-8 shadow-2xl text-center max-w-md">
          <Bot className="h-16 w-16 text-white/50 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-4">Bulk Email Agent</h1>
          <p className="text-purple-200 mb-6">Please sign in to access the bulk email generation system.</p>
          <button
            onClick={() => router.push('/login')}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur-lg rounded-full p-3 border border-white/30">
              <Bot className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">
                Bulk Email Agent
              </h1>
              <p className="text-purple-200">
                AI-powered personalized email campaigns
              </p>
            </div>
          </div>

          {/* User Profile */}
          {user && (
            <div className="relative">
              <button
                onClick={() => setShowProfile(!showProfile)}
                className="bg-white/20 backdrop-blur-lg text-white px-4 py-2 rounded-full border border-white/30 hover:bg-white/30 transition-all duration-300 flex items-center gap-2"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">{user.name}</span>
              </button>
              
              {showProfile && (
                <div className="absolute right-0 mt-2 w-64 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-4 shadow-2xl z-50">
                  <div className="text-white space-y-3">
                    <div className="border-b border-white/20 pb-3">
                      <p className="font-semibold">{user.name}</p>
                      <p className="text-sm text-purple-200">{user.email}</p>
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
          )}
        </div>

        {/* Step Navigation */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-4 mb-8">
          <div className="flex items-center justify-between">
            {[
              { step: 1, label: 'Upload CSV', icon: Upload },
              { step: 2, label: 'Configure Agent', icon: Settings },
              { step: 3, label: 'Generate Emails', icon: Bot },
              { step: 4, label: 'Review & Send', icon: Send }
            ].map(({ step, label, icon: Icon }) => (
              <div key={step} className="flex items-center">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                  currentStep >= step 
                    ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white' 
                    : 'text-purple-200'
                }`}>
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline text-sm font-medium">{label}</span>
                </div>
                {step < 4 && <div className="w-8 h-px bg-white/20 mx-2 hidden sm:block" />}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        {renderStep()}
      </div>
    </div>
  );
};

export default BulkEmailAgent;
