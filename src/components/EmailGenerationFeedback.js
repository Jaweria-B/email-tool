import React, { useState } from 'react';
import { Star, Sparkles, ThumbsUp, ThumbsDown, Meh, Smile, Frown, Settings, Zap, Send, MessageSquare, X, CheckCircle } from 'lucide-react';

const EmailGenerationFeedback = ({ onClose, emailData, provider, onSubmit }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [feedback, setFeedback] = useState({
    overallRating: 0,
    overallEmoji: null,
    apiKeyExperience: {
      difficulty: 0,
      clarity: 0,
      emoji: null,
      comments: ''
    },
    generationProcess: {
      speed: 0,
      quality: 0,
      accuracy: 0,
      emoji: null,
      comments: ''
    },
    emailOutput: {
      professionalism: 0,
      relevance: 0,
      tone: 0,
      emoji: null,
      comments: ''
    },
    improvements: '',
    wouldRecommend: null,
    favoriteFeature: '',
    mostDifficultPart: '',
    additionalComments: ''
  });
  
  const [submitted, setSubmitted] = useState(false);

  const emojis = [
    { value: 'terrible', emoji: '😡', label: 'Terrible', color: 'text-red-500' },
    { value: 'poor', emoji: '😞', label: 'Poor', color: 'text-orange-500' },
    { value: 'okay', emoji: '😐', label: 'Okay', color: 'text-yellow-500' },
    { value: 'good', emoji: '😊', label: 'Good', color: 'text-green-500' },
    { value: 'excellent', emoji: '🤩', label: 'Excellent', color: 'text-purple-500' }
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

  const EmojiSelector = ({ selected, onChange }) => (
    <div className="flex gap-3 justify-center">
      {emojis.map((item) => (
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
          <h3 className="text-2xl font-bold text-white mb-2">Thank You! 🎉</h3>
          <p className="text-purple-200">Your feedback helps us improve Reachify for everyone!</p>
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
            <Sparkles className="h-6 w-6 text-purple-400" />
            <h2 className="text-xl font-bold text-white">How was your experience?</h2>
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
                <h3 className="text-2xl font-bold text-white mb-2">Overall Experience</h3>
                <p className="text-purple-200">How would you rate your overall experience with Reachify?</p>
              </div>

              <EmojiSelector
                selected={feedback.overallEmoji}
                onChange={(emoji) => setFeedback(prev => ({ ...prev, overallEmoji: emoji }))}
              />

              <div className="flex items-center justify-center gap-3">
                <span className="text-purple-200">Rate your experience:</span>
                <StarRating
                  rating={feedback.overallRating}
                  onChange={(rating) => setFeedback(prev => ({ ...prev, overallRating: rating }))}
                />
              </div>
            </div>
          )}

          {/* Step 2: API Key Setup */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <Settings className="h-12 w-12 text-purple-400 mx-auto mb-3" />
                <h3 className="text-2xl font-bold text-white mb-2">API Key Setup</h3>
                <p className="text-purple-200">Tell us about finding and setting up your API key</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-white font-medium mb-3">How difficult was it to find your API key?</label>
                  <StarRating
                    rating={feedback.apiKeyExperience.difficulty}
                    onChange={(rating) => setFeedback(prev => ({
                      ...prev,
                      apiKeyExperience: { ...prev.apiKeyExperience, difficulty: rating }
                    }))}
                  />
                  <p className="text-xs text-purple-300 mt-1">1 = Very Easy, 5 = Very Difficult</p>
                </div>

                <div>
                  <label className="block text-white font-medium mb-3">Were our instructions clear?</label>
                  <StarRating
                    rating={feedback.apiKeyExperience.clarity}
                    onChange={(rating) => setFeedback(prev => ({
                      ...prev,
                      apiKeyExperience: { ...prev.apiKeyExperience, clarity: rating }
                    }))}
                  />
                  <p className="text-xs text-purple-300 mt-1">1 = Very Confusing, 5 = Crystal Clear</p>
                </div>

                <div>
                  <label className="block text-white font-medium mb-3">Your feeling about this process:</label>
                  <EmojiSelector
                    selected={feedback.apiKeyExperience.emoji}
                    onChange={(emoji) => setFeedback(prev => ({
                      ...prev,
                      apiKeyExperience: { ...prev.apiKeyExperience, emoji }
                    }))}
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-3">Any specific challenges?</label>
                  <textarea
                    value={feedback.apiKeyExperience.comments}
                    onChange={(e) => setFeedback(prev => ({
                      ...prev,
                      apiKeyExperience: { ...prev.apiKeyExperience, comments: e.target.value }
                    }))}
                    placeholder="Tell us what was difficult or could be improved..."
                    rows={3}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Email Generation Process */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <Zap className="h-12 w-12 text-purple-400 mx-auto mb-3" />
                <h3 className="text-2xl font-bold text-white mb-2">Email Generation</h3>
                <p className="text-purple-200">How was the AI generation process?</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-white font-medium mb-3">Generation Speed</label>
                  <StarRating
                    rating={feedback.generationProcess.speed}
                    onChange={(rating) => setFeedback(prev => ({
                      ...prev,
                      generationProcess: { ...prev.generationProcess, speed: rating }
                    }))}
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-3">Email Quality</label>
                  <StarRating
                    rating={feedback.generationProcess.quality}
                    onChange={(rating) => setFeedback(prev => ({
                      ...prev,
                      generationProcess: { ...prev.generationProcess, quality: rating }
                    }))}
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-3">Accuracy to your input</label>
                  <StarRating
                    rating={feedback.generationProcess.accuracy}
                    onChange={(rating) => setFeedback(prev => ({
                      ...prev,
                      generationProcess: { ...prev.generationProcess, accuracy: rating }
                    }))}
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-3">How did the generation make you feel?</label>
                  <EmojiSelector
                    selected={feedback.generationProcess.emoji}
                    onChange={(emoji) => setFeedback(prev => ({
                      ...prev,
                      generationProcess: { ...prev.generationProcess, emoji }
                    }))}
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-3">Comments about the generation:</label>
                  <textarea
                    value={feedback.generationProcess.comments}
                    onChange={(e) => setFeedback(prev => ({
                      ...prev,
                      generationProcess: { ...prev.generationProcess, comments: e.target.value }
                    }))}
                    placeholder="Was it fast enough? Did it understand your needs? Any suggestions..."
                    rows={3}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Final Questions */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <MessageSquare className="h-12 w-12 text-purple-400 mx-auto mb-3" />
                <h3 className="text-2xl font-bold text-white mb-2">Email Output Quality</h3>
                <p className="text-purple-200">Rate the generated email</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-white font-medium mb-3">Professional tone</label>
                  <StarRating
                    rating={feedback.emailOutput.professionalism}
                    onChange={(rating) => setFeedback(prev => ({
                      ...prev,
                      emailOutput: { ...prev.emailOutput, professionalism: rating }
                    }))}
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-3">Relevance to your needs</label>
                  <StarRating
                    rating={feedback.emailOutput.relevance}
                    onChange={(rating) => setFeedback(prev => ({
                      ...prev,
                      emailOutput: { ...prev.emailOutput, relevance: rating }
                    }))}
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-3">Would you recommend Reachify?</label>
                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={() => setFeedback(prev => ({ ...prev, wouldRecommend: true }))}
                      className={`flex items-center gap-2 px-6 py-3 rounded-xl border-2 transition-all ${
                        feedback.wouldRecommend === true
                          ? 'border-green-400 bg-green-500/20 text-green-400'
                          : 'border-white/20 text-white hover:border-green-400'
                      }`}
                    >
                      <ThumbsUp className="h-5 w-5" />
                      Yes!
                    </button>
                    <button
                      onClick={() => setFeedback(prev => ({ ...prev, wouldRecommend: false }))}
                      className={`flex items-center gap-2 px-6 py-3 rounded-xl border-2 transition-all ${
                        feedback.wouldRecommend === false
                          ? 'border-red-400 bg-red-500/20 text-red-400'
                          : 'border-white/20 text-white hover:border-red-400'
                      }`}
                    >
                      <ThumbsDown className="h-5 w-5" />
                      No
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-white font-medium mb-3">What was your favorite feature?</label>
                  <input
                    type="text"
                    value={feedback.favoriteFeature}
                    onChange={(e) => setFeedback(prev => ({ ...prev, favoriteFeature: e.target.value }))}
                    placeholder="Multiple AI providers, tone selection, etc."
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-3">What should we improve?</label>
                  <textarea
                    value={feedback.improvements}
                    onChange={(e) => setFeedback(prev => ({ ...prev, improvements: e.target.value }))}
                    placeholder="Share your ideas for making Reachify even better..."
                    rows={4}
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

export default EmailGenerationFeedback;