import React, { useState, useEffect } from 'react';
import { HelpCircle, X, ExternalLink, Sparkles, Gift, Star, ChevronDown, ChevronUp } from 'lucide-react';

const FloatingGenerationGuide = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showInitialPulse, setShowInitialPulse] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  // Show pulse animation for first 3 seconds to draw attention
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowInitialPulse(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Auto-open after 2 seconds for first-time users (you can add localStorage logic)
  useEffect(() => {
    const autoOpenTimer = setTimeout(() => {
      if (!localStorage.getItem('helpGuideShown')) {
        setIsOpen(true);
        localStorage.setItem('helpGuideShown', 'true');
      }
    }, 2000);
    return () => clearTimeout(autoOpenTimer);
  }, []);

  const toggleHelp = () => {
    setIsOpen(!isOpen);
    setShowInitialPulse(false);
  };

  return (
    <>
      {/* Floating Help Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={toggleHelp}
          className={`
            relative bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 
            text-white p-4 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110
            ${showInitialPulse ? 'animate-bounce' : ''}
          `}
        >
          <HelpCircle className="h-6 w-6" />
          
          {/* Pulse rings for attention */}
          {showInitialPulse && (
            <>
              <div className="absolute inset-0 rounded-full bg-purple-500 animate-ping opacity-30"></div>
              <div className="absolute inset-0 rounded-full bg-purple-500 animate-ping opacity-20 animation-delay-200"></div>
            </>
          )}
          
          {/* New user indicator badge */}
          <div className="absolute -top-2 -right-2 bg-green-500 text-xs px-2 py-1 rounded-full animate-pulse">
            NEW
          </div>
        </button>
      </div>

      {/* Help Panel Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          ></div>
          
          {/* Help Panel */}
          <div className="relative bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 p-8 shadow-2xl max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-white hover:text-purple-200 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Header */}
            <div className="text-center mb-8">
              <div className="bg-gradient-to-r from-purple-400 to-pink-400 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Quick Start Guide</h2>
              <p className="text-purple-200">Get started with EmailCraft in minutes!</p>
            </div>

            {/* Getting Started Steps */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-400" />
                Getting Started
              </h3>
              
              <div className="space-y-4">
                {[
                  {
                    step: "1",
                    title: "Choose your AI provider",
                    description: "Google Gemini is free to start!",
                    highlight: true
                  },
                  {
                    step: "2", 
                    title: "Configure your API key",
                    description: "Click Settings to add your API credentials"
                  },
                  {
                    step: "3",
                    title: "Fill out the email form",
                    description: "Describe what you want to say"
                  },
                  {
                    step: "4",
                    title: "Review and send",
                    description: "Customize and send your perfect email"
                  }
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 bg-white/10 rounded-xl border border-white/20">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="text-white font-medium">{item.title}</h4>
                      <p className="text-purple-200 text-sm">{item.description}</p>
                      {item.highlight && (
                        <div className="flex items-center gap-1 mt-1">
                          <Gift className="h-4 w-4 text-green-400" />
                          <span className="text-green-300 text-xs font-medium">FREE OPTION</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Provider Recommendations */}
            <div className="mb-8">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between text-xl font-semibold text-white mb-4 hover:text-purple-200 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-400" />
                  AI Provider Recommendations
                </span>
                {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </button>
              
              {isExpanded && (
                <div className="space-y-3">
                  <div className="p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl border border-green-400/30">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold">FREE</span>
                      <h4 className="text-white font-medium">Google Gemini</h4>
                    </div>
                    <p className="text-green-200 text-sm">Perfect for beginners - 1,500 free requests daily</p>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl border border-purple-400/30">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full font-bold">DEFAULT</span>
                      <h4 className="text-white font-medium">QWEN (AIML)</h4>
                    </div>
                    <p className="text-purple-200 text-sm">Best for professional business communications</p>
                  </div>
                </div>
              )}
            </div>

            {/* Pro Tips */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-400" />
                Pro Tips
              </h3>
              
              <div className="space-y-2">
                {[
                  "Be specific about your email's purpose and context",
                  "Choose the appropriate tone for your relationship", 
                  "Always review and personalize the generated content",
                  "Save frequently used settings for faster generation"
                ].map((tip, index) => (
                  <div key={index} className="flex items-start gap-3 text-purple-200 text-sm">
                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <a
                href="https://uinfo.org/email-craft/emailcraft-sending-guide/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 font-medium"
              >
                <ExternalLink className="h-4 w-4" />
                View Complete User Guide
              </a>
              <button
                onClick={() => setIsOpen(false)}
                className="bg-white/20 hover:bg-white/30 text-white py-3 px-6 rounded-xl transition-all duration-300 font-medium"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingGenerationGuide;