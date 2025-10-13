"use client"
import React, { useState, useEffect, useCallback } from 'react';
import { Mail, User, Calendar, TrendingUp, Activity, Send, Eye, LogOut, MessageSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/providers/AuthProvider';

const Dashboard = () => {
  const { user, isLoadingUser, handleLogout: contextLogout } = useAuthContext();
  const [emailHistory, setEmailHistory] = useState([]);
  const [stats, setStats] = useState({
    totalEmails: 0,
    emailsThisMonth: 0,
    favoriteProvider: '',
    mostUsedTone: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const calculateStats = useCallback((emails) => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const emailsThisMonth = emails.filter(email => {
      const emailDate = new Date(email.created_at);
      return emailDate.getMonth() === currentMonth && emailDate.getFullYear() === currentYear;
    }).length;

    // Find most used provider
    const providerCount = {};
    const toneCount = {};
    
    emails.forEach(email => {
      providerCount[email.ai_provider] = (providerCount[email.ai_provider] || 0) + 1;
      toneCount[email.tone] = (toneCount[email.tone] || 0) + 1;
    });

    const favoriteProvider = Object.keys(providerCount).reduce((a, b) => 
      providerCount[a] > providerCount[b] ? a : b, ''
    );

    const mostUsedTone = Object.keys(toneCount).reduce((a, b) => 
      toneCount[a] > toneCount[b] ? a : b, ''
    );

    setStats({
      totalEmails: emails.length,
      emailsThisMonth,
      favoriteProvider,
      mostUsedTone
    });
  }, []);

  const loadEmailHistory = useCallback(async () => {
    try {
      const response = await fetch('/api/email-history');
      if (response.ok) {
        const data = await response.json();
        setEmailHistory(data.emails);
        calculateStats(data.emails);
      }
    } catch (error) {
      console.error('Failed to load email history:', error);
    } finally {
      setIsLoading(false);
    }
  }, [calculateStats]);

  useEffect(() => {
    if (!isLoadingUser && !user) {
      router.push('/login');
    }
  }, [user, isLoadingUser, router]);

  useEffect(() => {
    if (user) {
      loadEmailHistory();
    }
  }, [user, loadEmailHistory]);

  const handleLogout = async () => {
    await contextLogout();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur-lg rounded-full p-3 border border-white/30">
              <User className="h-8 w-8 text-white" />
            </div>
            <div className="text-white">
              <h1 className="text-3xl font-bold">Welcome back, {user?.name}!</h1>
              <p className="text-purple-200">{user?.email}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/')}
              className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white px-6 py-3 rounded-xl transition-all duration-300 flex items-center gap-2 font-medium"
            >
              <MessageSquare className="h-5 w-5" />
              Create Email
            </button>
            <button
              onClick={handleLogout}
              className="bg-white/20 backdrop-blur-lg text-white px-4 py-3 rounded-xl border border-white/30 hover:bg-white/30 transition-all duration-300 flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
            <div className="flex items-center gap-3 mb-2">
              <Mail className="h-8 w-8 text-purple-300" />
              <div>
                <p className="text-purple-200 text-sm">Total Emails</p>
                <p className="text-white text-2xl font-bold">{stats.totalEmails}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="h-8 w-8 text-green-300" />
              <div>
                <p className="text-purple-200 text-sm">This Month</p>
                <p className="text-white text-2xl font-bold">{stats.emailsThisMonth}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="h-8 w-8 text-blue-300" />
              <div>
                <p className="text-purple-200 text-sm">Provider</p>
                <p className="text-white text-lg font-bold capitalize">{stats.favoriteProvider || 'None'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
            <div className="flex items-center gap-3 mb-2">
              <Activity className="h-8 w-8 text-yellow-300" />
              <div>
                <p className="text-purple-200 text-sm">Most Used Tone</p>
                <p className="text-white text-lg font-bold capitalize">{stats.mostUsedTone || 'None'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Email History */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <Mail className="h-6 w-6" />
            Recent Emails
          </h2>

          {emailHistory.length > 0 ? (
            <div className="space-y-4 max-h-250 overflow-y-auto">
              {emailHistory.map((email) => (
                <div key={email.id} className="bg-white/10 rounded-lg p-4 border border-white/20">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="text-white font-medium text-lg mb-1">
                        {email.email_subject || 'Untitled Email'}
                      </h3>
                      <div className="flex flex-wrap gap-2 mb-2">
                        <span className="bg-purple-500/30 text-purple-200 px-2 py-1 rounded-full text-xs">
                          {email.tone}
                        </span>
                        <span className="bg-blue-500/30 text-blue-200 px-2 py-1 rounded-full text-xs">
                          {email.ai_provider}
                        </span>
                        <span className="bg-green-500/30 text-green-200 px-2 py-1 rounded-full text-xs">
                          {email.status}
                        </span>
                      </div>
                      {email.recipient && (
                        <p className="text-purple-200 text-sm mb-2">
                          To: {email.recipient}
                        </p>
                      )}
                    </div>
                    <div className="text-purple-300 text-sm whitespace-nowrap ml-4">
                      {formatDate(email.created_at)}
                    </div>
                  </div>
                  
                  {email.email_body && (
                    <div className="bg-white/10 rounded-lg p-3 mt-3">
                      <p className="text-purple-100 text-sm leading-relaxed">
                        {email.email_body.length > 200 
                          ? email.email_body.substring(0, 200) + '...' 
                          : email.email_body
                        }
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Mail className="h-16 w-16 text-purple-300 mx-auto mb-4 opacity-50" />
              <p className="text-purple-200 text-lg">No emails generated yet</p>
              <p className="text-purple-300 text-sm">Start creating your first email!</p>
              <button
                onClick={() => router.push('/')}
                className="mt-4 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white px-6 py-2 rounded-xl transition-all duration-300"
              >
                Create First Email
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;