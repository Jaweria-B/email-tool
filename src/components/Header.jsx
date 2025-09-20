"use client"
import React, { useState } from 'react';
import { User, Building, LogOut, UserPlus, LogIn, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';

const Header = ({ user, onLogout, isLoadingUser }) => {
  const [showProfile, setShowProfile] = useState(false);
  const router = useRouter();

  return (
    <div className="relative text-center mb-12">
        <div className="fixed top-6 right-6 z-50">
        {!isLoadingUser && user ? (
            <div className="relative">
            <button
                onClick={() => setShowProfile(!showProfile)}
                className="bg-white/20 backdrop-blur-lg text-white px-4 py-2 rounded-full border border-white/30 hover:bg-white/30 transition-all duration-300 flex items-center gap-2"
            >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">{user.name}</span>
            </button>
            
            {showProfile && (
                <div className="absolute right-0 mt-2 w-64 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-4 shadow-2xl">
                <div className="text-white space-y-3">
                    <div className="border-b border-white/20 pb-3">
                    <p className="font-semibold">{user.name}</p>
                    <p className="text-sm text-purple-200">{user.email}</p>
                    {user.company && <p className="text-xs text-purple-300">{user.company}</p>}
                    {user.job_title && <p className="text-xs text-purple-300">{user.job_title}</p>}
                    </div>
                    <button
                    onClick={() => router.push('/dashboard')}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2"
                    >
                    <Building className="h-4 w-4" />
                    Dashboard
                    </button>
                    <button
                    onClick={onLogout}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2 text-red-200"
                    >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                    </button>
                </div>
                </div>
            )}
            </div>
        ) : !isLoadingUser ? (
            <div className="flex flex-col sm:flex-row gap-3">
            <button
                onClick={() => router.push('/login')}
                className="bg-white/20 backdrop-blur-lg text-white px-4 py-2 rounded-full border border-white/30 hover:bg-white/30 transition-all duration-300 flex items-center gap-2 justify-center"
            >
                <LogIn className="h-4 w-4" />
                Sign In
            </button>
            <button
                onClick={() => router.push('/register')}
                className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white px-4 py-2 rounded-full transition-all duration-300 flex items-center gap-2 justify-center"
            >
                <UserPlus className="h-4 w-4" />
                Register
            </button>
            </div>
        ) : null}
        </div>

        <div className="flex items-center justify-center mb-6 cursor-pointer" onClick={() => router.push('/')}>
            <div className="bg-white/20 backdrop-blur-lg rounded-full p-4 border border-white/30">
            <Mail className="h-12 w-12 text-white" />
            </div>
        </div>
        <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
            Email<span className="bg-gradient-to-r from-pink-300 to-purple-300 bg-clip-text text-transparent">Craft</span>
        </h1>
        <p className="text-purple-100 text-xl max-w-2xl mx-auto leading-relaxed mb-6">
            Transform your thoughts into perfectly crafted emails with multiple AI providers
        </p>
        
    </div> 
  );
};

export default Header;