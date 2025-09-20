import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const router = useRouter();

  const loadUserData = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setIsLoadingUser(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  useEffect(() => {
    loadUserData();
  }, []);

  return {
    user,
    isLoadingUser,
    handleLogout,
    refreshUser: loadUserData
  };
};

export default useAuth;