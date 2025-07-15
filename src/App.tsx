import React, { useState, useEffect } from 'react';
import { Download, X, User, Mic, Apple, Laptop } from 'lucide-react';
import AuthModal from './components/AuthModal';
import UserMenu from './components/UserMenu';
import UserProfile from './components/UserProfile';
import Subscription from './components/Subscription';
import TryItNow from './components/TryItNow';
import apiFetch from './api';
import VocoAppIcon from '../resource/Voco-app-icon.png';

interface User {
  username: string;
  avatarUrl?: string;
  avatarKey?: string;
}

function App() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isTryItOpen, setIsTryItOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<'main' | 'profile' | 'subscription'>('main');
  const [user, setUser] = useState<User | null>(null);

  const fetchUserProfile = async () => {
    try {
      const response = await apiFetch('/profile');
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        // Handle cases where token is invalid but not yet expired
        setUser(null);
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      setUser(null);
    }
  };

  useEffect(() => {
    // Check if user is authenticated by trying to fetch profile
    // This is more reliable than checking for a token that might be expired
    const checkAuthStatus = async () => {
      try {
        const response = await apiFetch('/profile');
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        setIsAuthenticated(false);
        setUser(null);
      }
    };
    checkAuthStatus();
  }, []);

  const openAuthModal = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleDownloadClick = async (os: 'mac' | 'windows') => {
    if (!isAuthenticated) {
      openAuthModal('signup');
      return;
    }

    if (os === 'mac') {
      // The backend now uses cookies for authentication, so we can open the URL directly.
      // The browser will automatically send the auth cookie and handle the download.
      window.open('/api/download/mac', '_blank');
    } else {
      // For Windows, you can show an alert or do nothing
      alert('Windows download is not yet available.');
    }
  };

  const handleAuthSuccess = (data: { user: any }) => {
    // No need to handle tokens, cookies do the work.
    // The user data can be used to update state if needed.
    setIsAuthenticated(true);
    setIsAuthModalOpen(false);
    fetchUserProfile();
  };

  const handleLogout = async () => {
    try {
        await apiFetch('/logout', {
            method: 'POST',
        });
    } catch (error) {
        console.error('Logout API call failed:', error);
    }
    // Always clear local state and reload to reset everything
    setIsAuthenticated(false);
    setIsUserMenuOpen(false);
    setUser(null);
    window.location.reload();
  };

  if (currentPage === 'profile') {
    return <UserProfile user={user} onBack={() => setCurrentPage('main')} onProfileUpdate={fetchUserProfile} />;
  }

  if (currentPage === 'subscription') {
    return <Subscription onBack={() => setCurrentPage('main')} />;
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="px-10 py-6 flex justify-between items-center">
        <img src={VocoAppIcon} alt="Voco logo" className="h-16 w-16 rounded-xl" />
        {isAuthenticated ? (
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="User" className="w-full h-full rounded-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-gray-600" />
              )}
            </button>
            {isUserMenuOpen && (
              <UserMenu
                avatarUrl={user?.avatarUrl} 
                onClose={() => setIsUserMenuOpen(false)} 
                onProfileClick={() => {
                  setCurrentPage('profile');
                  setIsUserMenuOpen(false);
                }}
                onSubscriptionClick={() => {
                  setCurrentPage('subscription');
                  setIsUserMenuOpen(false);
                }}
                onLogout={handleLogout}
              />
            )}
          </div>
        ) : (
          <div className="flex items-center gap-6">
            <button
              onClick={() => openAuthModal('login')}
              className="text-xl text-gray-600 hover:text-blue-600"
            >
              登录
            </button>
            <button
              onClick={() => openAuthModal('signup')}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl text-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              注册
            </button>
          </div>
        )}
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center min-h-[70vh] w-full">
        <h1 className="text-7xl font-extrabold text-blue-600 mb-10 leading-tight">Voco 你的语音键盘</h1>
        <div className="mb-20">
          <p className="text-3xl text-gray-800 font-normal mb-1">
            一句话说完，自动写进任何输入框
          </p>
          <p className="text-3xl text-gray-800 font-normal">
            AI润色，让表达清晰自然
          </p>
        </div>
        <div className="flex gap-12 justify-center mb-10">
          <button
            onClick={() => handleDownloadClick('mac')}
            className="px-12 py-6 border-2 border-blue-600 text-white bg-blue-600 rounded-lg text-2xl font-bold hover:bg-blue-700 transition-colors flex items-center gap-4 min-w-[280px]"
          >
            <Apple className="w-8 h-8" /> 立即下载 Mac 版
          </button>
          <button
            onClick={() => handleDownloadClick('windows')}
            className="px-12 py-6 border-2 border-blue-600 text-blue-700 bg-white rounded-lg text-2xl font-bold hover:bg-blue-50 transition-colors flex items-center gap-4 min-w-[280px]"
          >
            <Laptop className="w-8 h-8" /> 下载 Windows 版
          </button>
        </div>
        <div className="text-xl text-gray-500 font-medium">
          支持微信、钉钉、飞书、邮箱等所有输入框
        </div>
      </main>

      {isAuthModalOpen && (
        <AuthModal
          initialMode={authMode}
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={handleAuthSuccess}
        />
      )}

      {isTryItOpen && <TryItNow onClose={() => setIsTryItOpen(false)} />}
    </div>
  );
}

export default App;