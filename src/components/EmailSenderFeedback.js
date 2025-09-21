import React, { useState } from 'react';
import { Star, Mail, Shield, Clock, Send, X, CheckCircle, AlertCircle, Key, Smile, Frown, Meh } from 'lucide-react';

const EmailSenderFeedback = ({ onClose, onSubmit, emailSent = false }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [feedback, setFeedback] = useState({
    overallExperience: 0,
    overallEmoji: null,
    emailSetup: {
      emailEntry: 0,
      appPasswordSetup: 0,
      instructions: 0,
      emoji: null,
      comments: ''
    },
    sendingProcess: {
      speed: 0,
      reliability: 0,
      interface: 0,
      emoji: null,
      comments: ''
    },
    security: {
      trustLevel: 0,
      securityConcerns: '',
      feelsSecure: null
    },
    improvements: {
      mostDifficult: '',
      suggestions: '',
      additionalFeatures: '',
      wouldUseAgain: null
    },
    additionalComments: ''
  });
  
  const [submitted, setSubmitted] = useState(false);

  const emojis = [
    { value: 'frustrated', emoji: '😤', label: 'Frustrated', color: 'text-red-500' },
    { value: 'confused', emoji: '😕', label: 'Confused', color: 'text-orange-500' },
    { value: 'neutral', emoji: '😐', label: 'Neutral', color: 'text-yellow-500' },
    { value: 'satisfied', emoji: '😊', label: 'Satisfied', color: 'text-green-500' },
    { value: 'delighted', emoji: '🤩', label: 'Delighted', color: 'text-purple-500' }
  ];

  const securityEmojis = [
    { value: 'worried', emoji: '😰', label: 'Worried', color: 'text-red-500' },
    { value: 'unsure', emoji: '🤔', label: 'Unsure', color: 'text-orange-500' },
    { value: 'okay', emoji: '😐', label: 'Okay', color: 'text-yellow-500' },
    { value: 'confident', emoji: '😌', label: 'Confident', color: 'text-green-500' },
    { value: 'secure', emoji: '🛡️', label: 'Very Secure', color: 'text-purple-500' }
  ];

  const StarRating = ({ rating, onChange, size = 'h-6 w-6' }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => onChange(star)}
          className={`${size} transition-all duration-200 hover:scale-110 ${
            star <= rating ? 'text-yellow-400' : 'text-gray-400'
          }`}
        >
          <Star fill={star <= rating ? 'currentColor' : 'none'} />
        </button>
      ))}
    </div>
  );

  const EmojiSelector = ({ selected, onChange, emojiSet = emojis }) => (
    <div className="flex gap-3 justify-center">
      {emojiSet.map((item) => (
        <button
          key={item.value}
          onClick={() => onChange(item.value)}
          className={`p-3 rounded-xl border-2 transition-all duration-200 hover:scale-110 ${
            selected === item.value
              ? 'border-purple-400 bg-purple-500/20 shadow-lg'
              : 'border-white/20 hover:border-white/40'
          }`}
        >
          <div className="text-2xl mb-1">{item.emoji}</div>
          <div className={`text-xs font-medium ${item.color}`}>{item.label}</div>
        </button>
      ))}
    </div>
  );

  const handleSubmit = async () => {
    try {
      await onSubmit(feedback);
      setSubmitted(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    }
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 p-8 max-w-md mx-4 text-center">
          <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">Thank You! 🙏</h3>
          <p className="text-purple-200">Your feedback helps us improve the email sending experience!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <div className="flex items-center gap-3">
            <Mail className="h-6 w-6 text-purple-400" />
            <h2 className="text-xl font-bold text-white">Email Sender Feedback</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Progress Bar */}
          <div className="flex items-center gap-2 mb-6">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex-1">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    step <= currentStep ? 'bg-purple-500' : 'bg-white/20'
                  }`}
                />
              </div>
            ))}
          </div>

          {/* Step 1: Overall Experience */}
          {currentStep === 1 && (
            <div className="space-y-6 text-center">
              <div className="mb-6">
                <Send className="h-12 w-12 text-purple-400 mx-auto mb-3" />
                <h3 className="text-2xl font-bold text-white mb-2">Overall Email Sending Experience</h3>
                <p className="text-purple-200">
                  {emailSent 
                    ? "How was your experience sending the email?" 
                    : "How was your experience with the email sender (even if you didn't send)?"}
                </p>
              </div>

              <EmojiSelector
                selected={feedback.overallEmoji}
                onChange={(emoji) => setFeedback(prev => ({ ...prev, overallEmoji: emoji }))}
              />

              <div className="flex items-center justify-center gap-3">
                <span className="text-purple-200">Rate your experience:</span>
                <StarRating
                  rating={feedback.overallExperience}
                  onChange={(rating) => setFeedback(prev => ({ ...prev, overallExperience: rating }))}
                />
              </div>

              {emailSent && (
                <div className="bg-green-500/20 border border-green-400/30 rounded-xl p-4 mt-4">
                  <div className="flex items-center gap-2 text-green-400">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">Email sent successfully!</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Email Setup Process */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <Key className="h-12 w-12 text-purple-400 mx-auto mb-3" />
                <h3 className="text-2xl font-bold text-white mb-2">Setup Process</h3>
                <p className="text-purple-200">Tell us about entering your email and app password</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-white font-medium mb-3">How easy was entering your email address?</label>
                  <StarRating
                    rating={feedback.emailSetup.emailEntry}
                    onChange={(rating) => setFeedback(prev => ({
                      ...prev,
                      emailSetup: { ...prev.emailSetup, emailEntry: rating }
                    }))}
                  />
                  <p className="text-xs text-purple-300 mt-1">1 = Very Difficult, 5 = Very Easy</p>
                </div>

                <div>
                  <label className="block text-white font-medium mb-3">How was the app password setup process?</label>
                  <StarRating
                    rating={feedback.emailSetup.appPasswordSetup}
                    onChange={(rating) => setFeedback(prev => ({
                      ...prev,
                      emailSetup: { ...prev.emailSetup, appPasswordSetup: rating }
                    }))}
                  />
                  <p className="text-xs text-purple-300 mt-1">1 = Very Confusing, 5 = Very Clear</p>
                </div>

                <div>
                  <label className="block text-white font-medium mb-3">Were our instructions helpful?</label>
                  <StarRating
                    rating={feedback.emailSetup.instructions}
                    onChange={(rating) => setFeedback(prev => ({
                      ...prev,
                      emailSetup: { ...prev.emailSetup, instructions: rating }
                    }))}
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-3">How did the setup process make you feel?</label>
                  <EmojiSelector
                    selected={feedback.emailSetup.emoji}
                    onChange={(emoji) => setFeedback(prev => ({
                      ...prev,
                      emailSetup: { ...prev.emailSetup, emoji }
                    }))}
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-3">Any specific challenges with setup?</label>
                  <textarea
                    value={feedback.emailSetup.comments}
                    onChange={(e) => setFeedback(prev => ({
                      ...prev,
                      emailSetup: { ...prev.emailSetup, comments: e.target.value }
                    }))}
                    placeholder="Tell us what was difficult or confusing..."
                    rows={3}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Sending Process & Security */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <Shield className="h-12 w-12 text-purple-400 mx-auto mb-3" />
                <h3 className="text-2xl font-bold text-white mb-2">Sending Process & Security</h3>
                <p className="text-purple-200">How did you feel about the sending process and security?</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-white font-medium mb-3">Sending Speed & Performance</label>
                  <StarRating
                    rating={feedback.sendingProcess.speed}
                    onChange={(rating) => setFeedback(prev => ({
                      ...prev,
                      sendingProcess: { ...prev.sendingProcess, speed: rating }
                    }))}
                  />
                  <p className="text-xs text-purple-300 mt-1">1 = Very Slow, 5 = Very Fast</p>
                </div>

                <div>
                  <label className="block text-white font-medium mb-3">Interface Usability</label>
                  <StarRating
                    rating={feedback.sendingProcess.interface}
                    onChange={(rating) => setFeedback(prev => ({
                      ...prev,
                      sendingProcess: { ...prev.sendingProcess, interface: rating }
                    }))}
                  />
                  <p className="text-xs text-purple-300 mt-1">1 = Very Confusing, 5 = Very Intuitive</p>
                </div>

                <div>
                  <label className="block text-white font-medium mb-3">How secure did you feel sharing your email credentials?</label>
                  <EmojiSelector
                    selected={feedback.security.feelsSecure}
                    onChange={(emoji) => setFeedback(prev => ({
                      ...prev,
                      security: { ...prev.security, feelsSecure: emoji }
                    }))}
                    emojiSet={securityEmojis}
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-3">Trust Level with EmailCurator</label>
                  <StarRating
                    rating={feedback.security.trustLevel}
                    onChange={(rating) => setFeedback(prev => ({
                      ...prev,
                      security: { ...prev.security, trustLevel: rating }
                    }))}
                  />
                  <p className="text-xs text-purple-300 mt-1">1 = Don't Trust, 5 = Completely Trust</p>
                </div>

                <div>
                  <label className="block text-white font-medium mb-3">Any security concerns or suggestions?</label>
                  <textarea
                    value={feedback.security.securityConcerns}
                    onChange={(e) => setFeedback(prev => ({
                      ...prev,
                      security: { ...prev.security, securityConcerns: e.target.value }
                    }))}
                    placeholder="Share any security concerns or how we could make you feel more secure..."
                    rows={3}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-3">Comments about the sending process:</label>
                  <textarea
                    value={feedback.sendingProcess.comments}
                    onChange={(e) => setFeedback(prev => ({
                      ...prev,
                      sendingProcess: { ...prev.sendingProcess, comments: e.target.value }
                    }))}
                    placeholder="Was it smooth? Any issues? What could be better?"
                    rows={3}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Improvements & Final Thoughts */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <AlertCircle className="h-12 w-12 text-purple-400 mx-auto mb-3" />
                <h3 className="text-2xl font-bold text-white mb-2">Improvements & Future</h3>
                <p className="text-purple-200">Help us make the email sender even better</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-white font-medium mb-3">What was the most difficult part?</label>
                  <input
                    type="text"
                    value={feedback.improvements.mostDifficult}
                    onChange={(e) => setFeedback(prev => ({
                      ...prev,
                      improvements: { ...prev.improvements, mostDifficult: e.target.value }
                    }))}
                    placeholder="App password setup, email entry, understanding instructions..."
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-3">Would you use EmailCurator's sender again?</label>
                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={() => setFeedback(prev => ({
                        ...prev,
                        improvements: { ...prev.improvements, wouldUseAgain: 'definitely' }
                      }))}
                      className={`flex items-center gap-2 px-6 py-3 rounded-xl border-2 transition-all ${
                        feedback.improvements.wouldUseAgain === 'definitely'
                          ? 'border-green-400 bg-green-500/20 text-green-400'
                          : 'border-white/20 text-white hover:border-green-400'
                      }`}
                    >
                      <span className="text-2xl">🤩</span>
                      Definitely!
                    </button>
                    <button
                      onClick={() => setFeedback(prev => ({
                        ...prev,
                        improvements: { ...prev.improvements, wouldUseAgain: 'maybe' }
                      }))}
                      className={`flex items-center gap-2 px-6 py-3 rounded-xl border-2 transition-all ${
                        feedback.improvements.wouldUseAgain === 'maybe'
                          ? 'border-yellow-400 bg-yellow-500/20 text-yellow-400'
                          : 'border-white/20 text-white hover:border-yellow-400'
                      }`}
                    >
                      <span className="text-2xl">🤔</span>
                      Maybe
                    </button>
                    <button
                      onClick={() => setFeedback(prev => ({
                        ...prev,
                        improvements: { ...prev.improvements, wouldUseAgain: 'no' }
                      }))}
                      className={`flex items-center gap-2 px-6 py-3 rounded-xl border-2 transition-all ${
                        feedback.improvements.wouldUseAgain === 'no'
                          ? 'border-red-400 bg-red-500/20 text-red-400'
                          : 'border-white/20 text-white hover:border-red-400'
                      }`}
                    >
                      <span className="text-2xl">😞</span>
                      Probably not
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-white font-medium mb-3">What features would make email sending better?</label>
                  <textarea
                    value={feedback.improvements.additionalFeatures}
                    onChange={(e) => setFeedback(prev => ({
                      ...prev,
                      improvements: { ...prev.improvements, additionalFeatures: e.target.value }
                    }))}
                    placeholder="Templates, scheduling, multiple recipients, better security..."
                    rows={3}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-3">How can we improve the email sender?</label>
                  <textarea
                    value={feedback.improvements.suggestions}
                    onChange={(e) => setFeedback(prev => ({
                      ...prev,
                      improvements: { ...prev.improvements, suggestions: e.target.value }
                    }))}
                    placeholder="Your suggestions for making the email sending experience better..."
                    rows={4}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-3">Any final thoughts?</label>
                  <textarea
                    value={feedback.additionalComments}
                    onChange={(e) => setFeedback(prev => ({ ...prev, additionalComments: e.target.value }))}
                    placeholder="Anything else you'd like us to know..."
                    rows={3}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6 border-t border-white/20">
            <button
              onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
              disabled={currentStep === 1}
              className="px-6 py-2 rounded-xl bg-white/10 text-white border border-white/20 hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {currentStep < 4 ? (
              <button
                onClick={() => setCurrentStep(prev => prev + 1)}
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition-all"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition-all flex items-center gap-2"
              >
                <Send className="h-4 w-4" />
                Submit Feedback
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailSenderFeedback;