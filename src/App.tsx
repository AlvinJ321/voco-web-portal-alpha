import { useState, useEffect, useRef } from 'react';
import { X, User } from 'lucide-react';
import AuthModal from './components/AuthModal';
import UserMenu from './components/UserMenu';
import UserProfile from './components/UserProfile';
import TryItNow from './components/TryItNow';
import AppIconsSection from './components/AppIconsSection';
import UseCaseSection from './components/UseCaseSection';
import TermsOfService from './components/TermsOfService';
import PrivacyPolicy from './components/PrivacyPolicy';
import apiFetch from './api';
import VocoAppIcon from '../resource/Voco-app-icon.png';
import AppStoreIcon from '../resource/app-store.png';

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
  const [stage, setStage] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [strikethrough, setStrikethrough] = useState(false);
  const [showLabel, setShowLabel] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [erasedChar, setErasedChar] = useState(false);
  const [eraseLine, setEraseLine] = useState(false);
  const [currentFeatureIndex, setCurrentFeatureIndex] = useState(0);
  const prevFeatureIndexRef = useRef(0);
  const [activeLegalDoc, setActiveLegalDoc] = useState<'terms' | 'privacy' | null>(null);
  
  const features = [
    {
      label: '删除冗余词',
      beforeText: '采用最先进的语音识别模型，呃在各种口音、噪音环境下，精准识别。',
      afterText: '采用最先进的语音识别模型，在各种口音、噪音环境下，精准识别。',
      textToStrike: '呃'
    },
    {
      label: '去除重复',
      beforeText: 'AI润色，把杂乱呃杂乱的口语变成，清晰流畅的文字',
      afterText: 'AI润色，把杂乱的口语变成清晰流畅的文字',
      textToStrike: '呃杂乱'
    },
    {
      label: '修正语法',
      beforeText: '呃，刚才那个远程修电脑的人让我把重启之后，把IP发给你。',
      afterText: '刚才那个远程修电脑的人让我重启之后，把IP发给你。',
      textToStrike: ['呃，', '把']
    },
    {
      label: '中英文夹杂',
      beforeText: '今年Christmas有计划出去玩吗？',
      afterText: '今年圣诞节有计划出去玩吗？',
      textToStrike: 'Christmas'
    }
  ];
  
  const currentFeature = features[currentFeatureIndex];
  
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

  // Reset animation when feature changes
  useEffect(() => {
    // Skip on initial mount (when both are 0)
    if (prevFeatureIndexRef.current === currentFeatureIndex && prevFeatureIndexRef.current === 0) {
      return;
    }
    
    // Only reset if feature index actually changed
    if (prevFeatureIndexRef.current !== currentFeatureIndex) {
      prevFeatureIndexRef.current = currentFeatureIndex;
      setDisplayedText('');
      setStrikethrough(false);
      setShowLabel(false);
      setFadeOut(false);
      setErasedChar(false);
      setEraseLine(false);
      setStage(0);
    }
  }, [currentFeatureIndex]);

  // Hero section animation - following reference animation exactly
  useEffect(() => {
    const currentFeature = features[currentFeatureIndex];
    const fullText = currentFeature.beforeText;
    const refinedText = currentFeature.afterText;

    if (stage === 0) {
      let charIndex = 0;
      let timeout1: ReturnType<typeof setTimeout> | null = null;
      let timeout2: ReturnType<typeof setTimeout> | null = null;
      
      const interval = setInterval(() => {
        if (charIndex <= fullText.length) {
          setDisplayedText(fullText.slice(0, charIndex));
          charIndex++;
        } else {
          clearInterval(interval);
          // For 4th feature (中英文夹杂), skip strikethrough and go directly to label
          if (currentFeatureIndex === 3) {
            timeout1 = setTimeout(() => {
              setShowLabel(true);
              timeout2 = setTimeout(() => {
                setShowLabel(false);
                setStage(2);
              }, 4000); // Show label for 4 seconds
            }, 500);
          } else {
            timeout1 = setTimeout(() => setStage(1), 500);
          }
        }
      }, 80); // 80ms per character for typewriter speed - matches reference

      return () => {
        clearInterval(interval);
        if (timeout1) clearTimeout(timeout1);
        if (timeout2) clearTimeout(timeout2);
      };
    }

    if (stage === 1) {
      // All timings match reference exactly
      const timeout1 = setTimeout(() => {
        setStrikethrough(true);
      }, 300); // 300ms - strikethrough appears

      const timeout2 = setTimeout(() => {
        setErasedChar(true);
        setEraseLine(true);
      }, 800); // 800ms - char fades and line erases

      const timeout3 = setTimeout(() => {
        setDisplayedText(refinedText);
      }, 1300); // 1300ms - switch to refined text

      const timeout4 = setTimeout(() => {
        setShowLabel(true);
      }, 1800); // 1800ms - show label

      const timeout5 = setTimeout(() => {
        setShowLabel(false);
        setStage(2);
      }, 4000); // 4000ms - hide label and move to stage 2

      return () => {
        clearTimeout(timeout1);
        clearTimeout(timeout2);
        clearTimeout(timeout3);
        clearTimeout(timeout4);
        clearTimeout(timeout5);
      };
    }

    if (stage === 2) {
      // Stage 2: Fade out and reset - matches reference exactly
      const timeout1 = setTimeout(() => {
        setFadeOut(true);
      }, 500); // 500ms - fade out

      const timeout2 = setTimeout(() => {
        // Move to next feature - the reset effect will handle resetting stage
        setCurrentFeatureIndex((prev) => (prev + 1) % features.length);
      }, 1500); // 1500ms - reset

      return () => {
        clearTimeout(timeout1);
        clearTimeout(timeout2);
      };
    }
  }, [stage, currentFeatureIndex]);

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
      <section className="border-b py-12 px-4" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-[896px] mx-auto px-4">
          <div className="flex flex-col items-center gap-4">
            {/* Main Title */}
            <h2 className="text-3xl sm:text-[36px] font-bold leading-tight text-center mb-4" style={{ color: 'var(--foreground)' }}>
              将零散的口语表达转换成清晰易懂的文字
            </h2>

            {/* Mac Download Section */}
            <div className="w-full flex items-center justify-center mb-6">
              <div
                className="inline-flex items-center gap-5 px-10 py-5 bg-white text-blue-600 rounded-2xl border-2 border-gray-900 shadow-lg hover:shadow-xl hover:border-blue-600 hover:-translate-y-0.5 transition-all duration-200 group cursor-pointer"
                onClick={() => handleDownloadClick('mac')}
              >
                {/* App Store Icon */}
                <img src={AppStoreIcon} alt="App Store" className="w-14 h-14 object-contain" />

                {/* Button Text */}
                <span className="text-lg font-semibold">前往Mac Store下载</span>
              </div>
            </div>
            
            {/* Refinement Visualization */}
            <div className="w-full flex flex-col items-center gap-2 py-2 relative">
              {/* Processing text at top - floating label */}
              <div className="relative h-20 mb-1 flex items-center justify-center">
                {showLabel && (
                  <div
                    className="absolute"
                    style={{
                      animation: 'fadeInZoomIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
                      opacity: 0,
                      transform: 'scale(0.8)'
                    }}
                  >
                    <div 
                      className="px-5 py-2.5 rounded-lg font-bold text-base shadow-xl border whitespace-nowrap flex items-center gap-2"
                      style={{
                        background: 'linear-gradient(to right, #10b981, #059669)',
                        color: 'white',
                        borderColor: '#6ee7b7',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      <span>{currentFeature.label}</span>
                      <span>⭐</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Main text area */}
              <div className="w-full flex items-center justify-center relative overflow-hidden" style={{ minHeight: '48px' }}>
                {/* Text with typewriter effect - centered container, left-aligned text */}
                <div 
                  className="text-2xl font-medium whitespace-nowrap" 
                  style={{ 
                    opacity: fadeOut ? 0 : 1,
                    transform: `translateX(-50%) ${fadeOut ? 'scale(0.95)' : 'scale(1)'}`,
                    transition: 'opacity 1s ease-out, transform 1s ease-out',
                    position: 'absolute',
                    left: '50%',
                    textAlign: 'left'
                  }}
                >
                  <span style={{ color: '#475569' }}>
                    {displayedText.split('').map((char, index) => {
                      const textToStrike = currentFeature.textToStrike;
                      const textsToStrike = Array.isArray(textToStrike) ? textToStrike : [textToStrike];
                      
                      // Find which text to strike this character belongs to
                      let strikeInfo: { startIndex: number; length: number } | null = null;
                      for (const text of textsToStrike) {
                        let strikeStartIndex = displayedText.indexOf(text);
                        // For "把" in the 3rd feature, only match the first occurrence (before "重启")
                        if (currentFeatureIndex === 2 && text === '把') {
                          const beforeRestartIndex = displayedText.indexOf('重启');
                          if (beforeRestartIndex !== -1) {
                            // Only match "把" if it appears before "重启"
                            const tempIndex = displayedText.substring(0, beforeRestartIndex).indexOf(text);
                            if (tempIndex !== -1) {
                              strikeStartIndex = tempIndex;
                            } else {
                              strikeStartIndex = -1; // Skip this "把" if it's after "重启"
                            }
                          }
                        }
                        if (strikeStartIndex !== -1 && 
                            index >= strikeStartIndex && 
                            index < strikeStartIndex + text.length) {
                          strikeInfo = { startIndex: strikeStartIndex, length: text.length };
                          break;
                        }
                      }
                      
                      const isInStrikeRange = strikeInfo !== null;
                      const isFirstCharOfStrike = strikeInfo !== null && index === strikeInfo.startIndex;
                      const shouldStrike = strikethrough && isInStrikeRange;

                      if (shouldStrike && strikeInfo) {
                        return (
                          <span key={index} style={{ position: 'relative', display: 'inline-block' }}>
                            <span
                              style={{
                                display: 'inline-block',
                                transition: 'opacity 0.5s ease-out, transform 0.5s ease-out',
                                opacity: erasedChar ? 0 : 0.3,
                                transform: erasedChar ? 'scale(0.75)' : 'scale(1)'
                              }}
                            >
                              {char}
                            </span>
                            {isFirstCharOfStrike && (
                              <span
                                style={{
                                  position: 'absolute',
                                  left: 0,
                                  top: '50%',
                                  width: `${strikeInfo.length * 1.2}ch`,
                                  height: '2px',
                                  background: 'linear-gradient(to right, #ef4444, #f87171)',
                                  transform: `scaleX(${eraseLine ? 0 : 1})`,
                                  opacity: eraseLine ? 0 : (shouldStrike ? 1 : 0),
                                  transition: 'transform 0.5s ease-out, opacity 0.5s ease-out',
                                  transformOrigin: 'left center'
                                }}
                              />
                            )}
                          </span>
                        );
                      }
                      return <span key={index}>{char}</span>;
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* App Icons Section */}
      <AppIconsSection />

      {/* Use Case Section */}
      <UseCaseSection />

      {/* Call to Action Section */}
      <section className="border-b py-16 px-4" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-[896px] mx-auto px-4">
          <div className="flex flex-col items-center gap-6">
            {/* Text Content */}
            <div className="flex flex-col gap-4 text-center">
              <p className="text-xl font-medium" style={{ color: 'var(--foreground)' }}>
                嫌打字效率低，打断思路?
              </p>
              <p className="text-lg" style={{ color: 'var(--foreground)' }}>
                Voco 的"随处输入"技术，让你能在文档、邮件、聊天窗口里直接语音输入并转写成文字。
              </p>
              <p className="text-lg" style={{ color: 'var(--foreground)' }}>
                精准识别普通话，可中英文夹杂，AI润色让表达清晰自然。
              </p>
            </div>

            {/* Call to Action Text - Highlighted */}
            <div className="mt-2">
              <p 
                className="text-2xl font-bold text-center"
                style={{ color: 'var(--primary)' }}
              >
                免费下载 Voco，开启高效语音输入新体验
              </p>
            </div>

            {/* Download Button - Same style as hero section */}
            <div className="w-full flex items-center justify-center">
              <div
                className="inline-flex items-center gap-5 px-10 py-5 bg-white text-blue-600 rounded-2xl border-2 border-gray-900 shadow-lg hover:shadow-xl hover:border-blue-600 hover:-translate-y-0.5 transition-all duration-200 group cursor-pointer"
                onClick={() => handleDownloadClick('mac')}
              >
                {/* App Store Icon */}
                <img src={AppStoreIcon} alt="App Store" className="w-14 h-14 object-contain" />

                {/* Button Text */}
                <span className="text-lg font-semibold">前往Mac Store下载</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)' }}>
        <div className="max-w-[1152px] mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs" style={{ color: 'var(--muted-foreground)' }}>
            <button
              onClick={() => setActiveLegalDoc('privacy')}
              className="hover:opacity-70 transition-opacity bg-transparent border-none cursor-pointer p-0"
              style={{ color: 'var(--muted-foreground)', fontSize: 'inherit', fontFamily: 'inherit' }}
            >
              隐私政策
            </button>
            <span>|</span>
            <button
              onClick={() => setActiveLegalDoc('terms')}
              className="hover:opacity-70 transition-opacity bg-transparent border-none cursor-pointer p-0"
              style={{ color: 'var(--muted-foreground)', fontSize: 'inherit', fontFamily: 'inherit' }}
            >
              用户协议
            </button>
            <span>|</span>
            <a 
              href="mailto:support@vocoapp.co" 
              className="hover:opacity-70 transition-opacity no-underline"
              style={{ color: 'var(--muted-foreground)' }}
            >
              联系我们: support@vocoapp.co
            </a>
            <span>|</span>
            <span>粤ICP备2025490615号</span>
            <span>|</span>
            <span>[placeholder公安备案号]</span>
            <span>|</span>
            <span>© 2025 广州灵猴工坊创意科技有限公司 版权所有</span>
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
          onOpenTerms={() => setActiveLegalDoc('terms')}
          onOpenPrivacy={() => setActiveLegalDoc('privacy')}
        />
      )}

      {isTryItOpen && <TryItNow onClose={() => setIsTryItOpen(false)} />}

      {activeLegalDoc && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[85vh] shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                {activeLegalDoc === 'terms' ? '用户协议' : '隐私政策'}
              </h3>
              <button
                onClick={() => setActiveLegalDoc(null)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {activeLegalDoc === 'terms' ? (
                <TermsOfService isModal />
              ) : (
                <PrivacyPolicy isModal />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;