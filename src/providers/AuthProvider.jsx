"use client"
import React, { createContext, useContext } from 'react';
import useAuth from '@/hooks/useAuth';

const AuthContext = createContext();

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
};

export default function AuthProvider({ children }) {
  const auth = useAuth();
  
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}