import React, { useState, useEffect } from 'react';
import { Send, Plus, X, Mail, Users, Settings, ArrowLeft, Check, AlertCircle, Upload, Download, FileText, Eye, EyeOff } from 'lucide-react';

const EmailSender = ({ subject, body, onBack, onEmailSent }) => {
  const [emailList, setEmailList] = useState(['']);
  const [emailConfig, setEmailConfig] = useState({
    fromEmail: '',
    fromPassword: '',
    subject: subject || 'Collaboration Opportunity'
  });
  const [sending, setSending] = useState(false);
  const [sendResults, setSendResults] = useState([]);
  const [showConfig, setShowConfig] = useState(false);
  const [bulkEmailText, setBulkEmailText] = useState('');
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [extractedEmails, setExtractedEmails] = useState([]);
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const [importMethod, setImportMethod] = useState('text'); // 'text' or 'file'
  const [fileProcessing, setFileProcessing] = useState(false);
  const [showAllEmails, setShowAllEmails] = useState(false);

  // Update subject when prop changes
  useEffect(() => {
    if (subject) {
      setEmailConfig(prev => ({ ...prev, subject }));
    }
  }, [subject]);

  const addEmailField = () => {
    setEmailList([...emailList, '']);
  };

  const removeEmailField = (index) => {
    const newList = emailList.filter((_, i) => i !== index);
    setEmailList(newList.length === 0 ? [''] : newList);
  };

  const updateEmail = (index, value) => {
    const newList = [...emailList];
    newList[index] = value;
    setEmailList(newList);
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const extractEmailsFromText = (text) => {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const foundEmails = text.match(emailRegex) || [];
    return [...new Set(foundEmails.filter(email => validateEmail(email)))];
  };

  const parseCSV = (text) => {
    const lines = text.split('\n');
    const emails = [];
    
    lines.forEach(line => {
      const cells = line.split(',').map(cell => cell.trim().replace(/"/g, ''));
      cells.forEach(cell => {
        const extractedEmails = extractEmailsFromText(cell);
        emails.push(...extractedEmails);
      });
    });
    
    return [...new Set(emails)];
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setFileProcessing(true);
    
    try {
      const text = await file.text();
      let emails = [];

      if (file.name.endsWith('.csv')) {
        emails = parseCSV(text);
      } else if (file.name.endsWith('.txt')) {
        emails = extractEmailsFromText(text);
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        // For Excel files, we'll treat them as CSV for now
        // In a real implementation, you'd use a library like SheetJS
        emails = parseCSV(text);
      } else {
        // Try to extract emails from any text file
        emails = extractEmailsFromText(text);
      }

      setExtractedEmails(emails);
      if (emails.length > 0) {
        setShowEmailPreview(true);
      } else {
        alert('No valid email addresses found in the file.');
      }
    } catch (error) {
      console.error('Error processing file:', error);
      alert('Error processing file. Please try again.');
    } finally {
      setFileProcessing(false);
      // Reset file input
      event.target.value = '';
    }
  };

  const processBulkEmails = () => {
    let emails = [];
    
    if (importMethod === 'text') {
      emails = bulkEmailText
        .split('\n')
        .map(email => email.trim())
        .filter(email => email && validateEmail(email));
    } else {
      emails = extractedEmails;
    }
    
    setEmailList(emails.length > 0 ? emails : ['']);
    setBulkEmailText('');
    setExtractedEmails([]);
    setShowBulkImport(false);
    setShowEmailPreview(false);
    setImportMethod('text');
  };

  const closeBulkImport = () => {
    setBulkEmailText('');
    setExtractedEmails([]);
    setShowBulkImport(false);
    setShowEmailPreview(false);
    setImportMethod('text');
  };

  const sendEmails = async () => {
    const validEmails = emailList.filter(email => email && validateEmail(email));
    
    if (validEmails.length === 0) {
      alert('Please enter at least one valid email address');
      return;
    }

    if (!body) {
      alert('No email content to send. Please generate an email first.');
      return;
    }

    setSending(true);
    setSendResults([]);

    try {
      // Send emails via API
      const response = await fetch('/api/send-emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emails: validEmails,
          subject: emailConfig.subject,
          body: body,
          fromEmail: emailConfig.fromEmail,
          fromPassword: emailConfig.fromPassword
        }),
      });

      const results = await response.json();
      
      setSendResults(results);
      
      // Check if any emails were sent successfully
      const successfulSends = results.filter(result => result.success);
      const emailSentSuccessfully = successfulSends.length > 0;
      
      // Call the callback to trigger feedback
      if (onEmailSent) {
        onEmailSent(emailSentSuccessfully);
      }
      
    } catch (error) {
      console.error('Error sending emails:', error);
      const errorResults = [{ error: 'Failed to send emails. Please try again.' }];
      setSendResults(errorResults);
      
      // Call callback with false since sending failed
      if (onEmailSent) {
        onEmailSent(false);
      }
    } finally {
      setSending(false);
    }
  };

  const exportEmailList = () => {
    const validEmails = emailList.filter(email => email && validateEmail(email));
    const dataStr = validEmails.join('\n');
    const dataBlob = new Blob([dataStr], { type: 'text/plain' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'email-list.txt';
    link.click();
    URL.revokeObjectURL(url);
  };

  const validEmailCount = emailList.filter(email => email && validateEmail(email)).length;
  const displayedEmails = showAllEmails ? emailList : emailList.slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={onBack}
            className="mb-6 bg-white/20 backdrop-blur-lg text-white px-4 py-2 rounded-full border border-white/30 hover:bg-white/30 transition-all duration-300 flex items-center gap-2 mx-auto"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Email Generator
          </button>
          
          <div className="flex items-center justify-center mb-6">
            <div className="bg-white/20 backdrop-blur-lg rounded-full p-4 border border-white/30">
              <Send className="h-12 w-12 text-white" />
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-white mb-4">
            Email<span className="bg-gradient-to-r from-pink-300 to-purple-300 bg-clip-text text-transparent">Sender</span>
          </h1>
          <p className="text-purple-100 text-lg max-w-2xl mx-auto">
            Send your crafted email to multiple recipients
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Email List Management */}
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <Users className="h-6 w-6" />
                Recipients ({validEmailCount})
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowBulkImport(true)}
                  className="bg-white/20 backdrop-blur-lg text-white px-3 py-2 rounded-lg border border-white/30 hover:bg-white/30 transition-all duration-300 flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Bulk Import
                </button>
                <button
                  onClick={exportEmailList}
                  className="bg-white/20 backdrop-blur-lg text-white px-3 py-2 rounded-lg border border-white/30 hover:bg-white/30 transition-all duration-300 flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export
                </button>
              </div>
            </div>

            {/* Email Preview Modal */}
            {showEmailPreview && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white">Extracted Emails ({extractedEmails.length})</h3>
                    <button
                      onClick={() => setShowEmailPreview(false)}
                      className="text-white hover:text-red-300 transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto mb-4">
                    <div className="grid gap-2">
                      {extractedEmails.map((email, index) => (
                        <div key={index} className="bg-white/10 backdrop-blur-lg rounded-lg px-3 py-2 text-white text-sm">
                          {email}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={processBulkEmails}
                      className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white py-2 px-4 rounded-lg hover:from-pink-600 hover:to-purple-600 transition-all duration-300"
                    >
                      Import {extractedEmails.length} Emails
                    </button>
                    <button
                      onClick={() => setShowEmailPreview(false)}
                      className="flex-1 bg-white/20 text-white py-2 px-4 rounded-lg hover:bg-white/30 transition-all duration-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Bulk Import Modal */}
            {showBulkImport && !showEmailPreview && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6 max-w-md w-full mx-4">
                  <h3 className="text-xl font-bold text-white mb-4">Bulk Import Emails</h3>
                  
                  {/* Import Method Tabs */}
                  <div className="flex gap-2 mb-4">
                    <button
                      onClick={() => setImportMethod('text')}
                      className={`flex-1 py-2 px-3 rounded-lg transition-all duration-300 ${
                        importMethod === 'text' 
                          ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white' 
                          : 'bg-white/20 text-purple-200 hover:bg-white/30'
                      }`}
                    >
                      Text Input
                    </button>
                    <button
                      onClick={() => setImportMethod('file')}
                      className={`flex-1 py-2 px-3 rounded-lg transition-all duration-300 ${
                        importMethod === 'file' 
                          ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white' 
                          : 'bg-white/20 text-purple-200 hover:bg-white/30'
                      }`}
                    >
                      File Upload
                    </button>
                  </div>

                  {importMethod === 'text' ? (
                    <textarea
                      value={bulkEmailText}
                      onChange={(e) => setBulkEmailText(e.target.value)}
                      placeholder="Enter email addresses, one per line&#10;example@email.com&#10;another@email.com"
                      rows={8}
                      className="w-full bg-white/20 backdrop-blur-lg border border-white/30 rounded-xl px-4 py-3 text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent resize-none mb-4"
                    />
                  ) : (
                    <div className="mb-4">
                      <div className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-xl p-6 text-center">
                        <FileText className="h-12 w-12 text-white mx-auto mb-4" />
                        <p className="text-purple-200 mb-4">
                          Upload a file containing email addresses
                        </p>
                        <p className="text-purple-300 text-sm mb-4">
                          Supported formats: CSV, TXT, Excel (.xlsx, .xls)
                        </p>
                        <input
                          type="file"
                          accept=".csv,.txt,.xlsx,.xls"
                          onChange={handleFileUpload}
                          className="hidden"
                          id="file-upload"
                          disabled={fileProcessing}
                        />
                        <label
                          htmlFor="file-upload"
                          className={`inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 py-2 rounded-lg cursor-pointer hover:from-pink-600 hover:to-purple-600 transition-all duration-300 ${
                            fileProcessing ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          {fileProcessing ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              Processing...
                            </>
                          ) : (
                            <>
                              <Upload className="h-4 w-4" />
                              Choose File
                            </>
                          )}
                        </label>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex gap-3">
                    {importMethod === 'text' && (
                      <button
                        onClick={processBulkEmails}
                        disabled={!bulkEmailText.trim()}
                        className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white py-2 px-4 rounded-lg hover:from-pink-600 hover:to-purple-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Import Emails
                      </button>
                    )}
                    <button
                      onClick={closeBulkImport}
                      className="flex-1 bg-white/20 text-white py-2 px-4 rounded-lg hover:bg-white/30 transition-all duration-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Email List Display */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {displayedEmails.map((email, index) => (
                <div key={index} className="flex items-center gap-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => updateEmail(index, e.target.value)}
                    placeholder="Enter email address"
                    className={`flex-1 bg-white/20 backdrop-blur-lg border rounded-xl px-4 py-3 text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent ${
                      email && !validateEmail(email) 
                        ? 'border-red-400 focus:ring-red-300' 
                        : 'border-white/30'
                    }`}
                  />
                  <button
                    onClick={() => removeEmailField(index)}
                    className="bg-red-500/20 text-red-300 p-2 rounded-lg hover:bg-red-500/30 transition-all duration-300"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Show More/Less Button */}
            {emailList.length > 5 && (
              <button
                onClick={() => setShowAllEmails(!showAllEmails)}
                className="w-full mt-3 bg-white/10 backdrop-blur-lg text-purple-200 py-2 px-4 rounded-lg border border-white/20 hover:bg-white/20 transition-all duration-300 flex items-center justify-center gap-2 text-sm"
              >
                {showAllEmails ? (
                  <>
                    <EyeOff className="h-4 w-4" />
                    Show Less ({emailList.length - 5} more hidden)
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4" />
                    Show All ({emailList.length - 5} more emails)
                  </>
                )}
              </button>
            )}

            <button
              onClick={addEmailField}
              className="w-full mt-4 bg-white/20 backdrop-blur-lg text-white py-3 px-4 rounded-xl border border-white/30 hover:bg-white/30 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Email Address
            </button>

            {/* Email Configuration */}
            <div className="mt-6">
              <button
                onClick={() => setShowConfig(!showConfig)}
                className="w-full bg-white/20 backdrop-blur-lg text-white py-3 px-4 rounded-xl border border-white/30 hover:bg-white/30 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Settings className="h-4 w-4" />
                Email Configuration
              </button>

              {showConfig && (
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-purple-100 text-sm font-medium mb-2">
                      From Email
                    </label>
                    <input
                      type="email"
                      value={emailConfig.fromEmail}
                      onChange={(e) => setEmailConfig({...emailConfig, fromEmail: e.target.value})}
                      className="w-full bg-white/20 backdrop-blur-lg border border-white/30 rounded-xl px-4 py-3 text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-purple-100 text-sm font-medium mb-2">
                      App Password
                    </label>
                    <input
                      type="password"
                      value={emailConfig.fromPassword}
                      onChange={(e) => setEmailConfig({...emailConfig, fromPassword: e.target.value})}
                      className="w-full bg-white/20 backdrop-blur-lg border border-white/30 rounded-xl px-4 py-3 text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-purple-100 text-sm font-medium mb-2">
                      Subject Line
                    </label>
                    <input
                      type="text"
                      value={emailConfig.subject}
                      onChange={(e) => setEmailConfig({...emailConfig, subject: e.target.value})}
                      className="w-full bg-white/20 backdrop-blur-lg border border-white/30 rounded-xl px-4 py-3 text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Send Button */}
            <button
              onClick={sendEmails}
              disabled={sending || validEmailCount === 0}
              className="w-full mt-6 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3 shadow-lg"
            >
              {sending ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Sending to {validEmailCount} recipients...
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  Send to {validEmailCount} recipients
                </>
              )}
            </button>
          </div>

          {/* Email Preview & Results */}
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Mail className="h-6 w-6" />
              Email Preview & Results
            </h2>

            {/* Email Preview */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6 mb-6">
              <div className="mb-4">
                <div className="text-purple-200 text-sm mb-2">Subject:</div>
                <div className="text-white font-medium">{emailConfig.subject}</div>
              </div>
              <div className="border-t border-white/20 pt-4">
                <div className="text-purple-200 text-sm mb-2">Email Body:</div>
                <div className="text-white text-sm whitespace-pre-wrap max-h-64 overflow-y-auto">
                  {body || 'No email content available. Please generate an email first.'}
                </div>
              </div>
            </div>

            {/* Send Results */}
            {sendResults.length > 0 && (
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
                <h3 className="text-white font-semibold mb-4">Send Results:</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {sendResults.map((result, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-white/10 rounded-lg">
                      {result.success ? (
                        <Check className="h-4 w-4 text-green-400" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-400" />
                      )}
                      <div className="flex-1">
                        <div className="text-white text-sm">
                          {result.email || 'Unknown recipient'}
                        </div>
                        <div className={`text-xs ${result.success ? 'text-green-300' : 'text-red-300'}`}>
                          {result.success ? 'Sent successfully' : result.error}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailSender;