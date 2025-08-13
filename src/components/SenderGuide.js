import React, { useState, useEffect } from 'react';
import { Send, Plus, X, Mail, Users, Settings, ArrowLeft, Check, AlertCircle, Upload, Download, FileText, Eye, EyeOff, User, Server, HelpCircle, ExternalLink, Zap, Key, List } from 'lucide-react';
import * as XLSX from 'xlsx'; 

const SenderGuide = ({ isOpen, onToggle }) => {
  return (
    <>
      {/* Floating Guide Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={onToggle}
          className={`bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white p-4 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 border-2 border-white/20 ${
            isOpen ? 'rotate-180' : ''
          }`}
        >
          <HelpCircle className="h-6 w-6" />
        </button>
      </div>

      {/* Guide Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-40 w-80 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Quick Guide
            </h3>
            <button
              onClick={onToggle}
              className="text-white/70 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-4 text-sm">
            {/* Step 1 */}
            <div className="flex items-start gap-3">
              <div className="bg-gradient-to-r from-pink-500 to-purple-500 rounded-full w-6 h-6 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                1
              </div>
              <div>
                <div className="text-white font-medium flex items-center gap-2">
                  <List className="h-4 w-4" />
                  Add Recipients
                </div>
                <div className="text-purple-200 text-xs">
                  Add emails manually or use bulk import for CSV/Excel files
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-3">
              <div className="bg-gradient-to-r from-pink-500 to-purple-500 rounded-full w-6 h-6 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                2
              </div>
              <div>
                <div className="text-white font-medium flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  Setup SMTP
                </div>
                <div className="text-purple-200 text-xs">
                  Configure your email provider & app password
                </div>
              </div>
            </div>

            {/* Gmail App Password Info */}
            <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-3">
              <div className="text-blue-200 text-xs font-medium mb-1">
                📧 For Gmail Users:
              </div>
              <div className="text-blue-100 text-xs">
                Get your App Password at:
              </div>
              <a
                href="https://myaccount.google.com/apppasswords"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-300 hover:text-blue-200 text-xs underline flex items-center gap-1 mt-1"
              >
                myaccount.google.com/apppasswords
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-3">
              <div className="bg-gradient-to-r from-pink-500 to-purple-500 rounded-full w-6 h-6 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                3
              </div>
              <div>
                <div className="text-white font-medium flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  Send Emails
                </div>
                <div className="text-purple-200 text-xs">
                  Preview your email and hit send to all recipients
                </div>
              </div>
            </div>

            {/* Full Guide Link */}
            <div className="border-t border-white/20 pt-4">
              <a
                href="https://uinfo.org/email-craft/emailcraft-sending-guide"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white py-2 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 text-sm font-medium"
              >
                <ExternalLink className="h-4 w-4" />
                View Full Guide
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SenderGuide;