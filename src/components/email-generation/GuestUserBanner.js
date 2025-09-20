// components/GuestUserBanner.js
"use client"
import React from 'react';
import { Gift, Sparkles, UserPlus, Crown } from 'lucide-react';
import { useRouter } from 'next/navigation';

const GuestUserBanner = ({ 
  canGenerate, 
  remainingGenerations, 
  hasUsedFree, 
  onSignUpClick 
}) => {
  const router = useRouter();

  if (hasUsedFree) {
    return (
      <div className="mb-6 bg-gradient-to-r from-orange-500/20 via-red-500/20 to-pink-500/20 backdrop-blur-lg rounded-2xl border border-orange-300/30 p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 p-2 rounded-xl">
              <Crown className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-1">
                🎉 Free Trial Used!
              </h3>
              <p className="text-orange-100 text-sm">
                Sign up now to continue generating unlimited professional emails
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={onSignUpClick}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2 shadow-lg"
            >
              <UserPlus className="h-4 w-4" />
              Get Unlimited Access
            </button>
            <button
              onClick={() => router.push('/login')}
              className="bg-white/20 hover:bg-white/30 text-white font-medium px-4 py-3 rounded-xl transition-all duration-300 border border-white/30"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (canGenerate) {
    return (
      <div className="mb-6 bg-gradient-to-r from-green-500/20 via-teal-500/20 to-blue-500/20 backdrop-blur-lg rounded-2xl border border-green-300/30 p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-green-500 to-teal-500 p-2 rounded-xl animate-pulse">
              <Gift className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-1">
                🚀 Welcome! Try It Free
              </h3>
              <p className="text-green-100 text-sm">
                Generate {remainingGenerations} professional email for free, no signup required!
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="bg-green-500/30 px-3 py-2 rounded-lg border border-green-400/50">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-green-200" />
                <span className="text-green-100 font-medium text-sm">
                  {remainingGenerations} Free Left
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-4 flex flex-wrap gap-2 text-xs text-green-200">
          <span className="bg-green-500/20 px-2 py-1 rounded-lg">✨ AI-Powered</span>
          <span className="bg-teal-500/20 px-2 py-1 rounded-lg">📧 Professional Quality</span>
          <span className="bg-blue-500/20 px-2 py-1 rounded-lg">⚡ Instant Generation</span>
        </div>
      </div>
    );
  }

  return null;
};

export default GuestUserBanner;