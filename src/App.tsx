import React, { useState, useEffect } from 'react';
import { Download, X, User, Mic, Apple, Laptop, Circle } from 'lucide-react';
import AuthModal from './components/AuthModal';
import UserMenu from './components/UserMenu';
import UserProfile from './components/UserProfile';
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
  const [currentPage, setCurrentPage] = useState<'main' | 'profile'>('main');
  const [user, setUser] = useState<User | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);

  const fetchUserProfile = async () => {
    try {
      const response = await apiFetch('/api/profile');
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
    const token = localStorage.getItem('accessToken');
    if (token) {
      setIsAuthenticated(true);
      fetchUserProfile();
    }
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
      try {
        setDownloadProgress(0);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1200000);  // Increased to 20 min for prod stability

        const response = await apiFetch('/api/download/mac', {
          method: 'GET',
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const contentLength = response.headers.get('Content-Length');
          const total = contentLength ? parseInt(contentLength, 10) : 0;
          let loaded = 0;
          const chunks = [];
          if (!response.body) {
            throw new Error('Response body is null');
          }
          const reader = response.body.getReader();

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            chunks.push(value);
            loaded += value.length;
            if (total > 0) {
              setDownloadProgress(Math.min(Math.round((loaded / total) * 100), 100));
            }
          }

          const blob = new Blob(chunks);
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = 'Voco.dmg';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          setDownloadProgress(null);
        } else {
          setDownloadProgress(null);
          console.error('Download failed:', response.statusText);
          alert('Download failed: ' + (response.status === 403 ? 'Authentication error—please log in again.' : response.statusText));
        }
      } catch (error: any) {
        setDownloadProgress(null);
        console.error('Download error:', error);
        if (error.name === 'AbortError') {
          alert('Download timed out. Try a faster connection or contact support.');
        } else {
          alert('An error occurred during download.');
        }
      }
    } else {
      alert('Windows download is not yet available.');
    }
  };

  const handleAuthSuccess = (data: { user: any; accessToken: string; refreshToken: string }, mode: 'login' | 'signup') => {
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    // Optionally, you could store user info in state or local storage as well
    // For example: localStorage.setItem('user', JSON.stringify(data.user));
    setIsAuthenticated(true);
    setIsAuthModalOpen(false);
    fetchUserProfile();
    if (mode === 'signup') {
      setCurrentPage('profile');
    }
  };

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
        try {
            await apiFetch('/logout', {
                method: 'POST',
                body: JSON.stringify({ refreshToken }),
            });
        } catch (error) {
            console.error('Logout API call failed:', error);
        }
    }
    // Always clear local storage and update state
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setIsAuthenticated(false);
    setIsUserMenuOpen(false);
    setUser(null);
  };

  if (currentPage === 'profile') {
    return <UserProfile user={user} onBack={() => setCurrentPage('main')} onProfileUpdate={fetchUserProfile} />;
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
      {/* Header */}
      <header className="border-b" style={{ borderColor: 'var(--border)' }}>
        <nav className="max-w-[1152px] mx-auto px-8 py-6 flex items-center justify-between relative">
          {/* Left section */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <img 
              src={VocoAppIcon} 
              alt="Voco logo" 
              className="w-12 h-12 rounded-full object-cover"
            />
          </div>
          
          {/* Center section - absolutely centered */}
          <div className="absolute left-1/2 transform -translate-x-1/2 text-center pointer-events-none">
            <h1 className="text-2xl font-bold m-0" style={{ color: 'var(--primary)' }}>Voco</h1>
            <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>你的智能语言键盘</p>
          </div>
          
          {/* Right section */}
          <div className="flex justify-end flex-shrink-0">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="w-12 h-12 rounded-full border-none bg-transparent cursor-pointer transition-colors flex items-center justify-center"
                  style={{ backgroundColor: 'transparent' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--muted)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt="User" className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <User className="w-12 h-12" style={{ color: 'var(--foreground)' }} />
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
                    onLogout={handleLogout}
                  />
                )}
              </div>
            ) : (
              <div className="flex items-center gap-6">
                <button
                  onClick={() => openAuthModal('login')}
                  className="text-base hover:opacity-70 transition-opacity"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  登录
                </button>
                <button
                  onClick={() => openAuthModal('signup')}
                  className="px-6 py-2 rounded-lg text-base font-semibold transition-colors"
                  style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                >
                  注册
                </button>
              </div>
            )}
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="border-b py-16 px-4" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-[896px] mx-auto px-4 text-center">
          <div className="flex flex-col items-center gap-6 mb-4">
            <div className="w-12 h-12 rounded-full mb-4 flex items-center justify-center" style={{ backgroundColor: 'var(--muted)' }}>
              <Circle className="w-6 h-6" style={{ color: 'var(--primary)' }} />
            </div>
            <h2 className="text-3xl sm:text-[36px] font-bold leading-tight max-w-full" style={{ color: 'var(--foreground)' }}>
              将杂乱的口语表达转换成清晰易懂的文字
            </h2>
            <div className="flex gap-3 pt-4 justify-center flex-wrap">
              <span className="text-sm px-3 py-1.5 rounded-full inline-block" style={{ color: 'var(--muted-foreground)', backgroundColor: 'var(--muted)' }}>
                🎯 噪音字双语或上主注播，急表
              </span>
              <span className="text-sm px-3 py-1.5 rounded-full inline-block" style={{ color: 'var(--muted-foreground)', backgroundColor: 'var(--muted)' }}>
                ⭐ 噪音字双语或上主注播，急表
              </span>
            </div>
            <p className="text-xs pt-4 font-mono" style={{ color: 'var(--muted-foreground)' }}>
              &gt; animation: 文字从左向右流动播放，功能讲述在图上方，编让点击全点字
            </p>
          </div>
        </div>
      </section>

      {/* Features/Download Section */}
      <section className="border-b py-16 px-4" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-[896px] mx-auto px-4">
          <div className="rounded-[10px] p-12 text-center flex flex-col gap-8" style={{ backgroundColor: 'var(--card)' }}>
            <div className="flex items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center">
                <span className="text-white font-bold text-xl">Λ</span>
              </div>
              <h3 className="text-2xl font-bold" style={{ color: 'var(--primary)' }}>前往Mac Store下载</h3>
            </div>
            <p className="max-w-[448px] mx-auto" style={{ color: 'var(--muted-foreground)' }}>
              简洁的用户体验，让您快速开始使用 Voco
            </p>
            <button
              onClick={() => handleDownloadClick('mac')}
              className="px-6 py-3 rounded-lg font-semibold transition-colors mt-4"
              style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              下载 Mac 版
            </button>
          </div>
        </div>
      </section>

      {/* Compatibility/Apps Section */}
      <section className="border-b py-16 px-4" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-[896px] mx-auto px-4 text-center">
          <h2 className="text-xl font-semibold mb-8" style={{ color: 'var(--foreground)' }}>
            适用于你能想到的任何苹果桌面应用
          </h2>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-4 max-w-[448px] mx-auto">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="w-12 h-12 border-2 rounded-md flex items-center justify-center bg-transparent cursor-pointer transition-colors"
                style={{ borderColor: 'var(--foreground)' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--muted)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <span className="text-xl font-light" style={{ color: 'var(--foreground)' }}>×</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Personas Section */}
      <section className="border-b py-16 px-4" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-[1152px] mx-auto px-4">
          <div className="flex flex-col gap-12">
            {/* Persona 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="rounded-[10px] border p-8 min-h-[192px] flex flex-col justify-between" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                <div>
                  <h3 className="text-lg font-bold mb-3" style={{ color: 'var(--primary)' }}>开发人员</h3>
                  <p className="text-sm mb-2" style={{ color: 'var(--foreground)' }}>与AI流畅对话</p>
                  <p className="text-sm font-semibold" style={{ color: 'var(--primary)' }}>Stay in the Flow</p>
                </div>
              </div>
              <div className="rounded-[10px] border p-8 min-h-[192px] flex items-center justify-center" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                <p className="text-sm text-center" style={{ color: 'var(--muted-foreground)' }}>与Cursor：deepseek哨天</p>
              </div>
            </div>

            {/* Persona 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="rounded-[10px] border p-8 min-h-[192px] flex flex-col justify-between" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                <div>
                  <h3 className="text-lg font-bold mb-3" style={{ color: 'var(--primary)' }}>产品、运营、销售</h3>
                  <p className="text-sm mb-2" style={{ color: 'var(--foreground)' }}>回复信息、评论</p>
                  <p className="text-sm font-semibold" style={{ color: 'var(--primary)' }}>4x faster</p>
                </div>
              </div>
              <div className="rounded-[10px] border p-8 min-h-[192px] flex items-center justify-center" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                <p className="text-sm text-center" style={{ color: 'var(--muted-foreground)' }}>包括直接与Cursor等工具集成</p>
              </div>
            </div>

            {/* Persona 3 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="rounded-[10px] border p-8 min-h-[192px] flex flex-col justify-between" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                <div>
                  <h3 className="text-lg font-bold mb-3" style={{ color: 'var(--primary)' }}>创作者</h3>
                  <p className="text-sm mb-2" style={{ color: 'var(--foreground)' }}>快速记录灵感记忆想法</p>
                  <p className="text-sm font-semibold" style={{ color: 'var(--primary)' }}></p>
                </div>
              </div>
              <div className="rounded-[10px] border p-8 min-h-[192px] flex items-center justify-center" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                <p className="text-sm text-center" style={{ color: 'var(--muted-foreground)' }}>打空下有风向力的应用</p>
              </div>
            </div>

            {/* Persona 4 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="rounded-[10px] border p-8 min-h-[192px] flex flex-col justify-between" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                <div>
                  <h3 className="text-lg font-bold mb-3" style={{ color: 'var(--primary)' }}>分企职场人</h3>
                  <p className="text-sm mb-2" style={{ color: 'var(--foreground)' }}>中英文美系</p>
                  <p className="text-sm font-semibold" style={{ color: 'var(--primary)' }}>不再切换输入法</p>
                </div>
              </div>
              <div className="rounded-[10px] border p-8 min-h-[192px] flex items-center justify-center" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                <p className="text-sm text-center" style={{ color: 'var(--muted-foreground)' }}></p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-16 px-4" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)' }}>
        <div className="max-w-[1152px] mx-auto px-4">
          <h3 className="text-2xl font-bold mb-12" style={{ color: 'var(--primary)' }}>Footer</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="footer-column">
              <h4 className="font-semibold mb-4" style={{ color: 'var(--foreground)' }}>Product</h4>
              <ul className="list-none flex flex-col gap-2">
                <li><a href="#" className="footer-link text-sm no-underline">Features</a></li>
                <li><a href="#" className="footer-link text-sm no-underline">Pricing</a></li>
                <li><a href="#" className="footer-link text-sm no-underline">Security</a></li>
              </ul>
            </div>
            <div className="footer-column">
              <h4 className="font-semibold mb-4" style={{ color: 'var(--foreground)' }}>Company</h4>
              <ul className="list-none flex flex-col gap-2">
                <li><a href="#" className="footer-link text-sm no-underline">About</a></li>
                <li><a href="#" className="footer-link text-sm no-underline">Blog</a></li>
                <li><a href="#" className="footer-link text-sm no-underline">Careers</a></li>
              </ul>
            </div>
            <div className="footer-column">
              <h4 className="font-semibold mb-4" style={{ color: 'var(--foreground)' }}>Resources</h4>
              <ul className="list-none flex flex-col gap-2">
                <li><a href="#" className="footer-link text-sm no-underline">Documentation</a></li>
                <li><a href="#" className="footer-link text-sm no-underline">Support</a></li>
                <li><a href="#" className="footer-link text-sm no-underline">Community</a></li>
              </ul>
            </div>
            <div className="footer-column">
              <h4 className="font-semibold mb-4" style={{ color: 'var(--foreground)' }}>Legal</h4>
              <ul className="list-none flex flex-col gap-2">
                <li><a href="#" className="footer-link text-sm no-underline">Privacy</a></li>
                <li><a href="#" className="footer-link text-sm no-underline">Terms</a></li>
                <li><a href="#" className="footer-link text-sm no-underline">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-12 pt-8 text-center text-sm" style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}>
            <p>&copy; 2025 Voco. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {downloadProgress !== null && (
        <div className="fixed bottom-10 right-10 bg-white p-4 rounded-lg shadow-lg z-50">
          <p className="mb-2 font-medium">Downloading: {Math.round(downloadProgress)}%</p>
          <div className="w-64 h-2 bg-gray-200 rounded">
            <div className="h-full bg-blue-600 rounded" style={{ width: `${downloadProgress}%` }} />
          </div>
        </div>
      )}

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