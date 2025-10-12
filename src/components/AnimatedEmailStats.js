"use client"
import React, { useState, useEffect } from 'react';
import { Mail, Send, Sparkles, TrendingUp } from 'lucide-react';

const AnimatedEmailStats = () => {
  const [emailsGenerated, setEmailsGenerated] = useState(60);
  const [displayGenerated, setDisplayGenerated] = useState(0);
  const [displaySent, setDisplaySent] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  
  const emailsSent = 500;

  // Single useEffect to handle everything
  useEffect(() => {
    const fetchAndAnimate = async () => {
      try {
        const response = await fetch('/api/stats', { cache: 'no-store' });
        if (response.ok) {
          const data = await response.json();
          const count = Math.max(data.emailsGenerated || 60, 60); // Ensure minimum 60
          setEmailsGenerated(count);
          
          // Start animating generated emails immediately
          animateCounter(count, setDisplayGenerated, 0);
          
          // Start animating sent emails after a short delay
          setTimeout(() => {
            animateCounter(emailsSent, setDisplaySent, 500);
          }, 1000);
          
        } else {
          // Use fallback and still animate
          setEmailsGenerated(60);
          animateCounter(60, setDisplayGenerated, 0);
          setTimeout(() => {
            animateCounter(emailsSent, setDisplaySent, 500);
          }, 1000);
        }
      } catch (error) {
        console.error('Failed to fetch email count:', error);
        // Use fallback and still animate
        setEmailsGenerated(60);
        animateCounter(60, setDisplayGenerated, 0);
        setTimeout(() => {
          animateCounter(emailsSent, setDisplaySent, 500);
        }, 1000);
      }
    };

    fetchAndAnimate();
  }, []);

  const animateCounter = (targetValue, setter, delay = 0) => {
    setTimeout(() => {
      const duration = 2000;
      const steps = 60;
      const increment = targetValue / steps;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= targetValue) {
          setter(targetValue);
          clearInterval(timer);
        } else {
          setter(Math.floor(current));
        }
      }, duration / steps);
    }, delay);
  };

  return (
    <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
      <div className="relative bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 shadow-2xl max-w-md mx-auto mb-8">
        <div className="flex items-center justify-center gap-8">
          {/* Generated Emails */}
          <div className="text-center group cursor-pointer transform hover:scale-105 transition-transform duration-300">
            <div className="relative">
              <div className="bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full w-15 h-15 p-4 mb-3 shadow-lg group-hover:shadow-emerald-400/30 transition-shadow duration-300">
                <Mail className="h-6 w-6 text-white" />
                <div className="absolute -top-1 -right-1 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full p-1 animate-pulse">
                  <Sparkles className="h-3 w-3 text-white" />
                </div>
              </div>
              <div className="text-white">
                <div className="text-3xl font-bold bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text text-transparent">
                  {displayGenerated.toLocaleString()}+
                </div>
                <div className="text-sm text-emerald-200 font-medium">Generated</div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-16 w-px bg-gradient-to-b from-transparent via-white/30 to-transparent"></div>

          {/* Sent Emails */}
          <div className="text-center group cursor-pointer transform hover:scale-105 transition-transform duration-300">
            <div className="relative">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-full w-15 h-15 p-4 mb-3 shadow-lg group-hover:shadow-purple-400/30 transition-shadow duration-300">
                <Send className="h-6 w-6 text-white" />
                <div className="absolute -top-1 -right-1 bg-gradient-to-r from-orange-400 to-red-400 rounded-full p-1 animate-bounce">
                  <TrendingUp className="h-3 w-3 text-white" />
                </div>
              </div>
              <div className="text-white">
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                  {displaySent.toLocaleString()}+
                </div>
                <div className="text-sm text-purple-200 font-medium">Delivered</div>
              </div>
            </div>
          </div>
        </div>

        {/* Animated background particles */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
          <div className="absolute -top-1 -left-1 w-4 h-4 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full animate-ping opacity-20"></div>
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-ping opacity-20" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-white rounded-full animate-pulse opacity-30" style={{ animationDelay: '0.5s' }}></div>
        </div>
      </div>

      {/* Success celebration particles */}
      {displayGenerated > 0 && (
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-yellow-400 rounded-full"
              style={{
                left: `${(i - 1) * 8}px`,
                animation: `celebration 1s ease-out ${i * 200}ms forwards`
              }}
            />
          ))}
        </div>
      )}

      <style jsx>{`
        @keyframes celebration {
          0% { opacity: 1; transform: translateY(0); }
          50% { opacity: 1; transform: translateY(-20px); }
          100% { opacity: 0; transform: translateY(-40px); }
        }
      `}</style>
    </div>
  );
};

export default AnimatedEmailStats;