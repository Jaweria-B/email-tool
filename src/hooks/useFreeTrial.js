// hooks/useGuestUser.js
"use client"
import { useState, useEffect, useCallback } from 'react';

const GUEST_STORAGE_KEY = 'email_generator_guest_usage';
const GUEST_SESSION_KEY = 'email_generator_guest_session';

export default function useGuestUser() {
  const [guestUsage, setGuestUsage] = useState({
    hasUsedFreeGeneration: false,
    sessionId: null,
    generationCount: 0,
    timestamp: null
  });
  
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize guest usage from localStorage
  useEffect(() => {
    const initializeGuestUsage = () => {
      try {
        const stored = localStorage.getItem(GUEST_STORAGE_KEY);
        const sessionStored = sessionStorage.getItem(GUEST_SESSION_KEY);
        
        if (stored) {
          const parsed = JSON.parse(stored);
          // Check if it's been more than 24 hours (optional cooldown)
          const isExpired = parsed.timestamp && 
            Date.now() - parsed.timestamp > 24 * 60 * 60 * 1000;
          
          if (!isExpired) {
            setGuestUsage(parsed);
          } else {
            // Reset expired guest usage
            localStorage.removeItem(GUEST_STORAGE_KEY);
          }
        }
        
        // Generate session ID if not exists
        if (!sessionStored) {
          const sessionId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          sessionStorage.setItem(GUEST_SESSION_KEY, sessionId);
          setGuestUsage(prev => ({ ...prev, sessionId }));
        } else {
          setGuestUsage(prev => ({ ...prev, sessionId: sessionStored }));
        }
        
      } catch (error) {
        console.error('Error initializing guest usage:', error);
      } finally {
        setIsLoaded(true);
      }
    };

    initializeGuestUsage();
  }, []);

  // Save to localStorage whenever guestUsage changes
  useEffect(() => {
    if (isLoaded && guestUsage.generationCount > 0) {
      try {
        localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify({
          ...guestUsage,
          timestamp: Date.now()
        }));
      } catch (error) {
        console.error('Error saving guest usage:', error);
      }
    }
  }, [guestUsage, isLoaded]);

  const canGenerateAsGuest = useCallback(() => {
    return !guestUsage.hasUsedFreeGeneration && guestUsage.generationCount === 0;
  }, [guestUsage]);

  const markFreeGenerationUsed = useCallback(() => {
    setGuestUsage(prev => ({
      ...prev,
      hasUsedFreeGeneration: true,
      generationCount: 1,
      timestamp: Date.now()
    }));
  }, []);

  const resetGuestUsage = useCallback(() => {
    try {
      localStorage.removeItem(GUEST_STORAGE_KEY);
      sessionStorage.removeItem(GUEST_SESSION_KEY);
      setGuestUsage({
        hasUsedFreeGeneration: false,
        sessionId: null,
        generationCount: 0,
        timestamp: null
      });
    } catch (error) {
      console.error('Error resetting guest usage:', error);
    }
  }, []);

  const getRemainingFreeGenerations = useCallback(() => {
    return canGenerateAsGuest() ? 1 : 0;
  }, [canGenerateAsGuest]);

  return {
    guestUsage,
    isLoaded,
    canGenerateAsGuest,
    markFreeGenerationUsed,
    resetGuestUsage,
    getRemainingFreeGenerations
  };
}