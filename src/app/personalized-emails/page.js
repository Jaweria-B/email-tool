"use client"
import React from 'react';
import PageWrapper from '@/components/PageWrapper';
import { useAuthContext } from '@/providers/AuthProvider';
import BulkEmailAgent from '@/components/personalized-email-sender/PersonalizedEmailsAgent';

const PersonalizedEmails = () => {
  const { user, isLoadingUser, handleLogout } = useAuthContext();

  return (
    <PageWrapper showFooter={true} className="container mx-auto px-4 py-8">
      <BulkEmailAgent user={user} isLoadingUser={isLoadingUser} onLogout={handleLogout} />
    </PageWrapper>
  );
};

export default PersonalizedEmails;